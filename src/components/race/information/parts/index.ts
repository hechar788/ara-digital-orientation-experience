import type { Information } from '@/types/information'
import { partOneRaceSection } from './partOneSection'

/**
 * Ordered collection of race information sections rendered in the popup.
 *
 * Consume this array to drive the tab navigation and content layout for the race onboarding dialog.
 *
 * @example
 * ```typescript
 * const sections = raceInformationSections
 * ```
 */
export const raceInformationSections: Information[] = [partOneRaceSection]
