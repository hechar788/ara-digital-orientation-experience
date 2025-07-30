import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

interface PanoramicViewerProps {
  imageUrl: string
  className?: string
  onZoomChange?: (fov: number) => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onVRStateChange?: (isPresenting: boolean) => void
}

export const PanoramicViewer: React.FC<PanoramicViewerProps> = ({ 
  imageUrl, 
  className = '',
  onZoomChange,
  onZoomIn,
  onZoomOut,
  onVRStateChange
}) => {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const mountRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
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
      
      // Eye separation for stereo effect (adjust for comfort)
      const eyeSeparation = 0.064 // ~64mm average human eye separation

      // Position cameras at origin inside the sphere
      camera.position.set(0, 0, 0)
      cameraLeft.position.set(-eyeSeparation / 2, 0, 0)
      cameraRight.position.set(eyeSeparation / 2, 0, 0)
      
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

      // Mouse event handlers
      const onPointerDown = (event: PointerEvent) => {
        event.preventDefault()
        isMouseDown = true
        onPointerDownPointerX = event.clientX
        onPointerDownPointerY = event.clientY
        onPointerDownLon = lon
        onPointerDownLat = lat
        mount.style.cursor = 'grabbing'
      }

      const onPointerMove = (event: PointerEvent) => {
        if (!isMouseDown) return
        event.preventDefault()

        lon = (onPointerDownPointerX - event.clientX) * 0.2 + onPointerDownLon
        lat = (event.clientY - onPointerDownPointerY) * 0.2 + onPointerDownLat
        lat = Math.max(-85, Math.min(85, lat))
      }

      const onPointerUp = (event: PointerEvent) => {
        event.preventDefault()
        isMouseDown = false
        mount.style.cursor = 'grab'
      }

      // Zoom handler
      const onWheel = (event: WheelEvent) => {
        event.preventDefault()
        
        // Adjust FOV based on wheel direction
        fovRef.current += event.deltaY * 0.05
        fovRef.current = Math.max(10, Math.min(120, fovRef.current))
        
        camera.fov = fovRef.current
        camera.updateProjectionMatrix()
        
        // Notify parent of zoom change
        onZoomChange?.(fovRef.current)
      }

      // Window resize handler
      const handleResize = () => {
        if (!mount) return
        camera.aspect = mount.clientWidth / mount.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(mount.clientWidth, mount.clientHeight)
      }

      // Set initial cursor
      mount.style.cursor = 'grab'
      mount.style.userSelect = 'none'

      // Add event listeners
      mount.addEventListener('pointerdown', onPointerDown)
      mount.addEventListener('wheel', onWheel)
      document.addEventListener('pointermove', onPointerMove)
      document.addEventListener('pointerup', onPointerUp)
      window.addEventListener('resize', handleResize)

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

      // Stereo mode toggle function - declared at proper scope
      (window as any).toggleStereoMode = (enabled: boolean) => {
        stereoModeRef.current = enabled
        onVRStateChange?.(enabled)
        
        if (enabled) {
          // Adjust camera aspect for split screen
          const aspect = (mount.clientWidth / 2) / mount.clientHeight
          cameraLeft.aspect = aspect
          cameraRight.aspect = aspect
          cameraLeft.updateProjectionMatrix()
          cameraRight.updateProjectionMatrix()
        } else {
          // Restore normal aspect
          camera.aspect = mount.clientWidth / mount.clientHeight
          camera.updateProjectionMatrix()
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
        mount.removeEventListener('wheel', onWheel)
        document.removeEventListener('pointermove', onPointerMove)
        document.removeEventListener('pointerup', onPointerUp)
        window.removeEventListener('resize', handleResize)
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

  // Set up zoom and VR functions for parent to call
  useEffect(() => {
    if (onZoomIn) {
      const zoomInHandler = () => {
        if (sceneDataRef.current) {
          fovRef.current = Math.max(10, fovRef.current - 10)
          sceneDataRef.current.camera.fov = fovRef.current
          sceneDataRef.current.camera.updateProjectionMatrix()
          onZoomChange?.(fovRef.current)
        }
      }
      // Store function reference for external use
      (window as any).panoramicZoomIn = zoomInHandler
    }

    if (onZoomOut) {
      const zoomOutHandler = () => {
        if (sceneDataRef.current) {
          fovRef.current = Math.min(120, fovRef.current + 10)
          sceneDataRef.current.camera.fov = fovRef.current
          sceneDataRef.current.camera.updateProjectionMatrix()
          onZoomChange?.(fovRef.current)
        }
      }
      // Store function reference for external use
      (window as any).panoramicZoomOut = zoomOutHandler
    }

    // Stereo VR functions (works on any browser)
    const enterVRHandler = () => {
      (window as any).toggleStereoMode?.(true)
    }

    const exitVRHandler = () => {
      (window as any).toggleStereoMode?.(false)
    }

    const isVRSupportedHandler = () => {
      // Stereo VR always supported (no WebXR required)
      return true
    }

    // Store VR function references for external use
    (window as any).panoramicEnterVR = enterVRHandler;
    (window as any).panoramicExitVR = exitVRHandler;
    (window as any).panoramicIsVRSupported = isVRSupportedHandler;
  }, [onZoomIn, onZoomOut, onZoomChange, onVRStateChange])

  return (
    <div ref={mountRef} className={className}>
      {status === 'loading' && <div className="absolute inset-0 flex items-center justify-center text-white">Loading...</div>}
      {status === 'error' && <div className="absolute inset-0 flex items-center justify-center text-red-400">Error loading image</div>}
    </div>
  )
}