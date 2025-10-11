import React, { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { type OnboardingInstructionLayout } from '@/components/tour/onboarding/OnboardingContext'
import { useOnboarding } from '@/hooks/useOnboarding'
import { SkipOnboardingPopup } from './SkipOnboardingPopup'
import { cn } from '@/lib/utils'
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice'

const INSTRUCTION_LAYOUT_PRESETS: Record<OnboardingInstructionLayout, { container: string; position: string }> = {
  'center-top': {
    container: 'fixed left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-[200] pointer-events-auto',
    position: 'top-4 sm:top-8'
  },
  'center-bottom': {
    container: 'fixed left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-[200] pointer-events-auto',
    position: 'bottom-4 sm:bottom-8'
  },
  'zoom-right': {
    container: 'fixed left-4 right-4 sm:left-auto sm:right-auto z-[200] pointer-events-auto',
    position: 'top-[17.5rem] sm:right-4'
  },
  'minimap-right': {
    container: 'fixed left-4 right-4 sm:left-auto sm:right-auto z-[200] pointer-events-auto',
    position: 'top-[17.5rem] sm:top-4 sm:right-[calc(1rem+15.5rem+1.5rem)]'
  },
  'controls-bottom': {
    container: 'fixed left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-[200] pointer-events-auto',
    position: 'bottom-20 sm:bottom-[5.5rem]'
  }
}

/**
 * Props for OnboardingFlow component
 *
 * Defines callbacks for flow completion and cancellation.
 *
 * @property onComplete - Optional callback triggered when user completes all steps
 * @property onSkip - Optional callback triggered when user confirms skipping onboarding
 */
interface OnboardingFlowProps {
  onComplete?: () => void
  onSkip?: () => void
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
 *   onComplete={() => console.log('Onboarding finished')}
 *   onSkip={() => console.log('Onboarding skipped')}
 * />
 * ```
 */
export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onSkip
}) => {
  const {
    currentStep,
    currentConfig,
    totalSteps,
    isVisible,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding
  } = useOnboarding()
  const [isSkipPopupOpen, setIsSkipPopupOpen] = useState(false)
  const isTouchDevice = useIsTouchDevice()

  const displayText = useMemo(() => {
    if (!currentConfig) {
      return ''
    }
    if (isTouchDevice && currentConfig.mobileText) {
      return currentConfig.mobileText
    }
    return currentConfig.text
  }, [currentConfig, isTouchDevice])

  const defaultLayout = INSTRUCTION_LAYOUT_PRESETS['center-bottom']
  const layoutConfig = currentConfig
    ? INSTRUCTION_LAYOUT_PRESETS[currentConfig.layout] ?? defaultLayout
    : defaultLayout

  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  const handleNext = () => {
    if (isLastStep) {
      completeOnboarding()
      onComplete?.()
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
    onSkip?.()
  }

  const handleSkipCancel = () => {
    setIsSkipPopupOpen(false)
  }

  if (!currentConfig || !isVisible) {
    return null
  }

  return (
    <>
      {/* Instruction box - hidden when skip popup is open */}
      {!isSkipPopupOpen && (
        <div
          className={cn(
            layoutConfig.container,
            layoutConfig.position
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
                {currentStep}/{totalSteps}
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
