import type { ReactNode } from 'react'

/**
 * Describes a single page within the tour information popup experience.
 *
 * Each section supplies the textual content, labels, and optional media renderer used by the modal. Parent components combine these sections to drive the multi-step interface.
 *
 * @property key - Unique identifier for the section (`string` slug)
 * @property tabLabel - Label displayed within the tab navigation (`string`)
 * @property heading - Primary heading that introduces the section (`string`)
 * @property paragraphs - Ordered list of paragraph copy to render (`string[]`)
 * @property footerNote - Supporting note displayed after the paragraphs (`string`)
 * @property renderMedia - Optional factory returning additional JSX (for example, an image component)
 */
export interface TourInformationSection {
  key: string
  tabLabel: string
  heading: string
  paragraphs: string[]
  footerNote: string
  renderMedia?: () => ReactNode
}
