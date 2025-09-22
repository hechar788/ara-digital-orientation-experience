// VR Campus Tour Type Definitions
// Shared TypeScript interfaces for tour navigation system

/**
 * Represents a single 360° photo in the VR tour with navigation connections
 * and contextual information about the location.
 *
 * @property id - Unique identifier for this photo (e.g., "a-f1-north-entrance")
 * @property imageUrl - Path to the 360° image file
 * @property position - GPS coordinates if available (optional)
 * @property connections - Navigation connections to adjacent photos
 * @property connections.forward - Next photo when moving forward
 * @property connections.back - Previous photo when moving backward
 * @property connections.left - Photo ID when turning left (only at intersections)
 * @property connections.right - Photo ID when turning right (only at intersections)
 * @property connections.up - Photo ID(s) when going up (stairs/elevator) - array for multi-floor elevators
 * @property connections.down - Photo ID(s) when going down (stairs/elevator) - array for multi-floor elevators
 * @property hotspots - Clickable areas for vertical navigation (stairs/elevators)
 * @property nearbyRooms - Rooms visible or accessible from this photo location
 * @property buildingContext - Information about the building and floor context
 */
export interface Photo {
  id: string
  imageUrl: string
  position?: { lat: number; lng: number }

  connections: {
    forward?: string
    back?: string
    left?: string
    right?: string
    up?: string | string[]
    down?: string | string[]
    elevator?: string
  }

  hotspots?: NavigationHotspot[]

  nearbyRooms?: NearbyRoom[]
  buildingContext?: BuildingContext
}

/**
 * Describes a room that is visible from a photo location.
 * Used for providing context about what rooms/facilities are nearby.
 *
 * @property roomNumber - Room number or identifier (e.g., "204", "Library Study Room A")
 * @property roomType - Type of room for categorization and filtering
 */
export interface NearbyRoom {
  roomNumber: string
  roomType: 'classroom' | 'lab' | 'office' | 'facility' | 'restroom'
  // direction: string
  // distance: number
}

/**
 * Represents a clickable hotspot in a 360° photo for vertical navigation.
 * Only used for stairs/elevators where users need to click specific areas in the image.
 *
 * @property direction - Vertical navigation direction (up or down only)
 * @property position - 3D coordinates on the sphere (spherical coordinates)
 * @property position.theta - Horizontal rotation in degrees (0-360)
 * @property position.phi - Vertical rotation in degrees (0-180, where 90 is horizon)
 */
export interface NavigationHotspot {
  direction: 'up' | 'down' | 'elevator'
  position: {
    theta: number  // horizontal (0-360°)
    phi: number    // vertical (0-180°, 90 = horizon)
  }
}

/**
 * Provides location-specific contextual information within a photo location.
 * Building name and floor level are inherited from the parent Area.
 *
 * @property wing - Wing or section of the building if applicable (e.g., "north", "south")
 * @property facilities - Facilities and amenities visible from this specific location
 */
export interface BuildingContext {
  wing?: string
  facilities: string[]
}

/**
 * Represents a logical area containing connected photos that form a navigable space
 * through a building or area (e.g., a hallway, building connector, elevator lobby).
 *
 * @property id - Unique identifier for this area (e.g., "a-block-floor-1-main")
 * @property name - Building name (e.g., "A Block", "N Block", "S Block", "X Block")
 * @property photos - Ordered array of photos that make up this area
 * @property buildingBlock - Building block identifier
 * @property floorLevel - Primary floor level for this area
 */
export interface Area {
  id: string
  name: string
  photos: Photo[]
  buildingBlock: 'a' | 'n' | 's' | 'x'
  floorLevel: number
}

/**
 * Represents an elevator system that connects multiple floors within a building.
 * Elevators have their own interface separate from Areas to avoid property conflicts.
 *
 * @property id - Unique identifier for this elevator (e.g., "x-block-elevator")
 * @property name - Display name for the elevator (e.g., "X Block Elevator")
 * @property buildingBlock - Building block where this elevator is located
 * @property photo - Single 360° photo showing the elevator interior
 */
export interface Elevator {
  id: string
  name: string
  buildingBlock: 'a' | 'n' | 's' | 'x'
  photo: ElevatorPhoto
}

/**
 * Represents the interior view of an elevator with floor selection capabilities.
 * Contains connections to specific floors and hotspots for floor selection buttons.
 *
 * @property id - Unique identifier for this elevator photo
 * @property imageUrl - Path to the 360° elevator interior image
 * @property floorConnections - Direct connections to specific floor photos
 * @property floorConnections.floor1 - Photo ID for floor 1 destination
 * @property floorConnections.floor2 - Photo ID for floor 2 destination
 * @property floorConnections.floor3 - Photo ID for floor 3 destination
 * @property hotspots - Clickable floor selection buttons positioned in 3D space
 */
export interface ElevatorPhoto {
  id: string
  imageUrl: string
  floorConnections: {
    floor1?: string
    floor2?: string
    floor3?: string
  }
  hotspots?: ElevatorHotspot[]
}

/**
 * Represents a clickable floor selection button inside an elevator.
 * Positioned precisely on the elevator panel using spherical coordinates.
 *
 * @property floor - Floor number that this button represents
 * @property position - 3D coordinates on the sphere (spherical coordinates)
 * @property position.theta - Horizontal rotation in degrees (0-360)
 * @property position.phi - Vertical rotation in degrees (0-180, where 90 is horizon)
 */
export interface ElevatorHotspot {
  floor: number
  position: {
    theta: number  // horizontal (0-360°)
    phi: number    // vertical (0-180°, 90 = horizon)
  }
}