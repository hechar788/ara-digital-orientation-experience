# Phase 6: Sequential Route Navigation

**Status**: ☐ Not Started
**Prerequisites**: Phase 4 (AI + Pathfinding), Phase 5 (Chat UI)
**Estimated Time**: 3-4 hours
**Difficulty**: Medium-Hard

## Overview

This phase enhances navigation from direct jumping (Phase 5) to sequential step-by-step camera movement along the calculated route. Instead of instantly teleporting to the destination, users will see each location along the path, creating a more immersive and less disorienting experience.

**What Changes:**
- **Phase 5 Behavior**: User asks for library → Camera jumps instantly to library
- **Phase 6 Behavior**: User asks for library → Camera smoothly transitions: A Block Entrance → A Block Hallway → Library Entrance (step-by-step with delays)

**Key Features:**
- Automatic step-by-step navigation along path array
- Progress indicator showing "Step 2 of 5"
- Skip button to jump to final destination
- Speed controls (Slow / Normal / Fast)
- Cancel navigation mid-route
- Smooth transitions between locations
- Progress bar animation

**Why This Matters:**
- **Better UX**: Users understand their route spatially
- **Less Disorienting**: Gradual movement vs instant teleportation
- **Educational**: Users learn the campus layout naturally
- **Professional**: Matches real-world navigation apps

---

## Step 1: Understand the Navigation Flow

### Current Flow (Phase 5)

```
User: "Take me to the library"
  →
AI returns: path = ['a-f1-north', 'a-f1-hallway', 'library-entrance']
  →
onNavigate('library-entrance')  → Jumps directly to end
  →
User sees: Library (instantly, no context)
```

### New Flow (Phase 6)

```
User: "Take me to the library"
  →
AI returns: path = ['a-f1-north', 'a-f1-hallway', 'library-entrance']
  →
navigateAlongPath(path)
  →
Progress: "Step 1 of 3 - A Block North Entrance"
Wait 2 seconds
  →
onNavigate('a-f1-hallway')
  →
Progress: "Step 2 of 3 - A Block Hallway"
Wait 2 seconds
  →
onNavigate('library-entrance')
  →
Progress: "Step 3 of 3 - Library Entrance"
Complete! 
```

---

## Step 2: Navigation Manager Hook

Create a custom hook to manage route navigation state and logic.

### File: `src/hooks/useRouteNavigation.ts`

```typescript
import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Navigation speed configuration
 *
 * @property label - Display name for speed setting
 * @property delayMs - Milliseconds to wait between steps
 */
export interface NavigationSpeed {
  label: string
  delayMs: number
}

/**
 * Available navigation speed presets
 */
export const NAVIGATION_SPEEDS: Record<string, NavigationSpeed> = {
  SLOW: { label: 'Slow', delayMs: 3000 },
  NORMAL: { label: 'Normal', delayMs: 2000 },
  FAST: { label: 'Fast', delayMs: 1000 }
} as const

/**
 * Current navigation state information
 *
 * @property isNavigating - Whether route navigation is in progress
 * @property currentStepIndex - Index of current step in path (0-based)
 * @property totalSteps - Total number of steps in path
 * @property currentPhotoId - Photo ID of current step
 * @property path - Complete path array being navigated
 */
export interface NavigationState {
  isNavigating: boolean
  currentStepIndex: number
  totalSteps: number
  currentPhotoId: string | null
  path: string[]
}

/**
 * Hook return value with navigation state and control functions
 *
 * @property navigationState - Current navigation state information
 * @property startNavigation - Function to begin navigating a path
 * @property skipToEnd - Function to skip to final destination
 * @property cancelNavigation - Function to stop navigation
 * @property setSpeed - Function to change navigation speed
 * @property currentSpeed - Current speed setting
 */
export interface UseRouteNavigationReturn {
  navigationState: NavigationState
  startNavigation: (path: string[]) => void
  skipToEnd: () => void
  cancelNavigation: () => void
  setSpeed: (speed: NavigationSpeed) => void
  currentSpeed: NavigationSpeed
}

/**
 * Custom hook for managing sequential route navigation
 *
 * Handles automatic step-by-step navigation along a path array with
 * configurable timing, skip functionality, and cancellation support.
 *
 * @param onNavigate - Callback to execute navigation to a photo ID
 * @returns Navigation state and control functions
 *
 * @example
 * ```tsx
 * const { navigationState, startNavigation, skipToEnd } = useRouteNavigation(
 *   (photoId) => setCurrentPhoto(photoId)
 * )
 *
 * // Start navigating a path
 * startNavigation(['photo1', 'photo2', 'photo3'])
 *
 * // Skip to the end
 * skipToEnd()
 * ```
 */
export function useRouteNavigation(
  onNavigate: (photoId: string) => void
): UseRouteNavigationReturn {

  // ============================================
  // State
  // ============================================

  const [navigationState, setNavigationState] = useState<NavigationState>({
    isNavigating: false,
    currentStepIndex: 0,
    totalSteps: 0,
    currentPhotoId: null,
    path: []
  })

  const [currentSpeed, setCurrentSpeed] = useState<NavigationSpeed>(
    NAVIGATION_SPEEDS.NORMAL
  )

  // ============================================
  // Refs
  // ============================================

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const shouldCancelRef = useRef(false)

  // ============================================
  // Cleanup Function
  // ============================================

  /**
   * Clears any pending navigation timeouts
   */
  const clearNavigationTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  /**
   * Resets navigation state to idle
   */
  const resetNavigation = useCallback(() => {
    clearNavigationTimeout()
    shouldCancelRef.current = false
    setNavigationState({
      isNavigating: false,
      currentStepIndex: 0,
      totalSteps: 0,
      currentPhotoId: null,
      path: []
    })
  }, [clearNavigationTimeout])

  // ============================================
  // Navigation Logic
  // ============================================

  /**
   * Navigates to a specific step in the path
   *
   * @param path - Complete path array
   * @param stepIndex - Index of step to navigate to
   */
  const navigateToStep = useCallback((path: string[], stepIndex: number) => {
    if (shouldCancelRef.current) {
      resetNavigation()
      return
    }

    if (stepIndex >= path.length) {
      // Navigation complete
      setNavigationState(prev => ({
        ...prev,
        isNavigating: false,
        currentStepIndex: path.length - 1
      }))
      clearNavigationTimeout()
      return
    }

    const photoId = path[stepIndex]

    // Update state
    setNavigationState({
      isNavigating: true,
      currentStepIndex: stepIndex,
      totalSteps: path.length,
      currentPhotoId: photoId,
      path
    })

    // Execute navigation callback
    onNavigate(photoId)

    // Schedule next step
    if (stepIndex < path.length - 1) {
      timeoutRef.current = setTimeout(() => {
        navigateToStep(path, stepIndex + 1)
      }, currentSpeed.delayMs)
    } else {
      // Last step - mark complete after delay
      timeoutRef.current = setTimeout(() => {
        setNavigationState(prev => ({
          ...prev,
          isNavigating: false
        }))
      }, 500)
    }
  }, [onNavigate, currentSpeed, clearNavigationTimeout, resetNavigation])

  // ============================================
  // Public Control Functions
  // ============================================

  /**
   * Starts navigating along a path array
   *
   * @param path - Array of photo IDs to navigate through
   */
  const startNavigation = useCallback((path: string[]) => {
    if (!path || path.length === 0) {
      console.warn('Cannot start navigation: empty path')
      return
    }

    // Reset any existing navigation
    clearNavigationTimeout()
    shouldCancelRef.current = false

    // Start from first step
    navigateToStep(path, 0)
  }, [navigateToStep, clearNavigationTimeout])

  /**
   * Skips remaining steps and jumps to final destination
   */
  const skipToEnd = useCallback(() => {
    if (!navigationState.isNavigating || navigationState.path.length === 0) {
      return
    }

    clearNavigationTimeout()
    const finalPhotoId = navigationState.path[navigationState.path.length - 1]

    setNavigationState({
      isNavigating: false,
      currentStepIndex: navigationState.path.length - 1,
      totalSteps: navigationState.path.length,
      currentPhotoId: finalPhotoId,
      path: navigationState.path
    })

    onNavigate(finalPhotoId)
  }, [navigationState, onNavigate, clearNavigationTimeout])

  /**
   * Cancels navigation and stops at current location
   */
  const cancelNavigation = useCallback(() => {
    shouldCancelRef.current = true
    resetNavigation()
  }, [resetNavigation])

  /**
   * Changes navigation speed for future navigations
   *
   * @param speed - New speed configuration
   */
  const setSpeed = useCallback((speed: NavigationSpeed) => {
    setCurrentSpeed(speed)
  }, [])

  // ============================================
  // Cleanup on Unmount
  // ============================================

  useEffect(() => {
    return () => {
      clearNavigationTimeout()
    }
  }, [clearNavigationTimeout])

  // ============================================
  // Return Hook Interface
  // ============================================

  return {
    navigationState,
    startNavigation,
    skipToEnd,
    cancelNavigation,
    setSpeed,
    currentSpeed
  }
}
```

---

## Step 3: Progress UI Component

Create a component to display navigation progress overlay.

### File: `src/components/RouteProgress.tsx`

```typescript
'use client'

import { X, SkipForward } from 'lucide-react'
import { findPhotoById as lookupPhoto } from '@/data/blockUtils'

/**
 * Props for the RouteProgress component
 *
 * @property currentStep - Current step number (1-indexed for display)
 * @property totalSteps - Total number of steps in route
 * @property currentPhotoId - Photo ID of current location
 * @property onSkip - Callback when user clicks skip button
 * @property onCancel - Callback when user clicks cancel button
 */
export interface RouteProgressProps {
  currentStep: number
  totalSteps: number
  currentPhotoId: string
  onSkip: () => void
  onCancel: () => void
}

/**
 * Finds a photo by its ID in tour data
 *
 * @param photoId - The photo ID to search for
 * @returns Photo object or null if not found
 */
function resolvePhoto(photoId: string) {
  return lookupPhoto(photoId)
}

/**
 * Route navigation progress overlay component
 *
 * Displays current progress through a multi-step route with location name,
 * progress bar, step counter, and skip/cancel controls.
 *
 * @param props - Component props with progress information and callbacks
 * @returns Progress overlay UI
 *
 * @example
 * ```tsx
 * <RouteProgress
 *   currentStep={2}
 *   totalSteps={5}
 *   currentPhotoId="a-f1-hallway"
 *   onSkip={() => skipToEnd()}
 *   onCancel={() => cancelNavigation()}
 * />
 * ```
 */
export function RouteProgress({
  currentStep,
  totalSteps,
  currentPhotoId,
  onSkip,
  onCancel
}: RouteProgressProps) {

  const currentPhoto = resolvePhoto(currentPhotoId)
  const progressPercent = ((currentStep / totalSteps) * 100).toFixed(0)

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 min-w-[320px] max-w-md">

        {/* Header with Cancel Button */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">
              Navigating Route
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
            aria-label="Cancel navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Location */}
        <div className="mb-3">
          <p className="text-base font-medium text-gray-800">
            {currentPhoto?.title || currentPhotoId}
          </p>
          {currentPhoto?.description && (
            <p className="text-xs text-gray-500 mt-1">
              {currentPhoto.description}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-right mt-1">
            {progressPercent}% Complete
          </p>
        </div>

        {/* Skip Button */}
        {currentStep < totalSteps && (
          <button
            onClick={onSkip}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium"
          >
            <SkipForward className="w-4 h-4" />
            Skip to Destination
          </button>
        )}
      </div>
    </div>
  )
}
```

---

## Step 4: Update Chat Component to Use Sequential Navigation

### File: `src/components/AICampusChat.tsx`

**Import the hook at the top:**

```typescript
import { useRouteNavigation } from '../hooks/useRouteNavigation'
import { RouteProgress } from './RouteProgress'
```

**Inside the component, replace direct navigation with the hook:**

```typescript
export function AICampusChat({ currentPhotoId, onNavigate, onClose }: AICampusChatProps) {

  // ============================================
  // Add Route Navigation Hook
  // ============================================

  const {
    navigationState,
    startNavigation,
    skipToEnd,
    cancelNavigation
  } = useRouteNavigation(onNavigate)

  // ... existing state declarations ...

  // ============================================
  // Modify handleSendMessage
  // ============================================

  const handleSendMessage = async () => {
    // ... existing validation and setup code ...

    try {
      // ... existing API call code ...

      // Add assistant message to display
      setMessages(prev => [...prev, assistantMessage])

      // ============================================
      // PHASE 6 CHANGE: Sequential Navigation
      // ============================================

      if (response.functionCall && !response.functionCall.arguments.error) {
        const path = response.functionCall.arguments.path

        if (path && path.length > 1) {
          // Use sequential navigation for multi-step paths
          setTimeout(() => {
            startNavigation(path)
          }, 500)
        } else {
          // Direct navigation for single-step or missing path
          setTimeout(() => {
            onNavigate(response.functionCall!.arguments.photoId)
          }, 500)
        }
      }

    } catch (err) {
      // ... existing error handling ...
    }
  }

  // ... rest of existing code ...

  // ============================================
  // Add Progress Overlay to Render
  // ============================================

  return (
    <>
      {/* Show progress overlay during navigation */}
      {navigationState.isNavigating && navigationState.currentPhotoId && (
        <RouteProgress
          currentStep={navigationState.currentStepIndex + 1}
          totalSteps={navigationState.totalSteps}
          currentPhotoId={navigationState.currentPhotoId}
          onSkip={skipToEnd}
          onCancel={cancelNavigation}
        />
      )}

      {/* Existing chat UI */}
      <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] z-50">
        {/* ... rest of existing chat UI ... */}
      </div>
    </>
  )
}
```

---

## Step 5: Speed Control Component (Optional Enhancement)

Add speed controls to the progress overlay for user customization.

### Enhanced RouteProgress with Speed Controls

```typescript
import { X, SkipForward, Gauge } from 'lucide-react'
import { NAVIGATION_SPEEDS, NavigationSpeed } from '../hooks/useRouteNavigation'

export interface RouteProgressProps {
  currentStep: number
  totalSteps: number
  currentPhotoId: string
  onSkip: () => void
  onCancel: () => void
  currentSpeed?: NavigationSpeed
  onSpeedChange?: (speed: NavigationSpeed) => void
}

export function RouteProgress({
  currentStep,
  totalSteps,
  currentPhotoId,
  onSkip,
  onCancel,
  currentSpeed,
  onSpeedChange
}: RouteProgressProps) {

  // ... existing code ...

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 min-w-[320px] max-w-md">

        {/* ... existing header, location, progress bar ... */}

        {/* Speed Controls (Optional) */}
        {onSpeedChange && currentSpeed && (
          <div className="mb-3 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500">Speed:</span>
            <div className="flex gap-1">
              {Object.values(NAVIGATION_SPEEDS).map(speed => (
                <button
                  key={speed.label}
                  onClick={() => onSpeedChange(speed)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    currentSpeed.label === speed.label
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {speed.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Skip Button */}
        {/* ... existing skip button ... */}
      </div>
    </div>
  )
}
```

**Update AICampusChat to pass speed props:**

```typescript
{navigationState.isNavigating && navigationState.currentPhotoId && (
  <RouteProgress
    currentStep={navigationState.currentStepIndex + 1}
    totalSteps={navigationState.totalSteps}
    currentPhotoId={navigationState.currentPhotoId}
    onSkip={skipToEnd}
    onCancel={cancelNavigation}
    currentSpeed={currentSpeed}
    onSpeedChange={setSpeed}
  />
)}
```

---

## Step 6: Testing Sequential Navigation

### 6.1 Manual Test Cases

**Test 1: Short Path (2 steps)**
```
User: "Take me to the library"
Expected path: ['a-f1-north-entrance', 'library-f1-entrance']

Verify:
- Progress shows "Step 1 of 2"
- Waits 2 seconds at first location
- Progress shows "Step 2 of 2"
- Navigation completes
- Progress overlay disappears
```

**Test 2: Long Path (5+ steps)**
```
User: "Navigate to the gym"
Expected: Multi-step path across campus

Verify:
- Each step displays correctly
- Progress bar animates smoothly
- Location names update
- Percentage increases correctly
- Final step completes navigation
```

**Test 3: Skip Functionality**
```
User: "Take me to the gym"
Wait for step 2
Click "Skip to Destination"

Verify:
- Navigation immediately jumps to final location
- Progress overlay disappears
- No further automatic navigation occurs
```

**Test 4: Cancel Navigation**
```
User: "Take me to the library"
Wait for step 1
Click X (cancel)

Verify:
- Navigation stops immediately
- Camera stays at current location
- Progress overlay disappears
- Can start new navigation
```

**Test 5: Speed Changes**
```
User: "Take me to the gym"
Wait for step 2
Click "Fast" speed

Verify:
- Next steps use 1 second delay
- Speed change takes effect immediately
- Navigation continues without interruption
```

**Test 6: Single-Step "Path"**
```
User already at: a-f1-north-entrance
User: "Take me to the entrance"
AI returns: path = ['a-f1-north-entrance']

Verify:
- No sequential navigation starts (or shows "You're already here")
- No progress overlay
- Direct navigation or immediate completion
```

**Test 7: Path with Error**
```
AI returns: path with error message

Verify:
- No navigation starts
- Error displays in chat
- No progress overlay
```

### 6.2 Edge Case Testing

**Test: Navigation During Active Navigation**
```
User: "Take me to the library" (starts navigation)
Wait for step 1
User: "Actually take me to the gym" (new request)

Expected Behavior:
- First navigation cancels
- New navigation begins
- Progress resets to new path
```

**Implementation:**
```typescript
const startNavigation = useCallback((path: string[]) => {
  // Cancel any existing navigation first
  if (navigationState.isNavigating) {
    cancelNavigation()
  }

  // Then start new navigation
  clearNavigationTimeout()
  shouldCancelRef.current = false
  navigateToStep(path, 0)
}, [/* deps */])
```

**Test: Component Unmount During Navigation**
```
User: "Take me to the gym"
Wait for step 2
Close chat component

Expected:
- Navigation continues (hook is in parent)
- OR navigation cancels (if desired)
- No memory leaks
- Cleanup runs properly
```

**Test: Very Long Path (10+ steps)**
```
Expected:
- Navigation continues for all steps
- No timeout errors
- Progress updates correctly
- Can skip at any point
```

---

## Step 7: Performance Optimization

### 7.1 Prevent Memory Leaks

**Issue**: Timeouts continue after component unmount

**Solution**: Cleanup in useEffect
```typescript
useEffect(() => {
  return () => {
    clearNavigationTimeout()
  }
}, [clearNavigationTimeout])
```

### 7.2 Debounce Rapid Navigation Requests

**Issue**: User sends multiple navigation requests quickly

**Solution**: Cancel previous navigation before starting new one
```typescript
const startNavigation = useCallback((path: string[]) => {
  cancelNavigation() // Cancel any existing
  // ... start new navigation
}, [])
```

### 7.3 Optimize Progress Bar Animation

**Issue**: Progress bar rerenders cause lag

**Solution**: Use CSS transitions
```typescript
<div
  className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
  style={{ width: `${progressPercent}%` }}
/>
```

---

## Step 8: Accessibility Enhancements

### Keyboard Shortcuts

**Escape Key**: Cancel navigation
```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && navigationState.isNavigating) {
      cancelNavigation()
    }
  }

  window.addEventListener('keydown', handleKeyPress)
  return () => window.removeEventListener('keydown', handleKeyPress)
}, [navigationState.isNavigating, cancelNavigation])
```

**Space Bar**: Skip to end
```typescript
if (e.key === ' ' && navigationState.isNavigating) {
  e.preventDefault()
  skipToEnd()
}
```

### Screen Reader Announcements

**Live Region for Progress:**
```typescript
<div role="status" aria-live="polite" className="sr-only">
  {navigationState.isNavigating && (
    `Navigating to destination. Step ${navigationState.currentStepIndex + 1} of ${navigationState.totalSteps}.
     Currently at ${currentPhoto?.title || 'unknown location'}.`
  )}
</div>
```

### Focus Management

**Return Focus After Navigation:**
```typescript
const skipToEnd = useCallback(() => {
  // ... existing skip logic ...

  // Return focus to chat input
  setTimeout(() => {
    document.querySelector('input[placeholder*="campus"]')?.focus()
  }, 500)
}, [/* deps */])
```

---

## Step 9: Common Issues and Solutions

### Issue 1: Navigation doesn't start

**Symptom**: Progress overlay doesn't appear

**Debug Steps:**
```typescript
const startNavigation = useCallback((path: string[]) => {
  console.log('Starting navigation with path:', path)
  console.log('Path length:', path?.length)

  if (!path || path.length === 0) {
    console.warn('Cannot start: empty path')
    return
  }

  // ... rest of code
}, [])
```

**Common Causes:**
- Path is undefined or null
- Path array is empty
- Hook not properly connected to chat component

---

### Issue 2: Navigation gets stuck

**Symptom**: Progress stops mid-route, doesn't advance

**Solution**: Check timeout cleanup
```typescript
// Ensure timeout is cleared before setting new one
const navigateToStep = useCallback((path: string[], stepIndex: number) => {
  clearNavigationTimeout() // Clear first!

  // ... navigation logic ...

  timeoutRef.current = setTimeout(() => {
    navigateToStep(path, stepIndex + 1)
  }, currentSpeed.delayMs)
}, [])
```

---

### Issue 3: Progress overlay doesn't disappear

**Symptom**: Overlay stays visible after navigation completes

**Solution**: Ensure state updates correctly
```typescript
// When reaching last step
if (stepIndex >= path.length - 1) {
  timeoutRef.current = setTimeout(() => {
    setNavigationState(prev => ({
      ...prev,
      isNavigating: false  // This must update!
    }))
  }, 500)
}
```

**Debug:**
```typescript
useEffect(() => {
  console.log('Navigation state updated:', navigationState)
}, [navigationState])
```

---

### Issue 4: Skip doesn't work

**Symptom**: Clicking skip button has no effect

**Solution**: Verify callback is passed correctly
```typescript
// In RouteProgress component
<button onClick={() => {
  console.log('Skip clicked')
  onSkip()
}}>
  Skip to Destination
</button>

// In parent component
const { skipToEnd } = useRouteNavigation(onNavigate)

<RouteProgress onSkip={skipToEnd} />  // Correct
<RouteProgress onSkip={cancelNavigation} />  // Wrong!
```

---

### Issue 5: Speed change doesn't take effect

**Symptom**: Changing speed during navigation has no impact

**Explanation**: Current timeout uses old speed, new speed only affects next navigation

**Solution (if immediate change desired):**
```typescript
const setSpeed = useCallback((newSpeed: NavigationSpeed) => {
  setCurrentSpeed(newSpeed)

  // If navigating, restart current step with new speed
  if (navigationState.isNavigating) {
    clearNavigationTimeout()
    // Continue from current step with new timing
    navigateToStep(navigationState.path, navigationState.currentStepIndex + 1)
  }
}, [navigationState, navigateToStep, clearNavigationTimeout])
```

---

## Step 10: Mobile Optimizations

### Touch-Friendly Progress Overlay

**Larger Buttons:**
```typescript
<button
  onClick={onSkip}
  className="w-full py-3 px-4"  // Larger touch target
>
  Skip to Destination
</button>
```

**Responsive Sizing:**
```typescript
<div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 px-4">
  <div className="min-w-[280px] sm:min-w-[320px] max-w-md">
    {/* Progress content */}
  </div>
</div>
```

### Swipe Gestures (Advanced)

**Swipe Up to Skip:**
```typescript
const [touchStart, setTouchStart] = useState<number | null>(null)

const handleTouchStart = (e: React.TouchEvent) => {
  setTouchStart(e.touches[0].clientY)
}

const handleTouchEnd = (e: React.TouchEvent) => {
  if (!touchStart) return

  const touchEnd = e.changedTouches[0].clientY
  const distance = touchStart - touchEnd

  if (distance > 50) {  // Swipe up threshold
    onSkip()
  }

  setTouchStart(null)
}

<div
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
>
  {/* Progress UI */}
</div>
```

---

## Step 11: Animation Enhancements

### Smooth Entrance/Exit

**Add to RouteProgress component:**
```typescript
import { motion } from 'framer-motion'

export function RouteProgress(props: RouteProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40"
    >
      {/* Progress content */}
    </motion.div>
  )
}
```

**Note**: Requires `framer-motion` installation:
```bash
npm install framer-motion
```

### Progress Bar Pulse Effect

```typescript
<div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
  <div
    className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out animate-pulse"
    style={{ width: `${progressPercent}%` }}
  />
</div>
```

---

## Step 12: Summary

**What Phase 6 Accomplishes:**

 **Sequential Navigation**: Step-by-step camera movement along calculated paths
 **Progress Overlay**: Visual feedback showing current step, location, and progress
 **User Controls**: Skip to destination, cancel navigation, speed settings
 **Smooth Transitions**: Configurable delays between steps (1-3 seconds)
 **Edge Case Handling**: Multiple requests, cancellation, unmount cleanup
 **Accessibility**: Keyboard shortcuts, screen reader support, focus management
 **Mobile Friendly**: Responsive design, touch-optimized controls
 **Performance**: Proper cleanup, no memory leaks, optimized animations

**Files Created:**
- `src/hooks/useRouteNavigation.ts` - Navigation state management hook (300+ lines)
- `src/components/RouteProgress.tsx` - Progress overlay UI (150+ lines)

**Files Modified:**
- `src/components/AICampusChat.tsx` - Integrate sequential navigation

**Key Improvements from Phase 5:**
- Phase 5: Instant teleportation to destination
- Phase 6: Gradual step-by-step navigation with visual feedback

**Ready for Phase 7:**
All individual components (pathfinding, AI, chat, navigation) are now complete. Phase 7 integrates everything into the main VR tour application.

---

## Step 13: Verification Checklist

Before moving to Phase 7, verify:

### Hook Functionality
- [ ] `useRouteNavigation` hook created in `src/hooks/`
- [ ] Hook compiles without TypeScript errors
- [ ] startNavigation() begins sequential navigation
- [ ] skipToEnd() jumps to final destination
- [ ] cancelNavigation() stops mid-route
- [ ] setSpeed() changes timing for next navigation
- [ ] Cleanup runs on unmount (no memory leaks)

### Progress UI
- [ ] RouteProgress component displays correctly
- [ ] Current step counter shows "Step X of Y"
- [ ] Location name displays from campus photos directory
- [ ] Progress bar animates smoothly
- [ ] Percentage updates correctly
- [ ] Skip button appears (except on last step)
- [ ] Cancel button works
- [ ] Speed controls display and function (if implemented)

### Integration
- [ ] AICampusChat imports and uses the hook
- [ ] Multi-step paths trigger sequential navigation
- [ ] Single-step paths use direct navigation
- [ ] Progress overlay appears during navigation
- [ ] Progress overlay disappears when complete
- [ ] Chat remains functional during navigation

### User Experience
- [ ] Navigation feels smooth and natural
- [ ] Delays are appropriate (not too fast/slow)
- [ ] Skip functionality is obvious
- [ ] Can cancel at any point
- [ ] Multiple navigation requests work correctly
- [ ] Mobile experience is good

### Edge Cases
- [ ] Empty path handled gracefully
- [ ] Path with 1 item works
- [ ] Very long paths (10+ steps) work
- [ ] Navigation during navigation cancels first
- [ ] Component unmount doesn't cause errors
- [ ] Speed changes work (if implemented)

---

## Time Estimate Breakdown

- **Step 1** (Understanding Flow): 10 minutes
- **Step 2** (Navigation Hook): 60 minutes
- **Step 3** (Progress UI): 40 minutes
- **Step 4** (Integration): 30 minutes
- **Step 5** (Speed Controls): 20 minutes (optional)
- **Step 6** (Testing): 45 minutes
- **Step 7-8** (Performance + Accessibility): 30 minutes
- **Step 9-11** (Issues + Enhancements): 25 minutes

**Total: 3-4 hours** (including optional features and testing)

---

**Phase 6 Status**: Ready for implementation =→
