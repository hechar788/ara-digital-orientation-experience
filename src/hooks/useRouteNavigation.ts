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
 * @property isPaused - Indicates whether navigation is currently paused awaiting a resume command
 * @property currentStepIndex - Zero-based index for the current hop inside the path array
 * @property totalSteps - Total path length
 * @property currentPhotoId - Photo identifier used for the most recent onNavigate call
 * @property path - Immutable path array originally supplied to startNavigation
 */
export interface NavigationState {
  isNavigating: boolean
  isPaused: boolean
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
 * @property pauseNavigation - Temporarily pauses navigation without clearing the remaining path
 * @property resumeNavigation - Resumes navigation from the next pending step
 */
export interface UseRouteNavigationReturn {
  navigationState: NavigationState
  startNavigation: (path: string[]) => void
  skipToEnd: () => Promise<void>
  cancelNavigation: () => void
  setSpeed: (speed: NavigationSpeed) => void
  currentSpeed: NavigationSpeed
  pauseNavigation: () => void
  resumeNavigation: () => void
}

/**
 * Additional metadata supplied to navigation handlers when sequential navigation advances.
 *
 * @property isSequential - Indicates the navigation request originated from the sequential navigator
 * @property stepIndex - Zero-based index for the step being executed
 * @property totalSteps - Total number of steps within the active path
 */
export interface RouteNavigationHandlerOptions {
  isSequential?: boolean
  stepIndex?: number
  totalSteps?: number
  nextPhotoId?: string
}

type TimeoutHandle = ReturnType<typeof setTimeout> | null

/**
 * Hook that animates navigation between photos step-by-step using a supplied path array.
 *
 * The hook defers execution between steps based on the selected speed preset, exposes
 * progress metadata for the UI, and supports skipping or cancelling navigation entirely.
 *
 * @param onNavigate - Callback invoked for each path step with the destination photo identifier (supports async handlers)
 * @returns Navigation state and helper actions for controlling sequential routing
 *
 * @example
 * ```tsx
 * const { navigationState, startNavigation, skipToEnd } = useRouteNavigation(jumpToPhoto)
 *
 * startNavigation(result.path)
 * ```
 */
export function useRouteNavigation(
  onNavigate: (photoId: string, options?: RouteNavigationHandlerOptions) => Promise<void> | void
): UseRouteNavigationReturn {
  const [speed, setSpeedValue] = useState<NavigationSpeed>(NAVIGATION_SPEEDS.NORMAL)
  const [state, setState] = useState<InternalState>({
    isNavigating: false,
    isPaused: false,
    currentStepIndex: -1,
    totalSteps: 0,
    currentPhotoId: null,
    path: [],
    pendingPath: []
  })
  const timeoutRef = useRef<TimeoutHandle>(null)
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const clearScheduledStep = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const navigationState: NavigationState = useMemo(
    () => ({
      isNavigating: state.isNavigating,
      isPaused: state.isPaused,
      currentStepIndex: state.currentStepIndex,
      totalSteps: state.totalSteps,
      currentPhotoId: state.currentPhotoId,
      path: state.path
    }),
    [
      state.currentPhotoId,
      state.currentStepIndex,
      state.isNavigating,
      state.isPaused,
      state.path,
      state.totalSteps
    ]
  )

  const advanceToNextStep = useCallback(
    async (path: string[], nextIndex: number) => {
      if (nextIndex >= path.length) {
        setState(prev => ({
          ...prev,
          isNavigating: false,
          isPaused: false,
          currentStepIndex: path.length - 1,
          totalSteps: path.length,
          pendingPath: []
        }))
        return
      }

      const nextPhotoId = path[nextIndex]
      const upcomingPhotoId = nextIndex + 1 < path.length ? path[nextIndex + 1] : undefined
      await onNavigate(nextPhotoId, {
        isSequential: true,
        stepIndex: nextIndex,
        totalSteps: path.length,
        nextPhotoId: upcomingPhotoId
      })

      const latestState = stateRef.current
      const navigationStillActive = latestState.isNavigating
      const pausedDuringStep = latestState.isPaused
      const shouldMaintainPending = navigationStillActive || pausedDuringStep

      setState(prev => ({
        ...prev,
        isNavigating: navigationStillActive,
        isPaused: pausedDuringStep,
        currentStepIndex: nextIndex,
        totalSteps: path.length,
        currentPhotoId: nextPhotoId,
        pendingPath: shouldMaintainPending ? path.slice(nextIndex + 1) : []
      }))

      clearScheduledStep()

      if (!navigationStillActive || pausedDuringStep) {
        return
      }

      timeoutRef.current = setTimeout(() => {
        void advanceToNextStep(path, nextIndex + 1)
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
        isPaused: false,
        currentStepIndex: -1,
        totalSteps: cleanedPath.length,
        currentPhotoId: null,
        path: cleanedPath,
        pendingPath: cleanedPath
      })
      timeoutRef.current = setTimeout(() => {
        void advanceToNextStep(cleanedPath, 0)
      }, 10)
    },
    [advanceToNextStep, clearScheduledStep]
  )

  const skipToEnd = useCallback(async () => {
    if (!state.isNavigating || state.path.length === 0) {
      return
    }
    clearScheduledStep()
    const destinationId = state.path[state.path.length - 1]
    await onNavigate(destinationId, {
      isSequential: true,
      stepIndex: state.path.length - 1,
      totalSteps: state.path.length,
      nextPhotoId: undefined
    })
    setState(prev => ({
      ...prev,
      isNavigating: false,
      isPaused: false,
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
      isPaused: false,
      pendingPath: []
    }))
  }, [clearScheduledStep, state.isNavigating])

  const pauseNavigation = useCallback(() => {
    if (!state.isNavigating || state.isPaused) {
      return
    }
    clearScheduledStep()
    setState(prev => ({
      ...prev,
      isPaused: true
    }))
  }, [clearScheduledStep, state.isNavigating, state.isPaused])

  const resumeNavigation = useCallback(() => {
    const snapshot = stateRef.current
    if (!snapshot.isNavigating || !snapshot.isPaused || snapshot.pendingPath.length === 0) {
      return
    }

    setState(prev => ({
      ...prev,
      isPaused: false
    }))

    clearScheduledStep()
    const nextIndex = snapshot.currentStepIndex + 1
    const path = snapshot.path

    timeoutRef.current = setTimeout(() => {
      const latest = stateRef.current
      if (!latest.isNavigating || latest.isPaused || latest.pendingPath.length === 0) {
        return
      }
      void advanceToNextStep(path, nextIndex)
    }, 10)
  }, [advanceToNextStep, clearScheduledStep])

  const setSpeed = useCallback(
    (nextSpeed: NavigationSpeed) => {
      setSpeedValue(nextSpeed)

      const snapshot = stateRef.current
      if (!snapshot.isNavigating || snapshot.pendingPath.length === 0 || snapshot.isPaused) {
        return
      }

      clearScheduledStep()
      timeoutRef.current = setTimeout(() => {
        const latest = stateRef.current
        if (!latest.isNavigating || latest.isPaused || latest.pendingPath.length === 0) {
          return
        }
        const nextIndex = latest.currentStepIndex + 1
        void advanceToNextStep(latest.path, nextIndex)
      }, nextSpeed.delayMs)
    },
    [advanceToNextStep, clearScheduledStep]
  )

  useEffect(() => () => clearScheduledStep(), [clearScheduledStep])

  return {
    navigationState,
    startNavigation,
    skipToEnd,
    cancelNavigation,
    setSpeed,
    currentSpeed: speed,
    pauseNavigation,
    resumeNavigation
  }
}
