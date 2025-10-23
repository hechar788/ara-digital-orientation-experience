import { describe, expect, it } from 'vitest'
import { matchLocationByKeywords } from '../ai.locations'

describe('matchLocationByKeywords', () => {
  it('prefers precise room numbers over broad area labels', () => {
    const result = matchLocationByKeywords('Heading to S Block S453 classroom')
    expect(result).toBe('s-f4-north-7')
  })

  it('matches room identifiers even when separated by whitespace', () => {
    const result = matchLocationByKeywords('Can you take me to S 453 for my lecture?')
    expect(result).toBe('s-f4-north-7')
  })

  it('maps room references with punctuation directly to the associated photo', () => {
    const result = matchLocationByKeywords('Classroom check for S-460 please')
    expect(result).toBe('s-f4-north-7')
  })

  it('returns null when no override keywords match', () => {
    expect(matchLocationByKeywords('Completely unrelated phrase')).toBeNull()
  })
})
