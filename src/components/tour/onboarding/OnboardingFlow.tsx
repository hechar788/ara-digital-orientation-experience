import React, { useMemo } from 'react'
import { X } from 'lucide-react'
import { type OnboardingInstructionLayout } from '@/components/tour/onboarding/OnboardingContext'
import { useOnboarding } from '@/hooks/useOnboarding'
import { useMinimapStore } from '@/hooks/useMinimapStore'
import { usePopup } from '@/hooks/usePopup'
import { SkipOnboardingPopup } from './SkipOnboardingPopup'
import { cn } from '@/lib/utils'
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice'

/**
 * Mapping of hotspot tutorial steps to their SVG icon paths
 *
 * Links step numbers 10-12 to corresponding hotspot icons for visual examples.
 */
const HOTSPOT_ICON_MAP: Record<number, string> = {
  10: '/svg/stairs.svg',
  11: '/svg/elevator.svg',
  12: '/svg/door-open.svg'
}

const INSTRUCTION_LAYOUT_PRESETS: Record<OnboardingInstructionLayout, { container: string; position: string }> = {
  'center-top': {
    container: 'fixed left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-[45] pointer-events-auto',
    position: 'top-4 sm:top-8'
  },
  'center-bottom': {
    container: 'fixed left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-[45] pointer-events-auto',
    position: 'bottom-4 sm:bottom-8'
  },
  'center-center': {
    container: 'fixed left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-[45] pointer-events-auto',
    position: 'top-1/2 -translate-y-1/2'
  },
  'zoom-right': {
    container: 'fixed left-4 right-4 sm:left-auto sm:right-auto z-[45] pointer-events-auto',
    position: 'top-[16.75rem] sm:top-[21.15rem] sm:right-4'
  },
  'zoom-right-minimap-closed': {
    container: 'fixed left-4 right-4 sm:left-auto sm:right-auto z-[45] pointer-events-auto',
    position: 'top-[8.5rem] sm:top-[8.25rem] sm:right-4'
  },
  'minimap-right': {
    container: 'fixed left-4 right-4 sm:left-auto sm:right-auto z-[45] pointer-events-auto',
    position: 'top-[15.7rem] sm:top-4 sm:right-[calc(1rem+15.5rem+1.5rem)]'
  },
  'minimap-right-step5': {
    container: 'fixed left-4 right-4 sm:left-auto sm:right-auto z-[45] pointer-events-auto',
    position: 'top-[16.65rem] sm:top-4 sm:right-[calc(1rem+15.5rem+1.5rem)]'
  },
  'minimap-right-minimap-closed': {
    container: 'fixed left-4 right-4 sm:left-auto sm:right-auto z-[45] pointer-events-auto',
    position: 'top-[8.5rem] sm:top-4 sm:right-[calc(1rem+15.5rem+1.5rem)]'
  },
  'minimap-right-minimap-closed-step5': {
    container: 'fixed left-4 right-4 sm:left-auto sm:right-auto z-[45] pointer-events-auto',
    position: 'top-[8.5rem] sm:top-4 sm:right-[calc(1rem+15.5rem+1.5rem)]'
  },
  'controls-bottom': {
    container: 'fixed left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-[45] pointer-events-auto',
    position: 'bottom-20 lg:bottom-[5.5rem]'
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
  const skipPopup = usePopup()
  const isTouchDevice = useIsTouchDevice()
  const minimap = useMinimapStore()

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

  // Dynamically adjust layout based on minimap state
  const layoutConfig = useMemo(() => {
    if (!currentConfig) return defaultLayout

    let layout = currentConfig.layout

    // Step 3 is the zoom controls step - adjust based on minimap open/closed state
    if (currentStep === 3 && layout === 'zoom-right') {
      layout = minimap.isOpen ? 'zoom-right' : 'zoom-right-minimap-closed'
    }

    // Step 4 is minimap toggle step - adjust based on minimap open/closed state
    if (currentStep === 4 && layout === 'minimap-right') {
      layout = minimap.isOpen ? 'minimap-right' : 'minimap-right-minimap-closed'
    }

    // Step 5 is minimap popup step - adjust based on minimap open/closed state
    if (currentStep === 5 && layout === 'minimap-right') {
      layout = minimap.isOpen ? 'minimap-right-step5' : 'minimap-right-minimap-closed-step5'
    }

    return INSTRUCTION_LAYOUT_PRESETS[layout] ?? defaultLayout
  }, [currentConfig, currentStep, minimap.isOpen, defaultLayout])

  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps
  const isHotspotTutorialStep = currentStep >= 10 && currentStep <= 12
  const hotspotIcon = HOTSPOT_ICON_MAP[currentStep]

  const handleNext = () => {
    if (isLastStep) {
      completeOnboarding()
      onComplete?.()
    } else {
      nextStep()
    }
  }

  const handleCloseClick = () => {
    skipPopup.open()
  }

  const handleSkipConfirm = () => {
    skipPopup.close()
    skipOnboarding()
    onSkip?.()
  }

  const handleSkipCancel = () => {
    skipPopup.close()
  }

  if (!currentConfig || !isVisible) {
    return null
  }

  return (
    <>
      {/* Instruction box - hidden when skip popup is open */}
      {!skipPopup.isOpen && (
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

            {/* Instruction text - with optional hotspot visual for steps 10-12 */}
            <div className="mt-5 mb-9">
              {isHotspotTutorialStep && hotspotIcon ? (
                /* Hotspot tutorial step with visual example */
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  {/* Text content */}
                  <p className="text-sm sm:text-base text-foreground text-left flex-1">
                    {displayText}
                  </p>

                  {/* Hotspot visual example */}
                  <div className="flex-shrink-0 mt-3 sm:mt-0">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full shadow-lg flex items-center justify-center border border-border">
                      <img
                        src={hotspotIcon}
                        alt="Hotspot icon"
                        className="w-8 h-8 sm:w-10 sm:h-10"
                        style={{ filter: 'brightness(0)' }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Standard text-only instruction */
                <p className="text-sm sm:text-base text-foreground text-left">
                  {displayText}
                </p>
              )}
            </div>

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

      {/* Skip confirmation dialog */}
      <div className="relative z-[46]">
        <SkipOnboardingPopup
          isOpen={skipPopup.isOpen}
          onClose={handleSkipCancel}
          onConfirm={handleSkipConfirm}
        />
      </div>
    </>
  )
}
