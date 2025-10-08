import { partOneSection } from './partOneSection'
import { partTwoSection } from './partTwoSection'
import { partThreeSection } from './partThreeSection'
import type { TourInformationSection } from './tourInformationSection'

/**
 * Ordered collection of tour sections rendered by the popup component.
 *
 * Consume this array to feed the tab navigation and page layout without manually importing individual section definitions in each consumer.
 *
 * @example
 * ```typescript
 * const sections = tourInformationSections
 * ```
 */
export const tourInformationSections: TourInformationSection[] = [
  partOneSection,
  partTwoSection,
  partThreeSection
]

/**
 * Re-exports the section interface for consumers that configure custom sections.
 */
export type { TourInformationSection } from './tourInformationSection'
