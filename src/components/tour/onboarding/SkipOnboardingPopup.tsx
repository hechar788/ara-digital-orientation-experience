import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

/**
 * Props for the SkipTutorialPopup component
 *
 * Defines the popup state and callback handlers for tutorial skip confirmation.
 *
 * @property isOpen - Whether the popup is currently visible
 * @property onClose - Callback triggered when popup is closed or cancelled
 * @property onConfirm - Callback triggered when user confirms skipping the tutorial
 */
interface SkipOnboardingPopupProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

/**
 * Confirmation popup for skipping the onboarding tutorial
 *
 * Displays a modal dialog asking the user to confirm they want to skip the tutorial.
 * Provides confirm and cancel actions to prevent accidental skipping. This dialog
 * appears on top of the OnboardingStartDialog with an overlay that greys out the
 * background content.
 *
 * @param isOpen - Controls popup visibility state
 * @param onClose - Handler for cancel/close actions
 * @param onConfirm - Handler for confirmed tutorial skip
 * @returns React component displaying tutorial skip confirmation dialog
 *
 * @example
 * ```typescript
 * const [isSkipOpen, setIsSkipOpen] = useState(false)
 *
 * <SkipTutorialPopup
 *   isOpen={isSkipOpen}
 *   onClose={() => setIsSkipOpen(false)}
 *   onConfirm={() => {
 *     setIsSkipOpen(false)
 *     handleSkipConfirmed()
 *   }}
 * />
 * ```
 */
export const SkipOnboardingPopup: React.FC<SkipOnboardingPopupProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md pt-8 pb-6 touch-none">
        <DialogHeader>
          <DialogTitle className="text-xl text-left py-4 pb-6">Are you sure you want to skip the tutorial?</DialogTitle>
          <DialogDescription className="sr-only">
            Confirm whether you want to skip the tutorial
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-row justify-between items-center gap-2">
          <Button variant="outline" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 cursor-pointer"
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
