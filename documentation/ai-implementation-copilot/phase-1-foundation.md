# Phase 1: Foundation & Setup

**Duration:** 4 hours
**Difficulty:** Easy
**Prerequisites:** Node.js 18+, Git, Vercel account

---

## Objectives

By the end of this phase, you will have:

1. ✅ Ably account with API keys configured
2. ✅ All required npm packages installed
3. ✅ Environment variables properly configured
4. ✅ Build script for navigation graph creation
5. ✅ Location directory generator for Copilot knowledge base
6. ✅ Graph validation tooling
7. ✅ Static assets generated and ready to use

---

## Step 1.1: Create Ably Account and Get API Keys

**Time:** 15 minutes

### 1.1.1 - Sign Up for Ably

1. Go to https://ably.com/sign-up
2. Click "Sign up free"
3. Enter your email and create password
4. Verify your email address
5. You'll be redirected to the Ably dashboard

### 1.1.2 - Create New App

1. In Ably dashboard, click "Create New App"
2. Name it: `vr-campus-tour-navigation`
3. Select region: Choose closest to your users (e.g., `us-east-1-a` for US)
4. Click "Create app"

### 1.1.3 - Get API Keys

1. In your app dashboard, click "API Keys" tab
2. You'll see a "Root key" - this is your **private server key**
3. Click "Copy" next to the key (looks like: `abc123.def456:ghi789jkl...`)
4. **IMPORTANT:** Save this key securely - you'll need it in Step 1.3

**What the key looks like:**
```
Format: APP_ID.KEY_ID:KEY_SECRET
Example: xVLyHw.A-B1Cq:Xj9Kp2Lm3Nq4Rs5Tv6Wz7Yx8
```

### 1.1.4 - Verify Free Tier Limits

In the dashboard, confirm you see:
- **6 million messages/month** ✅
- **200 concurrent connections** ✅
- **Message history:** 2 minutes ✅

**✅ Validation:** You have an Ably API key that starts with your app ID

---

## Step 1.2: Install Required NPM Packages

**Time:** 10 minutes

### 1.2.1 - Install Ably Packages

Open your terminal in the project root:

```bash
cd C:\Users\rishe\Documents\GitHub\software-development-project

# Install Ably client and server packages
npm install ably @ably/react
```

**Expected output:**
```
added 2 packages, and audited 523 packages in 8s
```

### 1.2.2 - Install Build Script Dependencies

```bash
# For TypeScript script execution
npm install --save-dev tsx

# For graph validation (optional but recommended)
npm install --save-dev vitest @vitest/ui
```

### 1.2.3 - Verify Installation

```bash
# Check package.json includes new dependencies
cat package.json | grep ably
```

**Expected output:**
```json
"ably": "^2.0.0",
"@ably/react": "^2.0.0"
```

**✅ Validation:** `node_modules/ably` and `node_modules/@ably/react` directories exist

---

## Step 1.3: Configure Environment Variables

**Time:** 10 minutes

### 1.3.1 - Add Ably API Key to .env.local

Open `.env.local` file (create if it doesn't exist):

```bash
# For Windows
notepad .env.local

# For VS Code
code .env.local
```

Add the following lines:

```env
# Ably Configuration
ABLY_API_KEY=your-key-from-step-1.1.3-here

# Session Configuration
SESSION_LIFETIME_MS=86400000

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_SECONDS=60

# Feature Flags
ENABLE_AI_NAVIGATION=true
ENABLE_ANALYTICS=false
```

**Replace `your-key-from-step-1.1.3-here` with your actual Ably key!**

### 1.3.2 - Add to .gitignore

**CRITICAL:** Ensure your env files are NOT committed to git:

```bash
# Check if .env.local is in .gitignore
cat .gitignore | grep ".env.local"
```

If you DON'T see `.env.local` in the output, add it (and ignore other env variants while you're here):

```bash
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

### 1.3.3 - Configure Vercel Environment Variables

**For production deployment:**

1. Go to https://vercel.com/your-username/software-development-project
2. Click "Settings" tab
3. Click "Environment Variables" in sidebar
4. Add each variable:
   - Key: `ABLY_API_KEY`
   - Value: (paste your Ably key)
   - Environment: Production, Preview, Development (check all)
   - Click "Save"

Repeat for:
- `SESSION_LIFETIME_MS` = `86400000`
- `ENABLE_AI_NAVIGATION` = `true`

**✅ Validation:** Run `cat .env.local` and see your Ably key, `.env.local` is in `.gitignore`

---

## Step 1.4: Create Build Script for Navigation Graph

**Time:** 30 minutes

### 1.4.1 - Create Scripts Directory

```bash
mkdir -p scripts
```

### 1.4.2 - Enable JSON Imports for Build Script

Update `tsconfig.json` so the TypeScript compiler can import generated JSON assets:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "moduleResolution": "bundler",
    "isolatedModules": true
  }
}
```

If the file already contains these keys, just ensure `resolveJsonModule` is set to `true`. This prevents runtime import errors when `navigationGraph.ts` loads the compiled graph.

### 1.4.3 - Create Graph Builder Script

Create `scripts/build-navigation-graph.ts`:

```bash
# For Windows
notepad scripts\build-navigation-graph.ts

# For VS Code
code scripts\build-navigation-graph.ts
```

**Paste this complete code:**

```typescript
/**
 * Navigation Graph Build Script
 *
 * Generates a pre-compiled navigation graph at build time.
 * This eliminates cold-start graph building and ensures deterministic routing.
 *
 * Run with: npm run build:graph
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { getAllAreas } from '../src/data/blockUtils'
import type { Area, DirectionType, Elevator } from '../src/types/tour'

interface SerializedEdge {
  direction: DirectionType
  target: string
}

interface SerializedNodeMetadata {
  buildingBlock: string
  floorLevel: number
  areaName: string
}

interface SerializedNode {
  photoId: string
  edges: SerializedEdge[]
  metadata: SerializedNodeMetadata
}

interface SerializedGraph {
  nodes: Record<string, SerializedNode>
  metadata: {
    builtAt: string
    version: string
    nodeCount: number
    edgeCount: number
    buildDuration: number
  }
}

function isArea(item: Area | Elevator): item is Area {
  return 'photos' in item
}

function pushEdge(edges: SerializedEdge[], direction: DirectionType, target: string) {
  edges.push({
    direction,
    target
  })
}

function buildGraph(): SerializedGraph {
  const startedAt = Date.now()
  const nodes: Record<string, SerializedNode> = {}
  let edgeCount = 0

  console.log('🔨 Building navigation graph…')

  for (const item of getAllAreas()) {
    if (isArea(item)) {
      for (const photo of item.photos) {
        const edges: SerializedEdge[] = []

        for (const [direction, rawTarget] of Object.entries(photo.directions)) {
          if (!rawTarget) {
            continue
          }

          if (typeof rawTarget === 'string') {
            pushEdge(edges, direction as DirectionType, rawTarget)
            edgeCount += 1
          } else if (Array.isArray(rawTarget)) {
            rawTarget.forEach(target => {
              pushEdge(edges, direction as DirectionType, target)
              edgeCount += 1
            })
          } else if (typeof rawTarget === 'object' && typeof rawTarget.connection === 'string') {
            pushEdge(edges, direction as DirectionType, rawTarget.connection)
            edgeCount += 1
          }
        }

        nodes[photo.id] = {
          photoId: photo.id,
          edges,
          metadata: {
            buildingBlock: item.buildingBlock,
            floorLevel: item.floorLevel,
            areaName: item.name
          }
        }
      }
    } else {
      const edges: SerializedEdge[] = []
      const { floorConnections } = item.photo

      (['floor1', 'floor2', 'floor3', 'floor4'] as DirectionType[]).forEach(direction => {
        const target = floorConnections[direction]
        if (target) {
          pushEdge(edges, direction, target)
          edgeCount += 1
        }
      })

      nodes[item.photo.id] = {
        photoId: item.photo.id,
        edges,
        metadata: {
          buildingBlock: 'elevator',
          floorLevel: 0,
          areaName: 'Elevator'
        }
      }
    }
  }

  const buildDuration = Date.now() - startedAt

  console.log(`✅ Graph built successfully!`)
  console.log(`   Nodes: ${Object.keys(nodes).length}`)
  console.log(`   Edges: ${edgeCount}`)
  console.log(`   Duration: ${buildDuration}ms`)

  return {
    nodes,
    metadata: {
      builtAt: new Date().toISOString(),
      version: '3.1.0',
      nodeCount: Object.keys(nodes).length,
      edgeCount,
      buildDuration
    }
  }
}

function saveGraph(graph: SerializedGraph) {
  const outputDir = join(process.cwd(), 'src', 'assets')
  const outputPath = join(outputDir, 'navigation-graph.json')

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  writeFileSync(outputPath, JSON.stringify(graph, null, 2), 'utf-8')

  console.log(`💾 Graph saved to: ${outputPath}`)
  console.log(`📦 File size: ${(JSON.stringify(graph).length / 1024).toFixed(2)} KB`)
}

try {
  const graph = buildGraph()
  saveGraph(graph)
  process.exit(0)
} catch (error) {
  console.error('❌ Graph build failed:', error)
  process.exit(1)
}
```

### 1.4.3 - Add Build Script to package.json

Open `package.json` and add to `scripts` section:

```json
{
  "scripts": {
    "build:graph": "tsx scripts/build-navigation-graph.ts",
    "prebuild": "npm run build:graph",
    "predev": "npm run build:graph"
  }
}
```

This ensures graph rebuilds automatically before `npm run build` or `npm run dev`.

### 1.4.4 - Test Graph Build

```bash
npm run build:graph
```

**Expected output:**
```
🔨 Building navigation graph...
📊 Processing 15 areas/elevators
✅ Graph built successfully!
   Nodes: 487
   Edges: 1,234
   Duration: 23ms
💾 Graph saved to: C:\Users\rishe\...\src\assets\navigation-graph.json
📦 File size: 156.78 KB
```

### 1.4.5 - Verify Generated File

```bash
# Check file exists
ls src\assets\navigation-graph.json

# View first few lines
head -n 20 src\assets\navigation-graph.json
```

**You should see:**
```json
{
  "nodes": {
    "a-f1-north-entrance": {
      "photoId": "a-f1-north-entrance",
      "edges": {
        "forward": "a-f1-north-1",
        "left": "a-f1-hallway-west"
      },
      "metadata": {
        "buildingBlock": "a",
        "floorLevel": 1,
        "areaName": "A Block Floor 1"
      }
    },
    ...
  }
}
```

**✅ Validation:** File `src/assets/navigation-graph.json` exists and is >100KB

---

## Step 1.5: Create Location Directory Generator

**Time:** 45 minutes

### 1.5.1 - Create API Route

Create `src/routes/api/location-directory.tsx`:

```bash
code src\routes\api\location-directory.tsx
```

**Paste this complete code:**

```typescript
/**
 * Location Directory API
 *
 * Generates a comprehensive location directory for Copilot Studio knowledge base.
 * This includes key landmarks, rooms, and facilities with aliases for natural language matching.
 *
 * GET /api/location-directory
 * Returns JSON array of location entries
 */

import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getAllAreas } from '../../data/blockUtils'
import type { Area } from '../../types/tour'

/**
 * Location entry for Copilot knowledge base
 *
 * @property photoId - Target photo ID for navigation
 * @property locationName - Primary display name
 * @property aliases - Alternative names (synonyms, typos, common variations)
 * @property buildingBlock - Building identifier (a, b, n, w, etc.)
 * @property floorLevel - Floor number (0=ground, 1=first, etc.)
 * @property description - Detailed description for semantic matching
 * @property category - Location type for filtering
 * @property nearbyRooms - Adjacent rooms visible from this photo
 */
interface LocationEntry {
  photoId: string
  locationName: string
  aliases: string[]
  buildingBlock: string
  floorLevel: number
  description: string
  category: 'landmark' | 'room' | 'facility' | 'outdoor'
  nearbyRooms?: string[]
}

/**
 * Manually curated key landmarks
 *
 * These are the most important locations users will ask about.
 * Curated manually to ensure high-quality semantic matching.
 */
const KEY_LANDMARKS: LocationEntry[] = [
  {
    photoId: 'library-main-entrance',
    locationName: 'Library',
    aliases: [
      'Main Library',
      'Library Entrance',
      'Books',
      'Study Area',
      'Reading Room',
      'Book Place',
      'Where to study'
    ],
    buildingBlock: 'library',
    floorLevel: 0,
    description: 'Main library entrance on ground floor. Central study area with books, computers, quiet study spaces, and research facilities.',
    category: 'landmark'
  },
  {
    photoId: 'w-gym-entry',
    locationName: 'Gymnasium',
    aliases: [
      'Gym',
      'Sports Hall',
      'W Block Gym',
      'Recreation Center',
      'Sports Center',
      'Workout Area',
      'Fitness Center'
    ],
    buildingBlock: 'w',
    floorLevel: 1,
    description: 'W Block gymnasium and sports facilities. Indoor basketball court, volleyball court, and fitness equipment.',
    category: 'facility'
  },
  {
    photoId: 'lounge-main',
    locationName: 'Student Lounge',
    aliases: [
      'Student Common Area',
      'Lounge',
      'Common Room',
      'Hangout Area',
      'Break Room',
      'Social Space'
    ],
    buildingBlock: 'lounge',
    floorLevel: 1,
    description: 'Main student lounge and social area. Comfortable seating, vending machines, tables for group work, and relaxation spaces.',
    category: 'landmark'
  },
  {
    photoId: 'a-f1-north-entrance',
    locationName: 'A Block Entrance',
    aliases: [
      'A Block',
      'Academic Block A',
      'Main Academic Building',
      'A Building',
      'Block A'
    ],
    buildingBlock: 'a',
    floorLevel: 1,
    description: 'Main entrance to A Block academic building. Primary classroom building with lecture halls, laboratories, and faculty offices.',
    category: 'landmark'
  },
  {
    photoId: 'n-sandy-office',
    locationName: "Professor Sandy's Office",
    aliases: [
      'Sandy Office',
      'N Block Office',
      'Faculty Office N',
      'Professor Sandy',
      'Sandys Office'
    ],
    buildingBlock: 'n',
    floorLevel: 1,
    description: "Professor Sandy's faculty office in N Block. Available during office hours for student consultations and academic advising.",
    category: 'room'
  },
  {
    photoId: 'outside-main-entrance',
    locationName: 'Main Campus Entrance',
    aliases: [
      'Main Entrance',
      'Campus Gate',
      'Front Entrance',
      'Main Gate',
      'Campus Entry'
    ],
    buildingBlock: 'outside',
    floorLevel: 0,
    description: 'Main entrance to campus. Starting point for campus tours.',
    category: 'outdoor'
  }
]

/**
 * Generate location directory from campus data
 *
 * Combines curated landmarks with auto-generated room entries from nearbyRooms data.
 */
function generateLocationDirectory(): LocationEntry[] {
  const locations: LocationEntry[] = [...KEY_LANDMARKS]
  const allAreas = getAllAreas()

  // Auto-generate entries from nearbyRooms
  for (const item of allAreas) {
    if ('photos' in item) {
      const area = item as Area

      for (const photo of area.photos) {
        if (photo.nearbyRooms && photo.nearbyRooms.length > 0) {
          for (const room of photo.nearbyRooms) {
            // Skip restrooms and storage (too many, not useful)
            if (room.roomType === 'restroom' || room.roomType === 'storage') {
              continue
            }

            // Generate entry for each important room
            locations.push({
              photoId: photo.id,
              locationName: room.roomNumber,
              aliases: [
                room.roomNumber,
                `Room ${room.roomNumber}`,
                `${area.buildingBlock.toUpperCase()} ${room.roomNumber}`,
                `${room.roomType} ${room.roomNumber}`
              ],
              buildingBlock: area.buildingBlock,
              floorLevel: area.floorLevel,
              description: `${room.roomType} ${room.roomNumber} in ${area.name} on floor ${area.floorLevel}`,
              category: 'room',
              nearbyRooms: photo.nearbyRooms.map(r => r.roomNumber)
            })
          }
        }
      }
    }
  }

  // Remove duplicates by photoId (prefer landmarks over auto-generated)
  const uniqueLocations = new Map<string, LocationEntry>()
  for (const loc of locations) {
    if (!uniqueLocations.has(loc.photoId)) {
      uniqueLocations.set(loc.photoId, loc)
    }
  }

  return Array.from(uniqueLocations.values())
}

/**
 * API Route Handler
 */
export const Route = createFileRoute('/api/location-directory')({
  server: {
    handlers: {
      GET: async () => {
        console.info('[API] Generating location directory')

        const locations = generateLocationDirectory()

        return json({
          success: true,
          count: locations.length,
          data: locations,
          metadata: {
            generatedAt: new Date().toISOString(),
            version: '3.0.0'
          }
        })
      }
    }
  }
})
```

### 1.5.2 - Test Location Directory API

Start dev server if not already running:

```bash
npm run dev
```

In another terminal, test the API:

```bash
curl http://localhost:3000/api/location-directory
```

**Expected output:**
```json
{
  "success": true,
  "count": 42,
  "data": [
    {
      "photoId": "library-main-entrance",
      "locationName": "Library",
      "aliases": ["Main Library", "Books", ...],
      "buildingBlock": "library",
      "floorLevel": 0,
      "description": "Main library entrance...",
      "category": "landmark"
    },
    ...
  ],
  "metadata": {
    "generatedAt": "2025-01-15T10:30:00.000Z",
    "version": "3.0.0"
  }
}
```

### 1.5.3 - Generate Static File for Copilot

```bash
curl http://localhost:3000/api/location-directory > src\assets\location-directory.json
```

**✅ Validation:** File `src/assets/location-directory.json` exists with 20+ locations

---

## Step 1.6: Create Graph Validation Script

**Time:** 30 minutes

### 1.6.1 - Create Validation Script

Create `scripts/validate-graph.ts`:

```typescript
/**
 * Graph Validation Script
 *
 * Validates the navigation graph for:
 * - Unreachable nodes (disconnected components)
 * - One-way connections (missing reverse edges)
 * - Missing photo references
 * - Orphaned nodes
 *
 * Run with: npm run validate:graph
 */

import graphData from '../src/assets/navigation-graph.json'

interface GraphIssue {
  type: 'unreachable' | 'one_way' | 'missing_destination' | 'orphaned'
  photoId: string
  message: string
  severity: 'error' | 'warning' | 'info'
}

interface ValidationResult {
  valid: boolean
  issues: GraphIssue[]
  stats: {
    totalNodes: number
    reachableNodes: number
    unreachableNodes: number
    totalEdges: number
    oneWayConnections: number
  }
}

/**
 * Validate graph connectivity
 */
function validateGraph(): ValidationResult {
  const issues: GraphIssue[] = []
  const nodes = graphData.nodes

  console.log('🔍 Validating navigation graph...')
  console.log(`📊 Total nodes: ${Object.keys(nodes).length}`)

  // Find a suitable start node (main entrance)
  const startPhotoId = 'a-f1-north-entrance' // Adjust to your actual start
  if (!nodes[startPhotoId]) {
    console.warn(`⚠️  Start photo "${startPhotoId}" not found, using first node`)
  }
  const actualStart = nodes[startPhotoId] ? startPhotoId : Object.keys(nodes)[0]

  // BFS to find reachable nodes
  const reachable = new Set<string>()
  const queue = [actualStart]

  while (queue.length > 0) {
    const current = queue.shift()!
    if (reachable.has(current)) continue

    reachable.add(current)
    const node = nodes[current]

    if (node) {
      for (const [_, neighborId] of Object.entries(node.edges)) {
        if (!reachable.has(neighborId)) {
          queue.push(neighborId)
        }
      }
    }
  }

  // Find unreachable nodes
  for (const [photoId, node] of Object.entries(nodes)) {
    if (!reachable.has(photoId)) {
      issues.push({
        type: 'unreachable',
        photoId,
        message: `Photo "${photoId}" is not reachable from start location`,
        severity: 'error'
      })
    }
  }

  // Find one-way connections
  let oneWayCount = 0
  for (const [photoId, node] of Object.entries(nodes)) {
    for (const [direction, neighborId] of Object.entries(node.edges)) {
      const neighborNode = nodes[neighborId]

      if (!neighborNode) {
        issues.push({
          type: 'missing_destination',
          photoId,
          message: `Photo "${photoId}" has edge to non-existent photo "${neighborId}"`,
          severity: 'error'
        })
        continue
      }

      // Check if reverse edge exists
      const hasReverse = Object.values(neighborNode.edges).includes(photoId)
      if (!hasReverse) {
        oneWayCount++
        issues.push({
          type: 'one_way',
          photoId,
          message: `One-way connection: ${photoId} → ${neighborId} (no reverse path)`,
          severity: 'warning'
        })
      }
    }
  }

  // Calculate total edges
  const totalEdges = Object.values(nodes).reduce(
    (sum, node) => sum + Object.keys(node.edges).length,
    0
  )

  const result: ValidationResult = {
    valid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    stats: {
      totalNodes: Object.keys(nodes).length,
      reachableNodes: reachable.size,
      unreachableNodes: Object.keys(nodes).length - reachable.size,
      totalEdges,
      oneWayConnections: oneWayCount
    }
  }

  return result
}

/**
 * Print validation results
 */
function printResults(result: ValidationResult): void {
  console.log('\n' + '='.repeat(60))
  console.log('VALIDATION RESULTS')
  console.log('='.repeat(60))

  console.log('\n📊 Statistics:')
  console.log(`   Total nodes: ${result.stats.totalNodes}`)
  console.log(`   Reachable nodes: ${result.stats.reachableNodes}`)
  console.log(`   Unreachable nodes: ${result.stats.unreachableNodes}`)
  console.log(`   Total edges: ${result.stats.totalEdges}`)
  console.log(`   One-way connections: ${result.stats.oneWayConnections}`)

  if (result.issues.length === 0) {
    console.log('\n✅ GRAPH IS VALID - No issues found!')
    return
  }

  const errors = result.issues.filter(i => i.severity === 'error')
  const warnings = result.issues.filter(i => i.severity === 'warning')

  if (errors.length > 0) {
    console.log(`\n❌ ERRORS (${errors.length}):`)
    errors.slice(0, 10).forEach(issue => {
      console.log(`   • ${issue.message}`)
    })
    if (errors.length > 10) {
      console.log(`   ... and ${errors.length - 10} more errors`)
    }
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${warnings.length}):`)
    warnings.slice(0, 5).forEach(issue => {
      console.log(`   • ${issue.message}`)
    })
    if (warnings.length > 5) {
      console.log(`   ... and ${warnings.length - 5} more warnings`)
    }
  }

  console.log('\n' + '='.repeat(60))

  if (result.valid) {
    console.log('✅ VALIDATION PASSED (warnings only)')
  } else {
    console.log('❌ VALIDATION FAILED (errors found)')
  }
}

/**
 * Main execution
 */
try {
  const result = validateGraph()
  printResults(result)
  process.exit(result.valid ? 0 : 1)
} catch (error) {
  console.error('❌ Validation failed:', error)
  process.exit(1)
}
```

### 1.6.2 - Add Validation Script to package.json

Add to `scripts` section:

```json
{
  "scripts": {
    "validate:graph": "tsx scripts/validate-graph.ts"
  }
}
```

### 1.6.3 - Run Validation

```bash
npm run validate:graph
```

**Expected output (if graph is valid):**
```
🔍 Validating navigation graph...
📊 Total nodes: 487

============================================================
VALIDATION RESULTS
============================================================

📊 Statistics:
   Total nodes: 487
   Reachable nodes: 487
   Unreachable nodes: 0
   Total edges: 1,234
   One-way connections: 12

⚠️  WARNINGS (12):
   • One-way connection: elevator-ns-f1 → n-f1-mid-5 (no reverse path)
   ... and 7 more warnings

============================================================
✅ VALIDATION PASSED (warnings only)
```

**If you see ERRORS (unreachable nodes):**
- Check your photo data files in `src/data/blocks/`
- Ensure all photos have at least one incoming connection
- Fix missing connections before proceeding

**✅ Validation:** Script exits with code 0 (no errors), warnings are acceptable

---

## Step 1.7: Generate Initial Static Assets

**Time:** 5 minutes

### 1.7.1 - Build Everything

```bash
# Build graph
npm run build:graph

# Validate graph
npm run validate:graph

# Generate location directory
npm run dev &
sleep 5
curl http://localhost:3000/api/location-directory > src\assets\location-directory.json
```

### 1.7.2 - Verify All Assets Exist

```bash
ls src\assets\
```

**Expected output:**
```
navigation-graph.json
location-directory.json
```

### 1.7.3 - Check File Sizes

```bash
# Windows PowerShell
Get-ChildItem src\assets\ | Select-Object Name, Length

# Expected:
# navigation-graph.json    ~150-200 KB
# location-directory.json  ~10-20 KB
```

**✅ Validation:** Both files exist in `src/assets/` with reasonable sizes

---

## Phase 1 Complete! 🎉

### Checklist Review

Go back to `overview.md` and check off Phase 1 items:

- [x] 1.1 - Create Ably account and get API keys
- [x] 1.2 - Install required npm packages
- [x] 1.3 - Configure environment variables
- [x] 1.4 - Create build script for navigation graph
- [x] 1.5 - Create location directory generator
- [x] 1.6 - Validate graph connectivity
- [x] 1.7 - Generate initial static assets

### Validation Tests

Before moving to Phase 2, verify:

1. ✅ `npm run build:graph` completes without errors
2. ✅ `npm run validate:graph` passes (no errors, warnings OK)
3. ✅ `src/assets/navigation-graph.json` exists and is >100KB
4. ✅ `src/assets/location-directory.json` exists with 20+ locations
5. ✅ `.env.local` contains `ABLY_API_KEY` and is in `.gitignore`
6. ✅ `node_modules/ably` and `node_modules/@ably/react` exist

### Troubleshooting

**Issue:** "Module not found: '@tanstack/react-router'"
- Solution: Run `npm install` to ensure all dependencies are installed

**Issue:** "Cannot find module '../src/data/blockUtils'"
- Solution: Verify your project structure matches expected paths

**Issue:** Graph build fails with "getAllAreas is not a function"
- Solution: Check that `src/data/blockUtils.ts` exports `getAllAreas`

**Issue:** Validation shows many unreachable nodes
- Solution: This means your photo data has disconnected components. Check that every photo has at least one connection to/from another photo.

**Issue:** Ably API key not working
- Solution: Verify you copied the **entire** key including the colon and secret part (format: `APP_ID.KEY_ID:KEY_SECRET`)

---

## Next Steps

**Proceed to Phase 2:** [phase-2-core-navigation.md](./phase-2-core-navigation.md)

You'll implement:
- Navigation graph loader (runtime)
- BFS pathfinding algorithm
- Graph types and interfaces
- Unit tests

**Estimated time:** 4 hours
