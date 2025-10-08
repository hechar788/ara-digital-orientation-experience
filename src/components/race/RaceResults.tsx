import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TOTAL_HIDDEN_LOCATIONS } from '@/data/hiddenLocations'

/**
 * Props for the RaceResults component
 *
 * Defines the race statistics and callback handlers for post-race actions.
 *
 * @property isOpen - Whether the results popup is currently visible
 * @property onClose - Callback triggered when popup is closed
 * @property areasDiscovered - Number of areas discovered during the race
 * @property totalAreas - Total number of areas available (default: 20)
 * @property keyLocationsFound - Number of hidden locations found during the race
 * @property timeTaken - Formatted time string (HH:MM:SS)
 * @property onRestart - Callback triggered when user clicks restart
 * @property onReturnToOrientation - Callback triggered when user returns to orientation
 */
interface RaceResultsProps {
  isOpen: boolean
  onClose: () => void
  areasDiscovered: number
  totalAreas?: number
  keyLocationsFound: number
  timeTaken: string
  onRestart: () => void
  onReturnToOrientation: () => void
}

/**
 * Race results popup component
 *
 * Displays race completion statistics and provides options to restart the race
 * or return to the main orientation tour. Shows areas discovered, hidden locations
 * found, and total time taken.
 *
 * @param isOpen - Controls popup visibility state
 * @param onClose - Handler for closing the popup
 * @param areasDiscovered - Number of areas discovered
 * @param totalAreas - Total areas available (defaults to 20)
 * @param keyLocationsFound - Number of hidden locations found
 * @param timeTaken - Time taken formatted as HH:MM:SS
 * @param onRestart - Handler for restarting the race
 * @param onReturnToOrientation - Handler for returning to orientation tour
 * @returns React component displaying race results dialog
 *
 * @example
 * ```typescript
 * <RaceResults
 *   isOpen={showResults}
 *   onClose={() => setShowResults(false)}
 *   areasDiscovered={15}
 *   keyLocationsFound={8}
 *   timeTaken="00:05:36"
 *   onRestart={() => restartRace()}
 *   onReturnToOrientation={() => endRace()}
 * />
 * ```
 */
export const RaceResults: React.FC<RaceResultsProps> = ({
  isOpen,
  onClose,
  areasDiscovered,
  totalAreas = 20,
  keyLocationsFound,
  timeTaken,
  onRestart,
  onReturnToOrientation
}) => {
  const totalHiddenLocations = TOTAL_HIDDEN_LOCATIONS

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md pt-8 pb-6">
        <DialogHeader className="pb-6 text-center">
          <DialogTitle className="text-3xl font-bold text-center">Results</DialogTitle>
          <DialogDescription className="sr-only">Race statistics and options to restart or return to orientation</DialogDescription>
        </DialogHeader>

        <div className="border border-gray-300 rounded-lg p-6 mb-6 space-y-4">
          <div className="text-lg">
            <span className="font-medium">Areas Discovered:</span> {areasDiscovered}/{totalAreas}
          </div>
          <div className="text-lg">
            <span className="font-medium">Hidden Locations Found:</span> {keyLocationsFound}/{totalHiddenLocations}
          </div>
          <div className="text-lg">
            <span className="font-medium">Time Taken:</span> {timeTaken}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            onClick={() => {
              onClose()
              onRestart()
            }}
            className="w-full"
          >
            Restart
          </Button>
          <Button
            onClick={() => {
              onClose()
              onReturnToOrientation()
            }}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
          >
            Return to Orientation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
