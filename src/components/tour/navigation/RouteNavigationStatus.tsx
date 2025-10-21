import React, { useMemo } from 'react'
import { NAVIGATION_SPEEDS, type NavigationSpeed, type UseRouteNavigationReturn } from '@/hooks/useRouteNavigation'
import { cn } from '@/lib/utils'
import { formatLocationId } from '@/lib/location-format'

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
 *   className="w-[11.55rem]"
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

  const { navigationState, skipToEnd, cancelNavigation, currentSpeed, setSpeed, pauseNavigation, resumeNavigation } =
    routeNavigation
  const { isNavigating, isPaused, totalSteps, currentStepIndex, path } = navigationState

  if (!isNavigating || totalSteps <= 0) {
    return null
  }

  const currentStepNumber = currentStepIndex >= 0 ? currentStepIndex + 1 : 1
  const progressPercent =
    totalSteps > 0 ? Math.min(100, Math.max(0, (currentStepNumber / totalSteps) * 100)) : 0
  const currentStepId =
    currentStepIndex >= 0 && path[currentStepIndex] ? path[currentStepIndex] : path[0] ?? null
  const nextStepId =
    currentStepIndex + 1 < path.length ? path[currentStepIndex + 1] ?? null : null

  return (
    <div
      className={cn(
        'rounded-2xl border border-blue-200 bg-white/90 p-4 shadow-xl text-sm text-blue-900 backdrop-blur-md',
        'w-[min(20rem,calc(100vw-3rem))]',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">
            Step {Math.min(currentStepNumber, totalSteps)} of {totalSteps}
          </p>
          <p className="text-xs text-blue-900/75">
            {formatLocationId(currentStepId)}
            {nextStepId ? ` → ${formatLocationId(nextStepId)}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={isPaused ? resumeNavigation : pauseNavigation}
            className="rounded-lg border border-blue-200 px-3 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            {isPaused ? 'Play' : 'Stop'}
          </button>
          <button
            type="button"
            onClick={skipToEnd}
            className="rounded-lg border border-blue-200 px-3 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={cancelNavigation}
            className="rounded-lg border border-blue-200 px-3 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Cancel
          </button>
        </div>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-blue-200/70">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-blue-900/80">
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
