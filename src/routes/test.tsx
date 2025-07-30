import { createFileRoute } from '@tanstack/react-router'
import React, { useState, useEffect } from 'react'
import { PanoramicViewer } from '../components/PanoramicViewer'

export const Route = createFileRoute('/test')({
  component: TestPanoramicViewer,
})

function TestPanoramicViewer() {
  const [currentFov, setCurrentFov] = useState(75)
  const [isVRPresenting, setIsVRPresenting] = useState(false)
  const [isVRSupported, setIsVRSupported] = useState(false)

  const handleZoomIn = () => {
    (window as any).panoramicZoomIn?.()
  }

  const handleZoomOut = () => {
    (window as any).panoramicZoomOut?.()
  }

  const handleVRToggle = () => {
    if (isVRPresenting) {
      (window as any).panoramicExitVR?.()
    } else {
      (window as any).panoramicEnterVR?.()
    }
  }

  const handleVRStateChange = (presenting: boolean) => {
    setIsVRPresenting(presenting)
  }

  // Check VR support on mount
  useEffect(() => {
    const checkVRSupport = () => {
      const supported = (window as any).panoramicIsVRSupported?.() || false
      setIsVRSupported(supported)
    }
    
    // Check immediately and after a short delay to ensure functions are loaded
    checkVRSupport()
    setTimeout(checkVRSupport, 100)
  }, [])

  const getZoomPercentage = () => {
    // Convert FOV to zoom percentage (lower FOV = more zoomed in)
    return Math.round(((120 - currentFov) / (120 - 10)) * 100)
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Panoramic Viewer Test
        </h1>
        <div className="w-full h-[80vh] bg-gray-800 rounded-lg overflow-hidden shadow-xl">
          <PanoramicViewer 
            imageUrl="/test.jpg"
            className="w-full h-full"
            onZoomChange={setCurrentFov}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onVRStateChange={handleVRStateChange}
          />
        </div>
        
        {/* Control Menu Bar */}
        <div className="mt-4 bg-gray-800 rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">Controls:</span>
              <button
                onClick={handleZoomIn}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center space-x-2"
                disabled={currentFov <= 10}
              >
                <span className="text-lg">🔍</span>
                <span>Zoom In</span>
              </button>
              <button
                onClick={handleZoomOut}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center space-x-2"
                disabled={currentFov >= 120}
              >
                <span className="text-lg">🔍</span>
                <span>Zoom Out</span>
              </button>
              
              {isVRSupported && (
                <button
                  onClick={handleVRToggle}
                  className={`${
                    isVRPresenting 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-purple-600 hover:bg-purple-700'
                  } text-white px-4 py-2 rounded-md transition-colors flex items-center space-x-2`}
                >
                  <span className="text-lg">🥽</span>
                  <span>{isVRPresenting ? 'Exit VR' : 'Enter VR'}</span>
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-gray-400 text-sm">
              <span>Zoom: {getZoomPercentage()}%</span>
              <span>•</span>
              {isVRPresenting ? (
                <span className="text-green-400">VR Mode Active</span>
              ) : (
                <span>Drag to look around • Scroll to zoom{isVRSupported ? ' • VR Available' : ''}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}