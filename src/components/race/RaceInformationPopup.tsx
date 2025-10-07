import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

interface RaceInformationPopupProps {
  isOpen: boolean
  onClose: () => void
}

export const RaceInformationPopup: React.FC<RaceInformationPopupProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Information</DialogTitle>
          <DialogDescription>
            Hello! This is the race info panel. You can add more detailed information about the panoramic viewer here.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}