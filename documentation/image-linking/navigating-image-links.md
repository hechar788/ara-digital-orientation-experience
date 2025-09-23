# Navigating Image Links - Simple Interface Consolidation

## Current Problem Statement

The VR campus tour has separate `customDirections` and `connections` objects that need to be kept in sync manually:

```typescript
// Current approach - two separate objects
{
  id: 'x-f2-east-13',
  customDirections: {
    forward: 270,
    back: 0
  },
  connections: {
    back: 'x-f2-east-12',
    forward: 'a-f2-south-5',
    down: 'x-f1-east-2'
  }
}
```

This creates maintenance overhead and potential for misalignment between visual direction and navigation destination.

## Proposed Solution: Unified Directions Interface

### New Interface Design
Combine angle and connection information into a single `directions` object:

```typescript
interface DirectionDefinition {
  angle: number
  connection: string
}

interface Photo {
  id: string
  imageUrl: string
  directions: {
    forward?: DirectionDefinition
    back?: DirectionDefinition
    left?: DirectionDefinition
    right?: DirectionDefinition
    up?: string | string[]  // Simple connection for vertical navigation
    down?: string | string[] // Simple connection for vertical navigation
    elevator?: string
  }
  hotspots?: NavigationHotspot[]
  nearbyRooms?: NearbyRoom[]
  buildingContext?: BuildingContext
}
```

### Example Implementation
```typescript
{
  id: 'x-f2-east-13',
  imageUrl: '/360_photos_compressed/x_block/floor_2/x_east_13.webp',
  directions: {
    forward: { angle: 270, connection: 'a-f2-south-5' },
    back: { angle: 0, connection: 'x-f2-east-12' },
    down: 'x-f1-east-2'  // Vertical navigation remains simple
  },
  hotspots: [
    {
      direction: 'down',
      position: { theta: 270, phi: 120 }
    }
  ],
  buildingContext: {
    wing: 'east',
    facilities: ['classrooms', 'offices']
  }
}
```

## Implementation Benefits

### Developer Experience
- **Single Source of Truth**: Angle and connection defined together
- **Reduced Errors**: No misalignment between direction and destination
- **Clearer Intent**: Each direction clearly shows where it leads
- **Easier Maintenance**: Changes require updating only one place

### Code Simplification
The `DirectionalNavigation` component becomes simpler:

```typescript
// Before - needed to check both objects
const showForward = connections.forward && isLookingInDirection(cameraLon, 'forward', orientationOffset, customDirections)

// After - single object with all info
const forwardDirection = currentPhoto.directions.forward
const showForward = forwardDirection && isLookingInDirection(cameraLon, 'forward', 0, { forward: forwardDirection.angle })
```

### Future Arrow Icon Support
With angles stored alongside connections, transitioning to arrow icons becomes straightforward:

```typescript
function renderDirectionButton(direction: DirectionDefinition, type: 'forward' | 'back' | 'left' | 'right') {
  return (
    <ArrowButton
      rotation={direction.angle}
      onClick={() => navigateTo(direction.connection)}
      label={`Go ${type}`}
    />
  )
}
```

## Migration Strategy

### Phase 1: Update Type Definitions
- Modify `Photo` interface in `src/types/tour.ts`
- Add `DirectionDefinition` interface
- Keep existing interfaces for backwards compatibility

### Phase 2: Update Photo Definitions
- Convert existing photos to new format:
  ```typescript
  // From
  customDirections: { forward: 180, back: 0 }
  connections: { forward: 'next-photo', back: 'prev-photo' }

  // To
  directions: {
    forward: { angle: 180, connection: 'next-photo' },
    back: { angle: 0, connection: 'prev-photo' }
  }
  ```

### Phase 3: Update Navigation Component
- Modify `DirectionalNavigation.tsx` to use new format
- Update `isLookingInDirection` function calls
- Remove old `customDirections`/`connections` logic

### Phase 4: Cleanup
- Remove deprecated interface properties
- Update documentation
- Clean up any remaining references

## Implementation Example

```typescript
// src/types/tour.ts
export interface DirectionDefinition {
  angle: number
  connection: string
}

export interface Photo {
  id: string
  imageUrl: string
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

// src/components/tour/DirectionalNavigation.tsx
function getDirectionInfo(photo: Photo, direction: 'forward' | 'back' | 'left' | 'right') {
  const directionDef = photo.directions[direction]
  return directionDef ? {
    connection: directionDef.connection,
    angle: directionDef.angle
  } : null
}
```

## Timeline

### Day 1: Interface Updates
- Update type definitions
- Ensure backwards compatibility

### Day 2: Photo Data Migration
- Convert A Block photos to new format
- Convert X Block photos to new format
- Test navigation functionality

### Day 3: Component Updates
- Update DirectionalNavigation component
- Test all navigation flows
- Fix any issues

### Day 4: Cleanup & Documentation
- Remove deprecated properties
- Update documentation
- Final testing

## Benefits Summary

1. **Simplified Maintenance**: One object instead of two
2. **Clearer Intent**: Direction and destination coupled together
3. **Reduced Errors**: No sync issues between separate objects
4. **Future-Ready**: Easy transition to arrow icons
5. **Better DX**: More intuitive for developers adding new photos

This approach maintains the current functionality while providing a cleaner, more maintainable interface structure.