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

  const candidate = value as Partial<DirectionDefinition>
  return typeof candidate.connection === 'string' && candidate.connection.length > 0
}

/**
 * Describes the result produced by the BFS pathfinding algorithm.
 *
 * Provides the ordered list of campus photo IDs representing the optimal
 * navigation route, along with metadata used for validation and UI display.
 *
 * @property path - Ordered sequence of photo IDs from origin to destination
 * @property distance - Number of navigation steps required (path length minus one)
 * @property startId - Photo ID supplied as the origin
 * @property endId - Photo ID supplied as the destination
 */
export interface PathfindingResult {
  path: string[]
  distance: number
  startId: string
  endId: string
}

/**
 * Locate the shortest route between two photos in the campus tour graph.
 *
 * Executes a breadth-first search across the unweighted navigation graph,
 * ensuring the first time the destination is discovered yields the optimal
 * path. Returns null when either endpoint is missing or no route exists.
 *
 * @param startPhotoId - Existing photo ID representing the visitor's current location
 * @param endPhotoId - Existing photo ID representing the desired destination
 * @returns Pathfinding result when successful, otherwise null
 *
 * @example
 * ```typescript
 * const result = findPath('a-f1-north-entrance', 'library-f1-entrance')
 * if (result) {
 *   console.log(result.distance)
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
    .map(direction => photo.directions[direction])
    .filter(isDirectionDefinition)
    .map(definition => definition.connection)

  const multiConnections = MULTI_VALUE_DIRECTIONS.flatMap(direction => {
    const entry = photo.directions[direction]
    if (!entry) {
      return []
    }

    return Array.isArray(entry) ? entry : [entry]
  })

  const floorConnections = FLOOR_DIRECTIONS.flatMap(direction => {
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
  const baseLabel = [buildingLabel, floorLabel].filter(Boolean).join(' ')
  const wing = photo?.buildingContext?.wing

  if (baseLabel && wing) {
    return `${baseLabel} (${wing})`
  }

  if (baseLabel) {
    return baseLabel
  }

  return photo?.id ?? photoId
}

/**
 * Convert a pathfinding result into a concise description for UI or chat.
 *
 * Generates a human-readable summary detailing how many steps are required
 * and which general areas the visitor will traverse.
 *
 * @param result - Valid pathfinding result produced by `findPath`
 * @returns Friendly sentence describing the route
 *
 * @example
 * ```typescript
 * const summary = getRouteDescription(result)
 * console.log(summary)
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

  const stepsLabel = result.distance === 1 ? '1 step' : `${result.distance} steps`
  return `Route found: ${stepsLabel} from ${startLabel} to ${endLabel}.`
}

/**
 * Estimate traversal time for a pathfinding result.
 *
 * Uses a configurable average pace to predict how long a visitor will need
 * to walk the suggested route, returning both raw seconds and a formatted
 * label for display.
 *
 * @param result - Valid pathfinding result produced by `findPath`
 * @param secondsPerStep - Average number of seconds per navigation hop (default 0.8)
 * @returns Object containing the raw seconds value and formatted label
 *
 * @example
 * ```typescript
 * const estimate = getEstimatedTravelTime(result, 1)
 * console.log(estimate.formatted)
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
 * Confirm that a pathfinding result represents a valid route.
 *
 * Verifies the origin and destination match expectations, every hop connects
 * two photos with a defined edge, and all referenced photos exist in the tour data.
 *
 * @param result - Pathfinding result to examine
 * @returns Boolean indicating whether the path satisfies all constraints
 *
 * @example
 * ```typescript
 * if (!validatePath(result)) {
 *   throw new Error('Invalid route')
 * }
 * ```
 */
export function validatePath(result: PathfindingResult): boolean {
  if (result.path.length === 0) {
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
