/**
 * Available Classrooms and Facilities Popup Component
 *
 * Displays a comprehensive list of all navigable locations on campus, organized
 * into two tabs: Facilities/Cafes and Classrooms. This popup is triggered by
 * the AI chat when users ask about available locations.
 *
 * @fileoverview Popup for showing all available campus destinations
 */

import React, { useState, useMemo } from 'react'
import { X, MapPin } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import vectorStoreLocations from '@/data/locations-vector-store.json'

/**
 * Represents a single location entry in the popup
 *
 * @property id - Photo ID for navigation
 * @property name - Display name of the location (room number or facility name)
 * @property block - Building block (A, N, S, W, X, Library, etc.)
 * @property floor - Floor level number
 */
interface LocationEntry {
  id: string
  name: string
  block: string
  floor: number
}

/**
 * Props for the AvailableClassroomsPopup component
 *
 * @property isOpen - Whether the popup is currently visible
 * @property onClose - Callback invoked when the user closes the popup
 * @property onSendMessage - Handler invoked when user clicks a location to send a message to the AI
 */
interface AvailableClassroomsPopupProps {
  isOpen: boolean
  onClose: () => void
  onSendMessage?: (message: string) => void
}

/**
 * Extracts a clean room number from the roomNumbers array
 *
 * Takes the first room number and removes any descriptive text after a dash.
 *
 * @param roomNumbers - Array of room number strings from vector store
 * @returns Cleaned room number or 'Unknown'
 */
function extractRoomNumber(roomNumbers: string[] | undefined): string {
  if (!roomNumbers || roomNumbers.length === 0) return 'Unknown'
  const firstRoom = roomNumbers[0]
  // Remove anything after " - " (like "A121 - Academic Records" becomes "A121")
  return firstRoom.split(' - ')[0].trim()
}

/**
 * Formats block name for display
 *
 * Converts block identifiers to human-readable names.
 *
 * @param block - Block identifier from metadata
 * @returns Formatted block name
 */
function formatBlockName(block: string): string {
  const blockMap: Record<string, string> = {
    a: 'A Block',
    n: 'N Block',
    s: 'S Block',
    w: 'W Block',
    x: 'X Block',
    library: 'Library',
    outside: 'Outside'
  }
  return blockMap[block.toLowerCase()] || block.toUpperCase()
}

/**
 * Available Classrooms and Facilities popup with tabbed interface
 *
 * Displays all campus locations organized by type (facilities vs classrooms).
 * Each location is clickable and sends a message to the AI chat requesting directions.
 * The popup uses the same styling as other campus popups for consistency.
 *
 * @param isOpen - Controls popup visibility
 * @param onClose - Callback to close the popup
 * @param onSendMessage - Callback to send a message to the AI chat with the selected location
 * @returns React component representing the available locations popup
 *
 * @example
 * ```typescript
 * <AvailableClassroomsPopup
 *   isOpen={showLocations}
 *   onClose={() => setShowLocations(false)}
 *   onSendMessage={(message) => sendMessageToAI(message)}
 * />
 * ```
 */
export const AvailableClassroomsPopup: React.FC<AvailableClassroomsPopupProps> = ({
  isOpen,
  onClose,
  onSendMessage
}) => {
  const [activeTab, setActiveTab] = useState<'facilities' | 'classrooms'>('facilities')

  const { facilities, classrooms } = useMemo(() => {
    const facilitiesList: LocationEntry[] = []
    const classroomsList: LocationEntry[] = []

    for (const location of vectorStoreLocations) {
      if (!location.metadata) continue

      const { roomTypes, roomNumbers, buildingBlock, floorLevel } = location.metadata

      if (!buildingBlock || floorLevel === undefined) continue

      const roomType = roomTypes ? roomTypes[0] : 'unknown'
      const name = extractRoomNumber(roomNumbers)

      const entry: LocationEntry = {
        id: location.id,
        name,
        block: buildingBlock,
        floor: floorLevel
      }

      // Facilities include: cafes, gyms, offices, and other campus services
      // Classrooms are teaching spaces
      if (roomType === 'classroom') {
        classroomsList.push(entry)
      } else {
        // Everything else goes in facilities (facility, office, or unknown)
        facilitiesList.push(entry)
      }
    }

    // Sort by block, then floor, then name
    const sortFn = (a: LocationEntry, b: LocationEntry) => {
      if (a.block !== b.block) return a.block.localeCompare(b.block)
      if (a.floor !== b.floor) return a.floor - b.floor
      return a.name.localeCompare(b.name)
    }

    facilitiesList.sort(sortFn)
    classroomsList.sort(sortFn)

    const prioritizedFacilities = facilitiesList.filter(entry => !/\b(sandy|peter|ian)\b/i.test(entry.name))
    const deprioritizedFacilities = facilitiesList.filter(entry => /\b(sandy|peter|ian)\b/i.test(entry.name))

    return {
      facilities: [...prioritizedFacilities, ...deprioritizedFacilities],
      classrooms: classroomsList
    }
  }, [])

  const handleLocationClick = (locationName: string) => {
    if (onSendMessage) {
      onSendMessage(`How do I get to ${locationName}?`)
      onClose()
    }
  }

  const renderLocationList = (locations: LocationEntry[]) => {
    if (locations.length === 0) {
      return (
        <p className="text-sm text-gray-500 text-center py-8">No locations found</p>
      )
    }

    return (
      <div className="space-y-2">
        {locations.map((location) => (
          <button
            key={location.id}
            type="button"
            onClick={() => handleLocationClick(location.name)}
            className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#0C586E] flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{location.name}</p>
                <p className="text-xs text-gray-600">
                  {formatBlockName(location.block)} • Floor {location.floor}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-md w-[90vw] p-0 gap-0 border-0 max-h-[85vh] flex flex-col touch-pan-y" 
        showCloseButton={false} 
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">Available Campus Locations</DialogTitle>
        <div className="rounded-t-lg bg-[#0C586E] flex-shrink-0">
          {/* Tab headers */}
          <div className="flex items-center border-b border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('facilities')}
              className={`flex-1 px-4 py-3 text-sm font-medium text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset cursor-pointer ${
                activeTab === 'facilities'
                  ? 'bg-white/20'
                  : 'hover:bg-white/5'
              }`}
            >
              Facilities & Services
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('classrooms')}
              className={`flex-1 px-4 py-3 text-sm font-medium text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset cursor-pointer ${
                activeTab === 'classrooms'
                  ? 'bg-white/20'
                  : 'hover:bg-white/5'
              }`}
            >
              Classrooms
            </button>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-md p-1 mx-2 text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C586E]"
              aria-label="Close available locations"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          <div className="mb-3">
            <p className="text-sm text-gray-600">
              {activeTab === 'facilities' 
                ? `${facilities.length} campus services, facilities, and offices available`
                : `${classrooms.length} teaching classrooms available`
              }
            </p>
          </div>
          {activeTab === 'facilities' ? renderLocationList(facilities) : renderLocationList(classrooms)}
        </div>

        {/* Footer */}
        <div className="px-6 pb-4 pt-2 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer w-full rounded-lg bg-[#0C586E] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0a4a5a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0C586E] focus-visible:ring-offset-2"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
