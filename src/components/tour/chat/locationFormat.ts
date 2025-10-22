/**
 * Formats a tour photo identifier into a user-friendly label
 *
 * Splits the hyphen-delimited identifier into capitalised segments so they can
 * be displayed inside navigation UI elements without exposing raw IDs.
 *
 * @param photoId - Raw location identifier (`s-f1-west-4`) or `null` when unknown
 * @returns Human-readable label such as `S F1 West 4`
 *
 * @example
 * ```typescript
 * const label = formatLocationId('s-f1-north-entrance')
 * // Returns: "S F1 North Entrance"
 * ```
 */
export function formatLocationId(photoId?: string | null): string {
  if (!photoId) {
    return 'Current location'
  }
  return photoId
    .split('-')
    .map(segment => (segment.length > 0 ? segment[0].toUpperCase() + segment.slice(1) : segment))
    .join(' ')
}
