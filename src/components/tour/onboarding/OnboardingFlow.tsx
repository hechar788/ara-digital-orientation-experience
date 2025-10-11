import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useOnboarding, ONBOARDING_STEPS } from '@/contexts/OnboardingContext'
import { SkipOnboardingPopup } from './SkipOnboardingPopup'
import { cn } from '@/lib/utils'

/**
 * Detects if the current device is mobile
 *
 * @returns True if mobile device, false otherwise
 */
const isMobileDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * Props for OnboardingFlow component
 *
 * Defines callbacks for flow completion and cancellation.
 *
 * @property onComplete - Callback triggered when user completes all 8 steps
 * @property onSkip - Callback triggered when user confirms skipping onboarding
 */
interface OnboardingFlowProps {
  onComplete: () => void
  onSkip: () => void
}

/**
 * Main onboarding flow orchestrator component
 *
 * Renders a floating instruction box positioned based on the highlighted
 * element. No full-screen overlay - components remain interactive.
 *
 * User flow:
 * 1. Instruction box shows current step text
 * 2. User clicks "Next" to advance or "Complete" on final step
 * 3. Clicking X button opens skip confirmation dialog
 * 4. Confirmation exits onboarding, cancel returns to flow
 *
 * @param onComplete - Handler for successful completion of all steps
 * @param onSkip - Handler for confirmed skip action
 * @returns Floating instruction box UI
 *
 * @example
 * ```tsx
 * <OnboardingFlow
 *   onComplete={() => setOnboardingActive(false)}
 *   onSkip={() => setOnboardingActive(false)}
 * />
 * ```
 */
export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onSkip
}) => {
  const { currentStep, nextStep, previousStep, skipOnboarding, startOnboarding } = useOnboarding()
  const [isSkipPopupOpen, setIsSkipPopupOpen] = useState(false)

  // Start onboarding when component mounts
  useEffect(() => {
    startOnboarding()
  }, [startOnboarding])

  const currentConfig = ONBOARDING_STEPS[currentStep - 1]
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === ONBOARDING_STEPS.length
  const isDragStep = currentStep === 2
  const isZoomStep = currentStep === 3
  const isMinimapStep = currentStep === 4
  const isControlsStep = currentStep >= 5 && currentStep <= 8 // Steps 5-8 (fullscreen, race, ai, info)

  // Dynamic text for zoom step based on device type
  const isMobile = isMobileDevice()
  const displayText = isZoomStep
    ? isMobile
      ? 'Use the zoom slider or pinch to zoom in and out of the tour.'
      : 'Use the zoom slider or scroll to zoom in and out of the tour.'
    : currentConfig.text

  const handleNext = () => {
    if (isLastStep) {
      skipOnboarding()
      onComplete()
    } else {
      nextStep()
    }
  }

  const handleCloseClick = () => {
    setIsSkipPopupOpen(true)
  }

  const handleSkipConfirm = () => {
    setIsSkipPopupOpen(false)
    skipOnboarding()
    onSkip()
  }

  const handleSkipCancel = () => {
    setIsSkipPopupOpen(false)
  }

  if (!currentConfig) {
    return null
  }

  // For drag step (step 2), keep at top like step 1
  // For zoom step (step 3), position box right-aligned with zoom slider
  // For minimap step (step 4), position box right-aligned on mobile, left of minimap on desktop
  // For controls steps (5-8), position box above TourControls to avoid overlap
  const instructionBoxPositionClass = isDragStep
    ? 'top-4 sm:top-8'
    : isZoomStep
      ? 'top-[17.5rem] sm:right-4'
      : isMinimapStep
        ? 'top-[17.5rem] sm:top-4 sm:right-[calc(1rem+15.5rem+1.5rem)]'
        : isControlsStep
          ? 'bottom-20 sm:bottom-[5.5rem]'
          : currentConfig.position === 'top'
            ? 'top-4 sm:top-8'
            : 'bottom-4 sm:bottom-8'

  const instructionBoxLayoutClass = isZoomStep || isMinimapStep
    ? 'fixed left-4 right-4 sm:left-auto sm:right-auto z-[200] pointer-events-auto'
    : 'fixed left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-[200] pointer-events-auto'

  return (
    <>
      {/* Instruction box - hidden when skip popup is open */}
      {!isSkipPopupOpen && (
        <div
          className={cn(
            instructionBoxLayoutClass,
            instructionBoxPositionClass
          )}
        >
          <div className="bg-background border-2 border-border rounded-lg shadow-2xl pt-2 px-6 pb-4 sm:pt-4 sm:px-8 sm:pb-6 max-w-md mx-auto sm:mx-0 relative">
            {/* Close button */}
            <button
              onClick={handleCloseClick}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 p-1 rounded-sm opacity-70 hover:opacity-100 hover:bg-accent transition-all cursor-pointer"
              aria-label="Skip onboarding"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Step counter */}
            <div className="flex items-center justify-center mb-5 h-6 sm:h-6">
              <span className="text-sm font-medium text-muted-foreground">
                {currentStep}/{ONBOARDING_STEPS.length}
              </span>
            </div>

            {/* Instruction text */}
            <p className="text-sm sm:text-base text-foreground text-left mt-5 mb-9">
              {displayText}
            </p>

            {/* Navigation buttons */}
            <div className="flex justify-between">
              {!isFirstStep && (
                <button
                  onClick={previousStep}
                  className="bg-muted text-foreground px-8 py-2 rounded-sm text-sm font-medium hover:bg-muted/80 transition cursor-pointer"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className={`${isFirstStep ? 'w-full px-6 py-2.5' : 'px-8 py-2'} bg-foreground text-background rounded-sm text-sm font-medium hover:bg-foreground/90 transition cursor-pointer`}
              >
                {isLastStep ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skip confirmation dialog - highest z-index */}
      <div className="relative z-[300]">
        <SkipOnboardingPopup
          isOpen={isSkipPopupOpen}
          onClose={handleSkipCancel}
          onConfirm={handleSkipConfirm}
        />
      </div>
    </>
  )
}
