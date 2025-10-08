import type { TourInformationSection } from './tourInformationSection'

/**
 * Supplies the document preparation guidance for the tour information popup.
 *
 * Use this definition for the second tab, helping students gather, complete, and store their onboarding paperwork before classes begin.
 *
 * @example
 * ```typescript
 * const section = partTwoSection
 * ```
 */
export const partTwoSection: TourInformationSection = {
  key: 'documents',
  tabLabel: 'Part 2: Documents',
  heading: 'Prepare Your Documents',
  paragraphs: [
    'Download and review the onboarding documents, including programme handbooks, health and safety guidelines, and student code of conduct.',
    'Complete the required acknowledgement forms before classes begin so your enrolment stays active and your access to digital services continues without interruption.',
    'Store all confirmations in your preferred cloud drive to keep them handy for future reference and audits.'
  ],
  footerNote: 'Need help with paperwork? Reach out to the student advisory team for guided support.'
}
