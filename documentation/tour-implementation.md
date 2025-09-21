# VR Campus Tour Navigation Implementation

## Goal
Transform the single 360° panorama viewer into a Google Street View-style campus tour with directional navigation along main footpaths, plus direct jump-to-location functionality for specific destinations and room-level navigation.

## Approach: Hybrid Navigation System
- **Street View Navigation**: Directional arrows (forward/back/left/right) along main campus routes
- **Jump-to-Location**: Menu/map access to specific destinations from existing 23 photos
- **Direct Room Navigation**: Instant jumping to specific classroom and facility locations

## Phase 1: Photo Collection Strategy

### Main Route Photography (60-100 new photos needed)
1. **Map main footpaths and hallways**: Primary routes students use daily
2. **Systematic photo capture**: Every 5-10 steps (~10-20 feet) along these routes for Google Street View-style density
3. **Key routes to cover**:
   - Madras Street entrance → Information Hub → Courtyard (main spine)
   - Primary hallway connections between buildings (including room-level coverage)
   - Main outdoor pathways connecting key areas
   - Indoor building navigation routes to major rooms/facilities
4. **Photo guidelines**:
   - Face direction of path flow
   - Consistent height and positioning
   - Include room doors and signage in hallway photos
   - Note GPS/sketch simple route map with room locations

### Enhanced Route Data Structure
```typescript
// src/data/routeData.ts

export interface RoutePhoto {
  id: string
  routeId: string
  sequence: number
  imageUrl: string
  position: { lat?: number; lng?: number }
  connections: {
    forward?: string
    back?: string
    left?: string  // Only at intersections
    right?: string // Only at intersections
  }
  // NEW: Room and facility data
  nearbyRooms?: NearbyRoom[]
  buildingContext?: BuildingContext
  floorLevel?: number
}

export interface NearbyRoom {
  roomNumber: string
  roomType: 'classroom' | 'lab' | 'office' | 'facility' | 'restroom'
  direction: string // "door on left", "3rd door right", "end of hall"
  distance: number // steps from photo location
  isVisible: boolean // true if door is visible in photo
  department?: string
  capacity?: number
  equipment?: string[]
}

export interface BuildingContext {
  buildingName: string
  floor: number
  wing?: string // "east wing", "north section"
  facilities: string[] // "restrooms", "elevator", "stairs", "water fountain"
  accessibility: string[] // "elevator access", "ramp available"
  emergencyInfo: string[] // "emergency exit left", "fire alarm location"
}

export interface Route {
  id: string
  name: string
  photos: RoutePhoto[]
  startPoint: string
  endPoint: string
  routeType: 'outdoor' | 'indoor' | 'mixed'
  buildingAccess?: string[] // Which buildings this route provides access to
}

// Example enhanced route structure
export const mainRoutes: Route[] = [
  {
    id: 'science-building-floor-2',
    name: 'Science Building 2nd Floor Hallway',
    routeType: 'indoor',
    buildingAccess: ['science-building'],
    photos: [
      {
        id: 'science-2f-east-001',
        routeId: 'science-building-floor-2',
        sequence: 1,
        imageUrl: '/360_photos/routes/science_2f_east_001.360.JPG',
        floorLevel: 2,
        connections: { 
          forward: 'science-2f-east-002',
          left: 'science-2f-stairs-001'
        },
        nearbyRooms: [
          {
            roomNumber: '201',
            roomType: 'classroom',
            direction: 'first door on right',
            distance: 3,
            isVisible: true,
            department: 'Biology',
            capacity: 25
          },
          {
            roomNumber: '202',
            roomType: 'lab',
            direction: 'second door on right', 
            distance: 8,
            isVisible: true,
            department: 'Chemistry',
            equipment: ['fume hoods', 'lab benches', 'safety equipment']
          }
        ],
        buildingContext: {
          buildingName: 'Science Building',
          floor: 2,
          wing: 'east wing',
          facilities: ['restrooms', 'water fountain', 'fire extinguisher'],
          accessibility: ['elevator access from lobby'],
          emergencyInfo: ['emergency exit at end of hall']
        }
      }
      // ... more photos every 5-10 steps
    ],
    startPoint: 'science-building-entrance',
    endPoint: 'science-building-floor-2-end'
  }
]
```

### Enhanced Destination Data Structure
```typescript
// src/data/destinationData.ts

export interface Destination {
  id: string
  name: string
  imageUrl: string
  description: string
  category: 'entrance' | 'building' | 'facility' | 'outdoor' | 'room'
  accessibleFromRoutes: string[] // Which routes connect to this destination
  // NEW: Room-specific data
  roomDetails?: {
    roomNumber: string
    building: string
    floor: number
    roomType: 'classroom' | 'lab' | 'office' | 'common' | 'service'
    capacity?: number
    equipment?: string[]
    department?: string
    courses?: string[] // Classes typically held here
    hours?: string // Access hours
    reservationRequired?: boolean
  }
  buildingInfo?: {
    floors: number
    departments: string[]
    facilities: string[]
    accessibility: string[]
    parking: string[]
  }
}

// Enhanced existing photos as destinations + new room-specific destinations
export const destinations: Destination[] = [
  // Existing 23 photos enhanced
  {
    id: 'madras-entrance',
    name: 'Madras Street Entrance',
    imageUrl: '/360_photos/madras_street_entrance.360.JPG',
    description: 'Main campus entrance from Madras Street',
    category: 'entrance',
    accessibleFromRoutes: ['entrance-to-courtyard']
  },
  
  // NEW: Room-specific destinations
  {
    id: 'science-204',
    name: 'Room 204 - Biology Classroom',
    imageUrl: '/360_photos/science_building_room_204.360.JPG',
    description: 'Biology classroom with lab benches and safety equipment',
    category: 'room',
    accessibleFromRoutes: ['science-building-floor-2'],
    roomDetails: {
      roomNumber: '204',
      building: 'Science Building',
      floor: 2,
      roomType: 'classroom',
      capacity: 30,
      equipment: ['projector', 'lab benches', 'safety equipment', 'whiteboard'],
      department: 'Biology',
      courses: ['Biology 101', 'Biology 102', 'Anatomy & Physiology'],
      hours: '8 AM - 6 PM weekdays'
    }
  },
  
  {
    id: 'library-study-room-a',
    name: 'Library Study Room A',
    imageUrl: '/360_photos/library_study_room_a.360.JPG',
    description: 'Group study room with whiteboard and projector',
    category: 'room',
    accessibleFromRoutes: ['library-main-floor'],
    roomDetails: {
      roomNumber: 'Study Room A',
      building: 'Library',
      floor: 1,
      roomType: 'common',
      capacity: 8,
      equipment: ['whiteboard', 'projector', 'conference table', 'power outlets'],
      hours: '24/7 with student ID',
      reservationRequired: true
    }
  }
  // ... all other existing photos + new room destinations
]
```

## Phase 2: Room Navigation System

### Direct Room Jumping Logic
```typescript
// src/data/roomMappings.ts
export interface RoomMapping {
  roomQuery: string // How users might search for it
  destinationId: string // Links to destinations array
  aliases: string[] // Alternative names/numbers
  searchKeywords: string[] // For fuzzy matching
}

export const roomMappings: RoomMapping[] = [
  {
    roomQuery: 'Room 204',
    destinationId: 'science-204',
    aliases: ['204', 'Biology 204', 'Bio 204', 'Science 204'],
    searchKeywords: ['biology', 'classroom', 'science', 'lab benches']
  },
  {
    roomQuery: 'Chemistry Lab',
    destinationId: 'science-301',
    aliases: ['301', 'Chem Lab', 'Chemistry 301', 'Room 301'],
    searchKeywords: ['chemistry', 'lab', 'fume hood', 'chemical']
  },
  {
    roomQuery: 'Study Room A',
    destinationId: 'library-study-room-a',
    aliases: ['Group Study A', 'Library Study A', 'Study A'],
    searchKeywords: ['study', 'group', 'library', 'reservation', 'whiteboard']
  }
]

// Room search function
export function findRoom(query: string): Destination | null {
  const normalizedQuery = query.toLowerCase().trim()
  
  // Direct match
  const directMatch = roomMappings.find(mapping => 
    mapping.roomQuery.toLowerCase() === normalizedQuery ||
    mapping.aliases.some(alias => alias.toLowerCase() === normalizedQuery)
  )
  
  if (directMatch) {
    return destinations.find(dest => dest.id === directMatch.destinationId) || null
  }
  
  // Fuzzy keyword match
  const keywordMatch = roomMappings.find(mapping =>
    mapping.searchKeywords.some(keyword => 
      normalizedQuery.includes(keyword) || keyword.includes(normalizedQuery)
    )
  )
  
  if (keywordMatch) {
    return destinations.find(dest => dest.id === keywordMatch.destinationId) || null
  }
  
  return null
}
```

### Navigation System Implementation

### Street View Style Controls
1. **Enhanced Directional Arrow Component**: Forward/back/left/right navigation with room context
2. **Route Following Logic**: Move through photo sequences along paths
3. **Intersection Handling**: Show left/right options only where paths branch
4. **Room Awareness**: Display nearby room information during navigation

```typescript
// src/components/viewer/NavigationControls.tsx
export interface NavigationControlsProps {
  currentPhoto: RoutePhoto | null
  onNavigate: (direction: 'forward' | 'back' | 'left' | 'right') => void
  onRoomSelect: (roomId: string) => void
  isLoading: boolean
  showRoomInfo: boolean
}

export interface RoomInfo {
  nearbyRooms: NearbyRoom[]
  buildingContext: BuildingContext
  currentFloor: number
}
```

### Enhanced Jump-to-Location System  
1. **Enhanced Location Menu**: Access to all destinations + room search
2. **Room Search Interface**: Fuzzy search for rooms by number, name, or type
3. **Campus Map Integration**: Visual map showing current position and available destinations
4. **Quick Room Access**: Direct jumping to specific rooms with context

```typescript
// src/components/viewer/LocationMenu.tsx
export interface LocationMenuProps {
  destinations: Destination[]
  currentLocation: string | null
  onSelectDestination: (destinationId: string) => void
  onRoomSearch: (query: string) => void
  searchResults: Destination[]
  showRoomSearch: boolean
}

// src/components/viewer/RoomSearchInterface.tsx
export interface RoomSearchProps {
  onSearch: (query: string) => void
  results: Destination[]
  onSelectRoom: (roomId: string) => void
  isLoading: boolean
  placeholder?: string
}
```

## Phase 3: Enhanced Tour Data Integration

### Unified Navigation State
```typescript
// src/hooks/useTourNavigation.ts

export interface TourState {
  mode: 'route' | 'destination' | 'room'
  currentPhotoId: string
  currentRouteId?: string
  currentDestinationId?: string
  currentRoomId?: string
  navigationHistory: string[]
  roomSearchQuery?: string
  nearbyRooms: NearbyRoom[]
  buildingContext?: BuildingContext
}

export interface NavigationActions {
  navigateDirection: (direction: 'forward' | 'back' | 'left' | 'right') => void
  jumpToDestination: (destinationId: string) => void
  jumpToRoom: (roomQuery: string) => void
  searchRooms: (query: string) => Destination[]
  goBack: () => void
  enterRoute: (routeId: string, photoId: string) => void
  showNearbyRooms: () => NearbyRoom[]
  getRoomContext: (roomId: string) => Destination | null
}
```

### Enhanced State Management
1. **Current Position**: Track location on routes vs destinations vs rooms
2. **Navigation History**: Back/forward through user journey including room visits
3. **Route Progress**: Show progress along current path
4. **Room Context**: Display information about current room and nearby facilities
5. **Search State**: Manage room search queries and results

## Phase 4: User Interface Updates

### Enhanced Navigation Controls
1. **Street View Arrows**: Forward/back/left/right when on routes, with room indicators
2. **Enhanced Destination Menu**: "Jump to Location" with room search functionality
3. **Room Information Panel**: Display current room details and nearby facilities
4. **Mini Map**: Current position indicator with clickable destinations and rooms
5. **Progress Indicator**: Show current route and progress with room markers

### Enhanced PanoramicViewer
```typescript
// Updated PanoramicViewer props
export interface PanoramicViewerProps {
  tourState: TourState
  onNavigate: NavigationActions
  showRoomInfo?: boolean
  enableRoomSearch?: boolean
  className?: string
}
```

### Room Information Display
```typescript
// src/components/viewer/RoomInfoPanel.tsx
export interface RoomInfoPanelProps {
  roomDetails?: Destination['roomDetails']
  buildingContext?: BuildingContext
  nearbyRooms: NearbyRoom[]
  isVisible: boolean
  onClose: () => void
  onRoomSelect: (roomId: string) => void
}
```

### Transition Effects
1. **Route Navigation**: Smooth forward movement animation
2. **Destination Jumps**: Cross-fade to destination photos
3. **Room Jumps**: Direct transition with room context display
4. **Loading States**: Preload next photos in sequence and nearby room photos

## Phase 5: Implementation Priority

### Immediate (Proof of Concept)
1. **Enhanced route data structure**: Set up TypeScript interfaces with room data
2. **Build single test route with rooms**: Science Building hallway with 3-4 rooms
3. **Basic room jumping**: Direct navigation to specific room photos
4. **Room search functionality**: Simple room lookup by number/name

### Short Term
1. **Enhanced navigation controls**: Street View arrows with room awareness
2. **Room information display**: Show room details and nearby facilities
3. **Enhanced destination jumping**: Connect existing 23 photos + new room photos
4. **State management**: Track current position, room context, and history

### Long Term
1. **Full route network with room coverage**: All main campus pathways + building interiors
2. **Advanced room search**: Fuzzy search, filters by type/department/equipment
3. **Room recommendations**: Suggest relevant rooms based on user context
4. **Building directory integration**: Complete floor plans and facility information

## Technical Architecture

### Enhanced File Structure
```
src/
├── data/
│   ├── routeData.ts              # Enhanced route photo sequences with room data
│   ├── destinationData.ts        # Enhanced destinations including rooms
│   ├── roomMappings.ts           # Room search and lookup functionality
│   └── tourData.ts               # Combined tour configuration
├── components/
│   └── viewer/
│       ├── PanoramicViewer.tsx            # Updated main component
│       ├── NavigationControls.tsx         # Enhanced Street View arrows
│       ├── LocationMenu.tsx               # Enhanced destination menu
│       ├── RoomSearchInterface.tsx        # NEW: Room search functionality
│       ├── RoomInfoPanel.tsx              # NEW: Room information display
│       └── TourMiniMap.tsx                # Enhanced map with room markers
├── hooks/
│   ├── useTourNavigation.ts      # Enhanced navigation state with room support
│   ├── useRoomSearch.ts          # NEW: Room search functionality
│   └── useImagePreloader.ts      # Enhanced preloader for room photos
└── types/
    └── tour.ts                   # Enhanced TypeScript interfaces
```

## Benefits of Enhanced Room Navigation

- **Precise Location Finding**: Students can find exact classrooms and facilities
- **Comprehensive Coverage**: Both outdoor routes and indoor building navigation
- **Rich Context Information**: Room details, equipment, capacity, nearby facilities
- **Search Functionality**: Find rooms by number, name, type, or department
- **Building Awareness**: Understand building layouts and navigation paths
- **Accessibility Information**: Elevator access, emergency exits, facilities
- **Academic Integration**: Connect rooms to courses, departments, and schedules

## Next Steps
1. Enhance existing data structures with room and building information
2. Implement room search and direct jumping functionality
3. Build comprehensive room database for major buildings
4. Create room information display components
5. Test navigation flow from outdoor areas to specific indoor rooms
6. Integrate with building floor plans and accessibility information