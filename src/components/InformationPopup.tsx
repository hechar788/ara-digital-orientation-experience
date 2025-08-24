import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

interface InformationPopupProps {
  isOpen: boolean
  onClose: () => void
}

export const InformationPopup: React.FC<InformationPopupProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Information</DialogTitle>
          <DialogDescription>
            Hello! This is the info panel. You can add more detailed information about the panoramic viewer here.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}