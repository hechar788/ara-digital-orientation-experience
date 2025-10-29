import React, { useMemo } from 'react'
import { Play, Pause, ChevronLeft, ChevronRight, X } from 'lucide-react'
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
    stepForward,
    restartNavigation
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
        'rounded-2xl border border-blue-200 bg-white/95 px-3 pb-3.5 pt-4 shadow-xl text-xs text-blue-900 backdrop-blur-md touch-none',
        'w-[12.7rem]',
        'sm:w-[min(27rem,calc(100vw-3rem))] sm:p-5 sm:text-sm sm:bg-white/90',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="relative mb-2 sm:mb-1">
        <button
          type="button"
          onClick={() => restartNavigation()}
          className="absolute left-0 top-[-0.4rem] flex h-7 w-7 items-center justify-center rounded-full border border-blue-200 text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:top-0 sm:h-auto sm:w-auto sm:rounded-lg sm:px-3 sm:py-1"
          aria-label="Restart navigation"
        >
          <img
            src="/svg/rotate-ccw.svg"
            alt=""
            aria-hidden="true"
            className="h-3.5 w-3.5 sm:hidden"
            draggable={false}
          />
          <span className="hidden text-xs font-medium sm:block">Restart</span>
        </button>
        <p className="px-7 text-center text-sm font-semibold sm:px-0 sm:text-base">
          Step {Math.min(currentStepNumber, displayTotalSteps)} of {displayTotalSteps}
        </p>
        <button
          type="button"
          onClick={cancelNavigation}
          className="absolute right-0 top-[-0.4rem] flex h-7 w-7 items-center justify-center rounded-full border border-blue-200 text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:top-0 sm:h-auto sm:w-auto sm:rounded-lg sm:px-3 sm:py-1"
          aria-label="Cancel navigation"
        >
          <X className="h-3.5 w-3.5 sm:hidden" />
          <span className="hidden text-xs font-medium sm:block">Cancel</span>
        </button>
      </div>
      <div className="mt-[1.35rem] flex items-center gap-2 sm:mt-5 sm:gap-3">
        <button
          type="button"
          onClick={stepBackward}
          disabled={isAtFirstStep}
          className="flex h-6.5 w-6.5 items-center justify-center rounded-full border border-blue-200 text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50 sm:h-8 sm:w-8"
          aria-label="Go to previous step"
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
        <div className="relative flex-1">
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-blue-200/70 sm:h-1.5">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <button
            type="button"
            onClick={isPaused ? resumeNavigation : pauseNavigation}
            className="absolute left-1/2 top-1/2 flex h-7.5 w-7.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-blue-700 shadow-md ring-1 ring-blue-200 transition hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:h-10 sm:w-10"
            aria-label={isPaused ? 'Resume navigation' : 'Pause navigation'}
          >
            {isPaused ? (
              <Play className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            ) : (
              <Pause className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            )}
          </button>
        </div>
        <button
          type="button"
          onClick={stepForward}
          disabled={isAtLastStep}
          className="flex h-6.5 w-6.5 items-center justify-center rounded-full border border-blue-200 text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50 sm:h-8 sm:w-8"
          aria-label="Go to next step"
        >
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
      </div>
      <div className="mt-3 flex flex-col gap-2 text-[11px] text-blue-900/80 sm:mt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:text-xs">
        <span className="font-medium">Speed:</span>
        <div className="grid grid-cols-3 gap-1 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
          {speedOptions.map(option => {
            const isActive = option.delayMs === currentSpeed.delayMs
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => setSpeed(option)}
                className={cn(
                  'rounded-full border px-2 py-[0.35rem] text-[11px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:px-3 sm:py-0.5 sm:text-xs',
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
    </div>
  )
}
