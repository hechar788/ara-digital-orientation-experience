# Stairs and Elevator Hotspots Implementation

## Overview
This document outlines the step-by-step process of updating the VR tour application's hotspot system to standardize stairs and elevator hotspots as white spheres with appropriate SVG icons.

## Problem Statement
The original hotspot system used different geometries for different navigation types:
- **Stairs (up)**: Green cone pointing up
- **Stairs (down)**: Orange cone pointing down
- **Elevator**: Blue box/rectangle
- **Other hotspots**: Various colored spheres and circles

The client requested that all stairs and elevator hotspots be standardized as **white spheres with appropriate SVG icons** while maintaining all existing functionality.

## Solution Architecture

### Key Files Modified
1. `src/components/viewer/hotspot-utils.ts` - Core hotspot creation and styling logic
2. `src/components/viewer/PanoramicHotspots.tsx` - Hotspot rendering and interaction handling

### Technical Approach
Instead of using different geometries, we now create **composite hotspots** consisting of:
1. **Base sphere**: White solid sphere (0.45 radius)
2. **Icon overlay**: Semi-transparent plane with SVG texture positioned slightly in front
3. **Group container**: THREE.Group containing both sphere and icon for unified interaction

## Implementation Steps

### Step 1: Explore Codebase Structure
- **Files analyzed**: Used `Grep` to search for "stairs" across the codebase
- **Key discoveries**:
  - Hotspot data stored in `src/data/blocks/*/floor*.ts` files
  - Rendering logic in `PanoramicHotspots.tsx`
  - Geometry creation in `hotspot-utils.ts`
  - TypeScript interfaces in `src/types/tour.ts`

### Step 2: Understand Current Hotspot System
- **Hotspot types**: `up`, `down`, `elevator`, `floor1`, `floor2`, etc.
- **Positioning**: 3D coordinates (x, y, z) on sphere surface
- **Interaction**: Click detection via Three.js raycasting
- **Navigation**: Triggers `onNavigate(direction)` callback

### Step 3: Create SVG Texture Loading System
**Added new function**: `createSVGTexture(svgPath: string)`
- Loads SVG files as text via fetch API
- Converts to HTML Image element via Blob URL
- Renders to canvas and creates THREE.CanvasTexture
- Implements caching to avoid reloading same SVG
- Returns promise-based texture for async loading

```typescript
async function createSVGTexture(svgPath: string): Promise<THREE.Texture> {
  // Check cache, load SVG, render to canvas, return texture
}
```

### Step 4: Update Stairs Hotspot Creation
**Modified**: `createHotspotGeometry()` function for `up` and `down` directions
- **Sphere**: `SphereGeometry(0.45, 16, 12)` with white material
- **Icon**: `PlaneGeometry(0.4, 0.4)` with `/svg/stairs.svg` texture
- **Positioning**: Icon at z: 0.46 (slightly in front of sphere)
- **Return**: THREE.Group containing sphere + icon
- **Fallback**: Plain white sphere if texture loading fails

### Step 5: Update Elevator Hotspot Creation
**Modified**: `createHotspotGeometry()` function for `elevator` direction
- **Sphere**: `SphereGeometry(0.45, 16, 12)` with white material
- **Icon**: `PlaneGeometry(0.4, 0.4)` with `/svg/elevator.svg` texture
- **Positioning**: Icon at z: 0.46 (slightly in front of sphere)
- **Return**: THREE.Group containing sphere + icon
- **Fallback**: Plain white sphere if texture loading fails

### Step 6: Update Component to Handle Groups
**Modified**: `PanoramicHotspots.tsx` to support THREE.Group objects
- **Hotspot creation**: Async handling for texture loading
- **Object handling**: Support both Mesh and Group objects
- **Click detection**: Recursive raycasting with parent traversal for userData
- **Scaling**: Applied to Group objects (affects both sphere and icon)
- **Cleanup**: Proper disposal of Group children (sphere + icon meshes)

### Step 7: Add Cursor Interaction
**Added**: Mouse hover detection for improved UX
- **Mouse tracking**: `handleCanvasMouseMove` function
- **Cursor changes**: `pointer` on hotspot hover, `grab` otherwise
- **Event listeners**: Added mousemove listener alongside click/touch

### Step 8: Fix Click Detection for Groups
**Issue**: Groups don't have same intersection behavior as individual meshes
**Solution**:
- Use `raycaster.intersectObjects(objects, true)` for recursive checking
- Traverse parent hierarchy to find object with `userData.direction`
- Maintain backward compatibility with existing Mesh-based hotspots

## Key Technical Details

### Texture Loading
- **Format**: SVG files converted to 64x64 canvas textures
- **Caching**: Map-based cache prevents duplicate loading
- **Error handling**: Graceful fallback to plain white spheres
- **Performance**: Async loading doesn't block initial render

### Group Structure
```
THREE.Group (hotspot container)
├── THREE.Mesh (white sphere)
│   ├── SphereGeometry(0.45, 16, 12)
│   └── MeshBasicMaterial({ color: 0xffffff })
└── THREE.Mesh (icon overlay)
    ├── PlaneGeometry(0.4, 0.4)
    └── MeshBasicMaterial({ map: svgTexture, transparent: true })
```

### Material Properties
- **Sphere**: Solid white, opaque (`opacity: 1.0, transparent: false`)
- **Icon**: Textured, transparent with alpha test (`alphaTest: 0.1`)
- **Rendering**: DoubleSide for consistent visibility

## Functionality Preserved

### Navigation
- ✅ Click detection works for all hotspot types
- ✅ Direction-based navigation preserved (`up`, `down`, `elevator`)
- ✅ Touch and mouse events both supported

### Visual Feedback
- ✅ Cursor changes to pointer on hover
- ✅ Hotspots scale with camera zoom level
- ✅ Consistent white sphere appearance

### Performance
- ✅ Proper memory cleanup (geometry/material disposal)
- ✅ Efficient texture caching
- ✅ Async loading doesn't block UI

## SVG Assets Used
- **Stairs**: `/public/svg/stairs.svg` - Step icon for up/down navigation
- **Elevator**: `/public/svg/elevator.svg` - Elevator icon for vertical transport

## Future Enhancements
- Could add more icon types for different hotspot categories
- Could implement icon color theming
- Could add animation effects (rotation, pulsing)
- Could optimize texture resolution based on device capabilities

## Testing Verification
- [x] Stairs hotspots render as white spheres with stairs icon
- [x] Elevator hotspots render as white spheres with elevator icon
- [x] Click navigation works for both stairs and elevator hotspots
- [x] Cursor changes to pointer on hotspot hover
- [x] All existing functionality preserved
- [x] No memory leaks or performance degradation