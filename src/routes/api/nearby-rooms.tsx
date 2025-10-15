/**
 * Nearby Rooms API Route
 *
 * Collates all nearbyRooms objects from all building blocks along with their
 * associated photo IDs. Provides a comprehensive directory of rooms visible
 * from specific photo locations throughout the campus tour.
 *
 * @fileoverview API endpoint that aggregates room location data from all building blocks
 *
 * @example
 * ```typescript
 * // GET /api/nearby-rooms
 * // Returns array of room entries with photo associations
 * [
 *   {
 *     photoId: "w-f1-main-3-aside-1",
 *     areaId: "w-block-floor-1-main",
 *     areaName: "W Block",
 *     buildingBlock: "w",
 *     floorLevel: 1,
 *     roomNumber: "W111",
 *     roomType: "classroom"
 *   },
 *   ...
 * ]
 * ```
 */

import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import type { Area, Elevator, NearbyRoom } from '../../types/tour'
import { getAllAreas } from '../../data/blockUtils'

/**
 * Represents a room entry with its photo association and location metadata
 *
 * @property photoId - ID of the photo where this room is visible
 * @property areaId - ID of the area containing this photo
 * @property areaName - Display name of the area/building
 * @property buildingBlock - Building block identifier
 * @property floorLevel - Floor level where photo is located
 * @property roomNumber - Room number or identifier
 * @property roomType - Type of room (classroom, lab, office, facility, restroom)
 */
interface RoomEntry extends NearbyRoom {
  photoId: string
  areaId: string
  areaName: string
  buildingBlock: string
  floorLevel: number
}

/**
 * Checks if an item is an Area type
 *
 * Type guard function to differentiate between Area and Elevator types
 * since they have different structures for accessing photos.
 *
 * @param item - Item to check (could be Area or Elevator)
 * @returns True if item is an Area with photos array
 */
function isArea(item: Area | Elevator): item is Area {
  return 'photos' in item && Array.isArray(item.photos)
}

/**
 * Collates all nearby rooms from all building blocks
 *
 * Iterates through all areas and photos across the campus, extracting
 * nearbyRooms data and associating it with photo IDs and area metadata.
 * Handles both Area types (with photos array) and Elevator types.
 *
 * @returns Array of room entries with complete location metadata
 */
function collateNearbyRooms(): RoomEntry[] {
  const roomEntries: RoomEntry[] = []

  // Get all areas and elevators from centralized utility
  const allItems = getAllAreas()

  // Iterate through all areas/elevators
  for (const item of allItems) {
    // Handle Area type with photos array
    if (isArea(item)) {
      for (const photo of item.photos) {
        if (photo.nearbyRooms && photo.nearbyRooms.length > 0) {
          for (const room of photo.nearbyRooms) {
            roomEntries.push({
              photoId: photo.id,
              areaId: item.id,
              areaName: item.name,
              buildingBlock: item.buildingBlock,
              floorLevel: item.floorLevel,
              roomNumber: room.roomNumber,
              roomType: room.roomType
            })
          }
        }
      }
    }
    // Note: Elevators typically don't have nearbyRooms in their photo definitions so skip them
    else {
      continue
    }
  }

  return roomEntries
}

/**
 * API Route Handler
 *
 * Defines GET endpoint at /api/nearby-rooms that returns collated room data.
 * This follows the TanStack Start pattern with server.handlers configuration.
 */
export const Route = createFileRoute('/api/nearby-rooms')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        console.info('GET /api/nearby-rooms @', request.url)
        const roomEntries = collateNearbyRooms()

        return json({
          success: true,
          count: roomEntries.length,
          data: roomEntries
        })
      }
    }
  }
})
