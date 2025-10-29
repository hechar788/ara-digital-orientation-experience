import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { usePopup } from '@/hooks/usePopup'
import { SkipOnboardingPopup } from './SkipOnboardingPopup'

/**
 * Props controlling the completion dialog that appears after the information tour wraps up.
 *
 * The dialog mirrors the provided design mock with institution branding, a confirmation message, and primary/secondary actions. It stays controlled by the parent component so visibility changes can coordinate with the broader tour experience.
 *
 * @property isOpen - Indicates whether the dialog should be visible (`true`) or hidden (`false`)
 * @property onSkip - Handler fired when the user selects Skip Tutorial or closes the dialog; expected to close the dialog and resume normal tour mode
 * @property onGetStarted - Handler fired when the user clicks Get Started; initiates the onboarding flow
 */
export interface OnboardingStartPopupProps {
  isOpen: boolean
  onSkip: () => void
  onGetStarted: () => void
}

/**
 * Displays the post-information dialog that welcomes users to the digital orientation experience.
 *
 * The layout presents institution branding, a welcoming headline, descriptive copy, and two action buttons. The Skip Tutorial action delegates to the provided handler so callers can resume the standard tour flow, while the Get Started button initiates the interactive onboarding flow.
 *
 * @param props - Component props configuring dialog visibility and event callbacks
 * @param props.isOpen - Boolean flag dictating dialog visibility state
 * @param props.onSkip - Callback invoked when Skip Tutorial is pressed or the dialog closes
 * @param props.onGetStarted - Callback invoked when Get Started button is clicked
 * @returns React.ReactElement representing the completion dialog
 *
 * @example
 * ```typescript
 * <OnboardingStartPopup
 *   isOpen={isCompletionOpen}
 *   onSkip={handleSkip}
 *   onGetStarted={handleGetStarted}
 * />
 * ```
 */
export const OnboardingStartPopup: React.FC<OnboardingStartPopupProps> = ({ isOpen, onSkip, onGetStarted }) => {
  const skipPopup = usePopup()

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onSkip()
    }
  }

  const handleSkipClick = () => {
    skipPopup.open()
  }

  const handleSkipConfirm = () => {
    skipPopup.close()
    onSkip()
  }

  const handleSkipCancel = () => {
    skipPopup.close()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 max-h-[95vh] overflow-hidden">
        <DialogTitle className="sr-only">Digital Orientation Experience</DialogTitle>
        <DialogDescription className="sr-only">
          Welcome message and next steps for the campus orientation experience
        </DialogDescription>
        <div className="flex flex-col gap-5 px-6 pt-8 pb-6 sm:px-8 sm:pt-10 sm:pb-8">
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-foreground">
                <span className="sm:hidden">ARA Institute of Canterbury - Computing</span>
                <span className="hidden sm:inline">ARA Institute of Canterbury - Computing Department</span>
              </p>
              <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                Digital Orientation Experience
              </h2>
            </div>
            <hr className="border-t border-border" />
          </div>
          <div className="space-y-3 text-center pt-4 sm:space-y-3.5">
            <h3 className="text-2xl font-semibold leading-tight text-foreground sm:text-[28px]">
              Let&apos;s get you started
            </h3>
            <p className="text-sm text-foreground sm:text-base pb-8">
              We&apos;ll show you how to navigate the app
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:gap-3.5">
            <button
              type="button"
              onClick={onGetStarted}
              className="group relative flex w-full items-center justify-center rounded-sm border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted/60 cursor-pointer sm:text-base"
              aria-label="Start onboarding tutorial"
            >
              Get Started
              <ArrowRight className="h-4 w-4 absolute right-6 transition group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={handleSkipClick}
              className="flex w-full items-center justify-center rounded-sm border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted/60 cursor-pointer sm:text-base"
            >
              Skip Tutorial
            </button>
          </div>
        </div>
      </DialogContent>
      <SkipOnboardingPopup
        isOpen={skipPopup.isOpen}
        onClose={handleSkipCancel}
        onConfirm={handleSkipConfirm}
      />
    </Dialog>
  )
}
