# VR Campus Tour: How Image Navigation Works

## Whats Built

Imagine Google Street View, but for walking through a university campus. We created a system that lets users explore buildings by "jumping" between 360-degree photos. When you're looking at one photo, you can click buttons to move forward, backward, turn left or right, and even go up or down stairs - just like walking through the real building.

## The Big Picture: From Photos to Navigation

Here's how we turned a collection of 360° photos into a navigable virtual tour:

### Step 1: Organizing Photos Into Buildings and Floors
We have four main buildings (A, N, S, X) with multiple floors each. Every floor is organized as an "Area" containing connected photos.

```
Campus Tour Structure:
├── A Block (Building A)
│   ├── Floor 1 (Ground level)
│   └── Floor 2 (Second level)
├── N Block (Building N)
│   ├── Floor 1
│   └── Floor 2
├── S Block (Building S)
│   ├── Floor 1
│   └── Floor 2
└── X Block (Building X)
    ├── Floor 1
    ├── Floor 2
    └── Floor 3
```

### Step 2: Connecting Photos Together
Each photo knows where you can go from that location. Think of it like being at an intersection - you can see which directions are available to move.

## How Navigation Actually Works

### The Core Concept: Directional Movement
When you're standing in a hallway looking at a 360° photo, you have several options:
- **Forward**: Continue down the hallway in the direction you're facing
- **Back**: Turn around and go the opposite way
- **Left**: Turn left and enter a side corridor or room
- **Right**: Turn right and enter a side corridor or room
- **Up**: Go upstairs or take an elevator up
- **Down**: Go downstairs or take an elevator down

### How We Store Navigation Information
Every photo contains a `directions` object that tells the system where each direction leads:

```typescript
{
  id: 'a-f1-north-2',
  imageUrl: '/path/to/photo.webp',
  directions: {
    forward: { angle: 0, connection: 'a-f1-north-3' },    // Go to next photo in hallway
    back: { angle: 180, connection: 'a-f1-north-1' },     // Go to previous photo
    left: { angle: 270, connection: 'a-f1-classroom' },   // Enter classroom on left
    up: 'a-f2-stairs'                                      // Go upstairs (simple connection)
  }
}
```

**What This Means:**
- **angle**: Which compass direction to face (0° = North, 90° = East, 180° = South, 270° = West)
- **connection**: The ID of the photo you'll jump to
- Vertical directions (up/down) use simple connections since you don't need compass directions for stairs

### Understanding Angles and Directions
Think of angles like a compass overlaid on the photo:
- **0° (North)**: Straight ahead in the photo
- **90° (East)**: To the right
- **180° (South)**: Behind you
- **270° (West)**: To the left

When you click "Go Forward" and the angle is 0°, you move in the direction you're currently facing. If the angle is 180°, you're essentially walking backward.

## Different Types of Connections

### 1. Corridor Navigation (Bidirectional)
Most hallways work both ways - you can walk forward or backward through them.

**Example: Walking down a straight hallway**
```
Photo A ←→ Photo B ←→ Photo C
```

In the code, this looks like:
```typescript
// Photo B can go forward to C or back to A
{
  id: 'photo-b',
  directions: {
    forward: { angle: 0, connection: 'photo-c' },
    back: { angle: 180, connection: 'photo-a' }
  }
}
```

### 2. Branch Corridors (Side Paths)
Sometimes you can turn left or right to enter a side hallway or room.

**Example: Main hallway with a classroom branch**
```
Main Hallway → left → Classroom → back → Main Hallway
```

The pattern is always:
- Enter a branch using `left` or `right`
- Exit a branch using `back` (you "back out" of the room)

### 3. Cross-Building Connections
Buildings connect to each other at specific points, creating seamless movement between structures.

**Example: X Block connects to N Block**
```
X Block End → forward → N Block Start
N Block Start → back → X Block End
```

### 4. Vertical Navigation
Moving between floors happens through stairs or elevators.

**Simple Stairs:**
```typescript
directions: {
  up: 'second-floor-entrance',     // Direct connection upstairs
  down: 'ground-floor-entrance'    // Direct connection downstairs
}
```

**Elevators (Multi-floor):**
Elevators are special - they connect to multiple floors and show visual buttons you can click.

## How the System Decides Where You Look

This is where things get sophisticated. When you move from one photo to another, the system needs to decide which direction you should be facing in the new photo.

### Smart Orientation Logic

**Scenario 1: Walking Straight Through a Hallway**
If you're walking forward through a corridor, you should continue facing forward in the new photo. If you turn around and walk backward, you should continue facing backward.

**Scenario 2: Turning Corners**
When you turn left or right, or move between buildings, you should face the most logical direction for that new location.

**Scenario 3: Using Stairs or Elevators**
When you go up or down, you should face a sensible direction in the new location (usually toward the main hallway).

### The Navigation Intelligence System

We built a smart system that analyzes each movement and decides how to orient your camera:

1. **Same Corridor Movement**: Preserves your current orientation (forward stays forward, backward stays backward)
2. **Corner Navigation**: Uses the photo's default starting direction
3. **Cross-Building Movement**: Faces you toward the logical direction for movement flow
4. **Vertical Movement**: Uses each photo's preferred starting orientation

## File Organization: How It's All Structured

### Building Block Structure
```
src/data/blocks/
├── a_block/
│   ├── floor1.ts        # All A Block ground floor photos
│   ├── floor2.ts        # All A Block second floor photos
│   └── index.ts         # Exports everything from A Block
├── x_block/
│   ├── floor1.ts
│   ├── floor2.ts
│   ├── floor3.ts
│   ├── elevator.ts      # X Block elevator system
│   └── index.ts
└── ... (similar structure for N and S blocks)
```

### Area Definitions
Each floor file exports an "Area" containing all photos for that floor:

```typescript
export const aBlockFloor1Area: Area = {
  id: 'a-block-floor-1',
  name: 'A Block Ground Floor',
  buildingBlock: 'a',
  floorLevel: 1,
  photos: [
    // All the connected photos for this floor
  ]
}
```

### Photo Definitions
Each photo contains all the information needed for navigation:

```typescript
{
  id: 'unique-photo-identifier',
  imageUrl: '/path/to/360-photo.webp',
  startingAngle: 180,                    // Default direction to face (optional)
  directions: {
    forward: { angle: 0, connection: 'next-photo' },
    back: { angle: 180, connection: 'previous-photo' },
    left: { angle: 270, connection: 'side-room' }
  },
  nearbyRooms: [                         // What rooms are visible from here
    { roomNumber: 'A101', roomType: 'classroom' }
  ],
  buildingContext: {                     // Context about this location
    wing: 'north',
    facilities: ['main entrance', 'information desk']
  }
}
```

## Interactive Elements: Hotspots

Some photos have clickable "hotspots" - visual elements you can click on in the 360° image:

```typescript
hotspots: [
  {
    direction: 'up',                     // What happens when clicked
    position: { theta: 270, phi: 60 }   // Where to place the clickable area
  }
]
```

**Position Coordinates:**
- **theta**: Horizontal rotation (0-360°, like a compass)
- **phi**: Vertical angle (0-180°, where 90° is straight ahead)

These hotspots appear as clickable buttons overlaid on the actual stairs, elevator buttons, or doorways you can see in the photo.

## Navigation Patterns We Follow

### Pattern 1: Linear Progression
Simple back-and-forth movement through hallways:
```
Entrance → Photo 1 → Photo 2 → Photo 3 → End
```

### Pattern 2: Branch Exploration
Main path with side branches:
```
Main Path → left → Branch Photo → back → Main Path (continue)
```

### Pattern 3: Floor Connections
Moving between levels:
```
Ground Floor → up (stairs) → Second Floor Landing → forward → Second Floor Hallway
```

### Pattern 4: Building Transitions
Moving between different buildings:
```
Building A End → forward → Building X Start → continue through Building X
```

## How Users Experience Navigation

### Visual Feedback
When users look around in a 360° photo, navigation buttons appear when they're facing the right direction:
- Look forward → "Go Forward" button appears
- Look backward → "Go Back" button appears
- Look left → "Turn Left" button appears
- Look at stairs → "Go Upstairs" hotspot appears

### Smooth Transitions
When users click a navigation button:
1. The new photo loads
2. The camera automatically rotates to face the appropriate direction
3. Users can immediately continue navigating or look around

### Contextual Information
Users can see information about their current location:
- Room numbers visible from their position
- Building wing and facilities available
- Multiple floor options in elevators

## Why This System Works Well

### For Users
- **Intuitive**: Works like walking through a real building
- **Consistent**: Same navigation patterns throughout the tour
- **Visual**: Can see where they're going before they click
- **Flexible**: Can explore at their own pace and path

### For Developers
- **Maintainable**: Each photo's connections are clearly defined
- **Scalable**: Easy to add new photos and buildings
- **Reliable**: Smart orientation system prevents user confusion
- **Debuggable**: Clear data structure makes issues easy to trace

### For Content Creators
- **Logical**: Connection patterns match real-world movement
- **Flexible**: Can accommodate different building layouts
- **Rich**: Can include contextual information about locations
- **Visual**: Hotspots align with actual photo elements

This system transforms a collection of static 360° photos into an immersive, navigable virtual tour that feels natural and intuitive to explore.

## Technical Implementation: How Navigation Actually Works

### The Navigation Stack

The VR tour system consists of several interconnected components that work together to create seamless navigation:

```
User Interaction Layer
├── src/components/viewer/DirectionalNavigation.tsx    # UI buttons and directional detection
├── src/components/viewer/PanoramicViewer.tsx         # Three.js 360° photo rendering
└── src/components/viewer/NavigationHotspots.tsx      # Interactive click areas

State Management Layer
├── src/hooks/useTourNavigation.ts        # Core navigation hook
├── Navigation Analysis System            # Bidirectional movement intelligence
└── Camera Orientation Logic             # Smart camera positioning

Data Layer
├── src/data/blocks/                     # Photo definitions with connections
├── src/data/tourUtilities.ts           # Centralized photo lookup
└── src/types/tour.ts                    # TypeScript interfaces
```

### Core Hook: useTourNavigation (src/hooks/useTourNavigation.ts)

The `useTourNavigation` hook is the brain of the navigation system. It manages state and orchestrates photo transitions:

```typescript
// src/hooks/useTourNavigation.ts
export function useTourNavigation() {
  const [currentPhotoId, setCurrentPhotoId] = useState<string>('a-f1-north-entrance')
  const [isLoading, setIsLoading] = useState(false)
  const [cameraLon, setCameraLon] = useState(180)      // Horizontal rotation
  const [cameraLat, setCameraLat] = useState(0)        // Vertical tilt
  const [calculatedCameraAngle, setCalculatedCameraAngle] = useState<number | undefined>(undefined)

  // Core navigation logic
  const navigateDirection = useCallback((direction: 'forward' | 'back' | 'left' | 'right' | 'up' | 'down') => {
    // Navigation analysis and execution
  }, [currentPhoto, isLoading, cameraLon])
}
```

**State Variables Explained:**
- **currentPhotoId**: Which 360° photo is currently displayed
- **cameraLon/cameraLat**: User's current viewing angle in the photo
- **calculatedCameraAngle**: Where to position camera after navigation
- **isLoading**: Prevents multiple simultaneous navigations

### Navigation Flow: From Click to Photo Transition

When a user clicks a navigation button, here's the complete flow:

#### Step 1: Direction Detection (src/hooks/useTourNavigation.ts)
```typescript
// src/hooks/useTourNavigation.ts - navigateDirection function
const navigateDirection = (direction: 'forward' | 'back' | 'left' | 'right' | 'up' | 'down') => {
  if (!currentPhoto || isLoading) return

  // Get target photo ID from current photo's directions
  const directionDef = currentPhoto.directions[direction]
  const targetPhotoId = directionDef?.connection || currentPhoto.directions[direction]
}
```

#### Step 2: Navigation Analysis (src/hooks/useTourNavigation.ts)
The system analyzes the movement to determine how to orient the camera:

```typescript
// src/hooks/useTourNavigation.ts - within navigateDirection function
const navigationAnalysis = analyzeNavigation(currentPhoto, targetPhoto, direction)
const calculatedAngle = calculateNavigationAngle(
  cameraLon,           // Current user orientation
  currentPhoto,        // Source location
  targetPhoto,         // Destination location
  direction,           // Movement direction
  navigationAnalysis.navigationType
)
```

#### Step 3: Navigation Type Classification (src/hooks/useTourNavigation.ts)
The `analyzeNavigation` function determines what type of movement this is:

```typescript
// src/hooks/useTourNavigation.ts - analyzeNavigation function
function analyzeNavigation(
  currentPhoto: Photo,
  destinationPhoto: Photo,
  direction: 'forward' | 'back' | 'left' | 'right' | 'up' | 'down'
): NavigationAnalysis {

  // Check if it's cross-building navigation
  const currentBuilding = currentPhoto.id.split('-')[0]
  const destBuilding = destinationPhoto.id.split('-')[0]
  if (currentBuilding !== destBuilding) {
    return { navigationType: 'cross-building', preserveOrientation: false }
  }

  // Check for bidirectional connections
  const currentConnection = currentPhoto.directions[direction]?.connection
  const reverseDirection = direction === 'forward' ? 'back' : 'forward'
  const destinationConnection = destinationPhoto.directions[reverseDirection]?.connection

  if (currentConnection !== destinationPhoto.id || destinationConnection !== currentPhoto.id) {
    return { navigationType: 'same-building-corner', preserveOrientation: false }
  }

  // Check corridor geometry by comparing actual connection angles
  const currentDirectionAngle = currentPhoto.directions[direction]?.angle
  const destinationReverseAngle = destinationPhoto.directions[reverseDirection]?.angle

  if (currentDirectionAngle !== undefined && destinationReverseAngle !== undefined) {
    const connectionAngleDiff = angleDiff(currentDirectionAngle, destinationReverseAngle)

    // If connection angles are not opposite (within 15° tolerance), it's a corner
    if (Math.abs(connectionAngleDiff - 180) > 15) {
      return { navigationType: 'same-building-corner', preserveOrientation: false }
    }
  }

  // Same corridor with consistent bidirectional geometry
  return { navigationType: 'same-corridor', preserveOrientation: true }
}
```

**Navigation Types:**
- **same-corridor**: Bidirectional hallway connections (preserves user orientation)
- **same-building-corner**: Corner turns, room entrances (uses photo's starting angle)
- **cross-building**: Movement between different buildings (directional intent)
- **turn**: Left/right turns at intersections

#### Step 4: Camera Angle Calculation (src/hooks/useTourNavigation.ts)
Based on the navigation type, different orientation logic applies:

```typescript
// src/hooks/useTourNavigation.ts - calculateNavigationAngle function
function calculateNavigationAngle(
  currentCameraAngle: number,
  currentPhoto: Photo,
  destinationPhoto: Photo,
  direction: 'forward' | 'back' | 'left' | 'right' | 'up' | 'down',
  navigationType: NavigationType
): number {
  switch (navigationType) {
    case 'same-corridor':
      if (direction === 'forward') {
        // Forward movement: maintain forward-relative orientation
        return calculatePreservedOrientation(currentCameraAngle, currentPhoto, destinationPhoto)
      } else if (direction === 'back') {
        // Backward movement: face the back direction to maintain backwards orientation
        return destinationPhoto.directions.back?.angle ?? calculatePreservedOrientation(currentCameraAngle, currentPhoto, destinationPhoto)
      }
      break

    case 'cross-building':
      // Use directional intent for cross-building movement
      if (direction === 'forward') {
        return destinationPhoto.directions.forward?.angle ?? destinationPhoto.startingAngle ?? 0
      } else if (direction === 'back') {
        return destinationPhoto.directions.back?.angle ?? destinationPhoto.startingAngle ?? 0
      }
      break

    case 'same-building-corner':
    case 'turn':
    default:
      // For corner navigation, preserve directional intent when possible
      if (direction === 'forward') {
        return destinationPhoto.directions.forward?.angle ?? destinationPhoto.startingAngle ?? 0
      } else if (direction === 'back') {
        return destinationPhoto.directions.back?.angle ?? destinationPhoto.startingAngle ?? 0
      } else {
        return destinationPhoto.startingAngle ?? 0
      }
  }

  return destinationPhoto.startingAngle ?? 0
}
```

#### Step 5: Preserved Orientation Calculation (src/hooks/useTourNavigation.ts)
For same-corridor movement, we maintain the user's relative position to the corridor:

```typescript
// src/hooks/useTourNavigation.ts - calculatePreservedOrientation function
function calculatePreservedOrientation(
  currentCameraAngle: number,
  currentPhoto: Photo,
  destinationPhoto: Photo
): number {
  const currentForward = currentPhoto.directions.forward?.angle
  const destForward = destinationPhoto.directions.forward?.angle

  if (currentForward === undefined || destForward === undefined) {
    return currentCameraAngle
  }

  // Calculate user's relative orientation to current corridor
  let relativeAngle = currentCameraAngle - currentForward

  // Normalize angle to -180 to 180 range
  while (relativeAngle > 180) relativeAngle -= 360
  while (relativeAngle < -180) relativeAngle += 360

  // Apply same relative orientation to destination corridor
  let newAngle = destForward + relativeAngle

  // Normalize result to 0-360 range
  while (newAngle < 0) newAngle += 360
  while (newAngle >= 360) newAngle -= 360

  return newAngle
}
```

**Example**: User in A Block hallway facing 45° right of forward direction. When moving to next photo, they should still face 45° right of that photo's forward direction.

#### Step 6: Image Preloading and State Update (src/hooks/useTourNavigation.ts)
```typescript
// src/hooks/useTourNavigation.ts - within navigateDirection function
const img = new Image()
img.onload = () => {
  setCurrentPhotoId(finalTargetId)
  setCalculatedCameraAngle(calculatedAngle)  // Triggers camera reorientation
  setIsLoading(false)
}
img.onerror = () => {
  setIsLoading(false)
  console.error('Failed to load image:', targetPhoto.imageUrl)
}
img.src = targetPhoto.imageUrl
```

**Why Preload**: Ensures smooth transitions by loading the destination image before switching, preventing loading flickers.

### The Panoramic Viewer: Three.js Integration (src/components/viewer/PanoramicViewer.tsx)

The `PanoramicViewer` component renders 360° photos using Three.js and handles camera orientation:

```typescript
// src/components/viewer/PanoramicViewer.tsx
export function PanoramicViewer({
  imageUrl,
  onCameraChange,
  calculatedCameraAngle,
  startingAngle
}: PanoramicViewerProps) {

  // Three.js scene setup
  const sceneRef = useRef<THREE.Scene>()
  const cameraRef = useRef<THREE.PerspectiveCamera>()
  const rendererRef = useRef<THREE.WebGLRenderer>()

  // Camera orientation state
  const [targetLon, setTargetLon] = useState(startingAngle ?? 0)
  const [targetLat, setTargetLat] = useState(0)
}
```

#### Camera Orientation Logic (src/components/viewer/PanoramicViewer.tsx)
When a new photo loads, the viewer applies the calculated camera angle:

```typescript
// src/components/viewer/PanoramicViewer.tsx - texture loading useEffect
useEffect(() => {
  if (!imageUrl) return

  const texture = new THREE.TextureLoader().load(imageUrl, () => {
    // Photo loaded successfully - apply camera orientation
    if (calculatedCameraAngle !== undefined) {
      setTargetLon(calculatedCameraAngle)  // Use navigation-calculated angle
      setTargetLat(0)
    } else if (startingAngle !== undefined) {
      setTargetLon(startingAngle)          // Use photo's default starting angle
      setTargetLat(0)
    }
  })
}, [imageUrl, calculatedCameraAngle, startingAngle])
```

**Critical Timing**: Camera orientation is set AFTER texture loading completes to prevent race conditions where orientation is applied before the photo renders.

#### Animation Loop (src/components/viewer/PanoramicViewer.tsx)
```typescript
// src/components/viewer/PanoramicViewer.tsx - animate function
const animate = useCallback(() => {
  if (!cameraRef.current) return

  // Smooth camera interpolation toward target
  lon += (targetLon - lon) * 0.1
  lat += (targetLat - lat) * 0.1

  // Apply spherical coordinates to camera
  const phi = THREE.MathUtils.degToRad(90 - lat)
  const theta = THREE.MathUtils.degToRad(lon)

  cameraRef.current.lookAt(
    Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta)
  )

  // Update state for navigation component
  onCameraChange(lon, lat)
}, [lon, lat, targetLon, targetLat, onCameraChange])
```

### Directional Navigation UI Component (src/components/viewer/DirectionalNavigation.tsx)

The `DirectionalNavigation` component provides the navigation buttons:

```typescript
// src/components/viewer/DirectionalNavigation.tsx
export function DirectionalNavigation({
  currentPhoto,
  cameraLon,
  cameraLat,
  onNavigate
}: DirectionalNavigationProps) {

  // Check each direction for availability and visibility
  const directions = ['forward', 'back', 'left', 'right'] as const

  return directions.map(direction => {
    const directionDef = currentPhoto.directions[direction]
    if (!directionDef) return null

    const isVisible = isLookingInDirection(cameraLon, direction, directionDef.angle)

    return isVisible ? (
      <DirectionButton
        key={direction}
        direction={direction}
        onClick={() => onNavigate(direction)}
      />
    ) : null
  })
}
```

#### Direction Detection Algorithm (src/components/viewer/DirectionalNavigation.tsx)
```typescript
// src/components/viewer/DirectionalNavigation.tsx - isLookingInDirection function
function isLookingInDirection(
  cameraLon: number,
  direction: string,
  directionAngle: number,
  tolerance: number = 45
): boolean {
  // Calculate angular difference between camera and direction
  let angleDiff = Math.abs(cameraLon - directionAngle)

  // Handle wraparound (e.g., 350° vs 10°)
  if (angleDiff > 180) {
    angleDiff = 360 - angleDiff
  }

  // Show button if looking within tolerance of direction
  return angleDiff <= tolerance
}
```

**Example**: Forward direction at 0°, user looking at 30°. Difference = 30°, which is < 45° tolerance, so "Go Forward" button appears.

### Photo Lookup System (src/data/tourUtilities.ts)

The `tourUtilities.ts` provides centralized photo management:

```typescript
// src/data/tourUtilities.ts - findPhotoById function
const photoCache = new Map<string, Photo>()

export function findPhotoById(photoId: string): Photo | null {
  // Check cache first
  if (photoCache.has(photoId)) {
    return photoCache.get(photoId)!
  }

  // Search all areas for the photo
  const allAreas = getAllAreas()
  for (const area of allAreas) {
    if ('photos' in area) {
      const found = area.photos.find((photo: Photo) => photo.id === photoId)
      if (found) {
        photoCache.set(photoId, found)  // Cache for future lookups
        return found
      }
    }
  }

  return null
}
```

**Performance Note**: Caching prevents repeated linear searches through all photos, especially important during rapid navigation.

### Error Handling and Edge Cases

#### Navigation Prevention (src/hooks/useTourNavigation.ts)
```typescript
// src/hooks/useTourNavigation.ts - navigateDirection function
const navigateDirection = useCallback((direction) => {
  if (!currentPhoto || isLoading) return  // Prevent navigation during transitions

  const targetPhotoId = currentPhoto.directions[direction]?.connection
  if (!targetPhotoId) return  // No connection available

  setIsLoading(true)  // Prevent multiple simultaneous navigations
}, [currentPhoto, isLoading])
```

#### Image Loading Failures (src/hooks/useTourNavigation.ts)
```typescript
// src/hooks/useTourNavigation.ts - within navigateDirection function
img.onerror = () => {
  setIsLoading(false)
  console.error('Failed to load image:', targetPhoto.imageUrl)
  // User can try navigation again - loading state is cleared
}
```

#### Invalid Photo References (src/hooks/useTourNavigation.ts)
```typescript
// src/hooks/useTourNavigation.ts - within navigateDirection function
const targetPhoto = findPhotoById(finalTargetId)
if (!targetPhoto) {
  setIsLoading(false)
  console.error('Target photo not found:', finalTargetId)
  return
}
```

### Performance Optimizations

#### Image Preloading Strategy (src/hooks/useTourNavigation.ts)
```typescript
// src/hooks/useTourNavigation.ts - within navigateDirection function
const img = new Image()
img.onload = () => {
  // Immediate state update - no loading delay for user
  setCurrentPhotoId(finalTargetId)
  setCalculatedCameraAngle(calculatedAngle)
  setIsLoading(false)
}
img.src = targetPhoto.imageUrl  // Triggers download
```

**Why This Works**: User sees immediate feedback (loading state), while image loads in background. Once loaded, transition is instant.

#### Texture Cleanup (src/components/viewer/PanoramicViewer.tsx)
```typescript
// src/components/viewer/PanoramicViewer.tsx - cleanup useEffect
useEffect(() => {
  return () => {
    // Cleanup Three.js resources to prevent memory leaks
    if (textureRef.current) {
      textureRef.current.dispose()
    }
  }
}, [imageUrl])
```

#### State Update Batching (src/hooks/useTourNavigation.ts)
```typescript
// src/hooks/useTourNavigation.ts - React automatically batches these
setCurrentPhotoId(finalTargetId)
setCalculatedCameraAngle(calculatedAngle)
setIsLoading(false)
```

This technical implementation creates a robust navigation system that handles complex spatial relationships, preserves user orientation context, and provides smooth transitions between 360° photos while maintaining performance and reliability.