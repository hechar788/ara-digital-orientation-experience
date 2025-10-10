import { useState } from 'react'
import { Map } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip'
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '../ui/dialog'
import { usePopup } from '../../hooks/usePopup'
import { useOrientationStore } from '../../hooks/useOrientationStore'
import { useRaceStore } from '../../hooks/useRaceStore'
import { TOTAL_TOUR_AREAS } from '../../data/blockUtils'
import type { Area } from '../../types/tour'

/**
 * Props for the Minimap component
 *
 * Provides campus map visualization with area tracking and exploration statistics.
 * Tracks user progress through different campus areas during the VR tour.
 *
 * @property currentArea - Current area object containing location metadata, or null if unknown
 * @property currentPhotoId - Current photo identifier being displayed in the tour
 * @property isRaceMode - Whether the user is currently in race mode (affects which stats to display)
 */
export interface MinimapProps {
  currentArea: Area | null
  currentPhotoId: string
  isRaceMode?: boolean
}

/**
 * Campus minimap component with expandable view and area discovery tracking
 *
 * Displays a compact campus map in the top-right corner of the VR tour interface.
 * Features collapsible minimap, expandable full-screen view, current location indicator,
 * and mode-aware area discovery progress tracking.
 *
 * The minimap is context-aware:
 * - Orientation Mode: Shows persistent orientation discoveries
 * - Race Mode: Shows ephemeral race progress (resets on race restart)
 *
 * @param props - Component props containing current area, photo, and mode information
 * @returns Rendered minimap component with toggle controls and expanded view dialog
 *
 * @example
 * ```tsx
 * <Minimap
 *   currentArea={currentArea}
 *   currentPhotoId={currentPhotoId}
 *   isRaceMode={isRaceMode}
 * />
 * ```
 */
export function Minimap({ currentArea, currentPhotoId, isRaceMode = false }: MinimapProps) {
  const [isMinimapOpen, setIsMinimapOpen] = useState(true)
  const expandedMap = usePopup()
  const orientation = useOrientationStore()
  const race = useRaceStore()

  const currentAreaName = currentArea?.name ?? 'Unknown Area'

  // Mode-aware discovery count: show race progress in race mode, orientation in tour mode
  const areasDiscoveredLabel = isRaceMode
    ? `${race.areasCount}/${TOTAL_TOUR_AREAS}`
    : `${orientation.discoveriesCount}/${TOTAL_TOUR_AREAS}`

  return (
    <>
      {/* Map and Navigation Info */}
      <div className="flex flex-col gap-1.5 items-end">
        {/* Campus Map */}
        {isMinimapOpen ? (
          <div className="w-62 h-48 bg-gray-800/90 border-2 border-gray-600 rounded-lg overflow-hidden relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={expandedMap.open}
                  className="w-full h-full cursor-pointer p-0 border-0 bg-transparent"
                  aria-label="Expand map"
                >
                  <img
                    src="/campus_map/chch-official-campusmap-only.svg"
                    alt="Campus Map"
                    className="w-full h-full object-cover cursor-pointer"
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Expand Minimap</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsMinimapOpen(false)}
                  className="absolute top-0 right-0 w-10 h-10 bg-gray-800/80 border-2 border-gray-600 rounded-bl-lg flex items-center justify-center hover:bg-gray-700/80 text-white transition-colors cursor-pointer"
                  aria-label="Minimize map"
                >
                  <img src="/svg/map-minus.svg" alt="Minimize" className="w-5 h-5 cursor-pointer" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Close Minimap</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsMinimapOpen(true)}
                className="w-62 bg-gray-800/90 px-4 py-2 rounded-lg border border-gray-600 flex items-center justify-between hover:bg-gray-700/90 text-white transition-colors cursor-pointer"
                aria-label="Open map"
              >
                <span className="text-white text-sm font-medium">Minimap</span>
                <Map className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open Minimap</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Expanded Map Dialog */}
      <Dialog open={expandedMap.isOpen} onOpenChange={expandedMap.close}>
        <DialogContent
          showCloseButton={false}
          className="w-[95vw] max-w-[95vw] sm:w-[80vw] sm:max-w-[1330px] max-h-[95vh] p-0 overflow-hidden bg-background flex flex-col"
        >
          <DialogClose className="absolute top-2 right-2 z-50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <span className="sr-only">Close map</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </DialogClose>

          <div className="h-full flex flex-col">
            <div className="pl-12 pr-12 py-4 border-b shrink-0">
              <div className="mx-auto flex w-full max-w-full flex-col sm:max-w-[1215px]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <div className="flex flex-col sm:items-start">
                    <span className="text-2xl font-semibold text-foreground sm:hidden">
                      Campus Map
                    </span>
                    <div className="hidden sm:flex flex-col gap-0.5">
                      <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                        ARA Madras Street
                      </span>
                      <span className="text-2xl font-semibold text-foreground">
                        Campus Map
                      </span>
                    </div>
                    <div className="flex flex-col items-start text-s text-black sm:hidden gap-1 mt-2">
                      <span className="w-full text-left truncate">Current Area: {currentAreaName}</span>
                      <span className="w-full text-left">Areas Discovered: {areasDiscoveredLabel}</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col gap-1 text-right text-s text-black">
                    <span className="text-right">Current Area: {currentAreaName}</span>
                    <span className="text-right">Areas Discovered: {areasDiscoveredLabel}</span>
                  </div>
                </div>
              </div>
            </div>

            <DialogTitle className="sr-only">Campus Map</DialogTitle>
            <DialogDescription className="sr-only">
              Full view of the ARA Institute of Canterbury campus map
            </DialogDescription>

            <div className="flex items-center justify-center pl-2 pr-2 py-3 sm:pl-12 sm:pr-12 sm:py-6">
              <div className="mx-auto w-full max-w-[1215px]">
                <img
                  src="/campus_map/chch-official-campusmap-only.svg"
                  alt="Campus Map - Full View"
                  className="h-auto w-full max-h-[calc(95vh-130px)] sm:max-h-[calc(95vh-160px)] object-contain object-center"
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
