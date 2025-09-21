# VR Campus Tour Photo Linking Strategy

## Overview
This document outlines how to link the existing 360° photos in `@public\360_photos_compressed\` into a cohesive VR campus tour with Google Street View-style navigation. The photos are organized across three main building blocks (A, N/S, X) with multiple floors and need directional connections for seamless exploration.

## Current Photo Structure Analysis

### A Block
```
a_block/
├── floor_1/
│   ├── a_mid_4.webp           # Corridor middle section
│   ├── a_mid_5.webp           # Corridor middle section
│   ├── a_north_1.webp         # North wing entrance
│   ├── a_north_2.webp         # North wing corridor
│   ├── a_north_3.webp         # North wing mid-point
│   ├── a_north_3_side.webp    # North wing side view
│   ├── a_north_entrance.webp  # Main north entrance
│   └── a_south.webp           # South wing area
└── floor_2/
    ├── a_mid_3.webp           # Corridor middle section
    ├── a_mid_4.webp           # Corridor middle section
    ├── a_north_1.webp         # North wing entrance
    ├── a_north_2.webp         # North wing corridor
    ├── a_north_stairs_entrance.webp # Stairs access point
    └── a_south_5.webp         # South wing area
```

### N/S Block
```
n_s_block/
├── inside_elevator.webp                    # Elevator interior
├── n_s_2nd_floor_elevators_entrance.webp  # 2nd floor elevator lobby
├── n_block/                               # North section photos
└── s_block/                               # South section photos
```

### X Block
```
x_block/
├── floor_1/        # Ground floor photos
├── floor_2/        # Second floor photos
├── floor_3/        # Third floor photos
└── x_elevator.webp # Elevator access
```

## Photo Linking Strategy

### Core Navigation Principles
1. **Linear Progression**: Forward/back movement along hallways
2. **Intersection Branching**: Left/right options at corridor junctions
3. **Vertical Navigation**: Elevator/stairs connections between floors
4. **Cross-Building Links**: Connections between A, N/S, and X blocks
5. **Destination Jumping**: Direct access to key locations

## Data Structure Design

### Photo Interface
```typescript
// src/types/tour.ts

export interface Photo {
  id: string
  imageUrl: string
  position?: { lat: number; lng: number }

  connections: {
    forward?: string    // Next photo in sequence
    back?: string      // Previous photo in sequence
    left?: string      // Left turn option (at intersections)
    right?: string     // Right turn option (at intersections)
    up?: string | string[]        // Stairs/elevator up (array for multi-floor elevators)
    down?: string | string[]      // Stairs/elevator down (array for multi-floor elevators)
  }

  // 3D hotspots for clickable navigation (stairs/elevators only)
  hotspots?: NavigationHotspot[]

  // Context information
  nearbyRooms?: NearbyRoom[]
  buildingContext?: BuildingContext
}

export interface NearbyRoom {
  roomNumber: string
  roomType: 'classroom' | 'lab' | 'office' | 'facility' | 'restroom'
  // direction: string
  // distance: number
}

export interface NavigationHotspot {
  direction: 'up' | 'down'  // Only vertical navigation
  position: {
    theta: number  // horizontal rotation (0-360°)
    phi: number    // vertical rotation (0-180°, 90 = horizon)
  }
}

export interface BuildingContext {
  wing?: string // "north", "south", "east", "west"
  facilities: string[] // "restrooms", "water fountain", "emergency exits"
}
```

### Area Definitions
```typescript
export interface Area {
  id: string
  name: string  // Building name only (e.g., "A Block", "N Block", "S Block", "X Block")
  photos: Photo[]
  buildingBlock: 'a' | 'n' | 's' | 'x'
  floorLevel: number
}
```

### Destination Mapping
```typescript
// src/data/destinationData.ts

export interface Destination {
  id: string
  name: string
  imageUrl: string
  description: string
  category: 'entrance' | 'elevator' | 'corridor' | 'intersection' | 'facility'
  buildingBlock: 'a' | 'n' | 's' | 'x'
  floorLevel: number

  // Navigation shortcuts
  quickAccess: boolean // Show in main navigation menu
  searchKeywords: string[] // For room/location search
}
```

## Concrete Photo Linking Examples

### A Block Floor 1 Area
```typescript
// A Block Floor 1 Main Corridor Area
export const aBlockFloor1Area: Area = {
  id: 'a-block-floor-1-main',
  name: 'A Block',
  buildingBlock: 'a',
  floorLevel: 1,
  photos: [
    {
      id: 'a-f1-north-entrance',
      imageUrl: '/360_photos_compressed/a_block/floor_1/a_north_entrance.webp',
      connections: {
        forward: 'a-f1-north-1'
      },
      buildingContext: {
        wing: 'north',
        facilities: ['main entrance', 'information desk']
      }
    },
    {
      id: 'a-f1-north-1',
      imageUrl: '/360_photos_compressed/a_block/floor_1/a_north_1.webp',
      connections: {
        forward: 'a-f1-north-2',
        back: 'a-f1-north-entrance'
      }
    },
    {
      id: 'a-f1-north-2',
      imageUrl: '/360_photos_compressed/a_block/floor_1/a_north_2.webp',
      connections: {
        forward: 'a-f1-north-3',
        back: 'a-f1-north-1',
        right: 'a-f1-north-3-side' // Side corridor option
      }
    },
    {
      id: 'a-f1-north-3',
      imageUrl: '/360_photos_compressed/a_block/floor_1/a_north_3.webp',
      connections: {
        forward: 'a-f1-mid-4',
        back: 'a-f1-north-2',
        left: 'a-f1-north-3-side'
      }
    },
    {
      id: 'a-f1-mid-4',
      imageUrl: '/360_photos_compressed/a_block/floor_1/a_mid_4.webp',
      connections: {
        forward: 'a-f1-mid-5',
        back: 'a-f1-north-3',
        up: 'a-f2-mid-4' // Stairs to floor 2
      },
      hotspots: [
        {
          direction: 'up',
          position: { theta: 90, phi: 45 }  // Stairs on the right side
        }
      ]
    },
    {
      id: 'a-f1-mid-5',
      imageUrl: '/360_photos_compressed/a_block/floor_1/a_mid_5.webp',
      connections: {
        forward: 'a-f1-south',
        back: 'a-f1-mid-4'
      }
    },
    {
      id: 'a-f1-south',
      imageUrl: '/360_photos_compressed/a_block/floor_1/a_south.webp',
      connections: {
        back: 'a-f1-mid-5',
        // Potential connection to N/S block or other areas
      },
      buildingContext: {
        wing: 'south',
        facilities: ['restrooms', 'water fountain']
      }
    }
  ]
}
```

### Cross-Building Connections
```typescript
// Connecting A Block to N/S Block
export const crossBuildingConnections: Area[] = [
  {
    id: 'a-to-ns-connector',
    name: 'A Block to N/S Block Connector',
    buildingBlock: 'a',
    floorLevel: 1,
    photos: [
      {
        id: 'a-ns-connector-1',
        sequence: 1,
        imageUrl: '/360_photos_compressed/a_block/floor_1/a_south.webp',
        floorLevel: 1,
        buildingBlock: 'a',
        connections: {
          forward: 'ns-entrance-from-a',
          back: 'a-f1-mid-5'
        }
      },
      {
        id: 'ns-entrance-from-a',
          imageUrl: '/360_photos_compressed/n_s_block/n_s_2nd_floor_elevators_entrance.webp',
        connections: {
          back: 'a-ns-connector-1',
          forward: 'ns-elevator-lobby',
          left: 'ns-north-block',
          right: 'ns-south-block'
        }
      }
    ]
  }
]
```

### Elevator Navigation System
```typescript
// N/S Block Elevator System
export const elevatorNavigation: Area = {
  id: 'ns-block-elevator-system',
  name: 'N Block',
  buildingBlock: 'n',
  floorLevel: 2,
  photos: [
    {
      id: 'ns-elevator-lobby',
      sequence: 1,
      imageUrl: '/360_photos_compressed/n_s_block/n_s_2nd_floor_elevators_entrance.webp',
      connections: {
        forward: 'ns-elevator-interior',
        left: 'ns-north-wing',
        right: 'ns-south-wing',
        back: 'a-ns-connector-1' // Back to A block
      },
      hotspots: [
        {
          direction: 'up',
          position: { theta: 0, phi: 90 }  // Elevator in center
        }
      ]
    },
    {
      id: 'ns-elevator-interior',
      imageUrl: '/360_photos_compressed/n_s_block/inside_elevator.webp',
      connections: {
        back: 'ns-elevator-lobby',
        up: ['x-block-floor-2', 'x-block-floor-3'], // Multi-floor elevator
        down: 'x-block-floor-1'
      },
      hotspots: [
        {
          direction: 'up',
          position: { theta: 90, phi: 60 }  // Floor selection buttons
        },
        {
          direction: 'down',
          position: { theta: 90, phi: 120 } // Ground floor button
        }
      ]
    }
  ]
}
```

## Navigation Logic Implementation

### How Hotspot Navigation Works

The VR tour uses a two-layer navigation system that seamlessly connects visual interactions with data-driven movement. When a user views a 360° photo, the system automatically renders clickable hotspots for any available vertical navigation options (stairs and elevators).

**The Navigation Flow:**

1. **Hotspot Detection**: The frontend examines the current photo's `hotspots` array and finds any vertical navigation options. For example, if viewing the A Block Floor 1 north area near the stairs, it detects an "up" hotspot.

2. **Visual Rendering**: Each hotspot is rendered as a clickable element positioned precisely in 3D space using the provided spherical coordinates (theta and phi values). This creates an intuitive experience where users click directly on stairs or elevator doors they can see in the image.

3. **User Interaction**: When a user clicks a hotspot, the system captures the hotspot's direction (either "up" or "down") and passes it to the navigation handler.

4. **Connection Lookup**: The navigation system uses the hotspot's direction to look up the corresponding connection in the current photo's `connections` object. For instance, clicking an "up" hotspot triggers a lookup of `connections.up` to find the destination photo ID.

5. **Photo Transition**: The system navigates to the target photo by loading its 360° image and updating the current location. The user seamlessly moves between floors as if they physically used the stairs or elevator.

This approach ensures that every visual hotspot corresponds to a real navigation path, while keeping the interaction natural and intuitive. Users don't need to understand the underlying data structure - they simply click on what they see and the system handles the logical navigation automatically.

### Movement Handler
```typescript
// src/hooks/useTourNavigation.ts

export function useTourNavigation() {
  const [currentPhotoId, setCurrentPhotoId] = useState<string>('')

  const getCurrentPhoto = useCallback((photoId: string): Photo | null => {
    // Search through all areas to find the photo
    for (const area of allAreas) {
      const photo = area.photos.find(p => p.id === photoId)
      if (photo) return photo
    }
    return null
  }, [])

  const navigateDirection = useCallback((direction: 'forward' | 'back' | 'left' | 'right' | 'up' | 'down') => {
    const currentPhoto = getCurrentPhoto(currentPhotoId)
    if (!currentPhoto) return

    const nextPhotoId = currentPhoto.connections[direction]
    if (nextPhotoId) {
      setCurrentPhotoId(nextPhotoId)
    }
  }, [currentPhotoId, getCurrentPhoto])

  const jumpToDestination = useCallback((destinationId: string) => {
    const destination = destinations.find(d => d.id === destinationId)
    if (destination) {
      setCurrentPhotoId(destination.id)
    }
  }, [])

  return {
    currentPhotoId,
    navigateDirection,
    jumpToDestination,
    getCurrentPhoto
  }
}
```

## UI Integration

### Navigation Controls Component
```typescript
// src/components/viewer/NavigationControls.tsx

interface NavigationControlsProps {
  currentPhoto: Photo | null
  onNavigate: (direction: string) => void
  isLoading: boolean
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  currentPhoto,
  onNavigate,
  isLoading
}) => {
  if (!currentPhoto) return null

  const { connections } = currentPhoto

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
      {/* Back Button */}
      {connections.back && (
        <button
          onClick={() => onNavigate('back')}
          className="p-3 bg-white/90 rounded-full shadow-lg hover:bg-white"
          disabled={isLoading}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      )}

      {/* Forward Button */}
      {connections.forward && (
        <button
          onClick={() => onNavigate('forward')}
          className="p-3 bg-white/90 rounded-full shadow-lg hover:bg-white"
          disabled={isLoading}
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      )}

      {/* Left Turn */}
      {connections.left && (
        <button
          onClick={() => onNavigate('left')}
          className="p-3 bg-white/90 rounded-full shadow-lg hover:bg-white"
          disabled={isLoading}
        >
          <ArrowLeft className="w-6 h-6 transform rotate-90" />
        </button>
      )}

      {/* Right Turn */}
      {connections.right && (
        <button
          onClick={() => onNavigate('right')}
          className="p-3 bg-white/90 rounded-full shadow-lg hover:bg-white"
          disabled={isLoading}
        >
          <ArrowRight className="w-6 h-6 transform rotate-90" />
        </button>
      )}

      {/* Floor Navigation */}
      <div className="flex flex-col gap-1">
        {connections.up && (
          <button
            onClick={() => onNavigate('up')}
            className="p-2 bg-blue-500/90 rounded shadow-lg hover:bg-blue-600 text-white"
            disabled={isLoading}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}
        {connections.down && (
          <button
            onClick={() => onNavigate('down')}
            className="p-2 bg-blue-500/90 rounded shadow-lg hover:bg-blue-600 text-white"
            disabled={isLoading}
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
```

### Location Menu Component
```typescript
// src/components/viewer/LocationMenu.tsx

interface LocationMenuProps {
  destinations: Destination[]
  currentLocation: string | null
  onSelectDestination: (destinationId: string) => void
}

export const LocationMenu: React.FC<LocationMenuProps> = ({
  destinations,
  currentLocation,
  onSelectDestination
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const destinationsByBuilding = useMemo(() => {
    return destinations.reduce((acc, dest) => {
      const building = dest.buildingBlock.toUpperCase()
      if (!acc[building]) acc[building] = []
      acc[building].push(dest)
      return acc
    }, {} as Record<string, Destination[]>)
  }, [destinations])

  return (
    <div className="absolute top-6 right-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-white/90 rounded-full shadow-lg hover:bg-white"
      >
        <MapPin className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl max-h-96 overflow-y-auto">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Jump to Location</h3>
          </div>

          {Object.entries(destinationsByBuilding).map(([building, dests]) => (
            <div key={building} className="p-4 border-b last:border-b-0">
              <h4 className="font-medium mb-2">{building} Block</h4>
              <div className="space-y-1">
                {dests.map(dest => (
                  <button
                    key={dest.id}
                    onClick={() => {
                      onSelectDestination(dest.id)
                      setIsOpen(false)
                    }}
                    className={`w-full text-left p-2 rounded hover:bg-gray-100 ${
                      currentLocation === dest.id ? 'bg-blue-100' : ''
                    }`}
                  >
                    <div className="font-medium">{dest.name}</div>
                    <div className="text-sm text-gray-600">Floor {dest.floorLevel}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

## Implementation Steps

### Phase 1: Data Setup (2-3 hours)
1. **Create area data files**:
   - `src/data/areaData.ts` - Photo sequences and connections
   - `src/data/destinationData.ts` - Key locations and jump points
   - `src/data/mapCoordinates.ts` - Minimap positioning

2. **Map all existing photos** into area structures:
   - A Block Floor 1 & 2 areas
   - N/S Block elevator and wing areas
   - X Block multi-floor areas
   - Cross-building connector areas
   - Add 3D hotspot coordinates for stairs/elevators

### Phase 2: Navigation Logic (2-3 hours)
3. **Implement navigation system**:
   - Direction-based movement (forward/back/left/right/up/down)
   - Photo transition handling

4. **Create destination jumping**:
   - Direct location access
   - Building and floor categorization
   - Search functionality

### Phase 3: UI Integration (1-2 hours)
5. **Update components**:
   - Enhanced `PanoramicViewer` with Three.js hotspot integration
   - Click handling for 3D positioned hotspots (stairs/elevators)
   - Traditional UI controls for forward/back/left/right navigation
   - Location menu with building/floor organization
   - Loading states and transitions

### Phase 4: Testing & Polish (1 hour)
6. **Test navigation flows**:
   - Complete building traversals
   - Cross-building movements
   - Elevator/floor transitions
   - All directional connections

## Testing Strategy

### Navigation Flow Tests
1. **A Block Traversal**: North entrance → South wing → Floor 2 via clickable stair hotspots
2. **Cross-Building**: A Block → N/S Block → Elevator → X Block floors
3. **Floor Navigation**: Ground floor → All upper floors via clickable elevator hotspots
4. **Intersection Handling**: Left/right turns using UI controls or mouse drag
5. **Destination Jumping**: Direct access to key locations from any position
6. **Hotspot Accuracy**: Verify 3D coordinates align with visual elements in images

### Edge Cases
- Dead-end corridors (only back navigation available)
- Single-direction connections (one-way paths)
- Missing photo connections (graceful fallback)
- Multi-floor elevator hotspots (array handling)
- Building entrance/exit points
- Hotspot positioning edge cases (behind user, outside view)

## Benefits of This Approach

- **Seamless Navigation**: Google Street View-style movement between photos
- **Intuitive 3D Interaction**: Click directly on stairs/elevators in 360° images
- **Clear Data Structure**: Areas define spatial context, photos handle navigation connections
- **Efficient Organization**: Photos contain only navigation data, inheriting context from parent area
- **Flexible Connections**: Support for all navigation patterns (linear, branching, vertical)
- **Multi-Floor Elevators**: Array support for elevators serving multiple floors
- **Scalable Design**: Easy to add new photos and areas
- **Rich Context**: Room information and building details when needed
- **Multiple Access Methods**: Both 3D hotspots and traditional UI controls
- **Performance Optimized**: Lean data structure for fast loading and navigation

This linking strategy transforms your existing 360° photos into an immersive, navigable VR campus tour experience.