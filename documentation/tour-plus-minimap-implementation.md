# VR Campus Tour + Fog of War Minimap Implementation

## Goal
Extend the Google Street View-style campus tour with an interactive fog of war minimap that reveals areas as users navigate through the campus. The minimap provides spatial awareness and discovery mechanics while maintaining the immersive tour experience.

## Core Concepts

### Fog of War Minimap
- **Discovery-based revelation**: Map areas are revealed as users visit corresponding tour locations
- **Persistent state**: Discovered areas remain visible throughout the session
- **Player indicator**: Blue dot with directional wedge showing current position and viewing direction
- **Smooth transitions**: Gradual fog clearing with natural-looking edges

### Integration with Tour System
- **Real-time sync**: Player position updates automatically as user navigates
- **Area discovery**: Visiting tour locations reveals corresponding map regions
- **State coordination**: Minimap state integrates seamlessly with existing tour navigation

## Enhanced Data Structures

### Extended Tour Data
```typescript
// Enhanced RoutePhoto interface
export interface RoutePhoto {
  id: string
  routeId: string
  sequence: number
  imageUrl: string
  position: { lat?: number; lng?: number }
  // NEW: Map integration
  mapCoordinates: { x: number; y: number }
  discoveryRadius: number
  connections: {
    forward?: string
    back?: string
    left?: string
    right?: string
  }
}

// Enhanced Destination interface
export interface Destination {
  id: string
  name: string
  imageUrl: string
  description: string
  category: 'entrance' | 'building' | 'facility' | 'outdoor'
  accessibleFromRoutes: string[]
  // NEW: Map integration
  mapCoordinates: { x: number; y: number }
  discoveryRadius: number
}
```

### Minimap-Specific Data
```typescript
// Map discovery area
export interface MapArea {
  id: string
  centerX: number
  centerY: number
  discoveryRadius: number
  isDiscovered: boolean
  associatedPhotos: string[] // Photo/destination IDs that reveal this area
  revealedAt?: Date
}

// Player state on minimap
export interface PlayerMapState {
  x: number
  y: number
  facing: number // Degrees, 0 = North
  currentPhotoId: string
  isVisible: boolean
}

// Minimap configuration
export interface MinimapConfig {
  mapImageUrl: string
  mapDimensions: { width: number; height: number }
  defaultDiscoveryRadius: number
  fogOpacity: number
  playerIndicatorSize: number
  viewingAngle: number // Degrees for directional wedge
}
```

### State Management
```typescript
// Extended TourState
export interface TourState {
  mode: 'route' | 'destination'
  currentPhotoId: string
  currentRouteId?: string
  currentDestinationId?: string
  navigationHistory: string[]
  // NEW: Minimap state
  minimap: {
    discoveredAreas: MapArea[]
    playerState: PlayerMapState
    fogOfWarEnabled: boolean
    isMinimapVisible: boolean
  }
}

// Minimap-specific actions
export interface MinimapActions {
  revealArea: (photoId: string) => void
  updatePlayerPosition: (position: { x: number; y: number; facing: number }) => void
  toggleFogOfWar: () => void
  toggleMinimapVisibility: () => void
  resetDiscovery: () => void
}
```

## Technical Implementation

### Map Coordinate System
```typescript
// src/data/mapCoordinates.ts

// Map coordinate mapping for campus locations
export const mapCoordinates = {
  // Entrances
  'madras-entrance': { x: 120, y: 450, discoveryRadius: 40 },
  
  // Buildings (based on campus map)
  'information-hub': { x: 200, y: 380, discoveryRadius: 35 },
  'main-courtyard': { x: 300, y: 280, discoveryRadius: 50 },
  'library': { x: 450, y: 200, discoveryRadius: 45 },
  'cafeteria': { x: 180, y: 300, discoveryRadius: 40 },
  
  // Routes (key navigation points)
  'entrance-001': { x: 120, y: 450, discoveryRadius: 25 },
  'entrance-002': { x: 140, y: 420, discoveryRadius: 25 },
  'entrance-003': { x: 160, y: 390, discoveryRadius: 25 },
  // ... more route points
}

// Convert photo/destination ID to map coordinates
export function getMapCoordinates(locationId: string): { x: number; y: number; discoveryRadius: number } | null {
  return mapCoordinates[locationId] || null
}

// Calculate facing direction based on camera rotation in panoramic viewer
export function calculateMapFacing(cameraRotation: { theta: number; phi: number }): number {
  // Convert Three.js camera rotation to map bearing (0 = North)
  const bearing = (cameraRotation.theta * (180 / Math.PI) + 90) % 360
  return bearing < 0 ? bearing + 360 : bearing
}
```

### Fog of War Canvas Component
```typescript
// src/components/viewer/FogOfWarCanvas.tsx

interface FogOfWarCanvasProps {
  discoveredAreas: MapArea[]
  mapDimensions: { width: number; height: number }
  fogOpacity: number
  className?: string
}

export const FogOfWarCanvas: React.FC<FogOfWarCanvasProps> = ({
  discoveredAreas,
  mapDimensions,
  fogOpacity,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = mapDimensions.width
    canvas.height = mapDimensions.height

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw base fog layer
    ctx.fillStyle = `rgba(0, 0, 0, ${fogOpacity})`
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Set blend mode to cut holes in fog
    ctx.globalCompositeOperation = 'destination-out'

    // Reveal discovered areas
    discoveredAreas
      .filter(area => area.isDiscovered)
      .forEach(area => {
        // Create radial gradient for smooth fog clearing
        const gradient = ctx.createRadialGradient(
          area.centerX, area.centerY, 0,
          area.centerX, area.centerY, area.discoveryRadius
        )
        gradient.addColorStop(0, 'rgba(0,0,0,1)')    // Fully clear center
        gradient.addColorStop(0.6, 'rgba(0,0,0,0.8)') // Gradual transition
        gradient.addColorStop(0.9, 'rgba(0,0,0,0.3)') // Soft edge
        gradient.addColorStop(1, 'rgba(0,0,0,0)')     // Transparent border

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(area.centerX, area.centerY, area.discoveryRadius, 0, Math.PI * 2)
        ctx.fill()
      })

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over'
  }, [discoveredAreas, mapDimensions, fogOpacity])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ 
        width: '100%', 
        height: '100%',
        imageRendering: 'pixelated' // Maintain crisp edges
      }}
    />
  )
}
```

### Player Indicator Component
```typescript
// src/components/viewer/MinimapPlayerIndicator.tsx

interface MinimapPlayerIndicatorProps {
  playerState: PlayerMapState
  indicatorSize: number
  viewingAngle: number
  className?: string
}

export const MinimapPlayerIndicator: React.FC<MinimapPlayerIndicatorProps> = ({
  playerState,
  indicatorSize,
  viewingAngle,
  className
}) => {
  if (!playerState.isVisible) return null

  const radius = indicatorSize / 2
  const wedgeLength = radius * 1.8

  // Convert viewing angle to radians
  const angleRad = (playerState.facing - 90) * (Math.PI / 180) // -90 to align with SVG coordinate system
  const halfViewAngle = (viewingAngle / 2) * (Math.PI / 180)

  // Calculate directional wedge points
  const wedgePoints = [
    // Center point (player position)
    { x: 0, y: 0 },
    // Left edge of viewing wedge
    {
      x: Math.cos(angleRad - halfViewAngle) * wedgeLength,
      y: Math.sin(angleRad - halfViewAngle) * wedgeLength
    },
    // Right edge of viewing wedge
    {
      x: Math.cos(angleRad + halfViewAngle) * wedgeLength,
      y: Math.sin(angleRad + halfViewAngle) * wedgeLength
    }
  ]

  const pathData = `M 0,0 L ${wedgePoints[1].x},${wedgePoints[1].y} A ${wedgeLength},${wedgeLength} 0 0,1 ${wedgePoints[2].x},${wedgePoints[2].y} Z`

  return (
    <svg 
      className={`absolute pointer-events-none ${className}`}
      style={{
        left: playerState.x - radius,
        top: playerState.y - radius,
        width: indicatorSize * 2,
        height: indicatorSize * 2,
        transform: 'translate(-50%, -50%)'
      }}
      viewBox={`-${radius} -${radius} ${indicatorSize * 2} ${indicatorSize * 2}`}
    >
      {/* Directional viewing wedge */}
      <path
        d={pathData}
        fill="rgba(59, 130, 246, 0.3)" // Blue with transparency
        stroke="rgba(59, 130, 246, 0.6)"
        strokeWidth="1"
      />
      
      {/* Player dot */}
      <circle
        cx="0"
        cy="0"
        r={radius}
        fill="#3b82f6" // Blue
        stroke="#ffffff"
        strokeWidth="2"
        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
      />
      
      {/* Inner highlight */}
      <circle
        cx="0"
        cy="0"
        r={radius * 0.6}
        fill="rgba(255, 255, 255, 0.4)"
      />
    </svg>
  )
}
```

### Main Minimap Component
```typescript
// src/components/viewer/TourMiniMap.tsx

interface TourMiniMapProps {
  tourState: TourState
  onMinimapAction: (action: MinimapActions) => void
  config: MinimapConfig
  className?: string
}

export const TourMiniMap: React.FC<TourMiniMapProps> = ({
  tourState,
  onMinimapAction,
  config,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const { minimap } = tourState
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const discoveryProgress = useMemo(() => {
    const totalAreas = minimap.discoveredAreas.length
    const discoveredCount = minimap.discoveredAreas.filter(area => area.isDiscovered).length
    return totalAreas > 0 ? (discoveredCount / totalAreas) * 100 : 0
  }, [minimap.discoveredAreas])

  if (!minimap.isMinimapVisible) return null

  return (
    <div className={`fixed bottom-20 right-4 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700 transition-all duration-300 ${className}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={toggleExpanded}
      >
        <div className="text-white text-sm font-medium">Campus Map</div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-300">{Math.round(discoveryProgress)}% explored</div>
          <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Minimap View */}
      <div 
        className={`relative transition-all duration-300 overflow-hidden ${
          isExpanded ? 'h-64 w-80' : 'h-0 w-80'
        }`}
      >
        {/* Base map image */}
        <img 
          src={config.mapImageUrl}
          alt="Campus Map"
          className="w-full h-full object-cover"
          draggable={false}
        />

        {/* Fog of war overlay */}
        {minimap.fogOfWarEnabled && (
          <FogOfWarCanvas
            discoveredAreas={minimap.discoveredAreas}
            mapDimensions={config.mapDimensions}
            fogOpacity={config.fogOpacity}
          />
        )}

        {/* Player indicator */}
        <MinimapPlayerIndicator
          playerState={minimap.playerState}
          indicatorSize={config.playerIndicatorSize}
          viewingAngle={config.viewingAngle}
        />

        {/* Controls overlay */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <button
            onClick={() => onMinimapAction.toggleFogOfWar()}
            className="p-1 bg-gray-800/80 hover:bg-gray-700/80 rounded text-white text-xs"
            title={minimap.fogOfWarEnabled ? "Disable Fog of War" : "Enable Fog of War"}
          >
            {minimap.fogOfWarEnabled ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
          
          <button
            onClick={() => onMinimapAction.resetDiscovery()}
            className="p-1 bg-gray-800/80 hover:bg-gray-700/80 rounded text-white text-xs"
            title="Reset Discovery"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Discovery progress bar */}
        <div className="absolute bottom-2 left-2 right-2">
          <div className="bg-gray-800/80 rounded-full h-1.5">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${discoveryProgress}%` }}
            />
          </div>
          <div className="text-xs text-gray-300 mt-1">
            {minimap.discoveredAreas.filter(a => a.isDiscovered).length} / {minimap.discoveredAreas.length} areas discovered
          </div>
        </div>
      </div>
    </div>
  )
}
```

### State Management Hook
```typescript
// src/hooks/useMinimapState.ts

export function useMinimapState(initialConfig: MinimapConfig) {
  const [minimapState, setMinimapState] = useState<TourState['minimap']>({
    discoveredAreas: [],
    playerState: {
      x: 0,
      y: 0,
      facing: 0,
      currentPhotoId: '',
      isVisible: false
    },
    fogOfWarEnabled: true,
    isMinimapVisible: true
  })

  // Initialize discovery areas from map coordinates
  useEffect(() => {
    const areas: MapArea[] = Object.entries(mapCoordinates).map(([id, coords]) => ({
      id,
      centerX: coords.x,
      centerY: coords.y,
      discoveryRadius: coords.discoveryRadius,
      isDiscovered: false,
      associatedPhotos: [id],
      revealedAt: undefined
    }))

    setMinimapState(prev => ({
      ...prev,
      discoveredAreas: areas
    }))
  }, [])

  // Actions
  const minimapActions: MinimapActions = {
    revealArea: useCallback((photoId: string) => {
      setMinimapState(prev => ({
        ...prev,
        discoveredAreas: prev.discoveredAreas.map(area => 
          area.associatedPhotos.includes(photoId)
            ? { ...area, isDiscovered: true, revealedAt: new Date() }
            : area
        )
      }))
    }, []),

    updatePlayerPosition: useCallback((position: { x: number; y: number; facing: number }) => {
      setMinimapState(prev => ({
        ...prev,
        playerState: {
          ...prev.playerState,
          x: position.x,
          y: position.y,
          facing: position.facing,
          isVisible: true
        }
      }))
    }, []),

    toggleFogOfWar: useCallback(() => {
      setMinimapState(prev => ({
        ...prev,
        fogOfWarEnabled: !prev.fogOfWarEnabled
      }))
    }, []),

    toggleMinimapVisibility: useCallback(() => {
      setMinimapState(prev => ({
        ...prev,
        isMinimapVisible: !prev.isMinimapVisible
      }))
    }, []),

    resetDiscovery: useCallback(() => {
      setMinimapState(prev => ({
        ...prev,
        discoveredAreas: prev.discoveredAreas.map(area => ({
          ...area,
          isDiscovered: false,
          revealedAt: undefined
        }))
      }))
    }, [])
  }

  return { minimapState, minimapActions }
}
```

## Integration with Existing Tour System

### Enhanced PanoramicViewer Integration
```typescript
// Updated PanoramicViewer props
export interface PanoramicViewerProps {
  tourState: TourState
  onNavigate: NavigationActions
  onMinimapUpdate: (playerPosition: { x: number; y: number; facing: number }) => void
  className?: string
}

// In PanoramicViewer component - add to existing useEffect
useEffect(() => {
  // ... existing Three.js setup ...

  const animate = () => {
    // ... existing animation logic ...
    
    // NEW: Update minimap player position
    if (onMinimapUpdate && tourState.currentPhotoId) {
      const mapCoords = getMapCoordinates(tourState.currentPhotoId)
      if (mapCoords) {
        const facing = calculateMapFacing({ theta: lon, phi: lat })
        onMinimapUpdate({
          x: mapCoords.x,
          y: mapCoords.y,
          facing
        })
      }
    }
  }
}, [tourState.currentPhotoId, onMinimapUpdate])
```

### Tour Navigation Hook Updates
```typescript
// Enhanced useTourNavigation hook
export function useTourNavigation() {
  const minimapConfig: MinimapConfig = {
    mapImageUrl: '/campus_map/map.jpg',
    mapDimensions: { width: 800, height: 600 },
    defaultDiscoveryRadius: 40,
    fogOpacity: 0.8,
    playerIndicatorSize: 16,
    viewingAngle: 120 // degrees
  }

  const { minimapState, minimapActions } = useMinimapState(minimapConfig)
  
  // ... existing tour state logic ...

  const navigateToPhoto = useCallback((photoId: string) => {
    // ... existing navigation logic ...
    
    // NEW: Reveal area when navigating to photo
    minimapActions.revealArea(photoId)
  }, [minimapActions])

  const handleMinimapPlayerUpdate = useCallback((position: { x: number; y: number; facing: number }) => {
    minimapActions.updatePlayerPosition(position)
  }, [minimapActions])

  return {
    tourState: {
      ...existingTourState,
      minimap: minimapState
    },
    navigationActions: {
      ...existingNavigationActions,
      navigateToPhoto
    },
    minimapConfig,
    minimapActions,
    onMinimapPlayerUpdate: handleMinimapPlayerUpdate
  }
}
```

## File Structure

```
src/
├── data/
│   ├── routeData.ts              # Existing route data
│   ├── destinationData.ts        # Existing destination data
│   ├── mapCoordinates.ts         # NEW: Photo-to-map coordinate mapping
│   └── tourData.ts               # Combined tour configuration
├── components/
│   └── viewer/
│       ├── PanoramicViewer.tsx           # Updated with minimap integration
│       ├── PanoramicViewerControls.tsx   # Existing controls
│       ├── NavigationControls.tsx        # Existing navigation
│       ├── LocationMenu.tsx              # Existing location menu
│       ├── TourMiniMap.tsx              # NEW: Main minimap component
│       ├── FogOfWarCanvas.tsx           # NEW: Canvas fog rendering
│       └── MinimapPlayerIndicator.tsx   # NEW: Player indicator
├── hooks/
│   ├── useTourNavigation.ts      # Updated with minimap state
│   ├── useMinimapState.ts        # NEW: Minimap state management
│   └── useImagePreloader.ts      # Existing preloader
└── types/
    └── tour.ts                   # Updated TypeScript interfaces
```

## Implementation Phases

### Phase 1: Core Minimap (1-2 days)
1. Create map coordinate mapping system
2. Implement basic TourMiniMap component
3. Add player position indicator
4. Basic show/hide functionality

### Phase 2: Fog of War (2-3 days)
1. Implement FogOfWarCanvas component
2. Add discovery mechanics
3. Integrate with tour navigation
4. Test fog rendering performance

### Phase 3: Polish & Integration (1-2 days)
1. Smooth animations and transitions
2. Discovery progress tracking
3. Responsive design optimization
4. State persistence options

### Phase 4: Advanced Features (Optional)
1. Custom discovery shapes (paths vs circles)
2. Different fog styles/themes
3. Minimap zoom/pan functionality
4. Discovery achievements/milestones

## Benefits of This Approach

- **Performance**: Canvas-based fog rendering is GPU-accelerated and efficient
- **Flexibility**: Easy to customize discovery effects, player indicators, and fog styles
- **Integration**: Seamlessly works with existing tour navigation system
- **Scalability**: Can handle dozens of discovery areas without performance issues
- **User Experience**: Provides spatial awareness and gamification through discovery
- **Mobile-Friendly**: Touch-optimized controls and responsive design

This implementation creates an engaging fog of war discovery system that enhances the immersive campus tour experience while maintaining smooth performance across devices.