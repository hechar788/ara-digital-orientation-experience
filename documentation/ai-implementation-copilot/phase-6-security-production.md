# Phase 6: Security & Production Readiness

**Duration:** 2 hours
**Difficulty:** Medium
**Prerequisites:** Phase 5 complete

---

## Objectives

1. ✅ Session token validation
2. ✅ Rate limiting on API endpoints
3. ✅ CORS configuration
4. ✅ Error handling & logging
5. ✅ Analytics tracking
6. ✅ Environment-based feature flags

---

## Step 6.1: Create KV Wrapper

**Time:** 10 minutes

Install the Vercel KV client and create a development-friendly wrapper so subsequent steps can rely on a consistent API.

### 6.1.1 - Install Dependency

```bash
npm install @vercel/kv
```

### 6.1.2 - Configure Environment (production)

Add the following variables to your deployment platform. For local development you can omit them and fall back to the in-memory store defined below.

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`
- `KV_REST_API_CA_CERT` (optional, only if provided by Vercel)

### 6.1.3 - Create Wrapper

Create `src/lib/kv.ts`:

```typescript
import { kv as vercelKv } from '@vercel/kv'

interface MemoryValue {
  value: unknown
  expiresAt?: number
}

const memoryStore = new Map<string, MemoryValue>()

function purgeExpired(key: string) {
  const entry = memoryStore.get(key)
  if (entry?.expiresAt && entry.expiresAt < Date.now()) {
    memoryStore.delete(key)
  }
}

const memoryKv = {
  async get<T>(key: string): Promise<T | null> {
    purgeExpired(key)
    return (memoryStore.get(key)?.value as T | undefined) ?? null
  },
  async set(key: string, value: unknown, options?: { ex?: number }) {
    memoryStore.set(key, {
      value,
      expiresAt: options?.ex ? Date.now() + options.ex * 1000 : undefined
    })
  },
  async incr(key: string): Promise<number> {
    purgeExpired(key)
    const current = Number(memoryStore.get(key)?.value ?? 0)
    const next = Number.isNaN(current) ? 1 : current + 1
    memoryStore.set(key, { value: next })
    return next
  },
  async expire(key: string, seconds: number) {
    const entry = memoryStore.get(key)
    if (entry) {
      entry.expiresAt = Date.now() + seconds * 1000
      memoryStore.set(key, entry)
    }
  },
  async lpush(key: string, value: string) {
    purgeExpired(key)
    const list = (memoryStore.get(key)?.value as string[] | undefined) ?? []
    list.unshift(value)
    memoryStore.set(key, { value: list })
    return list.length
  },
  async llen(key: string) {
    purgeExpired(key)
    const list = memoryStore.get(key)?.value
    return Array.isArray(list) ? list.length : 0
  }
}

const useVercelKv = Boolean(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
)

export const kv = useVercelKv ? vercelKv : memoryKv
```

The wrapper exports a drop-in replacement for the official client so the rest of the plan can use `kv.*` without worrying about environment differences.


## Step 6.2: Implement Session Tokens

**Time:** 30 minutes

Update `src/lib/session.ts` so it now exports both the browser helper from Phase 3 and the secure token utilities:

```typescript
import { kv } from './kv'

const SESSION_STORAGE_KEY = 'vr-tour-session'
const SESSION_TTL_SECONDS = 86_400

export function getOrCreateSession(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  const stored = window.localStorage.getItem(SESSION_STORAGE_KEY)

  if (stored) {
    try {
      const { sessionId, createdAt } = JSON.parse(stored) as { sessionId: string; createdAt: number }
      if (Date.now() - createdAt < SESSION_TTL_SECONDS * 1000) {
        return sessionId
      }
    } catch {
      // Ignore corrupt storage entries
    }
  }

  const sessionId = crypto.randomUUID()
  window.localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify({ sessionId, createdAt: Date.now() })
  )

  return sessionId
}

export async function generateSessionToken(sessionId: string): Promise<string> {
  const token = crypto.randomUUID()
  await kv.set(`session:${sessionId}:token`, token, { ex: SESSION_TTL_SECONDS })
  return token
}

export async function validateSessionToken(sessionId: string, token: string): Promise<boolean> {
  const storedToken = await kv.get<string>(`session:${sessionId}:token`)
  return storedToken === token
}
```


Update `/api/navigate-to/$photoId.tsx`:

```typescript
export const Route = createFileRoute('/api/navigate-to/$photoId')({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const { sessionId, sessionToken, currentLocation } = await request.json()

        // Validate token
        const isValid = await validateSessionToken(sessionId, sessionToken)
        if (!isValid) {
          return json(
            { success: false, error: 'INVALID_SESSION' },
            { status: 403 }
          )
        }

        // ... rest of handler
      }
    }
  }
})
```

Update client to include token:

```typescript
// Generate token on session creation
const sessionToken = await fetch('/api/create-session', {
  method: 'POST',
  body: JSON.stringify({ sessionId })
}).then(r => r.json()).then(d => d.token)

// Store with session
localStorage.setItem('vr-tour-session', JSON.stringify({
  sessionId,
  sessionToken,
  createdAt: Date.now()
}))
```

**✅ Validation:** API rejects requests without valid token

---

## Step 6.3: Add Rate Limiting

**Time:** 30 minutes

Create `src/lib/rateLimit.ts`:

```typescript
import { kv } from './kv'

export async function checkRateLimit(
  key: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<{ allowed: boolean; remaining: number }> {
  const rateLimitKey = `ratelimit:${key}`

  const count = await kv.incr(rateLimitKey)

  if (count === 1) {
    await kv.expire(rateLimitKey, windowSeconds)
  }

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count)
  }
}
```

Apply to API endpoints:

```typescript
import { checkRateLimit } from '../../../lib/rateLimit'

POST: async ({ params, request }) => {
  const { sessionId } = await request.json()

  // Check rate limit: 10 requests per minute per session
  const { allowed, remaining } = await checkRateLimit(`nav:${sessionId}`, 10, 60)

  if (!allowed) {
    return json(
      {
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        retryAfter: 60
      },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Remaining': '0'
        }
      }
    )
  }

  // Add rate limit headers to successful responses
  return json(
    { success: true, ... },
    {
      headers: {
        'X-RateLimit-Remaining': remaining.toString()
      }
    }
  )
}
```

**✅ Validation:** API returns 429 after exceeding limit

---

## Step 6.4: Configure CORS

**Time:** 15 minutes

Create `src/lib/cors.ts`:

```typescript
const ALLOWED_ORIGINS = [
  'https://your-domain.vercel.app',
  'https://*.copilotstudio.microsoft.com',
  'https://*.powerautomate.com',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null
].filter(Boolean)

export function validateOrigin(origin: string | null): boolean {
  if (!origin) {
    return true // Same-origin
  }

  try {
    const url = new URL(origin)
    const host = url.host.toLowerCase()

    return ALLOWED_ORIGINS.some(allowed => {
      if (!allowed) {
        return false
      }

      if (allowed.includes('*')) {
        const [, domain] = allowed.split('*.', 2)
        return domain ? host.endsWith(domain.toLowerCase()) : false
      }

      return origin === allowed
    })
  } catch {
    return false
  }
}

export function getCORSHeaders(origin: string | null) {
  if (!origin || !validateOrigin(origin)) {
    return {}
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  }
}
```

Apply to API routes:

```typescript
import { validateOrigin, getCORSHeaders } from '../../../lib/cors'

POST: async ({ request, params }) => {
  const origin = request.headers.get('Origin')

  if (!validateOrigin(origin)) {
    return json(
      { error: 'Unauthorized origin' },
      { status: 403 }
    )
  }

  // ... handler logic

  return json(
    { success: true, ... },
    { headers: getCORSHeaders(origin) }
  )
}
```

**✅ Validation:** API rejects requests from unauthorized origins

---

## Step 6.5: Comprehensive Error Handling

**Time:** 20 minutes

Create `src/lib/errors.ts`:

```typescript
export class NavigationError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'NavigationError'
  }
}

export const ERROR_CODES = {
  PHOTO_NOT_FOUND: new NavigationError(
    'PHOTO_NOT_FOUND',
    'The requested location does not exist',
    404
  ),
  NO_ROUTE_FOUND: new NavigationError(
    'NO_ROUTE_FOUND',
    'No path exists to the destination',
    404
  ),
  INVALID_SESSION: new NavigationError(
    'INVALID_SESSION',
    'Session not found or expired',
    403
  ),
  RATE_LIMIT_EXCEEDED: new NavigationError(
    'RATE_LIMIT_EXCEEDED',
    'Too many requests',
    429
  )
}

export function handleAPIError(error: unknown) {
  console.error('[API Error]', error)

  if (error instanceof NavigationError) {
    return json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      },
      { status: error.statusCode }
    )
  }

  return json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    },
    { status: 500 }
  )
}
```

Update API routes:

```typescript
POST: async ({ params, request }) => {
  try {
    // ... validation

    if (!photoExistsInGraph(photoId)) {
      throw ERROR_CODES.PHOTO_NOT_FOUND
    }

    // ... rest of logic

  } catch (error) {
    return handleAPIError(error)
  }
}
```

**✅ Validation:** Errors return consistent format with proper codes

---

## Step 6.6: Add Analytics

**Time:** 20 minutes

Create `src/lib/analytics.ts`:

```typescript
import { kv } from './kv'

export const analytics = {
  async trackNavigationRequest(sessionId: string, destination: string) {
    const key = `analytics:nav:${new Date().toISOString().split('T')[0]}`

    await kv.lpush(key, JSON.stringify({
      sessionId,
      destination,
      timestamp: Date.now()
    }))

    await kv.expire(key, 2592000) // 30 days
  },

  async trackNavigationComplete(sessionId: string, duration: number, steps: number) {
    const key = `analytics:complete:${new Date().toISOString().split('T')[0]}`

    await kv.lpush(key, JSON.stringify({
      sessionId,
      duration,
      steps,
      timestamp: Date.now()
    }))

    await kv.expire(key, 2592000)
  },

  async trackError(error: string, sessionId?: string) {
    const key = `analytics:errors:${new Date().toISOString().split('T')[0]}`

    await kv.lpush(key, JSON.stringify({
      error,
      sessionId,
      timestamp: Date.now()
    }))

    await kv.expire(key, 2592000)
  }
}
```

Add to API endpoints:

```typescript
// Track request
await analytics.trackNavigationRequest(sessionId, photoId)

// Track completion (in client via separate endpoint)
await analytics.trackNavigationComplete(sessionId, duration, steps)
```

**✅ Validation:** Analytics data appears in KV storage

---

## Step 6.7: Feature Flags

**Time:** 10 minutes

Create `src/lib/featureFlags.ts`:

```typescript
export const featureFlags = {
  aiNavigation: process.env.ENABLE_AI_NAVIGATION === 'true',
  analytics: process.env.ENABLE_ANALYTICS === 'true',
  debugMode: process.env.NODE_ENV === 'development'
}

export function isFeatureEnabled(feature: keyof typeof featureFlags): boolean {
  return featureFlags[feature] === true
}
```

Use in code:

```typescript
if (!isFeatureEnabled('aiNavigation')) {
  return json(
    { error: 'AI navigation is currently disabled' },
    { status: 503 }
  )
}
```

**✅ Validation:** Can disable features via environment variables

---

## Phase 6 Complete! 🎉

### Checklist Review

- [x] 6.1 - Create KV wrapper
- [x] 6.2 - Implement session token validation
- [x] 6.3 - Add rate limiting to API endpoints
- [x] 6.4 - Configure CORS for Copilot domains
- [x] 6.5 - Implement comprehensive error handling
- [x] 6.6 - Add analytics tracking
- [x] 6.7 - Create feature flags

---

## Next Steps

**Proceed to Phase 7:** [phase-7-testing-deployment.md](./phase-7-testing-deployment.md)

**Estimated time:** 3 hours
