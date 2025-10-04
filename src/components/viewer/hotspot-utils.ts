/**
 * Hotspot utilities for VR tour navigation
 *
 * Provides hotspot styling utilities
 * for rendering interactive 3D hotspots within the panoramic viewer.
 *
 * @fileoverview Utilities for creating 3D hotspot geometries and materials
 * for interactive VR tour navigation.
 */

import * as THREE from 'three'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { DoorOpen } from 'lucide-react'

/**
 * Cache for loaded SVG textures to avoid reloading
 */
const textureCache = new Map<string, THREE.Texture>()

/**
 * Create texture from SVG file for hotspot icons
 *
 * Loads an SVG file and converts it to a Three.js texture that can be
 * applied to hotspot materials for consistent iconography.
 *
 * @param svgPath - Path to SVG file relative to public directory
 * @returns Promise resolving to Three.js texture
 */
async function createSVGTexture(svgPath: string): Promise<THREE.Texture> {
  // Check cache first
  if (textureCache.has(svgPath)) {
    return textureCache.get(svgPath)!
  }

  // Load SVG as text
  const response = await fetch(svgPath)
  const svgText = await response.text()

  // Create canvas and draw SVG
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!

  // Create image from SVG
  const img = new Image()
  const svgBlob = new Blob([svgText], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(svgBlob)

  return new Promise<THREE.Texture>((resolve) => {
    img.onload = () => {
      // Clear canvas with transparent background
      ctx.clearRect(0, 0, 64, 64)

      // Draw SVG centered
      ctx.drawImage(img, 0, 0, 64, 64)

      // Create texture
      const texture = new THREE.CanvasTexture(canvas)
      texture.needsUpdate = true

      // Cache texture
      textureCache.set(svgPath, texture)

      // Clean up blob URL
      URL.revokeObjectURL(url)

      resolve(texture)
    }
    img.src = url
  })
}

/**
 * Create canvas texture with floor number text
 *
 * Generates a texture with a floor number rendered as black text
 * on transparent background for overlay on white sphere hotspots.
 *
 * @param floorNumber - Floor number to render (1, 2, 3, 4)
 * @returns Promise resolving to Three.js texture with floor number
 */
async function createFloorNumberTexture(floorNumber: number): Promise<THREE.Texture> {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!

  // Clear with transparent background
  ctx.clearRect(0, 0, 64, 64)

  // Style the text
  ctx.fillStyle = '#000000' // Black text
  ctx.font = 'bold 40px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Draw floor number
  ctx.fillText(floorNumber.toString(), 32, 32)

  // Create and return texture
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

/**
 * Create hotspot geometry and material based on direction type
 *
 * Generates appropriate 3D geometry and material for different types of
 * navigation hotspots with consistent sizing and visual style.
 * For stairs (up/down), creates white spheres with stairs.svg texture.
 *
 * @param direction - Hotspot direction to determine geometry type
 * @returns Promise resolving to object containing Three.js geometry/group and material
 */
export async function createHotspotGeometry(direction: string): Promise<{
  geometry: THREE.BufferGeometry | THREE.Group
  material: THREE.Material
}> {
  if (direction === 'up' || direction === 'down') {
    // White sphere with stairs icon for all stairs - 3x bigger
    const sphereGeometry = new THREE.SphereGeometry(0.45, 16, 12)

    // Create solid white sphere material
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff, // Solid white sphere
      transparent: false,
      opacity: 1.0,
      side: THREE.DoubleSide
    })

    // Create a plane for the stairs icon that sits on top
    try {
      const stairsTexture = await createSVGTexture('/svg/stairs.svg')
      const iconGeometry = new THREE.PlaneGeometry(0.4, 0.4)
      const iconMaterial = new THREE.MeshBasicMaterial({
        map: stairsTexture,
        transparent: true,
        opacity: 1.0,
        side: THREE.DoubleSide,
        alphaTest: 0.1 // Only render non-transparent parts
      })

      // Create meshes
      const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
      const iconMesh = new THREE.Mesh(iconGeometry, iconMaterial)
      iconMesh.position.z = 0.46 // Position slightly in front of sphere

      // Create a group containing both the sphere and icon
      const group = new THREE.Group()
      group.add(sphereMesh)
      group.add(iconMesh)

      return {
        geometry: group, // Return the group containing sphere + icon
        material: sphereMaterial // Return sphere material as main material
      }
    } catch (error) {
      console.warn('Failed to load stairs texture, using fallback:', error)
      // Fallback to just the white sphere
      return { geometry: sphereGeometry, material: sphereMaterial }
    }
  }

  if (direction === 'elevator') {
    // White sphere with elevator icon - 3x bigger
    const sphereGeometry = new THREE.SphereGeometry(0.45, 16, 12)

    // Create solid white sphere material
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff, // Solid white sphere
      transparent: false,
      opacity: 1.0,
      side: THREE.DoubleSide
    })

    // Create a plane for the elevator icon that sits on top
    try {
      const elevatorTexture = await createSVGTexture('/svg/elevator.svg')
      const iconGeometry = new THREE.PlaneGeometry(0.4, 0.4)
      const iconMaterial = new THREE.MeshBasicMaterial({
        map: elevatorTexture,
        transparent: true,
        opacity: 1.0,
        side: THREE.DoubleSide,
        alphaTest: 0.1 // Only render non-transparent parts
      })

      // Create meshes
      const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
      const iconMesh = new THREE.Mesh(iconGeometry, iconMaterial)
      iconMesh.position.z = 0.46 // Position slightly in front of sphere

      // Create a group containing both the sphere and icon
      const group = new THREE.Group()
      group.add(sphereMesh)
      group.add(iconMesh)

      return {
        geometry: group, // Return the group containing sphere + icon
        material: sphereMaterial // Return sphere material as main material
      }
    } catch (error) {
      console.warn('Failed to load elevator texture, using fallback:', error)
      // Fallback to just the white sphere
      return { geometry: sphereGeometry, material: sphereMaterial }
    }
  }

  if (direction === 'door') {
    // White sphere with door icon - 3x bigger
    const sphereGeometry = new THREE.SphereGeometry(0.45, 16, 12)

    // Create solid white sphere material
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff, // Solid white sphere
      transparent: false,
      opacity: 1.0,
      side: THREE.DoubleSide
    })

    // Create a plane for the door icon that sits on top
    try {
      const doorTexture = await createSVGTexture('/svg/door-open.svg')
      const iconGeometry = new THREE.PlaneGeometry(0.4, 0.4)
      const iconMaterial = new THREE.MeshBasicMaterial({
        map: doorTexture,
        transparent: true,
        opacity: 1.0,
        side: THREE.DoubleSide,
        alphaTest: 0.1 // Only render non-transparent parts
      })

      // Create meshes
      const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
      const iconMesh = new THREE.Mesh(iconGeometry, iconMaterial)
      iconMesh.position.z = 0.46 // Position slightly in front of sphere

      // Create a group containing both the sphere and icon
      const group = new THREE.Group()
      group.add(sphereMesh)
      group.add(iconMesh)

      return {
        geometry: group, // Return the group containing sphere + icon
        material: sphereMaterial // Return sphere material as main material
      }
    } catch (error) {
      console.warn('Failed to load door texture, using fallback:', error)
      // Fallback to just the white sphere
      return { geometry: sphereGeometry, material: sphereMaterial }
    }
  }

  if (direction.startsWith('floor')) {
    // Extract floor number from direction (e.g., 'floor1' -> 1)
    const floorNumber = parseInt(direction.replace('floor', ''))

    // White sphere with floor number - same style as stairs/elevator hotspots
    const sphereGeometry = new THREE.SphereGeometry(0.45, 16, 12)
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff, // White sphere
      transparent: false,
      opacity: 1.0,
      side: THREE.DoubleSide
    })

    try {
      const numberTexture = await createFloorNumberTexture(floorNumber)
      const iconGeometry = new THREE.PlaneGeometry(0.4, 0.4)
      const iconMaterial = new THREE.MeshBasicMaterial({
        map: numberTexture,
        transparent: true,
        opacity: 1.0,
        side: THREE.DoubleSide
      })

      // Create meshes
      const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
      const numberMesh = new THREE.Mesh(iconGeometry, iconMaterial)
      numberMesh.position.z = 0.46 // Position in front of sphere

      // Create group with sphere + number
      const group = new THREE.Group()
      group.add(sphereMesh)
      group.add(numberMesh)

      return {
        geometry: group,
        material: sphereMaterial
      }
    } catch (error) {
      console.warn('Failed to create floor number texture, using fallback:', error)
      return { geometry: sphereGeometry, material: sphereMaterial }
    }
  }

  // Default sphere for unknown types - 3x bigger
  const geometry = new THREE.SphereGeometry(0.3, 8, 6)
  const material = new THREE.MeshBasicMaterial({
    color: 0xff0000, // Red for unknown types
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide
  })
  return { geometry, material }
}

/**
 * Calculate dynamic scale for hotspot based on camera zoom level
 *
 * Adjusts hotspot size based on field of view to maintain visibility
 * and readability at different zoom levels.
 *
 * @param fov - Current camera field of view in degrees
 * @returns Scale factor for hotspot size
 */
export function calculateHotspotScale(fov: number): number {
  // Scale between 0.5 and 1.5 based on FOV (10-120 degrees)
  return (120 - fov) / 100 + 0.5
}

/**
 * Set up hotspot object orientation to face camera
 *
 * Orients a hotspot object (mesh or group) to face toward the camera position at the sphere center,
 * ensuring hotspots are always readable regardless of their position on the sphere.
 *
 * @param object - Hotspot object (mesh or group) to orient
 * @param position - Hotspot position on sphere
 */
export function orientHotspotToCamera(object: THREE.Object3D, position: THREE.Vector3): void {
  // Make hotspot face toward sphere center (camera position)
  object.lookAt(0, 0, 0)

  // No special rotations needed for spherical stairs hotspots
  // All hotspots now maintain consistent orientation
}

/**
 * Screen position coordinates with visibility flag
 *
 * Represents a 2D screen position converted from 3D world coordinates,
 * including whether the position is visible on screen.
 *
 * @property x - Horizontal screen coordinate in pixels
 * @property y - Vertical screen coordinate in pixels
 * @property isVisible - Whether the 3D position is in front of camera and visible
 */
export interface ScreenPosition {
  x: number
  y: number
  isVisible: boolean
}

/**
 * Convert 3D world position to 2D screen coordinates
 *
 * Projects a 3D position in world space to 2D screen pixel coordinates
 * using camera projection. Useful for positioning UI elements relative
 * to 3D objects in the scene.
 *
 * @param worldPosition - 3D position in world space to convert
 * @param camera - Camera used for projection
 * @param renderer - WebGL renderer containing canvas dimensions
 * @returns Screen coordinates with visibility flag
 *
 * @example
 * ```typescript
 * const hotspotPos = new THREE.Vector3(5, 0, 5)
 * const screenPos = getScreenPosition(hotspotPos, camera, renderer)
 * if (screenPos.isVisible) {
 *   console.log(`Hotspot at screen position: ${screenPos.x}, ${screenPos.y}`)
 * }
 * ```
 */
export function getScreenPosition(
  worldPosition: THREE.Vector3,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer
): ScreenPosition {
  const vector = worldPosition.clone()
  vector.project(camera)

  const canvas = renderer.domElement
  const widthHalf = canvas.clientWidth / 2
  const heightHalf = canvas.clientHeight / 2

  return {
    x: (vector.x * widthHalf) + widthHalf,
    y: -(vector.y * heightHalf) + heightHalf,
    isVisible: vector.z < 1 // Position is behind camera if z >= 1
  }
}

/**
 * Dialog position with adjustment flags
 *
 * Represents calculated position for confirmation dialog with edge detection flags.
 *
 * @property x - Horizontal position in pixels from left edge
 * @property y - Vertical position in pixels from top edge
 * @property flippedHorizontal - Whether dialog was flipped to left due to right edge overflow
 */
export interface DialogPosition {
  x: number
  y: number
  flippedHorizontal: boolean
}

/**
 * Calculate smart dialog position relative to screen coordinates
 *
 * Determines optimal position for confirmation dialog near a hotspot,
 * with intelligent edge detection to prevent overflow. Prefers positioning
 * to the right of the hotspot, but flips to left if near right screen edge.
 *
 * @param screenPos - Screen coordinates of the hotspot
 * @param dialogWidth - Width of dialog in pixels (default: 280)
 * @param dialogHeight - Height of dialog in pixels (default: 120)
 * @returns Calculated dialog position with adjustment flags
 *
 * @example
 * ```typescript
 * const hotspotScreen = { x: 800, y: 400, isVisible: true }
 * const dialogPos = getDialogPosition(hotspotScreen, 280, 120)
 * // Returns { x: 840, y: 350, flippedHorizontal: false }
 * ```
 */
export function getDialogPosition(
  screenPos: ScreenPosition,
  dialogWidth: number = 280,
  dialogHeight: number = 120
): DialogPosition {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const margin = 20
  const hotspotOffset = 80 // Distance from hotspot

  // Default: position to the right of hotspot
  let x = screenPos.x + hotspotOffset
  let y = screenPos.y - (dialogHeight / 2) // Vertically centered on hotspot
  let flippedHorizontal = false

  // Edge detection - flip to left if overflows right edge
  if (x + dialogWidth + margin > viewportWidth) {
    x = screenPos.x - dialogWidth - hotspotOffset
    flippedHorizontal = true
  }

  // Prevent left edge overflow
  if (x < margin) {
    x = margin
  }

  // Prevent vertical overflow
  if (y < margin) {
    y = margin
  }
  if (y + dialogHeight + margin > viewportHeight) {
    y = viewportHeight - dialogHeight - margin
  }

  return { x, y, flippedHorizontal }
}