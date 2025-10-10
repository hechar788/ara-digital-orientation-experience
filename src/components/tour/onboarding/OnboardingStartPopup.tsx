import React, { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { SkipOnboardingPopup } from './SkipOnboardingPopup'

/**
 * Props controlling the completion dialog that appears after the information tour wraps up.
 *
 * The dialog mirrors the provided design mock with institution branding, a confirmation message, and primary/secondary actions. It stays controlled by the parent component so visibility changes can coordinate with the broader tour experience.
 *
 * @property isOpen - Indicates whether the dialog should be visible (`true`) or hidden (`false`)
 * @property onSkip - Handler fired when the user selects Skip Tutorial; expected to close the dialog and resume normal tour mode
 */
export interface OnboardingStartPopupProps {
  isOpen: boolean
  onSkip: () => void
}

/**
 * Displays the post-information dialog that welcomes users to the digital orientation experience.
 *
 * The layout presents institution branding, a welcoming headline, descriptive copy, and two action buttons. The Skip Tutorial action delegates to the provided handler so callers can resume the standard tour flow, while the Get Started control currently serves as a visual placeholder until additional behavior is implemented.
 *
 * @param props - Component props configuring dialog visibility and event callbacks
 * @param props.isOpen - Boolean flag dictating dialog visibility state
 * @param props.onSkip - Callback invoked when Skip Tutorial is pressed or the dialog closes
 * @returns React.ReactElement representing the completion dialog
 *
 * @example
 * ```typescript
 * <TourCompletionDialog isOpen={isCompletionOpen} onSkip={handleSkip} />
 * ```
 */
export const OnboardingStartPopup: React.FC<OnboardingStartPopupProps> = ({ isOpen, onSkip }) => {
  const [isSkipPopupOpen, setIsSkipPopupOpen] = useState(false)

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onSkip()
    }
  }

  const handleSkipClick = () => {
    setIsSkipPopupOpen(true)
  }

  const handleSkipConfirm = () => {
    setIsSkipPopupOpen(false)
    onSkip()
  }

  const handleSkipCancel = () => {
    setIsSkipPopupOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 max-h-[95vh] overflow-hidden">
        <DialogTitle className="sr-only">Digital Orientation Experience</DialogTitle>
        <DialogDescription className="sr-only">
          Welcome message and next steps for the campus orientation experience
        </DialogDescription>
        <div className="flex flex-col gap-5 px-6 py-8 sm:px-8 sm:py-10">
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
          <div className="space-y-3 text-center pt-2 sm:space-y-3.5">
            <h3 className="text-2xl font-semibold leading-tight text-foreground sm:text-[28px]">
              Let&apos;s get you started
            </h3>
            <p className="text-sm text-foreground sm:text-base pb-6">
              We&apos;ll show you how to navigate the app
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:gap-3.5">
            <button
              type="button"
              onClick={handleSkipClick}
              className="group flex w-full items-center justify-center gap-2 rounded-sm border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted/60 cursor-pointer sm:text-base"
            >
              Skip Tutorial
            </button>
            <button
              type="button"
              className="group flex w-full items-center justify-center gap-2 rounded-sm border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted/60 cursor-pointer sm:text-base"
              aria-label="Get started placeholder"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </DialogContent>
      <SkipOnboardingPopup
        isOpen={isSkipPopupOpen}
        onClose={handleSkipCancel}
        onConfirm={handleSkipConfirm}
      />
    </Dialog>
  )
}
