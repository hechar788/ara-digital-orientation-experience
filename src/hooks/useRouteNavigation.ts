import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/**
 * Navigation speed configuration describing the label shown to users and the delay between path steps.
 *
 * @property label - Human-readable name shown in the speed toggle
 * @property delayMs - Delay in milliseconds between automatic navigation steps
 */
export interface NavigationSpeed {
  label: string
  delayMs: number
}

/**
 * Enumeration of supported navigation speed presets.
 */
export const NAVIGATION_SPEEDS: Record<'SLOW' | 'NORMAL' | 'FAST', NavigationSpeed> = {
  SLOW: { label: 'Slow', delayMs: 3500 },
  NORMAL: { label: 'Normal', delayMs: 2200 },
  FAST: { label: 'Fast', delayMs: 1200 }
} as const

/**
 * Represents the current sequential navigation progress.
 *
 * @property isNavigating - Indicates whether step-by-step navigation is active
 * @property currentStepIndex - Zero-based index for the current hop inside the path array
 * @property totalSteps - Total path length
 * @property currentPhotoId - Photo identifier used for the most recent onNavigate call
 * @property path - Immutable path array originally supplied to startNavigation
 */
export interface NavigationState {
  isNavigating: boolean
  currentStepIndex: number
  totalSteps: number
  currentPhotoId: string | null
  path: string[]
}

interface InternalState extends NavigationState {
  pendingPath: string[]
}

/**
 * API returned by useRouteNavigation exposing state plus control actions.
 *
 * @property navigationState - Snapshot of the current sequential navigation progress
 * @property startNavigation - Begins walking a path from the first element onwards
 * @property skipToEnd - Immediately jumps to the final destination in the active path
 * @property cancelNavigation - Stops navigation and clears any remaining steps
 * @property setSpeed - Updates the active speed preset
 * @property currentSpeed - Currently selected speed descriptor
 */
export interface UseRouteNavigationReturn {
  navigationState: NavigationState
  startNavigation: (path: string[]) => void
  skipToEnd: () => void
  cancelNavigation: () => void
  setSpeed: (speed: NavigationSpeed) => void
  currentSpeed: NavigationSpeed
}

type TimeoutHandle = ReturnType<typeof setTimeout> | null

/**
 * Hook that animates navigation between photos step-by-step using a supplied path array.
 *
 * The hook defers execution between steps based on the selected speed preset, exposes
 * progress metadata for the UI, and supports skipping or cancelling navigation entirely.
 *
 * @param onNavigate - Callback invoked for each path step with the destination photo identifier
 * @returns Navigation state and helper actions for controlling sequential routing
 *
 * @example
 * ```tsx
 * const { navigationState, startNavigation, skipToEnd } = useRouteNavigation(jumpToPhoto)
 *
 * startNavigation(result.path)
 * ```
 */
export function useRouteNavigation(onNavigate: (photoId: string) => void): UseRouteNavigationReturn {
  const [speed, setSpeedValue] = useState<NavigationSpeed>(NAVIGATION_SPEEDS.NORMAL)
  const [state, setState] = useState<InternalState>({
    isNavigating: false,
    currentStepIndex: -1,
    totalSteps: 0,
    currentPhotoId: null,
    path: [],
    pendingPath: []
  })
  const timeoutRef = useRef<TimeoutHandle>(null)

  const clearScheduledStep = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const navigationState: NavigationState = useMemo(
    () => ({
      isNavigating: state.isNavigating,
      currentStepIndex: state.currentStepIndex,
      totalSteps: state.totalSteps,
      currentPhotoId: state.currentPhotoId,
      path: state.path
    }),
    [state.currentPhotoId, state.currentStepIndex, state.isNavigating, state.path, state.totalSteps]
  )

  const advanceToNextStep = useCallback(
    (path: string[], nextIndex: number) => {
      if (nextIndex >= path.length) {
        setState(prev => ({
          ...prev,
          isNavigating: false,
          currentStepIndex: path.length - 1,
          totalSteps: path.length,
          pendingPath: []
        }))
        return
      }

      const nextPhotoId = path[nextIndex]
      onNavigate(nextPhotoId)
      setState(prev => ({
        ...prev,
        isNavigating: true,
        currentStepIndex: nextIndex,
        totalSteps: path.length,
        currentPhotoId: nextPhotoId,
        pendingPath: path.slice(nextIndex + 1)
      }))

      clearScheduledStep()
      timeoutRef.current = setTimeout(() => {
        advanceToNextStep(path, nextIndex + 1)
      }, speed.delayMs)
    },
    [clearScheduledStep, onNavigate, speed.delayMs]
  )

  const startNavigation = useCallback(
    (path: string[]) => {
      const cleanedPath = path.filter((value): value is string => typeof value === 'string' && value.length > 0)
      if (cleanedPath.length === 0) {
        return
      }
      clearScheduledStep()
      setState({
        isNavigating: true,
        currentStepIndex: -1,
        totalSteps: cleanedPath.length,
        currentPhotoId: null,
        path: cleanedPath,
        pendingPath: cleanedPath
      })
      timeoutRef.current = setTimeout(() => {
        advanceToNextStep(cleanedPath, 0)
      }, 10)
    },
    [advanceToNextStep, clearScheduledStep]
  )

  const skipToEnd = useCallback(() => {
    if (!state.isNavigating || state.path.length === 0) {
      return
    }
    clearScheduledStep()
    const destinationId = state.path[state.path.length - 1]
    onNavigate(destinationId)
    setState(prev => ({
      ...prev,
      isNavigating: false,
      currentStepIndex: prev.path.length - 1,
      currentPhotoId: destinationId,
      pendingPath: []
    }))
  }, [clearScheduledStep, onNavigate, state.isNavigating, state.path])

  const cancelNavigation = useCallback(() => {
    if (!state.isNavigating) {
      return
    }
    clearScheduledStep()
    setState(prev => ({
      ...prev,
      isNavigating: false,
      pendingPath: []
    }))
  }, [clearScheduledStep, state.isNavigating])

  const setSpeed = useCallback(
    (nextSpeed: NavigationSpeed) => {
      setSpeedValue(nextSpeed)
      if (!state.isNavigating || state.pendingPath.length === 0) {
        return
      }
      const resumePath = [state.currentPhotoId, ...state.pendingPath].filter(
        (value): value is string => typeof value === 'string'
      )
      clearScheduledStep()
      timeoutRef.current = setTimeout(() => {
        advanceToNextStep(resumePath, 1)
      }, nextSpeed.delayMs)
    },
    [advanceToNextStep, clearScheduledStep, state.currentPhotoId, state.isNavigating, state.pendingPath]
  )

  useEffect(() => () => clearScheduledStep(), [clearScheduledStep])

  return {
    navigationState,
    startNavigation,
    skipToEnd,
    cancelNavigation,
    setSpeed,
    currentSpeed: speed
  }
}
