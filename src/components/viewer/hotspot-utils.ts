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

  // Keep existing logic for floor and other hotspots
  const color = direction.startsWith('floor') ? 0x0066ff : 0xff0000
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide
  })

  if (direction.startsWith('floor')) {
    // Circle for elevator floor buttons - 3x bigger
    const geometry = new THREE.CircleGeometry(0.36, 16)
    return { geometry, material }
  }

  // Default sphere for unknown types - 3x bigger
  const geometry = new THREE.SphereGeometry(0.3, 8, 6)
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