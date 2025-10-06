/**
 * Hotspot Confirmation Dialog Component
 *
 * Displays a confirmation dialog when a user clicks on a navigation hotspot,
 * asking them to confirm before traveling to the destination. The dialog is
 * intelligently positioned near the clicked hotspot with edge detection.
 *
 * @fileoverview Confirmation dialog for hotspot navigation with smart positioning
 */

import React, { useEffect } from 'react'
import { Button } from '../../ui/button'
import type { DialogPosition } from './HotspotUtils' 

/**
 * Props for HotspotConfirmationDialog component
 *
 * @property isOpen - Whether the dialog is currently visible
 * @property areaName - Name of the destination area to display in prompt
 * @property floorLevel - Floor level for stairs/elevator destinations
 * @property isStairs - Navigation type: 'elevator' for elevator access, 'stairs' for stairs/floors, 'door' for doors
 * @property position - Screen coordinates for dialog positioning
 * @property onConfirm - Callback when user confirms navigation
 * @property onCancel - Callback when user cancels navigation
 */
interface HotspotConfirmationDialogProps {
  isOpen: boolean
  areaName: string
  floorLevel?: number
  isStairs: 'elevator' | 'stairs' | 'door'
  position: DialogPosition
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Confirmation dialog for hotspot navigation
 *
 * Renders a compact confirmation dialog near the clicked hotspot with context-aware prompts:
 * - Elevator access: "Enter **The Elevator**?"
 * - Stairs/floors: "Go to {areaName} - **Floor {floorLevel}**?"
 * - Doors to outside: "Go **Outside**?"
 * - Doors to buildings: "Enter **{areaName}**?"
 * Includes keyboard support for Enter (confirm) and Escape (cancel).
 *
 * @param isOpen - Controls dialog visibility
 * @param areaName - Destination area name for display
 * @param floorLevel - Floor level for stairs/elevator destinations
 * @param isStairs - Navigation type: 'elevator', 'stairs', or 'door'
 * @param position - Calculated screen position from hotspot utilities
 * @param onConfirm - Handler for confirming navigation
 * @param onCancel - Handler for canceling navigation
 * @returns Confirmation dialog component
 *
 * @example
 * ```typescript
 * // Door hotspot
 * <HotspotConfirmationDialog
 *   isOpen={showDialog}
 *   areaName="X Block"
 *   isStairs="door"
 *   position={{ x: 400, y: 300, flippedHorizontal: false }}
 *   onConfirm={handleNavigate}
 *   onCancel={handleCancel}
 * />
 *
 * // Elevator access
 * <HotspotConfirmationDialog
 *   isOpen={showDialog}
 *   areaName="X Block Elevator"
 *   isStairs="elevator"
 *   position={{ x: 400, y: 300, flippedHorizontal: false }}
 *   onConfirm={handleNavigate}
 *   onCancel={handleCancel}
 * />
 *
 * // Stairs/floor selection
 * <HotspotConfirmationDialog
 *   isOpen={showDialog}
 *   areaName="X Block"
 *   floorLevel={2}
 *   isStairs="stairs"
 *   position={{ x: 400, y: 300, flippedHorizontal: false }}
 *   onConfirm={handleNavigate}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export const HotspotConfirmationDialog: React.FC<HotspotConfirmationDialogProps> = ({
  isOpen,
  areaName,
  floorLevel,
  isStairs,
  position,
  onConfirm,
  onCancel
}) => {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onConfirm()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onConfirm, onCancel])

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onCancel}
      />

      <div
        className="fixed z-50 w-[280px] rounded-lg border border-white/20 bg-black/90 p-4 shadow-2xl backdrop-blur-sm transition-all duration-150 animate-in fade-in zoom-in-95"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(0, 0)'
        }}
      >
        <div className="mb-4 text-center">
          <p className="text-base font-semibold text-white">
            {isStairs === 'elevator' ? (
              <>Enter <span className="font-bold">The Elevator</span>?</>
            ) : isStairs === 'stairs' ? (
              <>
                Go to {areaName}
                {floorLevel !== undefined && (
                  <> - <span className="font-bold">Floor {floorLevel}</span></>
                )}?
              </>
            ) : areaName === 'Outside' ? (
              <>Go <span className="font-bold">Outside</span>?</>
            ) : (
              <>Enter <span className="font-bold">{areaName}</span>?</>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 border-white/30 text-gray-900 bg-white hover:bg-gray-100 sm:min-w-[100px]"
            size="default"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 sm:min-w-[100px]"
            size="default"
          >
            Confirm
          </Button>
        </div>
      </div>
    </>
  )
}
