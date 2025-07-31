import { createFileRoute } from '@tanstack/react-router'
import { PanoramicViewer } from '../components/viewer/PanoramicViewer'

export const Route = createFileRoute('/test')({
  component: TestPanoramicViewer,
})

function TestPanoramicViewer() {
  return (
    <div className="min-h-screen bg-gray-900 pt-16 pb-4">
        <PanoramicViewer 
          imageUrl="/test.jpg"
          className="w-full h-[calc(100vh-10rem)] landscape:h-[calc(100vh-5rem)] sm:h-[calc(100vh-8rem)] bg-gray-800 rounded-lg overflow-hidden shadow-xl"
        />
     </div>
  )
}