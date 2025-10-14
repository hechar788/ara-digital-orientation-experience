import { Star } from 'lucide-react'
import type { Information } from '@/types/information'

/**
 * Provides the instruction section for the Amazing Race popup with race goals, tracking tips, and hotspot icon reference.
 *
 * Use this section to brief participants on mechanics before they begin navigating the campus challenge.
 *
 * @example
 * ```typescript
 * const section = partTwoRaceSection
 * ```
 */
export const partTwoRaceSection: Information = {
  key: 'instructions',
  tabLabel: 'Part 2: Instructions',
  heading: 'Instructions',
  paragraphs: [],
  footerNote: '',
  renderContent: () => (
    <div className="space-y-5 sm:space-y-6">
      <p className="text-sm leading-relaxed text-foreground sm:text-base">
        Your goal is to find all 10 hidden locations by following the clues.
      </p>

      <div className="space-y-2 sm:-space-y-4">
        <p className="text-sm font-semibold leading-relaxed text-foreground sm:text-base">Finding Locations</p>
        <div className="flex flex-col items-center gap-4 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:mt-2">
          <p className="w-full text-sm leading-relaxed text-foreground sm:text-base sm:text-left">
            Look for location pin bubbles at key campus spots. These mark the 10 locations you need to discover to complete the Amazing Race.
          </p>
          <div className="flex justify-center sm:justify-end sm:self-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-yellow-400 shadow-lg sm:h-24 sm:w-24">
              <Star className="h-10 w-10 text-black sm:h-12 sm:w-12" fill="currentColor" stroke="currentColor" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 sm:-space-y-4">
        <p className="text-sm font-semibold leading-relaxed text-foreground sm:text-base">Tracking Progress</p>
        <p className="text-sm leading-relaxed text-foreground sm:text-base sm:mt-4">
          Use the Minimap to see your current location and keep track of areas you have already discovered. Only visited locations remain visible on your map.
        </p>
      </div>

      <div className="space-y-2 sm:-space-y-4 hide-timer-info-on-short-screen">
        <p className="text-sm font-semibold leading-relaxed text-foreground sm:text-base">Race Against Time</p>
        <p className="text-sm leading-relaxed text-foreground sm:text-base sm:mt-4">
          Watch the race timer to stay on pace. Every second counts, so move quickly while staying observant.
        </p>
      </div>

      <p className="text-sm leading-relaxed text-foreground sm:text-base sm:pt-8 sm:-mb-2.5">
        Good luck, and have fun exploring!
      </p>
    </div>
  )
}
