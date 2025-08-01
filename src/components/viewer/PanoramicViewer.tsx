import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { Plus } from 'lucide-react'
import { PanoramicViewerControls } from './PanoramicViewerControls'
import { PopoutMenu } from '../PopoutMenu'

interface PanoramicViewerProps {
  imageUrl: string
  className?: string
}

export const PanoramicViewer: React.FC<PanoramicViewerProps> = ({ 
  imageUrl, 
  className = ''
}) => {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [fov, setFov] = useState(75)
  const [isVRMode, setIsVRMode] = useState(false)
  const mountRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const sceneDataRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera  
    renderer: THREE.WebGLRenderer
    geometry: THREE.SphereGeometry
  } | null>(null)
  const fovRef = useRef(75)
  const stereoModeRef = useRef(false)

  useEffect(() => {
    // Use setTimeout to ensure DOM is ready
    const timer = setTimeout(() => {
      const mount = mountRef.current
      
      if (!mount) {
        return
      }

      // Basic Three.js setup
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000)
      const renderer = new THREE.WebGLRenderer({ antialias: true })
      
      renderer.setSize(mount.clientWidth, mount.clientHeight)
      renderer.setPixelRatio(window.devicePixelRatio)
      mount.appendChild(renderer.domElement)

      // Stereo cameras for VR mode
      const cameraLeft = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000)
      const cameraRight = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000)
      
      // Position cameras at origin inside the sphere
      camera.position.set(0, 0, 0)
      cameraLeft.position.set(-0.032, 0, 0) // ~32mm eye separation
      cameraRight.position.set(0.032, 0, 0)
      
      // Set initial camera directions
      camera.lookAt(0, 0, 1)
      cameraLeft.lookAt(0, 0, 1)
      cameraRight.lookAt(0, 0, 1)

      // Create sphere geometry - use larger radius to accommodate stereo cameras
      const geometry = new THREE.SphereGeometry(10, 32, 16)
      geometry.scale(-1, 1, 1) // Flip for inside view

      // Store scene data for cleanup
      sceneDataRef.current = { scene, camera, renderer, geometry }

      // Mouse control variables
      let isMouseDown = false
      let lon = 0
      let lat = 0
      let onPointerDownPointerX = 0
      let onPointerDownPointerY = 0
      let onPointerDownLon = 0
      let onPointerDownLat = 0

      // Touch/Mouse event handlers
      const onPointerDown = (event: PointerEvent | TouchEvent) => {
        // Only handle if the event target is the mount element or canvas
        if (event.target !== mount && event.target !== renderer.domElement) return
        
        event.preventDefault()
        isMouseDown = true
        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
        onPointerDownPointerX = clientX
        onPointerDownPointerY = clientY
        onPointerDownLon = lon
        onPointerDownLat = lat
        mount.style.cursor = 'grabbing'
        
        // Add document listeners only when dragging starts
        document.addEventListener('pointermove', onPointerMove)
        document.addEventListener('touchmove', onPointerMove, { passive: false })
        document.addEventListener('pointerup', onPointerUp)
        document.addEventListener('touchend', onPointerUp)
      }

      const onPointerMove = (event: PointerEvent | TouchEvent) => {
        if (!isMouseDown) return
        
        event.preventDefault()
        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
        
        lon = (onPointerDownPointerX - clientX) * 0.2 + onPointerDownLon
        lat = (clientY - onPointerDownPointerY) * 0.2 + onPointerDownLat
        lat = Math.max(-85, Math.min(85, lat))
      }

      const onPointerUp = (event: PointerEvent | TouchEvent) => {
        if (isMouseDown) {
          event.preventDefault()
        }
        isMouseDown = false
        mount.style.cursor = 'grab'
        
        // Remove document listeners when dragging ends
        document.removeEventListener('pointermove', onPointerMove)
        document.removeEventListener('touchmove', onPointerMove)
        document.removeEventListener('pointerup', onPointerUp)
        document.removeEventListener('touchend', onPointerUp)
      }

      // Zoom handler
      const onWheel = (event: WheelEvent) => {
        event.preventDefault()
        
        // Adjust FOV based on wheel direction
        fovRef.current += event.deltaY * 0.05
        fovRef.current = Math.max(10, Math.min(120, fovRef.current))
        
        camera.fov = fovRef.current
        camera.updateProjectionMatrix()
        
        // Update state
        setFov(fovRef.current)
      }

      // Window resize handler
      const handleResize = () => {
        if (!mount) return
        // Force mount to take available height
        const rect = mount.getBoundingClientRect()
        camera.aspect = rect.width / rect.height
        camera.updateProjectionMatrix()
        renderer.setSize(rect.width, rect.height)
      }

      // Set initial cursor
      mount.style.cursor = 'grab'
      mount.style.userSelect = 'none'

      // Add event listeners - only mount-specific ones initially
      mount.addEventListener('pointerdown', onPointerDown)
      mount.addEventListener('touchstart', onPointerDown, { passive: false })
      mount.addEventListener('wheel', onWheel)
      window.addEventListener('resize', handleResize)

      // Watch for container size changes
      const resizeObserver = new ResizeObserver(() => {
        handleResize()
      })
      resizeObserver.observe(mount)

      // Animation loop function - declared at proper scope
      const animate = () => {
        animationRef.current = requestAnimationFrame(animate)
        
        // Update camera rotation based on mouse position
        const phi = THREE.MathUtils.degToRad(90 - lat)
        const theta = THREE.MathUtils.degToRad(lon)

        const target = new THREE.Vector3()
        target.x = 500 * Math.sin(phi) * Math.cos(theta)
        target.y = 500 * Math.cos(phi)
        target.z = 500 * Math.sin(phi) * Math.sin(theta)

        // Always update main camera rotation first
        camera.lookAt(target)
        
        if (stereoModeRef.current) {
          // Set up stereo cameras with eye separation
          cameraLeft.position.copy(camera.position)
          cameraRight.position.copy(camera.position)
          cameraLeft.rotation.copy(camera.rotation)
          cameraRight.rotation.copy(camera.rotation)
          
          // Add stereo offset
          cameraLeft.position.x -= 0.032
          cameraRight.position.x += 0.032
          
          const width = mount.clientWidth
          const height = mount.clientHeight
          
          // Clear entire buffer
          renderer.setViewport(0, 0, width, height)
          renderer.clear()
          
          // Left eye - use scissor test
          renderer.setViewport(0, 0, width / 2, height)
          renderer.setScissor(0, 0, width / 2, height)
          renderer.setScissorTest(true)
          renderer.render(scene, cameraLeft)
          
          // Right eye
          renderer.setViewport(width / 2, 0, width / 2, height)
          renderer.setScissor(width / 2, 0, width / 2, height)
          renderer.setScissorTest(true)
          renderer.render(scene, cameraRight)
          
          // Reset everything
          renderer.setScissorTest(false)
          renderer.setViewport(0, 0, width, height)
        } else {
          // Normal single camera rendering
          renderer.render(scene, camera)
        }
      }


      // Load texture
      const loader = new THREE.TextureLoader()
      
      loader.load(
        imageUrl,
        (texture) => {
          const material = new THREE.MeshBasicMaterial({ 
            map: texture,
            side: THREE.FrontSide // Use FrontSide with inverted geometry
          })
          const sphere = new THREE.Mesh(geometry, material)
          scene.add(sphere)
          
          // Start animation - function is now properly accessible
          animate()
          
          setStatus('ready')
        },
        undefined,
        (error) => {
          setStatus('error')
        }
      )

      // Cleanup function for this setup
      return () => {
        mount.removeEventListener('pointerdown', onPointerDown)
        mount.removeEventListener('touchstart', onPointerDown)
        mount.removeEventListener('wheel', onWheel)
        // Clean up any remaining document listeners
        document.removeEventListener('pointermove', onPointerMove)
        document.removeEventListener('touchmove', onPointerMove)
        document.removeEventListener('pointerup', onPointerUp)
        document.removeEventListener('touchend', onPointerUp)
        window.removeEventListener('resize', handleResize)
        resizeObserver.disconnect()
      }
    }, 0)

    // Cleanup
    return () => {
      clearTimeout(timer)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (sceneDataRef.current) {
        const { renderer, geometry } = sceneDataRef.current
        const mount = mountRef.current
        
        if (mount && renderer.domElement.parentNode === mount) {
          mount.removeChild(renderer.domElement)
        }
        renderer.dispose()
        geometry.dispose()
        sceneDataRef.current = null
      }
    }
  }, [imageUrl])

  // Handler functions for controls
  const handleZoomIn = () => {
    const newFov = Math.max(10, fov - 10)
    setFov(newFov)
    fovRef.current = newFov
    if (sceneDataRef.current) {
      sceneDataRef.current.camera.fov = newFov
      sceneDataRef.current.camera.updateProjectionMatrix()
    }
  }

  const handleZoomOut = () => {
    const newFov = Math.min(120, fov + 10)
    setFov(newFov)
    fovRef.current = newFov
    if (sceneDataRef.current) {
      sceneDataRef.current.camera.fov = newFov
      sceneDataRef.current.camera.updateProjectionMatrix()
    }
  }

  const handleVRToggle = () => {
    const newVRMode = !isVRMode
    setIsVRMode(newVRMode)
    stereoModeRef.current = newVRMode
  }

  return (
    <div className={`${className} relative`}>
      <div ref={mountRef} className="h-screen w-screen absolute inset-0">
        {status === 'loading' && <div className="absolute inset-0 flex items-center justify-center text-white z-10">Loading...</div>}
        {status === 'error' && <div className="absolute inset-0 flex items-center justify-center text-red-400 z-10">Error loading image</div>}
      </div>
      
      {/* VR Crosshairs - only visible in VR mode */}
      {isVRMode && (
        <>
          {/* Left eye crosshair */}
          <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          
          {/* Right eye crosshair */}
          <div className="absolute top-1/2 left-3/4 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
        </>
      )}
      
      <PanoramicViewerControls 
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20"
        currentFov={fov}
        isVRMode={isVRMode}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onVRToggle={handleVRToggle}
      />
      
      <PopoutMenu />
    </div>
  )
}