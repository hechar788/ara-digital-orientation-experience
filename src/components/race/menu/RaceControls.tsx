import React, { useState, useEffect } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Info, Fullscreen, Minimize, Pause } from 'lucide-react'
import { usePopup } from '@/hooks/usePopup'
import { RaceEndConfirmationPopup } from '../popups/RaceEndConfirmationPopup'

/**
 * Props for the RaceControls component
 *
 * Defines the callback handlers and styling options for the race control interface.
 *
 * @property className - Optional CSS class names for custom styling
 * @property style - Optional inline styles for the control pane
 * @property onInfo - Callback triggered when info button is clicked
 * @property onShowResults - Callback triggered when user confirms ending race (shows results)
 * @property isTimerPaused - Whether the race timer is currently paused
 * @property onTimerPauseChange - Callback to control timer pause state
 */
interface RaceControlsProps {
  className?: string
  style?: React.CSSProperties
  onInfo?: () => void
  onShowResults?: () => void
  isTimerPaused?: boolean
  onTimerPauseChange?: (paused: boolean) => void
}

/**
 * Race control panel component for VR tour race mode
 *
 * Provides three controls during race mode:
 * - Fullscreen toggle (left)
 * - Information display (center)
 * - End race action (right)
 *
 * Features responsive design with mobile-friendly touch targets and
 * tooltips that adapt to screen size.
 *
 * @param className - Optional CSS class names for styling
 * @param style - Optional inline styles
 * @param onInfo - Handler for info button clicks
 * @param onEndRace - Handler for end race button clicks
 * @returns React component displaying race control interface
 *
 * @example
 * ```typescript
 * <RaceControls
 *   onInfo={() => setShowInfo(true)}
 *   onEndRace={() => handleRaceEnd()}
 * />
 * ```
 */
export const RaceControls: React.FC<RaceControlsProps> = ({
  className = '',
  style,
  onInfo,
  onShowResults,
  isTimerPaused,
  onTimerPauseChange
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const raceEndPopup = usePopup()

  useEffect(() => {
    onTimerPauseChange?.(raceEndPopup.isOpen)
  }, [raceEndPopup.isOpen, onTimerPauseChange])

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
    e.currentTarget.blur()
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
                onClick={(e) => { e.currentTarget.blur(); onInfo?.(); }}
                className="h-full w-full flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-0 bg-gray-800/90 hover:bg-gray-700/90 active:bg-gray-700/90 border-r border-gray-600/50 text-white min-w-0 whitespace-nowrap px-6 lg:px-10 truncate first:pl-8 lg:first:pl-12 last:pr-6 lg:last:pr-10 select-none touch-manipulation outline-none focus:outline-none focus-visible:outline-none"
              >
                <Info className="flex-shrink-0 lg:w-8 lg:h-8 w-6 h-6" />
                <span className="text-xs lg:hidden whitespace-nowrap">Info</span>
              </button>
            </TooltipTrigger>
            <TooltipContent className="lg:block hidden">
              <p>Info</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => { e.currentTarget.blur(); raceEndPopup.open(); }}
                className="h-full w-full flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-0 bg-gray-800/90 hover:bg-gray-700/90 active:bg-gray-700/90 text-white cursor-pointer min-w-0 whitespace-nowrap px-6 lg:px-10 truncate first:pl-8 lg:first:pl-12 last:pr-6 lg:last:pr-10 select-none touch-manipulation outline-none focus:outline-none focus-visible:outline-none"
              >
                <Pause className="flex-shrink-0 lg:w-8 lg:h-8 w-5 h-5" />
                <span className="text-xs lg:hidden whitespace-nowrap">End Race</span>
              </button>
            </TooltipTrigger>
            <TooltipContent className="lg:block hidden">
              <p>End Race</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <RaceEndConfirmationPopup
        isOpen={raceEndPopup.isOpen}
        onClose={raceEndPopup.close}
        onConfirm={() => {
          raceEndPopup.close()
          onShowResults?.()
        }}
      />
    </TooltipProvider>
  )
}
