'use server'

import vectorStoreDocument from '../data/locations-vector-store.json'

interface VectorStoreLocation {
  id: string
  metadata?: {
    areaName?: string
    synonyms?: string[]
    roomNumbers?: string[]
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
 * vector store and, by extension, inside the campus viewer.
 *
 * @returns Set of location identifiers compatible with pathfinding
 *
 * @example
 * ```typescript
 * import { VALID_LOCATION_ID_SET } from './ai.locations'
 * const isValid = VALID_LOCATION_ID_SET.has('x-f1-east-4')
 * ```
 */
export const VALID_LOCATION_ID_SET = new Set<string>(LOCATION_IDS)

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
