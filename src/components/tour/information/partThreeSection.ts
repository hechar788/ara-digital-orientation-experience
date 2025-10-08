import type { TourInformationSection } from './tourInformationSection'

/**
 * Captures the Amazing Race activity details for the third step of the tour popup.
 *
 * This content encourages collaborative participation in the experiential campus tour and highlights the rewards for finishing the challenge.
 *
 * @example
 * ```typescript
 * const section = partThreeSection
 * ```
 */
export const partThreeSection: TourInformationSection = {
  key: 'race',
  tabLabel: 'Part 3: Amazing Race',
  heading: 'Join the Amazing Race',
  paragraphs: [
    'Team up with fellow students to complete location-based challenges that introduce you to key spaces around campus.',
    'Each checkpoint unlocks tips, trivia, and resources that make navigating the computing department easier throughout the semester.',
    'Finish the journey to earn digital badges and a welcome kit you can pick up from the student hub.'
  ],
  footerNote: 'Bring your device, wear comfortable shoes, and be ready to collaborate with your new peers.'
}
