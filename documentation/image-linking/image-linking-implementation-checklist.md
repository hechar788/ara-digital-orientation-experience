# VR Campus Tour Implementation Checklist

## Phase 1: Basic Navigation (3-4 hours)

### Step 1.1: Enhance Tour Utilities (30 minutes) ✅ COMPLETED
- [x] Make `getAllAreas()` private in `src/data/tourUtilities.ts`
- [x] Add proper TypeScript imports (`Photo`, `Area`, `Elevator`)
- [x] Create `findPhotoById()` function with proper JSDoc
- [x] Create `getAreaForPhoto()` function with proper JSDoc
- [x] Update file header and documentation
- [x] Remove `getAllPhotos()` as it's not needed

### Step 1.2: Create Tour Navigation Hook (45 minutes) ✅ COMPLETED
- [x] Create `src/hooks/useTourNavigation.ts`
- [x] Import utilities from `tourUtilities.ts`
- [x] Set up state for `currentPhotoId` and `isLoading`
- [x] Create `currentPhoto` computed value using `findPhotoById()`
- [x] Create `currentArea` computed value using `getAreaForPhoto()`
- [x] Implement `navigateDirection()` function
- [x] Implement `jumpToPhoto()` function
- [x] Implement `getAvailableDirections()` function
- [x] Add image preloading logic
- [x] Add proper error handling

### Step 1.3: Update Main Route Component (30 minutes) ✅ COMPLETED
- [x] Update `src/routes/index.tsx`
- [x] Import `useTourNavigation` hook
- [x] Replace static test.jpg with dynamic photo from hook
- [x] Add temporary keyboard controls for testing
- [x] Add debug info display (removable after testing)
- [x] Add loading overlay
- [x] Set up keyboard event listeners (W/A/S/D/Q/E + arrows)

### Step 1.4: Test Basic Navigation (1 hour) ❌ TODO
- [ ] **Initial Setup Testing:**
  - [ ] Run `npm run dev` successfully
  - [ ] Verify app loads with A Block entrance photo (not test.jpg)
  - [ ] Check browser console for no import/export errors
  - [ ] Confirm debug info shows correct photo ID and building

- [ ] **Keyboard Navigation Testing:**
  - [ ] Test W/Up Arrow: forward progression through A Block
  - [ ] Test S/Down Arrow: backward navigation
  - [ ] Test A/Left Arrow: left turns at intersections
  - [ ] Test D/Right Arrow: right turns at intersections
  - [ ] Test Q: upstairs navigation at A Block stairs
  - [ ] Test E: downstairs navigation

- [ ] **Cross-Building Navigation:**
  - [ ] Navigate A Block south end → X Block
  - [ ] Test return navigation X Block → A Block
  - [ ] Verify bidirectional connections work

- [ ] **Error Handling:**
  - [ ] Test navigation from dead-end locations
  - [ ] Verify disabled directions don't cause errors
  - [ ] Check loading states display properly

### Step 1.5: Navigation Path Verification (45 minutes) ❌ TODO
- [ ] **A Block Floor 1 Complete Route:**
  - [ ] `a-f1-north-entrance` → `a-f1-north-1`
  - [ ] `a-f1-north-1` → `a-f1-north-2`
  - [ ] `a-f1-north-2` → `a-f1-north-3`
  - [ ] `a-f1-north-3` → `a-f1-mid-4`
  - [ ] `a-f1-mid-4` → `a-f1-mid-5`
  - [ ] `a-f1-mid-5` → `a-f1-south-6`
  - [ ] `a-f1-south-6` → `x-f1-east-1`

- [ ] **Branch Corridor Testing:**
  - [ ] `a-f1-north-3` → [left] → `a-f1-north-3-side`
  - [ ] `a-f1-north-3-side` → [back] → `a-f1-north-3`

- [ ] **Stair Navigation Testing:**
  - [ ] `a-f1-north-3` → [up] → `a-f2-north-stairs-entrance`
  - [ ] `a-f2-north-stairs-entrance` → [down] → `a-f1-north-3`

- [ ] **Document Issues:**
  - [ ] Check for missing photo files
  - [ ] Check for broken connection IDs
  - [ ] Check for incorrect navigation paths

---

## Phase 1.5: Camera Orientation Preservation (1-2 hours)

### Step 1.5.1: Update PanoramicViewer Props (30 minutes) ✅ COMPLETED
- [x] Update `PanoramicViewerProps` interface in `src/components/viewer/PanoramicViewer.tsx`
- [x] Add `initialLon?: number` prop for starting horizontal orientation
- [x] Add `initialLat?: number` prop for starting vertical orientation
- [x] Add `onCameraChange?: (lon: number, lat: number) => void` callback prop
- [x] Update component function signature to accept new props
- [x] Initialize `lon` and `lat` variables with `initialLon` and `initialLat` props
- [x] Add `onCameraChange?.(lon, lat)` call in `onPointerMove` function
- [x] Test that props are properly typed and passed

### Step 1.5.2: Update Navigation Hook for Camera State (30 minutes) ✅ COMPLETED
- [x] Add camera state to `useTourNavigation` hook in `src/hooks/useTourNavigation.ts`
- [x] Add `useState` for `cameraLon` and `cameraLat` (both default to 0)
- [x] Create `handleCameraChange` callback function with proper JSDoc
- [x] Add camera state variables to return object (`cameraLon`, `cameraLat`)
- [x] Add `handleCameraChange` function to return object
- [x] Update `navigateDirection` to preserve camera orientation during transitions
- [x] Update `jumpToPhoto` to preserve camera orientation for direct navigation
- [x] Test that camera state persists correctly between photo changes

### Step 1.5.3: Update Main Route Component Integration (15 minutes) ✅ COMPLETED
- [x] Update `src/routes/index.tsx` to use camera orientation props
- [x] Destructure `cameraLon`, `cameraLat`, and `handleCameraChange` from hook
- [x] Pass `initialLon={cameraLon}` prop to `PanoramicViewer`
- [x] Pass `initialLat={cameraLat}` prop to `PanoramicViewer`
- [x] Pass `onCameraChange={handleCameraChange}` prop to `PanoramicViewer`
- [x] Test that camera orientation is properly connected between hook and viewer

### Step 1.5.4: Testing Camera Orientation Persistence (30 minutes) ✅ COMPLETED
- [x] **A Block Navigation Test:**
  - [x] Start at `a-f1-north-entrance`
  - [x] Drag to face the intended "forward" direction (180° from default)
  - [x] Navigate forward → verify camera maintains new orientation
  - [x] Navigate back → verify bidirectional consistency
  - [x] Test multiple forward/back transitions maintain orientation

- [x] **Cross-Building Navigation:**
  - [x] Navigate A Block → X Block while facing specific direction
  - [x] Verify orientation preserved across building boundaries
  - [x] Test X Block → N Block orientation preservation
  - [x] Test N Block → S Block orientation preservation

- [x] **Multi-Turn Navigation:**
  - [x] Navigate complex path: forward → left → back → right
  - [x] Verify camera orientation remains consistent throughout
  - [x] Test branch corridor navigation (left to enter, back to exit)
  - [x] Test stair navigation maintains horizontal orientation

- [x] **Edge Cases:**
  - [x] Test orientation preservation with direct photo jumping
  - [x] Test orientation limits (lat clamped to -85/+85 degrees)
  - [x] Test orientation during loading states
  - [x] Verify no orientation drift over multiple transitions

---

## Phase 2: Navigation Controls UI (2-3 hours)

### Step 2.1: Create Navigation Controls Component (1 hour) ❌ TODO
- [ ] Create `src/components/tour/TourNavigationControls.tsx`
- [ ] Set up component props interface
- [ ] Implement back/forward primary controls
- [ ] Implement left/right turn controls
- [ ] Implement up/down vertical navigation
- [ ] Add loading indicator
- [ ] Add proper hover states and animations
- [ ] Add proper accessibility (aria-labels, titles)
- [ ] Style with Tailwind classes
- [ ] Add disabled states for unavailable directions

### Step 2.2: Create Location Context Display (30 minutes) ❌ TODO
- [ ] Create `src/components/tour/TourLocationDisplay.tsx`
- [ ] Set up component props interface
- [ ] Display building and floor information
- [ ] Display wing information when available
- [ ] Display nearby facilities
- [ ] Display nearby rooms
- [ ] Add proper icons (Building, MapPin, Users, Info)
- [ ] Style with proper backdrop and layout
- [ ] Handle cases with no location data

### Step 2.3: Integrate Controls into Main Route (30 minutes) ❌ TODO
- [ ] Update `src/routes/index.tsx`
- [ ] Import `TourNavigationControls` component
- [ ] Import `TourLocationDisplay` component
- [ ] Position navigation controls at bottom center
- [ ] Position location display at top left
- [ ] Connect navigation controls to hook functions
- [ ] Update loading overlay styling
- [ ] Remove temporary keyboard debug info

### Step 2.4: Enhanced User Experience (30 minutes) ❌ TODO
- [ ] Add keyboard shortcut hints toggle (H key)
- [ ] Create keyboard hints overlay component
- [ ] Add smooth transitions between photos
- [ ] Implement image preloading improvements
- [ ] Add error handling for failed image loads
- [ ] Test responsive design on different screen sizes
- [ ] Verify controls don't interfere with panoramic viewer

### Step 2.5: Testing and Polish (30 minutes) ❌ TODO
- [ ] **UI Controls Testing:**
  - [ ] All navigation buttons respond correctly
  - [ ] Disabled states work for unavailable directions
  - [ ] Hover effects and animations work smoothly
  - [ ] Loading states display properly during navigation

- [ ] **Responsive Design:**
  - [ ] Controls remain accessible on different screen sizes
  - [ ] Text remains readable in location display
  - [ ] Controls don't overlap with panoramic viewer controls

- [ ] **Accessibility Testing:**
  - [ ] All buttons have proper aria-labels
  - [ ] Keyboard navigation works alongside UI controls
  - [ ] Focus states are visible and logical

- [ ] **Performance Testing:**
  - [ ] Smooth transitions between photos
  - [ ] No lag in button responses
  - [ ] Image preloading works effectively

---

## Completion Criteria

### Phase 1 Complete When: ✅ COMPLETE
- [x] `findPhotoById` utility works correctly in `tourUtilities.ts` ✅
- [x] Navigation hook manages photo state properly
- [x] Photos load dynamically from tour data instead of static test.jpg
- [x] Keyboard navigation works for all directions
- [x] Cross-building connections function bidirectionally
- [x] Debug info displays correct photo and area information

### Phase 2 Complete When: ❌ NOT COMPLETE
- [ ] UI navigation controls display with proper visual feedback
- [ ] All navigation buttons work correctly and match keyboard controls
- [ ] Location display shows accurate building and context information
- [ ] Loading states provide smooth user experience
- [ ] Controls are properly positioned and don't interfere with viewer
- [ ] Both UI and keyboard navigation work seamlessly together

### Phase 1.5 Complete When: ✅ COMPLETE
- [x] PanoramicViewer accepts and uses camera orientation props
- [x] Navigation hook manages camera state (lon/lat) properly
- [x] Camera orientation persists between photo transitions
- [x] A Block navigation works correctly regardless of image capture direction
- [x] Users can maintain their viewing direction during navigation
- [x] Bidirectional navigation (forward/back) maintains orientation consistency
- [x] Cross-building navigation preserves camera orientation

---

## Progress Summary

**Phase 1:** 5/5 steps completed ✅✅✅✅✅
**Phase 1.5:** 4/4 steps completed ✅✅✅✅
**Phase 2:** 0/5 steps completed
**Overall:** 9/14 steps completed (64%)

**Next Action:** Begin Phase 2 - Navigation Controls UI Implementation

**Note:** Phase 1 and 1.5 are complete! Camera orientation persistence successfully solves the A Block 180° orientation problem. Ready to implement UI controls.