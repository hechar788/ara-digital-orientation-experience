import { useContext } from 'react'
import { OnboardingContext, type OnboardingContextValue } from '@/components/tour/onboarding/OnboardingContext'

/**
 * Accessor hook for onboarding context state and actions
 *
 * Centralizes the consumer-facing API for the onboarding system so components
 * rely on a single import location (`@/hooks/useOnboarding`). Throws an error
 * when used outside of `OnboardingProvider` to surface integration mistakes
 * early during development.
 *
 * @returns Onboarding context value containing state flags and navigation helpers
 * @throws Error if invoked while no provider is mounted in the component tree
 *
 * @example
 * ```tsx
 * const { currentStep, nextStep, skipOnboarding } = useOnboarding()
 * ```
 */
export const useOnboarding = (): OnboardingContextValue => {
  const context = useContext(OnboardingContext)

  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }

  return context
}

