/**
 * VR Campus Tour Data Utilities
 *
 * Provides utility functions for accessing tour photo and area data.
 * Centralizes data access logic for finding photos and areas by ID.
 *
 * @fileoverview Tour data utilities for photo lookup and area context.
 */

import { aBlockAreas } from './blocks/a_block'
import { xBlockAreas } from './blocks/x_block'
import { nBlockAreas } from './blocks/n_block'
import { sBlockAreas } from './blocks/s_block'
import { libraryAreas } from './blocks/library'
import { outsideAreas } from './blocks/outside'
import { nsBlockElevator } from './blocks/n_s_shared/elevator'
import { xBlockElevator } from './blocks/x_block/elevator'
import type { Photo, Area, Elevator } from '../types/tour'

/**
 * Get all available areas in the tour system (private utility)
 *
 * Collects and returns all area definitions from all building blocks
 * and elevator systems. Used internally by public utility functions.
 *
 * @private
 * @returns Array of all area definitions and elevators
 */
const getAllAreas = (): any[] => {
  return [
    ...aBlockAreas,
    ...xBlockAreas,
    ...nBlockAreas,
    ...sBlockAreas,
    ...libraryAreas,
    ...outsideAreas,
    nsBlockElevator,
    xBlockElevator
  ]
}

/**
 * Find a specific photo by its ID across all areas and elevators
 *
 * Searches through all areas and elevator systems to locate a photo
 * with the specified ID. Returns null if no photo is found.
 *
 * @param photoId - Unique identifier for the photo to find
 * @returns Photo object if found, null otherwise
 *
 * @example
 * ```typescript
 * const photo = findPhotoById('a-f1-north-entrance')
 * if (photo) {
 *   console.log('Found photo:', photo.imageUrl)
 * }
 * ```
 */
export const findPhotoById = (photoId: string): Photo | null => {
  const allData = getAllAreas()

  for (const item of allData) {
    if ('photos' in item) {
      // Regular area
      const area = item as Area
      const photo = area.photos.find(p => p.id === photoId)
      if (photo) return photo
    } else if ('photo' in item) {
      // Elevator
      const elevator = item as Elevator
      if (elevator.photo.id === photoId) {
        // Convert elevator photo to regular photo format with floor navigation
        const directions: any = {}

        // Add floor connections as up/down directions based on available floors
        if (elevator.photo.floorConnections.floor1) {
          directions['floor1'] = elevator.photo.floorConnections.floor1
        }
        if (elevator.photo.floorConnections.floor2) {
          directions['floor2'] = elevator.photo.floorConnections.floor2
        }
        if (elevator.photo.floorConnections.floor3) {
          directions['floor3'] = elevator.photo.floorConnections.floor3
        }
        if (elevator.photo.floorConnections.floor4) {
          directions['floor4'] = elevator.photo.floorConnections.floor4
        }

        return {
          id: elevator.photo.id,
          imageUrl: elevator.photo.imageUrl,
          directions: directions,
          hotspots: elevator.photo.hotspots ? elevator.photo.hotspots.map(h => ({
            direction: `floor${h.floor}` as any,
            position: h.position
          })) : undefined
        }
      }
    }
  }

  return null
}

/**
 * Get area information for a specific photo
 *
 * Finds which area contains the specified photo and returns
 * the area metadata (building block, floor level, etc.).
 *
 * @param photoId - Photo ID to look up
 * @returns Area object containing the photo, null if not found
 */
export const getAreaForPhoto = (photoId: string): Area | null => {
  const allData = getAllAreas()

  for (const item of allData) {
    if ('photos' in item) {
      const area = item as Area
      const hasPhoto = area.photos.some(p => p.id === photoId)
      if (hasPhoto) return area
    }
  }

  return null
}

