/**
 * Information hotspot popup component
 *
 * Displays contextual information when a user clicks on an information hotspot.
 * Shows a title, description text, and a close button in a centered modal dialog.
 *
 * @fileoverview Popup dialog for displaying information hotspot content
 */

import React from 'react'
import { X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'

/**
 * Props for InfoHotspotPopup component
 *
 * @property isOpen - Whether the popup is currently visible
 * @property title - Title text displayed at the top of the popup
 * @property description - Body text describing the information
 * @property onClose - Callback invoked when the user closes the popup
 */
interface InfoHotspotPopupProps {
  isOpen: boolean
  title: string
  description: string
  onClose: () => void
}

/**
 * Information hotspot popup that displays contextual details
 *
 * Renders a centered modal dialog with a title, description, and close button.
 * The popup appears when users click information hotspots in the panoramic viewer.
 * Uses the Dialog component for consistent UI and accessibility.
 *
 * @param isOpen - Controls popup visibility
 * @param title - Title text to display
 * @param description - Description text to display
 * @param onClose - Callback to close the popup
 * @returns React component representing the information popup
 */
export const InfoHotspotPopup: React.FC<InfoHotspotPopupProps> = ({
  isOpen,
  title,
  description,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-[90vw] p-0 gap-0 border-0" showCloseButton={false} aria-describedby={undefined}>
        <div className="flex items-center justify-between rounded-t-lg bg-[#0C586E] px-4 py-3">
          <DialogTitle className="text-lg font-semibold text-white m-0">{title}</DialogTitle>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C586E]"
            aria-label="Close information"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="text-sm text-gray-700 leading-relaxed space-y-3">
            {description.split('\n\n').map((paragraph, pIndex) => {
              const lines = paragraph.split('\n')
              const hasBullets = lines.some(line => line.trim().startsWith('•'))
              
              if (hasBullets) {
                return (
                  <div key={pIndex} className="space-y-1.5">
                    {lines.map((line, lIndex) => {
                      const trimmedLine = line.trim()
                      if (trimmedLine.startsWith('•')) {
                        return (
                          <div key={lIndex} className="flex gap-2">
                            <span className="text-gray-600">•</span>
                            <span className="flex-1" dangerouslySetInnerHTML={{ __html: trimmedLine.substring(1).trim().replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#0C586E] underline hover:text-[#0a4a5a]">$1</a>') }} />
                          </div>
                        )
                      }
                      if (trimmedLine) {
                        return <p key={lIndex} dangerouslySetInnerHTML={{ __html: trimmedLine.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#0C586E] underline hover:text-[#0a4a5a]">$1</a>') }} />
                      }
                      return null
                    })}
                  </div>
                )
              }
              
              return <p key={pIndex} dangerouslySetInnerHTML={{ __html: paragraph.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#0C586E] underline hover:text-[#0a4a5a]">$1</a>') }} />
            })}
          </div>
        </div>

        <DialogFooter className="px-6 pb-4 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg bg-[#0C586E] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0a4a5a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0C586E] focus-visible:ring-offset-2"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

