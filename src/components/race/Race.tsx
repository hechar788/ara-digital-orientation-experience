import React from 'react'
import { RaceControls } from './RaceControls'
import { TourInformationPopup } from './RaceInformationPopup'
import { RaceTimer } from './RaceTimer'
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
 * @property onEndRace - Callback triggered when user ends race mode
 */
interface RaceProps {
  className?: string
  style?: React.CSSProperties
  timerClassName?: string
  onEndRace?: () => void
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
  onEndRace
}) => {
  const info = usePopup()

  return (
    <>
      <RaceControls
        className={className}
        style={style}
        onInfo={info.toggle}
        onEndRace={onEndRace}
      />

      <TourInformationPopup
        isOpen={info.isOpen}
        onClose={info.close}
      />

      <RaceTimer
        isActive={true}
        className={timerClassName}
      />
    </>
  )
}
