# Phase 5: User Experience & Controls

**Duration:** 3 hours
**Difficulty:** Medium
**Prerequisites:** Phase 4 complete

---

## Objectives

1. ✅ Navigation progress indicator
2. ✅ Pause/Resume/Cancel controls
3. ✅ Speed preferences (slow/medium/fast)
4. ✅ Current location tracking
5. ✅ User notifications
6. ✅ Accessibility features

---

## Step 5.1: Create Navigation Controls Component

**Time:** 45 minutes

Create `src/components/NavigationControls.tsx`:

```typescript
interface NavigationControlsProps {
  isNavigating: boolean
  progress?: { current: number, total: number }
  onPause: () => void
  onResume: () => void
  onCancel: () => void
  isPaused: boolean
}

export function NavigationControls({
  isNavigating,
  progress,
  onPause,
  onResume,
  onCancel,
  isPaused
}: NavigationControlsProps) {
  if (!isNavigating) return null

  const percentComplete = progress
    ? Math.round((progress.current / progress.total) * 100)
    : 0

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/90 text-white px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-sm">
      <div className="flex items-center gap-6">
        {/* Progress */}
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium">
            Navigating... {progress?.current} / {progress?.total}
          </div>
          <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {!isPaused ? (
            <button
              onClick={onPause}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
              title="Pause navigation"
            >
              ⏸ Pause
            </button>
          ) : (
            <button
              onClick={onResume}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              title="Resume navigation"
            >
              ▶ Resume
            </button>
          )}

          <button
            onClick={onCancel}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            title="Cancel navigation"
          >
            ✕ Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
```

Update `src/components/AblyNavigation.client.tsx` to add control support:

```typescript
function NavigationListener({ sessionId, onNavigate, connected, error }: NavigationListenerProps) {
  const [isNavigating, setIsNavigating] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [commandQueue, setCommandQueue] = useState<NavigationCommand[]>([])
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  useChannel(`session:${sessionId}`, (message) => {
    const command = message.data as NavigationCommand

    if (command.type === 'route_start') {
      setIsNavigating(true)
      setIsPaused(false)
      setProgress({ current: 0, total: command.metadata?.totalSteps || 0 })
    } else if (command.type === 'navigate') {
      setCommandQueue(prev => [...prev, command])
    } else if (command.type === 'route_complete' || command.type === 'route_cancelled') {
      setIsNavigating(false)
      setCommandQueue([])
      setProgress({ current: 0, total: 0 })
    }
  })

  // Process queue with pause support
  useEffect(() => {
    if (commandQueue.length === 0 || !isNavigating || isPaused) return

    const [nextCommand, ...rest] = commandQueue

    if (nextCommand.photoId) {
      onNavigate(nextCommand.photoId, nextCommand.direction)
      setProgress(prev => ({ ...prev, current: prev.current + 1 }))
    }

    const delay = 800 // Base delay
    const timer = setTimeout(() => setCommandQueue(rest), delay)

    return () => clearTimeout(timer)
  }, [commandQueue, isNavigating, isPaused, onNavigate])

  const handlePause = () => setIsPaused(true)
  const handleResume = () => setIsPaused(false)
  const handleCancel = () => {
    setIsNavigating(false)
    setIsPaused(false)
    setCommandQueue([])
  }

  return (
    <>
      <ConnectionStatus connected={connected} error={error} />
      <NavigationControls
        isNavigating={isNavigating}
        progress={progress}
        onPause={handlePause}
        onResume={handleResume}
        onCancel={handleCancel}
        isPaused={isPaused}
      />
    </>
  )
}
```

**✅ Validation:** Controls appear during navigation, pause/resume/cancel work

---

## Step 5.2: Add Speed Preferences

**Time:** 30 minutes

Create `src/hooks/useNavigationSpeed.ts`:

```typescript
import { useState, useEffect } from 'react'

type SpeedPreset = 'slow' | 'medium' | 'fast'

interface NavigationSpeed {
  baseDelay: number
  verticalDelay: number
  cornerDelay: number
}

const SPEED_PRESETS: Record<SpeedPreset, NavigationSpeed> = {
  slow: {
    baseDelay: 1500,
    verticalDelay: 2000,
    cornerDelay: 800
  },
  medium: {
    baseDelay: 800,
    verticalDelay: 1500,
    cornerDelay: 500
  },
  fast: {
    baseDelay: 500,
    verticalDelay: 1000,
    cornerDelay: 300
  }
}

export function useNavigationSpeed() {
  const [preset, setPreset] = useState<SpeedPreset>(() => {
    const stored = localStorage.getItem('vr-tour-nav-speed')
    return (stored as SpeedPreset) || 'medium'
  })

  useEffect(() => {
    localStorage.setItem('vr-tour-nav-speed', preset)
  }, [preset])

  const speed = SPEED_PRESETS[preset]

  return {
    preset,
    setPreset,
    speed
  }
}
```

Create speed selector component `src/components/SpeedSelector.tsx`:

```typescript
import { useNavigationSpeed } from '../hooks/useNavigationSpeed'

export function SpeedSelector() {
  const { preset, setPreset } = useNavigationSpeed()

  return (
    <div className="fixed top-20 right-4 bg-black/80 text-white p-4 rounded-lg">
      <div className="text-sm font-semibold mb-2">Navigation Speed</div>
      <div className="flex gap-2">
        <button
          onClick={() => setPreset('slow')}
          className={`px-3 py-1 rounded ${preset === 'slow' ? 'bg-blue-600' : 'bg-gray-600'}`}
        >
          🐢 Slow
        </button>
        <button
          onClick={() => setPreset('medium')}
          className={`px-3 py-1 rounded ${preset === 'medium' ? 'bg-blue-600' : 'bg-gray-600'}`}
        >
          🚶 Medium
        </button>
        <button
          onClick={() => setPreset('fast')}
          className={`px-3 py-1 rounded ${preset === 'fast' ? 'bg-blue-600' : 'bg-gray-600'}`}
        >
          🏃 Fast
        </button>
      </div>
    </div>
  )
}
```

Update navigation processing to use speed:

```typescript
const { speed } = useNavigationSpeed()

const delay = speed.baseDelay +
  (isVertical ? speed.verticalDelay : 0) +
  (isCorner ? speed.cornerDelay : 0)
```

**✅ Validation:** Speed selector appears, changing speed affects navigation timing

---

## Step 5.3: Track Current Location

**Time:** 30 minutes

Update `src/routes/index.tsx` to track location:

```typescript
export default function VRTourPage() {
  const sessionId = useMemo(() => getOrCreateSession(), [])
  const [currentPhotoId, setCurrentPhotoId] = useState('a-f1-north-entrance')

  // Update Copilot variable when location changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.WebChat) return

    // Send current location to Copilot
    window.WebChat.directLine?.postActivity({
      type: 'event',
      name: 'setVariable',
      value: {
        currentLocation: currentPhotoId
      }
    }).subscribe()
  }, [currentPhotoId])

  return (
    <AblyNavigationProvider
      sessionId={sessionId}
      currentLocation={currentPhotoId}
      onNavigate={setCurrentPhotoId}
    >
      <PanoramicViewer
        currentPhotoId={currentPhotoId}
        onNavigate={setCurrentPhotoId}
      />
      <SpeedSelector />
    </AblyNavigationProvider>
  )
}
```

Update Copilot topic to use `{Global.currentLocation}` instead of hardcoded value.

**✅ Validation:** Power Automate flow receives correct currentLocation

---

## Step 5.4: Add User Notifications

**Time:** 30 minutes

Create `src/components/Notifications.tsx`:

```typescript
import { useState, useEffect } from 'react'

interface Notification {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (type: Notification['type'], message: string) => {
    const id = crypto.randomUUID()
    setNotifications(prev => [...prev, { id, type, message }])

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed top-24 right-4 space-y-2 z-50">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={`px-4 py-3 rounded-lg shadow-lg animate-slide-in ${
              notif.type === 'success' ? 'bg-green-500' :
              notif.type === 'error' ? 'bg-red-500' :
              'bg-blue-500'
            } text-white`}
          >
            {notif.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

const NotificationContext = React.createContext<{
  addNotification: (type: string, message: string) => void
}>({ addNotification: () => {} })

export const useNotifications = () => React.useContext(NotificationContext)
```

Use in navigation:

```typescript
const { addNotification } = useNotifications()

// On route start
addNotification('info', 'Starting navigation...')

// On route complete
addNotification('success', 'You have arrived!')

// On error
addNotification('error', 'Navigation failed')
```

**✅ Validation:** Toast notifications appear for navigation events

---

## Step 5.5: Add Accessibility Features

**Time:** 30 minutes

Add keyboard controls:

```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (!isNavigating) return

    switch (e.key) {
      case ' ': // Spacebar
        e.preventDefault()
        isPaused ? handleResume() : handlePause()
        break
      case 'Escape':
        handleCancel()
        break
    }
  }

  window.addEventListener('keydown', handleKeyPress)
  return () => window.removeEventListener('keydown', handleKeyPress)
}, [isNavigating, isPaused])
```

Add ARIA labels:

```typescript
<button
  onClick={onPause}
  aria-label="Pause navigation"
  aria-pressed={isPaused}
>
  ⏸ Pause
</button>
```

Add screen reader announcements:

```typescript
const [announcement, setAnnouncement] = useState('')

useEffect(() => {
  if (isNavigating) {
    setAnnouncement(`Navigating to destination. Step ${progress.current} of ${progress.total}`)
  }
}, [isNavigating, progress])

return (
  <>
    <div className="sr-only" role="status" aria-live="polite">
      {announcement}
    </div>
    {/* ... rest of component */}
  </>
)
```

**✅ Validation:** Keyboard shortcuts work, screen readers announce navigation

---

## Phase 5 Complete! 🎉

### Checklist Review

- [x] 5.1 - Create navigation progress component
- [x] 5.2 - Implement pause/resume controls
- [x] 5.3 - Implement cancel navigation
- [x] 5.4 - Add speed preference settings
- [x] 5.5 - Create connection status indicator
- [x] 5.6 - Add navigation timing/pacing
- [x] 5.7 - Implement error notifications

---

## Next Steps

**Proceed to Phase 6:** [phase-6-security-production.md](./phase-6-security-production.md)

**Estimated time:** 2 hours
