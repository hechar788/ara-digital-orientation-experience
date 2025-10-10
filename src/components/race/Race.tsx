import React, { useState, useCallback, useEffect } from 'react'
import { RaceControls } from './menu/RaceControls'
import { RaceInformationPopup } from './information/RaceInformationPopup'
import { RaceTimer } from './timer/RaceTimer'
import { RaceResults } from './results/RaceResults'
import { usePopup } from '@/hooks/usePopup'

/**
 * Props for the Race component
 *
 * Defines the configuration and callbacks for race mode features including
 * control positioning, timer styling, and mode switching.
 *
 * @property className - Optional CSS class names for the controls container
 * @property style - Optional inline styles for the controls
 * @property timerClassName - Optional CSS class names for the timer positioning
 * @property onEndRace - Callback triggered when user ends race mode and returns to orientation
 * @property onRestart - Callback triggered when user restarts the race (parent handles navigation reset)
 * @property areasDiscovered - Number of areas discovered during the race
 * @property keyLocationsFound - Number of key locations found during the race
 */
interface RaceProps {
  className?: string
  style?: React.CSSProperties
  timerClassName?: string
  onEndRace?: () => void
  onRestart?: () => void
  areasDiscovered?: number
  keyLocationsFound?: number
}

/**
 * Race mode container component
 *
 * Manages all race-specific UI features and state including race timer,
 * information popup, and race controls. Uses the usePopup hook for consistent
 * popup state management.
 *
 * Features:
 * - Race timer showing elapsed time
 * - Race-specific information popup
 * - Race control panel with fullscreen, info, and end race buttons
 * - Clean separation of race concerns from other modes
 *
 * @param className - CSS classes for the race controls positioning
 * @param style - Inline styles for the race controls
 * @param timerClassName - CSS classes for the timer positioning
 * @param onEndRace - Handler for ending race mode and returning to tour
 * @returns React component containing all race mode UI elements
 *
 * @example
 * ```typescript
 * <Race
 *   className="fixed bottom-4 left-1/2 -translate-x-1/2"
 *   timerClassName="fixed top-4 right-4"
 *   onEndRace={() => setMode('tour')}
 * />
 * ```
 */
export const Race: React.FC<RaceProps> = ({
  className = '',
  style,
  timerClassName = '',
  onEndRace,
  onRestart,
  areasDiscovered = 0,
  keyLocationsFound = 0
}) => {
  const info = usePopup()
  const results = usePopup()
  const [isEndPopupPaused, setIsEndPopupPaused] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [capturedTime, setCapturedTime] = useState(0)

  // Timer should be paused when end popup, results, or info popup are showing
  const isTimerPaused = isEndPopupPaused || results.isOpen || info.isOpen

  // Show race info popup every time the race starts
  useEffect(() => {
    info.open()
  }, [])

  /**
   * Formats elapsed milliseconds into HH:MM:SS display format
   */
  const formatTime = useCallback((ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return [hours, minutes, seconds]
      .map(val => val.toString().padStart(2, '0'))
      .join(':')
  }, [])

  /**
   * Handles showing results - captures current time and opens results
   */
  const handleShowResults = useCallback(() => {
    setCapturedTime(elapsedTime)
    results.open()
  }, [elapsedTime, results])

  /**
   * Handles race restart - resets timer, shows info popup, and delegates navigation to parent
   */
  const handleRestart = useCallback(() => {
    setElapsedTime(0)
    setCapturedTime(0)
    results.close()
    info.open()
    onRestart?.()
  }, [onRestart, results, info])

  /**
   * Handles ending race and returning to orientation
   */
  const handleReturnToOrientation = useCallback(() => {
    results.close()
    onEndRace?.()
  }, [onEndRace, results])

  return (
    <>
      <RaceControls
        className={className}
        style={style}
        onInfo={info.toggle}
        onShowResults={handleShowResults}
        isTimerPaused={isTimerPaused}
        onTimerPauseChange={setIsEndPopupPaused}
      />

      <RaceInformationPopup
        isOpen={info.isOpen}
        onClose={info.close}
      />

      <RaceTimer
        isActive={true}
        isPaused={isTimerPaused}
        elapsedTime={elapsedTime}
        onTimeUpdate={setElapsedTime}
        className={timerClassName}
      />

      <RaceResults
        isOpen={results.isOpen}
        onClose={results.close}
        areasDiscovered={areasDiscovered}
        keyLocationsFound={keyLocationsFound}
        timeTaken={formatTime(capturedTime)}
        onRestart={handleRestart}
        onReturnToOrientation={handleReturnToOrientation}
      />
    </>
  )
}
