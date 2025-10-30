/**
 * Race Location Counter Component
 *
 * Displays the number of hidden locations found during race mode.
 * Shows "Locations Found: X/Total" above the zoom slider.
 *
 * @fileoverview Race mode hidden location counter display
 */

import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Props for RaceLocationCounter component
 *
 * @property locationsFound - Number of hidden locations discovered
 * @property totalLocations - Total number of hidden locations in the race
 * @property className - Optional CSS classes for custom styling
 */
interface RaceLocationCounterProps {
  locationsFound: number
  totalLocations: number
  className?: string
}

/**
 * Race location counter display component
 *
 * Displays current progress of hidden location discoveries during race mode.
 * Designed to match the width of the zoom slider/minimap for consistent layout.
 *
 * Features:
 * - Clear progress indicator (X/Total format)
 * - Matching width with zoom slider/minimap
 * - Semi-transparent background matching race theme
 * - Responsive text sizing
 *
 * @param locationsFound - Count of hidden locations found
 * @param totalLocations - Total count of hidden locations
 * @param className - Additional CSS classes
 * @returns Race location counter component
 *
 * @example
 * ```typescript
 * <RaceLocationCounter
 *   locationsFound={3}
 *   totalLocations={10}
 *   className="w-62"
 * />
 * ```
 */
export const RaceLocationCounter: React.FC<RaceLocationCounterProps> = ({
  locationsFound,
  totalLocations,
  className
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-md bg-black/70 px-4 h-11 text-white text-sm font-medium w-full',
        className
      )}
    >
      <span>Hidden Locations Found: {locationsFound}/{totalLocations}</span>
    </div>
  )
}
