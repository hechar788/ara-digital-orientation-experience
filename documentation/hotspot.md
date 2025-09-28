# VR Tour Hotspot Implementation Plan

## Current State Analysis

The hotspot system is **already implemented** in the data layer and navigation logic:

✅ **Types defined**: `NavigationHotspot` and `ElevatorHotspot` interfaces exist
✅ **Data configured**: Elevator hotspots have theta/phi coordinates in data files
✅ **Navigation works**: `useTourNavigation.ts` handles `'floor1'`, `'floor2'`, `'floor3'` directions
✅ **Data conversion**: `tourUtilities.ts` converts elevator hotspots to navigation format

## What's Missing: 3D Visualization Only

The **only missing piece** is rendering the hotspots as clickable 3D objects in the panoramic viewer.

## Simplified Implementation Plan

### Step 1: Create Hotspot Renderer Component

**What**: Build component to render existing hotspot data as 3D objects.

**Input**: Uses existing `currentPhoto.hotspots` array from navigation system.

```typescript
// src/components/viewer/PanoramicHotspots.tsx
interface PanoramicHotspotsProps {
  currentPhoto: Photo | null
  sceneRef: React.RefObject<{ scene: THREE.Scene, camera: THREE.Camera }>
  onNavigate: (direction: string) => void
}

export const PanoramicHotspots: React.FC<PanoramicHotspotsProps> = ({
  currentPhoto,
  sceneRef,
  onNavigate
}) => {
  const hotspots = currentPhoto?.hotspots || []

  // Render hotspots as 3D objects
  // Handle click detection
  // Call onNavigate(hotspot.direction) when clicked
}
```

### Step 2: Convert Theta/Phi to 3D Positions

**What**: Convert existing spherical coordinates to 3D positions on sphere inner surface.

**Input**: Uses existing `{theta: number, phi: number}` from hotspot data.

```typescript
// src/components/viewer/hotspot-utils.ts
export function sphericalToCartesian(theta: number, phi: number): THREE.Vector3 {
  const radius = 9.5 // Slightly inside the sphere (radius 10)
  const thetaRad = THREE.MathUtils.degToRad(theta)
  const phiRad = THREE.MathUtils.degToRad(phi)

  const x = radius * Math.sin(phiRad) * Math.cos(thetaRad)
  const y = radius * Math.cos(phiRad)
  const z = radius * Math.sin(phiRad) * Math.sin(thetaRad)

  return new THREE.Vector3(x, y, z)
}
```

### Step 3: Render Hotspots in Scene

**What**: Create 3D meshes at hotspot positions and attach to sphere.

**Uses**: Existing sphere mesh in `PanoramicViewer.tsx`.

```typescript
// Inside PanoramicHotspots component
useEffect(() => {
  if (!sceneRef.current || !hotspots.length) return

  const { scene } = sceneRef.current
  const sphere = scene.children.find(child => child instanceof THREE.Mesh)

  if (!sphere) return

  // Create hotspots group
  let hotspotsGroup = sphere.children.find(child => child.name === 'hotspots') as THREE.Group
  if (!hotspotsGroup) {
    hotspotsGroup = new THREE.Group()
    hotspotsGroup.name = 'hotspots'
    sphere.add(hotspotsGroup) // Attach to sphere for inheritance
  }

  // Clear and rebuild hotspots
  hotspotsGroup.clear()

  hotspots.forEach((hotspot, index) => {
    const position = sphericalToCartesian(hotspot.position.theta, hotspot.position.phi)

    // Create hotspot geometry based on direction type
    const geometry = new THREE.SphereGeometry(0.1, 8, 6)
    const material = new THREE.MeshBasicMaterial({
      color: getHotspotColor(hotspot.direction),
      transparent: true,
      opacity: 0.8
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.copy(position)
    mesh.userData = { direction: hotspot.direction, index }
    mesh.name = `hotspot-${index}`

    hotspotsGroup.add(mesh)
  })
}, [hotspots])

function getHotspotColor(direction: string): number {
  if (direction.startsWith('floor')) return 0x0066ff // Blue for elevator floors
  if (direction === 'up') return 0x00ff00 // Green for up stairs
  if (direction === 'down') return 0xff6600 // Orange for down stairs
  return 0xff0000 // Red for other
}
```

### Step 4: Handle Click Detection

**What**: Detect clicks on hotspot meshes using raycasting.

**Output**: Calls existing `navigateDirection(direction)` function.

```typescript
// Inside PanoramicHotspots component
const handleClick = useCallback((event: MouseEvent) => {
  if (!sceneRef.current) return

  const { scene, camera } = sceneRef.current
  const canvas = event.target as HTMLCanvasElement
  const rect = canvas.getBoundingClientRect()

  // Convert mouse position to normalized coordinates
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  )

  // Raycast to find intersections
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)

  const sphere = scene.children.find(child => child instanceof THREE.Mesh)
  const hotspotsGroup = sphere?.children.find(child => child.name === 'hotspots')

  if (hotspotsGroup) {
    const intersects = raycaster.intersectObjects(hotspotsGroup.children)
    if (intersects.length > 0) {
      const clickedHotspot = intersects[0].object
      const direction = clickedHotspot.userData.direction
      onNavigate(direction) // Call existing navigation function
    }
  }
}, [onNavigate])

useEffect(() => {
  const canvas = sceneRef.current?.scene.children[0]?.parent?.domElement
  if (canvas) {
    canvas.addEventListener('click', handleClick)
    return () => canvas.removeEventListener('click', handleClick)
  }
}, [handleClick])
```

### Step 5: Integrate with PanoramicViewer

**What**: Add hotspot component to existing panoramic viewer.

**Connection**: Pass current photo and navigation function from existing system.

```typescript
// In PanoramicViewer.tsx - add hotspot integration
import { PanoramicHotspots } from './PanoramicHotspots'

// Add props for navigation
interface PanoramicViewerProps {
  // ... existing props ...
  currentPhoto?: Photo | null
  onNavigate?: (direction: string) => void
}

// Inside PanoramicViewer component JSX
return (
  <div className={`${className} relative`}>
    <div ref={mountRef} className="h-screen w-screen absolute inset-0">
      {/* Existing viewer content */}
    </div>

    {/* Add hotspot system */}
    {currentPhoto && onNavigate && (
      <PanoramicHotspots
        currentPhoto={currentPhoto}
        sceneRef={sceneDataRef}
        onNavigate={onNavigate}
      />
    )}

    {/* Existing controls */}
    <PanoramicViewerControls />
  </div>
)
```

### Step 6: Connect to Main Tour Component

**What**: Pass photo and navigation data from tour hook to viewer.

**Uses**: Existing `useTourNavigation` hook and data.

```typescript
// In main tour component (wherever PanoramicViewer is used)
const { currentPhoto, navigateDirection } = useTourNavigation()

return (
  <PanoramicViewer
    imageUrl={currentPhoto?.imageUrl || ''}
    currentPhoto={currentPhoto}
    onNavigate={navigateDirection} // Pass existing navigation function
    // ... other existing props
  />
)
```

## Testing with Existing Data

The system can be immediately tested with existing elevator hotspots:

- **X Block Elevator**: Has 3 hotspots for floors 1, 2, 3
- **N/S Block Elevator**: Has 3 hotspots for floors 1, 2, 4

When users navigate to elevator interior photos, hotspots will automatically render at the configured theta/phi coordinates and clicking them will trigger the existing navigation to the correct floors.

## Implementation Phases

### Phase 1: Basic Rendering (1 day)
- Create `PanoramicHotspots` component
- Implement coordinate conversion
- Render simple sphere hotspots
- Test with elevator data

### Phase 2: Interaction (1 day)
- Add raycasting click detection
- Connect to navigation system
- Test navigation flow

### Phase 3: Polish (1 day)
- Improve hotspot visual design
- Add hover effects
- Handle edge cases

## Expected Outcome

Users will see clickable 3D objects floating at the exact positions of elevator buttons and stairs in the 360° photos. Clicking these objects will trigger the existing navigation system to move between floors, providing an immersive and intuitive navigation experience.

The entire implementation leverages the existing, complete data and navigation infrastructure - only adding the visual 3D rendering layer.