import React, { useEffect } from 'react'
import { TourControls } from './menu/TourControls'
import { AIChatPopup } from './chat/AIChatPopup'
import { TourInformationPopup } from './information/TourInformationPopup'
import { OnboardingFlow } from './onboarding/OnboardingFlow'
import { usePopup } from '@/hooks/usePopup'
import { useOnboarding } from '@/hooks/useOnboarding'

/**
 * Props for the Tour component
 *
 * Defines the configuration and callbacks for tour mode features including
 * control positioning and mode switching.
 *
 * @property className - Optional CSS class names for the controls container
 * @property style - Optional inline styles for the controls
 * @property onStartRace - Callback triggered when user initiates race mode
 * @property currentPhotoId - Currently displayed photo identifier in the panoramic viewer
 * @property onNavigateToPhoto - Handler used by the AI chat to jump directly to a destination photo
 */
interface TourProps {
  className?: string
  style?: React.CSSProperties
  onStartRace?: () => void
  currentPhotoId: string
  onNavigateToPhoto?: (photoId: string) => void
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
 * @param currentPhotoId - Currently displayed photo identifier used by the AI assistant
 * @param onNavigateToPhoto - Handler invoked when the AI chat requests navigation
 * @returns React component containing all tour mode UI elements
 *
 * @example
 * ```typescript
 * <Tour
 *   className="fixed bottom-4 left-1/2 -translate-x-1/2"
 *   onStartRace={() => setMode('race')}
 *   currentPhotoId={currentPhotoId}
 *   onNavigateToPhoto={jumpToPhoto}
 * />
 * ```
 */
export const Tour: React.FC<TourProps> = ({
  className = '',
  style,
  onStartRace,
  currentPhotoId,
  onNavigateToPhoto
}) => {
  const aiChat = usePopup()
  const info = usePopup()
  const { isVisible: isOnboardingVisible, startOnboarding, skipOnboarding } = useOnboarding()

  // Show info popup on first session (hard refresh)
  useEffect(() => {
    const hasSeenInSession = sessionStorage.getItem('hasSeenInfoPopup')
    if (!hasSeenInSession) {
      info.open()
      sessionStorage.setItem('hasSeenInfoPopup', 'true')
    }
  }, [])

  const handleStartRace = () => {
    skipOnboarding()
    onStartRace?.()
  }

  return (
    <>
      <TourControls
        className={className}
        style={style}
        onAIChat={aiChat.toggle}
        onInfo={info.toggle}
        onStartRace={handleStartRace}
      />

      <AIChatPopup
        isOpen={aiChat.isOpen}
        onClose={aiChat.close}
        currentPhotoId={currentPhotoId}
        onNavigate={destination => {
          if (onNavigateToPhoto) {
            onNavigateToPhoto(destination)
          } else {
            console.warn('[Tour] Navigation callback missing while AI attempted to navigate to', destination)
          }
        }}
      />

      <TourInformationPopup
        isOpen={info.isOpen}
        onClose={info.close}
        onGetStarted={() => {
          info.close()
          startOnboarding()
        }}
      />

      {isOnboardingVisible && <OnboardingFlow />}
    </>
  )
}
