import React, { useMemo } from 'react'
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  NAVIGATION_SPEEDS,
  type NavigationSpeed,
  type UseRouteNavigationReturn
} from '@/hooks/useRouteNavigation'
import { cn } from '@/lib/utils'

/**
 * Props for the RouteNavigationStatus component
 *
 * @property routeNavigation - Instance returned by useRouteNavigation providing state and controls
 * @property className - Optional CSS classes applied to the root container
 */
interface RouteNavigationStatusProps {
  routeNavigation?: UseRouteNavigationReturn | null
  className?: string
}

/**
 * Floating navigation progress indicator
 *
 * Renders the current step, destination summary, progress bar, and speed controls while the
 * sequential navigation helper is active. Designed to mirror the styling of other floating
 * controls such as the minimap and zoom slider.
 *
 * @param routeNavigation - Navigation controller exposing state and actions
 * @param className - Optional class names to fine-tune positioning and sizing
 * @returns Overlay element showing navigation progress, or null when idle
 *
 * @example
 * ```tsx
 * <RouteNavigationStatus
 *   routeNavigation={routeNavigation}
 *   className="w-[18rem]"
 * />
 * ```
 */
export const RouteNavigationStatus: React.FC<RouteNavigationStatusProps> = ({
  routeNavigation,
  className
}) => {
  const speedOptions = useMemo<NavigationSpeed[]>(() => Object.values(NAVIGATION_SPEEDS), [])

  if (!routeNavigation) {
    return null
  }

  const {
    navigationState,
    cancelNavigation,
    currentSpeed,
    setSpeed,
    pauseNavigation,
    resumeNavigation,
    stepBackward,
    stepForward
  } = routeNavigation
  const { isNavigating, isPaused, totalSteps, currentStepIndex } = navigationState

  if (!isNavigating || totalSteps <= 0) {
    return null
  }

  const currentStepNumber = currentStepIndex >= 0 ? currentStepIndex : 0
  const displayTotalSteps = totalSteps > 0 ? totalSteps - 1 : 0
  const progressPercent =
    displayTotalSteps > 0 ? Math.min(100, Math.max(0, (currentStepNumber / displayTotalSteps) * 100)) : 0
  const isAtFirstStep = currentStepIndex <= 0
  const isAtLastStep = currentStepIndex >= totalSteps - 1

  return (
    <div
      className={cn(
        'rounded-2xl border border-blue-200 bg-white/90 p-5 shadow-xl text-sm text-blue-900 backdrop-blur-md',
        'w-[min(27rem,calc(100vw-3rem))]',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="relative mb-1">
        <p className="text-center text-base font-semibold">
          Step {Math.min(currentStepNumber, displayTotalSteps)} of {displayTotalSteps}
        </p>
        <button
          type="button"
          onClick={cancelNavigation}
          className="absolute right-0 top-0 rounded-lg border border-blue-200 px-3 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          Cancel
        </button>
      </div>
      <div className="mt-5.5 flex items-center gap-3">
        <button
          type="button"
          onClick={stepBackward}
          disabled={isAtFirstStep}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Go to previous step"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="relative flex-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-blue-200/70">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <button
            type="button"
            onClick={isPaused ? resumeNavigation : pauseNavigation}
            className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-blue-700 shadow-md ring-1 ring-blue-200 transition hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label={isPaused ? 'Resume navigation' : 'Pause navigation'}
          >
            {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </button>
        </div>
        <button
          type="button"
          onClick={stepForward}
          disabled={isAtLastStep}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Go to next step"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-blue-900/80">
        <span className="font-medium">Speed:</span>
        {speedOptions.map(option => {
          const isActive = option.delayMs === currentSpeed.delayMs
          return (
            <button
              key={option.label}
              type="button"
              onClick={() => setSpeed(option)}
              className={cn(
                'rounded-full border px-3 py-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                isActive
                  ? 'border-blue-400 bg-blue-600 text-white'
                  : 'border-blue-200 text-blue-700 hover:bg-blue-100'
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
