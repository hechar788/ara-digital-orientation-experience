# VR Tour Image Preloading Implementation Plan

## Executive Summary

This document outlines a comprehensive preloading strategy to reduce scene transition times in the VR Campus Tour application from ~200ms (network download) to <16ms (instant) for 90%+ of navigation events.

**Current Performance:**
- Average scene transition: 200-1400ms (network-dependent)
- Total resources per navigation: ~24.8 MB
- User experience: Loading spinner on every navigation

**Target Performance:**
- Cache hit transitions: <16ms (instant texture swap)
- Cache miss transitions: 200-1400ms (unchanged from current)
- Expected cache hit rate: 90%+ for forward navigation
- Memory overhead: 5-10 MB (acceptable)

---

## Current Architecture Analysis

### Component Hierarchy

```
src/routes/index.tsx (App Root)
├── useTourNavigation() hook
│   ├── State: currentPhotoId, currentPhotoImage, isLoading
│   ├── Navigation: navigateDirection(), jumpToPhoto()
│   └── Camera: cameraLon, cameraLat, calculatedCameraAngle
│
├── PanoramicViewer
│   ├── Three.js scene setup (sphere geometry)
│   ├── Texture loading (THREE.TextureLoader)
│   ├── Camera controls (mouse/touch)
│   └── **ALREADY SUPPORTS photoImage prop!**
│
└── DirectionalNavigation
    └── Context-aware direction buttons
```

### Current Image Loading Flow

**useTourNavigation.ts (Lines 636-648):**
```typescript
const img = new Image()
img.onload = () => {
  setCurrentPhotoImage(img)           // Passed to PanoramicViewer
  setCurrentPhotoId(finalTargetId)
  setCalculatedCameraAngle(calculatedAngle)
  setIsLoading(false)
}
img.onerror = () => { /* error handling */ }
img.src = targetPhoto.imageUrl        // NETWORK REQUEST HERE
```

**PanoramicViewer.tsx (Lines 299-340):**
```typescript
// PRIMARY PATH: Use photoImage if available (instant!)
if (photoImage) {
  const texture = new THREE.Texture(photoImage)
  texture.needsUpdate = true
  sphere.material = new THREE.MeshBasicMaterial({ map: texture })
  // NO DOWNLOAD - instant texture creation!
}
// FALLBACK: Use TextureLoader (slow download)
else if (imageUrl) {
  loader.load(imageUrl, (texture) => { /* ... */ })
}
```

### Data Structure

**Photo Object (src/types/tour.ts):**
```typescript
interface Photo {
  id: string                    // e.g., 'n-f1-mid-7'
  imageUrl: string              // e.g., '/360_photos_compressed/.../n_mid_7.webp'
  startingAngle?: number
  directions: {
    forward?: DirectionDefinition      // { connection: 'n-f1-mid-8' }
    back?: DirectionDefinition
    left?: DirectionDefinition
    right?: DirectionDefinition
    forwardLeft?: DirectionDefinition
    forwardRight?: DirectionDefinition
    backLeft?: DirectionDefinition
    backRight?: DirectionDefinition
    // ... vertical directions
  }
}
```

**Key Insight:** Each photo's `directions` object contains all adjacent photo IDs we should preload!

---

## Implementation Strategy

### Approach: Adjacent Photo Preloading with LRU Cache

**Core Concept:**
1. When user navigates to a photo, **immediately preload all adjacent photos** in the background
2. Store preloaded `Image` objects in an LRU cache
3. When user navigates, check cache first before creating new Image
4. PanoramicViewer receives cached Image → instant texture creation

**Why This Works:**
- PanoramicViewer already supports instant Image-based loading (no code changes needed!)
- Directional connections provide natural preload targets
- LRU cache prevents memory bloat
- Graceful degradation on cache misses

### Architecture Components

```
┌─────────────────────────────────────────────────────────────┐
│                     useTourNavigation()                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  1. User navigates to photo A                         │  │
│  │  2. Check ImagePreloadCache for photo A               │  │
│  │     ├─ HIT:  Use cached Image (instant!)              │  │
│  │     └─ MISS: Create new Image (download)              │  │
│  │  3. After load, trigger preloadAdjacentPhotos(A)      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              useImagePreloader() Hook                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  preloadAdjacentPhotos(currentPhoto)                  │  │
│  │  ├─ Extract directional connections                   │  │
│  │  ├─ Prioritize: forward > left/right > back           │  │
│  │  ├─ Filter out already cached                         │  │
│  │  └─ Queue preload jobs (max 2-3 concurrent)           │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              ImagePreloadCache (LRU)                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Map<photoId, { image: Image, timestamp: number }>   │  │
│  │  Max size: 10 photos                                  │  │
│  │  Eviction: Least recently accessed                    │  │
│  │  Memory: ~10 MB (10 photos × 1 MB each)               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Detailed Implementation Steps

### Phase 1: Image Preload Cache Infrastructure

**File:** `src/lib/imagePreloadCache.ts`

**Responsibilities:**
- LRU cache management with Map-based storage
- Automatic eviction when cache size limit reached
- Memory cleanup (nullify Image references)
- Cache statistics (hit/miss rates for debugging)

**API Design:**
```typescript
class ImagePreloadCache {
  get(photoId: string): HTMLImageElement | null
  set(photoId: string, image: HTMLImageElement): void
  has(photoId: string): boolean
  delete(photoId: string): void
  clear(): void
  getStats(): { hits: number, misses: number, size: number }
}

// Singleton instance
export const imageCache = new ImagePreloadCache(10)  // max 10 photos
```

**Implementation Details:**
```typescript
interface CacheEntry {
  image: HTMLImageElement
  timestamp: number      // For LRU tracking
}

class ImagePreloadCache {
  private cache: Map<string, CacheEntry>
  private maxSize: number
  private stats = { hits: 0, misses: 0 }

  constructor(maxSize: number) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  get(photoId: string): HTMLImageElement | null {
    const entry = this.cache.get(photoId)
    if (entry) {
      // Update timestamp for LRU
      entry.timestamp = Date.now()
      this.stats.hits++
      return entry.image
    }
    this.stats.misses++
    return null
  }

  set(photoId: string, image: HTMLImageElement): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(photoId)) {
      this.evictOldest()
    }

    this.cache.set(photoId, {
      image,
      timestamp: Date.now()
    })
  }

  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Infinity

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      const entry = this.cache.get(oldestKey)
      // Clean up Image reference for garbage collection
      if (entry) {
        entry.image.src = ''
      }
      this.cache.delete(oldestKey)
    }
  }

  // ... other methods
}
```

---

### Phase 2: Preload Service Hook

**File:** `src/hooks/useImagePreloader.ts`

**Responsibilities:**
- Extract adjacent photo IDs from current photo's directions
- Priority-based preload queue management
- Concurrency control (max 2-3 simultaneous downloads)
- Abort incomplete preloads when user navigates away
- Integration with ImagePreloadCache

**API Design:**
```typescript
interface UseImagePreloaderReturn {
  preloadAdjacentPhotos: (photo: Photo) => void
  cancelAllPreloads: () => void
  getPreloadStatus: () => PreloadStatus
}

export function useImagePreloader(): UseImagePreloaderReturn
```

**Priority System:**
```typescript
enum PreloadPriority {
  FORWARD = 1,        // Highest - most likely navigation
  LATERAL = 2,        // Left/Right - secondary paths
  BACKWARD = 3,       // Back - return path
  DIAGONAL = 4        // ForwardLeft, BackRight, etc.
}

interface PreloadJob {
  photoId: string
  imageUrl: string
  priority: PreloadPriority
  abortController: AbortController
}
```

**Implementation Details:**
```typescript
export function useImagePreloader() {
  const preloadQueueRef = useRef<PreloadJob[]>([])
  const activePreloadsRef = useRef(0)
  const MAX_CONCURRENT = 2

  const preloadAdjacentPhotos = useCallback((currentPhoto: Photo) => {
    // Cancel any in-flight preloads
    cancelAllPreloads()

    // Extract adjacent photo IDs with priorities
    const jobs: PreloadJob[] = []

    // Priority 1: Forward directions
    if (currentPhoto.directions.forward) {
      jobs.push(createJob(currentPhoto.directions.forward.connection, PreloadPriority.FORWARD))
    }

    // Priority 2: Lateral directions
    if (currentPhoto.directions.left) {
      jobs.push(createJob(currentPhoto.directions.left.connection, PreloadPriority.LATERAL))
    }
    if (currentPhoto.directions.right) {
      jobs.push(createJob(currentPhoto.directions.right.connection, PreloadPriority.LATERAL))
    }

    // Priority 3: Backward direction
    if (currentPhoto.directions.back) {
      jobs.push(createJob(currentPhoto.directions.back.connection, PreloadPriority.BACKWARD))
    }

    // Priority 4: Diagonal directions
    if (currentPhoto.directions.forwardLeft) {
      jobs.push(createJob(currentPhoto.directions.forwardLeft.connection, PreloadPriority.DIAGONAL))
    }
    // ... other diagonals

    // Sort by priority and start preloading
    jobs.sort((a, b) => a.priority - b.priority)
    preloadQueueRef.current = jobs
    processPreloadQueue()
  }, [])

  const processPreloadQueue = useCallback(() => {
    while (activePreloadsRef.current < MAX_CONCURRENT && preloadQueueRef.current.length > 0) {
      const job = preloadQueueRef.current.shift()!
      startPreload(job)
    }
  }, [])

  const startPreload = useCallback((job: PreloadJob) => {
    // Skip if already cached
    if (imageCache.has(job.photoId)) {
      processPreloadQueue()
      return
    }

    // Find photo data
    const photo = findPhotoById(job.photoId)
    if (!photo) {
      processPreloadQueue()
      return
    }

    activePreloadsRef.current++

    const img = new Image()

    img.onload = () => {
      imageCache.set(job.photoId, img)
      activePreloadsRef.current--
      processPreloadQueue()
    }

    img.onerror = () => {
      console.warn(`Preload failed for ${job.photoId}`)
      activePreloadsRef.current--
      processPreloadQueue()
    }

    // Start download
    img.src = photo.imageUrl
  }, [])

  const cancelAllPreloads = useCallback(() => {
    // Clear queue
    preloadQueueRef.current = []
    // Note: Can't abort Image() downloads, but clearing queue prevents processing
  }, [])

  return {
    preloadAdjacentPhotos,
    cancelAllPreloads,
    getPreloadStatus: () => ({
      queueSize: preloadQueueRef.current.length,
      activeCount: activePreloadsRef.current
    })
  }
}

function createJob(photoId: string, priority: PreloadPriority): PreloadJob {
  const photo = findPhotoById(photoId)
  return {
    photoId,
    imageUrl: photo?.imageUrl || '',
    priority,
    abortController: new AbortController()
  }
}
```

---

### Phase 3: Integration with useTourNavigation

**File:** `src/hooks/useTourNavigation.ts`

**Modifications Required:**

#### 3.1: Import preload dependencies
```typescript
import { imageCache } from '../lib/imagePreloadCache'
import { useImagePreloader } from './useImagePreloader'
```

#### 3.2: Initialize preloader in hook
```typescript
export function useTourNavigation() {
  // ... existing state ...

  const { preloadAdjacentPhotos, cancelAllPreloads } = useImagePreloader()
```

#### 3.3: Modify navigateDirection() - Check cache first
```typescript
const navigateDirection = useCallback((direction: DirectionType) => {
  if (!currentPhoto || isLoading) return

  // ... existing direction resolution logic ...

  if (targetPhotoId) {
    setIsLoading(true)

    const finalTargetId = Array.isArray(targetPhotoId) ? targetPhotoId[0] : targetPhotoId
    const targetPhoto = findPhotoById(finalTargetId)

    if (targetPhoto) {
      // Calculate camera angle
      const navigationAnalysis = analyzeNavigation(currentPhoto, targetPhoto, direction)
      const calculatedAngle = calculateNavigationAngle(
        cameraLon,
        currentPhoto,
        targetPhoto,
        direction,
        navigationAnalysis.navigationType
      )

      // ⭐ CHECK CACHE FIRST ⭐
      const cachedImage = imageCache.get(finalTargetId)

      if (cachedImage) {
        // CACHE HIT - Instant transition!
        setCurrentPhotoImage(cachedImage)
        setCurrentPhotoId(finalTargetId)
        setCalculatedCameraAngle(calculatedAngle)
        setIsLoading(false)

        // Preload adjacent photos from new location
        preloadAdjacentPhotos(targetPhoto)
      } else {
        // CACHE MISS - Download as before
        const img = new Image()
        img.onload = () => {
          // Store in cache for future use
          imageCache.set(finalTargetId, img)

          setCurrentPhotoImage(img)
          setCurrentPhotoId(finalTargetId)
          setCalculatedCameraAngle(calculatedAngle)
          setIsLoading(false)

          // Preload adjacent photos from new location
          preloadAdjacentPhotos(targetPhoto)
        }
        img.onerror = () => {
          setCurrentPhotoImage(null)
          setIsLoading(false)
          console.error('Failed to load image:', targetPhoto.imageUrl)
        }
        img.src = targetPhoto.imageUrl
      }
    } else {
      setIsLoading(false)
      console.error('Target photo not found:', finalTargetId)
    }
  }
}, [currentPhoto, isLoading, cameraLon, preloadAdjacentPhotos])
```

#### 3.4: Modify jumpToPhoto() - Same cache check
```typescript
const jumpToPhoto = useCallback((photoId: string) => {
  if (isLoading || photoId === currentPhotoId) return

  const targetPhoto = findPhotoById(photoId)
  if (targetPhoto) {
    setIsLoading(true)

    // ⭐ CHECK CACHE FIRST ⭐
    const cachedImage = imageCache.get(photoId)

    if (cachedImage) {
      // CACHE HIT - Instant transition!
      setCurrentPhotoImage(cachedImage)
      setCurrentPhotoId(photoId)
      setCalculatedCameraAngle(targetPhoto.startingAngle)
      setIsLoading(false)

      // Preload adjacent photos
      preloadAdjacentPhotos(targetPhoto)
    } else {
      // CACHE MISS - Download as before
      const img = new Image()
      img.onload = () => {
        imageCache.set(photoId, img)

        setCurrentPhotoImage(img)
        setCurrentPhotoId(photoId)
        setCalculatedCameraAngle(targetPhoto.startingAngle)
        setIsLoading(false)

        preloadAdjacentPhotos(targetPhoto)
      }
      img.onerror = () => {
        setCurrentPhotoImage(null)
        setIsLoading(false)
        console.error('Failed to load image:', targetPhoto.imageUrl)
      }
      img.src = targetPhoto.imageUrl
    }
  } else {
    console.error('Photo not found:', photoId)
  }
}, [currentPhotoId, isLoading, preloadAdjacentPhotos])
```

#### 3.5: Cleanup on unmount
```typescript
useEffect(() => {
  // Cleanup on unmount
  return () => {
    cancelAllPreloads()
  }
}, [cancelAllPreloads])
```

---

### Phase 4: Optional Enhancements

#### 4.1: Preload initial photo's adjacent scenes on app mount
```typescript
// In useTourNavigation()
useEffect(() => {
  if (currentPhoto) {
    preloadAdjacentPhotos(currentPhoto)
  }
}, []) // Only on mount
```

#### 4.2: Cache size tuning based on device memory
```typescript
// In imagePreloadCache.ts
function getOptimalCacheSize(): number {
  // @ts-ignore - navigator.deviceMemory is not in all browsers
  const deviceMemory = navigator.deviceMemory || 4 // Default to 4GB

  if (deviceMemory >= 8) return 15  // High-end devices
  if (deviceMemory >= 4) return 10  // Mid-range devices
  return 5                          // Low-end devices
}

export const imageCache = new ImagePreloadCache(getOptimalCacheSize())
```

#### 4.3: Development mode cache statistics
```typescript
// In useTourNavigation() or App component
if (import.meta.env.DEV) {
  useEffect(() => {
    const interval = setInterval(() => {
      const stats = imageCache.getStats()
      console.log(`[Cache Stats] Hits: ${stats.hits}, Misses: ${stats.misses}, Hit Rate: ${(stats.hits / (stats.hits + stats.misses) * 100).toFixed(1)}%, Size: ${stats.size}`)
    }, 10000) // Log every 10 seconds

    return () => clearInterval(interval)
  }, [])
}
```

---

## Performance Metrics & Testing

### Expected Performance Improvements

**Before Preloading:**
```
Navigation Event Timeline:
├── User clicks "Forward"                    t=0ms
├── Image download starts                    t=0ms
├── Network latency + download              t=0-1400ms (variable)
├── Image decoded                           t=1400-1450ms
├── THREE.Texture created                   t=1450-1455ms
└── Scene rendered                          t=1455ms
TOTAL: ~1500ms average (with spinner)
```

**After Preloading (Cache Hit):**
```
Navigation Event Timeline:
├── User clicks "Forward"                    t=0ms
├── Cache lookup                            t=0-1ms
├── THREE.Texture created from cached Image t=1-5ms
└── Scene rendered                          t=5-10ms
TOTAL: ~10ms average (instant!)
```

### Testing Checklist

#### Unit Tests
- [ ] ImagePreloadCache LRU eviction logic
- [ ] ImagePreloadCache get/set operations
- [ ] ImagePreloadCache stats tracking
- [ ] useImagePreloader priority queue sorting
- [ ] useImagePreloader concurrency limiting

#### Integration Tests
- [ ] Cache hit path in navigateDirection()
- [ ] Cache miss path in navigateDirection()
- [ ] Preloading triggered after navigation
- [ ] Multiple rapid navigations don't break cache
- [ ] Memory cleanup on component unmount

#### Performance Tests
- [ ] Measure cache hit rate over 50 navigation events
- [ ] Measure transition time (cache hit vs miss)
- [ ] Memory usage monitoring (DevTools Memory profiler)
- [ ] Network waterfall analysis (preload timing)
- [ ] Mobile device performance (low-memory scenarios)

#### User Acceptance Tests
- [ ] Forward navigation feels instant
- [ ] Lateral navigation (left/right) preloaded
- [ ] No degradation on slow network connections
- [ ] No visible spinner on cache hits
- [ ] Smooth transitions on cache misses (unchanged UX)

### Development Testing Commands

```bash
# Run development server with cache statistics
npm run dev

# Monitor cache in browser console:
# - Cache hits/misses logged every 10 seconds
# - Look for "[Cache Stats]" prefix

# Performance profiling in Chrome DevTools:
# 1. Open Performance tab
# 2. Start recording
# 3. Navigate 10+ times
# 4. Stop recording
# 5. Look for "navigateDirection" calls
# 6. Measure time between user action and scene render

# Memory profiling:
# 1. Open Memory tab
# 2. Take heap snapshot
# 3. Navigate 20+ times
# 4. Take another heap snapshot
# 5. Compare snapshots - should see ~10 cached Images
# 6. Check for memory leaks (no unbounded growth)
```

---

## Rollout Plan

### Phase 1: Development & Testing (Week 1)
- [ ] Implement ImagePreloadCache (Day 1-2)
- [ ] Implement useImagePreloader hook (Day 2-3)
- [ ] Integrate with useTourNavigation (Day 3-4)
- [ ] Unit test coverage (Day 4-5)
- [ ] Performance testing (Day 5)

### Phase 2: Code Review & Refinement (Week 2)
- [ ] Code review with team
- [ ] Address feedback
- [ ] Integration testing
- [ ] Edge case handling
- [ ] Documentation updates

### Phase 3: Staging Deployment (Week 2-3)
- [ ] Deploy to staging environment
- [ ] User acceptance testing
- [ ] Performance monitoring in production-like environment
- [ ] Mobile device testing (iOS/Android)
- [ ] Network throttling tests (3G/4G)

### Phase 4: Production Deployment (Week 3)
- [ ] Feature flag deployment (gradual rollout)
- [ ] Monitor analytics:
  - Average transition time
  - Cache hit rate
  - Error rates
  - Memory usage (via browser telemetry)
- [ ] Gradual rollout: 10% → 50% → 100%
- [ ] Rollback plan if issues detected

### Phase 5: Optimization (Week 4)
- [ ] Analyze production metrics
- [ ] Tune cache size based on real usage
- [ ] Adjust preload priorities if needed
- [ ] Consider adding predictive preloading
- [ ] Documentation finalization

---

## Risk Analysis & Mitigation

### Risk 1: Memory Consumption
**Severity:** Medium
**Probability:** Low
**Impact:** Browser slowdown or crash on low-memory devices

**Mitigation:**
- LRU eviction policy limits cache to 10 photos max (~10 MB)
- Device memory detection adjusts cache size dynamically
- Aggressive cleanup on eviction (nullify Image.src)
- Monitor memory usage in production analytics

### Risk 2: Network Saturation
**Severity:** Low
**Probability:** Low
**Impact:** Slower preloads interfere with user-initiated navigation

**Mitigation:**
- Max 2-3 concurrent preloads
- Priority queue ensures critical paths loaded first
- Cancel in-flight preloads on new navigation
- Preloads use background priority (browser-dependent)

### Risk 3: Stale Cache
**Severity:** Low
**Probability:** Very Low
**Impact:** User sees old image version after server update

**Mitigation:**
- Browser HTTP cache handles versioning
- Image URLs include content hashes (Vite build)
- Cache cleared on page refresh
- Deployment strategy uses cache-busting URLs

### Risk 4: Cache Miss on Fast Navigation
**Severity:** Low
**Probability:** Medium
**Impact:** User experiences normal loading time (not worse than current)

**Mitigation:**
- Graceful degradation - cache miss = current behavior
- No user-facing errors
- Loading spinner still shown
- Cache warms up over time

### Risk 5: Implementation Bugs
**Severity:** Medium
**Probability:** Medium
**Impact:** Navigation broken, app unusable

**Mitigation:**
- Comprehensive unit/integration tests
- Staging environment testing
- Feature flag for gradual rollout
- Monitoring and alerting
- Immediate rollback capability

---

## Success Metrics

### Primary KPIs
- **Cache Hit Rate:** Target 90%+ for forward navigation
- **Transition Time (Cache Hit):** Target <20ms
- **Transition Time (Cache Miss):** Baseline maintained (~200-1400ms)
- **Memory Usage:** Peak <15 MB overhead

### Secondary KPIs
- **User Engagement:** Increased session duration
- **Navigation Events:** Increased navigation frequency
- **Bounce Rate:** Decreased bounce rate
- **Error Rate:** No increase in navigation errors

### Monitoring Dashboard
```typescript
// Analytics events to track
analytics.track('vr_navigation', {
  cacheHit: boolean,
  transitionTime: number,
  photoId: string,
  direction: string,
  cacheSize: number
})

// Aggregated metrics
- Average transition time (cache hit vs miss)
- Cache hit rate by direction type
- Memory usage percentiles (p50, p95, p99)
- Navigation error rate
```

---

## Future Enhancements

### Predictive Preloading
Analyze user navigation patterns to preload more aggressively:
```typescript
// Track: User goes forward 80% of the time in hallways
// Preload 2 photos ahead instead of just 1
if (isInHallway && forwardProbability > 0.7) {
  preloadDepth = 2
}
```

### Service Worker Integration
Persistent cache across sessions:
```typescript
// Service Worker caches images permanently
// First visit: normal loading
// Second visit: instant from Service Worker cache
```

### Progressive Image Loading
Load low-res thumbnail first, swap to HD:
```typescript
// Preload 50KB thumbnail immediately
// Preload full 1MB image in background
// Swap when HD ready (optional enhancement)
```

### Network-Aware Preloading
Adjust preload strategy based on network speed:
```typescript
if (navigator.connection.effectiveType === '4g') {
  maxConcurrent = 4
  preloadAllDirections = true
} else if (navigator.connection.effectiveType === '3g') {
  maxConcurrent = 1
  preloadForwardOnly = true
}
```

---

## Conclusion

This preloading implementation provides:
- ✅ **90%+ instant transitions** for typical navigation patterns
- ✅ **Zero breaking changes** to existing functionality
- ✅ **Minimal memory overhead** (<10 MB typical)
- ✅ **Graceful degradation** on cache misses
- ✅ **Production-ready** with monitoring and rollback plans

The architecture leverages existing PanoramicViewer optimization (photoImage prop) and the natural graph structure of photo connections to deliver near-instant scene transitions with minimal code complexity.

**Estimated Implementation Time:** 2-3 weeks
**Estimated Performance Gain:** 10-100x faster transitions (cache hits)
**Risk Level:** Low (graceful degradation, comprehensive testing)