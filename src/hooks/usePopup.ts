import { useState, useCallback } from 'react'

/**
 * Return type for the usePopup hook
 *
 * Provides a consistent interface for managing popup/modal/dialog visibility state.
 *
 * @property isOpen - Whether the popup is currently visible
 * @property open - Function to show the popup
 * @property close - Function to hide the popup
 * @property toggle - Function to toggle popup visibility
 */
export interface UsePopupReturn {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

/**
 * Custom hook for managing popup/modal/dialog visibility state
 *
 * Provides a reusable interface for any component that needs open/close functionality.
 * Commonly used for modals, dialogs, dropdowns, tooltips, and other toggleable UI elements.
 *
 * @param initialState - Initial visibility state (default: false)
 * @returns Object with isOpen state and open/close/toggle functions
 *
 * @example
 * ```typescript
 * const aiChat = usePopup()
 * const info = usePopup(true) // starts open
 *
 * <button onClick={aiChat.open}>Open Chat</button>
 * <AIChatPopup isOpen={aiChat.isOpen} onClose={aiChat.close} />
 * ```
 */
export const usePopup = (initialState = false): UsePopupReturn => {
  const [isOpen, setIsOpen] = useState(initialState)

  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  return {
    isOpen,
    open,
    close,
    toggle
  }
}
