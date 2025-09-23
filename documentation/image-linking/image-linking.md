# VR Campus Tour Image Linking Implementation

## Overview

This document explains how we transformed a collection of 360° campus photos into a navigable VR tour experience. The system creates Google Street View-style navigation between photos using a structured data approach.

## What We Built

The tour system connects 360° photos from four building blocks (A, N, S, X) across multiple floors, creating seamless navigation paths between locations. Users can move forward/back through corridors, turn left/right at intersections, go up/down between floors, and use elevators.

## Directory Structure

```
src/data/
├── blocks/
│   ├── a_block/
│   │   ├── index.ts         # Exports all A Block areas
│   │   ├── floor1.ts        # Ground floor navigation
│   │   └── floor2.ts        # Second floor navigation
│   ├── x_block/
│   │   ├── index.ts         # Exports all X Block areas
│   │   ├── floor1.ts        # Ground floor with elevator access
│   │   ├── floor2.ts        # Second floor with branch corridors
│   │   ├── floor3.ts        # Third floor
│   │   └── elevator.ts      # X Block elevator system
│   ├── n_block/
│   │   ├── index.ts         # Exports all N Block areas
│   │   ├── floor1.ts        # Ground floor with branch corridor
│   │   └── floor2.ts        # Second floor with elevator access
│   ├── s_block/
│   │   ├── index.ts         # Exports all S Block areas
│   │   ├── floor1.ts        # Ground floor linear progression
│   │   └── floor2.ts        # Second floor linear progression
│   └── n_s_shared/
│       └── elevator.ts      # Shared N/S Block elevator
└── tourUtilities.ts         # Central export point
```

## Core Concepts

### 1. Areas and Photos

Each floor of each building is defined as an **Area** containing multiple **Photos**. Photos represent individual 360° images with navigation connections.

```typescript
// Example: A Block Floor 1 area definition
export const aBlockFloor1Area: Area = {
  id: 'a-block-floor-1-main',
  name: 'A Block',
  buildingBlock: 'a',
  floorLevel: 1,
  photos: [
    // Array of connected photo definitions
  ]
}
```

## TypeScript Interface Definitions

The tour system uses the following TypeScript interfaces defined in `src/types/tour.ts`:

### Photo Interface
```typescript
/**
 * Represents a directional navigation option with angle and destination.
 */
export interface DirectionDefinition {
  angle: number
  connection: string
}

/**
 * Represents a single 360° photo in the VR tour with navigation connections
 * and contextual information about the location.
 */
export interface Photo {
  id: string
  imageUrl: string
  startingAngle?: number
  directions: {
    forward?: DirectionDefinition
    back?: DirectionDefinition
    left?: DirectionDefinition
    right?: DirectionDefinition
    up?: string | string[]
    down?: string | string[]
    elevator?: string
  }

  hotspots?: NavigationHotspot[]
  nearbyRooms?: NearbyRoom[]
  buildingContext?: BuildingContext
}
```

### Supporting Interfaces
```typescript
/**
 * Describes a room that is visible from a photo location.
 */
export interface NearbyRoom {
  roomNumber: string
  roomType: 'classroom' | 'lab' | 'office' | 'facility' | 'restroom'
}

/**
 * Represents a clickable hotspot in a 360° photo for vertical navigation.
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
 */
export interface BuildingContext {
  wing?: string
  facilities: string[]
}

/**
 * Represents a logical area containing connected photos that form a navigable space.
 */
export interface Area {
  id: string
  name: string
  photos: Photo[]
  buildingBlock: 'a' | 'n' | 's' | 'x'
  floorLevel: number
}
```

### Elevator System Interfaces
```typescript
/**
 * Represents an elevator system that connects multiple floors within a building.
 */
export interface Elevator {
  id: string
  name: string
  buildingBlock: 'a' | 'n' | 's' | 'x'
  photo: ElevatorPhoto
}

/**
 * Represents the interior view of an elevator with floor selection capabilities.
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
 */
export interface ElevatorHotspot {
  floor: number
  position: {
    theta: number  // horizontal (0-360°)
    phi: number    // vertical (0-180°, 90 = horizon)
  }
}
```

### 2. Navigation Connections

Each photo defines how users can move to other photos using the unified directions interface:

```typescript
{
  id: 'a-f1-north-2',
  imageUrl: '/360_photos_compressed/a_block/floor_1/a_north_2.webp',
  startingAngle: 180,                                       // Start facing south (180°)
  directions: {
    forward: { angle: 0, connection: 'a-f1-north-3' },     // Move forward along corridor
    back: { angle: 180, connection: 'a-f1-north-1' },      // Move backward along corridor
    left: { angle: 270, connection: 'a-f1-side-branch' },  // Turn left at intersection
    up: 'a-f2-stairs'                                       // Go upstairs (simple string)
  }
}
```

### 3. Navigation Patterns

We established consistent patterns for different corridor types:

**Linear Corridors:** Forward/back progression
```typescript
photo1 → photo2 → photo3 → photo4
```

**Branch Corridors:** Left to enter, back to exit
```typescript
main-corridor → left → branch-photo → back → main-corridor
```

**Cross-Building Connections:** Forward/back between buildings
```typescript
building-a-end → forward → building-x-start
```

### 4. Contextual Information

Photos can include information about nearby rooms and facilities:

```typescript
{
  id: 'a-f1-north-entrance',
  imageUrl: '/360_photos_compressed/a_block/floor_1/a_north_entrance.webp',
  startingAngle: 180,                                       // Start facing south
  directions: {
    forward: { angle: 0, connection: 'a-f1-north-1' },
    left: { angle: 270, connection: 'a-f1-info-desk' }
  },
  nearbyRooms: [
    {
      roomNumber: 'A101',
      roomType: 'classroom'
    },
    {
      roomNumber: 'A102',
      roomType: 'lab'
    }
  ],
  buildingContext: {
    wing: 'north',
    facilities: ['main entrance', 'information desk']
  }
}
```

The `NearbyRooms` interface helps users understand what's accessible from their current location, while `buildingContext` provides broader area information.

### 5. Starting Camera Orientation

Each photo can specify an initial camera orientation using the `startingAngle` property:

```typescript
{
  id: 'a-f1-north-entrance',
  imageUrl: '/360_photos_compressed/a_block/floor_1/a_north_entrance.webp',
  startingAngle: 180,  // Start facing south (180 degrees)
  directions: {
    forward: { angle: 160, connection: 'a-f1-north-1' }
  }
}
```

**Angle Reference:**
- `0°` - North (default if not specified)
- `90°` - East
- `180°` - South
- `270°` - West

**Use Cases:**
- **Entrance Orientation**: When entering a building, face the interior rather than the entrance
- **Flow Direction**: Align with the expected movement direction through corridors
- **Contextual Views**: Show the most relevant view for each location's purpose

**Example: A Block Floor 1**
All A Block Floor 1 photos use `startingAngle: 180` to face south, creating a consistent orientation as users move through the building from north to south.

## Implementation Steps

### Step 1: Building Block Structure

Each building block follows the same organizational pattern:

1. **Floor Files:** Individual `.ts` files for each floor (floor1.ts, floor2.ts, etc.)
2. **Index File:** Aggregates all floors into a single export
3. **Elevator Files:** Separate files for elevator systems when applicable

### Step 2: Photo Linking Logic

Photos are linked using logical progression patterns:

**Example: N Block Floor 1 progression**
```
n_x_entry → n_east_1 → n_east_2 → n_east_5 → n_east_6 → n_mid_7 → n_west_8 → n_west_9
                         ↓
                    (branch corridor)
                    n_east_south_3 → n_east_south_4
```

### Step 3: Cross-Building Connections

Buildings connect at strategic points to create campus-wide navigation:

```typescript
// X Block to N Block connection
'x-f1-west-12' → forward → 'n-f1-x-entry'
'n-f1-x-entry' → back → 'x-f1-west-12'

// N Block to S Block connection
'n-f1-west-9' → forward → 's-f1-north-4'
's-f1-north-4' → back → 'n-f1-west-9'
```

### Step 4: Vertical Navigation

#### Stairs
Stairs provide direct floor-to-floor connections in A and X blocks:

```typescript
// A Block stair connection
{
  id: 'a-f1-north-3',
  directions: {
    forward: { angle: 0, connection: 'a-f1-mid-4' },
    back: { angle: 180, connection: 'a-f1-north-2' },
    up: 'a-f2-north-stairs-entrance'  // Direct stair access (simple string)
  },
  hotspots: [
    {
      direction: 'up',
      position: { theta: 270, phi: 60 }  // Visual stair location
    }
  ]
}

// Corresponding floor 2 connection
{
  id: 'a-f2-north-stairs-entrance',
  directions: {
    down: 'a-f1-north-3',  // Back down the stairs (simple string)
    forward: { angle: 0, connection: 'a-f2-mid-3' }
  },
  hotspots: [
    {
      direction: 'down',
      position: { theta: 180, phi: 135 }  // Downward stair visual
    }
  ]
}
```

#### Elevators
Elevators provide multi-floor access with visual floor selection:

```typescript
// N/S Block elevator connecting multiple floors
export const nsBlockElevator: Elevator = {
  id: 'ns-block-elevator',
  photo: {
    imageUrl: '/360_photos_compressed/n_s_block/inside_elevator.webp',
    floorConnections: {
      floor1: 'n-f1-mid-7',           // Ground floor access
      floor2: 'n-f2-elevator-entrance', // Second floor lobby
      floor4: 'ns-f4-placeholder'     // Future expansion
    },
    hotspots: [
      {
        floor: 1,
        position: { theta: 270, phi: 100 }  // Floor 1 button location
      },
      {
        floor: 2,
        position: { theta: 290, phi: 90 }   // Floor 2 button location
      }
    ]
  }
}
```

#### Hotspot Integration
Hotspots provide visual cues in the 360° images for interactive navigation. They're positioned using spherical coordinates (theta for horizontal rotation, phi for vertical angle):

```typescript
// Elevator access hotspot
hotspots: [
  {
    direction: 'elevator',
    position: { theta: 180, phi: 85 }  // Centered, slightly above horizon
  }
]

// Stair access hotspot
hotspots: [
  {
    direction: 'up',
    position: { theta: 90, phi: 55 }   // To the right, angled upward
  }
]
```

These hotspots render as clickable elements overlaid on the 360° image, allowing users to click directly on stairs, elevators, or floor buttons they can see.

### Step 5: Central Export System

All areas and elevators are exported through a single utility file:

```typescript
// tourUtilities.ts
export const getAllAreas = (): any[] => {
  return [
    ...aBlockAreas,
    ...xBlockAreas,
    ...nBlockAreas,
    ...sBlockAreas,
    nsBlockElevator
  ]
}
```

## Navigation Flow Examples

### Basic Corridor Movement
User starts at `a-f1-north-entrance` and moves forward through the building:
```
a-f1-north-entrance → forward → a-f1-north-1 → forward → a-f1-north-2 → forward → a-f1-north-3
```

### Branch Corridor Navigation
User encounters a side corridor and explores it:
```
a-f1-north-3 → left → a-f1-north-3-side → back → a-f1-north-3
```

### Cross-Building Navigation
User travels from X Block to N Block:
```
x-f1-west-12 → forward → n-f1-x-entry → forward → n-f1-east-1
```

### Stair Usage
User uses stairs to change floors in A Block:
```
a-f1-north-3 → up → a-f2-north-stairs-entrance → forward → a-f2-mid-3
```

### Elevator Usage
User uses elevator to change floors:
```
n-f1-mid-7 → elevator → ns-elevator-interior → floor2 → n-f2-elevator-entrance
```

## Key Design Decisions

### 1. Consistent Navigation Patterns
- **Forward/back:** Primary corridor movement
- **Left/right:** Intersection turns and branch access
- **Up/down:** Stair connections
- **Elevator:** Dedicated elevator access

### 2. Branch Corridor Logic
All branch corridors use the same pattern:
- Enter: `left` from main corridor
- Exit: `back` to main corridor (not `right`)

This creates intuitive navigation where users "back out" of dead-end areas.

### 3. Building Context
Photos include contextual information about their location:

```typescript
buildingContext: {
  wing: 'north',
  facilities: ['main entrance', 'information desk']
}
```

## Testing Navigation

When testing the system:

1. **Verify connections:** Ensure all forward/back pairs are bidirectional
2. **Test branch corridors:** Confirm left/back pattern works correctly
3. **Check cross-building links:** Verify building transitions function
4. **Test elevators:** Ensure floor connections work properly
5. **Validate hotspots:** Confirm 3D coordinates align with visual elements

## Performance Considerations

- **Lazy loading:** Images load only when navigated to
- **Lean data:** Photos contain only navigation data, not heavy metadata
- **Efficient lookup:** Connection IDs allow fast photo retrieval

This structure creates a scalable, maintainable system that can grow with the campus while providing intuitive navigation for users.