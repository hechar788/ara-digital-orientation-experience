import React from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ZoomIn, ZoomOut, Info, Bot } from 'lucide-react'

interface PanoramicViewerControlsProps {
  className?: string
  style?: React.CSSProperties
  currentFov: number
  onZoomIn: () => void
  onZoomOut: () => void
  onInfo?: () => void
  onAIChat?: () => void
}

export const PanoramicViewerControls: React.FC<PanoramicViewerControlsProps> = ({
  className = '',
  style,
  currentFov,
  onZoomIn,
  onZoomOut,
  onInfo,
  onAIChat
}) => {

  const getZoomPercentage = () => {
    return Math.round(((120 - currentFov) / (120 - 10)) * 100)
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
          clipPath: 'polygon(4% 0%, 100% 0%, 96% 100%, 0% 100%)',
          ...style
        }}
      >
        <div className="flex items-center h-full w-full">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onZoomIn}
                  disabled={currentFov <= 10}
                  className="h-full w-full flex items-center justify-center gap-1 lg:gap-0 bg-gray-800/90 hover:bg-gray-700/90 border-r border-gray-600/50 text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-w-0 whitespace-nowrap px-4 lg:px-6 truncate first:pl-6 lg:first:pl-8 last:pr-6 lg:last:pr-8"
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
                  className="h-full w-full flex items-center justify-center gap-1 lg:gap-0 bg-gray-800/90 hover:bg-gray-700/90 border-r border-gray-600/50 text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-w-0 whitespace-nowrap px-4 lg:px-6 truncate first:pl-6 lg:first:pl-8 last:pr-6 lg:last:pr-8"
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
                  onClick={onAIChat}
                  className="h-full w-full flex items-center justify-center gap-1 lg:gap-0 bg-gray-800/90 hover:bg-gray-700/90 border-r border-gray-600/50 text-white min-w-0 whitespace-nowrap px-4 lg:px-6 truncate first:pl-6 lg:first:pl-8 last:pr-6 lg:last:pr-8"
                >
                  <Bot className="flex-shrink-0 lg:w-7 lg:h-7 w-[18px] h-[18px]" />
                  <span className="text-xs lg:hidden whitespace-nowrap">AI Chat</span>
                </button>
              </TooltipTrigger>
              <TooltipContent className="lg:block hidden">
                <p>AI Chat</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onInfo}
                  className="h-full w-full flex items-center justify-center gap-1 lg:gap-0 bg-gray-800/90 hover:bg-gray-700/90 text-white cursor-pointer min-w-0 whitespace-nowrap px-4 lg:px-6 truncate first:pl-6 lg:first:pl-8 last:pr-6 lg:last:pr-8"
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
    </TooltipProvider>
  )
}