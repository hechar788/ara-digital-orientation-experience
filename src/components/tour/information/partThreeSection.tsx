import type { TourInformation } from './tourInformation'

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
export const partThreeSection: TourInformation = {
  key: 'race',
  tabLabel: 'Part 3: Amazing Race',
  heading: 'The Amazing Race',
  paragraphs: [
    'The Amazing Race is your interactive way to discover key locations around campus while learning about important services and facilities.',
    'Click the Amazing Race button to start the challenge, or feel free to explore the campus with everything unlocked by staying in the normal tour.'
  ],
  footerNote: '',
  renderMedia: () => (
    <div className="flex w-full flex-col items-center gap-6 sm:gap-7">
      <div className="flex w-full max-w-[180px] flex-col items-center rounded-sm bg-foreground px-6 py-5 text-center text-background shadow-sm sm:max-w-[200px]">
        <img
          src="/svg/flag.svg"
          alt="Checkered flag icon representing The Amazing Race challenge"
          className="h-10 w-10 object-contain sm:h-12 sm:w-12"
        />
        <span className="mt-3 text-sm font-semibold uppercase tracking-wide">Amazing Race</span>
      </div>
      <div className="w-full max-w-md space-y-3 text-left">
        <h4 className="text-sm font-semibold text-foreground sm:text-base">How it works</h4>
        <ul className="list-disc space-y-2 pl-5 text-sm text-foreground sm:text-base">
          <li>Follow clues to find different campus locations</li>
          <li>Learn about student services at each stop</li>
          <li>Unlock areas as you explore</li>
          <li>Race against the clock to complete your tour</li>
        </ul>
      </div>
    </div>
  )
}
