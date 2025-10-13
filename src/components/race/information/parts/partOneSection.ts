import type { Information } from '@/types/information'

/**
 * Introduces the Amazing Race mode with overview copy and participant expectations.
 *
 * Use this section to orient users to the timed challenge before they begin solving clues across campus locations.
 *
 * @example
 * ```typescript
 * const section = partOneRaceSection
 * ```
 */
export const partOneRaceSection: Information = {
  key: 'introduction',
  tabLabel: 'Part 1: Introduction',
  heading: 'Welcome to The Amazing Race',
  paragraphs: [
    'Get ready for an exciting timed challenge!',
    "Explore ARA's campus step-by-step as you follow clues and discover key locations."
  ],
  footerNote: '',
  listHeading: 'How it works',
  listItems: [
    'Follow clues to find campus locations',
    'Learn about key locations as you go',
    'Areas unlock as you discover them',
    'Race against the clock to complete the tour'
  ]
}
