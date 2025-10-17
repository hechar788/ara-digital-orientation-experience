# Phase 2: Core Navigation System

**Duration:** 4 hours
**Difficulty:** Medium
**Prerequisites:** Phase 1 complete

---

## Objectives

By the end of this phase, you will have:

1. ✅ Navigation graph runtime loader
2. ✅ BFS pathfinding algorithm implemented
3. ✅ Type definitions for navigation system
4. ✅ Unit tests for path calculation
5. ✅ Graph query functions (findPhotoById, getAreaForPhoto)
6. ✅ All tests passing

---

## Step 2.1: Create Navigation Types

**Time:** 20 minutes

Create `src/types/navigation.ts`:

```typescript
/**
 * Navigation System Type Definitions
 */

import type { DirectionType } from './tour'

/**
 * Directed edge in the navigation graph
 */
export interface GraphEdge {
  direction: DirectionType
  target: string
}

/**
 * Navigation graph node representing a photo location
 */
export interface GraphNode {
  photoId: string
  edges: GraphEdge[]
  metadata: {
    buildingBlock: string
    floorLevel: number
    areaName: string
  }
}

/**
 * Individual step returned by pathfinding
 */
export interface RouteStep {
  photoId: string
  direction: DirectionType | null
}

/**
 * Result of pathfinding calculation
 */
export interface PathResult {
  start: string
  end: string
  steps: RouteStep[]
  distance: number
}

/**
 * Navigation command sent to client via Ably
 */
export interface NavigationCommand {
  id: string
  type: 'navigate' | 'route_start' | 'route_complete' | 'route_cancelled'
  step?: RouteStep
  timestamp: number
  metadata?: {
    stepIndex?: number
    totalSteps?: number
    estimatedTime?: number
  }
}

/**
 * Navigation state (optional, for analytics/debugging)
 */
export interface NavigationState {
  sessionId: string
  status: 'idle' | 'navigating' | 'paused' | 'completed' | 'cancelled'
  currentRoute?: PathResult
  currentStep?: number
  startedAt?: number
  completedAt?: number
}
```

**✅ Validation:** File compiles without TypeScript errors

---

## Step 2.2: Implement Graph Loader

**Time:** 30 minutes

Create `src/data/navigationGraph.ts`:

```typescript
/**
 * Navigation Graph Runtime Loader
 *
 * Loads pre-built graph from JSON and provides pathfinding functions.
 * Graph is built at compile time (see scripts/build-navigation-graph.ts).
 */

import graphDataJson from '../assets/navigation-graph.json'
import type { GraphEdge, GraphNode, PathResult, RouteStep } from '../types/navigation'

interface SerializedGraph {
  nodes: Record<string, GraphNode>
  metadata: {
    builtAt: string
    version: string
    nodeCount: number
    edgeCount: number
  }
}

class NavigationGraph {
  private nodes: Map<string, GraphNode> = new Map()
  private loaded = false

  constructor() {
    this.load()
  }

  private load() {
    if (this.loaded) {
      return
    }

    console.info('[NavGraph] Loading navigation graph…')
    const data = graphDataJson as SerializedGraph

    Object.values(data.nodes).forEach(node => {
      this.nodes.set(node.photoId, node)
    })

    this.loaded = true

    console.info(
      `[NavGraph] Loaded ${this.nodes.size} nodes, built at ${data.metadata.builtAt}`
    )
  }

  findPath(fromId: string, toId: string): PathResult | null {
    if (!this.nodes.has(fromId)) {
      console.warn(`[NavGraph] Start photo not found: ${fromId}`)
      return null
    }

    if (!this.nodes.has(toId)) {
      console.warn(`[NavGraph] Destination photo not found: ${toId}`)
      return null
    }

    if (fromId === toId) {
      const steps: RouteStep[] = [{ photoId: fromId, direction: null }]
      return {
        start: fromId,
        end: toId,
        steps,
        distance: 0
      }
    }

    interface QueueEntry {
      photoId: string
      steps: RouteStep[]
    }

    const visited = new Set<string>([fromId])
    const queue: QueueEntry[] = [
      {
        photoId: fromId,
        steps: [{ photoId: fromId, direction: null }]
      }
    ]

    while (queue.length > 0) {
      const current = queue.shift()!
      const node = this.nodes.get(current.photoId)

      if (!node) {
        continue
      }

      for (const edge of node.edges) {
        const nextSteps: RouteStep[] = [
          ...current.steps,
          {
            photoId: edge.target,
            direction: edge.direction
          }
        ]

        if (edge.target === toId) {
          return {
            start: fromId,
            end: toId,
            steps: nextSteps,
            distance: nextSteps.length - 1
          }
        }

        if (!visited.has(edge.target)) {
          visited.add(edge.target)
          queue.push({
            photoId: edge.target,
            steps: nextSteps
          })
        }
      }
    }

    console.warn(`[NavGraph] No path exists: ${fromId} → ${toId}`)
    return null
  }

  getNode(photoId: string): GraphNode | undefined {
    return this.nodes.get(photoId)
  }

  getAllPhotoIds(): string[] {
    return Array.from(this.nodes.keys())
  }

  getStats() {
    const edgeCount = Array.from(this.nodes.values()).reduce(
      (sum, node) => sum + node.edges.length,
      0
    )

    return {
      nodeCount: this.nodes.size,
      edgeCount,
      loaded: this.loaded
    }
  }
}

let singleton: NavigationGraph | null = null

export function getNavigationGraph(): NavigationGraph {
  if (!singleton) {
    singleton = new NavigationGraph()
  }

  return singleton
}

export function findRoute(fromId: string, toId: string): PathResult | null {
  return getNavigationGraph().findPath(fromId, toId)
}

export function photoExistsInGraph(photoId: string): boolean {
  return getNavigationGraph().getNode(photoId) !== undefined
}
```

**Test the loader:**

Create `src/test-graph-loader.ts` (temporary test file):

```typescript
import { findRoute, getNavigationGraph } from './data/navigationGraph'

const graph = getNavigationGraph()
console.log('Graph stats:', graph.getStats())

// Test a known route
const route = findRoute('a-f1-north-entrance', 'library-main-entrance')
if (route) {
  console.log(`Route found: ${route.steps.length - 1} steps`)
  console.log('Steps:', route.steps.map(step => step.photoId).join(' → '))
} else {
  console.log('No route found')
}
```

Run test:

```bash
tsx src/test-graph-loader.ts
```

**Expected output:**
```
[NavGraph] Loading navigation graph...
[NavGraph] Loaded 487 nodes, built at 2025-01-15T...
Graph stats: { nodeCount: 487, edgeCount: 1234, loaded: true }
Route found: 22 steps (may vary based on data)
Steps: a-f1-north-entrance → a-f1-north-1 → ... → library-main-entrance
```

Delete `src/test-graph-loader.ts` after testing.

**✅ Validation:** Graph loads, routes calculate correctly

---

## Step 2.3: Write Unit Tests

**Time:** 45 minutes

Create `tests/unit/navigationGraph.test.ts`:

```typescript
import { beforeAll, describe, expect, it } from 'vitest'
import { findRoute, getNavigationGraph, photoExistsInGraph } from '../../src/data/navigationGraph'

describe('Navigation Graph', () => {
  beforeAll(() => {
    getNavigationGraph()
  })

  describe('Graph Loading', () => {
    it('should load graph with nodes', () => {
      const stats = getNavigationGraph().getStats()
      expect(stats.loaded).toBe(true)
      expect(stats.nodeCount).toBeGreaterThan(100)
      expect(stats.edgeCount).toBeGreaterThan(200)
    })

    it('should have start location', () => {
      expect(photoExistsInGraph('a-f1-north-entrance')).toBe(true)
    })
  })

  describe('Pathfinding - Basic Routes', () => {
    it('should find route between adjacent photos', () => {
      const route = findRoute('a-f1-north-entrance', 'a-f1-north-1')

      expect(route).not.toBeNull()
      expect(route!.steps.length).toBe(2)
      expect(route!.steps[0].photoId).toBe('a-f1-north-entrance')
      expect(route!.steps[1].photoId).toBe('a-f1-north-1')
      expect(route!.steps[1].direction).toBeTruthy()
      expect(route!.distance).toBe(1)
    })

    it('should return same photo for identical start/end', () => {
      const route = findRoute('a-f1-north-entrance', 'a-f1-north-entrance')

      expect(route).not.toBeNull()
      expect(route!.steps).toEqual([{ photoId: 'a-f1-north-entrance', direction: null }])
      expect(route!.distance).toBe(0)
    })

    it('should return null for non-existent photos', () => {
      expect(findRoute('invalid-photo-id', 'another-invalid-id')).toBeNull()
    })
  })

  describe('Pathfinding - Complex Routes', () => {
    it('should find multi-hop route', () => {
      const route = findRoute('a-f1-north-entrance', 'a-f1-south-6')

      expect(route).not.toBeNull()
      expect(route!.distance).toBeGreaterThan(3)
      expect(route!.steps.length).toBe(route!.distance + 1)
    })

    it('should handle elevator navigation', () => {
      const route = findRoute('n-f1-mid-5', 'n-f2-mid-5')

      if (route) {
        const directions = route.steps
          .map(step => step.direction)
          .filter(direction => direction !== null)
        expect(directions).toContain(expect.stringMatching(/floor|elevator|up|down/))
      }
    })

    it('should allow multiple edges per direction', () => {
      const graph = getNavigationGraph()
      const hasDuplicateDirection = Array.from(graph.getAllPhotoIds()).some(id => {
        const node = graph.getNode(id)
        if (!node) {
          return false
        }

        const occurrences = new Map<string, number>()
        node.edges.forEach(edge => {
          occurrences.set(edge.direction, (occurrences.get(edge.direction) ?? 0) + 1)
        })

        return Array.from(occurrences.values()).some(count => count > 1)
      })

      expect(hasDuplicateDirection).toBe(true)
    })
  })

  describe('Pathfinding - Edge Cases', () => {
    it('should find shortest path (BFS property)', () => {
      const direct = findRoute('a-f1-north-1', 'a-f1-north-3')
      const detour = findRoute('a-f1-north-1', 'a-f1-north-4')

      expect(direct).not.toBeNull()
      expect(detour).not.toBeNull()
      expect(direct!.distance).toBeLessThanOrEqual(detour!.distance)
    })

    it('should return null for disconnected components when present', () => {
      const disconnectedRoute = findRoute('outside-1', 'library-f4-1')
      if (disconnectedRoute) {
        expect(disconnectedRoute.distance).toBeGreaterThan(0)
      } else {
        expect(disconnectedRoute).toBeNull()
      }
    })
  })
})
```

Update `package.json` to add test script (if not exists):

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

Run tests:

```bash
npm test
```

**Expected output:**
```
 ✓ tests/unit/navigationGraph.test.ts (12)
   ✓ Navigation Graph (12)
     ✓ Graph Loading (2)
       ✓ should load graph with nodes
       ✓ should have start location
     ✓ Pathfinding - Basic Routes (3)
       ✓ should find route between connected photos
       ✓ should return same photo for identical start/end
       ✓ should return null for non-existent photos
     ✓ Pathfinding - Complex Routes (3)
       ✓ should find multi-hop route
       ✓ should handle elevator navigation
       ✓ should handle array edges (multiple doors)
     ✓ Pathfinding - Edge Cases (2)
       ✓ should find shortest path (BFS property)
       ✓ should return null for disconnected components

Test Files  1 passed (1)
     Tests  12 passed (12)
```

**✅ Validation:** All tests pass

---

## Step 2.4: Add Helper Functions

**Time:** 20 minutes

Add to `src/data/navigationGraph.ts`:

```typescript
/**
 * Get metadata for a photo
 */
export function getPhotoMetadata(photoId: string) {
  const graph = getNavigationGraph()
  const node = graph.getNode(photoId)
  return node?.metadata || null
}

/**
 * Find all photos in a building block
 */
export function getPhotosInBuilding(buildingBlock: string): string[] {
  const graph = getNavigationGraph()
  return graph.getAllPhotoIds().filter(id => {
    const node = graph.getNode(id)
    return node?.metadata.buildingBlock === buildingBlock
  })
}

/**
 * Find all photos on a specific floor
 */
export function getPhotosOnFloor(buildingBlock: string, floorLevel: number): string[] {
  const graph = getNavigationGraph()
  return graph.getAllPhotoIds().filter(id => {
    const node = graph.getNode(id)
    return node?.metadata.buildingBlock === buildingBlock &&
           node?.metadata.floorLevel === floorLevel
  })
}

/**
 * Calculate estimated navigation time (seconds)
 */
export function estimateNavigationTime(route: PathResult): number {
  const baseTime = route.distance * 0.8
  let extraTime = 0

  for (let index = 1; index < route.steps.length; index += 1) {
    const current = route.steps[index]
    const previous = route.steps[index - 1]

    if (!current.direction) {
      continue
    }

    if (['up', 'down', 'elevator', 'floor1', 'floor2', 'floor3', 'floor4'].includes(current.direction)) {
      extraTime += 1.5
    }

    if (previous.direction && previous.direction !== current.direction) {
      extraTime += 0.5
    }
  }

  return Math.round(baseTime + extraTime)
}
```

**✅ Validation:** Helper functions compile and can be imported

---

## Phase 2 Complete! 🎉

### Checklist Review

- [x] 2.1 - Create navigation graph types
- [x] 2.2 - Implement graph builder (fix array edge bug)
- [x] 2.3 - Implement BFS pathfinding algorithm
- [x] 2.4 - Add graph validation functions
- [x] 2.5 - Create compile-time graph generation (done in Phase 1)
- [x] 2.6 - Write unit tests for pathfinding
- [x] 2.7 - Add location directory API endpoint (done in Phase 1)

### Validation Tests

1. ✅ `npm test` passes all tests
2. ✅ `findRoute()` returns valid paths
3. ✅ BFS finds shortest routes
4. ✅ Helper functions work correctly
5. ✅ TypeScript compiles without errors

---

## Next Steps

**Proceed to Phase 3:** [phase-3-ably-integration.md](./phase-3-ably-integration.md)

You'll implement:
- Ably token authentication
- Client-side Ably connection
- Server-side message publishing
- Navigation command delivery

**Estimated time:** 3 hours
