import { createFileRoute } from '@tanstack/react-router'
import { PanoramicViewer } from '../components/viewer/PanoramicViewer'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-900">
      <PanoramicViewer 
        imageUrl="/test.JPG"
        className="w-full h-full"
      />
    </div>
  )
}
