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

/**
 * Ably Navigation Client Component
 *
 * IMPORTANT: This file must be client-only (SSR incompatible).
 * Use .client.tsx suffix or dynamic import to ensure it only runs in browser.
 */

import { AblyProvider, useChannel } from '@ably/react'
import * as Ably from 'ably'
import { useMemo, useEffect, useState } from 'react'
import type { NavigationCommand } from '../types/navigation'

interface AblyNavigationProviderProps {
  sessionId: string
  onNavigate: (photoId: string, direction?: string) => void
  children: React.ReactNode
}

/**
 * Ably Provider with automatic token authentication
 */
export function AblyNavigationProvider({
  sessionId,
  onNavigate,
  children
}: AblyNavigationProviderProps) {
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create Ably client (memoized to prevent recreation)
  const ablyClient = useMemo(() => {
    console.info('[Ably] Creating client for session:', sessionId)

    const client = new Ably.Realtime({
      authUrl: '/api/ably-token',
      authMethod: 'POST',
      authHeaders: { 'Content-Type': 'application/json' },
      authParams: { sessionId },
      autoConnect: true
    })

    // Connection event listeners
    client.connection.on('connected', () => {
      console.info('[Ably] Connected successfully')
      setConnected(true)
      setError(null)
    })

    client.connection.on('disconnected', () => {
      console.warn('[Ably] Disconnected')
      setConnected(false)
    })

    client.connection.on('failed', (stateChange) => {
      console.error('[Ably] Connection failed:', stateChange.reason)
      setError(stateChange.reason?.message || 'Connection failed')
      setConnected(false)
    })

    return client
  }, [sessionId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.info('[Ably] Closing connection')
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
  onNavigate: (photoId: string, direction?: string) => void
  connected: boolean
  error: string | null
}

/**
 * Navigation message listener
 */
function NavigationListener({
  sessionId,
  onNavigate,
  connected,
  error
}: NavigationListenerProps) {
  // Subscribe to session-specific channel
  const channelName = `session:${sessionId}`

  useChannel(channelName, (message) => {
    console.info('[Ably] Message received:', message.name, message.data)

    const command = message.data as NavigationCommand

    switch (command.type) {
      case 'navigate':
        if (command.photoId) {
          onNavigate(command.photoId, command.direction)
        }
        break

      case 'route_start':
        console.info('[Ably] Navigation route started')
        break

      case 'route_complete':
        console.info('[Ably] Navigation route completed')
        break

      case 'route_cancelled':
        console.info('[Ably] Navigation route cancelled')
        break
    }
  })

  return (
    <ConnectionStatus
      connected={connected}
      error={error}
    />
  )
}

/**
 * Connection status indicator
 */
function ConnectionStatus({
  connected,
  error
}: {
  connected: boolean
  error: string | null
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
        🟡 Connecting to navigation...
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

Update `src/routes/index.tsx`:

```typescript
import { useState, useMemo } from 'react'
import { PanoramicViewer } from '../components/PanoramicViewer'
import { AblyNavigationProvider } from '../components/AblyNavigation.client'

/**
 * Session ID management
 */
function getOrCreateSession(): string {
  if (typeof window === 'undefined') return ''

  const STORAGE_KEY = 'vr-tour-session'
  const stored = localStorage.getItem(STORAGE_KEY)

  if (stored) {
    try {
      const { sessionId, createdAt } = JSON.parse(stored)
      const age = Date.now() - createdAt

      // Session valid for 24 hours
      if (age < 86400000) {
        return sessionId
      }
    } catch (e) {
      // Invalid data, create new
    }
  }

  // Create new session
  const sessionId = crypto.randomUUID()
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    sessionId,
    createdAt: Date.now()
  }))

  return sessionId
}

export default function VRTourPage() {
  const sessionId = useMemo(() => getOrCreateSession(), [])
  const [currentPhotoId, setCurrentPhotoId] = useState('a-f1-north-entrance')

  const handleNavigate = (photoId: string, direction?: string) => {
    console.info('[Navigation] AI command:', photoId, direction)
    setCurrentPhotoId(photoId)
  }

  // Don't render Ably components during SSR
  if (typeof window === 'undefined') {
    return <PanoramicViewer currentPhotoId={currentPhotoId} />
  }

  return (
    <AblyNavigationProvider
      sessionId={sessionId}
      onNavigate={handleNavigate}
    >
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
/**
 * Navigation Trigger API
 *
 * Calculates route and publishes navigation commands to user's Ably channel.
 * Called by Copilot Studio Power Automate flow.
 */

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
          const { sessionId, currentLocation } = body

          if (!sessionId) {
            return json(
              { success: false, error: 'Missing sessionId' },
              { status: 400 }
            )
          }

          if (!currentLocation) {
            return json(
              { success: false, error: 'Missing currentLocation' },
              { status: 400 }
            )
          }

          // Validate destination exists
          if (!photoExistsInGraph(photoId)) {
            console.warn(`[Navigation] Invalid photo ID: ${photoId}`)
            return json(
              { success: false, error: 'PHOTO_NOT_FOUND' },
              { status: 404 }
            )
          }

          // Calculate route
          const route = findRoute(currentLocation, photoId)

          if (!route) {
            console.warn(`[Navigation] No route found: ${currentLocation} → ${photoId}`)
            return json(
              { success: false, error: 'NO_ROUTE_FOUND' },
              { status: 404 }
            )
          }

          console.info(
            `[Navigation] Route calculated for ${sessionId}: ` +
            `${route.photoIds.length} steps`
          )

          // Publish navigation commands to Ably
          const channel = ably.channels.get(`session:${sessionId}`)

          // Send route start notification
          await channel.publish('navigation', {
            id: crypto.randomUUID(),
            type: 'route_start',
            timestamp: Date.now(),
            metadata: {
              totalSteps: route.photoIds.length,
              estimatedTime: estimateNavigationTime(route)
            }
          } as NavigationCommand)

          // Send each navigation step
          for (let i = 0; i < route.photoIds.length; i++) {
            await channel.publish('navigation', {
              id: crypto.randomUUID(),
              type: 'navigate',
              photoId: route.photoIds[i],
              direction: route.directions[i],
              timestamp: Date.now(),
              metadata: {
                step: i + 1,
                totalSteps: route.photoIds.length
              }
            } as NavigationCommand)
          }

          // Send completion notification
          await channel.publish('navigation', {
            id: crypto.randomUUID(),
            type: 'route_complete',
            photoId: photoId,
            timestamp: Date.now()
          } as NavigationCommand)

          console.info(`[Navigation] Published ${route.photoIds.length} commands to Ably`)

          return json({
            success: true,
            route: {
              distance: route.distance,
              steps: route.photoIds.length,
              estimatedTime: estimateNavigationTime(route)
            }
          })

        } catch (error) {
          console.error('[Navigation] API error:', error)
          return json(
            { success: false, error: 'INTERNAL_ERROR' },
            { status: 500 }
          )
        }
      }
    }
  }
})
```

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

## Step 3.5: Add Pacing/Timing

**Time:** 30 minutes

Update `src/components/AblyNavigation.client.tsx` to add delays between steps:

```typescript
function NavigationListener({
  sessionId,
  onNavigate,
  connected,
  error
}: NavigationListenerProps) {
  const [isNavigating, setIsNavigating] = useState(false)
  const [commandQueue, setCommandQueue] = useState<NavigationCommand[]>([])

  // Subscribe to channel
  useChannel(`session:${sessionId}`, (message) => {
    const command = message.data as NavigationCommand
    console.info('[Ably] Message received:', command.type)

    if (command.type === 'navigate') {
      // Add to queue instead of executing immediately
      setCommandQueue(prev => [...prev, command])
    } else {
      // Handle other command types immediately
      if (command.type === 'route_start') {
        setIsNavigating(true)
      } else if (command.type === 'route_complete' || command.type === 'route_cancelled') {
        setIsNavigating(false)
        setCommandQueue([])
      }
    }
  })

  // Process queue with timing
  useEffect(() => {
    if (commandQueue.length === 0 || !isNavigating) return

    const [nextCommand, ...rest] = commandQueue

    // Execute command
    if (nextCommand.photoId) {
      onNavigate(nextCommand.photoId, nextCommand.direction)
    }

    // Calculate delay before next step
    const baseDelay = 800 // 0.8s base
    const isVertical = ['up', 'down', 'elevator', 'floor1', 'floor2'].includes(nextCommand.direction || '')
    const delay = isVertical ? baseDelay + 1500 : baseDelay

    // Schedule next command
    const timer = setTimeout(() => {
      setCommandQueue(rest)
    }, delay)

    return () => clearTimeout(timer)
  }, [commandQueue, isNavigating, onNavigate])

  return <ConnectionStatus connected={connected} error={error} />
}
```

**✅ Validation:** Navigation has smooth pacing, not instant teleportation

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
