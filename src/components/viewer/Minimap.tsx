import { useEffect, useCallback, useRef, useState, useMemo } from 'react'
import { Map } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip'
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '../ui/dialog'
import { OnboardingHighlight } from '../tour/onboarding/OnboardingHighlight'
import { usePopup } from '../../hooks/usePopup'
import { useOrientationStore } from '../../hooks/useOrientationStore'
import { useRaceStore } from '../../hooks/useRaceStore'
import { useMinimapStore } from '../../hooks/useMinimapStore'
import { resolveMinimapCoordinate, type MinimapCoordinate } from '../../data/minimap/minimapUtils'
import { TOTAL_TOUR_AREAS } from '../../data/blockUtils'
import type { Area } from '../../types/tour'
import type { MinimapPathNode } from '../../stores/minimapStore'
import clsx from 'clsx'

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

interface MinimapMapImageProps {
  coordinate: MinimapCoordinate | null
  path?: MinimapPathNode[]
  src: string
  alt: string
  markerVariant: 'compact' | 'expanded'
  containerClassName?: string
  imageClassName?: string
  disablePointerEvents?: boolean
  fit?: 'contain' | 'cover'
}

interface RenderMetrics {
  containerWidth: number
  containerHeight: number
  renderedWidth: number
  renderedHeight: number
  offsetX: number
  offsetY: number
}

function MinimapMapImage({
  coordinate,
  path = [],
  src,
  alt,
  markerVariant,
  containerClassName,
  imageClassName,
  disablePointerEvents = false,
  fit = 'contain'
}: MinimapMapImageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [metrics, setMetrics] = useState<RenderMetrics | null>(null)

  const updateRenderMetrics = useCallback(() => {
    const container = containerRef.current
    const image = imageRef.current

    if (!container || !image) {
      setMetrics(null)
      return
    }

    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    const naturalWidth = image.naturalWidth
    const naturalHeight = image.naturalHeight

    if (!containerWidth || !containerHeight || !naturalWidth || !naturalHeight) {
      setMetrics(null)
      return
    }

    let renderedWidth: number
    let renderedHeight: number
    let offsetX = 0
    let offsetY = 0

    if (fit === 'cover') {
      const scale = Math.max(containerWidth / naturalWidth, containerHeight / naturalHeight)
      renderedWidth = naturalWidth * scale
      renderedHeight = naturalHeight * scale
      offsetX = (containerWidth - renderedWidth) / 2
      offsetY = (containerHeight - renderedHeight) / 2
    } else {
      const imageRatio = naturalWidth / naturalHeight
      const containerRatio = containerWidth / containerHeight

      if (containerRatio > imageRatio) {
        renderedHeight = containerHeight
        renderedWidth = renderedHeight * imageRatio
        offsetX = (containerWidth - renderedWidth) / 2
      } else {
        renderedWidth = containerWidth
        renderedHeight = renderedWidth / imageRatio
        offsetY = (containerHeight - renderedHeight) / 2
      }
    }

    setMetrics({
      containerWidth,
      containerHeight,
      renderedWidth,
      renderedHeight,
      offsetX,
      offsetY
    })
  }, [fit])

  useEffect(() => {
    updateRenderMetrics()
  }, [updateRenderMetrics])

  useEffect(() => {
    const image = imageRef.current
    if (!image) {
      return
    }

    const handleLoad = () => {
      updateRenderMetrics()
    }

    if (image.complete) {
      updateRenderMetrics()
    } else {
      image.addEventListener('load', handleLoad)
    }

    return () => {
      image.removeEventListener('load', handleLoad)
    }
  }, [updateRenderMetrics])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const container = containerRef.current

    if (container && typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        updateRenderMetrics()
      })
      observer.observe(container)
      return () => {
        observer.disconnect()
      }
    }

    const handleResize = () => {
      updateRenderMetrics()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [updateRenderMetrics])

  const computePosition = useCallback(
    (value: MinimapCoordinate | null) => {
      if (!metrics || !value || value.x === null || value.y === null) {
        return null
      }
      const left = metrics.offsetX + value.x * metrics.renderedWidth
      const top = metrics.offsetY + value.y * metrics.renderedHeight
      return { left, top }
    },
    [metrics]
  )

  const markerPosition = useMemo(() => computePosition(coordinate), [computePosition, coordinate])

  const pathSegments = useMemo(() => {
    if (!metrics || !path || path.length === 0) {
      return []
    }

    const segments: Array<{ id: string; d: string }> = []
    let commands: string[] = []
    let hasStarted = false
    let segmentIndex = 0

    path.forEach(node => {
      const position = computePosition(node.coordinate)
      if (!position) {
        if (commands.length >= 2) {
          segments.push({
            id: `segment-${segmentIndex}`,
            d: commands.join(' ')
          })
          segmentIndex += 1
        }
        commands = []
        hasStarted = false
        return
      }

      const prefix = hasStarted ? 'L' : 'M'
      commands.push(`${prefix} ${position.left} ${position.top}`)
      hasStarted = true
    })

    if (commands.length >= 2) {
      segments.push({
        id: `segment-${segmentIndex}`,
        d: commands.join(' ')
      })
    }

    return segments
  }, [computePosition, metrics, path])

  const viewBox = useMemo(() => {
    if (!metrics) {
      return null
    }
    return `0 0 ${metrics.containerWidth} ${metrics.containerHeight}`
  }, [metrics])

  const dotClassName =
    markerVariant === 'expanded'
      ? 'h-4 w-4 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.9)]'
      : 'h-3 w-3 rounded-full bg-sky-500 shadow-[0_0_6px_rgba(56,189,248,0.85)]'

  const ringClassName =
    markerVariant === 'expanded'
      ? 'h-10 w-10 rounded-full border border-sky-300/70'
      : 'h-6 w-6 rounded-full border border-sky-400/60'

  const strokeWidth = markerVariant === 'expanded' ? 4 : 3
  const haloWidth = markerVariant === 'expanded' ? 9 : 6

  return (
    <div ref={containerRef} className={clsx('relative', containerClassName)}>
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={clsx(
          'select-none',
          fit === 'cover' ? 'object-cover' : 'object-contain',
          disablePointerEvents && 'pointer-events-none',
          imageClassName
        )}
        draggable={false}
      />
      <div className="pointer-events-none absolute inset-0">
        {viewBox && pathSegments.length > 0 ? (
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={viewBox}
            preserveAspectRatio="none"
          >
            {pathSegments.map(segment => (
              <g key={segment.id}>
                <path
                  d={segment.d}
                  stroke="rgba(250,204,21,0.5)"
                  strokeWidth={haloWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={segment.d}
                  stroke="#facc15"
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            ))}
          </svg>
        ) : null}
        {markerPosition ? (
          <>
            <span
              className={clsx('absolute block', dotClassName)}
              style={{
                left: `${markerPosition.left}px`,
                top: `${markerPosition.top}px`,
                transform: 'translate(-50%, -50%)'
              }}
              aria-hidden="true"
            />
            <span
              className={clsx('absolute', ringClassName)}
              style={{
                left: `${markerPosition.left}px`,
                top: `${markerPosition.top}px`,
                transform: 'translate(-50%, -50%)'
              }}
              aria-hidden="true"
            />
          </>
        ) : null}
      </div>
    </div>
  )
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
export function Minimap({
  currentArea,
  currentPhotoId,
  isRaceMode = false
}: MinimapProps) {
  const minimapStore = useMinimapStore()
  const expandedMap = usePopup()
  const orientation = useOrientationStore()
  const race = useRaceStore()
  const { setActive, activeCoordinate, pathNodes } = minimapStore

  const currentAreaName = currentArea?.name ?? 'Unknown Area'

  // Mode-aware discovery count: show race progress in race mode, orientation in tour mode
  const areasDiscoveredLabel = isRaceMode
    ? `${race.areasCount}/${TOTAL_TOUR_AREAS}`
    : `${orientation.discoveriesCount}/${TOTAL_TOUR_AREAS}`

  const isMinimapOpen = minimapStore.isOpen
  const setIsMinimapOpen = minimapStore.setOpen

  useEffect(() => {
    if (!currentPhotoId) {
      setActive(null, null)
      return
    }

    const { coordinate } = resolveMinimapCoordinate(currentPhotoId)

    if (!coordinate) {
      console.warn(`[Minimap] Missing minimap coordinate for photo "${currentPhotoId}".`)
    }

    setActive(currentPhotoId, coordinate)
  }, [currentPhotoId, setActive])

  const minimapImageSrc = '/campus_map/map.webp'

  return (
    <>
      {/* Map and Navigation Info */}
      <OnboardingHighlight targetId="minimap">
        <div className="flex flex-col gap-1.5 items-end touch-none">
          {/* Campus Map */}
          {isMinimapOpen ? (
          <div className="w-[12.7rem] lg:w-[17.05rem] h-44 lg:h-62 bg-gray-800/90 border-2 border-gray-600 rounded-lg overflow-hidden relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={expandedMap.open}
                  className="w-full h-full cursor-pointer p-0 border-0 bg-transparent"
                  aria-label="Expand map"
                >
                  <MinimapMapImage
                    coordinate={activeCoordinate}
                    path={pathNodes}
                    src={minimapImageSrc}
                    alt="Campus Map"
                    markerVariant="compact"
                    containerClassName="h-full w-full"
                    imageClassName="h-full w-full"
                    fit="cover"
                    disablePointerEvents
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Expand Minimap</p>
              </TooltipContent>
            </Tooltip>
            <div className="absolute top-0 right-0">
              <OnboardingHighlight targetId="minimap-toggle-button">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setIsMinimapOpen(false)}
                      className="w-10 h-10 bg-gray-800/80 border-2 border-gray-600 rounded-bl-lg flex items-center justify-center hover:bg-gray-700/80 text-white transition-colors cursor-pointer"
                      aria-label="Minimize map"
                    >
                      <img src="/svg/map-minus.svg" alt="Minimize" className="w-5 h-5 cursor-pointer" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Close Minimap</p>
                  </TooltipContent>
                </Tooltip>
              </OnboardingHighlight>
            </div>
          </div>
        ) : (
          <OnboardingHighlight targetId="minimap-toggle-button">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsMinimapOpen(true)}
                  className="w-[12.7rem] lg:w-[17.05rem] h-11 bg-gray-800/90 px-4 rounded-lg border border-gray-600 flex items-center justify-between hover:bg-gray-700/90 text-white transition-colors cursor-pointer"
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
          </OnboardingHighlight>
        )}
        </div>
      </OnboardingHighlight>

      {/* Expanded Map Dialog */}
      <Dialog open={expandedMap.isOpen} onOpenChange={expandedMap.close}>
        <DialogContent
          showCloseButton={false}
          className="w-[95vw] max-w-[95vw] sm:w-auto sm:max-w-[900px] max-h-[95vh] p-0 overflow-hidden bg-background flex flex-col touch-pan-y"
        >
          <DialogClose className="absolute top-2 sm:top-1 right-2 sm:right-1 z-50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <span className="sr-only">Close map</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </DialogClose>

          <div className="h-full flex flex-col">
            <div className="px-5 py-4 sm:px-10 sm:pt-6 sm:pb-3 border-b shrink-0">
              <div className="mx-auto flex w-full max-w-full flex-col">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <div className="flex flex-col sm:items-start">
                    <span className="text-xl font-semibold text-foreground sm:hidden">
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

            <div className="flex-1 flex items-center justify-center py-3 sm:px-10 sm:py-3">
              <div className="mx-auto w-full">
                <MinimapMapImage
                  coordinate={activeCoordinate}
                  path={pathNodes}
                  src={minimapImageSrc}
                  alt="Campus Map - Full View"
                  markerVariant="expanded"
                  containerClassName="relative w-full"
                  imageClassName="h-auto w-full max-h-[calc(95vh-130px)] sm:max-h-[calc(95vh-120px)] object-contain object-center"
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
