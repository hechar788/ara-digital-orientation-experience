// VR Campus Tour Type Definitions
// Shared TypeScript interfaces for tour navigation system

/**
 * Unified direction type for VR tour navigation
 *
 * Represents all possible navigation directions in the VR campus tour system.
 * Supports 8-directional movement (cardinal + diagonal) for precise navigation.
 * Used consistently across navigation functions to ensure type safety.
 *
 * @type DirectionType
 */
export type DirectionType = 'forward' | 'forwardRight' | 'right' | 'backRight' | 'back' | 'backLeft' | 'left' | 'forwardLeft' | 'up' | 'down' | 'elevator' | 'door' | 'floor1' | 'floor2' | 'floor3' | 'floor4'

/**
 * Represents a directional navigation option with just the connection.
 * The angle is automatically calculated based on the direction name and startingAngle.
 *
 * @property connection - Photo ID to navigate to when button is clicked
 */
export interface DirectionDefinition {
  connection: string
}

/**
 * Direction angle offsets relative to startingAngle (in degrees)
 * Used to automatically calculate button placement angles
 *
 * @constant
 */
export const DIRECTION_ANGLES: Record<string, number> = {
  forward: 0,
  forwardRight: 45,
  right: 90,
  backRight: 135,
  back: 180,
  backLeft: 225,
  left: 270,
  forwardLeft: 315
}

/**
 * Represents a single 360° photo in the VR tour with navigation connections
 * and contextual information about the location.
 *
 * @property id - Unique identifier for this photo (e.g., "a-f1-north-entrance")
 * @property imageUrl - Path to the 360° image file
 * @property startingAngle - Initial camera orientation angle in degrees (0-360, where 0 is north)
 * @property directions - Unified direction definitions with angles and connections
 * @property directions.forward - Forward navigation with angle and destination
 * @property directions.back - Backward navigation with angle and destination
 * @property directions.left - Left navigation with angle and destination
 * @property directions.right - Right navigation with angle and destination
 * @property directions.up - Photo ID(s) when going up (stairs/elevator) - array for multi-floor elevators
 * @property directions.down - Photo ID(s) when going down (stairs/elevator) - array for multi-floor elevators
 * @property directions.elevator - Photo ID(s) for elevator access - array for multiple elevators
 * @property directions.door - Photo ID(s) for door access - array for multiple doors
 * @property directions.floor1 - Photo ID for floor 1 destination (elevator interiors only)
 * @property directions.floor2 - Photo ID for floor 2 destination (elevator interiors only)
 * @property directions.floor3 - Photo ID for floor 3 destination (elevator interiors only)
 * @property directions.floor4 - Photo ID for floor 4 destination (elevator interiors only)
 * @property hotspots - Clickable areas for vertical navigation (stairs/elevators)
 * @property nearbyRooms - Rooms visible or accessible from this photo location
 * @property buildingContext - Information about the building and floor context
 */
export interface Photo {
  id: string
  imageUrl: string
  startingAngle?: number
  directions: {
    forward?: DirectionDefinition
    forwardRight?: DirectionDefinition
    right?: DirectionDefinition
    backRight?: DirectionDefinition
    back?: DirectionDefinition
    backLeft?: DirectionDefinition
    left?: DirectionDefinition
    forwardLeft?: DirectionDefinition
    up?: string | string[]
    down?: string | string[]
    elevator?: string | string[]
    door?: string | string[]
    floor1?: string
    floor2?: string
    floor3?: string
    floor4?: string
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
 * Only used for stairs/elevators/doors where users need to click specific areas in the image.
 *
 * @property direction - Navigation direction type
 * @property position - 3D coordinates on the sphere (Cartesian coordinates)
 * @property position.x - X coordinate in 3D space
 * @property position.y - Y coordinate in 3D space
 * @property position.z - Z coordinate in 3D space
 * @property destination - Optional specific photo ID for this hotspot (overrides direction-based lookup)
 */
export interface NavigationHotspot {
  direction: 'up' | 'down' | 'elevator' | 'door'
  position: {
    x: number  // X coordinate in 3D space
    y: number  // Y coordinate in 3D space
    z: number  // Z coordinate in 3D space
  }
  destination?: string  // Specific photo ID this hotspot leads to
}

/**
 * Represents a hidden location hotspot for The Amazing Race game mode.
 * These collectible locations only appear during race mode and award points when discovered.
 *
 * Stored centrally in hiddenLocations.ts and injected at runtime based on photoId,
 * maintaining separation of concerns from tour navigation data.
 *
 * @property id - Unique identifier for this hidden location
 * @property name - Display name shown in congratulations dialog (e.g., "Dean's Office")
 * @property description - Descriptive subtitle providing context about the location
 * @property photoId - ID of the photo where this hidden location should be rendered
 * @property position - 3D coordinates on the sphere (Cartesian coordinates)
 * @property position.x - X coordinate in 3D space
 * @property position.y - Y coordinate in 3D space
 * @property position.z - Z coordinate in 3D space
 */
export interface HiddenLocationHotspot {
  id: string
  name: string
  description: string
  photoId: string
  position: {
    x: number  // X coordinate in 3D space
    y: number  // Y coordinate in 3D space
    z: number  // Z coordinate in 3D space
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
  buildingBlock: 'a' | 'n' | 's' | 'x' | 'w' | 'outside' | 'library' | 'lounge'
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
  buildingBlock: 'a' | 'n' | 's' | 'x' | 'outside' | 'library'
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
    floor4?: string
  }
  hotspots?: ElevatorHotspot[]
}

/**
 * Represents a clickable floor selection button inside an elevator.
 * Positioned precisely on the elevator panel using 3D coordinates.
 *
 * @property floor - Floor number that this button represents
 * @property position - 3D coordinates on the sphere (Cartesian coordinates)
 * @property position.x - X coordinate in 3D space
 * @property position.y - Y coordinate in 3D space
 * @property position.z - Z coordinate in 3D space
 */
export interface ElevatorHotspot {
  floor: number
  position: {
    x: number  // X coordinate in 3D space
    y: number  // Y coordinate in 3D space
    z: number  // Z coordinate in 3D space
  }
}