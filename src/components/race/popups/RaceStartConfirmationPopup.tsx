import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

/**
 * Props for the RaceStartPopup component
 *
 * Defines the popup state and callback handlers for race start confirmation.
 *
 * @property isOpen - Whether the popup is currently visible
 * @property onClose - Callback triggered when popup is closed or cancelled
 * @property onConfirm - Callback triggered when user confirms race start
 */
interface RaceStartPopupProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

/**
 * Confirmation popup for starting The Amazing Race
 *
 * Displays a modal dialog asking the user to confirm they're ready to begin
 * the race experience. Provides confirm and cancel actions.
 *
 * @param isOpen - Controls popup visibility state
 * @param onClose - Handler for cancel/close actions
 * @param onConfirm - Handler for confirmed race start
 * @returns React component displaying race start confirmation dialog
 *
 * @example
 * ```typescript
 * const raceStart = usePopup()
 *
 * <RaceStartPopup
 *   isOpen={raceStart.isOpen}
 *   onClose={raceStart.close}
 *   onConfirm={() => {
 *     raceStart.close()
 *     handleRaceStart()
 *   }}
 * />
 * ```
 */
export const RaceStartConfirmationPopup: React.FC<RaceStartPopupProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md pt-8 pb-6">
        <DialogHeader className="pb-7">
          <DialogTitle className="text-xl">Ready to start The Amazing Race?</DialogTitle>
          <DialogDescription className="sr-only">Confirm to begin the race or cancel to continue the standard orientation</DialogDescription>
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
