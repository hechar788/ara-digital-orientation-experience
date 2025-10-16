# Phase 5: Chat UI Component

**Status**: =á Not Started
**Prerequisites**: Phase 3 (Basic AI), Phase 4 (AI + Pathfinding)
**Estimated Time**: 3-4 hours
**Difficulty**: Medium

## Overview

This phase creates the chat interface component that allows users to interact with the AI campus navigation assistant. The component displays conversation history, handles user input, shows loading states, and processes navigation commands from the AI.

**What You'll Build:**
- `AICampusChat.tsx` component with full conversation UI
- Message display with user/assistant distinction
- Text input with send button and keyboard shortcuts
- Loading states and error handling
- Minimize/maximize/close controls
- Basic direct navigation (enhanced to sequential in Phase 6)
- Route information display
- Mobile-responsive design

**Key Features:**
- Real-time conversation with AI
- Visual feedback during API calls
- Display route information before navigation
- Graceful error handling with user-friendly messages
- Persistent conversation history (session-based)
- Accessible keyboard navigation

---

## Step 1: Component File Structure

### File Location

Create the component at: `src/components/AICampusChat.tsx`

This component will be imported into the main tour page and displayed as an overlay.

### Dependencies

The component will use:
- React hooks (useState, useEffect, useRef)
- TanStack Start server function (getChatResponse)
- Tailwind CSS for styling
- Lucide React for icons

---

## Step 2: Component Interface

### Props Interface

```typescript
/**
 * Props for the AICampusChat component
 *
 * @property currentPhotoId - The ID of the current photo/location the user is viewing
 * @property onNavigate - Callback function to navigate to a new photo location
 * @property onClose - Callback function when user closes the chat component
 */
export interface AICampusChatProps {
  currentPhotoId: string
  onNavigate: (photoId: string) => void
  onClose: () => void
}
```

**Why These Props:**
- `currentPhotoId`: Required by server function to calculate paths from current location
- `onNavigate`: Parent component controls actual navigation (keeps chat component pure)
- `onClose`: Allows parent to manage chat visibility state

---

## Step 3: Message Data Structures

### Message Interface

```typescript
/**
 * Represents a single message in the chat conversation
 *
 * @property role - Who sent the message: 'user' or 'assistant'
 * @property content - The text content of the message
 * @property timestamp - When the message was created
 * @property navigationData - Optional navigation information if AI triggered navigation
 * @property navigationData.photoId - Destination photo ID
 * @property navigationData.path - Array of photo IDs representing the route
 * @property navigationData.distance - Number of steps in the route
 * @property navigationData.routeDescription - Human-readable route description
 * @property navigationData.error - Error message if navigation failed
 */
interface ChatMessageDisplay {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  navigationData?: {
    photoId: string
    path?: string[]
    distance?: number
    routeDescription?: string
    error?: string
  }
}
```

**Why Separate from Server Type:**
- Server `ChatMessage` is minimal (role + content)
- UI `ChatMessageDisplay` adds timestamp and navigation data for display
- Keeps concerns separated (server data vs UI presentation)

---

## Step 4: Complete Component Implementation

### File: `src/components/AICampusChat.tsx`

```typescript
'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Minimize2, Maximize2, X, MapPin, AlertCircle, Loader2 } from 'lucide-react'
import { getChatResponse, ChatMessage, FunctionCall } from '../lib/ai'

/**
 * Props for the AICampusChat component
 *
 * @property currentPhotoId - The ID of the current photo/location the user is viewing
 * @property onNavigate - Callback function to navigate to a new photo location
 * @property onClose - Callback function when user closes the chat component
 */
export interface AICampusChatProps {
  currentPhotoId: string
  onNavigate: (photoId: string) => void
  onClose: () => void
}

/**
 * Represents a single message in the chat conversation
 *
 * @property role - Who sent the message: 'user' or 'assistant'
 * @property content - The text content of the message
 * @property timestamp - When the message was created
 * @property navigationData - Optional navigation information if AI triggered navigation
 */
interface ChatMessageDisplay {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  navigationData?: {
    photoId: string
    path?: string[]
    distance?: number
    routeDescription?: string
    error?: string
  }
}

/**
 * AI-powered campus navigation chat component
 *
 * Provides a conversational interface for users to ask questions about campus
 * locations and request navigation assistance. Displays conversation history,
 * handles user input, shows loading states, and processes navigation commands.
 *
 * @param props - Component props including current location and navigation callback
 * @returns Chat interface component with conversation history and input field
 *
 * @example
 * ```tsx
 * <AICampusChat
 *   currentPhotoId={currentPhoto.id}
 *   onNavigate={(photoId) => jumpToPhoto(photoId)}
 *   onClose={() => setShowChat(false)}
 * />
 * ```
 */
export function AICampusChat({ currentPhotoId, onNavigate, onClose }: AICampusChatProps) {
  // ============================================
  // State Management
  // ============================================

  const [messages, setMessages] = useState<ChatMessageDisplay[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your campus navigation assistant. I can help you find locations and navigate the campus. Where would you like to go?',
      timestamp: new Date()
    }
  ])

  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)

  // Refs for auto-scrolling and input focus
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ============================================
  // Auto-scroll to Bottom on New Messages
  // ============================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ============================================
  // Handle Message Submission
  // ============================================

  /**
   * Handles sending a message to the AI assistant
   *
   * Validates input, calls server function, processes response including
   * navigation commands, and updates UI with results or errors.
   */
  const handleSendMessage = async () => {
    const trimmedInput = inputValue.trim()

    // Validate input
    if (!trimmedInput) return

    if (trimmedInput.length > 500) {
      setError('Message too long. Please keep messages under 500 characters.')
      return
    }

    // Clear input immediately for better UX
    setInputValue('')
    setError(null)

    // Add user message to display
    const userMessage: ChatMessageDisplay = {
      role: 'user',
      content: trimmedInput,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Prepare messages for server (only role and content)
      const serverMessages: ChatMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      // Add current user message
      serverMessages.push({
        role: 'user',
        content: trimmedInput
      })

      // Call AI server function
      const response = await getChatResponse(serverMessages, currentPhotoId)

      // Handle error response
      if (response.error) {
        setError(response.error)
        setIsLoading(false)
        return
      }

      // Create assistant message
      const assistantMessage: ChatMessageDisplay = {
        role: 'assistant',
        content: response.message || 'I understand. Let me help with that.',
        timestamp: new Date()
      }

      // If AI triggered navigation, add navigation data
      if (response.functionCall) {
        assistantMessage.navigationData = {
          photoId: response.functionCall.arguments.photoId,
          path: response.functionCall.arguments.path,
          distance: response.functionCall.arguments.distance,
          routeDescription: response.functionCall.arguments.routeDescription,
          error: response.functionCall.arguments.error
        }
      }

      // Add assistant message to display
      setMessages(prev => [...prev, assistantMessage])

      // Execute navigation if no error
      if (response.functionCall && !response.functionCall.arguments.error) {
        // In Phase 5: direct jump navigation
        // In Phase 6: will be enhanced to sequential navigation
        setTimeout(() => {
          onNavigate(response.functionCall!.arguments.photoId)
        }, 500) // Small delay so user sees the route info first
      }

    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  // ============================================
  // Keyboard Shortcuts
  // ============================================

  /**
   * Handles keyboard events for message input
   *
   * - Enter: Send message
   * - Shift+Enter: New line (handled by textarea, not implemented in basic version)
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // ============================================
  // Render: Minimized State
  // ============================================

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-colors"
          aria-label="Open chat"
        >
          <MapPin className="w-6 h-6" />
        </button>
      </div>
    )
  }

  // ============================================
  // Render: Full Chat Interface
  // ============================================

  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] z-50">
      <div className="bg-white rounded-lg shadow-2xl flex flex-col max-h-[600px] border border-gray-200">

        {/* ============================================ */}
        {/* Header */}
        {/* ============================================ */}

        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <h3 className="font-semibold">Campus Assistant</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="hover:bg-blue-700 p-1 rounded transition-colors"
              aria-label="Minimize chat"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="hover:bg-blue-700 p-1 rounded transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ============================================ */}
        {/* Messages Container */}
        {/* ============================================ */}

        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {/* Message Content */}
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                {/* Navigation Data Display */}
                {message.navigationData && (
                  <div className="mt-2 pt-2 border-t border-gray-300">
                    {message.navigationData.error ? (
                      // Navigation Error
                      <div className="flex items-start gap-2 text-red-600">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p className="text-xs">{message.navigationData.error}</p>
                      </div>
                    ) : (
                      // Navigation Success
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <p className="text-xs font-semibold">
                            Route: {message.navigationData.distance || 0} steps
                          </p>
                        </div>
                        {message.navigationData.routeDescription && (
                          <p className="text-xs pl-6">
                            {message.navigationData.routeDescription}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Timestamp */}
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <p className="text-sm text-gray-600">Thinking...</p>
              </div>
            </div>
          )}

          {/* Auto-scroll Anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* ============================================ */}
        {/* Error Message */}
        {/* ============================================ */}

        {error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200">
            <div className="flex items-start gap-2 text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* Input Area */}
        {/* ============================================ */}

        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about campus locations..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
              maxLength={500}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Press Enter to send
          </p>
        </div>
      </div>
    </div>
  )
}
```

---

## Step 5: Component Features Breakdown

### 5.1 State Management

**Messages State:**
```typescript
const [messages, setMessages] = useState<ChatMessageDisplay[]>([...])
```
- Stores entire conversation history
- Includes initial greeting message
- Each message has role, content, timestamp, optional navigation data

**Input State:**
```typescript
const [inputValue, setInputValue] = useState('')
```
- Controlled input for message typing
- Cleared immediately after sending for better UX

**Loading State:**
```typescript
const [isLoading, setIsLoading] = useState(false)
```
- Shows loading indicator while waiting for AI response
- Disables input during processing

**Error State:**
```typescript
const [error, setError] = useState<string | null>(null)
```
- Displays user-friendly error messages
- Cleared on successful message send

**Minimized State:**
```typescript
const [isMinimized, setIsMinimized] = useState(false)
```
- Toggles between full chat and minimized button
- Preserves conversation when minimized

### 5.2 Auto-Scroll Behavior

```typescript
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
}, [messages])
```

**Why This Matters:**
- Automatically scrolls to newest message
- Smooth animation for better UX
- Triggers whenever messages array changes

### 5.3 Message Sending Flow

1. **Validate Input**: Check for empty or too-long messages
2. **Clear Input**: Immediate feedback to user
3. **Add User Message**: Display in UI right away
4. **Call Server**: Send to getChatResponse() with current location
5. **Handle Response**: Process AI message and navigation command
6. **Update UI**: Add assistant message with route info
7. **Execute Navigation**: Call onNavigate() after short delay

### 5.4 Navigation Data Display

Messages can include navigation information:

```typescript
{message.navigationData && (
  <div className="mt-2 pt-2 border-t">
    {/* Route info: distance, description, or error */}
  </div>
)}
```

**Displays:**
- Route distance (number of steps)
- Route description (From A ’ B ’ C)
- Error messages if path calculation fails

### 5.5 Responsive Design

**Tailwind Classes:**
- `w-96 max-w-[calc(100vw-2rem)]`: Fixed width on desktop, fluid on mobile
- `max-h-[600px]`: Prevents chat from being too tall
- `overflow-y-auto`: Scrollable message area
- `fixed bottom-4 right-4`: Positioned over VR tour

---

## Step 6: Styling Customization

### Color Scheme

**Current Design:**
- Primary: Blue (`bg-blue-600`)
- User Messages: Blue background, white text
- Assistant Messages: Gray background, dark text
- Errors: Red (`bg-red-50`, `text-red-700`)

**Customizing Colors:**

To match your campus branding, update these classes:

```typescript
// Header background
className="bg-blue-600 text-white"  ’  "bg-purple-600 text-white"

// User message bubble
className="bg-blue-600 text-white"  ’  "bg-purple-600 text-white"

// Send button
className="bg-blue-600 hover:bg-blue-700"  ’  "bg-purple-600 hover:bg-purple-700"
```

### Sizing Options

**Larger Chat:**
```typescript
// Change width
className="w-96"  ’  "w-[500px]"

// Change height
className="max-h-[600px]"  ’  "max-h-[700px]"
```

**Smaller Chat (Mobile-First):**
```typescript
// Full-width on mobile, fixed on desktop
className="w-96 max-w-[calc(100vw-2rem)]"  ’  "w-full sm:w-96"
```

---

## Step 7: Integration with Main App

### Step 7.1: Add Chat State to Tour Page

**File: `src/routes/index.tsx`**

Add state to control chat visibility:

```typescript
'use client'

import { useState } from 'react'
import { PanoramicViewer } from '@/components/PanoramicViewer'
import { AICampusChat } from '@/components/AICampusChat'

export default function HomePage() {
  const [currentPhotoId, setCurrentPhotoId] = useState('a-f1-north-entrance')
  const [showChat, setShowChat] = useState(false)

  const handleNavigate = (photoId: string) => {
    setCurrentPhotoId(photoId)
    // jumpToPhoto will be implemented in PanoramicViewer
  }

  return (
    <div className="relative w-full h-screen">
      <PanoramicViewer
        currentPhotoId={currentPhotoId}
        onPhotoChange={setCurrentPhotoId}
      />

      {/* Chat Toggle Button */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
        >
          Ask AI Assistant
        </button>
      )}

      {/* Chat Component */}
      {showChat && (
        <AICampusChat
          currentPhotoId={currentPhotoId}
          onNavigate={handleNavigate}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  )
}
```

### Step 7.2: Connect Navigation to PanoramicViewer

The `onNavigate` callback should eventually call your existing `jumpToPhoto` function in PanoramicViewer. This integration will be completed in Phase 7.

---

## Step 8: Testing Strategy

### 8.1 Manual Testing Checklist

**Basic Functionality:**
- [ ] Chat opens when clicking "Ask AI Assistant" button
- [ ] Initial greeting message displays correctly
- [ ] User can type message and press Enter to send
- [ ] User can click Send button to send message
- [ ] Input clears immediately after sending
- [ ] Loading indicator appears while waiting for response
- [ ] Assistant response appears after loading completes

**Navigation Testing:**
- [ ] Ask "Take me to the library"
- [ ] Verify route information displays (distance, description)
- [ ] Verify camera navigates to destination after 500ms delay
- [ ] Check that currentPhotoId updates correctly

**Error Handling:**
- [ ] Try sending empty message (should not send)
- [ ] Try sending 600-character message (should show error)
- [ ] Test with invalid currentPhotoId prop
- [ ] Simulate network error (disconnect wifi during send)
- [ ] Verify error messages display in red banner

**UI Controls:**
- [ ] Click minimize button - chat collapses to icon
- [ ] Click minimized icon - chat expands again
- [ ] Verify conversation persists when minimized
- [ ] Click close button - chat completely closes
- [ ] Reopen chat - verify new conversation starts

**Responsive Design:**
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768px width)
- [ ] Test on mobile (375px width)
- [ ] Verify chat doesn't overflow screen
- [ ] Check that messages scroll properly

**Keyboard Shortcuts:**
- [ ] Enter key sends message
- [ ] Enter on empty input does nothing
- [ ] Input focuses automatically after sending

### 8.2 Test Conversations

**Test Conversation 1: Simple Navigation**
```
User: "Where is the library?"
AI: "The library entrance is in the main building. Would you like me to navigate you there?"
User: "Yes"
AI: "I'll navigate you to the library entrance now."
[Navigation occurs with route info displayed]
```

**Test Conversation 2: Direct Navigation**
```
User: "Take me to the gym"
AI: "I'll navigate you to the gymnasium entrance now."
[Navigation occurs immediately]
```

**Test Conversation 3: Information Request**
```
User: "What's near the library?"
AI: "Near the library you'll find the student lounge and academic building A. Would you like directions to any of these?"
User: "No thanks"
AI: "Okay! Let me know if you need any help navigating."
```

**Test Conversation 4: Invalid Location**
```
User: "Take me to the cafeteria"
AI: "I don't have information about a cafeteria in the current tour. Would you like to go to the student lounge instead?"
```

### 8.3 Automated Testing (Optional)

**File: `src/components/__tests__/AICampusChat.test.tsx`**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AICampusChat } from '../AICampusChat'

describe('AICampusChat', () => {
  const mockOnNavigate = vi.fn()
  const mockOnClose = vi.fn()

  it('renders initial greeting message', () => {
    render(
      <AICampusChat
        currentPhotoId="a-f1-north-entrance"
        onNavigate={mockOnNavigate}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText(/Hello! I'm your campus navigation assistant/)).toBeInTheDocument()
  })

  it('sends message when clicking send button', async () => {
    render(
      <AICampusChat
        currentPhotoId="a-f1-north-entrance"
        onNavigate={mockOnNavigate}
        onClose={mockOnClose}
      />
    )

    const input = screen.getByPlaceholderText(/Ask me about campus locations/)
    const sendButton = screen.getByLabelText('Send message')

    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument()
    })
  })

  it('minimizes when clicking minimize button', () => {
    render(
      <AICampusChat
        currentPhotoId="a-f1-north-entrance"
        onNavigate={mockOnNavigate}
        onClose={mockOnClose}
      />
    )

    const minimizeButton = screen.getByLabelText('Minimize chat')
    fireEvent.click(minimizeButton)

    expect(screen.getByLabelText('Open chat')).toBeInTheDocument()
  })

  it('calls onClose when clicking close button', () => {
    render(
      <AICampusChat
        currentPhotoId="a-f1-north-entrance"
        onNavigate={mockOnNavigate}
        onClose={mockOnClose}
      />
    )

    const closeButton = screen.getByLabelText('Close chat')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })
})
```

**Running Tests:**
```bash
npm run test
```

---

## Step 9: Accessibility Features

### Keyboard Navigation

**Implemented:**
-  Enter key sends message
-  Tab navigates between input and button
-  Escape key could close chat (add if desired)

**Enhancement (Optional):**
```typescript
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && !isMinimized) {
      onClose()
    }
  }

  window.addEventListener('keydown', handleEscape)
  return () => window.removeEventListener('keydown', handleEscape)
}, [isMinimized, onClose])
```

### Screen Reader Support

**ARIA Labels:**
-  `aria-label` on all icon buttons
-  Semantic HTML (`button`, `input`, etc.)
-  Descriptive placeholder text

**Enhancement (Optional):**
Add live region for screen readers:
```typescript
<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
  {isLoading ? 'AI is responding...' : ''}
  {error ? `Error: ${error}` : ''}
</div>
```

### Focus Management

**Implemented:**
-  Input auto-focuses after sending message
-  Disabled state on loading prevents interaction

---

## Step 10: Performance Considerations

### Message History Limit

**Current Implementation:**
- Unlimited message history (all stored in state)

**Problem:**
- Long conversations consume memory
- Server function receives all messages (cost)

**Solution (Phase 8):**
Limit conversation history to last 10 messages:

```typescript
const handleSendMessage = async () => {
  // ... existing code ...

  // Prepare messages for server (last 10 only)
  const recentMessages = messages.slice(-10)
  const serverMessages: ChatMessage[] = recentMessages.map(msg => ({
    role: msg.role,
    content: msg.content
  }))

  // ... rest of code ...
}
```

### Optimistic UI Updates

**Current Implementation:**
- User message added immediately (optimistic)
- Input cleared immediately

**Benefits:**
- Feels instant and responsive
- Users can continue typing next message

---

## Step 11: Common Issues and Solutions

### Issue 1: Chat doesn't appear

**Symptom:**
"Ask AI Assistant" button shows but nothing happens when clicked

**Solution:**
Check that `showChat` state is updating:
```typescript
console.log('showChat:', showChat)
```

Verify conditional rendering:
```typescript
{showChat && <AICampusChat ... />}
```

---

### Issue 2: Messages not scrolling to bottom

**Symptom:**
New messages appear but require manual scrolling

**Solution:**
Verify the ref is attached:
```typescript
<div ref={messagesEndRef} />
```

Check that useEffect dependency is correct:
```typescript
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
}, [messages])  // Make sure messages is in dependency array
```

---

### Issue 3: Navigation doesn't work

**Symptom:**
AI responds but camera doesn't move

**Solution:**
Check that `onNavigate` is called:
```typescript
setTimeout(() => {
  console.log('Navigating to:', response.functionCall!.arguments.photoId)
  onNavigate(response.functionCall!.arguments.photoId)
}, 500)
```

Verify parent component's `handleNavigate` function:
```typescript
const handleNavigate = (photoId: string) => {
  console.log('handleNavigate called with:', photoId)
  setCurrentPhotoId(photoId)
}
```

---

### Issue 4: Input doesn't focus after sending

**Symptom:**
After sending message, must click input to type again

**Solution:**
Ensure ref is properly assigned and focus is called:
```typescript
const inputRef = useRef<HTMLInputElement>(null)

// In handleSendMessage finally block:
finally {
  setIsLoading(false)
  inputRef.current?.focus()  // Make sure this line exists
}
```

---

### Issue 5: Error persists after successful message

**Symptom:**
Error banner stays visible even after sending new message

**Solution:**
Clear error at start of handleSendMessage:
```typescript
const handleSendMessage = async () => {
  // ... validation code ...

  setError(null)  // Clear previous errors

  // ... rest of code ...
}
```

---

## Step 12: Future Enhancements (Phase 6+)

### Phase 6: Sequential Navigation

Phase 5 implements **direct jump** navigation:
```typescript
onNavigate(response.functionCall!.arguments.photoId)
```

Phase 6 will enhance this to **sequential step-by-step** navigation:
```typescript
navigateAlongPath(response.functionCall!.arguments.path)
```

### Additional Features (Post-MVP)

**Conversation Persistence:**
- Save to localStorage
- Restore on page reload

**Voice Input:**
- Web Speech API integration
- "Press and hold to speak" button

**Suggested Questions:**
- Quick action buttons
- "Where is the library?"
- "Show me the gym"
- "Take me to room X208"

**Message Actions:**
- Copy message text
- Regenerate response
- Thumbs up/down feedback

**Rich Media:**
- Location photos in messages
- Map previews
- Video clips of locations

---

## Step 13: Mobile Optimization

### Touch Gestures

**Currently:**
- Tap to minimize/close works
- Scrolling in message area works

**Enhancements:**
- Swipe down to minimize
- Swipe right to close
- Pull to refresh conversation

### Mobile-Specific Styling

```typescript
// Make chat full-width on small screens
className="w-full sm:w-96"

// Adjust height for mobile keyboards
className="max-h-[60vh] sm:max-h-[600px]"

// Larger touch targets on mobile
className="p-2 sm:p-1"
```

---

## Step 14: Summary

**What Phase 5 Accomplishes:**

 **Complete Chat UI**: Full-featured conversation interface with messages, input, controls
 **AI Integration**: Calls getChatResponse() server function with current location
 **Navigation Display**: Shows route information (distance, description) before navigating
 **Error Handling**: User-friendly error messages for all failure scenarios
 **Loading States**: Visual feedback during API calls
 **Responsive Design**: Works on desktop, tablet, mobile
 **Accessibility**: Keyboard shortcuts, ARIA labels, semantic HTML
 **UX Polish**: Auto-scroll, auto-focus, minimized state, timestamps

**Files Created:**
- `src/components/AICampusChat.tsx` - Main chat component (500+ lines)

**Files Modified (in integration step):**
- `src/routes/index.tsx` - Add chat state and button

**Ready for Phase 6:**
Phase 5 implements direct navigation (jump to destination). Phase 6 will enhance this with:
- Sequential step-by-step navigation using the path array
- Progress indicator showing current step
- Skip button to jump to end
- Speed controls for navigation

---

## Step 15: Verification Checklist

Before moving to Phase 6, verify:

### Component Structure
- [ ] `AICampusChat.tsx` created in `src/components/`
- [ ] All imports resolve correctly
- [ ] TypeScript compiles without errors
- [ ] Component exports properly

### Functionality
- [ ] Initial greeting message displays
- [ ] User can send messages
- [ ] AI responses appear
- [ ] Navigation commands execute
- [ ] Route information displays correctly
- [ ] Error messages display when appropriate

### UI/UX
- [ ] Chat opens/closes correctly
- [ ] Minimize/maximize works
- [ ] Messages auto-scroll to bottom
- [ ] Input clears after sending
- [ ] Loading indicator shows during API calls
- [ ] Timestamps display correctly

### Responsive Design
- [ ] Desktop layout (1920x1080) looks good
- [ ] Tablet layout (768px) works
- [ ] Mobile layout (375px) functional
- [ ] No horizontal scrolling
- [ ] Touch targets large enough on mobile

### Integration
- [ ] Chat integrates with tour page
- [ ] `currentPhotoId` prop receives correct value
- [ ] `onNavigate` callback works
- [ ] `onClose` callback works
- [ ] Navigation actually moves camera (or will in Phase 7)

---

## Time Estimate Breakdown

- **Step 1-3** (Setup + Interfaces): 20 minutes
- **Step 4** (Component Implementation): 90 minutes
- **Step 5-6** (Features + Styling): 30 minutes
- **Step 7** (Integration): 20 minutes
- **Step 8** (Testing): 45 minutes
- **Step 9-11** (Accessibility + Issues): 25 minutes

**Total: 3-4 hours** (including testing and debugging)

---

**Phase 5 Status**: Ready for implementation =€
