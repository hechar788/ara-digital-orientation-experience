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
 * Props for the RaceEndPopup component
 *
 * Defines the popup state and callback handlers for race end confirmation.
 *
 * @property isOpen - Whether the popup is currently visible
 * @property onClose - Callback triggered when popup is closed or cancelled
 * @property onConfirm - Callback triggered when user confirms race end
 */
interface RaceEndConfirmationPopupProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

/**
 * Confirmation popup for ending The Amazing Race
 *
 * Displays a modal dialog warning the user that ending the race will lose
 * their progress. Provides confirm and cancel actions to prevent accidental
 * race termination.
 *
 * @param isOpen - Controls popup visibility state
 * @param onClose - Handler for cancel/close actions
 * @param onConfirm - Handler for confirmed race end
 * @returns React component displaying race end confirmation dialog
 *
 * @example
 * ```typescript
 * const raceEnd = usePopup()
 *
 * <RaceEndPopup
 *   isOpen={raceEnd.isOpen}
 *   onClose={raceEnd.close}
 *   onConfirm={() => {
 *     raceEnd.close()
 *     handleRaceEnd()
 *   }}
 * />
 * ```
 */
export const RaceEndConfirmationPopup: React.FC<RaceEndConfirmationPopupProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md pt-8 pb-6">
        <DialogHeader>
          <DialogTitle className="text-xl text-left">Finish The Amazing Race?</DialogTitle>
          <DialogDescription className="text-base pb-6 text-left">
            Your progress will not be saved.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-row justify-between items-center gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
