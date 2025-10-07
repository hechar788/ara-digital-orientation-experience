import React, { useEffect, useRef } from 'react'
import { Timer as TimerIcon } from 'lucide-react'

/**
 * Props for the Timer component
 *
 * Controls the timer's active state for race mode timing.
 *
 * @property isActive - Whether the timer is currently running
 * @property isPaused - Whether the timer should be paused (e.g., during popup display)
 * @property elapsedTime - Current elapsed time in milliseconds (controlled from parent)
 * @property onTimeUpdate - Callback to update elapsed time in parent component
 * @property className - Optional CSS class names for custom styling
 */
interface RaceTimerProps {
  isActive: boolean
  isPaused?: boolean
  elapsedTime: number
  onTimeUpdate: (time: number) => void
  className?: string
}

/**
 * Race timer component for VR tour race mode
 *
 * Displays a running timer that starts when race mode begins and stops
 * when race mode ends. The timer shows elapsed time in HH:MM:SS format.
 *
 * Features:
 * - Auto-starts when isActive becomes true
 * - Auto-stops and resets when isActive becomes false
 * - High-precision timing using requestAnimationFrame
 * - Responsive design with dark themed box
 *
 * @param isActive - Controls whether timer is running
 * @param className - Optional CSS classes for positioning
 * @returns Timer display component
 *
 * @example
 * ```typescript
 * <Timer
 *   isActive={isRaceMode}
 *   className="absolute top-4 left-4"
 * />
 * ```
 */
export const RaceTimer: React.FC<RaceTimerProps> = ({
  isActive,
  isPaused = false,
  elapsedTime,
  onTimeUpdate,
  className = ''
}) => {
  const startTimeRef = useRef<number | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (isActive && !isPaused) {
      // Start or resume timer
      startTimeRef.current = Date.now() - elapsedTime

      const updateTimer = () => {
        if (startTimeRef.current !== null) {
          const newElapsedTime = Date.now() - startTimeRef.current
          onTimeUpdate(newElapsedTime)
          animationFrameRef.current = requestAnimationFrame(updateTimer)
        }
      }

      animationFrameRef.current = requestAnimationFrame(updateTimer)
    } else if (isPaused || !isActive) {
      // Pause or stop timer - cancel animation frame
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isActive, isPaused, elapsedTime, onTimeUpdate])

  /**
   * Formats elapsed milliseconds into HH:MM:SS display format
   *
   * @param ms - Milliseconds to format
   * @returns Formatted time string
   */
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return [hours, minutes, seconds]
      .map(val => val.toString().padStart(2, '0'))
      .join(':')
  }

  if (!isActive && elapsedTime === 0) {
    return null
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-lg bg-black/70 backdrop-blur-sm px-4 py-2.5 text-white shadow-lg border border-white/10 ${className}`}
    >
      <TimerIcon className="h-5 w-5 text-blue-400" />
      <span className="text-lg font-mono font-semibold tabular-nums">
        {formatTime(elapsedTime)}
      </span>
    </div>
  )
}
