import React, { useEffect } from 'react'
import { TourControls } from './TourControls'
import { AIChatPopup } from './AIChatPopup'
import { TourInformationPopup } from './information/TourInformationPopup'
import { usePopup } from '@/hooks/usePopup'

/**
 * Props for the Tour component
 *
 * Defines the configuration and callbacks for tour mode features including
 * control positioning and mode switching.
 *
 * @property className - Optional CSS class names for the controls container
 * @property style - Optional inline styles for the controls
 * @property onStartRace - Callback triggered when user initiates race mode
 */
interface TourProps {
  className?: string
  style?: React.CSSProperties
  onStartRace?: () => void
}

/**
 * Tour mode container component
 *
 * Manages all tour-specific UI features and state including AI chat assistant,
 * information popup, and tour controls. Uses the usePopup hook for consistent
 * popup state management across all tour dialogs.
 *
 * Features:
 * - AI Chat Assistant popup for user guidance
 * - Information popup (shown automatically on first session)
 * - Tour control panel with fullscreen, race start, AI chat, and info buttons
 * - Clean separation of tour concerns from other modes
 *
 * @param className - CSS classes for the tour controls positioning
 * @param style - Inline styles for the tour controls
 * @param onStartRace - Handler for switching to race mode
 * @returns React component containing all tour mode UI elements
 *
 * @example
 * ```typescript
 * <Tour
 *   className="fixed bottom-4 left-1/2 -translate-x-1/2"
 *   onStartRace={() => setMode('race')}
 * />
 * ```
 */
export const Tour: React.FC<TourProps> = ({
  className = '',
  style,
  onStartRace
}) => {
  const aiChat = usePopup()
  const info = usePopup()

  // Show info popup on first session (hard refresh)
  useEffect(() => {
    const hasSeenInSession = sessionStorage.getItem('hasSeenInfoPopup')
    if (!hasSeenInSession) {
      info.open()
      sessionStorage.setItem('hasSeenInfoPopup', 'true')
    }
  }, [])

  return (
    <>
      <TourControls
        className={className}
        style={style}
        onAIChat={aiChat.toggle}
        onInfo={info.toggle}
        onStartRace={onStartRace}
      />

      <AIChatPopup
        isOpen={aiChat.isOpen}
        onClose={aiChat.close}
      />

      <TourInformationPopup
        isOpen={info.isOpen}
        onClose={info.close}
      />
    </>
  )
}
