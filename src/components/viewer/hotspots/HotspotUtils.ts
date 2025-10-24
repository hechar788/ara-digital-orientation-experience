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

/**
 * Hidden location hotspots render smaller than standard navigation markers.
 * Keep the scale factor centralized so geometry generation and runtime scaling stay in sync.
 */
export const HIDDEN_LOCATION_SCALE_FACTOR = 0.65
/**
 * Cache for loaded SVG textures to avoid reloading
 */
const textureCache = new Map<string, THREE.Texture>()

/**
 * Cache for in-flight SVG loading promises to prevent duplicate fetches
 *
 * When multiple hotspots request the same SVG simultaneously (race condition),
 * this cache ensures they all wait for the same fetch instead of making
 * duplicate network requests.
 */
const loadingCache = new Map<string, Promise<THREE.Texture>>()

/**
 * Create texture from SVG file for hotspot icons
 *
 * Loads an SVG file and converts it to a Three.js texture that can be
 * applied to hotspot materials for consistent iconography.
 *
 * Uses two-tier caching:
 * 1. Completed texture cache - instant return for already-loaded SVGs
 * 2. Loading promise cache - prevents duplicate fetches during concurrent loads
 *
 * @param svgPath - Path to SVG file relative to public directory
 * @returns Promise resolving to Three.js texture
 */
async function createSVGTexture(svgPath: string): Promise<THREE.Texture> {
  // Tier 1: Check completed texture cache (instant return)
  if (textureCache.has(svgPath)) {
    return textureCache.get(svgPath)!
  }

  // Tier 2: Check loading cache for in-flight requests
  if (loadingCache.has(svgPath)) {
    return loadingCache.get(svgPath)!
  }

  // Tier 3: Start new load and cache the promise
  const loadPromise = (async () => {
    try {
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

      return new Promise<THREE.Texture>((resolve, reject) => {
        img.onload = () => {
          // Clear canvas with transparent background
          ctx.clearRect(0, 0, 64, 64)

          // Draw SVG centered
          ctx.drawImage(img, 0, 0, 64, 64)

          // Create texture
          const texture = new THREE.CanvasTexture(canvas)
          texture.needsUpdate = true

          // Cache completed texture
          textureCache.set(svgPath, texture)

          // Clean up blob URL
          URL.revokeObjectURL(url)

          resolve(texture)
        }

        img.onerror = () => {
          URL.revokeObjectURL(url)
          reject(new Error(`Failed to load SVG image: ${svgPath}`))
        }

        img.src = url
      })
    } catch (error) {
      console.error(`Error loading SVG texture: ${svgPath}`, error)
      throw error
    } finally {
      // Always remove from loading cache when done (success or failure)
      loadingCache.delete(svgPath)
    }
  })()

  // Cache the loading promise
  loadingCache.set(svgPath, loadPromise)

  return loadPromise
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
 * Create canvas texture with star icon for hidden locations
 *
 * Generates a texture with a gold star icon rendered as an SVG path
 * on transparent background for overlay on gold sphere hotspots.
 *
 * @returns Promise resolving to Three.js texture with star icon
 */
async function createStarIconTexture(): Promise<THREE.Texture> {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!

  // Clear with transparent background
  ctx.clearRect(0, 0, 64, 64)

  // Draw a star using path
  ctx.fillStyle = '#000000' // Black star for contrast on gold sphere
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2

  // Star path (5-pointed star centered at 32, 32)
  const centerX = 32
  const centerY = 32
  const outerRadius = 24
  const innerRadius = 10
  const points = 5

  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = (i * Math.PI) / points - Math.PI / 2
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Create and return texture
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

/**
 * Create canvas texture with info icon for information hotspots
 *
 * Generates a texture with an info icon (lowercase "i" in a circle)
 * on transparent background for overlay on information sphere hotspots.
 *
 * @returns Promise resolving to Three.js texture with info icon
 */
async function createInfoIconTexture(): Promise<THREE.Texture> {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!

  // Clear with transparent background
  ctx.clearRect(0, 0, 64, 64)

  const centerX = 32
  const centerY = 32
  const radius = 24

  // Draw circle outline
  ctx.strokeStyle = '#FFFFFF' // White for contrast on dark sphere
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.stroke()

  // Draw "i" character
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 36px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('i', centerX, centerY + 2) // Slight offset for visual centering

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

  if (direction === 'hiddenLocation') {
    // Gold sphere with star icon for hidden locations in race mode
    const sphereGeometry = new THREE.SphereGeometry(0.45, 16, 12)

    // Create solid gold sphere material
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFD700, // Gold color (#FFD700)
      transparent: false,
      opacity: 1.0,
      side: THREE.DoubleSide
    })

    // Create a plane for the star icon that sits on top
    try {
      const starTexture = await createStarIconTexture()
      const iconGeometry = new THREE.PlaneGeometry(0.4, 0.4)
      const iconMaterial = new THREE.MeshBasicMaterial({
        map: starTexture,
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
      console.warn('Failed to load star texture, using fallback:', error)
      // Fallback to just the gold sphere
      return { geometry: sphereGeometry, material: sphereMaterial }
    }
  }

  if (direction === 'information') {
    // Sphere with AI chat header color and info icon
    const sphereGeometry = new THREE.SphereGeometry(0.45, 16, 12)

    // Create solid sphere material with AI chat header color (#0C586E)
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x0C586E, // AI chat header color
      transparent: false,
      opacity: 1.0,
      side: THREE.DoubleSide
    })

    // Create a plane for the info icon that sits on top
    try {
      const infoTexture = await createInfoIconTexture()
      const iconGeometry = new THREE.PlaneGeometry(0.4, 0.4)
      const iconMaterial = new THREE.MeshBasicMaterial({
        map: infoTexture,
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
      console.warn('Failed to load info texture, using fallback:', error)
      // Fallback to just the colored sphere
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
 * Minimum scale factor for navigation hotspots
 *
 * Prevents navigation hotspots (elevator/stairs/door) from becoming too small
 * when zoomed out, maintaining visibility and usability at all zoom levels.
 */
export const MIN_NAVIGATION_HOTSPOT_SCALE = 0.825

/**
 * Mobile scale factor for navigation and information hotspots
 *
 * Applies a 7.5% size increase to navigation (stairs/elevator/door) and information
 * hotspots on touch devices to improve tap target accessibility. Does not apply
 * to directional arrows or hidden location hotspots.
 */
export const MOBILE_HOTSPOT_SCALE_FACTOR = 1.1

/**
 * Calculate dynamic scale for hotspot based on camera zoom level
 *
 * Adjusts hotspot size based on field of view to maintain visibility
 * and readability at different zoom levels.
 *
 * @param fov - Current camera field of view in degrees
 * @param applyMinimum - Whether to apply minimum scale (true for navigation hotspots, false for hidden locations)
 * @returns Scale factor for hotspot size
 */
export function calculateHotspotScale(fov: number, applyMinimum: boolean = true): number {
  // Scale between 0.5 and 1.5 based on FOV (10-120 degrees)
  const scale = (120 - fov) / 100 + 0.5

  // Apply minimum scale for navigation hotspots only
  if (applyMinimum) {
    return Math.max(scale, MIN_NAVIGATION_HOTSPOT_SCALE)
  }

  return scale
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
export function orientHotspotToCamera(object: THREE.Object3D): void {
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

/**
 * Create 3D directional arrow sprite for in-scene navigation
 *
 * Creates a flat sprite arrow that appears "on the ground" in the panoramic scene,
 * similar to Google Maps Street View navigation arrows.
 *
 * @param direction - Navigation direction ('forward', 'right', etc.)
 * @param angle - Rotation angle in degrees to point arrow in correct direction
 * @returns Promise resolving to Three.js mesh with arrow sprite
 *
 * @example
 * ```typescript
 * const forwardArrow = await createDirectionalArrow('forward', 0)
 * scene.add(forwardArrow)
 * ```
 */
export async function createDirectionalArrow(
  direction: string,
): Promise<THREE.Mesh> {
  // Load arrow texture
  const arrowTexture = await createSVGTexture('/svg/arrow-navigation.svg')

  // Create sprite plane - made thicker/wider and a little taller
  const geometry = new THREE.PlaneGeometry(2.25, 2.5)

  // Blue solid material
  const material = new THREE.MeshBasicMaterial({
    map: arrowTexture,
    transparent: true,
    opacity: 1.0,
    side: THREE.DoubleSide,
    alphaTest: 0.1
  })

  const arrow = new THREE.Mesh(geometry, material)

  // Store original material for hover effects
  arrow.userData.originalMaterial = material
  arrow.userData.direction = direction
  arrow.userData.isDirectionalArrow = true

  return arrow
}

/**
 * Calculate 3D position for directional arrow at floor level
 *
 * Uses spherical coordinates matching the camera system to position arrows.
 * This ensures arrows appear correctly in the inverted panoramic sphere.
 *
 * @param angle - Direction angle in degrees (longitude/theta)
 * @param distance - Distance from camera center (default: 7 units)
 * @returns 3D position vector for arrow placement
 *
 * @example
 * ```typescript
 * const position = calculateArrowPosition(0) // Forward arrow position
 * arrow.position.copy(position)
 * ```
 */
export function calculateArrowPosition(
  angle: number,
  distance: number = 3.85  // Reduced from 7 to bring 25% closer
): THREE.Vector3 {
  // Convert angle to radians (theta in spherical coordinates)
  const theta = angle * (Math.PI / 180)

  // Use phi = 90° for floor-level items (horizontal plane)
  const phi = Math.PI / 2

  // Spherical coordinate conversion (same as camera target calculation)
  return new THREE.Vector3(
    distance * Math.sin(phi) * Math.cos(theta),  // X
    -2.0,  // Y: slightly above floor level (raised from -2.5)
    distance * Math.sin(phi) * Math.sin(theta)   // Z
  )
}

/**
 * Orient directional arrow to face outward from camera
 *
 * Rotates arrow to lay flat on ground and point in the direction of travel.
 * Uses Y-axis rotation to align with spherical coordinate theta angle.
 *
 * @param arrow - Arrow mesh to orient
 * @param angle - Direction angle in degrees (theta)
 */
export function orientDirectionalArrow(arrow: THREE.Mesh, angle: number): void {
  // First, lay arrow flat on horizontal plane
  arrow.rotation.x = Math.PI / 2 // 90° to lay flat

  // Then rotate around Z axis to point in direction (theta angle)
  // When arrow is rotated to lay flat (x=90°), Z rotation controls horizontal direction
  arrow.rotation.z = (angle - 90) * (Math.PI / 180)
}

/**
 * Apply hover brightness effect to directional arrow
 *
 * Brightens arrow when hovering to provide visual feedback.
 *
 * @param arrow - Arrow mesh to brighten
 * @param isHovering - Whether arrow is being hovered
 */
export function setArrowHoverState(arrow: THREE.Mesh, isHovering: boolean): void {
  if (!arrow.userData.isDirectionalArrow) return

  const material = arrow.material as THREE.MeshBasicMaterial

  if (isHovering) {
    // Brighten: add lighter blue tint
    material.color.setHex(0x88CCFF) // Lighter blue tint
  } else {
    // Normal state: no tint (white = use texture color as-is)
    material.color.setHex(0xFFFFFF) // White = no color modification
  }
}
