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

### 2. Navigation Connections

Each photo defines how users can move to other photos using directional connections:

```typescript
{
  id: 'a-f1-north-2',
  imageUrl: '/360_photos_compressed/a_block/floor_1/a_north_2.webp',
  connections: {
    forward: 'a-f1-north-3',    // Move forward along corridor
    back: 'a-f1-north-1',       // Move backward along corridor
    left: 'a-f1-side-branch',   // Turn left at intersection
    up: 'a-f2-stairs'           // Go upstairs
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
  connections: { /* navigation */ },
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
  connections: {
    forward: 'a-f1-mid-4',
    back: 'a-f1-north-2',
    up: 'a-f2-north-stairs-entrance'  // Direct stair access
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
  connections: {
    down: 'a-f1-north-3',  // Back down the stairs
    forward: 'a-f2-mid-3'
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