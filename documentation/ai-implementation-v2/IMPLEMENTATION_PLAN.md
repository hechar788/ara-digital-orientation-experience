# AI Campus Assistant Implementation v2 - Complete Phase Breakdown

**Total Time:** ~6 hours (vs 21 hours for Copilot Studio approach)
**Difficulty:** Medium
**Result:** Production-ready AI navigation with pathfinding

---

## Phase Overview

| Phase | Focus | Time | Key Deliverable |
|-------|-------|------|-----------------|
| **Phase 1** | Setup & Dependencies | 15 min | OpenAI configured |
| **Phase 2** | Pathfinding Algorithm | 45 min | BFS navigation graph |
| **Phase 3** | AI Server Function (Basic) | 20 min | OpenAI function calling |
| **Phase 4** | Server Function (Pathfinding Integration) | 30 min | Path-aware navigation |
| **Phase 5** | Chat Component (UI) | 30 min | Floating chat interface |
| **Phase 6** | Chat Component (Route Navigation) | 60 min | Sequential path visualization |
| **Phase 7** | Main App Integration | 15 min | Connect to tour system |
| **Phase 8** | Testing & Deployment | 45 min | Production launch |

**Total: 6 hours**

---

## Architectural Decision: Why This Order?

### The Dependency Chain

```
Phase 1: OpenAI Setup
  ↓
Phase 2: Pathfinding (core algorithm, no AI dependency)
  ↓
Phase 3: Basic AI Server (simple navigation responses)
  ↓
Phase 4: Enhanced AI Server (integrates pathfinding)
  ↓
Phase 5: Chat UI (displays messages, no navigation yet)
  ↓
Phase 6: Route Navigation (sequential path visualization)
  ↓
Phase 7: Integration (connect to main app)
  ↓
Phase 8: Testing & Launch
```

**Key Insight:** Build pathfinding BEFORE AI integration because:
1. ✅ Can test pathfinding independently
2. ✅ AI server function needs pathfinding output
3. ✅ Decouples graph algorithm from AI logic
4. ✅ Easier to debug in isolation

---

## Phase 1: Setup & Dependencies

**Duration:** 15 minutes
**Files:** `.env.local`, `package.json`

### Objectives
- ✅ OpenAI account created
- ✅ API key configured
- ✅ OpenAI SDK installed
- ✅ Basic connection tested

### Steps
Same as original Phase 1 (no changes needed)

**See:** `phase-1-setup.md` (unchanged)

---

## Phase 2: Pathfinding Algorithm ⭐ NEW

**Duration:** 45 minutes
**Files Created:** `src/lib/pathfinding.ts`
**Dependencies:** `blockUtils.ts`, `types/tour.ts`

### Objectives
- ✅ BFS algorithm implemented
- ✅ Graph neighbor extraction working
- ✅ Path reconstruction functional
- ✅ Unit tests passing
- ✅ Performance validated (<10ms)

### Step 2.1: Understand the Campus Graph (5 min)

Your campus tour is already a graph:

```typescript
// Node = Photo
{
  id: "a-f1-north-entrance",
  directions: {
    forward: { connection: "a-f1-south-1" },  // Edge to neighbor
    back: { connection: "outside-a-east-1" }, // Edge to neighbor
    up: "a-f2-north-entrance",                // Edge to floor above
    // ... more edges
  }
}

// This IS a graph! Perfect for BFS.
```

**Graph Properties:**
- **Nodes:** ~500 photos across campus
- **Edges:** ~2000 directional connections
- **Edge Weight:** All equal (1 step = 1 step)
- **Connectivity:** Fully connected within accessible areas

### Step 2.2: Create Pathfinding Module (30 min)

Create `src/lib/pathfinding.ts`:

```typescript
/**
 * Campus Navigation Pathfinding System
 *
 * Implements Breadth-First Search (BFS) for finding shortest paths
 * between locations in the VR campus tour. Treats the campus as an
 * unweighted graph where photos are nodes and directional connections
 * are edges.
 *
 * @fileoverview Core pathfinding logic for AI-guided navigation
 */

import { findPhotoById } from '../data/blockUtils'
import type { Photo, DirectionType } from '../types/tour'

/**
 * Pathfinding result with route metadata
 *
 * Contains the complete path from start to destination along with
 * useful metadata for UI display and navigation timing.
 *
 * @property path - Ordered array of photo IDs from start to end
 * @property distance - Number of steps in the path (path.length - 1)
 * @property startId - Starting photo ID
 * @property endId - Destination photo ID
 */
export interface PathfindingResult {
  path: string[]
  distance: number
  startId: string
  endId: string
}

/**
 * Find shortest path between two campus locations using BFS
 *
 * Performs breadth-first search on the campus photo graph to find
 * the shortest navigable route. Returns null if no path exists
 * (e.g., locations in disconnected buildings or invalid IDs).
 *
 * Algorithm: Standard BFS with parent tracking for path reconstruction
 * Time Complexity: O(V + E) where V = photos, E = connections
 * Space Complexity: O(V) for visited set and parent map
 *
 * @param startPhotoId - Starting location photo ID
 * @param endPhotoId - Destination location photo ID
 * @returns Pathfinding result with complete route, or null if no path exists
 *
 * @example
 * ```typescript
 * const result = findPath("a-f1-north-entrance", "library-f1-entrance")
 * if (result) {
 *   console.log(`Route: ${result.distance} steps`)
 *   console.log(`Path: ${result.path.join(' → ')}`)
 * }
 * ```
 */
export function findPath(
  startPhotoId: string,
  endPhotoId: string
): PathfindingResult | null {
  // Handle edge case: already at destination
  if (startPhotoId === endPhotoId) {
    return {
      path: [startPhotoId],
      distance: 0,
      startId: startPhotoId,
      endId: endPhotoId
    }
  }

  // Validate that both photos exist
  const startPhoto = findPhotoById(startPhotoId)
  const endPhoto = findPhotoById(endPhotoId)

  if (!startPhoto || !endPhoto) {
    console.error('[Pathfinding] Invalid photo IDs:', { startPhotoId, endPhotoId })
    return null
  }

  // BFS initialization
  const queue: string[] = [startPhotoId]
  const visited = new Set<string>([startPhotoId])
  const parent = new Map<string, string>()

  // BFS main loop
  while (queue.length > 0) {
    const currentId = queue.shift()!

    // Check if we've reached the destination
    if (currentId === endPhotoId) {
      const path = reconstructPath(parent, startPhotoId, endPhotoId)
      return {
        path,
        distance: path.length - 1,
        startId: startPhotoId,
        endId: endPhotoId
      }
    }

    // Get current photo to access neighbors
    const currentPhoto = findPhotoById(currentId)
    if (!currentPhoto) continue

    // Explore all neighbors
    const neighbors = getAllNeighbors(currentPhoto)

    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId)
        parent.set(neighborId, currentId)
        queue.push(neighborId)
      }
    }
  }

  // No path found between locations
  console.warn('[Pathfinding] No path found between:', { startPhotoId, endPhotoId })
  return null
}

/**
 * Extract all neighboring photo IDs from a photo's connections
 *
 * Collects reachable photo IDs from all directional connections including
 * horizontal movement (forward, back, left, right, diagonals) and vertical
 * movement (up, down, elevators, doors, floor selections).
 *
 * Handles both single connections (string) and multiple connections (string[]).
 *
 * @param photo - Photo to extract neighbors from
 * @returns Array of unique neighbor photo IDs
 *
 * @example
 * ```typescript
 * const photo = findPhotoById("a-f1-north-entrance")
 * const neighbors = getAllNeighbors(photo)
 * // Returns: ["a-f1-south-1", "outside-a-east-1", ...]
 * ```
 */
function getAllNeighbors(photo: Photo): string[] {
  const neighbors: string[] = []

  // Horizontal directions (8-directional movement)
  const horizontalDirs: DirectionType[] = [
    'forward',
    'forwardRight',
    'right',
    'backRight',
    'back',
    'backLeft',
    'left',
    'forwardLeft'
  ]

  for (const dir of horizontalDirs) {
    const dirDef = photo.directions[dir]
    // Check if it's a DirectionDefinition object with a connection
    if (dirDef && typeof dirDef === 'object' && 'connection' in dirDef) {
      neighbors.push(dirDef.connection)
    }
  }

  // Vertical and special directions (can be string or string[])
  const specialDirs: Array<'up' | 'down' | 'elevator' | 'door'> = [
    'up',
    'down',
    'elevator',
    'door'
  ]

  for (const dir of specialDirs) {
    const connection = photo.directions[dir]
    if (connection) {
      if (Array.isArray(connection)) {
        neighbors.push(...connection)
      } else {
        neighbors.push(connection)
      }
    }
  }

  // Floor selection buttons (elevator interiors only)
  const floorDirs: Array<'floor1' | 'floor2' | 'floor3' | 'floor4'> = [
    'floor1',
    'floor2',
    'floor3',
    'floor4'
  ]

  for (const dir of floorDirs) {
    const connection = photo.directions[dir]
    if (connection) {
      neighbors.push(connection)
    }
  }

  return neighbors
}

/**
 * Reconstruct path from BFS parent map
 *
 * Traces backwards from destination to start using parent pointers,
 * then reverses to create forward path array. This is the standard
 * BFS path reconstruction technique.
 *
 * @param parent - Map of child → parent photo ID relationships from BFS
 * @param start - Starting photo ID
 * @param end - Destination photo ID
 * @returns Ordered array of photo IDs from start to end
 *
 * @example
 * ```typescript
 * // After BFS, parent map might be:
 * // { "a-f1-south-2": "a-f1-south-1", "a-f1-south-1": "a-f1-north-entrance" }
 * const path = reconstructPath(parent, "a-f1-north-entrance", "a-f1-south-2")
 * // Returns: ["a-f1-north-entrance", "a-f1-south-1", "a-f1-south-2"]
 * ```
 */
function reconstructPath(
  parent: Map<string, string>,
  start: string,
  end: string
): string[] {
  const path: string[] = []
  let current = end

  // Trace backwards from end to start
  while (current !== start) {
    path.unshift(current)
    const next = parent.get(current)
    if (!next) {
      // This shouldn't happen if BFS succeeded, but handle gracefully
      console.error('[Pathfinding] Path reconstruction failed at:', current)
      break
    }
    current = next
  }

  // Add start to the beginning
  path.unshift(start)

  return path
}

/**
 * Get human-readable route description
 *
 * Generates a text summary of the route for display in chat messages.
 * Useful for giving users a quick overview before starting navigation.
 *
 * @param result - Pathfinding result with path information
 * @returns Human-readable route description
 *
 * @example
 * ```typescript
 * const result = findPath("a-f1-north-entrance", "library-f1-entrance")
 * const description = getRouteDescription(result)
 * // Returns: "Route found: 7 steps from A Block entrance to Library entrance"
 * ```
 */
export function getRouteDescription(result: PathfindingResult): string {
  const startPhoto = findPhotoById(result.startId)
  const endPhoto = findPhotoById(result.endId)

  const startName = startPhoto?.id.split('-').slice(0, 2).join(' ').toUpperCase() || 'start'
  const endName = endPhoto?.id.split('-').slice(0, 2).join(' ').toUpperCase() || 'destination'

  return `Route found: ${result.distance} steps from ${startName} to ${endName}`
}
```

### Step 2.3: Write Unit Tests (10 min)

Create `src/lib/__tests__/pathfinding.test.ts`:

```typescript
import { describe, test, expect } from 'vitest'
import { findPath } from '../pathfinding'

describe('BFS Pathfinding', () => {
  test('finds path between adjacent photos', () => {
    const result = findPath('a-f1-north-entrance', 'a-f1-south-1')
    expect(result).not.toBeNull()
    expect(result!.path).toHaveLength(2)
    expect(result!.distance).toBe(1)
    expect(result!.path[0]).toBe('a-f1-north-entrance')
    expect(result!.path[1]).toBe('a-f1-south-1')
  })

  test('handles same start and end location', () => {
    const result = findPath('a-f1-north-entrance', 'a-f1-north-entrance')
    expect(result).not.toBeNull()
    expect(result!.path).toEqual(['a-f1-north-entrance'])
    expect(result!.distance).toBe(0)
  })

  test('returns null for invalid photo IDs', () => {
    const result = findPath('invalid-id', 'a-f1-north-entrance')
    expect(result).toBeNull()
  })

  test('finds path across multiple areas', () => {
    const result = findPath('a-f1-north-entrance', 'library-f1-entrance')
    expect(result).not.toBeNull()
    expect(result!.path[0]).toBe('a-f1-north-entrance')
    expect(result!.path[result!.path.length - 1]).toBe('library-f1-entrance')
    expect(result!.distance).toBeGreaterThan(1)
  })

  test('returns null when no path exists between disconnected areas', () => {
    // Test with two photos that shouldn't be connected
    // (adjust based on your actual campus layout)
    const result = findPath('a-f1-north-entrance', 'nonexistent-location')
    expect(result).toBeNull()
  })
})
```

Run tests:
```bash
npm run test pathfinding
```

**Expected:** All tests pass ✅

✅ **Phase 2 Complete!** Pathfinding algorithm working independently.

---

## Phase 3: AI Server Function (Basic) ⭐ SPLIT FROM OLD PHASE 2

**Duration:** 20 minutes
**Files Created:** `src/lib/ai.ts`
**Dependencies:** OpenAI SDK

### Objectives
- ✅ Server function created with type safety
- ✅ OpenAI function calling configured
- ✅ Basic navigation commands working
- ✅ Error handling implemented
- ✅ NO pathfinding integration yet (comes in Phase 4)

### Step 3.1: Create Basic AI Server Function (15 min)

Create `src/lib/ai.ts`:

```typescript
'use server'

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

/**
 * Chat message type for conversation history
 *
 * Standard OpenAI message format with role and content.
 * Used for maintaining conversation context across interactions.
 *
 * @property role - Message sender (user, assistant, or system)
 * @property content - Message text content
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/**
 * Navigation function call from AI (BASIC VERSION - Phase 3)
 *
 * Simple function call containing only destination photo ID.
 * Phase 4 will enhance this with pathfinding data.
 *
 * @property name - Function name to call
 * @property arguments - Function arguments
 * @property arguments.photoId - Destination photo ID
 */
export interface FunctionCall {
  name: string
  arguments: {
    photoId: string
  }
}

/**
 * AI chat response container
 *
 * Result from server function containing AI message and optional
 * navigation command. Error field populated on failure.
 *
 * @property message - AI's text response (null if error)
 * @property functionCall - Navigation command if AI wants to navigate
 * @property error - Error message if request failed
 */
export interface ChatResponse {
  message: string | null
  functionCall: FunctionCall | null
  error?: string
}

/**
 * Campus location definitions for AI knowledge
 *
 * Maps photo IDs to human-friendly location names and synonyms.
 * Used by AI to understand which photo ID corresponds to user requests.
 */
const CAMPUS_LOCATIONS = {
  // A Block
  'a-f1-north-entrance': [
    'A Block',
    'Main Entrance',
    'Academic Building A',
    'Block A',
    'A Building'
  ],

  // Library
  'library-f1-entrance': [
    'Library',
    'Main Library',
    'Books',
    'Study Area',
    'Reading Room',
    'Library Entrance'
  ],

  // W Block / Gym
  'w-gym-entry': [
    'Gym',
    'Gymnasium',
    'Sports Hall',
    'Recreation Center',
    'Fitness Center',
    'Workout Area'
  ],

  // Student Lounge
  'lounge-main': [
    'Student Lounge',
    'Common Area',
    'Hangout',
    'Social Space',
    'Break Room',
    'Lounge'
  ],

  // N Block
  'n-sandy-office': [
    'Professor Sandy Office',
    'Sandy Office',
    'Faculty Office',
    'Sandy',
    'Professor Sandy'
  ]
} as const

/**
 * Generate location knowledge string for AI system prompt
 *
 * Converts CAMPUS_LOCATIONS map into formatted string for AI context.
 * Lists all known locations with their synonyms.
 *
 * @returns Formatted location knowledge string
 */
function generateLocationKnowledge(): string {
  return Object.entries(CAMPUS_LOCATIONS)
    .map(([photoId, synonyms]) => `- ${photoId}: ${synonyms.join(', ')}`)
    .join('\n')
}

/**
 * AI Campus Chat Server Function (BASIC VERSION - Phase 3)
 *
 * Processes chat messages using OpenAI GPT-4 with function calling.
 * This is the basic version that returns simple photo IDs.
 * Phase 4 will enhance this with pathfinding integration.
 *
 * Runs entirely on server - API key never exposed to client.
 *
 * @param messages - Conversation history
 * @param currentLocation - User's current photo ID for context
 * @returns AI response with optional navigation command
 *
 * @example
 * ```typescript
 * const result = await getChatResponse(
 *   [{ role: 'user', content: 'Where is the library?' }],
 *   'a-f1-north-entrance'
 * )
 * // Returns: { message: "I'll take you there!", functionCall: { ... } }
 * ```
 */
export async function getChatResponse(
  messages: ChatMessage[],
  currentLocation: string
): Promise<ChatResponse> {
  'use server'

  try {
    // Input validation
    if (!messages || messages.length === 0) {
      return {
        message: null,
        functionCall: null,
        error: 'No messages provided'
      }
    }

    // Rate limiting protection
    if (messages.length > 20) {
      return {
        message: null,
        functionCall: null,
        error: 'Conversation too long. Please start a new chat.'
      }
    }

    // Message size protection
    const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0)
    if (totalChars > 5000) {
      return {
        message: null,
        functionCall: null,
        error: 'Message too long. Please be more concise.'
      }
    }

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a helpful campus navigation assistant at ARA Institute of Canterbury.

**Current User Location:** ${currentLocation}

**Available Campus Locations:**
${generateLocationKnowledge()}

**Your Role:**
When users ask about finding a location:
1. Provide friendly, helpful directions
2. Ask if they'd like automatic navigation
3. If they confirm (yes, sure, okay, please), call the navigate_to function

**Style:**
- Be conversational and friendly
- Use clear, simple language
- Don't be overly verbose
- Respond naturally to greetings`
        },
        ...messages
      ],
      functions: [
        {
          name: 'navigate_to',
          description:
            'Navigate user to a campus location. Only call when user confirms they want navigation.',
          parameters: {
            type: 'object',
            properties: {
              photoId: {
                type: 'string',
                enum: Object.keys(CAMPUS_LOCATIONS),
                description: 'Photo ID of destination'
              }
            },
            required: ['photoId']
          }
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    })

    const choice = response.choices[0]

    // Extract function call if present
    let functionCall: FunctionCall | null = null
    if (choice.message.function_call) {
      functionCall = {
        name: choice.message.function_call.name,
        arguments: JSON.parse(choice.message.function_call.arguments)
      }
    }

    return {
      message: choice.message.content || null,
      functionCall
    }
  } catch (error: any) {
    console.error('[AI Server Function] Error:', error)

    // Handle specific OpenAI errors
    if (error.status === 429) {
      return {
        message: null,
        functionCall: null,
        error: 'The AI is currently busy. Please try again in a moment.'
      }
    }

    if (error.status === 401) {
      console.error('[AI] Invalid API key. Check .env.local file.')
      return {
        message: null,
        functionCall: null,
        error: 'AI service configuration error. Please contact support.'
      }
    }

    if (error.status >= 500) {
      return {
        message: null,
        functionCall: null,
        error: 'The AI service is temporarily unavailable. Please try again.'
      }
    }

    // Generic error
    return {
      message: null,
      functionCall: null,
      error: 'Sorry, I encountered an error. Please try again.'
    }
  }
}
```

### Step 3.2: Test Basic Server Function (5 min)

Create temporary test file `test-ai-basic.ts`:

```typescript
import { getChatResponse } from './src/lib/ai'

async function test() {
  console.log('Test 1: Greeting')
  const result1 = await getChatResponse(
    [{ role: 'user', content: 'Hello!' }],
    'a-f1-north-entrance'
  )
  console.log('Response:', result1.message)
  console.log('Function call:', result1.functionCall)
  console.log('')

  console.log('Test 2: Location query')
  const result2 = await getChatResponse(
    [{ role: 'user', content: 'Where is the library?' }],
    'a-f1-north-entrance'
  )
  console.log('Response:', result2.message)
  console.log('Function call:', result2.functionCall)
  console.log('')

  console.log('Test 3: Navigation confirmation')
  const result3 = await getChatResponse(
    [
      { role: 'user', content: 'Where is the library?' },
      {
        role: 'assistant',
        content: 'The Library is southwest from here. Would you like me to take you there?'
      },
      { role: 'user', content: 'Yes please' }
    ],
    'a-f1-north-entrance'
  )
  console.log('Response:', result3.message)
  console.log('Function call:', result3.functionCall)
  console.log('Expected: Function call with photoId')
}

test().catch(console.error)
```

Run:
```bash
npx tsx test-ai-basic.ts
```

**Expected:** AI responds and returns function calls ✅

Clean up:
```bash
rm test-ai-basic.ts
```

✅ **Phase 3 Complete!** Basic AI server function working.

---

## Phase 4: Server Function Enhancement (Pathfinding Integration) ⭐ NEW

**Duration:** 30 minutes
**Files Modified:** `src/lib/ai.ts`
**Dependencies:** `pathfinding.ts` (Phase 2)

### Objectives
- ✅ Pathfinding integrated into server function
- ✅ Function call returns full path array
- ✅ Path metadata included (distance, route description)
- ✅ Handles "no path found" scenarios
- ✅ Backwards compatible with Phase 3 interface

### Step 4.1: Enhance FunctionCall Interface (5 min)

Update `src/lib/ai.ts` interfaces:

```typescript
// ADD import at top
import { findPath, getRouteDescription } from './pathfinding'

// UPDATE FunctionCall interface
/**
 * Navigation function call from AI (ENHANCED - Phase 4)
 *
 * Enhanced function call with pathfinding data for route visualization.
 * Includes full path array and metadata for sequential navigation.
 *
 * @property name - Function name to call
 * @property arguments - Function arguments
 * @property arguments.photoId - Destination photo ID
 * @property arguments.path - Full ordered path from current location to destination
 * @property arguments.distance - Number of steps in the path
 * @property arguments.routeDescription - Human-readable route summary
 */
export interface FunctionCall {
  name: string
  arguments: {
    photoId: string         // Destination (backwards compatible)
    path?: string[]         // NEW: Full path array
    distance?: number       // NEW: Number of steps
    routeDescription?: string // NEW: Route summary
  }
}
```

### Step 4.2: Integrate Pathfinding Logic (20 min)

Update the `getChatResponse` function in `src/lib/ai.ts`:

```typescript
export async function getChatResponse(
  messages: ChatMessage[],
  currentLocation: string
): Promise<ChatResponse> {
  'use server'

  try {
    // ... existing validation code ...

    // Call OpenAI
    const response = await openai.chat.completions.create({
      // ... existing OpenAI call ...
    })

    const choice = response.choices[0]

    // ENHANCED: Process function call with pathfinding
    let functionCall: FunctionCall | null = null
    if (choice.message.function_call) {
      const rawFunctionCall = {
        name: choice.message.function_call.name,
        arguments: JSON.parse(choice.message.function_call.arguments)
      }

      // NEW: Calculate path for navigation functions
      if (rawFunctionCall.name === 'navigate_to') {
        const destinationId = rawFunctionCall.arguments.photoId

        // Run BFS pathfinding
        const pathResult = findPath(currentLocation, destinationId)

        if (pathResult) {
          // Path found - include full route data
          functionCall = {
            name: rawFunctionCall.name,
            arguments: {
              photoId: destinationId,
              path: pathResult.path,
              distance: pathResult.distance,
              routeDescription: getRouteDescription(pathResult)
            }
          }
        } else {
          // No path found - return helpful error
          return {
            message: null,
            functionCall: null,
            error:
              "I couldn't find a navigable route to that location. It might be inaccessible or in a disconnected area. Try asking about a different location."
          }
        }
      } else {
        // Non-navigation function call (future extensibility)
        functionCall = rawFunctionCall
      }
    }

    return {
      message: choice.message.content || null,
      functionCall
    }
  } catch (error: any) {
    // ... existing error handling ...
  }
}
```

### Step 4.3: Test Pathfinding Integration (5 min)

Create test file `test-ai-pathfinding.ts`:

```typescript
import { getChatResponse } from './src/lib/ai'

async function test() {
  console.log('Testing AI with Pathfinding Integration\n')

  console.log('Test: Navigation with path')
  const result = await getChatResponse(
    [
      { role: 'user', content: 'Take me to the library' },
      {
        role: 'assistant',
        content: 'Sure! Would you like me to guide you there?'
      },
      { role: 'user', content: 'Yes' }
    ],
    'a-f1-north-entrance'
  )

  console.log('Message:', result.message)
  console.log('Function call:', result.functionCall)

  if (result.functionCall?.arguments.path) {
    console.log('\n✅ Path found!')
    console.log('Destination:', result.functionCall.arguments.photoId)
    console.log('Distance:', result.functionCall.arguments.distance, 'steps')
    console.log('Route:', result.functionCall.arguments.routeDescription)
    console.log('Path:', result.functionCall.arguments.path.join(' → '))
  } else {
    console.log('\n❌ No path returned')
  }
}

test().catch(console.error)
```

Run:
```bash
npx tsx test-ai-pathfinding.ts
```

**Expected Output:**
```
✅ Path found!
Destination: library-f1-entrance
Distance: 7 steps
Route: Route found: 7 steps from A F1 to LIBRARY F1
Path: a-f1-north-entrance → a-f1-south-1 → ... → library-f1-entrance
```

Clean up:
```bash
rm test-ai-pathfinding.ts
```

✅ **Phase 4 Complete!** Server function now includes pathfinding data.

---

## Phase 5: Chat Component (UI Only) ⭐ SPLIT FROM OLD PHASE 3

**Duration:** 30 minutes
**Files Created:** `src/components/chat/AICampusChat.tsx`
**Dependencies:** `ai.ts` (Phase 4)

### Objectives
- ✅ Floating chat UI created
- ✅ Message display working
- ✅ Input and submission functional
- ✅ Loading states implemented
- ✅ Minimize/maximize/close controls
- ✅ NO route navigation yet (comes in Phase 6)

### Implementation

**Create basic chat UI without route visualization logic.**

See original `phase-3-chat-component.md` BUT:
- **REMOVE** the sequential navigation logic
- **REMOVE** route progress UI
- **KEEP** simple message display
- **KEEP** minimize/maximize/close
- **KEEP** loading states

**Basic handleSubmit (Phase 5 version):**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!input.trim() || isLoading) return

  const userMessage: ChatMessage = { role: 'user', content: input.trim() }

  setMessages(prev => [...prev, userMessage])
  setInput('')
  setIsLoading(true)

  try {
    const result = await getChatResponse([...messages, userMessage], currentPhotoId)

    if (result.error) {
      setMessages(prev => [...prev, { role: 'assistant', content: result.error! }])
      return
    }

    if (result.message) {
      setMessages(prev => [...prev, { role: 'assistant', content: result.message! }])
    }

    // PHASE 5: Simple direct navigation (no route visualization)
    if (result.functionCall) {
      console.log('[Chat] Navigation requested:', result.functionCall.arguments.photoId)
      setTimeout(() => {
        onNavigate(result.functionCall!.arguments.photoId)
      }, 500)
    }
  } catch (error) {
    console.error('[Chat] Error:', error)
    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: 'Sorry, I encountered an error.' }
    ])
  } finally {
    setIsLoading(false)
  }
}
```

✅ **Phase 5 Complete!** Chat UI working with direct navigation.

---

## Phase 6: Route Navigation (Sequential Pathfinding) ⭐ NEW

**Duration:** 60 minutes
**Files Modified:** `src/components/chat/AICampusChat.tsx`
**Dependencies:** Phase 5 chat UI

### Objectives
- ✅ Sequential path navigation implemented
- ✅ Step-by-step photo transitions
- ✅ Progress indicator UI
- ✅ Route preview messages
- ✅ Configurable navigation speed
- ✅ Skip/pause controls (optional)

### Step 6.1: Add Route Navigation State (10 min)

Update `src/components/chat/AICampusChat.tsx` imports and state:

```typescript
import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, X, Minimize2, Maximize2, FastForward } from 'lucide-react'
import { getChatResponse, type ChatMessage } from '@/lib/ai'

export function AICampusChat({ currentPhotoId, onNavigate }: AICampusChatProps) {
  // ... existing state ...

  // NEW: Route navigation state
  const [isNavigatingRoute, setIsNavigatingRoute] = useState(false)
  const [currentRouteStep, setCurrentRouteStep] = useState(0)
  const [navigationSpeed, setNavigationSpeed] = useState<800 | 600 | 400>(800) // ms per step
  const routeRef = useRef<string[] | null>(null)
  const navigationTimerRef = useRef<NodeJS.Timeout | null>(null)

  // ... rest of component ...
}
```

### Step 6.2: Implement Sequential Navigation Function (20 min)

Add navigation logic:

```typescript
/**
 * Navigate through a route path sequentially
 *
 * Steps through each photo in the path with configurable delay between steps.
 * Provides progress updates via messages and state. Cancellable via component unmount.
 *
 * @param path - Ordered array of photo IDs to navigate through
 * @param delayMs - Milliseconds to wait between navigation steps
 */
const navigateAlongPath = useCallback(
  async (path: string[], delayMs: number = 800) => {
    if (path.length === 0) return
    if (path.length === 1) {
      // Already at destination
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "You're already at that location!" }
      ])
      return
    }

    setIsNavigatingRoute(true)
    routeRef.current = path

    // Skip first photo (user is already there)
    for (let i = 1; i < path.length; i++) {
      setCurrentRouteStep(i)

      // Navigate to this step
      onNavigate(path[i])

      // Wait before next step (except for last step)
      if (i < path.length - 1) {
        await new Promise(resolve => {
          navigationTimerRef.current = setTimeout(resolve, delayMs)
        })
      }
    }

    // Navigation complete
    setIsNavigatingRoute(false)
    routeRef.current = null
    setCurrentRouteStep(0)
    navigationTimerRef.current = null

    // Confirmation message
    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: "You've arrived at your destination! 🎯" }
    ])
  },
  [onNavigate]
)

/**
 * Skip to the end of route navigation
 *
 * Cancels sequential navigation and jumps directly to final destination.
 */
const skipToDestination = useCallback(() => {
  if (!routeRef.current || routeRef.current.length === 0) return

  // Cancel any pending timer
  if (navigationTimerRef.current) {
    clearTimeout(navigationTimerRef.current)
    navigationTimerRef.current = null
  }

  // Jump to final destination
  const finalDestination = routeRef.current[routeRef.current.length - 1]
  onNavigate(finalDestination)

  // Clean up navigation state
  setIsNavigatingRoute(false)
  routeRef.current = null
  setCurrentRouteStep(0)

  setMessages(prev => [
    ...prev,
    { role: 'assistant', content: "Skipped to destination! 🎯" }
  ])
}, [onNavigate])

// Cleanup on unmount
useEffect(() => {
  return () => {
    if (navigationTimerRef.current) {
      clearTimeout(navigationTimerRef.current)
    }
  }
}, [])
```

### Step 6.3: Update Message Handler (15 min)

Replace the Phase 5 simple navigation with route-aware logic:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!input.trim() || isLoading || isNavigatingRoute) return // Block during navigation

  const userMessage: ChatMessage = { role: 'user', content: input.trim() }

  setMessages(prev => [...prev, userMessage])
  setInput('')
  setIsLoading(true)

  try {
    const result = await getChatResponse([...messages, userMessage], currentPhotoId)

    if (result.error) {
      setMessages(prev => [...prev, { role: 'assistant', content: result.error! }])
      return
    }

    if (result.message) {
      setMessages(prev => [...prev, { role: 'assistant', content: result.message! }])
    }

    // PHASE 6: Enhanced navigation with route visualization
    if (result.functionCall) {
      const { photoId, path, distance, routeDescription } = result.functionCall.arguments

      if (path && path.length > 1) {
        // Show route preview
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `${routeDescription || `Found a route! It's ${distance} steps from here.`}\n\nStarting navigation...`
          }
        ])

        // Start sequential navigation after brief delay
        setTimeout(() => {
          navigateAlongPath(path, navigationSpeed)
        }, 1000)
      } else {
        // Fallback to direct jump (e.g., already at destination or path calculation failed)
        console.log('[Chat] No multi-step path, jumping directly')
        setTimeout(() => {
          onNavigate(photoId)
        }, 500)
      }
    }
  } catch (error) {
    console.error('[Chat] Error:', error)
    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
    ])
  } finally {
    setIsLoading(false)
  }
}
```

### Step 6.4: Add Progress UI (15 min)

Add visual feedback for route navigation:

```typescript
return (
  <div className={`fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-2xl ...`}>
    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 ...">
      {/* ... existing header ... */}
    </div>

    {/* NEW: Route Progress Overlay */}
    {isNavigatingRoute && routeRef.current && (
      <div className="absolute top-full mt-2 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 min-w-[280px]">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold">
            Navigating: Step {currentRouteStep} of {routeRef.current.length - 1}
          </div>
          <button
            onClick={skipToDestination}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Skip to destination"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-blue-400/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300 ease-out"
            style={{
              width: `${(currentRouteStep / (routeRef.current.length - 1)) * 100}%`
            }}
          />
        </div>

        {/* Estimated Time Remaining */}
        <div className="text-xs text-blue-100 mt-2">
          {Math.ceil(
            ((routeRef.current.length - 1 - currentRouteStep) * navigationSpeed) / 1000
          )}
          s remaining
        </div>
      </div>
    )}

    {/* Chat content */}
    {!isMinimized && (
      <div className="flex flex-col h-[calc(100%-3.5rem)]">
        {/* ... existing messages UI ... */}

        {/* Input (disabled during navigation) */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={
                isNavigatingRoute
                  ? 'Navigation in progress...'
                  : 'Ask about campus locations...'
              }
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
              disabled={isLoading || isNavigatingRoute}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || isNavigatingRoute}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          {/* Speed Control (optional) */}
          {!isNavigatingRoute && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <span>Speed:</span>
              <button
                onClick={() => setNavigationSpeed(1200)}
                className={`px-2 py-1 rounded ${navigationSpeed === 1200 ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              >
                Slow
              </button>
              <button
                onClick={() => setNavigationSpeed(800)}
                className={`px-2 py-1 rounded ${navigationSpeed === 800 ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              >
                Normal
              </button>
              <button
                onClick={() => setNavigationSpeed(400)}
                className={`px-2 py-1 rounded ${navigationSpeed === 400 ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              >
                Fast
              </button>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
)
```

✅ **Phase 6 Complete!** Sequential route navigation working with progress UI.

---

## Phase 7: Main App Integration

**Duration:** 15 minutes
**Files Modified:** `src/routes/index.tsx`
**Dependencies:** All previous phases

### Objectives
- ✅ Chat component added to main app
- ✅ Navigation callbacks connected
- ✅ Current location context wired
- ✅ No regressions in existing features

### Implementation

Same as original Phase 4 - no changes needed!

Add to `src/routes/index.tsx`:

```typescript
import { AICampusChat } from '../components/chat/AICampusChat'

// ... in component return:
<AICampusChat
  currentPhotoId={currentPhotoId}
  onNavigate={jumpToPhoto}
/>
```

✅ **Phase 7 Complete!** AI assistant integrated into main app.

---

## Phase 8: Testing & Deployment

**Duration:** 45 minutes
**Files:** Various tests, documentation
**Dependencies:** Complete implementation

### Objectives
- ✅ Unit tests passing (pathfinding)
- ✅ Integration tests passing (navigation flow)
- ✅ End-to-end testing completed
- ✅ Performance validated
- ✅ Production deployment successful

### Step 8.1: Pathfinding Tests (10 min)

Expand `src/lib/__tests__/pathfinding.test.ts`:

```typescript
describe('BFS Pathfinding - Extended Tests', () => {
  test('finds path through multiple buildings', () => {
    const result = findPath('a-f1-north-entrance', 'x-f2-mid-7')
    expect(result).not.toBeNull()
    expect(result!.distance).toBeGreaterThan(5)
  })

  test('finds path using elevators for multi-floor navigation', () => {
    const result = findPath('a-f1-south-1', 'a-f2-mid-1')
    expect(result).not.toBeNull()
    // Path should include elevator
    const hasElevator = result!.path.some(id => id.includes('elevator'))
    expect(hasElevator).toBe(true)
  })

  test('finds path using stairs', () => {
    const result = findPath('library-f1-entrance', 'library-f2-entrance')
    expect(result).not.toBeNull()
  })

  test('performance: finds path in under 50ms', () => {
    const start = Date.now()
    findPath('a-f1-north-entrance', 'w-gym-entry')
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(50)
  })
})
```

### Step 8.2: Integration Tests (15 min)

Create `src/components/chat/__tests__/AICampusChat.test.tsx`:

```typescript
import { describe, test, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AICampusChat } from '../AICampusChat'

describe('AICampusChat - Route Navigation', () => {
  test('displays progress during route navigation', async () => {
    const mockNavigate = vi.fn()
    render(
      <AICampusChat currentPhotoId="a-f1-north-entrance" onNavigate={mockNavigate} />
    )

    // Simulate navigation result with path
    // (This requires mocking the getChatResponse function)
    // ... test implementation ...
  })

  test('skip button jumps to final destination', async () => {
    // ... test implementation ...
  })

  test('blocks input during route navigation', async () => {
    // ... test implementation ...
  })
})
```

### Step 8.3: End-to-End Testing Checklist (15 min)

**Manual Testing:**

- [ ] Start at A Block entrance
- [ ] Ask: "Where is the library?"
- [ ] Verify: AI describes route
- [ ] Confirm navigation
- [ ] Verify: Sequential navigation starts
- [ ] Verify: Progress bar shows step count
- [ ] Verify: Arrives at library entrance
- [ ] Verify: Confirmation message appears

**Cross-Building Navigation:**

- [ ] Navigate from A Block to W Block (gym)
- [ ] Verify path goes through connecting corridors
- [ ] No teleporting through walls

**Multi-Floor Navigation:**

- [ ] Navigate from Floor 1 to Floor 2
- [ ] Verify path includes elevator or stairs
- [ ] Proper vertical navigation

**Edge Cases:**

- [ ] Already at destination → confirms already there
- [ ] Invalid location → helpful error message
- [ ] Disconnected area → "no path found" error
- [ ] During navigation → input disabled
- [ ] Skip button → jumps to end
- [ ] Close chat during navigation → cancels properly

### Step 8.4: Deploy to Production (5 min)

```bash
# Run all tests
npm run test

# Build
npm run build

# Commit
git add .
git commit -m "Implement AI campus assistant with BFS pathfinding

- Add BFS pathfinding algorithm for route finding
- Integrate OpenAI function calling for navigation
- Implement sequential route visualization
- Add progress UI with step counter and skip option
- Full type safety and error handling"

# Push
git push origin development

# Merge to master (or create PR)
git checkout master
git merge development
git push origin master
```

Vercel will auto-deploy.

### Step 8.5: Post-Launch Monitoring (ongoing)

**First Hour:**
- [ ] Test on production URL
- [ ] Check OpenAI usage dashboard
- [ ] Monitor Vercel logs for errors
- [ ] Test navigation on mobile

**First 24 Hours:**
- [ ] User feedback
- [ ] Error rate < 5%
- [ ] Navigation success rate > 90%
- [ ] Response time < 3s average

✅ **Phase 8 Complete!** System deployed and monitored.

---

## Complete Implementation Checklist

### Phase 1: Setup ✅
- [ ] OpenAI account created
- [ ] API key configured in `.env.local`
- [ ] OpenAI SDK installed
- [ ] Connection test successful

### Phase 2: Pathfinding ✅
- [ ] `pathfinding.ts` created
- [ ] BFS algorithm implemented
- [ ] Unit tests written and passing
- [ ] Performance validated (<10ms)

### Phase 3: Basic AI ✅
- [ ] `ai.ts` server function created
- [ ] OpenAI function calling configured
- [ ] Basic navigation working
- [ ] Error handling implemented

### Phase 4: Pathfinding Integration ✅
- [ ] `FunctionCall` interface enhanced
- [ ] Pathfinding integrated into AI server
- [ ] Path arrays returned
- [ ] "No path found" handled

### Phase 5: Chat UI ✅
- [ ] `AICampusChat.tsx` created
- [ ] Message display working
- [ ] Input/submit functional
- [ ] Loading states implemented
- [ ] Minimize/maximize/close working

### Phase 6: Route Navigation ✅
- [ ] Sequential navigation implemented
- [ ] Progress UI added
- [ ] Skip button functional
- [ ] Speed controls added (optional)
- [ ] Cleanup on unmount

### Phase 7: Integration ✅
- [ ] Chat added to `index.tsx`
- [ ] Navigation callbacks connected
- [ ] Current location context working
- [ ] No regressions

### Phase 8: Testing & Deployment ✅
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] End-to-end testing complete
- [ ] Production deployed
- [ ] Monitoring configured

---

## File Structure Summary

```
src/
├── lib/
│   ├── ai.ts                          # AI server function (Phases 3-4)
│   ├── pathfinding.ts                 # BFS algorithm (Phase 2)
│   └── __tests__/
│       └── pathfinding.test.ts        # Unit tests (Phase 2)
├── components/
│   └── chat/
│       ├── AICampusChat.tsx          # Chat UI + route nav (Phases 5-6)
│       └── __tests__/
│           └── AICampusChat.test.tsx # Integration tests (Phase 8)
├── routes/
│   └── index.tsx                      # Main app integration (Phase 7)
└── data/
    └── blockUtils.ts                  # Used by pathfinding (existing)
```

**New Files:** 3
**Modified Files:** 1
**Test Files:** 2
**Total Lines of Code:** ~800

---

## Time Investment Comparison

| Approach | Time | Files | Complexity | Result |
|----------|------|-------|------------|--------|
| **Copilot Studio** | 21 hours | 15+ | Very High | ❌ Blocked by licensing |
| **OpenAI + Direct Jump** | 1.5 hours | 3 | Low | ⚠️ Poor UX (teleporting) |
| **OpenAI + Pathfinding** | 6 hours | 5 | Medium | ✅ Excellent UX |

**Winner:** OpenAI + Pathfinding (71% time savings vs Copilot, professional UX)

---

## Next Steps

**Ready to implement?** Start with Phase 1!

Each phase builds on the previous one, so follow the order:

1. **Phase 1** → Get OpenAI working
2. **Phase 2** → Build pathfinding (independent of AI)
3. **Phase 3** → Basic AI responses
4. **Phase 4** → Connect AI to pathfinding
5. **Phase 5** → Build chat UI
6. **Phase 6** → Add route visualization
7. **Phase 7** → Integrate into main app
8. **Phase 8** → Test and deploy

**Each phase is independently testable!**

---

**Questions? Need help with any phase?** I can assist with implementation details, debugging, or code reviews at any stage!
