# Phase 3: Chat Component UI

**Duration:** 30 minutes
**Difficulty:** Medium
**Prerequisites:** Phase 2 complete

---

## Objectives

By the end of this phase, you will have:

1. ✅ Floating chat UI component created
2. ✅ Conversation history management implemented
3. ✅ Server function integration working
4. ✅ Loading states and error handling added
5. ✅ Minimize/maximize/close controls functional

---

## Step 3.1: Create Chat Component

**Time:** 20 minutes

### Create Component File

Create `src/components/chat/AICampusChat.tsx`:

```typescript
import { useState, useRef, useEffect } from 'react'
import { Send, X, Minimize2, Maximize2 } from 'lucide-react'
import { getChatResponse, type ChatMessage } from '@/lib/ai'

/**
 * AI Campus Chat Component
 *
 * Provides conversational AI assistance for campus navigation using OpenAI.
 * Floating chat window with conversation history and automatic viewport navigation.
 *
 * @property currentPhotoId - User's current location photo ID
 * @property onNavigate - Callback function to navigate viewport to a photo ID
 *
 * @example
 * ```tsx
 * <AICampusChat
 *   currentPhotoId="a-f1-north-entrance"
 *   onNavigate={(photoId) => jumpToPhoto(photoId)}
 * />
 * ```
 */
export interface AICampusChatProps {
  currentPhotoId: string
  onNavigate: (photoId: string) => void
}

export function AICampusChat({ currentPhotoId, onNavigate }: AICampusChatProps) {
  // UI state
  const [isMinimized, setIsMinimized] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your campus navigation assistant. Ask me anything like 'Where is the library?' or 'Take me to the gym!'"
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Auto-scroll reference
  const messagesEndRef = useRef<HTMLDivElement>(null)

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /**
   * Handle message submission
   *
   * Sends user message to AI server function, processes response,
   * and triggers navigation if AI returns a function call.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim()
    }

    // Add user message to conversation
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Call server function (type-safe!)
      const result = await getChatResponse(
        [...messages, userMessage],
        currentPhotoId
      )

      // Handle error
      if (result.error) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: result.error!
        }])
        return
      }

      // Add AI response to conversation
      if (result.message) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: result.message!
        }])
      }

      // Handle navigation function call
      if (result.functionCall) {
        console.log('[Chat] Navigating to:', result.functionCall.arguments.photoId)

        // Small delay so user can read the AI message
        setTimeout(() => {
          onNavigate(result.functionCall!.arguments.photoId)
        }, 500)
      }

    } catch (error) {
      console.error('[Chat] Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render if closed
  if (!isVisible) return null

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
        isMinimized ? 'w-80 h-14' : 'w-96 h-[600px]'
      }`}
      style={{ maxWidth: 'calc(100vw - 2rem)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-semibold text-sm">Campus Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat content (only shown when not minimized) */}
      {!isMinimized && (
        <div className="flex flex-col h-[calc(100%-3.5rem)]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about campus locations..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
```

✅ **Validation:** File created with no TypeScript errors

---

## Step 3.2: Test Chat Component in Isolation

**Time:** 5 minutes

### Create Test Page

Create a temporary test file `test-chat.tsx` in `src/routes/`:

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { AICampusChat } from '@/components/chat/AICampusChat'

export const Route = createFileRoute('/test-chat')({
  component: TestChat,
})

function TestChat() {
  const [currentLocation, setCurrentLocation] = useState('a-f1-north-entrance')

  const handleNavigate = (photoId: string) => {
    console.log('[Test] Navigation triggered:', photoId)
    setCurrentLocation(photoId)
    alert(`Navigation triggered to: ${photoId}`)
  }

  return (
    <div className="h-screen w-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-2xl font-bold mb-4">Chat Component Test</h1>
        <p>Current Location: {currentLocation}</p>
        <p className="text-sm text-gray-400 mt-2">
          Try: "Where is the library?" then "Yes"
        </p>
      </div>

      <AICampusChat
        currentPhotoId={currentLocation}
        onNavigate={handleNavigate}
      />
    </div>
  )
}
```

### Test the Component

1. Start dev server:
```bash
npm run dev
```

2. Visit: http://localhost:3000/test-chat

3. **Test scenarios:**

   **Scenario 1: Greeting**
   - Type: "Hello"
   - Expected: AI greets you

   **Scenario 2: Location query**
   - Type: "Where is the library?"
   - Expected: AI provides directions and asks if you want navigation

   **Scenario 3: Navigation confirmation**
   - Type: "Yes please"
   - Expected: Alert shows "Navigation triggered to: library-f1-main-entrance"

   **Scenario 4: UI controls**
   - Click minimize button
   - Expected: Chat minimizes to header bar
   - Click maximize button
   - Expected: Chat expands

   **Scenario 5: Close**
   - Click X button
   - Expected: Chat disappears

### Clean Up Test File

After testing, delete the test file:

```bash
rm src/routes/test-chat.tsx
```

✅ **Validation:** Chat UI works correctly with server function integration

---

## Step 3.3: Add Keyboard Shortcuts (Optional Enhancement)

**Time:** 5 minutes (optional)

### Add Keyboard Support

Update `AICampusChat.tsx` to add Enter key submit and Escape to close:

Add this inside the component function:

```typescript
/**
 * Handle keyboard shortcuts
 */
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Escape to close chat
    if (e.key === 'Escape' && !isMinimized) {
      setIsVisible(false)
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [isMinimized])
```

**Keyboard shortcuts:**
- `Enter` in input field: Submit message (already works via form submit)
- `Escape`: Close chat

✅ **Validation:** Keyboard shortcuts work

---

## Step 3.4: Styling Adjustments (Optional)

**Time:** 5 minutes (optional)

### Match Your App Theme

If you want to match your existing app styling, update the colors:

```typescript
// Header gradient - change to match your brand
<div className="... bg-gradient-to-r from-blue-600 to-purple-600">

// User message bubble
<div className="bg-blue-500 text-white">

// AI message bubble
<div className="bg-gray-100 text-gray-800">

// Input focus ring
<input className="... focus:ring-blue-500">
```

**Your app uses:**
- Primary blue: Check your existing components for exact shade
- Background: `bg-gray-900` (dark mode)

**Example customization:**
```typescript
// Match existing blue from your app
const PRIMARY_BLUE = 'bg-blue-600'
const PRIMARY_BLUE_HOVER = 'hover:bg-blue-700'
```

✅ **Validation:** Chat matches your app design

---

## Phase 3 Complete! 🎉

### Checklist Review

- [x] 3.1 - Created `AICampusChat` component
- [x] 3.2 - Tested chat UI and server function integration
- [x] 3.3 - (Optional) Added keyboard shortcuts
- [x] 3.4 - (Optional) Styled to match app theme

### What You Accomplished

✅ **Floating chat UI with minimize/maximize**
✅ **Conversation history management**
✅ **Server function integration with full type safety**
✅ **Loading states and error handling**
✅ **Navigation callback working**

### Component Features

**UI:**
- Floating bottom-right position
- Minimize/maximize/close controls
- Auto-scroll to latest message
- Loading indicator during AI response
- Responsive sizing (mobile-friendly)

**Functionality:**
- Multi-turn conversation support
- Type-safe server function calls
- Automatic navigation on AI function calls
- Error handling with user-friendly messages
- Input validation (can't send empty messages)

### Cost Incurred

**~$0.03** - Testing conversations

---

## Key Architecture Points

### Type Safety End-to-End

```typescript
const result = await getChatResponse(messages, currentPhotoId)
//    ^? ChatResponse (TypeScript knows the type!)

if (result.functionCall) {
  onNavigate(result.functionCall.arguments.photoId)
  //                              ^? TypeScript autocomplete!
}
```

### State Management

```typescript
// Conversation history
const [messages, setMessages] = useState<ChatMessage[]>([...])

// UI state
const [isMinimized, setIsMinimized] = useState(false)
const [isLoading, setIsLoading] = useState(false)

// All state is local to this component
// Each user has their own independent state
```

### Navigation Flow

```
1. User: "Take me to library"
   ↓
2. Server function: getChatResponse(...)
   ↓
3. OpenAI: Returns navigate_to function call
   ↓
4. Component: Calls onNavigate(photoId)
   ↓
5. Parent: jumpToPhoto(photoId)
   ↓
6. Viewport navigates!
```

---

## Next Steps

**Proceed to Phase 4:** [Phase 4 - Integration](./phase-4-integration.md)

You'll implement:
- Integration into main app (`src/routes/index.tsx`)
- Connection to existing navigation system
- Final testing of complete flow

**Estimated time:** 15 minutes
