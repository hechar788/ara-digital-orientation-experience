import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { tourInformationSections } from './parts'

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
  const isDocumentsSection = activeSection.key === 'documents'
  const isIntroductionSection = activeSection.key === 'introduction'
  const mediaContent = activeSection.renderMedia ? activeSection.renderMedia() : null
  const footerNote = activeSection.footerNote ?? ''
  const shouldRenderFooterNote = footerNote.trim().length > 0
  const footnoteSpacingClass = isIntroductionSection
    ? 'mb-0 pb-2 sm:pb-0'
    : mediaContent
      ? isDocumentsSection
        ? 'mb-2 sm:mb-2'
        : 'mb-0 sm:mb-2'
      : 'mb-3 sm:mb-2'
  const isRaceSection = activeSection.key === 'race'
  const mediaWrapperClass = isDocumentsSection
    ? 'flex justify-center pt-1 sm:pt-6'
    : isRaceSection
      ? 'flex justify-center -mt-3 sm:mt-1'
      : isIntroductionSection
        ? 'flex justify-center -mt-3 sm:mt-8.5'
        : 'flex justify-center -mt-3 sm:-mt-3.5'
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
      <DialogContent className="sm:max-w-xl p-0 max-h-[98.5vh] overflow-y-auto">
        <DialogTitle className="sr-only">Digital Orientation Experience</DialogTitle>
        <DialogDescription className="sr-only">
          Interactive campus tour with navigation and information sections
        </DialogDescription>
        <div className="px-6 pt-6 pb-0 space-y-3 sm:pt-10 sm:pb-5 sm:space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-foreground uppercase tracking-wide">
              <span className="sm:hidden">ARA Institute of Canterbury - Computing</span>
              <span className="hidden sm:inline">ARA Institute of Canterbury - Computing Department</span>
            </p>
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Digital Orientation Experience</h2>
          </div>
          <hr className="border-t border-border" />
          <nav aria-label="Tour sections" className="hidden flex-wrap gap-2 py-2 sm:flex sm:py-3">
            {sections.map((section, index) => (
              <button
                key={section.key}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`rounded-sm border px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
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
          <div className="space-y-3 sm:space-y-3.5">
            <h3 className="text-base font-semibold text-foreground sm:text-xl">{activeSection.heading}</h3>
            <div className="space-y-2.5 sm:space-y-3">
              {activeSection.paragraphs.map((paragraph: string) => (
                <p key={paragraph} className="text-sm leading-relaxed text-foreground sm:text-base">
                  {paragraph}
                </p>
              ))}
            </div>
            {shouldRenderFooterNote ? (
              <p className={`text-sm text-foreground sm:text-base ${footnoteSpacingClass}`}>{footerNote}</p>
            ) : null}
            {mediaContent ? <div className={mediaWrapperClass}>{mediaContent}</div> : null}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border bg-muted/20 px-6 py-3 sm:py-4">
          {activeIndex === 0 ? (
            <div className="px-4 py-2" />
          ) : (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-sm bg-muted px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted/80 cursor-pointer"
            >
              Back
            </button>
          )}
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
            className="rounded-sm bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:bg-foreground/90 cursor-pointer"
          >
            {isLastSection ? 'Finish' : 'Next'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
