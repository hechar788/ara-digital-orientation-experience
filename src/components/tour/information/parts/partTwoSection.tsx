import { ExternalLink } from 'lucide-react'
import type { Information } from '@/types/information'

const documentLinks = [
  {
    id: 'ara-computing-student-handbook',
    label: 'Computing Student Handbook',
    href: 'https://www.ara.ac.nz/siteassets/myara/programme-handbooks/creative/2025/computing-levels-4--7-2025.pdf'
  },
  { id: 'full-campus-map', 
    label: 'Full Campus Map', 
    href: 'https://www.ara.ac.nz/siteassets/documents---home/explore-ara/campuses/christchurch---madras-street/chch-campusmap.pdf' 
  },
  { id: 'academic-support', label: 'Academic Support', href: 'https://www.youtube.com/watch?v=t93ojx2C6dw' },
  { id: 'student-information', label: 'Key Information for Students', href: 'https://drive.google.com/file/d/1DipWpHY0pWhOGfHWvIU65gDMeBGhIB_2/view?usp=sharing' }
] as const

/**
 * Delivers the document access step for the digital orientation experience, including quick links to campus resources.
 *
 * Students use this section to locate must-have PDFs such as the student handbook and other guides they will reference throughout the programme.
 *
 * @example
 * ```typescript
 * const section = partTwoSection
 * ```
 */
export const partTwoSection: Information = {
  key: 'documents',
  tabLabel: 'Part 2: Documents',
  heading: 'Get access to campus documents',
  paragraphs: [
    'These are the key documents you may need during your studies at ARA, including the Campus Map, Student Handbook, and other important information.'
  ],
  footerNote: 'Select any document to open the latest version in a new tab.',
  renderMedia: () => (
    <ul className="flex w-full flex-col gap-2 py-3 sm:gap-2.5 sm:py-1" role="list">
      {documentLinks.map((document) => (
        <li key={document.id}>
          <a
            href={document.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-between rounded-sm bg-muted px-4 py-3 text-left text-sm font-medium text-foreground transition hover:bg-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring sm:text-base"
          >
            <span>{document.label}</span>
            <ExternalLink className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  )
}
