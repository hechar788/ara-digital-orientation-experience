import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { PanoramicViewer } from '../components/viewer/PanoramicViewer'
import { PanoramicZoomSlider } from '../components/viewer/PanoramicZoomSlider'
import { Minimap } from '../components/viewer/Minimap'
import { Spinner } from '../components/ui/shadcn-io/spinner'
import { useTourNavigation } from '../hooks/useTourNavigation'
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
  const [isRaceMode, setIsRaceMode] = useState(false)

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-900 relative">
      {/* Map and Navigation Info - Top Right */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-1.5 items-end">
        <Minimap
          currentArea={currentArea}
          currentPhotoId={currentPhotoId}
          isRaceMode={isRaceMode}
        />

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
        onRaceModeChange={setIsRaceMode}
      />

      {/* Navigation loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <Spinner className="text-gray-500" size={48} />
        </div>
      )}
    </div>
  )
}
