# VR Tour Image Preloading - Detailed Implementation Plan

## Executive Summary

This document provides a complete, step-by-step implementation guide for the image preloading system. It addresses all identified gaps and provides exact integration points with the current codebase.

**Performance Target:**
- Cache hit transitions: <16ms (instant)
- Cache hit rate: 90%+ for forward navigation
- Memory overhead: 5-10 MB
- Zero breaking changes to existing functionality

---

## Phase 1: Foundation & Type Definitions

### Step 1.1: Create TypeScript Type Definitions

**File:** `src/types/preload.ts` (NEW FILE)

**Purpose:** Centralize all preloading-related types for type safety and IDE support

```typescript
/**
 * VR Tour Image Preloading Type Definitions
 *
 * Defines types for the preloading system including cache entries,
 * preload jobs, and status tracking.
 */

/**
 * Priority levels for preload jobs
 * Lower number = higher priority
 */
export enum PreloadPriority {
  FORWARD = 1,        // Highest - forward navigation directions
  LATERAL = 2,        // Left/Right - common secondary paths
  BACKWARD = 3,       // Back - return navigation
  DIAGONAL = 4,       // ForwardLeft, BackRight, etc.
  VERTICAL = 5        // Up/Down/Elevator - vertical navigation
}

/**
 * Represents a single preload job in the queue
 *
 * @property photoId - Target photo ID to preload
 * @property imageUrl - URL of the image to download
 * @property priority - Priority level for queue ordering
 * @property abortController - Controller for aborting download (future enhancement)
 */
export interface PreloadJob {
  photoId: string
  imageUrl: string
  priority: PreloadPriority
  abortController?: AbortController
}

/**
 * Entry stored in the LRU cache
 *
 * @property image - Preloaded HTMLImageElement
 * @property timestamp - Last access time for LRU eviction
 * @property size - Estimated size in bytes (optional)
 */
export interface CacheEntry {
  image: HTMLImageElement
  timestamp: number
  size?: number
}

/**
 * Cache statistics for monitoring and debugging
 *
 * @property hits - Number of successful cache hits
 * @property misses - Number of cache misses
 * @property size - Current number of entries in cache
 * @property evictions - Total number of evictions performed
 */
export interface CacheStats {
  hits: number
  misses: number
  size: number
  evictions: number
}

/**
 * Current preload status
 *
 * @property queueSize - Number of jobs waiting to be processed
 * @property activeCount - Number of currently downloading images
 * @property isPreloading - Whether preloading is currently active
 */
export interface PreloadStatus {
  queueSize: number
  activeCount: number
  isPreloading: boolean
}
```

**Integration:** This file has no dependencies and will be imported by cache and preloader implementations.

---

### Step 1.2: Create Direction Connection Helper Utility

**File:** `src/lib/directionUtils.ts` (NEW FILE)

**Purpose:** Handle the inconsistency between string-based and DirectionDefinition-based connections

**Why needed:** Photo directions use two different structures:
- Horizontal: `{ connection: 'photo-id' }` (DirectionDefinition)
- Vertical: `'photo-id'` or `['photo-id-1', 'photo-id-2']` (string/array)

```typescript
/**
 * Direction Connection Utility Functions
 *
 * Handles extraction of photo IDs from different direction formats
 * in the VR tour data structure.
 */

import type { Photo, DirectionType } from '../types/tour'
import type { DirectionDefinition } from '../types/tour'

/**
 * Extracts connection photo ID(s) from a direction, handling all formats
 *
 * Handles three cases:
 * 1. DirectionDefinition object: { connection: 'id' }
 * 2. String: 'photo-id'
 * 3. Array: ['photo-id-1', 'photo-id-2']
 *
 * @param direction - Direction value to extract from (can be DirectionDefinition, string, or array)
 * @returns Photo ID(s) or null if direction is undefined
 *
 * @example
 * ```typescript
 * // DirectionDefinition
 * getConnectionId({ connection: 'a-f1-mid-5' }) // Returns: 'a-f1-mid-5'
 *
 * // String (vertical navigation)
 * getConnectionId('elevator-ns-1') // Returns: 'elevator-ns-1'
 *
 * // Array (multiple elevators)
 * getConnectionId(['elevator-1', 'elevator-2']) // Returns: ['elevator-1', 'elevator-2']
 * ```
 */
export function getConnectionId(
  direction: DirectionDefinition | string | string[] | undefined
): string | string[] | null {
  if (!direction) return null

  // String format (vertical navigation)
  if (typeof direction === 'string') {
    return direction
  }

  // Array format (multiple connections)
  if (Array.isArray(direction)) {
    return direction
  }

  // DirectionDefinition format (horizontal navigation)
  if (typeof direction === 'object' && 'connection' in direction) {
    return direction.connection
  }

  return null
}

/**
 * Extracts all adjacent photo IDs from a photo's directions
 *
 * Iterates through all direction types and extracts connection IDs,
 * flattening arrays and filtering out nulls.
 *
 * @param photo - Photo to extract adjacent IDs from
 * @param includeVertical - Whether to include vertical navigation (up/down/elevator)
 * @returns Array of unique adjacent photo IDs
 *
 * @example
 * ```typescript
 * const adjacentIds = getAdjacentPhotoIds(photo, true)
 * // Returns: ['a-f1-mid-6', 'a-f1-mid-4', 'a-f1-south-2', 'elevator-ns-1']
 * ```
 */
export function getAdjacentPhotoIds(
  photo: Photo,
  includeVertical: boolean = true
): string[] {
  const photoIds: string[] = []

  // Horizontal directions
  const horizontalDirs: DirectionType[] = [
    'forward', 'forwardRight', 'right', 'backRight',
    'back', 'backLeft', 'left', 'forwardLeft'
  ]

  for (const dir of horizontalDirs) {
    const connectionId = getConnectionId(photo.directions[dir])
    if (connectionId) {
      if (Array.isArray(connectionId)) {
        photoIds.push(...connectionId)
      } else {
        photoIds.push(connectionId)
      }
    }
  }

  // Vertical directions (if requested)
  if (includeVertical) {
    const verticalDirs: DirectionType[] = ['up', 'down', 'elevator', 'door']

    for (const dir of verticalDirs) {
      const connectionId = getConnectionId(photo.directions[dir])
      if (connectionId) {
        if (Array.isArray(connectionId)) {
          photoIds.push(...connectionId)
        } else {
          photoIds.push(connectionId)
        }
      }
    }
  }

  // Return unique IDs only
  return Array.from(new Set(photoIds))
}
```

**Integration:** This utility will be used by the preloader to safely extract photo IDs from any direction type.

---

## Phase 2: Image Preload Cache Infrastructure

### Step 2.1: Implement LRU Cache

**File:** `src/lib/imagePreloadCache.ts` (NEW FILE)

**Purpose:** Manage preloaded images with automatic LRU eviction and memory cleanup

```typescript
/**
 * LRU Image Preload Cache
 *
 * Manages preloaded HTMLImageElement objects with automatic eviction
 * based on Least Recently Used (LRU) strategy.
 */

import type { CacheEntry, CacheStats } from '../types/preload'

/**
 * LRU cache for preloaded images
 *
 * Features:
 * - Automatic eviction when size limit reached
 * - LRU eviction policy (oldest accessed entry removed first)
 * - Proper memory cleanup (nullifies image references)
 * - Statistics tracking for debugging and monitoring
 */
class ImagePreloadCache {
  private cache: Map<string, CacheEntry>
  private maxSize: number
  private stats: CacheStats

  /**
   * Creates a new image preload cache
   *
   * @param maxSize - Maximum number of images to cache (default: 10)
   */
  constructor(maxSize: number = 10) {
    this.cache = new Map()
    this.maxSize = maxSize
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      evictions: 0
    }
  }

  /**
   * Retrieves a cached image by photo ID
   *
   * Updates the timestamp for LRU tracking on successful retrieval.
   *
   * @param photoId - Photo ID to retrieve
   * @returns Cached HTMLImageElement or null if not found
   */
  get(photoId: string): HTMLImageElement | null {
    const entry = this.cache.get(photoId)

    if (entry) {
      // Update timestamp for LRU (most recently accessed)
      entry.timestamp = Date.now()
      this.cache.set(photoId, entry) // Update Map with new timestamp
      this.stats.hits++

      console.log(`[ImageCache] HIT for ${photoId} (${this.cache.size}/${this.maxSize} cached)`)
      return entry.image
    }

    this.stats.misses++
    console.log(`[ImageCache] MISS for ${photoId}`)
    return null
  }

  /**
   * Stores an image in the cache
   *
   * Evicts oldest entry if cache is at capacity.
   *
   * @param photoId - Photo ID to cache
   * @param image - HTMLImageElement to store
   */
  set(photoId: string, image: HTMLImageElement): void {
    // If entry already exists, just update it
    if (this.cache.has(photoId)) {
      this.cache.set(photoId, {
        image,
        timestamp: Date.now()
      })
      return
    }

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    // Add new entry
    this.cache.set(photoId, {
      image,
      timestamp: Date.now()
    })

    this.stats.size = this.cache.size
    console.log(`[ImageCache] SET ${photoId} (${this.cache.size}/${this.maxSize} cached)`)
  }

  /**
   * Checks if a photo ID is in the cache
   *
   * @param photoId - Photo ID to check
   * @returns True if cached, false otherwise
   */
  has(photoId: string): boolean {
    return this.cache.has(photoId)
  }

  /**
   * Removes an entry from the cache
   *
   * @param photoId - Photo ID to remove
   */
  delete(photoId: string): void {
    const entry = this.cache.get(photoId)
    if (entry) {
      this.cleanupImage(entry.image)
      this.cache.delete(photoId)
      this.stats.size = this.cache.size
      console.log(`[ImageCache] DELETE ${photoId}`)
    }
  }

  /**
   * Clears all entries from the cache
   */
  clear(): void {
    // Cleanup all images
    for (const entry of this.cache.values()) {
      this.cleanupImage(entry.image)
    }

    this.cache.clear()
    this.stats.size = 0
    console.log('[ImageCache] CLEAR - all entries removed')
  }

  /**
   * Gets current cache statistics
   *
   * @returns Cache statistics object
   */
  getStats(): CacheStats {
    return {
      ...this.stats,
      size: this.cache.size
    }
  }

  /**
   * Evicts the least recently used entry from the cache
   *
   * @private
   */
  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Infinity

    // Find entry with oldest timestamp
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      const entry = this.cache.get(oldestKey)
      if (entry) {
        this.cleanupImage(entry.image)
      }
      this.cache.delete(oldestKey)
      this.stats.evictions++

      console.log(`[ImageCache] EVICT ${oldestKey} (age: ${Date.now() - oldestTime}ms)`)
    }
  }

  /**
   * Properly cleans up an image element for garbage collection
   *
   * Nullifies all references to prevent memory leaks.
   *
   * @private
   * @param image - Image element to cleanup
   */
  private cleanupImage(image: HTMLImageElement): void {
    // Clear event handlers to prevent memory leaks
    image.onload = null
    image.onerror = null
    // Clear src to release blob URL if used
    image.src = ''
  }
}

/**
 * Determines optimal cache size based on device memory
 *
 * Uses navigator.deviceMemory API (Chrome/Edge only) to adjust cache size.
 * Falls back to conservative default for unsupported browsers.
 *
 * @returns Recommended cache size (number of images)
 */
function getOptimalCacheSize(): number {
  // @ts-ignore - navigator.deviceMemory is not in all browsers
  const deviceMemory = navigator.deviceMemory || 4 // Default to 4GB

  if (deviceMemory >= 8) return 15  // High-end devices (8GB+ RAM)
  if (deviceMemory >= 4) return 10  // Mid-range devices (4-8GB RAM)
  return 5                          // Low-end devices (<4GB RAM)
}

/**
 * Singleton instance of the image preload cache
 *
 * Import and use this instance throughout the application.
 *
 * @example
 * ```typescript
 * import { imageCache } from '../lib/imagePreloadCache'
 *
 * const cachedImage = imageCache.get('photo-id')
 * if (cachedImage) {
 *   // Use cached image
 * }
 * ```
 */
export const imageCache = new ImagePreloadCache(getOptimalCacheSize())
```

**Integration:** This cache is a singleton that will be imported by both the preloader hook and the navigation hook.

---

## Phase 3: Preload Service Hook

### Step 3.1: Implement useImagePreloader Hook

**File:** `src/hooks/useImagePreloader.ts` (NEW FILE)

**Purpose:** Background preloading service with priority queue management

```typescript
/**
 * Image Preloader Hook
 *
 * Manages background preloading of adjacent photos with priority-based
 * queue management and concurrency control.
 */

import { useCallback, useRef } from 'react'
import { findPhotoById } from '../data/tourUtilities'
import { imageCache } from '../lib/imagePreloadCache'
import { getConnectionId } from '../lib/directionUtils'
import type { Photo, DirectionType } from '../types/tour'
import type { PreloadJob, PreloadStatus, PreloadPriority } from '../types/preload'
import { PreloadPriority as Priority } from '../types/preload'

/**
 * Hook return value
 */
interface UseImagePreloaderReturn {
  preloadAdjacentPhotos: (photo: Photo) => void
  cancelAllPreloads: () => void
  getPreloadStatus: () => PreloadStatus
}

/**
 * Custom hook for preloading adjacent photos in the background
 *
 * Features:
 * - Priority-based queue (forward > lateral > backward > diagonal > vertical)
 * - Concurrency control (max 2-3 simultaneous downloads)
 * - Automatic cache integration
 * - Download tracking and cancellation
 *
 * @returns Preload control functions
 *
 * @example
 * ```typescript
 * const { preloadAdjacentPhotos, cancelAllPreloads } = useImagePreloader()
 *
 * // After navigation
 * preloadAdjacentPhotos(currentPhoto)
 *
 * // On unmount
 * cancelAllPreloads()
 * ```
 */
export function useImagePreloader(): UseImagePreloaderReturn {
  const preloadQueueRef = useRef<PreloadJob[]>([])
  const activePreloadsRef = useRef<Map<string, boolean>>(new Map())
  const MAX_CONCURRENT = 2 // Conservative to avoid bandwidth saturation

  /**
   * Preloads all adjacent photos from the current photo
   *
   * Extracts connections from all directions, prioritizes them,
   * and queues for background download.
   *
   * @param currentPhoto - Photo to preload adjacent photos from
   */
  const preloadAdjacentPhotos = useCallback((currentPhoto: Photo) => {
    console.log(`\n[Preloader] Starting preload for ${currentPhoto.id}`)

    // Cancel any in-flight preloads from previous location
    cancelAllPreloads()

    const jobs: PreloadJob[] = []

    // Priority 1: Forward directions
    const forwardDirs: DirectionType[] = ['forward', 'forwardLeft', 'forwardRight']
    for (const dir of forwardDirs) {
      const connectionId = getConnectionId(currentPhoto.directions[dir])
      if (connectionId) {
        addJobsForConnection(connectionId, Priority.FORWARD, jobs)
      }
    }

    // Priority 2: Lateral directions
    const lateralDirs: DirectionType[] = ['left', 'right']
    for (const dir of lateralDirs) {
      const connectionId = getConnectionId(currentPhoto.directions[dir])
      if (connectionId) {
        addJobsForConnection(connectionId, Priority.LATERAL, jobs)
      }
    }

    // Priority 3: Backward directions
    const backwardDirs: DirectionType[] = ['back', 'backLeft', 'backRight']
    for (const dir of backwardDirs) {
      const connectionId = getConnectionId(currentPhoto.directions[dir])
      if (connectionId) {
        addJobsForConnection(connectionId, Priority.BACKWARD, jobs)
      }
    }

    // Priority 4: Diagonal directions (if any additional diagonal variants exist)
    // Note: forwardLeft/forwardRight already covered, backLeft/backRight already covered
    // This section is for future diagonal directions if added

    // Priority 5: Vertical navigation
    const verticalDirs: DirectionType[] = ['up', 'down', 'elevator', 'door']
    for (const dir of verticalDirs) {
      const connectionId = getConnectionId(currentPhoto.directions[dir])
      if (connectionId) {
        addJobsForConnection(connectionId, Priority.VERTICAL, jobs)
      }
    }

    // Special handling for elevator floors (floor1, floor2, floor3, floor4)
    const floorDirs: DirectionType[] = ['floor1', 'floor2', 'floor3', 'floor4']
    for (const dir of floorDirs) {
      const connectionId = getConnectionId(currentPhoto.directions[dir])
      if (connectionId) {
        addJobsForConnection(connectionId, Priority.VERTICAL, jobs)
      }
    }

    // Sort by priority (lower number = higher priority)
    jobs.sort((a, b) => a.priority - b.priority)

    preloadQueueRef.current = jobs
    console.log(`[Preloader] Queued ${jobs.length} jobs:`, jobs.map(j => `${j.photoId}(P${j.priority})`).join(', '))

    processPreloadQueue()
  }, [])

  /**
   * Helper to create preload jobs for a connection ID (string or array)
   *
   * @param connectionId - Photo ID(s) to preload
   * @param priority - Priority level for the job
   * @param jobs - Jobs array to append to
   */
  function addJobsForConnection(
    connectionId: string | string[],
    priority: PreloadPriority,
    jobs: PreloadJob[]
  ): void {
    const ids = Array.isArray(connectionId) ? connectionId : [connectionId]

    for (const id of ids) {
      const photo = findPhotoById(id)
      if (photo) {
        jobs.push({
          photoId: id,
          imageUrl: photo.imageUrl,
          priority
        })
      }
    }
  }

  /**
   * Processes the preload queue up to max concurrency
   *
   * Starts downloads for queued jobs while respecting concurrency limit.
   * Called recursively as downloads complete.
   */
  const processPreloadQueue = useCallback(() => {
    while (
      activePreloadsRef.current.size < MAX_CONCURRENT &&
      preloadQueueRef.current.length > 0
    ) {
      const job = preloadQueueRef.current.shift()!
      startPreload(job)
    }
  }, [])

  /**
   * Starts a single preload job
   *
   * Skips if already cached or actively downloading.
   *
   * @param job - Preload job to execute
   */
  const startPreload = useCallback((job: PreloadJob) => {
    // Skip if already cached
    if (imageCache.has(job.photoId)) {
      console.log(`[Preloader] ${job.photoId} already cached, skipping`)
      processPreloadQueue()
      return
    }

    // Skip if already downloading (race condition prevention)
    if (activePreloadsRef.current.has(job.photoId)) {
      console.log(`[Preloader] ${job.photoId} already downloading, skipping`)
      processPreloadQueue()
      return
    }

    // Mark as active
    activePreloadsRef.current.set(job.photoId, true)
    console.log(`[Preloader] Starting download: ${job.photoId} (Priority ${job.priority})`)

    const img = new Image()

    img.onload = () => {
      // Only cache if download completed (not cancelled)
      if (activePreloadsRef.current.has(job.photoId)) {
        imageCache.set(job.photoId, img)
        console.log(`[Preloader] ✓ Completed: ${job.photoId}`)
      } else {
        console.log(`[Preloader] ✗ Cancelled (too late): ${job.photoId}`)
      }

      activePreloadsRef.current.delete(job.photoId)
      processPreloadQueue()
    }

    img.onerror = () => {
      console.warn(`[Preloader] ✗ Failed: ${job.photoId}`)
      activePreloadsRef.current.delete(job.photoId)
      processPreloadQueue()
    }

    // Start download
    img.src = job.imageUrl
  }, [processPreloadQueue])

  /**
   * Cancels all in-flight preloads
   *
   * Note: Cannot abort Image() downloads, but we mark them as cancelled
   * so their onload handlers don't cache the result.
   */
  const cancelAllPreloads = useCallback(() => {
    if (preloadQueueRef.current.length > 0 || activePreloadsRef.current.size > 0) {
      console.log(`[Preloader] Cancelling ${preloadQueueRef.current.length} queued, ${activePreloadsRef.current.size} active`)
    }

    // Clear queue
    preloadQueueRef.current = []
    // Clear active tracking (downloads will complete but won't be cached)
    activePreloadsRef.current.clear()
  }, [])

  /**
   * Gets current preload status
   *
   * @returns Current queue and download status
   */
  const getPreloadStatus = useCallback((): PreloadStatus => {
    return {
      queueSize: preloadQueueRef.current.length,
      activeCount: activePreloadsRef.current.size,
      isPreloading: preloadQueueRef.current.length > 0 || activePreloadsRef.current.size > 0
    }
  }, [])

  return {
    preloadAdjacentPhotos,
    cancelAllPreloads,
    getPreloadStatus
  }
}
```

**Integration:** This hook will be initialized in `useTourNavigation` and called after each navigation event.

---

## Phase 4: Navigation Integration

### Step 4.1: Refactor useTourNavigation for Cache Integration

**File:** `src/hooks/useTourNavigation.ts` (MODIFY EXISTING)

**Changes required:**

#### 4.1.1: Add imports at top of file (after line 10)

```typescript
// Existing imports
import { DIRECTION_ANGLES } from '../types/tour'

// ADD THESE IMPORTS:
import { imageCache } from '../lib/imagePreloadCache'
import { useImagePreloader } from './useImagePreloader'
```

#### 4.1.2: Initialize preloader in hook (after line 567)

```typescript
export function useTourNavigation() {
  // ... existing state declarations ...
  const [currentPhotoImage, setCurrentPhotoImage] = useState<HTMLImageElement | null>(null)

  // ADD THIS:
  const { preloadAdjacentPhotos, cancelAllPreloads } = useImagePreloader()
```

#### 4.1.3: Create shared cache loading helper (add after line 538, before useTourNavigation)

```typescript
/**
 * Shared helper to load a photo with cache fallback
 *
 * Checks cache first for instant loading, falls back to network download.
 * Stores downloaded images in cache for future use.
 *
 * @param photoId - Photo ID to load
 * @param targetPhoto - Photo object with imageUrl
 * @param calculatedAngle - Camera angle to set (optional)
 * @param onSuccess - Callback when image loads
 * @param onError - Callback when image fails to load
 */
function loadPhotoWithCache(
  photoId: string,
  targetPhoto: Photo,
  calculatedAngle: number | undefined,
  onSuccess: (image: HTMLImageElement, photoId: string, angle: number | undefined) => void,
  onError: () => void
): void {
  // Check cache first
  const cachedImage = imageCache.get(photoId)

  if (cachedImage) {
    // CACHE HIT - Instant transition!
    console.log(`[Navigation] ⚡ Cache HIT for ${photoId} - instant load`)
    onSuccess(cachedImage, photoId, calculatedAngle)
    return
  }

  // CACHE MISS - Download from network
  console.log(`[Navigation] 🌐 Cache MISS for ${photoId} - downloading...`)
  const img = new Image()

  img.onload = () => {
    // Store in cache for future use
    imageCache.set(photoId, img)
    onSuccess(img, photoId, calculatedAngle)
  }

  img.onerror = () => {
    console.error('Failed to load image:', targetPhoto.imageUrl)
    onError()
  }

  img.src = targetPhoto.imageUrl
}
```

#### 4.1.4: Replace navigateDirection implementation (lines 601-654)

**REPLACE the entire navigateDirection callback with:**

```typescript
const navigateDirection = useCallback((direction: DirectionType) => {
  if (!currentPhoto || isLoading) return

  let targetPhotoId: string | string[] | undefined

  // Handle new directions interface for horizontal movement (8 directions)
  if (direction === 'forward' || direction === 'forwardRight' || direction === 'right' || direction === 'backRight' ||
      direction === 'back' || direction === 'backLeft' || direction === 'left' || direction === 'forwardLeft') {
    const directionDef = currentPhoto.directions[direction]
    targetPhotoId = directionDef?.connection
  } else {
    // Handle vertical movement (up/down), elevator, and floor selection
    targetPhotoId = currentPhoto.directions[direction]
  }

  if (targetPhotoId) {
    setIsLoading(true)

    // Handle array of connections if needed
    const finalTargetId = Array.isArray(targetPhotoId) ? targetPhotoId[0] : targetPhotoId

    // Preload image before navigation
    const targetPhoto = findPhotoById(finalTargetId)
    if (targetPhoto) {
      // Calculate camera orientation for navigation using comprehensive analysis
      const navigationAnalysis = analyzeNavigation(currentPhoto, targetPhoto, direction)
      const calculatedAngle = calculateNavigationAngle(
        cameraLon,
        currentPhoto,
        targetPhoto,
        direction,
        navigationAnalysis.navigationType
      )

      // Use shared cache loading helper
      loadPhotoWithCache(
        finalTargetId,
        targetPhoto,
        calculatedAngle,
        (image, photoId, angle) => {
          // Success callback
          setCurrentPhotoImage(image)
          setCurrentPhotoId(photoId)
          setCalculatedCameraAngle(angle)
          setIsLoading(false)

          // Trigger preload for adjacent photos from new location
          preloadAdjacentPhotos(targetPhoto)
        },
        () => {
          // Error callback
          setCurrentPhotoImage(null)
          setIsLoading(false)
        }
      )
    } else {
      setIsLoading(false)
      console.error('Target photo not found:', finalTargetId)
    }
  }
}, [currentPhoto, isLoading, cameraLon, preloadAdjacentPhotos])
```

#### 4.1.5: Replace jumpToPhoto implementation (lines 664-688)

**REPLACE the entire jumpToPhoto callback with:**

```typescript
const jumpToPhoto = useCallback((photoId: string) => {
  if (isLoading || photoId === currentPhotoId) return

  const targetPhoto = findPhotoById(photoId)
  if (targetPhoto) {
    setIsLoading(true)

    // Use shared cache loading helper
    loadPhotoWithCache(
      photoId,
      targetPhoto,
      targetPhoto.startingAngle, // For direct jumps, always use startingAngle
      (image, photoId, angle) => {
        // Success callback
        setCurrentPhotoImage(image)
        setCurrentPhotoId(photoId)
        setCalculatedCameraAngle(angle)
        setIsLoading(false)

        // Trigger preload for adjacent photos
        preloadAdjacentPhotos(targetPhoto)
      },
      () => {
        // Error callback
        setCurrentPhotoImage(null)
        setIsLoading(false)
      }
    )
  } else {
    console.error('Photo not found:', photoId)
  }
}, [currentPhotoId, isLoading, preloadAdjacentPhotos])
```

#### 4.1.6: Add initial preload effect (add after jumpToPhoto, around line 690)

```typescript
/**
 * Preload adjacent photos when current photo loads or changes
 *
 * Triggers preloading when:
 * 1. Initial photo loads on app mount
 * 2. User navigates to a new photo
 */
useEffect(() => {
  if (currentPhoto && !isLoading) {
    // Small delay to ensure navigation has completed
    const timer = setTimeout(() => {
      preloadAdjacentPhotos(currentPhoto)
    }, 100)

    return () => clearTimeout(timer)
  }
}, [currentPhoto?.id, isLoading, preloadAdjacentPhotos])

/**
 * Cleanup preloads on unmount
 */
useEffect(() => {
  return () => {
    cancelAllPreloads()
  }
}, [cancelAllPreloads])
```

**Integration complete.** The navigation hook now:
1. Checks cache before downloading
2. Uses shared helper to eliminate duplication
3. Triggers preloading after each navigation
4. Cleans up on unmount

---

## Phase 5: Development Monitoring & Debugging

### Step 5.1: Add Development Cache Statistics

**File:** `src/routes/index.tsx` (MODIFY EXISTING)

Add cache statistics display in development mode (after line 93, in the debug panel):

```typescript
// After existing debug info
<div className="mt-2 text-xs opacity-75">
  Use WASD or arrow keys to navigate<br/>
  Q/E for up/down stairs
</div>

{/* ADD THIS SECTION: */}
{import.meta.env.DEV && (
  <CacheStatsDisplay />
)}
```

**Create CacheStatsDisplay component:**

**File:** `src/components/debug/CacheStatsDisplay.tsx` (NEW FILE)

```typescript
/**
 * Cache Statistics Display Component
 *
 * Shows real-time cache performance metrics in development mode.
 */

import { useState, useEffect } from 'react'
import { imageCache } from '../../lib/imagePreloadCache'

export function CacheStatsDisplay() {
  const [stats, setStats] = useState(imageCache.getStats())

  useEffect(() => {
    // Update stats every 2 seconds
    const interval = setInterval(() => {
      setStats(imageCache.getStats())
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const hitRate = stats.hits + stats.misses > 0
    ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="mt-3 pt-3 border-t border-white/20">
      <div className="text-xs font-semibold mb-1">Cache Stats</div>
      <div className="text-xs space-y-0.5">
        <div>Hit Rate: {hitRate}% ({stats.hits}/{stats.hits + stats.misses})</div>
        <div>Cached: {stats.size} images</div>
        <div>Evictions: {stats.evictions}</div>
      </div>
    </div>
  )
}
```

### Step 5.2: Add Console Logging Toggle

**File:** `src/lib/imagePreloadCache.ts` (MODIFY)

Add at top of file:

```typescript
// Development logging control
const DEV_LOGGING = import.meta.env.DEV

// Replace all console.log calls with:
if (DEV_LOGGING) console.log(...)
```

Same for `src/hooks/useImagePreloader.ts`

---

## Phase 6: Testing Strategy

### Step 6.1: Manual Testing Checklist

**Test Scenarios:**

1. **Cache Hit Path**
   - [ ] Navigate forward → Navigate back → Should be instant
   - [ ] Check console for "Cache HIT" message
   - [ ] Verify no network request in DevTools Network tab

2. **Cache Miss Path**
   - [ ] Jump to distant photo → Should download normally
   - [ ] Check console for "Cache MISS" message
   - [ ] Verify network request occurs

3. **Preload Triggers**
   - [ ] Navigate to photo → Check console for "Starting preload"
   - [ ] Verify adjacent photos downloading in Network tab (look for parallel requests)
   - [ ] Verify max 2 concurrent downloads

4. **Priority Ordering**
   - [ ] Navigate to photo with all directions → Check console preload queue
   - [ ] Verify forward direction preloaded first
   - [ ] Verify vertical directions preloaded last

5. **Elevator Handling**
   - [ ] Enter elevator → Verify all floor photos queued for preload
   - [ ] Select floor → Should be instant if preload completed

6. **Memory Management**
   - [ ] Navigate 20+ times → Check cache stats
   - [ ] Verify cache size stays at limit (10-15 images)
   - [ ] Verify evictions occur
   - [ ] Open DevTools Memory profiler → Take heap snapshot
   - [ ] Navigate 20 more times → Take another snapshot
   - [ ] Compare: should see stable memory, no unbounded growth

7. **Race Condition Handling**
   - [ ] Rapidly navigate forward/back 10 times
   - [ ] Verify no duplicate downloads
   - [ ] Verify no state corruption
   - [ ] Check console for "already downloading, skipping"

8. **Network Throttling**
   - [ ] DevTools → Network → Throttle to "Fast 3G"
   - [ ] Navigate forward → back → forward
   - [ ] First navigation slow, return should be instant
   - [ ] Verify preloads don't block user navigation

### Step 6.2: Browser Compatibility Testing

**Browsers to test:**

1. **Chrome/Edge** (primary target)
   - [ ] Desktop Windows
   - [ ] Desktop macOS
   - [ ] Android mobile

2. **Firefox**
   - [ ] Desktop
   - [ ] Android mobile

3. **Safari** (critical for iOS)
   - [ ] macOS desktop
   - [ ] iOS mobile (iPhone/iPad)
   - [ ] Note: navigator.deviceMemory not supported → should use default cache size

4. **Safari Memory Limits**
   - [ ] iOS Safari: Navigate 30+ times on iPhone
   - [ ] Monitor for browser crashes
   - [ ] If crashes occur, reduce default cache size from 10 → 5

### Step 6.3: Performance Profiling

**Chrome DevTools Performance:**

1. Open Performance tab
2. Start recording
3. Navigate 10 times (mix of cache hits and misses)
4. Stop recording
5. Analyze:
   - [ ] Cache hits: Look for <20ms between user action and scene render
   - [ ] Cache misses: Should match baseline performance
   - [ ] No dropped frames during navigation
   - [ ] Preload activity visible in background

**Network Waterfall:**

1. Open Network tab
2. Navigate to photo with 8 directions
3. Verify:
   - [ ] User-initiated download completes first
   - [ ] Preload downloads start after user download
   - [ ] Max 2 concurrent preload downloads
   - [ ] No preload downloads when all photos cached

---

## Phase 7: Production Deployment

### Step 7.1: Feature Flag Setup (Optional)

**File:** `src/lib/featureFlags.ts` (NEW FILE)

```typescript
/**
 * Feature flags for gradual rollout
 */

export const FEATURE_FLAGS = {
  PRELOADING_ENABLED: import.meta.env.VITE_PRELOADING_ENABLED !== 'false'
}
```

**Modify useImagePreloader.ts:**

```typescript
import { FEATURE_FLAGS } from '../lib/featureFlags'

export function useImagePreloader(): UseImagePreloaderReturn {
  // ... existing code ...

  const preloadAdjacentPhotos = useCallback((currentPhoto: Photo) => {
    // Feature flag check
    if (!FEATURE_FLAGS.PRELOADING_ENABLED) {
      console.log('[Preloader] Feature disabled')
      return
    }

    // ... rest of implementation ...
  }, [])
}
```

**Environment variable (.env.production):**

```bash
# Disable preloading for gradual rollout
VITE_PRELOADING_ENABLED=false

# Enable after validation
# VITE_PRELOADING_ENABLED=true
```

### Step 7.2: Deployment Checklist

**Pre-deployment:**

- [ ] All manual tests passing
- [ ] Browser compatibility confirmed
- [ ] Memory profiling shows stable usage
- [ ] Cache hit rate ≥70% in testing
- [ ] No console errors in production build
- [ ] Network tab shows expected behavior

**Deployment steps:**

1. **Initial deploy (feature disabled):**
   ```bash
   VITE_PRELOADING_ENABLED=false npm run build
   npm run deploy
   ```

2. **Monitor baseline metrics** (1-2 days)

3. **Enable for 10% of users:**
   - Use CDN edge logic or A/B testing framework
   - Monitor:
     - Average navigation time
     - Error rates
     - Browser crash reports

4. **Gradual rollout:**
   - 10% → 1 day monitoring
   - 50% → 2 days monitoring
   - 100% → Full rollout

5. **Rollback plan:**
   - Set `VITE_PRELOADING_ENABLED=false`
   - Redeploy immediately
   - Cache will gracefully degrade to normal downloads

### Step 7.3: Monitoring & Alerts

**Key metrics to track:**

1. **Cache Performance**
   - Hit rate (target: ≥90% for forward nav)
   - Average transition time
   - Preload queue size

2. **Error Tracking**
   - Image load failures
   - Memory warnings
   - Browser crashes (via Sentry/similar)

3. **User Experience**
   - Session duration (should increase)
   - Navigation frequency (should increase)
   - Bounce rate (should decrease)

**Alert thresholds:**

- Cache hit rate <70% → Investigate
- Error rate >1% → Investigate
- Browser crash rate >0.1% → Rollback

---

## Success Criteria

**Performance targets:**

- ✅ Cache hit transitions: <20ms
- ✅ Cache hit rate: ≥90% for forward navigation
- ✅ Memory overhead: <15 MB
- ✅ No increase in error rate
- ✅ No browser crashes

**Code quality:**

- ✅ Zero code duplication
- ✅ Full TypeScript type safety
- ✅ Comprehensive error handling
- ✅ Proper memory cleanup
- ✅ Clean separation of concerns

**User experience:**

- ✅ Instant transitions for cached photos
- ✅ No degradation for cache misses
- ✅ Graceful degradation on low-memory devices
- ✅ Works across all major browsers

---

## Implementation Timeline

**Week 1: Foundation (Days 1-2)**
- Day 1 AM: Create type definitions (`preload.ts`, `directionUtils.ts`)
- Day 1 PM: Implement `ImagePreloadCache` with tests
- Day 2 AM: Implement `useImagePreloader` hook
- Day 2 PM: Integration with `useTourNavigation`

**Week 1: Testing (Days 3-5)**
- Day 3: Manual testing all scenarios
- Day 4: Browser compatibility testing
- Day 5: Performance profiling and optimization

**Week 2: Deployment (Days 1-5)**
- Day 1: Production build and staging deploy
- Day 2-3: Staging validation and monitoring
- Day 4: Production deploy (10% rollout)
- Day 5: Monitor and adjust

**Week 2: Rollout (Days 6-10)**
- Day 6-7: 50% rollout with monitoring
- Day 8-10: 100% rollout and final validation

---

## Appendix: File Checklist

**New files to create:**

- [ ] `src/types/preload.ts`
- [ ] `src/lib/directionUtils.ts`
- [ ] `src/lib/imagePreloadCache.ts`
- [ ] `src/hooks/useImagePreloader.ts`
- [ ] `src/components/debug/CacheStatsDisplay.tsx`
- [ ] `src/lib/featureFlags.ts` (optional)

**Existing files to modify:**

- [ ] `src/hooks/useTourNavigation.ts` (major refactor)
- [ ] `src/routes/index.tsx` (add debug display)

**Files to leave unchanged:**

- ✅ `src/components/viewer/PanoramicViewer.tsx` (already supports photoImage)
- ✅ `src/data/tourUtilities.ts` (has findPhotoById)
- ✅ `src/types/tour.ts` (all types exist)

---

## Summary

This implementation plan provides a complete, step-by-step guide to add preloading with:

1. **Proper foundation** - Type definitions and utilities handle all edge cases
2. **Robust caching** - LRU eviction with proper memory cleanup
3. **Smart preloading** - Priority-based queue with concurrency control
4. **Clean integration** - Shared helper eliminates duplication
5. **Comprehensive testing** - Manual, performance, and compatibility testing
6. **Safe deployment** - Feature flags and gradual rollout strategy

The architecture leverages existing codebase strengths:
- `findPhotoById` for photo lookup
- `photoImage` prop for instant rendering
- Direction connections for adjacent photo discovery
- Existing navigation flow with minimal changes

Expected outcome: **90%+ instant transitions** with <10 MB memory overhead and zero breaking changes.
