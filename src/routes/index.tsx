import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Map } from 'lucide-react'
import { PanoramicViewer } from '../components/viewer/PanoramicViewer'
import { PanoramicZoomSlider } from '../components/viewer/PanoramicZoomSlider'
import { Spinner } from '../components/ui/shadcn-io/spinner'
import { Tooltip, TooltipTrigger, TooltipContent } from '../components/ui/tooltip'
import { Dialog, DialogContent } from '../components/ui/dialog'
import { useTourNavigation } from '../hooks/useTourNavigation'
import { usePopup } from '../hooks/usePopup'
import type { DirectionType } from '../types/tour'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const {
    currentPhoto,
    currentPhotoImage,
    currentArea,
    isLoading,
    navigateDirection,
    jumpToPhoto,
    currentPhotoId,
    cameraLon,
    cameraLat,
    calculatedCameraAngle,
    handleCameraChange
  } = useTourNavigation()

  const [currentFov, setCurrentFov] = useState(75)
  const [isMinimapOpen, setIsMinimapOpen] = useState(true)
  const expandedMap = usePopup()

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-900 relative">
      {/* Map and Navigation Info - Top Right */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-1.5 items-end">
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
                    src="/campus_map/map.webp"
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

        {/* Current Area Label */}
        <div className="w-62 bg-gray-800/90 px-4 py-2 rounded-lg border border-gray-600">
          <span className="text-white text-sm font-medium">
            Current Area: {currentPhotoId}
          </span>
        </div>

        {/* Zoom Slider */}
        <PanoramicZoomSlider
          currentFov={currentFov}
          onZoomChange={setCurrentFov}
          className="w-62 !py-1.5"
        />
      </div>

      <PanoramicViewer
        imageUrl={currentPhoto?.imageUrl ?? ''}
        photoImage={currentPhotoImage}
        className="w-full h-full"
        startingAngle={currentPhoto?.startingAngle}
        calculatedCameraAngle={calculatedCameraAngle}
        initialLon={cameraLon}
        initialLat={cameraLat}
        onCameraChange={handleCameraChange}
        currentPhoto={currentPhoto}
        onNavigate={(direction) => navigateDirection(direction as DirectionType)}
        onNavigateToPhoto={jumpToPhoto}
        cameraLon={cameraLon}
        initialFov={currentFov}
        onFovChange={setCurrentFov}
        timerClassName="absolute top-4 left-4 z-50"
      />

      {/* Navigation loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <Spinner className="text-gray-500" size={48} />
        </div>
      )}

      {/* Expanded Map Dialog */}
      <Dialog open={expandedMap.isOpen} onOpenChange={expandedMap.close}>
        <DialogContent className="max-w-[80vw] w-[80vw] h-[80vh] p-0">
          <img
            src="/campus_map/map.webp"
            alt="Campus Map - Full View"
            className="w-full h-full object-contain"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
