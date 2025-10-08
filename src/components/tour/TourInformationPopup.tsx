import React from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { tourInformationSections } from './information'

/**
 * Configuration options for rendering the tour information popup component.
 *
 * Wrap this interface around stateful callers that control the modal visibility. It keeps the dialog externally controlled so parent components can connect it to existing UI state or routing flows.
 *
 * @property isOpen - Boolean flag (`true` to display the modal, `false` to hide it)
 * @property onClose - Function invoked when the popup requests to close; receives no arguments
 */
export interface TourInformationPopupProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Renders the three-part digital orientation experience popup with tab navigation, descriptive content, and contextual controls.
 *
 * The component displays contextual onboarding information with visual placeholders that mirror the provided design reference. It supports keyboard and pointer navigation between steps and stays controlled by the parent component.
 *
 * @param props - Component props configuring visibility and close behavior
 * @param props.isOpen - Boolean flag indicating whether the popup is visible
 * @param props.onClose - Callback fired when the popup should close
 * @returns React.ReactElement representing the orientation information dialog
 *
 * @example
 * ```typescript
 * <TourInformationPopup isOpen={isTourOpen} onClose={() => setTourOpen(false)} />
 * ```
 */
export const TourInformationPopup: React.FC<TourInformationPopupProps> = ({ isOpen, onClose }) => {
  const [activeIndex, setActiveIndex] = React.useState(0)
  const sections = tourInformationSections
  const activeSection = sections[activeIndex]
  const isLastSection = activeIndex === sections.length - 1
  const handleNext = () => {
    if (isLastSection) {
      onClose()
      return
    }
    setActiveIndex((current) => Math.min(current + 1, sections.length - 1))
  }
  const handleBack = () => {
    setActiveIndex((current) => Math.max(current - 1, 0))
  }

  React.useEffect(() => {
    if (!isOpen) {
      setActiveIndex(0)
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-0">
        <DialogTitle className="sr-only">Digital Orientation Experience</DialogTitle>
        <div className="px-6 pt-6 pb-5 space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-foreground uppercase tracking-wide">
              ARA Institute of Canterbury - Computing Department
            </p>
            <h2 className="text-2xl font-semibold text-foreground">Digital Orientation Experience</h2>
          </div>
          <nav aria-label="Tour sections" className="flex flex-wrap gap-2 py-3">
            {sections.map((section, index) => (
              <button
                key={section.key}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`rounded-sm border px-3 py-1.5 text-xs font-medium transition ${
                  activeIndex === index
                    ? 'border-border bg-muted text-foreground'
                    : 'border-border/70 bg-background text-muted-foreground hover:bg-muted/50'
                }`}
                aria-current={activeIndex === index ? 'page' : undefined}
              >
                {section.tabLabel}
              </button>
            ))}
          </nav>
          <div className="space-y-3.5">
            <h3 className="text-xl font-semibold text-foreground">{activeSection.heading}</h3>
            <div className="space-y-3">
              {activeSection.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-base leading-relaxed text-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
            <p className="text-base text-foreground">{activeSection.footerNote}</p>
            {activeSection.renderMedia ? (
              <div className="flex justify-center pt-4">{activeSection.renderMedia()}</div>
            ) : null}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border bg-muted/20 px-6 py-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={activeIndex === 0}
            className={`rounded-sm px-4 py-2 text-sm font-medium transition ${
              activeIndex === 0
                ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            Back
          </button>
          <div className="flex items-center gap-2" aria-hidden="true">
            {sections.map((section, index) => (
              <span
                key={section.key}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  activeIndex === index ? 'bg-foreground' : 'bg-muted-foreground/40'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="rounded-sm bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:bg-foreground/90"
          >
            {isLastSection ? 'Finish' : 'Next'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
