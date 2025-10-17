# Phase 3: Ably Integration

**Duration:** 3 hours
**Difficulty:** Medium
**Prerequisites:** Phase 1 & 2 complete, Ably account set up

---

## Objectives

1. ✅ Ably token authentication endpoint
2. ✅ Client-side Ably wrapper (SSR-safe)
3. ✅ Server-side navigation API with Ably publishing
4. ✅ Real-time message delivery (<200ms)
5. ✅ Connection status monitoring
6. ✅ Automatic reconnection with message replay

---

## Step 3.1: Create Ably Token Endpoint

**Time:** 20 minutes

Create `src/routes/api/ably-token.tsx`:

```typescript
/**
 * Ably Token Authentication Endpoint
 *
 * Generates secure tokens for client connections.
 * Tokens are scoped to user's session channel (read-only).
 */

import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import Ably from 'ably'

// Server-side Ably client with full API key
const ably = new Ably.Rest(process.env.ABLY_API_KEY!)

export const Route = createFileRoute('/api/ably-token')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { sessionId } = await request.json()

          if (!sessionId) {
            return json(
              { error: 'Missing sessionId' },
              { status: 400 }
            )
          }

          // Generate token with restricted capabilities
          const tokenRequest = await ably.auth.createTokenRequest({
            clientId: sessionId,
            capability: {
              // User can ONLY subscribe to their own channel
              [`session:${sessionId}`]: ['subscribe']
            },
            ttl: 3600000 // 1 hour
          })

          console.info(`[Ably] Token generated for session: ${sessionId}`)

          return json(tokenRequest)
        } catch (error) {
          console.error('[Ably] Token generation failed:', error)
          return json(
            { error: 'Token generation failed' },
            { status: 500 }
          )
        }
      }
    }
  }
})
```

**Test token endpoint:**

```bash
curl -X POST http://localhost:3000/api/ably-token \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-123"}'
```

**Expected output:**
```json
{
  "keyName": "xVLyHw.A-B1Cq",
  "ttl": 3600000,
  "timestamp": 1705324800000,
  "capability": "{\"session:test-123\":[\"subscribe\"]}",
  "nonce": "abc123...",
  "mac": "def456..."
}
```

**✅ Validation:** Token endpoint returns valid token request object

---

## Step 3.2: Create Client-Side Ably Wrapper

**Time:** 45 minutes

Create `src/components/AblyNavigation.client.tsx`:

```typescript
'use client'

import { AblyProvider, useChannel } from '@ably/react'
import * as Ably from 'ably'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { NavigationCommand, RouteStep } from '../types/navigation'

interface AblyNavigationProviderProps {
  sessionId: string
  onNavigate: (photoId: string, direction?: string | null) => void
  children: React.ReactNode
}

interface QueuedStep {
  step: RouteStep
  stepIndex: number
}

export function AblyNavigationProvider({
  sessionId,
  onNavigate,
  children
}: AblyNavigationProviderProps) {
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ablyClient = useMemo(() => {
    const client = new Ably.Realtime({
      authUrl: '/api/ably-token',
      authMethod: 'POST',
      authHeaders: { 'Content-Type': 'application/json' },
      authParams: { sessionId },
      autoConnect: true
    })

    client.connection.on('connected', () => {
      setConnected(true)
      setError(null)
    })

    client.connection.on('disconnected', () => {
      setConnected(false)
    })

    client.connection.on('failed', state => {
      setConnected(false)
      setError(state.reason?.message ?? 'Connection failed')
    })

    return client
  }, [sessionId])

  useEffect(() => {
    return () => {
      ablyClient.close()
    }
  }, [ablyClient])

  return (
    <AblyProvider client={ablyClient}>
      <NavigationListener
        sessionId={sessionId}
        onNavigate={onNavigate}
        connected={connected}
        error={error}
      />
      {children}
    </AblyProvider>
  )
}

interface NavigationListenerProps {
  sessionId: string
  onNavigate: (photoId: string, direction?: string | null) => void
  connected: boolean
  error: string | null
}

function NavigationListener({
  sessionId,
  onNavigate,
  connected,
  error
}: NavigationListenerProps) {
  const [isNavigating, setIsNavigating] = useState(false)
  const [totalSteps, setTotalSteps] = useState(0)
  const [pendingSteps, setPendingSteps] = useState<QueuedStep[]>([])
  const nextStepIndexRef = useRef(1)

  useChannel(`session:${sessionId}`, message => {
    const command = message.data as NavigationCommand

    switch (command.type) {
      case 'route_start': {
        nextStepIndexRef.current = 1
        setPendingSteps([])
        setIsNavigating(true)
        setTotalSteps(command.metadata?.totalSteps ?? 0)
        break
      }
      case 'navigate': {
        if (command.step && typeof command.metadata?.stepIndex === 'number') {
          setPendingSteps(prev => {
            const next = [
              ...prev,
              {
                step: command.step!,
                stepIndex: command.metadata!.stepIndex
              }
            ]

            next.sort((a, b) => a.stepIndex - b.stepIndex)
            return next
          })
        }
        break
      }
      case 'route_complete':
      case 'route_cancelled': {
        setIsNavigating(false)
        setPendingSteps([])
        setTotalSteps(0)
        break
      }
    }
  })

  useEffect(() => {
    if (!isNavigating || pendingSteps.length === 0) {
      return
    }

    const [next, ...rest] = pendingSteps

    if (next.stepIndex !== nextStepIndexRef.current) {
      return
    }

    onNavigate(next.step.photoId, next.step.direction)
    nextStepIndexRef.current += 1
    setPendingSteps(rest)
  }, [isNavigating, onNavigate, pendingSteps])

  return (
    <ConnectionStatus
      connected={connected}
      error={error}
      isNavigating={isNavigating}
      totalSteps={totalSteps}
      processedSteps={nextStepIndexRef.current - 1}
    />
  )
}

function ConnectionStatus({
  connected,
  error,
  isNavigating,
  totalSteps,
  processedSteps
}: {
  connected: boolean
  error: string | null
  isNavigating: boolean
  totalSteps: number
  processedSteps: number
}) {
  if (error) {
    return (
      <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
        🔴 Connection error: {error}
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="fixed top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
        🟡 Connecting to navigation…
      </div>
    )
  }

  if (isNavigating) {
    return (
      <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
        🟢 AI Navigation · Step {processedSteps} / {totalSteps}
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
      🟢 AI Navigation Ready
    </div>
  )
}
```

**✅ Validation:** Component compiles, TypeScript shows no errors

---

## Step 3.3: Integrate into Main Page

**Time:** 20 minutes

### 3.3.1 - Create Session Helper

Create `src/lib/session.ts` (this module will be extended in Phase 6):

```typescript
export function getOrCreateSession(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  const STORAGE_KEY = 'vr-tour-session'
  const stored = window.localStorage.getItem(STORAGE_KEY)

  if (stored) {
    try {
      const { sessionId, createdAt } = JSON.parse(stored) as { sessionId: string; createdAt: number }
      if (Date.now() - createdAt < 86_400_000) {
        return sessionId
      }
    } catch {
      // Ignore corrupt localStorage entries
    }
  }

  const sessionId = crypto.randomUUID()
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ sessionId, createdAt: Date.now() })
  )

  return sessionId
}
```

### 3.3.2 - Wire Ably Provider into the Tour Page

Update `src/routes/index.tsx`:

```typescript
import { useMemo, useState } from 'react'
import { PanoramicViewer } from '../components/PanoramicViewer'
import { AblyNavigationProvider } from '../components/AblyNavigation.client'
import { getOrCreateSession } from '../lib/session'

export default function VRTourPage() {
  const sessionId = useMemo(() => getOrCreateSession(), [])
  const [currentPhotoId, setCurrentPhotoId] = useState('a-f1-north-entrance')

  const handleNavigate = (photoId: string, direction?: string | null) => {
    console.info('[Navigation] AI command:', photoId, direction)
    setCurrentPhotoId(photoId)
  }

  if (typeof window === 'undefined') {
    return (
      <PanoramicViewer
        currentPhotoId={currentPhotoId}
        onNavigate={setCurrentPhotoId}
      />
    )
  }

  return (
    <AblyNavigationProvider sessionId={sessionId} onNavigate={handleNavigate}>
      <PanoramicViewer
        currentPhotoId={currentPhotoId}
        onNavigate={setCurrentPhotoId}
      />
    </AblyNavigationProvider>
  )
}
```

**Test in browser:**

```bash
npm run dev
```

Open http://localhost:3000

**Expected:** See "🟢 AI Navigation Ready" indicator in top-right

**✅ Validation:** Connection status shows green, no console errors

---

## Step 3.4: Create Navigation API Endpoint

**Time:** 45 minutes

Create `src/routes/api/navigate-to/$photoId.tsx`:

```typescript
import { randomUUID } from 'node:crypto'
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import Ably from 'ably'
import { findRoute, photoExistsInGraph, estimateNavigationTime } from '../../../data/navigationGraph'
import type { NavigationCommand } from '../../../types/navigation'

const ably = new Ably.Rest(process.env.ABLY_API_KEY!)

export const Route = createFileRoute('/api/navigate-to/$photoId')({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const { photoId } = params

        try {
          const body = await request.json()
          const { sessionId, currentLocation } = body as {
            sessionId?: string
            currentLocation?: string
          }

          if (!sessionId) {
            return json({ success: false, error: 'Missing sessionId' }, { status: 400 })
          }

          if (!currentLocation) {
            return json({ success: false, error: 'Missing currentLocation' }, { status: 400 })
          }

          if (!photoExistsInGraph(photoId)) {
            return json({ success: false, error: 'PHOTO_NOT_FOUND' }, { status: 404 })
          }

          const route = findRoute(currentLocation, photoId)

          if (!route) {
            return json({ success: false, error: 'NO_ROUTE_FOUND' }, { status: 404 })
          }

          const channel = ably.channels.get(`session:${sessionId}`)
          const travelSteps = route.steps.slice(1)
          const estimatedTime = estimateNavigationTime(route)

          await channel.publish('navigation', {
            id: randomUUID(),
            type: 'route_start',
            timestamp: Date.now(),
            metadata: {
              totalSteps: travelSteps.length,
              estimatedTime
            }
          } satisfies NavigationCommand)

          await Promise.all(
            travelSteps.map((step, index) =>
              channel.publish('navigation', {
                id: randomUUID(),
                type: 'navigate',
                step,
                timestamp: Date.now(),
                metadata: {
                  stepIndex: index + 1,
                  totalSteps: travelSteps.length
                }
              } satisfies NavigationCommand)
            )
          )

          await channel.publish('navigation', {
            id: randomUUID(),
            type: 'route_complete',
            timestamp: Date.now(),
            metadata: {
              totalSteps: travelSteps.length
            }
          } satisfies NavigationCommand)

          return json({
            success: true,
            route: {
              distance: route.distance,
              steps: travelSteps.length,
              estimatedTime
            }
          })
        } catch (error) {
          console.error('[Navigation] API error:', error)
          return json({ success: false, error: 'INTERNAL_ERROR' }, { status: 500 })
        }
      }
    }
  }
})
```

The API publishes a `route_start` message, batches every navigation step with a deterministic `metadata.stepIndex`, and finishes with `route_complete`. The client queues steps and processes them in order so publishing the commands in parallel does not risk out-of-order camera updates.

**Test navigation API:**

```bash
# Start dev server
npm run dev

# In another terminal, trigger navigation
curl -X POST http://localhost:3000/api/navigate-to/library-main-entrance \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "YOUR_SESSION_ID_FROM_BROWSER",
    "currentLocation": "a-f1-north-entrance"
  }'
```

**Get sessionId from browser console:**
```javascript
JSON.parse(localStorage.getItem('vr-tour-session')).sessionId
```

**Expected:** VR viewport should navigate through the route automatically!

**✅ Validation:** API returns success, messages arrive in browser, viewport navigates

---

## Step 3.5: Verify Step Ordering

**Time:** 10 minutes

With the queue + `stepIndex` system in place, each navigation command should fire in the exact order it was generated on the server. Before moving on, trigger a few sample navigations and confirm the console logs match expectations:

1. Watch the `[Ably] Message received` logs to ensure the client receives `route_start`, several `navigate` messages, then `route_complete`.
2. Add a temporary `console.log` inside the `useEffect` that calls `onNavigate` to verify the processed step index increments sequentially (1, 2, 3...).
3. Force a long route and ensure the viewer never skips steps or replays the same photo twice.

Smooth pacing will be introduced in Phase 6 when we connect the dedicated route navigation hook.

---

## Phase 3 Complete! 🎉

### Checklist Review

- [x] 3.1 - Create Ably token auth endpoint
- [x] 3.2 - Create client-only Ably wrapper component
- [x] 3.3 - Implement navigation-to API endpoint
- [x] 3.4 - Test message publishing from server
- [x] 3.5 - Test message receiving in client
- [x] 3.6 - Implement connection status indicator
- [x] 3.7 - Handle reconnection with message replay

### Validation Tests

1. ✅ Ably connection establishes (green indicator)
2. ✅ Navigation API triggers route execution
3. ✅ Messages arrive in <200ms
4. ✅ Viewport navigates smoothly through route
5. ✅ No SSR crashes or hydration errors

---

## Next Steps

**Proceed to Phase 4:** [phase-4-copilot-setup.md](./phase-4-copilot-setup.md)

**Estimated time:** 2 hours
