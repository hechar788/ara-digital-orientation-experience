import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { PanoramicViewer } from '../components/viewer/PanoramicViewer'
import { PanoramicZoomSlider } from '../components/viewer/PanoramicZoomSlider'
import { Minimap } from '../components/viewer/Minimap'
import { Spinner } from '../components/ui/shadcn-io/spinner'
import { OnboardingProvider } from '../components/tour/onboarding/OnboardingContext'
import { useTourNavigation } from '../hooks/useTourNavigation'
import { useRaceStore } from '../hooks/useRaceStore'
import { RaceLocationCounter } from '../components/race/RaceLocationCounter'
import { TOTAL_HIDDEN_LOCATIONS } from '../data/hidden_locations/hiddenLocations'
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

  const [currentFov, setCurrentFov] = useState(81)
  const [isRaceMode, setIsRaceMode] = useState(false)
  const { hiddenLocationsCount } = useRaceStore()

  return (
    <OnboardingProvider>
      <div className="h-screen w-screen overflow-hidden bg-gray-900 relative">
        {/* Map and Navigation Info - Top Right */}
        <div className="absolute top-4 right-4 z-40 flex flex-col gap-1.5 items-end">
          <Minimap
            currentArea={currentArea}
            currentPhotoId={currentPhotoId}
            isRaceMode={isRaceMode}
          />

          {/* Zoom Slider */}
          <PanoramicZoomSlider
            currentFov={currentFov}
            onZoomChange={setCurrentFov}
            className="w-[11.55rem] lg:w-62 !py-1.5"
          />

          {/* Race Locations Counter - Only in Race Mode */}
          {isRaceMode && (
            <RaceLocationCounter
              locationsFound={hiddenLocationsCount}
              totalLocations={TOTAL_HIDDEN_LOCATIONS}
              className="w-[11.55rem] lg:w-62"
            />
          )}
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
          timerClassName="absolute top-4 left-4 z-40"
          onRaceModeChange={setIsRaceMode}
        />

        {/* Navigation loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <Spinner className="text-gray-500" size={48} />
          </div>
        )}
      </div>
    </OnboardingProvider>
  )
}
