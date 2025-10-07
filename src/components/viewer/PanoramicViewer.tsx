import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { Tour } from '../tour/Tour'
import { Race } from '../race/Race'
import { PanoramicHotspots } from './hotspots/PanoramicHotspots'
import { DirectionalArrows3D } from './navigation/DirectionalArrows3D'
import { Spinner } from '../ui/shadcn-io/spinner'
import { TOUR_START_PHOTO_ID } from '../../hooks/useTourNavigation'
import { useRaceState } from '../../hooks/useRaceState'
import { getAreaForPhoto } from '../../data/tourUtilities'
import type { Photo } from '../../types/tour'

interface PanoramicViewerProps {
  imageUrl: string
  photoImage?: HTMLImageElement | null
  className?: string
  startingAngle?: number
  calculatedCameraAngle?: number
  initialLon?: number
  initialLat?: number
  onCameraChange?: (lon: number, lat: number) => void
  currentPhoto?: Photo | null
  onNavigate?: (direction: string) => void
  onNavigateToPhoto?: (photoId: string) => void
  cameraLon?: number
  onFovChange?: (fov: number) => void
  initialFov?: number
  timerClassName?: string
}

export const PanoramicViewer: React.FC<PanoramicViewerProps> = ({
  imageUrl,
  photoImage,
  className = '',
  startingAngle = 0,
  calculatedCameraAngle,
  initialLon = 0,
  initialLat = 0,
  onCameraChange,
  currentPhoto = null,
  onNavigate,
  onNavigateToPhoto,
  onFovChange,
  initialFov = 75,
  timerClassName = ''
}) => {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [fov, setFov] = useState(initialFov)
  const [isRaceMode, setIsRaceMode] = useState(false)
  const mountRef = useRef<HTMLDivElement>(null)
  const raceState = useRaceState()

  // Sync FOV from parent when initialFov prop changes
  useEffect(() => {
    if (initialFov !== fov) {
      setFov(initialFov)
      fovRef.current = initialFov
      if (sceneDataRef.current) {
        sceneDataRef.current.camera.fov = initialFov
        sceneDataRef.current.camera.updateProjectionMatrix()
      }
    }
  }, [initialFov])

  // Track discovered areas in race mode
  useEffect(() => {
    if (isRaceMode && currentPhoto) {
      const area = getAreaForPhoto(currentPhoto.id)
      if (area) {
        raceState.addArea(area.id)
      }
    }
  }, [currentPhoto, isRaceMode, raceState.addArea])
  const animationRef = useRef<number | null>(null)
  const sceneDataRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    geometry: THREE.SphereGeometry
    sphere: THREE.Mesh
  } | null>(null)
  const fovRef = useRef(initialFov)
  const cameraControlRef = useRef<{ lon: number; lat: number }>({
    lon: calculatedCameraAngle !== undefined
      ? calculatedCameraAngle
      : (startingAngle !== undefined ? startingAngle : initialLon),
    lat: initialLat
  })


  // Scene setup - runs once on mount
  useEffect(() => {
    // Use setTimeout to ensure DOM is ready
    const timer = setTimeout(() => {
      const mount = mountRef.current

      if (!mount) {
        return
      }

      // Basic Three.js setup
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(fovRef.current, mount.clientWidth / mount.clientHeight, 0.1, 1000)
      const renderer = new THREE.WebGLRenderer({ antialias: true })

      renderer.setSize(mount.clientWidth, mount.clientHeight)
      renderer.setPixelRatio(window.devicePixelRatio)
      mount.appendChild(renderer.domElement)


      // Position camera at origin inside the sphere
      camera.position.set(0, 0, 0)
      camera.name = 'panoramic-camera'

      // Set initial camera direction
      camera.lookAt(0, 0, 1)

      // Create sphere geometry
      const geometry = new THREE.SphereGeometry(10, 32, 16)
      geometry.scale(-1, 1, 1) // Flip for inside view

      // Create sphere with placeholder material
      const material = new THREE.MeshBasicMaterial({
        color: 0x000000, // Black placeholder
        side: THREE.FrontSide
      })
      const sphere = new THREE.Mesh(geometry, material)
      sphere.name = 'panoramic-sphere'
      scene.add(sphere)

      // Store scene data for cleanup
      sceneDataRef.current = { scene, camera, renderer, geometry, sphere }

      // Detect mobile device for drag sensitivity
      const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const dragSensitivity = isMobile ? 0.35 : 0.285

      // Mouse control variables - camera orientation is managed by cameraControlRef
      let isMouseDown = false
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
        onPointerDownLon = cameraControlRef.current.lon
        onPointerDownLat = cameraControlRef.current.lat
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
        
        cameraControlRef.current.lon = (onPointerDownPointerX - clientX) * dragSensitivity + onPointerDownLon
        cameraControlRef.current.lat = (clientY - onPointerDownPointerY) * dragSensitivity + onPointerDownLat
        cameraControlRef.current.lat = Math.max(-25, Math.min(85, cameraControlRef.current.lat))

        // Emit camera change for persistence
        onCameraChange?.(cameraControlRef.current.lon, cameraControlRef.current.lat)
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
        onFovChange?.(fovRef.current)
      }

      // Pinch-to-zoom handler for mobile
      let lastTouchDistance = 0
      const onTouchMove = (event: TouchEvent) => {
        if (event.touches.length === 2) {
          event.preventDefault()

          // Calculate distance between two touch points
          const touch1 = event.touches[0]
          const touch2 = event.touches[1]
          const dx = touch2.clientX - touch1.clientX
          const dy = touch2.clientY - touch1.clientY
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (lastTouchDistance > 0) {
            // Calculate zoom delta based on distance change
            const delta = lastTouchDistance - distance
            fovRef.current += delta * 0.2
            fovRef.current = Math.max(10, Math.min(120, fovRef.current))

            camera.fov = fovRef.current
            camera.updateProjectionMatrix()

            // Update state
            setFov(fovRef.current)
            onFovChange?.(fovRef.current)
          }

          lastTouchDistance = distance
        } else {
          lastTouchDistance = 0
        }
      }

      const onTouchEnd = () => {
        lastTouchDistance = 0
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
      mount.addEventListener('touchmove', onTouchMove, { passive: false })
      mount.addEventListener('touchend', onTouchEnd)
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
        const phi = THREE.MathUtils.degToRad(90 - cameraControlRef.current.lat)
        const theta = THREE.MathUtils.degToRad(cameraControlRef.current.lon)

        const target = new THREE.Vector3()
        target.x = 500 * Math.sin(phi) * Math.cos(theta)
        target.y = 500 * Math.cos(phi)
        target.z = 500 * Math.sin(phi) * Math.sin(theta)

        // Update camera rotation and render
        camera.lookAt(target)
        renderer.render(scene, camera)
      }

      // Start animation loop
      animate()

      // Load initial texture if imageUrl is available
      if (imageUrl) {
        setStatus('loading')
        const loader = new THREE.TextureLoader()
        loader.load(
          imageUrl,
          (texture) => {
            if (sceneDataRef.current) {
              const { sphere } = sceneDataRef.current
              sphere.material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.FrontSide
              })
              setStatus('ready')
              setInitialLoadComplete(true)
            }
          },
          undefined,
          (error) => {
            console.error('Failed to load initial texture:', error)
            setStatus('error')
          }
        )
      }

      // Cleanup function for this setup
      return () => {
        mount.removeEventListener('pointerdown', onPointerDown)
        mount.removeEventListener('touchstart', onPointerDown)
        mount.removeEventListener('wheel', onWheel)
        mount.removeEventListener('touchmove', onTouchMove)
        mount.removeEventListener('touchend', onTouchEnd)
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
  }, []) // Only run on mount

  // Texture loading effect - runs when imageUrl changes (but not on initial load)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  useEffect(() => {
    // Skip if this is the initial load (handled in scene setup) or scene not ready
    if (!initialLoadComplete || !sceneDataRef.current) return

    // Primary path: Use photoImage if available (navigation with preloaded Image)
    if (photoImage) {
      if (sceneDataRef.current) {
        const { sphere } = sceneDataRef.current

        // Dispose of old material to prevent memory leaks
        if (sphere.material && !Array.isArray(sphere.material)) {
          const material = sphere.material as THREE.MeshBasicMaterial
          if (material.map) {
            material.map.dispose()
          }
          material.dispose()
        }

        // Create texture directly from Image element (no download!)
        const texture = new THREE.Texture(photoImage)
        texture.needsUpdate = true

        // Update existing sphere's material with new texture
        sphere.material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.FrontSide
        })

        // Reset camera orientation AFTER texture is loaded to prevent flash
        // Priority: calculatedCameraAngle > startingAngle > initialLon
        let targetLon: number
        let targetLat: number

        if (calculatedCameraAngle !== undefined) {
          targetLon = calculatedCameraAngle
          targetLat = 0
        } else if (startingAngle !== undefined) {
          targetLon = startingAngle
          targetLat = 0
        } else {
          targetLon = initialLon
          targetLat = initialLat
        }

        cameraControlRef.current.lon = targetLon
        cameraControlRef.current.lat = targetLat
        onCameraChange?.(targetLon, targetLat)

        // No status update needed - instant operation, isLoading in nav hook handles UX
      }
    }
    // Fallback: Use TextureLoader if no photoImage (backward compatibility)
    else if (imageUrl) {
      setStatus('loading')

      const loader = new THREE.TextureLoader()

      loader.load(
        imageUrl,
        (texture) => {
          if (sceneDataRef.current) {
            const { sphere } = sceneDataRef.current

            if (sphere.material && !Array.isArray(sphere.material)) {
              const material = sphere.material as THREE.MeshBasicMaterial
              if (material.map) {
                material.map.dispose()
              }
              material.dispose()
            }

            sphere.material = new THREE.MeshBasicMaterial({
              map: texture,
              side: THREE.FrontSide
            })

            // Camera angle logic
            let targetLon: number
            let targetLat: number

            if (calculatedCameraAngle !== undefined) {
              targetLon = calculatedCameraAngle
              targetLat = 0
            } else if (startingAngle !== undefined) {
              targetLon = startingAngle
              targetLat = 0
            } else {
              targetLon = initialLon
              targetLat = initialLat
            }

            cameraControlRef.current.lon = targetLon
            cameraControlRef.current.lat = targetLat
            onCameraChange?.(targetLon, targetLat)

            setStatus('ready')
          }
        },
        undefined,
        (error) => {
          console.error('Failed to load texture:', error)
          setStatus('error')
        }
      )
    }
  }, [photoImage, imageUrl, initialLoadComplete])

  const handleFovChange = (newFov: number) => {
    setFov(newFov)
    fovRef.current = newFov
    if (sceneDataRef.current) {
      sceneDataRef.current.camera.fov = newFov
      sceneDataRef.current.camera.updateProjectionMatrix()
    }
    onFovChange?.(newFov)
  }

  return (
    <div className={`${className} relative`}>
      <div ref={mountRef} className="h-screen w-screen absolute inset-0">
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Spinner className="text-gray-500" size={48} />
          </div>
        )}
        {status === 'error' && <div className="absolute inset-0 flex items-center justify-center text-red-400 z-10">Error loading image</div>}
      </div>

      {/* Add hotspot system */}
      {currentPhoto && onNavigate && sceneDataRef.current && status === 'ready' && (
        <PanoramicHotspots
          currentPhoto={currentPhoto}
          sceneRef={sceneDataRef as React.RefObject<NonNullable<typeof sceneDataRef.current>>}
          fov={fov}
          onNavigate={onNavigate}
          onNavigateToPhoto={onNavigateToPhoto}
          isRaceMode={isRaceMode}
          foundHiddenLocations={raceState.foundHiddenLocations}
          onHiddenLocationFound={raceState.addHiddenLocation}
        />
      )}

      {/* Add 3D directional arrows */}
      {currentPhoto && onNavigate && sceneDataRef.current && status === 'ready' && (
        <DirectionalArrows3D
          currentPhoto={currentPhoto}
          sceneRef={sceneDataRef as React.RefObject<NonNullable<typeof sceneDataRef.current>>}
          cameraControlRef={cameraControlRef}
          onNavigate={onNavigate as (direction: 'forward' | 'forwardRight' | 'right' | 'backRight' | 'back' | 'backLeft' | 'left' | 'forwardLeft') => void}
        />
      )}


      {isRaceMode ? (
        <Race
          className="fixed left-1/2 transform -translate-x-1/2 z-20"
          style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
          timerClassName={timerClassName}
          onEndRace={() => setIsRaceMode(false)}
          onRestart={() => {
            raceState.reset()
            onNavigateToPhoto?.(TOUR_START_PHOTO_ID)
          }}
          areasDiscovered={raceState.discoveredAreas.size}
          keyLocationsFound={raceState.foundHiddenLocations.size}
        />
      ) : (
        <Tour
          className="fixed left-1/2 transform -translate-x-1/2 z-20"
          style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
          onStartRace={() => {
            raceState.reset()
            onNavigateToPhoto?.(TOUR_START_PHOTO_ID)
            setIsRaceMode(true)
          }}
        />
      )}
    </div>
  )
}