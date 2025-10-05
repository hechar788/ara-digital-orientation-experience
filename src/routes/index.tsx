import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { PanoramicViewer } from '../components/viewer/PanoramicViewer'
import { Spinner } from '../components/ui/shadcn-io/spinner'
import { useTourNavigation } from '../hooks/useTourNavigation'

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

  // Temporary keyboard controls for Phase 1 testing
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Prevent navigation when typing in input fields
      if (event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          event.preventDefault()
          navigateDirection('forward')
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          event.preventDefault()
          navigateDirection('back')
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault()
          navigateDirection('left')
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          event.preventDefault()
          navigateDirection('right')
          break
        case 'q':
        case 'Q':
          event.preventDefault()
          navigateDirection('up')
          break
        case 'e':
        case 'E':
          event.preventDefault()
          navigateDirection('down')
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [navigateDirection])

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-900 relative">
      {/* Debug info - remove after Phase 1 testing */}
      <div className="absolute top-4 left-4 z-50 text-white bg-black/70 p-3 rounded-lg text-sm">
        <div><strong>Photo:</strong> {currentPhotoId}</div>
        {currentArea && (
          <>
            <div><strong>Building:</strong> {currentArea.name}</div>
            <div><strong>Floor:</strong> {currentArea.floorLevel}</div>
          </>
        )}
        <div className="mt-2 text-xs opacity-75">
          Use WASD or arrow keys to navigate<br/>
          Q/E for up/down stairs
        </div>
      </div>

      <PanoramicViewer
        imageUrl={currentPhoto?.imageUrl}
        photoImage={currentPhotoImage}
        className="w-full h-full"
        startingAngle={currentPhoto?.startingAngle}
        calculatedCameraAngle={calculatedCameraAngle}
        initialLon={cameraLon}
        initialLat={cameraLat}
        onCameraChange={handleCameraChange}
        currentPhoto={currentPhoto}
        onNavigate={navigateDirection}
        onNavigateToPhoto={jumpToPhoto}
        cameraLon={cameraLon}
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
