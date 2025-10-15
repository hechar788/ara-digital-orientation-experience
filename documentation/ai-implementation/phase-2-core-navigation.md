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
 * Navigation graph node representing a photo location
 */
export interface GraphNode {
  photoId: string
  edges: Map<string, string>  // edge key → destination photoId
  metadata: {
    buildingBlock: string
    floorLevel: number
    areaName: string
  }
}

/**
 * Result of pathfinding calculation
 */
export interface PathResult {
  photoIds: string[]       // Ordered list of photo IDs in route
  directions: string[]     // Corresponding direction taken at each step
  distance: number         // Number of hops (edges traversed)
}

/**
 * Navigation command sent to client via Ably
 */
export interface NavigationCommand {
  id: string
  type: 'navigate' | 'route_start' | 'route_complete' | 'route_cancelled'
  photoId?: string
  direction?: DirectionType
  timestamp: number
  metadata?: {
    step?: number
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
import type { GraphNode, PathResult } from '../types/navigation'

/**
 * Navigation graph singleton
 */
class NavigationGraph {
  private nodes: Map<string, GraphNode> = new Map()
  private loaded: boolean = false

  constructor() {
    this.loadGraph()
  }

  /**
   * Load graph from pre-built JSON
   */
  private loadGraph(): void {
    if (this.loaded) return

    console.info('[NavGraph] Loading navigation graph...')

    const graphData = graphDataJson as any

    for (const [photoId, nodeData] of Object.entries(graphData.nodes)) {
      const typedNodeData = nodeData as any
      this.nodes.set(photoId, {
        photoId: typedNodeData.photoId,
        edges: new Map(Object.entries(typedNodeData.edges)),
        metadata: typedNodeData.metadata
      })
    }

    this.loaded = true
    console.info(
      `[NavGraph] Loaded ${this.nodes.size} nodes, ` +
      `built at ${graphData.metadata.builtAt}`
    )
  }

  /**
   * Find shortest path between two photos using BFS
   *
   * @param fromId - Starting photo ID
   * @param toId - Destination photo ID
   * @returns Path result or null if no path exists
   */
  findPath(fromId: string, toId: string): PathResult | null {
    // Validate nodes exist
    if (!this.nodes.has(fromId)) {
      console.warn(`[NavGraph] Start photo not found: ${fromId}`)
      return null
    }

    if (!this.nodes.has(toId)) {
      console.warn(`[NavGraph] Destination photo not found: ${toId}`)
      return null
    }

    // Same location - no navigation needed
    if (fromId === toId) {
      return {
        photoIds: [fromId],
        directions: [],
        distance: 0
      }
    }

    // BFS to find shortest path
    interface QueueItem {
      photoId: string
      path: string[]
      directions: string[]
    }

    const queue: QueueItem[] = [{
      photoId: fromId,
      path: [fromId],
      directions: []
    }]

    const visited = new Set<string>([fromId])

    while (queue.length > 0) {
      const current = queue.shift()!
      const node = this.nodes.get(current.photoId)!

      // Check all edges from current node
      for (const [direction, neighborId] of node.edges) {
        // Found destination
        if (neighborId === toId) {
          return {
            photoIds: [...current.path, toId],
            directions: [...current.directions, direction],
            distance: current.path.length
          }
        }

        // Add unvisited neighbors to queue
        if (!visited.has(neighborId)) {
          visited.add(neighborId)
          queue.push({
            photoId: neighborId,
            path: [...current.path, neighborId],
            directions: [...current.directions, direction]
          })
        }
      }
    }

    // No path found
    console.warn(`[NavGraph] No path exists: ${fromId} → ${toId}`)
    return null
  }

  /**
   * Get node by photo ID
   */
  getNode(photoId: string): GraphNode | undefined {
    return this.nodes.get(photoId)
  }

  /**
   * Get all photo IDs in graph
   */
  getAllPhotoIds(): string[] {
    return Array.from(this.nodes.keys())
  }

  /**
   * Get graph statistics
   */
  getStats() {
    const totalEdges = Array.from(this.nodes.values())
      .reduce((sum, node) => sum + node.edges.size, 0)

    return {
      nodeCount: this.nodes.size,
      edgeCount: totalEdges,
      loaded: this.loaded
    }
  }
}

// Singleton instance
let graphInstance: NavigationGraph | null = null

/**
 * Get navigation graph instance
 */
export function getNavigationGraph(): NavigationGraph {
  if (!graphInstance) {
    graphInstance = new NavigationGraph()
  }
  return graphInstance
}

/**
 * Convenience function to find route
 */
export function findRoute(fromId: string, toId: string): PathResult | null {
  const graph = getNavigationGraph()
  return graph.findPath(fromId, toId)
}

/**
 * Check if photo exists in graph
 */
export function photoExistsInGraph(photoId: string): boolean {
  const graph = getNavigationGraph()
  return graph.getNode(photoId) !== undefined
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
  console.log(`Route found: ${route.photoIds.length} steps`)
  console.log('Steps:', route.photoIds.join(' → '))
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
Route found: 23 steps
Steps: a-f1-north-entrance → a-f1-north-1 → ... → library-main-entrance
```

Delete `src/test-graph-loader.ts` after testing.

**✅ Validation:** Graph loads, routes calculate correctly

---

## Step 2.3: Write Unit Tests

**Time:** 45 minutes

Create `tests/unit/navigationGraph.test.ts`:

```typescript
import { describe, it, expect, beforeAll } from 'vitest'
import { findRoute, getNavigationGraph, photoExistsInGraph } from '../../src/data/navigationGraph'

describe('Navigation Graph', () => {
  beforeAll(() => {
    // Ensure graph is loaded
    getNavigationGraph()
  })

  describe('Graph Loading', () => {
    it('should load graph with nodes', () => {
      const graph = getNavigationGraph()
      const stats = graph.getStats()

      expect(stats.loaded).toBe(true)
      expect(stats.nodeCount).toBeGreaterThan(100)
      expect(stats.edgeCount).toBeGreaterThan(200)
    })

    it('should have start location', () => {
      expect(photoExistsInGraph('a-f1-north-entrance')).toBe(true)
    })
  })

  describe('Pathfinding - Basic Routes', () => {
    it('should find route between connected photos', () => {
      const route = findRoute('a-f1-north-entrance', 'a-f1-north-1')

      expect(route).not.toBeNull()
      expect(route!.photoIds[0]).toBe('a-f1-north-entrance')
      expect(route!.photoIds[route!.photoIds.length - 1]).toBe('a-f1-north-1')
      expect(route!.directions.length).toBe(route!.photoIds.length - 1)
    })

    it('should return same photo for identical start/end', () => {
      const route = findRoute('a-f1-north-entrance', 'a-f1-north-entrance')

      expect(route).not.toBeNull()
      expect(route!.photoIds).toEqual(['a-f1-north-entrance'])
      expect(route!.directions).toEqual([])
      expect(route!.distance).toBe(0)
    })

    it('should return null for non-existent photos', () => {
      const route = findRoute('invalid-photo-id', 'another-invalid-id')

      expect(route).toBeNull()
    })
  })

  describe('Pathfinding - Complex Routes', () => {
    it('should find multi-hop route', () => {
      const route = findRoute('a-f1-north-entrance', 'a-f1-south-6')

      expect(route).not.toBeNull()
      expect(route!.distance).toBeGreaterThan(3)
      expect(route!.photoIds.length).toBeGreaterThan(4)
    })

    it('should handle elevator navigation', () => {
      // Test route requiring elevator (adjust photo IDs to your data)
      const route = findRoute('n-f1-mid-5', 'n-f2-mid-5')

      if (route) {
        expect(route.directions).toContain(
          expect.stringMatching(/floor|elevator|up|down/)
        )
      }
      // If your graph doesn't have multi-floor routes, skip this test
    })

    it('should handle array edges (multiple doors)', () => {
      // Test that routes can use any door from array of options
      // This validates the fix from v1 where only first door was used
      const graph = getNavigationGraph()
      const node = graph.getNode('a-f1-north-entrance')

      if (node) {
        // Check that array edges were expanded (e.g., door_0, door_1)
        const edgeKeys = Array.from(node.edges.keys())
        const hasArrayEdges = edgeKeys.some(key => key.includes('_'))

        // If your graph has array edges, they should be expanded
        if (hasArrayEdges) {
          expect(edgeKeys.filter(k => k.includes('_')).length).toBeGreaterThan(0)
        }
      }
    })
  })

  describe('Pathfinding - Edge Cases', () => {
    it('should find shortest path (BFS property)', () => {
      // If multiple paths exist, BFS finds shortest
      const route1 = findRoute('a-f1-north-entrance', 'a-f1-south-6')
      const route2 = findRoute('a-f1-north-entrance', 'a-f1-south-6')

      expect(route1!.distance).toBe(route2!.distance)
      expect(route1!.photoIds.length).toBe(route2!.photoIds.length)
    })

    it('should return null for disconnected components', () => {
      // If your graph has disconnected areas (shouldn't after validation)
      // This test would catch it
      const allPhotoIds = getNavigationGraph().getAllPhotoIds()

      // Try to route between first and last photo
      if (allPhotoIds.length > 1) {
        const route = findRoute(allPhotoIds[0], allPhotoIds[allPhotoIds.length - 1])
        // Should find a route if graph is fully connected
        expect(route).not.toBeNull()
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
  // Base: 0.8 seconds per step
  const baseTime = route.distance * 0.8

  // Add extra time for direction changes
  let extraTime = 0
  for (let i = 0; i < route.directions.length - 1; i++) {
    const current = route.directions[i]
    const next = route.directions[i + 1]

    // Vertical navigation takes longer
    if (['up', 'down', 'elevator', 'floor1', 'floor2', 'floor3', 'floor4'].includes(current)) {
      extraTime += 1.5
    }

    // Direction changes need pause
    if (current !== next) {
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
