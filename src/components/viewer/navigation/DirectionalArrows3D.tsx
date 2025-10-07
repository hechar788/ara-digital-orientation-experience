/**
 * 3D directional arrow renderer for immersive VR tour navigation
 *
 * Renders clickable 3D arrow sprites at floor level in the panoramic scene,
 * similar to Google Maps Street View. Arrows only appear when camera is
 * oriented toward available navigation directions.
 *
 * @fileoverview Component for rendering 3D directional navigation arrows
 */

import React, { useEffect, useCallback, useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import type { Photo } from '@/types/tour'
import { DIRECTION_ANGLES } from '@/types/tour'
import {
  createDirectionalArrow,
  calculateArrowPosition,
  orientDirectionalArrow,
  setArrowHoverState
} from '../hotspots/HotspotUtils'

/**
 * Props for DirectionalArrows3D component
 *
 * @property currentPhoto - Current photo with direction data
 * @property sceneRef - Reference to Three.js scene objects
 * @property cameraControlRef - Reference to camera control state (lon/lat)
 * @property onNavigate - Callback for horizontal navigation (8 directions)
 */
interface DirectionalArrows3DProps {
  currentPhoto: Photo | null
  sceneRef: React.RefObject<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    geometry: THREE.SphereGeometry
    sphere: THREE.Mesh
  }>
  cameraControlRef: React.RefObject<{ lon: number; lat: number }>
  onNavigate: (direction: 'forward' | 'forwardRight' | 'right' | 'backRight' | 'back' | 'backLeft' | 'left' | 'forwardLeft') => void
}

/**
 * Determines if user is looking in a specific direction
 *
 * @param cameraLon - Current camera horizontal rotation in degrees
 * @param targetAngle - Target direction angle
 * @returns Whether camera is oriented toward direction (±20° threshold)
 */
function isLookingInDirection(cameraLon: number, targetAngle: number): boolean {
  const normalizedLon = ((cameraLon % 360) + 360) % 360
  let angleDiff = Math.abs(normalizedLon - targetAngle)

  if (angleDiff > 180) {
    angleDiff = 360 - angleDiff
  }

  return angleDiff <= 20
}

/**
 * Component for rendering 3D directional navigation arrows in panoramic scene
 *
 * Creates floor-level arrow sprites that appear when looking in available
 * navigation directions. Provides hover effects and click interaction.
 *
 * @param currentPhoto - Current photo with navigation data
 * @param sceneRef - Three.js scene reference
 * @param cameraLon - Camera horizontal rotation
 * @param onNavigate - Navigation callback
 */
export const DirectionalArrows3D: React.FC<DirectionalArrows3DProps> = ({
  currentPhoto,
  sceneRef,
  cameraControlRef,
  onNavigate
}) => {
  const arrowsGroupRef = useRef<THREE.Group | null>(null)
  const [hoveredArrow, setHoveredArrow] = useState<THREE.Mesh | null>(null)
  const [arrowsReady, setArrowsReady] = useState(false)

  // Detect mobile and calculate appropriate arrow distance (memoized to prevent dependency array issues)
  const arrowDistance = useMemo(() => {
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    return isMobile ? 4.5 : 4
  }, [])

  /**
   * Create and position directional arrows in the scene
   */
  useEffect(() => {
    if (!sceneRef.current || !currentPhoto) {
      if (arrowsGroupRef.current && sceneRef.current) {
        sceneRef.current.sphere.remove(arrowsGroupRef.current)
        arrowsGroupRef.current = null
      }
      return
    }

    const { sphere } = sceneRef.current
    const { directions } = currentPhoto
    const startingAngle = currentPhoto.startingAngle ?? 0

    // Create or get arrows group
    let arrowsGroup = arrowsGroupRef.current
    if (!arrowsGroup) {
      arrowsGroup = new THREE.Group()
      arrowsGroup.name = 'directional-arrows-group'
      sphere.add(arrowsGroup)
      arrowsGroupRef.current = arrowsGroup
    }

    // Clear existing arrows
    arrowsGroup.children.forEach(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (child.material instanceof THREE.Material) {
          child.material.dispose()
        }
      }
    })
    arrowsGroup.clear()
    setArrowsReady(false)

    // Create arrows for each available horizontal direction
    const directionalKeys: Array<'forward' | 'forwardRight' | 'right' | 'backRight' | 'back' | 'backLeft' | 'left' | 'forwardLeft'> = [
      'forward', 'forwardRight', 'right', 'backRight',
      'back', 'backLeft', 'left', 'forwardLeft'
    ]

    // Wait for all arrows to be created
    const arrowPromises = directionalKeys.map(async (direction) => {
      if (!directions[direction]) return null

      const offset = DIRECTION_ANGLES[direction] ?? 0
      const angle = (startingAngle + offset) % 360

      try {
        const arrow = await createDirectionalArrow(direction)
        const position = calculateArrowPosition(angle, arrowDistance)

        arrow.position.copy(position)
        orientDirectionalArrow(arrow, angle)

        arrow.userData.direction = direction
        arrow.userData.targetAngle = angle
        arrow.name = `arrow-${direction}`

        return arrow
      } catch (error) {
        console.error(`Failed to create arrow for ${direction}:`, error)
        return null
      }
    })

    Promise.all(arrowPromises).then(arrows => {
      arrows.forEach(arrow => {
        if (arrow && arrowsGroup) {
          arrowsGroup.add(arrow)
        }
      })
      setArrowsReady(true)
    })

    return () => {
      if (arrowsGroupRef.current && sceneRef.current) {
        arrowsGroupRef.current.children.forEach(child => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose()
            if (child.material instanceof THREE.Material) {
              child.material.dispose()
            }
          }
        })
        sceneRef.current.sphere.remove(arrowsGroupRef.current)
        arrowsGroupRef.current = null
      }
    }
  }, [currentPhoto, sceneRef, arrowDistance])

  /**
   * Update arrow visibility based on camera orientation
   * Poll camera rotation continuously via animation frame
   */
  useEffect(() => {
    if (!arrowsGroupRef.current || !cameraControlRef.current || !arrowsReady) return

    let animationFrameId: number

    const updateVisibility = () => {
      if (!arrowsGroupRef.current || !cameraControlRef.current) return

      const currentCameraLon = cameraControlRef.current.lon

      arrowsGroupRef.current.children.forEach((arrow) => {
        if (arrow instanceof THREE.Mesh) {
          const targetAngle = arrow.userData.targetAngle
          const shouldBeVisible = isLookingInDirection(currentCameraLon, targetAngle)

          // TEMP: Always show arrows for debugging positioning/rotation
          arrow.visible = true // shouldBeVisible
        }
      })

      animationFrameId = requestAnimationFrame(updateVisibility)
    }

    updateVisibility()

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [cameraControlRef, currentPhoto, arrowsReady])

  /**
   * Handle mouse move for hover effects
   */
  const handleCanvasMouseMove = useCallback((event: MouseEvent) => {
    if (!sceneRef.current || !arrowsGroupRef.current) return

    const { camera, renderer } = sceneRef.current
    const canvas = renderer.domElement
    const rect = canvas.getBoundingClientRect()

    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    )

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera)

    const visibleArrows = arrowsGroupRef.current.children.filter(child => child.visible)
    const intersects = raycaster.intersectObjects(visibleArrows, true)

    // Clear previous hover state
    if (hoveredArrow) {
      setArrowHoverState(hoveredArrow, false)
      setHoveredArrow(null)
      canvas.style.cursor = 'grab'
    }

    // Apply new hover state
    if (intersects.length > 0) {
      const arrow = intersects[0].object as THREE.Mesh
      if (arrow.userData.isDirectionalArrow) {
        setArrowHoverState(arrow, true)
        setHoveredArrow(arrow)
        canvas.style.cursor = 'pointer'
      }
    }
  }, [sceneRef, hoveredArrow])

  /**
   * Handle click events on arrows
   */
  const handleCanvasClick = useCallback((event: MouseEvent | TouchEvent) => {
    if (!sceneRef.current || !arrowsGroupRef.current) return

    const { camera, renderer } = sceneRef.current
    const canvas = renderer.domElement
    const rect = canvas.getBoundingClientRect()

    let clientX: number, clientY: number

    if ('touches' in event && event.type === 'touchend') {
      if (event.changedTouches.length === 0) return
      clientX = event.changedTouches[0].clientX
      clientY = event.changedTouches[0].clientY
    } else if ('clientX' in event) {
      clientX = event.clientX
      clientY = event.clientY
    } else {
      return
    }

    const mouse = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    )

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera)

    const visibleArrows = arrowsGroupRef.current.children.filter(child => child.visible)
    const intersects = raycaster.intersectObjects(visibleArrows, true)

    if (intersects.length > 0) {
      const arrow = intersects[0].object as THREE.Mesh
      if (arrow.userData.isDirectionalArrow && arrow.userData.direction) {
        onNavigate(arrow.userData.direction)
      }
    }
  }, [sceneRef, onNavigate])

  /**
   * Set up canvas event listeners
   */
  useEffect(() => {
    if (!sceneRef.current) return

    const canvas = sceneRef.current.renderer.domElement

    canvas.addEventListener('click', handleCanvasClick)
    canvas.addEventListener('touchend', handleCanvasClick)
    canvas.addEventListener('mousemove', handleCanvasMouseMove)

    return () => {
      canvas.removeEventListener('click', handleCanvasClick)
      canvas.removeEventListener('touchend', handleCanvasClick)
      canvas.removeEventListener('mousemove', handleCanvasMouseMove)
    }
  }, [handleCanvasClick, handleCanvasMouseMove, sceneRef])

  return null
}
