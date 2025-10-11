import React, { createContext, useContext, useState, useCallback } from 'react'

/**
 * Target element types that can be highlighted during onboarding
 *
 * Defines all possible UI elements that can receive visual focus during
 * the onboarding flow. Null indicates no specific element is highlighted
 * (e.g., for gesture-based instructions like drag-to-pan).
 */
export type OnboardingTarget =
  | 'arrows'
  | 'zoom'
  | 'minimap'
  | 'fullscreen'
  | 'race'
  | 'ai'
  | 'info'
  | null

/**
 * Onboarding context state interface
 *
 * Provides the current onboarding state and control methods. Used by
 * the OnboardingFlow component to manage step progression and by
 * OnboardingHighlight components to determine visual highlighting.
 *
 * @property currentStep - Current step number (1-8)
 * @property isActive - Whether onboarding is currently running
 * @property highlightTarget - Current UI element to highlight
 * @property nextStep - Advances to next step or completes onboarding
 * @property previousStep - Goes back to previous step
 * @property skipOnboarding - Immediately exits onboarding flow
 * @property startOnboarding - Begins onboarding from step 1
 */
interface OnboardingContextValue {
  currentStep: number
  isActive: boolean
  highlightTarget: OnboardingTarget
  nextStep: () => void
  previousStep: () => void
  skipOnboarding: () => void
  startOnboarding: () => void
}

/**
 * Props for OnboardingProvider component
 *
 * @property children - Child components that can access onboarding context
 */
interface OnboardingProviderProps {
  children: React.ReactNode
}

/**
 * Configuration for each onboarding step
 *
 * Defines the instruction text, highlighted element, and instruction box
 * position for each step in the onboarding flow.
 *
 * @property step - Step number (1-8)
 * @property target - UI element to highlight during this step
 * @property text - Instruction text to display
 * @property position - Vertical position of instruction box ('top' or 'bottom')
 */
export interface OnboardingStepConfig {
  step: number
  target: OnboardingTarget
  text: string
  position: 'top' | 'bottom'
}

/**
 * Onboarding step configurations
 *
 * Array defining all 8 steps of the onboarding flow with their respective
 * targets, instruction text, and instruction box positioning.
 */
export const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  {
    step: 1,
    target: 'arrows',
    text: 'Click on the directional arrows to navigate through the campus.',
    position: 'top'
  },
  {
    step: 2,
    target: null,
    text: 'Drag on the screen to explore each location in 360°.',
    position: 'bottom'
  },
  {
    step: 3,
    target: 'zoom',
    text: 'Use the zoom slider or pinch to zoom out in the tour.',
    position: 'bottom'
  },
  {
    step: 4,
    target: 'minimap',
    text: 'Click the Minimap to open it in fullscreen and quickly jump to any locations you would like to visit.',
    position: 'top'
  },
  {
    step: 5,
    target: 'fullscreen',
    text: 'Use the full screen button to expand the tour to fit your device.',
    position: 'bottom'
  },
  {
    step: 6,
    target: 'race',
    text: 'Click the Amazing Race button to start the Amazing Race.',
    position: 'bottom'
  },
  {
    step: 7,
    target: 'ai',
    text: 'Click the Assistant button to open the AI Assistant and ask it any questions you may have.',
    position: 'bottom'
  },
  {
    step: 8,
    target: 'info',
    text: 'Click the Information button to open the information screen or repeat this tutorial at any time.',
    position: 'bottom'
  }
]

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined)

/**
 * Onboarding context provider component
 *
 * Manages global onboarding state including current step, active status,
 * and highlighted target element. Provides control methods for step
 * navigation and flow control.
 *
 * @param children - Child components that can access onboarding context
 * @returns Provider component wrapping children with onboarding state
 *
 * @example
 * ```tsx
 * <OnboardingProvider>
 *   <App />
 * </OnboardingProvider>
 * ```
 */
export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [isActive, setIsActive] = useState(false)

  const currentConfig = ONBOARDING_STEPS[currentStep - 1]
  const highlightTarget = isActive ? currentConfig?.target ?? null : null

  const nextStep = useCallback(() => {
    if (currentStep < ONBOARDING_STEPS.length) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Completed all steps
      setIsActive(false)
      setCurrentStep(1)
    }
  }, [currentStep])

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const skipOnboarding = useCallback(() => {
    setIsActive(false)
    setCurrentStep(1)
  }, [])

  const startOnboarding = useCallback(() => {
    setCurrentStep(1)
    setIsActive(true)
  }, [])

  const value: OnboardingContextValue = {
    currentStep,
    isActive,
    highlightTarget,
    nextStep,
    previousStep,
    skipOnboarding,
    startOnboarding
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

/**
 * Hook to access onboarding context
 *
 * Provides access to the current onboarding state and control methods.
 * Must be used within an OnboardingProvider.
 *
 * @returns Onboarding context value with current state and methods
 * @throws Error if used outside OnboardingProvider
 *
 * @example
 * ```tsx
 * const { isActive, currentStep, nextStep } = useOnboarding()
 * ```
 */
export const useOnboarding = (): OnboardingContextValue => {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }
  return context
}
