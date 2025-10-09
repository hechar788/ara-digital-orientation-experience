import type { Information } from "@/types/information";

/**
 * Shares the Amazing Race overview for the final tab of the digital orientation popup.
 *
 * The content mirrors the provided design by combining descriptive copy, a stylised race badge, and a bullet list that explains the activity flow.
 *
 * @example
 * ```typescript
 * const section = partThreeSection
 * ```
 */
export const partThreeSection: Information = {
  key: 'race',
  tabLabel: 'Part 3: Amazing Race',
  heading: 'The Amazing Race',
  paragraphs: [
    'The Amazing Race is your interactive way to discover key locations around campus while learning about important services and facilities.',
    'Click the Amazing Race button to start the challenge, or feel free to explore the campus with everything unlocked by staying in the normal tour.'
  ],
  footerNote: '',
  renderMedia: () => (
    <div className="flex w-full flex-col gap-2 sm:gap-4 mt-3 sm:mt-1.5">
      <div className="flex justify-center">
        <div className="flex max-w-[90px] flex-col items-center rounded-sm bg-foreground px-3 py-2 text-center text-background shadow-sm sm:max-w-[135px] sm:px-4 sm:py-3">
          <img
            src="/svg/flag.svg"
            alt="Checkered flag icon representing The Amazing Race challenge"
            className="h-6 w-6 object-contain sm:h-8 sm:w-8"
          />
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide sm:mt-2 sm:text-xs">Start Race</span>
        </div>
      </div>
      <div className="w-full space-y-1.5 sm:space-y-2">
        <h4 className="text-sm font-semibold text-foreground sm:text-base">How it works</h4>
        <ul className="list-disc space-y-1 pl-5 text-sm text-foreground sm:space-y-1.5 sm:text-base">
          <li>Follow clues to find different campus locations</li>
          <li>Learn about student services at each stop</li>
          <li>Unlock areas as you explore</li>
          <li>Race against the clock to complete your tour</li>
        </ul>
      </div>
    </div>
  )
}
