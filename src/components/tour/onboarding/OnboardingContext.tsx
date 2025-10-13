import React, { createContext, useCallback, useMemo, useReducer } from 'react'

/**
 * Identifier string for onboarding steps
 *
 * Provides stable identifiers for each onboarding step to enable reliable
 * reducer transitions and targeted unit testing.
 */
export type OnboardingStepId =
  | 'navigation-arrows' | 'drag-camera' | 'zoom-controls' | 'minimap-toggle' | 'minimap-popup'
  | 'fullscreen-toggle' | 'race-mode' | 'ai-assistant' | 'info-hub'

/**
 * Target element types that can be highlighted during onboarding
 *
 * Defines all possible UI elements that can receive visual focus during
 * the onboarding flow. Null indicates no specific element is highlighted
 * (e.g., for gesture-based instructions like drag-to-pan).
 */
export type OnboardingTarget =
  | 'arrows' | 'zoom' | 'minimap' | 'minimap-toggle-button' | 'fullscreen'
  | 'race' | 'ai' | 'info' | null

/**
 * Layout tokens describing onboarding instruction positioning
 *
 * Each token maps to a specific combination of fixed positioning classes in
 * the OnboardingFlow component so layout is controlled by configuration rather
 * than hard-coded ternaries.
 */
export type OnboardingInstructionLayout =
  | 'center-top' | 'center-bottom' | 'controls-bottom'
  | 'zoom-right' | 'zoom-right-minimap-closed' | 'minimap-right' | 'minimap-right-step5' | 'minimap-right-minimap-closed' | 'minimap-right-minimap-closed-step5' 

/**
 * Highlight display variants for target elements
 *
 * Controls whether highlighted targets receive a background cushion,
 * translucent overlay, or no additional treatment when active.
 */
export type OnboardingHighlightVariant = 'background' | 'overlay' | 'none'

/**
 * Configuration for each onboarding step
 *
 * Defines the instruction text, highlighted element, instruction box layout,
 * and highlight treatment for each step in the onboarding flow.
 *
 * @property step - Step number (1-9)
 * @property id - Stable identifier for the step
 * @property target - UI element to highlight during this step
 * @property text - Instruction text to display on desktop devices
 * @property mobileText - Optional mobile-specific copy for touch devices
 * @property layout - Layout token used to position the instruction box
 * @property highlightVariant - Optional highlight treatment for the step
 */
export interface OnboardingStepConfig {
  step: number
  id: OnboardingStepId
  target: OnboardingTarget
  text: string
  mobileText?: string
  layout: OnboardingInstructionLayout
  highlightVariant?: OnboardingHighlightVariant
}

/**
 * Onboarding step configurations
 *
 * Array defining all 9 steps of the onboarding flow with their respective
 * targets, instruction text, instruction box positioning, and highlight rules.
 */
export const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  {
    step: 1,
    id: 'navigation-arrows',
    target: 'arrows',
    text: 'Click on the directional arrows to navigate through the campus.',
    mobileText: 'Tap the directional arrows to move through the campus.',
    layout: 'center-top',
    highlightVariant: 'overlay'
  },
  {
    step: 2,
    id: 'drag-camera',
    target: null,
    text: 'Drag on the screen to explore each location in 360°.',
    mobileText: 'Swipe on the screen to look around each location in 360°.',
    layout: 'center-top',
    highlightVariant: 'none'
  },
  {
    step: 3,
    id: 'zoom-controls',
    target: 'zoom',
    text: 'Use the zoom slider or scroll to zoom in and out of the tour.',
    mobileText: 'Use the zoom slider or pinch the screen to zoom in and out of the tour.',
    layout: 'zoom-right',
    highlightVariant: 'background'
  },
  {
    step: 4,
    id: 'minimap-toggle',
    target: 'minimap-toggle-button',
    text: 'Click the Minimap button to open it and view your location. Use the close button in the top right corner to collapse it when needed.',
    mobileText: 'Tap the Minimap button to open it. Use the close button in the top right to collapse it.',
    layout: 'minimap-right',
    highlightVariant: 'background'
  },
  {
    step: 5,
    id: 'minimap-popup',
    target: 'minimap',
    text: 'When open, click the minimap image to view the full campus map in fullscreen and quickly jump to locations.',
    mobileText: 'When open, tap the minimap to view the full campus map in fullscreen and navigate to locations.',
    layout: 'minimap-right',
    highlightVariant: 'background'
  },
  {
    step: 6,
    id: 'fullscreen-toggle',
    target: 'fullscreen',
    text: 'Use the full screen button to expand the tour to fit your device.',
    layout: 'controls-bottom',
    highlightVariant: 'overlay'
  },
  {
    step: 7,
    id: 'race-mode',
    target: 'race',
    text: 'Click the Amazing Race button to start the Amazing Race.',
    layout: 'controls-bottom',
    highlightVariant: 'overlay'
  },
  {
    step: 8,
    id: 'ai-assistant',
    target: 'ai',
    text: 'Click the Assistant button to open the AI Assistant and ask it any questions you may have.',
    layout: 'controls-bottom',
    highlightVariant: 'overlay'
  },
  {
    step: 9,
    id: 'info-hub',
    target: 'info',
    text: 'Click the Information button to open the information screen or repeat this tutorial at any time.',
    layout: 'controls-bottom',
    highlightVariant: 'overlay'
  }
]

/**
 * Onboarding context state interface
 *
 * Provides the current onboarding state and control methods. Used by
 * the OnboardingFlow component to manage step progression and by
 * OnboardingHighlight components to determine visual highlighting.
 *
 * @property currentStep - Current step number (1-9)
 * @property currentStepId - Identifier for the current onboarding step
 * @property currentConfig - Configuration object for the active step
 * @property isActive - Whether onboarding is currently running
 * @property isVisible - Whether onboarding UI should be rendered
 * @property highlightTarget - Current UI element to highlight
 * @property highlightVariant - Highlight style to apply to current target
 * @property nextStep - Advances to next step or completes onboarding
 * @property previousStep - Goes back to previous step
 * @property skipOnboarding - Immediately exits onboarding flow
 * @property startOnboarding - Begins onboarding from step 1
 * @property completeOnboarding - Marks onboarding as complete and hides flow
 * @property totalSteps - Total number of onboarding steps
 */
export interface OnboardingContextValue {
  currentStep: number
  currentStepId: OnboardingStepId
  currentConfig: OnboardingStepConfig | null
  isActive: boolean
  isVisible: boolean
  highlightTarget: OnboardingTarget
  highlightVariant: OnboardingHighlightVariant
  nextStep: () => void
  previousStep: () => void
  skipOnboarding: () => void
  startOnboarding: () => void
  completeOnboarding: () => void
  totalSteps: number
}

/**
 * Props for OnboardingProvider component
 *
 * @property children - Child components that can access onboarding context
 */
interface OnboardingProviderProps {
  children: React.ReactNode
}

interface OnboardingState {
  stepIndex: number
  isActive: boolean
  isVisible: boolean
}

type OnboardingAction =
  | { type: 'START' } | { type: 'NEXT' } | { type: 'PREVIOUS' } 
  | { type: 'SKIP' } | { type: 'COMPLETE' }

const initialState: OnboardingState = {
  stepIndex: 0,
  isActive: false,
  isVisible: false
}

export const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined)

const onboardingReducer = (state: OnboardingState, action: OnboardingAction): OnboardingState => {
  switch (action.type) {
    case 'START':
      return {
        stepIndex: 0,
        isActive: true,
        isVisible: true
      }
    case 'NEXT': {
      const isLastStep = state.stepIndex >= ONBOARDING_STEPS.length - 1
      if (isLastStep) {
        return { ...initialState }
      }
      return {
        ...state,
        stepIndex: state.stepIndex + 1
      }
    }
    case 'PREVIOUS':
      return {
        ...state,
        stepIndex: Math.max(0, state.stepIndex - 1)
      }
    case 'SKIP':
    case 'COMPLETE':
      return { ...initialState }
    default:
      return state
  }
}

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
  const [state, dispatch] = useReducer(onboardingReducer, initialState)

  const currentConfig = useMemo(() => {
    return ONBOARDING_STEPS[state.stepIndex] ?? null
  }, [state.stepIndex])

  const highlightTarget: OnboardingTarget = useMemo(() => {
    if (!state.isActive || !currentConfig) {
      return null
    }
    return currentConfig.target ?? null
  }, [state.isActive, currentConfig])

  const highlightVariant: OnboardingHighlightVariant = useMemo(() => {
    if (!state.isActive || !currentConfig) {
      return 'none'
    }
    return currentConfig.highlightVariant ?? 'background'
  }, [state.isActive, currentConfig])

  const startOnboarding = useCallback(() => {
    dispatch({ type: 'START' })
  }, [])

  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT' })
  }, [])

  const previousStep = useCallback(() => {
    dispatch({ type: 'PREVIOUS' })
  }, [])

  const skipOnboarding = useCallback(() => {
    dispatch({ type: 'SKIP' })
  }, [])

  const completeOnboarding = useCallback(() => {
    dispatch({ type: 'COMPLETE' })
  }, [])

  const value: OnboardingContextValue = {
    currentStep: state.stepIndex + 1,
    currentStepId: currentConfig?.id ?? 'navigation-arrows',
    currentConfig,
    isActive: state.isActive,
    isVisible: state.isVisible,
    highlightTarget,
    highlightVariant,
    nextStep,
    previousStep,
    skipOnboarding,
    startOnboarding,
    completeOnboarding,
    totalSteps: ONBOARDING_STEPS.length
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}
