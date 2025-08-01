import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ZoomIn, ZoomOut, Eye, Info } from 'lucide-react'

interface PanoramicViewerControlsProps {
  className?: string
  currentFov: number
  isVRMode: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onVRToggle: () => void
  onInfo?: () => void
}

export const PanoramicViewerControls: React.FC<PanoramicViewerControlsProps> = ({
  className = '',
  currentFov,
  isVRMode,
  onZoomIn,
  onZoomOut,
  onVRToggle,
  onInfo
}) => {
  const [showInfoPopup, setShowInfoPopup] = useState(false)

  const getZoomPercentage = () => {
    return Math.round(((120 - currentFov) / (120 - 10)) * 100)
  }

  const handleInfoClick = () => {
    if (onInfo) {
      onInfo()
    } else {
      setShowInfoPopup(true)
    }
  }

  return (
    <TooltipProvider>
      {/* Zoom Panel - Top Right */}
      <div className="fixed top-4 right-4 bg-gray-800/90 backdrop-blur-sm text-gray-200 text-sm px-3 py-2 rounded-lg shadow-lg z-40">
        <span>Zoom: {getZoomPercentage()}%</span>
      </div>

      {/* Control Pane - Responsive */}
      <div 
        className={`h-12 lg:h-12 bg-gray-800/90 backdrop-blur-sm shadow-lg ${className} flex items-center justify-center`}
        style={{
          clipPath: 'polygon(4% 0%, 100% 0%, 96% 100%, 0% 100%)'
        }}
      >
        <div className="flex items-center h-full w-full">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onZoomIn}
                  disabled={currentFov <= 10}
                  className="h-full w-full flex items-center justify-center gap-1 lg:gap-0 bg-gray-800/90 hover:bg-gray-700/90 border-r border-gray-600/50 text-white disabled:opacity-50 disabled:cursor-not-allowed min-w-0 whitespace-nowrap px-4 lg:px-6 truncate first:pl-6 lg:first:pl-8 last:pr-6 lg:last:pr-8"
                >
                  <ZoomIn className="flex-shrink-0 lg:w-7 lg:h-7 w-[18px] h-[18px]" />
                  <span className="text-xs lg:hidden whitespace-nowrap">Zoom In</span>
                </button>
              </TooltipTrigger>
              <TooltipContent className="lg:block hidden">
                <p>Zoom In</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onZoomOut}
                  disabled={currentFov >= 120}
                  className="h-full w-full flex items-center justify-center gap-1 lg:gap-0 bg-gray-800/90 hover:bg-gray-700/90 border-r border-gray-600/50 text-white disabled:opacity-50 disabled:cursor-not-allowed min-w-0 whitespace-nowrap px-4 lg:px-6 truncate first:pl-6 lg:first:pl-8 last:pr-6 lg:last:pr-8"
                >
                  <ZoomOut className="flex-shrink-0 lg:w-7 lg:h-7 w-[18px] h-[18px]" />
                  <span className="text-xs lg:hidden whitespace-nowrap">Zoom Out</span>
                </button>
              </TooltipTrigger>
              <TooltipContent className="lg:block hidden">
                <p>Zoom Out</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onVRToggle}
                  className={`h-full w-full flex items-center justify-center gap-1 lg:gap-0 border-r border-gray-600/50 text-white hidden sm:flex min-w-0 whitespace-nowrap px-4 lg:px-6 truncate first:pl-6 lg:first:pl-8 last:pr-6 lg:last:pr-8 ${
                    isVRMode 
                      ? 'bg-red-600/90 hover:bg-red-500/90' 
                      : 'bg-gray-800/90 hover:bg-gray-700/90'
                  }`}
                >
                  <Eye className="flex-shrink-0 lg:w-7 lg:h-7 w-[18px] h-[18px]" />
                  <span className="text-xs lg:hidden whitespace-nowrap">{isVRMode ? 'Exit VR' : 'Enter VR'}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent className="lg:block hidden">
                <p>{isVRMode ? 'Exit VR' : 'Enter VR'}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleInfoClick}
                  className="h-full w-full flex items-center justify-center gap-1 lg:gap-0 bg-gray-800/90 hover:bg-gray-700/90 text-white min-w-0 whitespace-nowrap px-4 lg:px-6 truncate first:pl-6 lg:first:pl-8 last:pr-6 lg:last:pr-8"
                >
                  <Info className="flex-shrink-0 lg:w-7 lg:h-7 w-[18px] h-[18px]" />
                  <span className="text-xs lg:hidden whitespace-nowrap">Info</span>
                </button>
              </TooltipTrigger>
              <TooltipContent className="lg:block hidden">
                <p>Info</p>
              </TooltipContent>
            </Tooltip>
        </div>
      </div>

      {/* Info Dialog */}
      <Dialog open={showInfoPopup} onOpenChange={setShowInfoPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Information</DialogTitle>
            <DialogDescription>
              Hello! This is the info panel. You can add more detailed information about the panoramic viewer here.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}