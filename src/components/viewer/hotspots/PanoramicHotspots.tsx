/**
 * Panoramic hotspot renderer and interaction handler
 *
 * Renders interactive 3D hotspots within the panoramic viewer based on
 * hotspot data from the current photo. Handles click detection and
 * navigation triggering for immersive VR tour navigation.
 *
 * @fileoverview Component for rendering and managing 3D hotspots in panoramic viewer
 */

import React, { useEffect, useCallback, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Photo } from '../../../types/tour'
import {
  createHotspotGeometry,
  calculateHotspotScale,
  orientHotspotToCamera,
  getScreenPosition,
  getDialogPosition,
  type ScreenPosition,
  type DialogPosition
} from './HotspotUtils'
import { HotspotConfirmationDialog } from './HotspotConfirmationDialog'
import { getAreaForPhoto } from '../../../data/tourUtilities'

/**
 * Props for PanoramicHotspots component
 */
interface PanoramicHotspotsProps {
  currentPhoto: Photo | null
  sceneRef: React.RefObject<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    geometry: THREE.SphereGeometry
    sphere: THREE.Mesh
  }>
  fov: number
  onNavigate: (direction: string) => void
  onNavigateToPhoto?: (photoId: string) => void
}

/**
 * Component for rendering interactive 3D hotspots in panoramic viewer
 *
 * Takes hotspot data from the current photo and renders them as clickable
 * 3D objects positioned at specific x,y,z coordinates on the sphere surface.
 * Handles scaling and click interactions.
 *
 * @param currentPhoto - Current photo with hotspot data
 * @param sceneRef - Reference to Three.js scene objects
 * @param fov - Current field of view for scaling calculations
 * @param onNavigate - Callback to trigger navigation when hotspot is clicked
 */
/**
 * Pending navigation state for confirmation dialog
 *
 * @property destination - Destination photo ID if using direct navigation
 * @property direction - Navigation direction if using direction-based navigation
 * @property worldPosition - 3D world position of the clicked hotspot
 * @property screenPosition - Current 2D screen position of the hotspot
 * @property dialogPosition - Calculated position for the confirmation dialog
 * @property areaName - Resolved name of the destination area
 * @property floorLevel - Floor level of destination (for stairs/elevator)
 * @property navigationType - Navigation type: 'elevator', 'stairs', or 'door'
 */
interface PendingNavigation {
  destination?: string
  direction: string
  worldPosition: THREE.Vector3
  screenPosition: ScreenPosition
  dialogPosition: DialogPosition
  areaName: string
  floorLevel?: number
  navigationType: 'elevator' | 'stairs' | 'door'
}

export const PanoramicHotspots: React.FC<PanoramicHotspotsProps> = ({
  currentPhoto,
  sceneRef,
  fov,
  onNavigate,
  onNavigateToPhoto
}) => {
  const hotspotsGroupRef = useRef<THREE.Group | null>(null)
  const hotspots = currentPhoto?.hotspots || []
  const [pendingNavigation, setPendingNavigation] = useState<PendingNavigation | null>(null)

  /**
   * Create and position hotspot meshes in the scene
   */
  useEffect(() => {
    if (!sceneRef.current || !hotspots.length) {
      // Clean up existing hotspots if no hotspots in current photo
      if (hotspotsGroupRef.current) {
        const sphere = sceneRef.current.sphere
        sphere.remove(hotspotsGroupRef.current)
        hotspotsGroupRef.current = null
      }
      return
    }

    const { sphere } = sceneRef.current

    // Create or get hotspots group
    let hotspotsGroup = hotspotsGroupRef.current
    if (!hotspotsGroup) {
      hotspotsGroup = new THREE.Group()
      hotspotsGroup.name = 'hotspots-group'
      sphere.add(hotspotsGroup) // Attach to sphere for transformation inheritance
      hotspotsGroupRef.current = hotspotsGroup
    }

    // Clear existing hotspots
    hotspotsGroup.children.forEach(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (child.material instanceof THREE.Material) {
          child.material.dispose()
        }
      } else if (child instanceof THREE.Group) {
        // Dispose of group contents (sphere + icon meshes)
        child.children.forEach(groupChild => {
          if (groupChild instanceof THREE.Mesh) {
            groupChild.geometry.dispose()
            if (groupChild.material instanceof THREE.Material) {
              groupChild.material.dispose()
            }
          }
        })
      }
    })
    hotspotsGroup.clear()

    // Create new hotspots asynchronously
    hotspots.forEach(async (hotspot, index) => {
      const position = new THREE.Vector3(hotspot.position.x, hotspot.position.y, hotspot.position.z)

      try {
        const { geometry, material } = await createHotspotGeometry(hotspot.direction)

        let hotspotObject: THREE.Object3D

        if (geometry instanceof THREE.Group) {
          // For stairs hotspots that return a group (sphere + icon)
          hotspotObject = geometry
        } else {
          // For regular hotspots that return geometry
          hotspotObject = new THREE.Mesh(geometry, material)
        }

        hotspotObject.position.copy(position)

        let destination = hotspot.destination
        if (!destination && currentPhoto) {
          const directionConnection = currentPhoto.directions[hotspot.direction as keyof typeof currentPhoto.directions]
          if (typeof directionConnection === 'string') {
            destination = directionConnection
          } else if (Array.isArray(directionConnection)) {
            destination = directionConnection[0]
          }
        }

        hotspotObject.userData = {
          direction: hotspot.direction,
          destination: destination,
          index,
          originalPosition: position.clone()
        }
        hotspotObject.name = `hotspot-${index}`

        // Orient hotspot to face camera
        orientHotspotToCamera(hotspotObject)

        hotspotsGroup.add(hotspotObject)
      } catch (error) {
        console.error(`Failed to create hotspot ${index}:`, error)
      }
    })
  }, [hotspots, sceneRef])

  /**
   * Update hotspot scaling based on camera zoom level
   */
  const updateHotspotDisplay = useCallback(() => {
    if (!hotspotsGroupRef.current) return

    const scale = calculateHotspotScale(fov)

    hotspotsGroupRef.current.children.forEach((object, index) => {
      if (hotspots[index]) {
        // Hotspots are always visible
        object.visible = true

        // Update scale based on zoom level
        object.scale.setScalar(scale)
      }
    })
  }, [hotspots, fov])

  /**
   * Update display when camera or zoom changes
   */
  useEffect(() => {
    updateHotspotDisplay()
  }, [updateHotspotDisplay])

  /**
   * Handle mouse move events to change cursor on hotspot hover
   */
  const handleCanvasMouseMove = useCallback((event: MouseEvent) => {
    if (!sceneRef.current || !hotspotsGroupRef.current) return

    const { camera, renderer } = sceneRef.current
    const canvas = renderer.domElement

    // Get mouse coordinates
    const rect = canvas.getBoundingClientRect()
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    )

    // Perform raycasting
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera)

    // Check for intersections with visible hotspots
    const visibleHotspots = hotspotsGroupRef.current.children.filter(child => child.visible)
    const intersects = raycaster.intersectObjects(visibleHotspots, true)

    // Change cursor based on hover
    if (intersects.length > 0) {
      canvas.style.cursor = 'pointer'
    } else {
      canvas.style.cursor = 'grab'
    }
  }, [sceneRef])

  /**
   * Handle click events on the canvas to detect hotspot interactions
   */
  const handleCanvasClick = useCallback((event: MouseEvent | TouchEvent) => {
    if (!sceneRef.current || !hotspotsGroupRef.current) return

    const { camera, renderer } = sceneRef.current
    const canvas = renderer.domElement

    // Get click coordinates
    const rect = canvas.getBoundingClientRect()
    let clientX: number, clientY: number

    if ('touches' in event && event.type === 'touchend') {
      // For touch events, use changedTouches (touches that ended)
      if (event.changedTouches.length === 0) return
      clientX = event.changedTouches[0].clientX
      clientY = event.changedTouches[0].clientY
    } else if ('clientX' in event) {
      clientX = event.clientX
      clientY = event.clientY
    } else {
      return
    }

    // Convert to normalized device coordinates
    const mouse = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    )

    // Perform raycasting
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera)

    // Check for intersections with visible hotspots (including children of groups)
    const visibleHotspots = hotspotsGroupRef.current.children.filter(child => child.visible)
    const intersects = raycaster.intersectObjects(visibleHotspots, true) // recursive = true to check group children

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object

      // Find the parent hotspot object that contains the direction data
      let hotspotObject = clickedObject
      while (hotspotObject && !hotspotObject.userData.direction && hotspotObject.parent) {
        hotspotObject = hotspotObject.parent
      }

      if (hotspotObject && hotspotObject.userData.direction) {
        const worldPosition = hotspotObject.userData.originalPosition as THREE.Vector3

        if (!worldPosition || !sceneRef.current) return

        const { camera, renderer } = sceneRef.current

        const screenPos = getScreenPosition(worldPosition, camera, renderer)

        if (!screenPos.isVisible) return

        const dialogPos = getDialogPosition(screenPos)

        const destinationId = hotspotObject.userData.destination
        const direction = hotspotObject.userData.direction
        const area = destinationId ? getAreaForPhoto(destinationId) : null

        let navigationType: 'elevator' | 'stairs' | 'door' = 'door'
        if (direction === 'elevator') {
          navigationType = 'elevator'
        } else if (direction === 'up' || direction === 'down' || direction.startsWith('floor')) {
          navigationType = 'stairs'
        }

        let areaName = 'this location'
        let floorLevel: number | undefined

        if (area) {
          areaName = area.name
          if (navigationType === 'stairs' && area.floorLevel !== 0) {
            floorLevel = area.floorLevel
          }
        }

        setPendingNavigation({
          destination: destinationId,
          direction,
          worldPosition,
          screenPosition: screenPos,
          dialogPosition: dialogPos,
          areaName,
          floorLevel,
          navigationType
        })
      }
    }
  }, [sceneRef])

  /**
   * Set up canvas event listeners for click detection
   */
  useEffect(() => {
    if (!sceneRef.current) return

    const canvas = sceneRef.current.renderer.domElement

    // Add event listeners for both mouse and touch
    canvas.addEventListener('click', handleCanvasClick)
    canvas.addEventListener('touchend', handleCanvasClick)
    canvas.addEventListener('mousemove', handleCanvasMouseMove)

    return () => {
      canvas.removeEventListener('click', handleCanvasClick)
      canvas.removeEventListener('touchend', handleCanvasClick)
      canvas.removeEventListener('mousemove', handleCanvasMouseMove)
    }
  }, [handleCanvasClick, handleCanvasMouseMove, sceneRef])

  /**
   * Handle confirmation of navigation
   */
  const handleConfirmNavigation = useCallback(() => {
    if (!pendingNavigation) return

    if (pendingNavigation.destination && onNavigateToPhoto) {
      onNavigateToPhoto(pendingNavigation.destination)
    } else {
      onNavigate(pendingNavigation.direction)
    }

    setPendingNavigation(null)
  }, [pendingNavigation, onNavigate, onNavigateToPhoto])

  /**
   * Handle cancellation of navigation
   */
  const handleCancelNavigation = useCallback(() => {
    setPendingNavigation(null)
  }, [])

  /**
   * Update dialog position when camera moves
   */
  useEffect(() => {
    if (!pendingNavigation || !sceneRef.current) return

    const updateDialogPosition = () => {
      if (!sceneRef.current || !pendingNavigation) return

      const { camera, renderer } = sceneRef.current
      const screenPos = getScreenPosition(pendingNavigation.worldPosition, camera, renderer)

      if (!screenPos.isVisible) {
        setPendingNavigation(null)
        return
      }

      const dialogPos = getDialogPosition(screenPos)

      setPendingNavigation(prev => {
        if (!prev) return null
        return {
          ...prev,
          screenPosition: screenPos,
          dialogPosition: dialogPos
        }
      })
    }

    const intervalId = setInterval(updateDialogPosition, 100)

    return () => clearInterval(intervalId)
  }, [pendingNavigation, sceneRef])

  /**
   * Cleanup hotspots when component unmounts
   */
  useEffect(() => {
    return () => {
      if (hotspotsGroupRef.current && sceneRef.current) {
        // Clean up geometries and materials
        hotspotsGroupRef.current.children.forEach(child => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose()
            if (child.material instanceof THREE.Material) {
              child.material.dispose()
            }
          } else if (child instanceof THREE.Group) {
            // Dispose of group contents (sphere + icon meshes)
            child.children.forEach(groupChild => {
              if (groupChild instanceof THREE.Mesh) {
                groupChild.geometry.dispose()
                if (groupChild.material instanceof THREE.Material) {
                  groupChild.material.dispose()
                }
              }
            })
          }
        })

        // Remove group from scene
        sceneRef.current.sphere.remove(hotspotsGroupRef.current)
        hotspotsGroupRef.current = null
      }
    }
  }, [sceneRef])

  return (
    <HotspotConfirmationDialog
      isOpen={!!pendingNavigation}
      areaName={pendingNavigation?.areaName || ''}
      floorLevel={pendingNavigation?.floorLevel}
      isStairs={pendingNavigation?.navigationType || 'door'}
      position={pendingNavigation?.dialogPosition || { x: 0, y: 0, flippedHorizontal: false }}
      onConfirm={handleConfirmNavigation}
      onCancel={handleCancelNavigation}
    />
  )
}