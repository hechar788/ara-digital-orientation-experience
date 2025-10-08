import React from 'react'
import type { TourInformationSection } from './tourInformationSection'

/**
 * Provides the introductory section for the digital orientation popup, including branding and overview copy.
 *
 * This section greets students, explains the experience goals, and displays the secondary institute logo beneath the supporting reminder text.
 *
 * @example
 * ```typescript
 * const section = partOneSection
 * ```
 */
export const partOneSection: TourInformationSection = {
  key: 'introduction',
  tabLabel: 'Part 1: Introduction',
  heading: 'Welcome to Orientation',
  paragraphs: [
    'Get ready to explore ARA Institute of Canterbury - Madras Street, and discover everything you need to succeed in your studies.',
    'This digital experience is designed to give you flexible access to the traditional in-person orientation, allowing you to get essential information about campus services, student support, and our vibrant computing community.',
    "You'll learn about key campus locations, meet the staff, and understand the resources available to help you succeed."
  ],
  footerNote:
    'Everything here will remain accessible throughout your studies, so you can return whenever you need a refresher.',
  renderMedia: () => (
    <img
      src="/ara_logos/logo_secondary_colour.svg"
      alt="ARA Institute of Canterbury secondary logo"
      className="h-24 w-full max-w-[160px] object-contain sm:h-32 sm:max-w-xs"
    />
  )
}
