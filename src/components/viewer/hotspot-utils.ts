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
import type { NavigationHotspot } from '../../types/tour'

/**
 * Get appropriate color for hotspot based on direction type
 *
 * Provides consistent visual styling for different types of navigation hotspots
 * to help users quickly identify the type of navigation available.
 *
 * @param direction - Hotspot direction (up, down, elevator, floor1, floor2, etc.)
 * @returns Hex color value for hotspot material
 */
export function getHotspotColor(direction: string): number {
  if (direction.startsWith('floor')) return 0x0066ff // Blue for elevator floors
  if (direction === 'up') return 0x00ff00 // Green for up stairs
  if (direction === 'down') return 0xff6600 // Orange for down stairs
  if (direction === 'elevator') return 0x0066ff // Blue for elevator access
  return 0xff0000 // Red for other/unknown
}

/**
 * Create hotspot geometry and material based on direction type
 *
 * Generates appropriate 3D geometry and material for different types of
 * navigation hotspots with consistent sizing and visual style.
 *
 * @param direction - Hotspot direction to determine geometry type
 * @returns Object containing Three.js geometry and material
 */
export function createHotspotGeometry(direction: string): {
  geometry: THREE.BufferGeometry
  material: THREE.Material
} {
  const color = getHotspotColor(direction)
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide
  })

  if (direction === 'up') {
    // Arrow pointing up for stairs - 3x bigger
    const geometry = new THREE.ConeGeometry(0.45, 0.9, 8)
    return { geometry, material }
  }

  if (direction === 'down') {
    // Arrow pointing down for stairs (cone flipped) - 3x bigger
    const geometry = new THREE.ConeGeometry(0.45, 0.9, 8)
    return { geometry, material }
  }

  if (direction === 'elevator') {
    // Square for elevator access - 3x bigger
    const geometry = new THREE.BoxGeometry(0.6, 0.6, 0.3)
    return { geometry, material }
  }

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
 * Set up hotspot mesh orientation to face camera
 *
 * Orients a hotspot mesh to face toward the camera position at the sphere center,
 * ensuring hotspots are always readable regardless of their position on the sphere.
 *
 * @param mesh - Hotspot mesh to orient
 * @param position - Hotspot position on sphere
 */
export function orientHotspotToCamera(mesh: THREE.Mesh, position: THREE.Vector3): void {
  // Make hotspot face toward sphere center (camera position)
  mesh.lookAt(0, 0, 0)

  // Apply specific rotations for certain geometry types
  if (mesh.userData.direction === 'down') {
    // Flip down arrow
    mesh.rotateZ(Math.PI)
  }
}