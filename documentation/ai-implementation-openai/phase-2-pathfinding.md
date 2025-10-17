# Phase 2: BFS Pathfinding Algorithm

**Duration:** 45 minutes  
**Difficulty:** Medium  
**Prerequisites:** Phase 1 complete (OpenAI setup)

---

## Objectives

By the end of this phase, you will have:

1. ✅ Understood the existing campus graph structure
2. ✅ Implemented `src/lib/pathfinding.ts` with a documented BFS solution
3. ✅ Added helper utilities for descriptions, timing, and validation
4. ✅ Written automated tests covering common navigation scenarios
5. ✅ Verified manual and performance checks for sub-10 ms responses

---

## Why Pathfinding First?

Implementing navigation before AI keeps the scope tight:

- Independent module that can be exercised without OpenAI calls
- Leverages a known, unweighted graph (perfect for BFS)
- Provides the core primitive Phase 4 will consume
- Enables fast iteration to validate campus data issues early

Architecture flow:

```
Phase 2 (this module) → Phase 4 (AI + navigation) → later chat UI phases
```

---

## Step 2.1: Understand the Campus Graph

**Time:** 5 minutes

### Inspect Existing Data

1. Open `src/types/tour.ts` and locate the `Photo` interface:
   ```typescript
   export interface Photo {
     id: string
     directions: {
       forward?: DirectionDefinition
       back?: DirectionDefinition
       left?: DirectionDefinition
       right?: DirectionDefinition
       up?: string | string[]
       down?: string | string[]
       elevator?: string | string[]
       door?: string | string[]
       floor1?: string
       floor2?: string
       floor3?: string
       floor4?: string
     }
   }
   ```
2. Each photo is a node, and every connection is a directed edge with weight 1.
3. Browse `src/data/blocks/a_block/floor1.ts` (and neighbours) to see real IDs.

**Graph quick facts**

| Metric | Value | Impact |
| --- | --- | --- |
| Nodes | ~225 photos | BFS remains fast |
| Edges | ~475 directed links | Dense enough for navigation |
| Weighting | Unweighted | Shortest path guaranteed with BFS |
| Components | Single connected | No special casing needed |

✅ **Validation:** Identify three sample photo IDs and their immediate neighbors in the data files.

---

## Step 2.2: Implement the Pathfinding Module

**Time:** 25 minutes

### Create the file

```bash
mkdir -p src/lib
touch src/lib/pathfinding.ts
```

### Add the BFS implementation

Replace the file with the code below. It includes JSDoc for every export, deterministic BFS, helper utilities, and zero inline comments per project standards.

```typescript
import { findPhotoById } from '../data/blockUtils'
import type { DirectionDefinition, DirectionType, Photo } from '../types/tour'

const HORIZONTAL_DIRECTIONS: DirectionType[] = [
  'forward',
  'forwardRight',
  'right',
  'backRight',
  'back',
  'backLeft',
  'left',
  'forwardLeft'
]

const MULTI_VALUE_DIRECTIONS: Array<'up' | 'down' | 'elevator' | 'door'> = [
  'up',
  'down',
  'elevator',
  'door'
]

const FLOOR_DIRECTIONS: Array<'floor1' | 'floor2' | 'floor3' | 'floor4'> = [
  'floor1',
  'floor2',
  'floor3',
  'floor4'
]

const DEFAULT_SECONDS_PER_STEP = 0.8

const BUILDING_NAMES: Record<string, string> = {
  a: 'A Block',
  n: 'N Block',
  s: 'S Block',
  x: 'X Block',
  w: 'W Block',
  library: 'Library',
  outside: 'Outside Campus'
}

function isDirectionDefinition(value: unknown): value is DirectionDefinition {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  return 'connection' in (value as Record<string, unknown>)
}

/**
 * Result returned by the BFS pathfinding routine.
 *
 * Captures the ordered list of locations the user should visit along with
 * metadata the UI and AI layers use to render guidance.
 *
 * @property path - Ordered array of photo IDs from start to destination (inclusive)
 * @property distance - Number of steps between the start and destination
 * @property startId - Photo ID supplied as the path origin
 * @property endId - Photo ID supplied as the path target
 */
export interface PathfindingResult {
  path: string[]
  distance: number
  startId: string
  endId: string
}

/**
 * Compute the shortest path between two campus photos using BFS.
 *
 * Walks the unweighted campus graph breadth-first, guaranteeing the first
 * destination hit is the optimal route. Returns null when either endpoint
 * does not exist or no route is possible.
 *
 * @param startPhotoId - Existing photo ID where the visitor currently stands
 * @param endPhotoId - Existing photo ID the visitor wants to reach
 * @returns A populated pathfinding result or null when no route is available
 *
 * @example
 * ```typescript
 * const result = findPath('a-f1-north-entrance', 'library-f1-entrance')
 * if (result) {
 *   console.log(result.path)
 * }
 * ```
 */
export function findPath(
  startPhotoId: string,
  endPhotoId: string
): PathfindingResult | null {
  if (startPhotoId === endPhotoId) {
    return {
      path: [startPhotoId],
      distance: 0,
      startId: startPhotoId,
      endId: endPhotoId
    }
  }

  const startPhoto = findPhotoById(startPhotoId)
  const endPhoto = findPhotoById(endPhotoId)

  if (!startPhoto || !endPhoto) {
    return null
  }

  const queue: string[] = [startPhotoId]
  const visited = new Set(queue)
  const parent = new Map<string, string>()

  while (queue.length > 0) {
    const currentId = queue.shift()
    if (!currentId) {
      continue
    }

    if (currentId === endPhotoId) {
      const path = reconstructPath(parent, startPhotoId, endPhotoId)
      if (path.length === 0) {
        return null
      }

      return {
        path,
        distance: path.length - 1,
        startId: startPhotoId,
        endId: endPhotoId
      }
    }

    const currentPhoto = findPhotoById(currentId)
    if (!currentPhoto) {
      continue
    }

    const neighbors = getNeighborIds(currentPhoto)
    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) {
        continue
      }

      visited.add(neighbor)
      parent.set(neighbor, currentId)
      queue.push(neighbor)
    }
  }

  return null
}

function getNeighborIds(photo: Photo): string[] {
  const directConnections = HORIZONTAL_DIRECTIONS
    .map((direction) => photo.directions[direction])
    .filter(isDirectionDefinition)
    .map((definition) => definition.connection)

  const multiConnections = MULTI_VALUE_DIRECTIONS.flatMap((direction) => {
    const entry = photo.directions[direction]
    if (!entry) {
      return []
    }

    return Array.isArray(entry) ? entry : [entry]
  })

  const floorConnections = FLOOR_DIRECTIONS.flatMap((direction) => {
    const entry = photo.directions[direction]
    if (!entry) {
      return []
    }

    return [entry]
  })

  return Array.from(new Set([...directConnections, ...multiConnections, ...floorConnections]))
}

function reconstructPath(
  parent: Map<string, string>,
  startId: string,
  endId: string
): string[] {
  const path: string[] = [endId]
  let current = endId

  while (current !== startId) {
    const next = parent.get(current)
    if (!next) {
      return []
    }

    current = next
    path.unshift(current)
  }

  return path
}

function formatLocationSegment(photoId: string, photo: Photo | null): string {
  const tokens = photoId.split('-')
  const buildingToken = tokens[0]
  const floorToken = tokens[1]
  const buildingLabel = buildingToken ? BUILDING_NAMES[buildingToken] ?? buildingToken.toUpperCase() : null
  const floorLabel = floorToken ? floorToken.toUpperCase() : null
  const label = [buildingLabel, floorLabel].filter(Boolean).join(' ')
  const wing = photo?.buildingContext?.wing

  if (label && wing) {
    return `${label} (${wing})`
  }

  if (label) {
    return label
  }

  return photo?.id ?? photoId
}

/**
 * Produce a friendly sentence summarising the route.
 *
 * Intended for AI chat responses and UI breadcrumbs so visitors understand
 * how many steps are required and which areas they will traverse.
 *
 * @param result - Valid pathfinding result returned from `findPath`
 * @returns Human-readable string describing the route distance and endpoints
 *
 * @example
 * ```typescript
 * const description = getRouteDescription(result)
 * // "Route found: 3 steps from A Block F1 to Library F1."
 * ```
 */
export function getRouteDescription(result: PathfindingResult): string {
  const startPhoto = findPhotoById(result.startId)
  const endPhoto = findPhotoById(result.endId)
  const startLabel = formatLocationSegment(result.startId, startPhoto)
  const endLabel = formatLocationSegment(result.endId, endPhoto)

  if (result.distance === 0) {
    return `You are already at ${endLabel}.`
  }

  const stepLabel = result.distance === 1 ? '1 step' : `${result.distance} steps`
  return `Route found: ${stepLabel} from ${startLabel} to ${endLabel}.`
}

/**
 * Estimate traversal time for the calculated route.
 *
 * Assumes an average walking speed through indoor corridors and returns both
 * the raw seconds value and a formatted label for display.
 *
 * @param result - Valid pathfinding result returned from `findPath`
 * @param secondsPerStep - Average number of seconds per navigation step
 * @returns Object containing raw seconds and a formatted label
 *
 * @example
 * ```typescript
 * const { seconds, formatted } = getEstimatedTravelTime(result)
 * // seconds = 10.4, formatted = "10.4s"
 * ```
 */
export function getEstimatedTravelTime(
  result: PathfindingResult,
  secondsPerStep: number = DEFAULT_SECONDS_PER_STEP
): { seconds: number; formatted: string } {
  const seconds = Math.max(0, result.distance * secondsPerStep)
  const formatted =
    seconds < 60
      ? `${seconds.toFixed(1)}s`
      : `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`

  return { seconds, formatted }
}

/**
 * Verify that a pathfinding result is structurally sound.
 *
 * Ensures the start and end IDs align, every intermediate photo exists,
 * and each hop follows a valid edge in the campus graph.
 *
 * @param result - Pathfinding result to validate
 * @returns Boolean indicating whether the route is valid
 *
 * @example
 * ```typescript
 * if (!validatePath(result)) {
 *   throw new Error('Path is invalid')
 * }
 * ```
 */
export function validatePath(result: PathfindingResult): boolean {
  if (!result.path.length) {
    return false
  }

  if (result.path[0] !== result.startId) {
    return false
  }

  if (result.path[result.path.length - 1] !== result.endId) {
    return false
  }

  for (const photoId of result.path) {
    if (!findPhotoById(photoId)) {
      return false
    }
  }

  for (let index = 0; index < result.path.length - 1; index += 1) {
    const currentPhoto = findPhotoById(result.path[index])
    const nextId = result.path[index + 1]
    if (!currentPhoto) {
      return false
    }

    const neighbors = getNeighborIds(currentPhoto)
    if (!neighbors.includes(nextId)) {
      return false
    }
  }

  return true
}
```

✅ **Validation:** `npm run build` passes type-checking without errors.

---

## Step 2.3: Write Unit Tests

**Time:** 10 minutes

### Create the test file

```bash
mkdir -p src/lib/__tests__
touch src/lib/__tests__/pathfinding.test.ts
```

### Add coverage for core behaviours

Copy the following tests. They assert adjacency, multi-step routes, cross-building navigation, validation, descriptions, and performance.

```typescript
import { performance } from 'node:perf_hooks'
import { describe, expect, test } from 'vitest'
import {
  findPath,
  getEstimatedTravelTime,
  getRouteDescription,
  validatePath
} from '../pathfinding'

describe('pathfinding', () => {
  test('finds path between adjacent photos', () => {
    const result = findPath('a-f1-north-entrance', 'a-f1-north-1')
    expect(result).not.toBeNull()
    expect(result!.distance).toBe(1)
    expect(validatePath(result!)).toBe(true)
  })

  test('returns single-node path when already at destination', () => {
    const result = findPath('a-f1-north-entrance', 'a-f1-north-entrance')
    expect(result).not.toBeNull()
    expect(result!.path).toEqual(['a-f1-north-entrance'])
    expect(result!.distance).toBe(0)
    expect(getRouteDescription(result!)).toMatch(/already at/i)
  })

  test('returns null for invalid start or end photos', () => {
    expect(findPath('invalid-photo', 'a-f1-north-entrance')).toBeNull()
    expect(findPath('a-f1-north-entrance', 'invalid-photo')).toBeNull()
  })

  test('navigates across multiple photos', () => {
    const result = findPath('a-f1-north-entrance', 'a-f1-mid-5')
    expect(result).not.toBeNull()
    expect(result!.distance).toBeGreaterThan(1)
    expect(result!.path[0]).toBe('a-f1-north-entrance')
    expect(result!.path[result!.path.length - 1]).toBe('a-f1-mid-5')
    expect(validatePath(result!)).toBe(true)
  })

  test('navigates between buildings', () => {
    const result = findPath('a-f1-north-entrance', 'library-f1-entrance')
    expect(result).not.toBeNull()
    expect(result!.path[0]).toBe('a-f1-north-entrance')
    expect(result!.path[result!.path.length - 1]).toBe('library-f1-entrance')
    expect(getRouteDescription(result!)).toMatch(/Route found:/)
  })

  test('handles vertical transitions', () => {
    const result = findPath('library-f1-entrance', 'library-f2-entrance')
    expect(result).not.toBeNull()
    expect(result!.distance).toBeGreaterThanOrEqual(1)
    expect(validatePath(result!)).toBe(true)
  })

  test('estimates travel time based on path distance', () => {
    const result = findPath('a-f1-north-entrance', 'a-f1-north-1')
    expect(result).not.toBeNull()
    const { seconds, formatted } = getEstimatedTravelTime(result!)
    expect(seconds).toBeCloseTo(0.8, 1)
    expect(formatted).toMatch(/s$/)
  })

  test('completes long routes quickly', () => {
    const started = performance.now()
    const result = findPath('a-f1-north-entrance', 'w-gym-entry')
    const elapsed = performance.now() - started

    expect(result).not.toBeNull()
    expect(elapsed).toBeLessThan(50)
    expect(validatePath(result!)).toBe(true)
  })
})
```

### Run the targeted suite

```bash
npm run test -- pathfinding
```

✅ **Validation:** All tests in `pathfinding.test.ts` pass, taking <200 ms.

---

## Step 2.4: Manual Smoke Test (Optional but Recommended)

**Time:** 5 minutes

Create a temporary script at project root (`test-pathfinding.ts`) to visualise the route.

```typescript
import {
  findPath,
  getEstimatedTravelTime,
  getRouteDescription
} from './src/lib/pathfinding'

function logResult(startId: string, endId: string) {
  const result = findPath(startId, endId)

  if (!result) {
    console.log(`No route found between ${startId} and ${endId}.`)
    return
  }

  const estimate = getEstimatedTravelTime(result)

  console.log('='.repeat(60))
  console.log(`Start: ${result.startId}`)
  console.log(`End:   ${result.endId}`)
  console.log(getRouteDescription(result))
  console.log(`Estimated travel time: ${estimate.formatted}`)
  console.log('Path:')
  result.path.forEach((photoId, index) => {
    console.log(`  ${index + 1}. ${photoId}`)
  })
  console.log('='.repeat(60))
  console.log('')
}

logResult('a-f1-north-entrance', 'a-f1-north-1')
logResult('a-f1-north-entrance', 'library-f1-entrance')
logResult('library-f1-entrance', 'library-f2-entrance')
```

Run it:

```bash
npx tsx test-pathfinding.ts
```

Sample output:

```
============================================================
Start: a-f1-north-entrance
End:   library-f1-entrance
Route found: 14 steps from A Block F1 to Library F1.
Estimated travel time: 11.2s
Path:
  1. a-f1-north-entrance
  2. a-f1-north-1
  ...
 14. library-f1-entrance
============================================================
```

Cleanup when finished:

```bash
rm test-pathfinding.ts
```

✅ **Validation:** Output lists consistent routes and reasonable time estimates.

---

## Step 2.5: Performance Check

**Time:** 2 minutes

- Use the performance test above or wrap `findPath` calls with `console.time`.
- On a cold run, expect <10 ms; subsequent runs should be even faster due to module caching.
- If results exceed 50 ms, inspect `getNeighborIds` for unexpected allocations.

✅ **Validation:** Logged execution time remains below 10 ms for typical routes.

---

## Phase 2 Complete! 🎉

### Checklist Review

- [x] Campus graph structure reviewed and understood
- [x] `src/lib/pathfinding.ts` implemented with documented BFS helpers
- [x] Automated tests created and passing
- [x] Manual smoke test verified real routes
- [x] Performance confirmed under 10 ms

### What You Accomplished

- Delivered a production-ready BFS navigation engine with robust helpers
- Added route descriptions and travel time estimates to support AI messaging
- Ensured correctness with validation logic and Vitest coverage
- Confirmed the campus data supports multi-building and multi-floor travel

### Files Touched

```
src/lib/pathfinding.ts
src/lib/__tests__/pathfinding.test.ts
```

---

## Troubleshooting

**Tests failing with “photo not found”**  
Ensure you copied valid IDs from `src/data/blocks/**`. Typos are the most common culprit.

**`validatePath` returning false**  
Check for one-way edges. Some photos require adding the reverse connection to the data files.

**Performance over 50 ms**  
Run `console.log(getNeighborIds(photo))` inside `findPath` to spot unusually large adjacency lists or cycles introduced by bad data.

**TypeScript import errors**  
Confirm `findPhotoById` is exported from `src/data/blockUtils.ts` and your relative import path is `../data/blockUtils`.

---

## Next Steps

Proceed to [Phase 3 – Basic AI Server Function](./phase-3-basic-ai.md) to wire this module into the OpenAI function call pipeline.

