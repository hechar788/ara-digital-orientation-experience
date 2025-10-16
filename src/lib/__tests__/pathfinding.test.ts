// npm run test -- pathfinding

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
    expect(seconds).toBeGreaterThan(0)
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
