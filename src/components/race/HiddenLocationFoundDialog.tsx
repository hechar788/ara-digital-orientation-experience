/**
 * Hidden Location Found Dialog Component
 *
 * Displays a congratulations dialog when a user discovers a hidden location
 * during The Amazing Race game mode. Shows the location name and description
 * with a single close button.
 *
 * @fileoverview Congratulations dialog for hidden location discovery
 */

import React from 'react'
import { Star } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

/**
 * Props for HiddenLocationFoundDialog component
 *
 * @property isOpen - Whether the dialog is currently visible
 * @property name - Name of the discovered hidden location
 * @property description - Descriptive subtitle for the location
 * @property onClose - Callback when user closes the dialog
 */
interface HiddenLocationFoundDialogProps {
  isOpen: boolean
  name: string
  description: string
  onClose: () => void
}

/**
 * Congratulations dialog for hidden location discovery
 *
 * Renders a celebratory dialog when a player finds a hidden location during
 * The Amazing Race. Displays the location name in bold with a description
 * subtitle and a star icon header.
 *
 * No navigation occurs - this is purely informational to celebrate the
 * discovery. The hidden location is marked as found in race state and
 * will not be rendered again.
 *
 * @param isOpen - Controls dialog visibility state
 * @param name - Name of the discovered location (shown in bold)
 * @param description - Descriptive text about the location
 * @param onClose - Handler for closing the dialog
 * @returns Congratulations dialog component
 *
 * @example
 * ```typescript
 * <HiddenLocationFoundDialog
 *   isOpen={showDialog}
 *   name="Dean's Office"
 *   description="The administrative heart of the campus"
 *   onClose={handleClose}
 * />
 * ```
 */
export const HiddenLocationFoundDialog: React.FC<HiddenLocationFoundDialogProps> = ({
  isOpen,
  name,
  description,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center gap-3 text-center sm:text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <Star className="h-10 w-10 text-yellow-600 fill-yellow-600" />
          </div>
          <DialogTitle className="text-2xl text-center sm:text-center">
            Congratulations you found <span className="font-bold">{name}</span>
          </DialogTitle>
          <DialogDescription className="text-base pt-4 pb-4 text-center sm:text-center">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center pt-2">
          <Button
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
            size="lg"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
