# VR Campus Tour Image Linking Implementation Guide

## Overview

This document provides a detailed breakdown for implementing Phases 1 and 2 of the VR tour navigation system. These phases focus on basic navigation functionality and UI controls to transform the existing static 360° viewer into a fully navigable campus tour.

## Current State Analysis

### What We Have
- ✅ Complete data structure in `src/data/blocks/` with all building areas
- ✅ Tour utilities in `src/data/tourUtilities.ts` with data aggregation
- ✅ TypeScript interfaces in `src/types/tour.ts`
- ✅ Working `PanoramicViewer` component for 360° display
- ✅ Static route displaying `/test.jpg`

### What We Need
- ✅ Photo lookup utilities for finding photos by ID
- ✅ Navigation state management for current photo tracking
- ✅ Navigation controls UI for directional movement
- ✅ Integration between tour data and panoramic viewer
- ✅ Camera orientation preservation between photo transitions
- ✅ Mobile-friendly directional navigation system
- ✅ Photo orientation correction system

---

## Phase 1: Basic Navigation (3-4 hours)

### Goal
Enable users to navigate between photos using directional connections (forward/back/left/right/up/down) with basic programmatic controls.

### Step 1.1: Enhance Tour Utilities (30 minutes)

**File: `src/data/tourUtilities.ts`**

Add photo lookup functionality to the existing utilities. The `getAllAreas()` function becomes private since it's only used internally:

```typescript
/**
 * VR Campus Tour Data Utilities
 *
 * Provides utility functions for accessing tour photo and area data.
 * Centralizes data access logic for finding photos and areas by ID.
 *
 * @fileoverview Tour data utilities for photo lookup and area context.
 */

import { aBlockAreas } from './blocks/a_block'
import { xBlockAreas } from './blocks/x_block'
import { nBlockAreas } from './blocks/n_block'
import { sBlockAreas } from './blocks/s_block'
import { nsBlockElevator } from './blocks/n_s_shared/elevator'
import type { Photo, Area, Elevator } from '../types/tour'

/**
 * Get all available areas in the tour system (private utility)
 *
 * Collects and returns all area definitions from all building blocks
 * and elevator systems. Used internally by public utility functions.
 *
 * @private
 * @returns Array of all area definitions and elevators
 */
const getAllAreas = (): any[] => {
  return [
    ...aBlockAreas,
    ...xBlockAreas,
    ...nBlockAreas,
    ...sBlockAreas,
    nsBlockElevator
  ]
}

/**
 * Find a specific photo by its ID across all areas and elevators
 *
 * Searches through all areas and elevator systems to locate a photo
 * with the specified ID. Returns null if no photo is found.
 *
 * @param photoId - Unique identifier for the photo to find
 * @returns Photo object if found, null otherwise
 *
 * @example
 * ```typescript
 * const photo = findPhotoById('a-f1-north-entrance')
 * if (photo) {
 *   console.log('Found photo:', photo.imageUrl)
 * }
 * ```
 */
export const findPhotoById = (photoId: string): Photo | null => {
  const allData = getAllAreas()

  for (const item of allData) {
    if ('photos' in item) {
      // Regular area
      const area = item as Area
      const photo = area.photos.find(p => p.id === photoId)
      if (photo) return photo
    } else if ('photo' in item) {
      // Elevator
      const elevator = item as Elevator
      if (elevator.photo.id === photoId) {
        // Convert elevator photo to regular photo format
        return {
          id: elevator.photo.id,
          imageUrl: elevator.photo.imageUrl,
          connections: {
            // Handle elevator floor connections differently
            // Could be extended to support elevator navigation
          }
        }
      }
    }
  }

  return null
}


/**
 * Get area information for a specific photo
 *
 * Finds which area contains the specified photo and returns
 * the area metadata (building block, floor level, etc.).
 *
 * @param photoId - Photo ID to look up
 * @returns Area object containing the photo, null if not found
 */
export const getAreaForPhoto = (photoId: string): Area | null => {
  const allData = getAllAreas()

  for (const item of allData) {
    if ('photos' in item) {
      const area = item as Area
      const hasPhoto = area.photos.some(p => p.id === photoId)
      if (hasPhoto) return area
    }
  }

  return null
}
```

### Step 1.2: Create Tour Navigation Hook (45 minutes)

**File: `src/hooks/useTourNavigation.ts`**

```typescript
/**
 * Custom hook for managing VR tour navigation state and photo transitions.
 * Handles current photo tracking, directional navigation, and loading states.
 *
 * @fileoverview Provides navigation logic for the VR campus tour system.
 */
import { useState, useCallback, useMemo } from 'react'
import { findPhotoById, getAreaForPhoto } from '../data/tourUtilities'
import type { Photo, Area } from '../types/tour'

/**
 * Hook for managing VR tour navigation state
 *
 * Provides state management for current photo, navigation between photos,
 * loading states, and area context. Handles all navigation logic including
 * directional movement and direct photo jumping.
 *
 * @returns Navigation state and control functions
 *
 * @example
 * ```typescript
 * const { currentPhoto, navigateDirection, isLoading } = useTourNavigation()
 *
 * // Navigate forward
 * navigateDirection('forward')
 *
 * // Jump to specific location
 * jumpToPhoto('x-f2-mid-7')
 * ```
 */
export function useTourNavigation() {
  const [currentPhotoId, setCurrentPhotoId] = useState<string>('a-f1-north-entrance')
  const [isLoading, setIsLoading] = useState(false)

  // Get current photo using centralized lookup
  const currentPhoto = useMemo(() => {
    return findPhotoById(currentPhotoId)
  }, [currentPhotoId])

  // Get current area context
  const currentArea = useMemo(() => {
    return getAreaForPhoto(currentPhotoId)
  }, [currentPhotoId])

  /**
   * Navigate in a specific direction based on current photo connections
   *
   * Checks if the requested direction is available from the current photo
   * and navigates to the target photo with loading state management.
   *
   * @param direction - Direction to navigate (forward, back, left, right, up, down)
   */
  const navigateDirection = useCallback((direction: 'forward' | 'back' | 'left' | 'right' | 'up' | 'down') => {
    if (!currentPhoto || isLoading) return

    const targetPhotoId = currentPhoto.connections[direction]
    if (targetPhotoId) {
      setIsLoading(true)

      // Handle array of connections (multi-floor elevators)
      const finalTargetId = Array.isArray(targetPhotoId) ? targetPhotoId[0] : targetPhotoId

      // Preload image before navigation
      const targetPhoto = findPhotoById(finalTargetId)
      if (targetPhoto) {
        const img = new Image()
        img.onload = () => {
          setTimeout(() => {
            setCurrentPhotoId(finalTargetId)
            setIsLoading(false)
          }, 200) // Smooth transition delay
        }
        img.onerror = () => {
          setIsLoading(false)
          console.error('Failed to load image:', targetPhoto.imageUrl)
        }
        img.src = targetPhoto.imageUrl
      } else {
        setIsLoading(false)
        console.error('Target photo not found:', finalTargetId)
      }
    }
  }, [currentPhoto, isLoading])

  /**
   * Jump directly to a specific photo by ID
   *
   * Navigates directly to any photo in the tour system without
   * following connection paths. Useful for location menu and search.
   *
   * @param photoId - Target photo ID to navigate to
   */
  const jumpToPhoto = useCallback((photoId: string) => {
    if (isLoading || photoId === currentPhotoId) return

    const targetPhoto = findPhotoById(photoId)
    if (targetPhoto) {
      setIsLoading(true)

      const img = new Image()
      img.onload = () => {
        setTimeout(() => {
          setCurrentPhotoId(photoId)
          setIsLoading(false)
        }, 300)
      }
      img.onerror = () => {
        setIsLoading(false)
        console.error('Failed to load image:', targetPhoto.imageUrl)
      }
      img.src = targetPhoto.imageUrl
    } else {
      console.error('Photo not found:', photoId)
    }
  }, [currentPhotoId, isLoading])

  /**
   * Get available navigation directions from current photo
   *
   * Returns an object indicating which directions are available
   * for navigation from the current location.
   *
   * @returns Object with boolean flags for each direction
   */
  const getAvailableDirections = useCallback(() => {
    if (!currentPhoto) return {}

    const { connections } = currentPhoto
    return {
      forward: !!connections.forward,
      back: !!connections.back,
      left: !!connections.left,
      right: !!connections.right,
      up: !!connections.up,
      down: !!connections.down,
      elevator: !!connections.elevator
    }
  }, [currentPhoto])

  return {
    // State
    currentPhotoId,
    currentPhoto,
    currentArea,
    isLoading,

    // Navigation functions
    navigateDirection,
    jumpToPhoto,
    getAvailableDirections
  }
}
```

### Step 1.3: Update Main Route Component (30 minutes)

**File: `src/routes/index.tsx`**

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { PanoramicViewer } from '../components/viewer/PanoramicViewer'
import { useTourNavigation } from '../hooks/useTourNavigation'

export const Route = createFileRoute('/')(({
  component: TourApp,
})

function TourApp() {
  const {
    currentPhoto,
    currentArea,
    isLoading,
    navigateDirection,
    currentPhotoId
  } = useTourNavigation()

  // Temporary keyboard controls for Phase 1 testing
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Prevent navigation when typing in input fields
      if (event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          event.preventDefault()
          navigateDirection('forward')
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          event.preventDefault()
          navigateDirection('back')
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault()
          navigateDirection('left')
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          event.preventDefault()
          navigateDirection('right')
          break
        case 'q':
        case 'Q':
          event.preventDefault()
          navigateDirection('up')
          break
        case 'e':
        case 'E':
          event.preventDefault()
          navigateDirection('down')
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [navigateDirection])

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-900 relative">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-xl font-medium">Loading...</div>
        </div>
      )}

      {/* Debug info - remove after Phase 1 testing */}
      <div className="absolute top-4 left-4 z-50 text-white bg-black/70 p-3 rounded-lg text-sm">
        <div><strong>Photo:</strong> {currentPhotoId}</div>
        {currentArea && (
          <>
            <div><strong>Building:</strong> {currentArea.name}</div>
            <div><strong>Floor:</strong> {currentArea.floorLevel}</div>
          </>
        )}
        <div className="mt-2 text-xs opacity-75">
          Use WASD or arrow keys to navigate<br/>
          Q/E for up/down stairs
        </div>
      </div>

      <PanoramicViewer
        imageUrl={currentPhoto?.imageUrl}
        className="w-full h-full"
      />
    </div>
  )
}
```

### Step 1.4: Test Basic Navigation (1 hour)

**Testing Steps:**

1. **Initial Setup Testing:**
   ```bash
   npm run dev
   ```
   - Verify app loads with A Block entrance photo instead of test.jpg
   - Check browser console for any import/export errors
   - Confirm debug info displays correct photo ID and building info

2. **Keyboard Navigation Testing:**
   - **W/Up Arrow:** Test forward progression through A Block
   - **S/Down Arrow:** Test backward navigation
   - **A/Left Arrow:** Test left turns at intersections
   - **D/Right Arrow:** Test right turns at intersections
   - **Q:** Test upstairs navigation (at A Block stairs)
   - **E:** Test downstairs navigation

3. **Cross-Building Navigation:**
   - Navigate from A Block south end to X Block
   - Test return navigation from X Block to A Block
   - Verify connection points work bidirectionally

4. **Error Handling:**
   - Test navigation from dead-end locations
   - Verify disabled directions don't cause errors
   - Check loading states display properly

### Step 1.5: Navigation Path Verification (45 minutes)

**Complete Navigation Flow Testing:**

1. **A Block Floor 1 Complete Route:**
   ```
   a-f1-north-entrance → a-f1-north-1 → a-f1-north-2 → a-f1-north-3
   → a-f1-mid-4 → a-f1-mid-5 → a-f1-south-6 → x-f1-east-1
   ```

2. **Branch Corridor Testing:**
   ```
   a-f1-north-3 → [left] → a-f1-north-3-side → [back] → a-f1-north-3
   ```

3. **Stair Navigation Testing:**
   ```
   a-f1-north-3 → [up] → a-f2-north-stairs-entrance → [down] → a-f1-north-3
   ```

4. **Document any issues:**
   - Missing photo files
   - Broken connection IDs
   - Incorrect navigation paths

---

## Phase 1.5: Camera Orientation Preservation (1-2 hours)

### Goal
Implement camera orientation persistence between photo transitions to solve the A Block image orientation issue and provide Google Street View-style navigation continuity.

### Problem Statement
Currently, when navigating between photos, the camera orientation resets to a default position (0°, 0°). This causes several issues:

1. **A Block Orientation Issue**: A Block photos were captured facing 180° opposite to the intended navigation direction
2. **User Disorientation**: Users lose their viewing direction when transitioning between photos
3. **Unnatural Navigation**: Unlike Google Street View, users must reorient themselves after each move

### Solution: Persistent Camera Orientation
Preserve the user's camera rotation (longitude/latitude) when navigating between photos, allowing them to maintain their viewing direction naturally.

### Step 1.5.1: Update PanoramicViewer Props (30 minutes)

**File: `src/components/viewer/PanoramicViewer.tsx`**

Add camera orientation props to the component interface:

```typescript
interface PanoramicViewerProps {
  imageUrl: string
  className?: string
  initialLon?: number
  initialLat?: number
  onCameraChange?: (lon: number, lat: number) => void
}
```

Update component to use initial orientation and emit changes:

```typescript
export const PanoramicViewer: React.FC<PanoramicViewerProps> = ({
  imageUrl,
  className = '',
  initialLon = 0,
  initialLat = 0,
  onCameraChange
}) => {
  // Initialize camera position with props
  let lon = initialLon
  let lat = initialLat

  // Emit camera changes during mouse/touch movement
  const onPointerMove = (event: PointerEvent | TouchEvent) => {
    if (!isMouseDown) return

    event.preventDefault()
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY

    lon = (onPointerDownPointerX - clientX) * 0.2 + onPointerDownLon
    lat = (clientY - onPointerDownPointerY) * 0.2 + onPointerDownLat
    lat = Math.max(-85, Math.min(85, lat))

    // Emit camera change for persistence
    onCameraChange?.(lon, lat)
  }
}
```

### Step 1.5.2: Update Navigation Hook for Camera State (30 minutes)

**File: `src/hooks/useTourNavigation.ts`**

Add camera orientation state management to the navigation hook:

```typescript
export function useTourNavigation() {
  const [currentPhotoId, setCurrentPhotoId] = useState<string>('a-f1-north-entrance')
  const [isLoading, setIsLoading] = useState(false)
  const [cameraLon, setCameraLon] = useState(0)
  const [cameraLat, setCameraLat] = useState(0)

  /**
   * Handle camera orientation changes from the panoramic viewer
   *
   * Stores the current camera orientation for persistence during navigation.
   * Called whenever the user drags to look around in the 360° view.
   */
  const handleCameraChange = useCallback((lon: number, lat: number) => {
    setCameraLon(lon)
    setCameraLat(lat)
  }, [])

  /**
   * Navigate maintaining camera orientation
   *
   * Preserves the user's viewing direction when transitioning between photos,
   * providing continuity similar to Google Street View navigation.
   */
  const navigateDirection = useCallback((direction: 'forward' | 'back' | 'left' | 'right' | 'up' | 'down') => {
    if (!currentPhoto || isLoading) return

    const targetPhotoId = currentPhoto.connections[direction]
    if (targetPhotoId) {
      setIsLoading(true)
      const finalTargetId = Array.isArray(targetPhotoId) ? targetPhotoId[0] : targetPhotoId

      const targetPhoto = findPhotoById(finalTargetId)
      if (targetPhoto) {
        const img = new Image()
        img.onload = () => {
          setTimeout(() => {
            setCurrentPhotoId(finalTargetId)
            // Camera orientation (cameraLon, cameraLat) is preserved automatically
            setIsLoading(false)
          }, 200)
        }
        img.onerror = () => {
          setIsLoading(false)
          console.error('Failed to load image:', targetPhoto.imageUrl)
        }
        img.src = targetPhoto.imageUrl
      }
    }
  }, [currentPhoto, isLoading, cameraLon, cameraLat])

  return {
    // State
    currentPhotoId,
    currentPhoto,
    currentArea,
    isLoading,
    cameraLon,
    cameraLat,

    // Navigation functions
    navigateDirection,
    jumpToPhoto,
    getAvailableDirections,
    handleCameraChange
  }
}
```

### Step 1.5.3: Update Main Route Component Integration (15 minutes)

**File: `src/routes/index.tsx`**

Connect the camera orientation preservation:

```typescript
function TourApp() {
  const {
    currentPhoto,
    currentArea,
    isLoading,
    navigateDirection,
    cameraLon,
    cameraLat,
    handleCameraChange
  } = useTourNavigation()

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-900 relative">
      <PanoramicViewer
        imageUrl={currentPhoto?.imageUrl}
        className="w-full h-full"
        initialLon={cameraLon}
        initialLat={cameraLat}
        onCameraChange={handleCameraChange}
      />

      {/* Navigation controls and location display remain the same */}
    </div>
  )
}
```

### Step 1.5.4: Testing Camera Orientation Persistence (30 minutes)

**Testing Scenarios:**

1. **A Block Navigation Test:**
   - Start at `a-f1-north-entrance`
   - Drag to face the "forward" direction (opposite of image default)
   - Navigate forward → verify camera maintains orientation
   - Navigate back → verify bidirectional consistency

2. **Cross-Building Navigation:**
   - Navigate from A Block to X Block while facing a specific direction
   - Verify orientation is preserved across building boundaries

3. **Multi-Turn Navigation:**
   - Navigate through complex paths (forward → left → back → right)
   - Verify camera orientation remains consistent with user's intended direction

### Benefits of This Solution

1. **Solves A Block Issue**: Users can orient themselves correctly regardless of how photos were captured
2. **Natural Navigation**: Maintains viewing direction like Google Street View
3. **Bidirectional Consistency**: Works correctly for both forward and backward navigation
4. **User-Friendly**: No need to retake photos or manually rotate images
5. **Scalable**: Works for any building block with orientation inconsistencies

---

## Phase 2: Mobile-Friendly Directional Navigation (2-3 hours) ✅ COMPLETED

### Goal
Create an intuitive directional navigation system that shows contextual buttons based on camera orientation and available connections, optimized for mobile devices.

### What We Built

**File: `src/components/tour/DirectionalNavigation.tsx`**

A smart navigation component that:
- Shows directional buttons ("Go Forward", "Go Back", etc.) only when looking in valid directions
- Uses camera orientation to determine which buttons to display
- Handles photo orientation issues with custom direction mappings
- Optimized for mobile touch interactions

**Key Features:**
- **Context-aware visibility**: Buttons appear only when looking in directions with available connections
- **Custom direction mapping**: Handles photos taken with different camera orientations
- **Mobile optimization**: Large touch targets, no hover dependencies
- **Performance optimized**: Memoized calculations, GPU-accelerated transitions

**Interface Cleanup:**
- Removed unused `orientationOffset` and `swapLeftRight` properties
- Replaced with flexible `customDirections` system
- Kept essential properties: `id`, `imageUrl`, `connections`, `customDirections`, `hotspots`, `nearbyRooms`, `buildingContext`

### Implementation Details

```typescript
// Custom directions for photos with orientation issues
{
  id: 'x-f1-east-1',
  customDirections: {
    forward: 90,   // Forward button appears when looking right
    back: 180      // Back button appears when looking backward
  },
  connections: {
    forward: 'x-f1-east-2',
    back: 'a-f1-south-6'
  }
}
```

### Benefits
- **Mobile-friendly**: Works perfectly on touch devices
- **Intuitive**: No need to remember keyboard shortcuts
- **Context-aware**: Only shows relevant navigation options
- **Flexible**: Handles any photo orientation issues
- **Performance**: Smooth animations and responsive interactions

---

## Phase 3: Navigation Controls UI (2-3 hours)

### Goal
Replace keyboard controls with intuitive UI controls that provide visual feedback for available directions.

### Step 2.1: Create Navigation Controls Component (1 hour)

**File: `src/components/tour/TourNavigationControls.tsx`**

```typescript
/**
 * Navigation controls for VR tour directional movement.
 * Displays available navigation options and handles user interactions.
 *
 * @fileoverview Provides intuitive UI controls for tour navigation with visual feedback.
 */
import React from 'react'
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, RotateCw, Stairs } from 'lucide-react'
import type { Photo } from '../../types/tour'

interface TourNavigationControlsProps {
  currentPhoto: Photo | null
  onNavigate: (direction: 'forward' | 'back' | 'left' | 'right' | 'up' | 'down') => void
  isLoading: boolean
  className?: string
}

/**
 * Navigation controls component for VR tour
 *
 * Renders directional navigation buttons based on available connections
 * from the current photo. Provides visual feedback and loading states.
 *
 * @param currentPhoto - Current photo with connection data
 * @param onNavigate - Function to handle navigation direction
 * @param isLoading - Loading state for button disable
 * @param className - Additional CSS classes
 */
export const TourNavigationControls: React.FC<TourNavigationControlsProps> = ({
  currentPhoto,
  onNavigate,
  isLoading,
  className = ''
}) => {
  if (!currentPhoto) return null

  const { connections } = currentPhoto

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Primary Movement: Back/Forward */}
      <div className="flex items-center gap-2">
        {connections.back && (
          <button
            onClick={() => onNavigate('back')}
            disabled={isLoading}
            className="p-3 bg-white/90 rounded-full shadow-lg hover:bg-white hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
            title="Go back"
            aria-label="Navigate backward"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </button>
        )}

        {connections.forward && (
          <button
            onClick={() => onNavigate('forward')}
            disabled={isLoading}
            className="p-3 bg-white/90 rounded-full shadow-lg hover:bg-white hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
            title="Go forward"
            aria-label="Navigate forward"
          >
            <ArrowRight className="w-5 h-5 text-gray-800" />
          </button>
        )}
      </div>

      {/* Intersection Turns: Left/Right */}
      {(connections.left || connections.right) && (
        <div className="flex items-center gap-2 border-l border-white/30 pl-3">
          {connections.left && (
            <button
              onClick={() => onNavigate('left')}
              disabled={isLoading}
              className="p-2 bg-blue-500/90 rounded-lg shadow-lg hover:bg-blue-600 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
              title="Turn left"
              aria-label="Turn left"
            >
              <RotateCcw className="w-4 h-4 text-white" />
            </button>
          )}

          {connections.right && (
            <button
              onClick={() => onNavigate('right')}
              disabled={isLoading}
              className="p-2 bg-blue-500/90 rounded-lg shadow-lg hover:bg-blue-600 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
              title="Turn right"
              aria-label="Turn right"
            >
              <RotateCw className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      )}

      {/* Vertical Navigation: Stairs/Elevators */}
      {(connections.up || connections.down) && (
        <div className="flex flex-col gap-1 border-l border-white/30 pl-3">
          {connections.up && (
            <button
              onClick={() => onNavigate('up')}
              disabled={isLoading}
              className="p-2 bg-green-500/90 rounded shadow-lg hover:bg-green-600 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
              title="Go upstairs"
              aria-label="Go upstairs"
            >
              <ArrowUp className="w-3 h-3 text-white" />
            </button>
          )}

          {connections.down && (
            <button
              onClick={() => onNavigate('down')}
              disabled={isLoading}
              className="p-2 bg-green-500/90 rounded shadow-lg hover:bg-green-600 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
              title="Go downstairs"
              aria-label="Go downstairs"
            >
              <ArrowDown className="w-3 h-3 text-white" />
            </button>
          )}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center gap-2 border-l border-white/30 pl-3">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}
```

### Step 2.2: Create Location Context Display (30 minutes)

**File: `src/components/tour/TourLocationDisplay.tsx`**

```typescript
/**
 * Displays current location context information in the VR tour.
 * Shows building, floor, and nearby facilities for user orientation.
 *
 * @fileoverview Location context component for VR tour navigation.
 */
import React from 'react'
import { MapPin, Building, Users, Info } from 'lucide-react'
import type { Photo, Area } from '../../types/tour'

interface TourLocationDisplayProps {
  currentPhoto: Photo | null
  currentArea: Area | null
  className?: string
}

/**
 * Location display component for VR tour context
 *
 * Shows current building, floor, wing, and contextual information
 * to help users understand their location in the campus tour.
 *
 * @param currentPhoto - Current photo with building context
 * @param currentArea - Current area with building and floor info
 * @param className - Additional CSS classes
 */
export const TourLocationDisplay: React.FC<TourLocationDisplayProps> = ({
  currentPhoto,
  currentArea,
  className = ''
}) => {
  // Don't render if no location data
  if (!currentArea && !currentPhoto?.buildingContext) return null

  const { buildingContext, nearbyRooms } = currentPhoto || {}

  return (
    <div className={`bg-black/70 text-white p-4 rounded-lg backdrop-blur-sm max-w-xs ${className}`}>
      {/* Building and Floor Info */}
      {currentArea && (
        <div className="flex items-center gap-2 mb-3">
          <Building className="w-5 h-5 text-blue-400" />
          <div>
            <div className="font-semibold text-lg">{currentArea.name}</div>
            <div className="text-sm opacity-75">Floor {currentArea.floorLevel}</div>
          </div>
        </div>
      )}

      {/* Wing and Contextual Info */}
      {buildingContext && (
        <>
          {buildingContext.wing && (
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">
                {buildingContext.wing.charAt(0).toUpperCase() + buildingContext.wing.slice(1)} Wing
              </span>
            </div>
          )}

          {buildingContext.facilities.length > 0 && (
            <div className="flex items-start gap-2 mb-2">
              <MapPin className="w-4 h-4 text-green-400 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium mb-1">Nearby Facilities:</div>
                <div className="opacity-90">
                  {buildingContext.facilities.join(', ')}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Nearby Rooms */}
      {nearbyRooms && nearbyRooms.length > 0 && (
        <div className="flex items-start gap-2">
          <Users className="w-4 h-4 text-purple-400 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium mb-1">Nearby Rooms:</div>
            <div className="opacity-90">
              {nearbyRooms.map((room, index) => (
                <span key={room.roomNumber}>
                  {room.roomNumber}
                  {index < nearbyRooms.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

### Step 2.3: Integrate Controls into Main Route (30 minutes)

**Update `src/routes/index.tsx`:**

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { PanoramicViewer } from '../components/viewer/PanoramicViewer'
import { TourNavigationControls } from '../components/tour/TourNavigationControls'
import { TourLocationDisplay } from '../components/tour/TourLocationDisplay'
import { useTourNavigation } from '../hooks/useTourNavigation'

export const Route = createFileRoute('/')(({
  component: TourApp,
})

function TourApp() {
  const {
    currentPhoto,
    currentArea,
    isLoading,
    navigateDirection
  } = useTourNavigation()

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-900 relative">
      {/* Main 360° Viewer */}
      <PanoramicViewer
        imageUrl={currentPhoto?.imageUrl}
        className="w-full h-full"
      />

      {/* Navigation Controls - Bottom Center */}
      <TourNavigationControls
        currentPhoto={currentPhoto}
        onNavigate={navigateDirection}
        isLoading={isLoading}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20"
      />

      {/* Location Context - Top Left */}
      <TourLocationDisplay
        currentPhoto={currentPhoto}
        currentArea={currentArea}
        className="absolute top-6 left-6 z-20"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white/90 rounded-lg p-6 flex items-center gap-3">
            <div className="w-6 h-6 border-3 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-gray-800 font-medium">Loading location...</span>
          </div>
        </div>
      )}
    </div>
  )
}
```

### Step 2.4: Enhanced User Experience (30 minutes)

**Add keyboard shortcut hints and accessibility:**

```typescript
// Add to TourApp component
const [showKeyboardHints, setShowKeyboardHints] = useState(false)

// Add keyboard hint toggle
useEffect(() => {
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'h' || event.key === 'H') {
      setShowKeyboardHints(!showKeyboardHints)
    }
  }
  window.addEventListener('keydown', handleKeyPress)
  return () => window.removeEventListener('keydown', handleKeyPress)
}, [showKeyboardHints])

// Add to JSX:
{showKeyboardHints && (
  <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30 bg-black/80 text-white p-4 rounded-lg text-sm">
    <div className="grid grid-cols-2 gap-3">
      <div><kbd className="px-2 py-1 bg-gray-700 rounded">W</kbd> Forward</div>
      <div><kbd className="px-2 py-1 bg-gray-700 rounded">S</kbd> Back</div>
      <div><kbd className="px-2 py-1 bg-gray-700 rounded">A</kbd> Left</div>
      <div><kbd className="px-2 py-1 bg-gray-700 rounded">D</kbd> Right</div>
      <div><kbd className="px-2 py-1 bg-gray-700 rounded">Q</kbd> Up</div>
      <div><kbd className="px-2 py-1 bg-gray-700 rounded">E</kbd> Down</div>
    </div>
    <div className="text-center mt-2 opacity-75">Press H to toggle hints</div>
  </div>
)}
```

### Step 2.5: Testing and Polish (30 minutes)

**Complete Testing Checklist:**

1. **UI Controls Testing:**
   - ✅ All navigation buttons respond correctly
   - ✅ Disabled states work for unavailable directions
   - ✅ Hover effects and animations work smoothly
   - ✅ Loading states display properly during navigation

2. **Responsive Design:**
   - ✅ Controls remain accessible on different screen sizes
   - ✅ Text remains readable in location display
   - ✅ Controls don't overlap with panoramic viewer controls

3. **Accessibility Testing:**
   - ✅ All buttons have proper aria-labels
   - ✅ Keyboard navigation still works alongside UI controls
   - ✅ Focus states are visible and logical

4. **Performance Testing:**
   - ✅ Smooth transitions between photos
   - ✅ No lag in button responses
   - ✅ Image preloading works effectively

---

## Completion Criteria

### Phase 1 Complete ✅
- ✅ `findPhotoById` utility works correctly in `tourUtilities.ts`
- ✅ Navigation hook manages photo state properly
- ✅ Photos load dynamically from tour data instead of static test.jpg
- ✅ Keyboard navigation works for all directions
- ✅ Cross-building connections function bidirectionally
- ✅ Debug info displays correct photo and area information
- ✅ Camera orientation preservation between photo transitions

### Phase 2 Complete ✅
- ✅ Mobile-friendly directional navigation system implemented
- ✅ Context-aware button visibility based on camera orientation
- ✅ Custom direction mapping system for photo orientation corrections
- ✅ Touch-optimized interface with proper button sizing
- ✅ Performance-optimized with smooth animations
- ✅ Interface cleanup with removal of unused properties
- ✅ All A Block floor 1 and X Block photos have correct orientation mappings

### Current Status
The VR campus tour now has a fully functional navigation system with:
- Basic photo-to-photo navigation via keyboard and touch
- Camera orientation persistence for natural movement
- Mobile-optimized directional buttons that appear contextually
- Corrected photo orientations for seamless navigation
- Clean, maintainable codebase with optimized interfaces

---

## Next Steps (Future Phases)

After completing Phase 1, 1.5, and 2, the foundation will be ready for:

- **Phase 3:** Hotspot Integration - 3D clickable elements for stairs/elevators
- **Phase 4:** Location Menu - Quick jump navigation and building overview
- **Phase 5:** Advanced Features - Search, guided tours, and waypoint system

This implementation creates a solid, maintainable foundation that separates data access, state management, UI concerns, and camera orientation persistence effectively.