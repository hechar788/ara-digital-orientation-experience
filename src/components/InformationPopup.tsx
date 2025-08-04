import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { X } from 'lucide-react'

interface InformationPopupProps {
  isOpen: boolean
  onClose: () => void
}

export const InformationPopup: React.FC<InformationPopupProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Information</DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <DialogDescription>
            Hello! This is the info panel. You can add more detailed information about the panoramic viewer here.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}