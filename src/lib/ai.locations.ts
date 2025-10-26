'use server'

import vectorStoreDocument from '../data/locations-vector-store.json'

interface VectorStoreLocation {
  id: string
  metadata?: {
    areaName?: string
    synonyms?: string[]
    roomNumbers?: string[]
    finalOrientation?: number
  }
}

function loadVectorStoreLocations(document: unknown): VectorStoreLocation[] {
  if (!Array.isArray(document)) {
    throw new Error('locations-vector-store.json is malformed. Expected an array of locations.')
  }
  return document as VectorStoreLocation[]
}

const vectorStoreLocations = loadVectorStoreLocations(vectorStoreDocument)

function extractTokens(label: string): string[] {
  return label
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map(token => token.trim())
    .filter(token => token.length >= 3)
}

const locationTokenCandidates = new Map<string, Set<string>>()
const tokenOwnership = new Map<string, Set<string>>()
const roomNumberOwnership = new Map<string, Set<string>>()

function normaliseRoomLabel(label: string): string {
  return label.toLowerCase().replace(/[\s-]+/g, '')
}

for (const location of vectorStoreLocations) {
  const tokens = new Set<string>()
  const labels: string[] = [
    ...(location.metadata?.synonyms ?? []),
    ...(location.metadata?.roomNumbers ?? []),
    location.metadata?.areaName ?? ''
  ].filter((label): label is string => !!label && label.trim().length > 0)

  for (const label of labels) {
    for (const token of extractTokens(label)) {
      tokens.add(token)
    }
  }

  locationTokenCandidates.set(location.id, tokens)

  if (location.metadata?.roomNumbers) {
    for (const roomLabel of location.metadata.roomNumbers) {
      const normalisedRoom = normaliseRoomLabel(roomLabel)
      if (!normalisedRoom) {
        continue
      }

      if (!roomNumberOwnership.has(normalisedRoom)) {
        roomNumberOwnership.set(normalisedRoom, new Set<string>())
      }
      roomNumberOwnership.get(normalisedRoom)!.add(location.id)
    }
  }

  for (const token of tokens) {
    if (!tokenOwnership.has(token)) {
      tokenOwnership.set(token, new Set<string>())
    }
    tokenOwnership.get(token)!.add(location.id)
  }
}

/**
 * Canonical list of campus photo identifiers derived from the vector store JSON
 *
 * Keeps the application in sync with the documents uploaded to the OpenAI
 * vector store so navigation requests stay aligned with available viewer nodes.
 *
 * @returns Readonly tuple of location identifiers extracted from the vector store definition
 *
 * @example
 * ```typescript
 * import { LOCATION_IDS } from './ai.locations'
 * const containsGym = LOCATION_IDS.includes('w-gym-overlook-1')
 * ```
 */
export const LOCATION_IDS = vectorStoreLocations.map(location => location.id) as ReadonlyArray<string>

/**
 * Set-based lookup generated from `LOCATION_IDS` for quick validation
 *
 * Used to ensure AI function calls reference destinations that exist in the
 * vector store and, by extension, inside the campus viewer. Includes virtual
 * location IDs that map to real photo locations.
 *
 * @returns Set of location identifiers compatible with pathfinding
 *
 * @example
 * ```typescript
 * import { VALID_LOCATION_ID_SET } from './ai.locations'
 * const isValid = VALID_LOCATION_ID_SET.has('x-f1-east-4')
 * ```
 */
export const VALID_LOCATION_ID_SET = new Set<string>([
  ...LOCATION_IDS,
  // Virtual location IDs that map to real photo locations
  'outside-s-east-5-visions',
  'outside-s-east-5-pantry',
  'x-f1-west-10-finance',
  'x-f1-west-10-careers',
  's-f1-south-2-s154',
  's-f1-south-2-s156',
  's-f2-south-5-s265',
  's-f2-south-5-s254',
  's-f2-south-7-s256',
  's-f2-south-7-s264',
  's-f2-south-7-s262'
])

/**
 * Describes keyword overrides sourced from vector store synonyms
 *
 * Each override maps the lowercased synonyms and related labels from the JSON
 * document to a single destination photoId so the assistant can correct
 * free-form navigation intents before invoking pathfinding.
 *
 * @property photoId - Destination identifier to enforce when synonyms match
 * @property keywords - Lowercase keywords harvested from metadata synonyms and labels
 */
export interface LocationKeywordOverride {
  photoId: string
  keywords: string[]
}

/**
 * Keyword overrides automatically generated from vector store metadata
 *
 * Ensures phrases such as "coffee shop" or "campus gym" are coerced to the
 * appropriate photoId even if the AI produces a nearby but incorrect match.
 *
 * @returns Array of overrides linking lowercased synonyms to canonical ids
 *
 * @example
 * ```typescript
 * import { LOCATION_KEYWORD_OVERRIDES } from './ai.locations'
 * const cafeOverride = LOCATION_KEYWORD_OVERRIDES.find(entry => entry.photoId === 'x-f1-east-4')
 * ```
 */
export const LOCATION_KEYWORD_OVERRIDES: ReadonlyArray<LocationKeywordOverride> = vectorStoreLocations
  .map(location => {
    const uniqueKeywords = new Set<string>()
    if (location.metadata?.synonyms) {
      for (const synonym of location.metadata.synonyms) {
        const trimmed = synonym.trim().toLowerCase()
        if (trimmed) {
          uniqueKeywords.add(trimmed)
        }
      }
    }
    if (location.metadata?.areaName) {
      const areaName = location.metadata.areaName.trim().toLowerCase()
      if (areaName) {
        uniqueKeywords.add(areaName)
      }
    }
    if (location.metadata?.roomNumbers) {
      for (const room of location.metadata.roomNumbers) {
        const roomLabel = room.trim().toLowerCase()
        if (roomLabel) {
          uniqueKeywords.add(roomLabel)
        }
      }
    }
    const tokenSet = locationTokenCandidates.get(location.id)
    if (tokenSet) {
      for (const token of tokenSet) {
        const owners = tokenOwnership.get(token)
        if ((owners?.size ?? 0) === 1) {
          uniqueKeywords.add(token)
        }
      }
    }
    return {
      photoId: location.id,
      keywords: Array.from(uniqueKeywords)
    }
  })
  .filter(entry => entry.keywords.length > 0)

const ROOM_NUMBER_LOOKUP = Array.from(roomNumberOwnership.entries()).reduce<Map<string, string>>(
  (accumulator, [roomLabel, owners]) => {
    if (owners.size === 1) {
      const [photoId] = owners
      accumulator.set(roomLabel, photoId)
    }
    return accumulator
  },
  new Map<string, string>()
)

function scoreKeyword(keyword: string): number {
  const compactLength = keyword.replace(/\s+/g, '').length
  if (compactLength === 0) {
    return 0
  }
  const digitBonus = /\d/.test(keyword) ? 100 : 0
  const alphanumericBonus = /^[a-z0-9]+$/i.test(keyword) ? 10 : 0
  return compactLength + digitBonus + alphanumericBonus
}

/**
 * Locates the most specific vector store entry that matches the supplied text
 *
 * Iterates through all generated keyword overrides, computes a relevance score
 * for each match, and returns the photo identifier with the highest ranking.
 * Keywords containing room numbers or other alphanumeric identifiers are given
 * additional weight so precise intents outrank broad area names like "S Block."
 *
 * @param text - Free-form user input or assistant message to analyse
 * @returns Matched vector store photo identifier or `null` if no keyword applies
 *
 * @example
 * ```typescript
 * import { matchLocationByKeywords } from './ai.locations'
 * const destination = matchLocationByKeywords('Take me to S453 please')
 * // destination === 's-f4-north-7'
 * ```
 */
export function matchLocationByKeywords(text: string | null | undefined): string | null {
  if (!text) {
    return null
  }

  const normalised = text.toLowerCase()
  const condensed = normalised.replace(/[\s-_]+/g, '')
  let bestMatch: { photoId: string; score: number; length: number } | null = null
  const directRoomMatches = new Set<string>()
  const roomPattern = /([a-z])\s*-?\s*(\d{3,4})/gi
  let roomMatch: RegExpExecArray | null

  while ((roomMatch = roomPattern.exec(normalised)) !== null) {
    const roomIdentifier = `${roomMatch[1]}${roomMatch[2]}`.toLowerCase()
    if (directRoomMatches.has(roomIdentifier)) {
      continue
    }
    directRoomMatches.add(roomIdentifier)

    const destination = ROOM_NUMBER_LOOKUP.get(roomIdentifier)
    if (!destination) {
      continue
    }

    const roomScore = 1000 + roomMatch[2].length
    if (!bestMatch || roomScore > bestMatch.score) {
      bestMatch = {
        photoId: destination,
        score: roomScore,
        length: roomMatch[2].length
      }
    }
  }

  for (const mapping of LOCATION_KEYWORD_OVERRIDES) {
    for (const keyword of mapping.keywords) {
      if (!keyword) {
        continue
      }
      const condensedKeyword = keyword.replace(/[\s-_]+/g, '')
      const hasDirectMatch = normalised.includes(keyword)
      const hasCondensedMatch =
        condensedKeyword.length >= 3 ? condensed.includes(condensedKeyword) : false
      if (!hasDirectMatch && !hasCondensedMatch) {
        continue
      }

      const effectiveKey = condensedKeyword.length >= 3 ? condensedKeyword : keyword
      const score = scoreKeyword(effectiveKey)
      if (score === 0) {
        continue
      }

      if (
        !bestMatch ||
        score > bestMatch.score ||
        (score === bestMatch.score && effectiveKey.length > bestMatch.length)
      ) {
        bestMatch = {
          photoId: mapping.photoId,
          score,
          length: effectiveKey.length
        }
      }
    }
  }

  return bestMatch?.photoId ?? null
}

/**
 * Retrieves the final camera orientation for a specific location
 *
 * Returns the absolute camera angle in degrees that should be used when
 * navigation completes at this destination. Used by AI pathfinding to
 * smoothly rotate the camera to face important landmarks or entrances.
 *
 * @param photoId - Location identifier to query
 * @returns Camera angle in degrees (0-360) or undefined if no final orientation is configured
 *
 * @example
 * ```typescript
 * import { getFinalOrientation } from './ai.locations'
 * const angle = getFinalOrientation('x-f1-east-4')
 * // angle === 325 (faces Coffee Infusion entrance)
 * ```
 */
export function getFinalOrientation(photoId: string): number | undefined {
  const location = vectorStoreLocations.find(loc => loc.id === photoId)
  return location?.metadata?.finalOrientation
}
