# VR Campus Tour Navigation Implementation

## Goal
Transform the single 360° panorama viewer into a Google Street View-style campus tour with directional navigation along main footpaths, plus jump-to-location functionality for specific destinations.

## Approach: Hybrid Navigation System
- **Street View Navigation**: Directional arrows (forward/back/left/right) along main campus routes
- **Jump-to-Location**: Menu/map access to specific destinations from existing 23 photos

## Phase 1: Photo Collection Strategy

### Main Route Photography (60-100 new photos needed)
1. **Map main footpaths and hallways**: Primary routes students use daily
2. **Systematic photo capture**: Every 10 steps (~20-25 feet) along these routes
3. **Key routes to cover**:
   - Madras Street entrance → Information Hub → Courtyard (main spine)
   - Primary hallway connections between buildings
   - Main outdoor pathways connecting key areas
4. **Photo guidelines**:
   - Face direction of path flow
   - Consistent height and positioning
   - Note GPS/sketch simple route map

### Route Data Structure
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
}

export interface Route {
  id: string
  name: string
  photos: RoutePhoto[]
  startPoint: string
  endPoint: string
}

// Example route structure
export const mainRoutes: Route[] = [
  {
    id: 'entrance-to-courtyard',
    name: 'Main Entrance to Courtyard',
    photos: [
      {
        id: 'entrance-001',
        routeId: 'entrance-to-courtyard',
        sequence: 1,
        imageUrl: '/360_photos/routes/entrance_001.360.JPG',
        connections: { forward: 'entrance-002' }
      },
      {
        id: 'entrance-002', 
        routeId: 'entrance-to-courtyard',
        sequence: 2,
        imageUrl: '/360_photos/routes/entrance_002.360.JPG',
        connections: { 
          forward: 'entrance-003', 
          back: 'entrance-001',
          right: 'carpark-001' // Branch to parking area
        }
      }
      // ... more photos every 10 steps
    ],
    startPoint: 'madras-entrance',
    endPoint: 'main-courtyard'
  }
]
```

### Destination Data Structure
```typescript
// src/data/destinationData.ts

export interface Destination {
  id: string
  name: string
  imageUrl: string
  description: string
  category: 'entrance' | 'building' | 'facility' | 'outdoor'
  accessibleFromRoutes: string[] // Which routes connect to this destination
}

// Using existing 23 photos as destinations
export const destinations: Destination[] = [
  {
    id: 'madras-entrance',
    name: 'Madras Street Entrance',
    imageUrl: '/360_photos/madras_street_entrance.360.JPG',
    description: 'Main campus entrance from Madras Street',
    category: 'entrance',
    accessibleFromRoutes: ['entrance-to-courtyard']
  },
  {
    id: 'information-hub',
    name: 'Information Hub',
    imageUrl: '/360_photos/information_hub.360.JPG',
    description: 'Campus information and student services',
    category: 'facility',
    accessibleFromRoutes: ['entrance-to-courtyard']
  },
  {
    id: 'main-courtyard',
    name: 'Main Courtyard',
    imageUrl: '/360_photos/courtyard.360.JPG',
    description: 'Central campus courtyard and gathering space',
    category: 'outdoor',
    accessibleFromRoutes: ['entrance-to-courtyard', 'courtyard-to-library']
  },
  {
    id: 'library',
    name: 'Library',
    imageUrl: '/360_photos/library.360.JPG',
    description: 'Campus library and study spaces',
    category: 'building',
    accessibleFromRoutes: ['courtyard-to-library']
  },
  // ... all other existing photos
]
```

## Phase 2: Navigation System Implementation

### Street View Style Controls
1. **Directional Arrow Component**: Forward/back/left/right navigation
2. **Route Following Logic**: Move through photo sequences along paths
3. **Intersection Handling**: Show left/right options only where paths branch
4. **Smooth Transitions**: Camera animation toward movement direction

```typescript
// src/components/viewer/NavigationControls.tsx
export interface NavigationControlsProps {
  currentPhoto: RoutePhoto | null
  onNavigate: (direction: 'forward' | 'back' | 'left' | 'right') => void
  isLoading: boolean
}
```

### Jump-to-Location System  
1. **Location Menu**: Access to all 23 existing destination photos
2. **Campus Map Integration**: Visual map showing current position and available destinations
3. **Quick Access**: Jump directly to specific buildings/rooms

```typescript
// src/components/viewer/LocationMenu.tsx
export interface LocationMenuProps {
  destinations: Destination[]
  currentLocation: string | null
  onSelectDestination: (destinationId: string) => void
}
```

## Phase 3: Tour Data Integration

### Unified Navigation State
```typescript
// src/hooks/useTourNavigation.ts

export interface TourState {
  mode: 'route' | 'destination'
  currentPhotoId: string
  currentRouteId?: string
  currentDestinationId?: string
  navigationHistory: string[]
}

export interface NavigationActions {
  navigateDirection: (direction: 'forward' | 'back' | 'left' | 'right') => void
  jumpToDestination: (destinationId: string) => void
  goBack: () => void
  enterRoute: (routeId: string, photoId: string) => void
}
```

### State Management
1. **Current Position**: Track location on routes vs destinations
2. **Navigation History**: Back/forward through user journey
3. **Route Progress**: Show progress along current path

## Phase 4: User Interface Updates

### Navigation Controls
1. **Street View Arrows**: Forward/back/left/right when on routes
2. **Destination Menu**: "Jump to Location" dropdown with existing 23 photos
3. **Mini Map**: Current position indicator with clickable destinations
4. **Progress Indicator**: Show current route and progress

### Enhanced PanoramicViewer
```typescript
// Updated PanoramicViewer props
export interface PanoramicViewerProps {
  tourState: TourState
  onNavigate: NavigationActions
  className?: string
}
```

### Transition Effects
1. **Route Navigation**: Smooth forward movement animation
2. **Destination Jumps**: Cross-fade to destination photos
3. **Loading States**: Preload next photos in sequence

## Phase 5: Implementation Priority

### Immediate (Proof of Concept)
1. **Create route data structure**: Set up TypeScript interfaces
2. **Build single test route**: Entrance → Courtyard with 5-6 photos
3. **Basic navigation**: Forward/back movement along route
4. **Integration**: Connect to existing PanoramicViewer

### Short Term
1. **Navigation controls**: Street View style directional arrows
2. **Destination jumping**: Connect existing 23 photos as jump points
3. **State management**: Track current position and history
4. **Smooth transitions**: Camera animations between photos

### Long Term
1. **Full route network**: All main campus pathways (60-100 photos)
2. **Intersection logic**: Multi-directional navigation at path branches
3. **Mini map**: Visual navigation aid
4. **Polish & optimization**: Performance and UX improvements

## Technical Architecture

### File Structure
```
src/
├── data/
│   ├── routeData.ts          # Route photo sequences
│   ├── destinationData.ts    # Existing 23 destination photos
│   └── tourData.ts           # Combined tour configuration
├── components/
│   └── viewer/
│       ├── PanoramicViewer.tsx          # Updated main component
│       ├── NavigationControls.tsx       # Street View arrows
│       ├── LocationMenu.tsx             # Destination jump menu
│       └── TourMiniMap.tsx              # Optional map component
├── hooks/
│   ├── useTourNavigation.ts    # Navigation state management
│   └── useImagePreloader.ts    # Performance optimization
└── types/
    └── tour.ts                 # TypeScript interfaces
```

## Benefits of This Approach
- **Achievable scope**: 60-100 photos vs 300+ for full coverage
- **Natural navigation**: True Street View experience on main routes
- **Complete coverage**: All 23 locations still accessible via menu
- **Scalable**: Can add more routes incrementally
- **User-friendly**: Intuitive directional movement + quick destination access
- **Performance**: Efficient loading with photo preloading strategies

## Next Steps
1. Start with creating the data structures and TypeScript interfaces
2. Build a single route proof-of-concept with 5-6 test photos
3. Integrate basic forward/back navigation into existing PanoramicViewer
4. Test user experience and refine before expanding to full route network