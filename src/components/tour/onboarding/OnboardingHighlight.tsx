import React from 'react'
import { type OnboardingTarget } from '@/components/tour/onboarding/OnboardingContext'
import { useOnboarding } from '@/hooks/useOnboarding'
import { cn } from '@/lib/utils'

/**
 * Props for OnboardingHighlight wrapper component
 *
 * Defines the target identifier and children to be conditionally highlighted
 * during the onboarding flow.
 *
 * @property targetId - Unique identifier matching an OnboardingTarget type
 * @property children - Child elements to wrap and potentially highlight
 * @property className - Optional additional CSS classes to apply when highlighted
 */
interface OnboardingHighlightProps {
  targetId: OnboardingTarget
  children: React.ReactNode
  className?: string
}

/**
 * Onboarding highlight wrapper component
 *
 * Adds a simple yellow background underlay behind components during onboarding
 * to draw attention to the current step's target element.
 *
 * When highlighted:
 * - Adds yellow background underlay with padding
 * - Slightly elevated z-index to ensure visibility
 * - Rounded corners for visual polish
 *
 * When not highlighted or onboarding inactive:
 * - Renders children normally without modifications
 *
 * @param targetId - Element identifier to match against current highlight target
 * @param children - Elements to conditionally highlight
 * @param className - Additional CSS classes for highlighted state
 * @returns Wrapper component with conditional highlighting
 *
 * @example
 * ```tsx
 * <OnboardingHighlight targetId="zoom">
 *   <ZoomSlider />
 * </OnboardingHighlight>
 * ```
 */
export const OnboardingHighlight: React.FC<OnboardingHighlightProps> = ({
  targetId,
  children,
  className
}) => {
  const { isActive, highlightTarget, highlightVariant } = useOnboarding()

  const isHighlighted = isActive && highlightTarget === targetId

  if (!isHighlighted) {
    return <>{children}</>
  }

  if (highlightVariant === 'overlay') {
    // For control buttons, use an overlay approach to show highlight on top
    return (
      <div className={cn('relative h-full', className)}>
        {children}
        <div className="absolute inset-0 bg-yellow-400/40 pointer-events-none rounded-sm" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative bg-yellow-500/60 p-2 rounded-lg',
        className
      )}
    >
      {children}
    </div>
  )
}
