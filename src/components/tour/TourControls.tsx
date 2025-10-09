import React, { useState, useEffect } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Info, Bot, Fullscreen, Minimize } from 'lucide-react'
import { usePopup } from '@/hooks/usePopup'
import { RaceStartConfirmationPopup } from './RaceStartConfirmationPopup'

/**
 * Props for the TourControls component
 *
 * Defines the callback handlers and styling options for the tour control interface.
 *
 * @property className - Optional CSS class names for custom styling
 * @property style - Optional inline styles for the control pane
 * @property onInfo - Callback triggered when info button is clicked
 * @property onAIChat - Callback triggered when AI chat button is clicked
 * @property onStartRace - Callback triggered when user confirms race start (should navigate to race start location and switch to race mode)
 */
interface TourControlsProps {
  className?: string
  style?: React.CSSProperties
  onInfo?: () => void
  onAIChat?: () => void
  onStartRace?: () => void
}

export const TourControls: React.FC<TourControlsProps> = ({
  className = '',
  style,
  onInfo,
  onAIChat,
  onStartRace
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const raceStartPopup = usePopup()

  // Listen for fullscreen changes (e.g., user pressing ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur() // Remove focus to prevent sticky highlight
    try {
      if (!isFullscreen) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error)
    }
  }


  return (
    <TooltipProvider>
      {/* Control Pane - Responsive */}
      <div
        className={`h-14 lg:h-16 bg-gray-800/90 backdrop-blur-sm shadow-lg ${className} flex items-center justify-center w-auto max-w-[96vw] lg:max-w-none`}
        style={{
          clipPath: 'polygon(4% 0%, 100% 0%, 96% 100%, 0% 100%)',
          ...style
        }}
      >
        <div className="flex items-center h-full w-full">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleFullscreen}
                  className="h-full w-full flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-0 bg-gray-800/90 hover:bg-gray-700/90 active:bg-gray-700/90 border-r border-gray-600/50 text-white min-w-0 whitespace-nowrap px-6 lg:px-10 truncate first:pl-8 lg:first:pl-12 last:pr-6 lg:last:pr-10 select-none touch-manipulation outline-none focus:outline-none focus-visible:outline-none"
                >
                  {isFullscreen ? (
                    <>
                      <Minimize className="flex-shrink-0 lg:w-8 lg:h-8 w-5 h-5" />
                      <span className="text-xs lg:hidden whitespace-nowrap">Minimize</span>
                    </>
                  ) : (
                    <>
                      <Fullscreen className="flex-shrink-0 lg:w-8 lg:h-8 w-5 h-5" />
                      <span className="text-xs lg:hidden whitespace-nowrap">Fullscreen</span>
                    </>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent className="lg:block hidden">
                <p>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => { e.currentTarget.blur(); raceStartPopup.open(); }}
                  className="h-full w-full flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-0 bg-gray-800/90 hover:bg-gray-700/90 active:bg-gray-700/90 border-r border-gray-600/50 text-white min-w-0 whitespace-nowrap px-6 lg:px-10 truncate first:pl-8 lg:first:pl-12 last:pr-6 lg:last:pr-10 select-none touch-manipulation outline-none focus:outline-none focus-visible:outline-none"
                >
                  <img
                    src="/svg/flag.svg"
                    alt="Flag"
                    className="flex-shrink-0 lg:w-8 lg:h-8 w-5 h-5"
                  />
                  <span className="text-xs lg:hidden whitespace-nowrap">Start Race</span>
                </button>
              </TooltipTrigger>
              <TooltipContent className="lg:block hidden">
                <p>Start Race</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => { e.currentTarget.blur(); onAIChat?.(); }}
                  className="h-full w-full flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-0 bg-gray-800/90 hover:bg-gray-700/90 active:bg-gray-700/90 border-r border-gray-600/50 text-white min-w-0 whitespace-nowrap px-6 lg:px-10 truncate first:pl-8 lg:first:pl-12 last:pr-6 lg:last:pr-10 select-none touch-manipulation outline-none focus:outline-none focus-visible:outline-none"
                >
                  <Bot className="flex-shrink-0 lg:w-8 lg:h-8 w-5 h-5" />
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
                  onClick={(e) => { e.currentTarget.blur(); onInfo?.(); }}
                  className="h-full w-full flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-0 bg-gray-800/90 hover:bg-gray-700/90 active:bg-gray-700/90 text-white cursor-pointer min-w-0 whitespace-nowrap px-6 lg:px-10 truncate first:pl-8 lg:first:pl-12 last:pr-6 lg:last:pr-10 select-none touch-manipulation outline-none focus:outline-none focus-visible:outline-none"
                >
                  <Info className="flex-shrink-0 lg:w-8 lg:h-8 w-6 h-6" />
                  <span className="text-xs lg:hidden whitespace-nowrap">Info</span>
                </button>
              </TooltipTrigger>
              <TooltipContent className="lg:block hidden">
                <p>Info</p>
              </TooltipContent>
            </Tooltip>
        </div>
      </div>

      <RaceStartConfirmationPopup
        isOpen={raceStartPopup.isOpen}
        onClose={raceStartPopup.close}
        onConfirm={() => {
          raceStartPopup.close()
          onStartRace?.()
        }}
      />
    </TooltipProvider>
  )
}