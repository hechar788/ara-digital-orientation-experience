import React from 'react'
import { Button } from '@/components/ui/button'

interface PanoramicViewerControlsProps {
  className?: string
  currentFov: number
  isVRMode: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onVRToggle: () => void
}

export const PanoramicViewerControls: React.FC<PanoramicViewerControlsProps> = ({
  className = '',
  currentFov,
  isVRMode,
  onZoomIn,
  onZoomOut,
  onVRToggle
}) => {

  const getZoomPercentage = () => {
    return Math.round(((120 - currentFov) / (120 - 10)) * 100)
  }

  return (
    <div className={`h-[7.5vh] max-[960px]:landscape:h-[12vh] bg-gray-800 rounded-lg p-1 landscape:p-2 sm:p-4 shadow-lg ${className}`}>
      <div className="flex items-center justify-between gap-2 h-full">
        <div className="flex items-center space-x-1 sm:space-x-4">
          <span className="text-gray-400 text-xs sm:text-sm hidden sm:inline">Controls:</span>
          <Button
            onClick={onZoomIn}
            className="px-1.5 py-0.5 landscape:px-2 landscape:py-1 sm:px-4 sm:py-2 text-xs landscape:text-sm sm:text-base cursor-pointer"
            disabled={currentFov <= 10}
            size="sm"
          >
            <span className="text-sm landscape:text-base sm:text-lg">🔍</span>
            <span>Zoom In</span>
          </Button>
          <Button
            onClick={onZoomOut}
            className="px-1.5 py-0.5 landscape:px-2 landscape:py-1 sm:px-4 sm:py-2 text-xs landscape:text-sm sm:text-base cursor-pointer"
            disabled={currentFov >= 120}
            size="sm"
          >
            <span className="text-sm landscape:text-base sm:text-lg">🔍</span>
            <span>Zoom Out</span>
          </Button>
          
          <Button
            onClick={onVRToggle}
            className="px-1.5 py-0.5 landscape:px-2 landscape:py-1 sm:px-4 sm:py-2 text-xs landscape:text-sm sm:text-base hidden landscape:flex sm:flex cursor-pointer"
            variant={isVRMode ? "destructive" : "secondary"}
            size="sm"
          >
            <span className="text-sm landscape:text-base sm:text-lg">🥽</span>
            <span className="hidden sm:inline">{isVRMode ? 'Exit VR' : 'Enter VR'}</span>
            <span className="sm:hidden">VR</span>
          </Button>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-4 text-gray-400 text-xs sm:text-sm">
          <span>Zoom: {getZoomPercentage()}%</span>
          {isVRMode ? (
            <span className="text-green-400 ml-2">VR Active</span>
          ) : (
            <>
              <span className="hidden lg:inline ml-2">Drag to look around • Scroll to zoom • VR Available</span>
              <span className="hidden sm:inline lg:hidden portrait:inline ml-2">Drag • Scroll</span>
              <span className="sm:hidden landscape:hidden ml-1">Touch</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}