# Phase 2: Server Function Implementation

**Duration:** 20 minutes
**Difficulty:** Medium
**Prerequisites:** Phase 1 complete

---

## Objectives

By the end of this phase, you will have:

1. ✅ AI server function created with full type safety
2. ✅ OpenAI function calling configured for navigation
3. ✅ Campus location knowledge embedded
4. ✅ Error handling implemented
5. ✅ Server function tested

---

## Step 2.1: Understand Your Existing Navigation System

**Time:** 5 minutes (reading + exploration)

### Current Navigation Hook

Your app uses `useTourNavigation` hook which provides:

```typescript
const {
  currentPhotoId,    // Current location (e.g., "a-f1-north-entrance")
  jumpToPhoto,       // Function to navigate: jumpToPhoto(photoId)
  currentPhoto,      // Full photo object with metadata
  isLoading          // Navigation loading state
} = useTourNavigation()
```

### Available Photo IDs

Your campus has these key locations (from `src/data/blockUtils.ts`):

**A Block:**
- `a-f1-north-entrance` - Main entrance to A Block
- `a-f1-south-*` - A Block corridors
- `a-f2-*` - A Block floor 2

**Library:**
- `library-f1-main-entrance` - Library main entrance
- `library-f1-*` - Library floor 1 areas
- `library-f2-*` - Library floor 2 study areas

**W Block:**
- `w-gym-entry` - Gymnasium entrance
- `w-f1-*` - W Block corridors

**Student Lounge:**
- `lounge-main` - Main student lounge area

**N/S/X Blocks:**
- Multiple floors and corridors
- Sandy's office in N Block: `n-sandy-office`

### Key Insight

**All you need to do:**
1. User asks: "Where is the library?"
2. AI responds: "I'll navigate you there!"
3. Call: `jumpToPhoto("library-f1-main-entrance")`
4. Done!

**No complex pathfinding needed!** The `jumpToPhoto` function handles everything.

---

## Step 2.2: Create Server Function

**Time:** 10 minutes

### Create AI Module

Create the file `src/lib/ai.ts`:

```typescript
'use server'

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

/**
 * Message type for chat conversations
 *
 * Standard OpenAI message format with role and content.
 * Used for maintaining conversation history.
 *
 * @property role - Message sender role
 * @property content - Message text content
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/**
 * Function call response from OpenAI
 *
 * Represents a function call instruction from the AI.
 * Contains the function name and parsed arguments.
 *
 * @property name - Name of the function to call
 * @property arguments - Parsed function arguments as object
 */
export interface FunctionCall {
  name: string
  arguments: {
    photoId: string
  }
}

/**
 * AI Chat Response
 *
 * Result from server function containing AI message and optional navigation command.
 *
 * @property message - AI's text response (null if error)
 * @property functionCall - Navigation command if AI wants to navigate user
 * @property error - Error message if request failed
 */
export interface ChatResponse {
  message: string | null
  functionCall: FunctionCall | null
  error?: string
}

/**
 * Campus Location Definitions
 *
 * Maps user-friendly location names to photo IDs.
 * Used by AI to understand which photo ID corresponds to each location.
 */
const CAMPUS_LOCATIONS = {
  // A Block
  'a-f1-north-entrance': ['A Block', 'Main Entrance', 'Academic Building A', 'Block A', 'A Building'],

  // Library
  'library-f1-main-entrance': ['Library', 'Main Library', 'Books', 'Study Area', 'Reading Room', 'Library Entrance'],

  // W Block / Gym
  'w-gym-entry': ['Gym', 'Gymnasium', 'Sports Hall', 'Recreation Center', 'Fitness Center', 'Workout Area'],

  // Student Lounge
  'lounge-main': ['Student Lounge', 'Common Area', 'Hangout', 'Social Space', 'Break Room', 'Lounge'],

  // N Block
  'n-sandy-office': ['Professor Sandy Office', 'Sandy Office', 'Faculty Office', 'Sandy', 'Professor Sandy'],

  // Add more key locations as needed
} as const

/**
 * Generate location knowledge for AI system prompt
 *
 * Converts CAMPUS_LOCATIONS map into human-readable format for AI.
 * Includes photo ID and all synonyms for each location.
 *
 * @returns Formatted string describing all campus locations
 */
function generateLocationKnowledge(): string {
  return Object.entries(CAMPUS_LOCATIONS)
    .map(([photoId, synonyms]) => `- ${photoId}: ${synonyms.join(', ')}`)
    .join('\n')
}

/**
 * AI Campus Chat Server Function
 *
 * Processes chat messages using OpenAI GPT-4 with function calling for navigation.
 * Runs entirely on server - API key never exposed to client.
 *
 * This server function:
 * 1. Sends conversation to OpenAI with campus location context
 * 2. AI responds with helpful directions
 * 3. If user confirms, AI calls navigate_to function
 * 4. Returns navigation command to client for execution
 *
 * @param messages - Conversation history (user and assistant messages)
 * @param currentLocation - User's current photo ID for context
 * @returns AI response with optional navigation function call
 *
 * @example
 * ```typescript
 * const result = await getChatResponse(
 *   [{ role: 'user', content: 'Where is the library?' }],
 *   'a-f1-north-entrance'
 * )
 *
 * if (result.functionCall) {
 *   jumpToPhoto(result.functionCall.arguments.photoId)
 * }
 * ```
 */
export async function getChatResponse(
  messages: ChatMessage[],
  currentLocation: string
): Promise<ChatResponse> {
  'use server'

  try {
    // Input validation
    if (!messages || messages.length === 0) {
      return {
        message: null,
        functionCall: null,
        error: 'No messages provided'
      }
    }

    // Protection against excessive conversation length
    if (messages.length > 20) {
      return {
        message: null,
        functionCall: null,
        error: 'Conversation too long. Please start a new chat.'
      }
    }

    // Protection against excessive message size
    const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0)
    if (totalChars > 5000) {
      return {
        message: null,
        functionCall: null,
        error: 'Message too long. Please be more concise.'
      }
    }

    // Call OpenAI with function calling
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a helpful campus navigation assistant at ARA Institute of Canterbury.

**Current User Location:** ${currentLocation}

**Available Campus Locations:**
${generateLocationKnowledge()}

**Your Role:**
When users ask about finding a location or getting directions:
1. Provide friendly, helpful text directions explaining how to get there from their current location
2. Ask if they'd like you to automatically navigate them there
3. If they say yes (or any affirmative response like "sure", "okay", "please"), call the navigate_to function

**Conversation Style:**
- Be conversational, helpful, and friendly
- Use clear, simple language
- Don't be overly verbose
- Respond naturally to greetings and casual conversation

**Example Conversations:**

User: "Where is the library?"
You: "The Library is located southwest from the main entrance. From where you are at A Block, head down the main corridor and turn left at the atrium. Would you like me to take you there automatically?"

User: "yes please"
You: [Call navigate_to function with photoId: "library-f1-main-entrance"]

User: "hi"
You: "Hello! I'm your campus navigation assistant. I can help you find locations around ARA Institute. What are you looking for?"

User: "I need to find the gym"
You: "The Gymnasium is in W Block. From your current location, you'll need to head through the main corridor and take the connector bridge. It's about a 2-minute walk. Would you like me to navigate you there?"
`
        },
        ...messages
      ],
      functions: [{
        name: "navigate_to",
        description: "Automatically navigate the user's viewport to a specific campus location. Only call this when the user confirms they want to be navigated there.",
        parameters: {
          type: "object",
          properties: {
            photoId: {
              type: "string",
              enum: Object.keys(CAMPUS_LOCATIONS),
              description: "The photo ID to navigate to"
            }
          },
          required: ["photoId"]
        }
      }],
      temperature: 0.7,
      max_tokens: 200
    })

    const choice = response.choices[0]

    // Check if AI wants to call a function
    let functionCall: FunctionCall | null = null
    if (choice.message.function_call) {
      functionCall = {
        name: choice.message.function_call.name,
        arguments: JSON.parse(choice.message.function_call.arguments)
      }
    }

    return {
      message: choice.message.content || null,
      functionCall
    }

  } catch (error: any) {
    console.error('[AI Server Function] Error:', error)

    // Handle specific OpenAI errors
    if (error.status === 429) {
      return {
        message: null,
        functionCall: null,
        error: 'The AI is currently busy. Please try again in a moment.'
      }
    }

    if (error.status === 401) {
      console.error('[AI] Invalid API key. Check .env.local file.')
      return {
        message: null,
        functionCall: null,
        error: 'AI service configuration error. Please contact support.'
      }
    }

    if (error.status >= 500) {
      return {
        message: null,
        functionCall: null,
        error: 'The AI service is temporarily unavailable. Please try again.'
      }
    }

    // Generic error
    return {
      message: null,
      functionCall: null,
      error: 'Sorry, I encountered an error. Please try again.'
    }
  }
}
```

✅ **Validation:** File created at `src/lib/ai.ts` with no TypeScript errors

---

## Step 2.3: Test Server Function

**Time:** 5 minutes

### Create Test File

Create `test-server-function.ts` in project root:

```typescript
import { getChatResponse } from './src/lib/ai'

async function testServerFunction() {
  console.log('Testing AI server function...\n')

  // Test 1: Simple greeting
  console.log('Test 1: Greeting')
  const greeting = await getChatResponse(
    [{ role: 'user', content: 'Hello!' }],
    'a-f1-north-entrance'
  )
  console.log('AI:', greeting.message)
  console.log('Function call:', greeting.functionCall)
  console.log('')

  // Test 2: Ask about location
  console.log('Test 2: Ask about library')
  const question = await getChatResponse(
    [{ role: 'user', content: 'Where is the library?' }],
    'a-f1-north-entrance'
  )
  console.log('AI:', question.message)
  console.log('Function call:', question.functionCall)
  console.log('')

  // Test 3: Confirm navigation
  console.log('Test 3: Confirm navigation')
  const confirm = await getChatResponse(
    [
      { role: 'user', content: 'Where is the library?' },
      { role: 'assistant', content: 'The Library is southwest from here. Would you like me to take you there?' },
      { role: 'user', content: 'Yes please' }
    ],
    'a-f1-north-entrance'
  )
  console.log('AI:', confirm.message)
  console.log('Function call:', confirm.functionCall)
  console.log('Expected: Function call with photoId: "library-f1-main-entrance"')
  console.log('')

  // Test 4: Error handling (excessive length)
  console.log('Test 4: Error handling (too many messages)')
  const tooManyMessages = Array(25).fill(null).map(() => ({
    role: 'user' as const,
    content: 'Test message'
  }))
  const error = await getChatResponse(tooManyMessages, 'a-f1-north-entrance')
  console.log('Error:', error.error)
  console.log('Expected: "Conversation too long" error')
  console.log('')

  console.log('✅ All tests complete!')
}

testServerFunction().catch(console.error)
```

### Run Tests

```bash
npx tsx test-server-function.ts
```

**Expected output:**
```
Testing AI server function...

Test 1: Greeting
AI: Hello! I'm your campus navigation assistant. How can I help you today?
Function call: null

Test 2: Ask about library
AI: The Library is located southwest from the main entrance. From A Block, head down the main corridor and turn left at the atrium. Would you like me to take you there automatically?
Function call: null

Test 3: Confirm navigation
AI: Great! I'll navigate you to the library now.
Function call: { name: 'navigate_to', arguments: { photoId: 'library-f1-main-entrance' } }
Expected: Function call with photoId: "library-f1-main-entrance"

Test 4: Error handling (too many messages)
Error: Conversation too long. Please start a new chat.
Expected: "Conversation too long" error

✅ All tests complete!
```

### Verify Test Results

**Test 1 (Greeting):** ✅ AI responds conversationally, no function call
**Test 2 (Location question):** ✅ AI provides directions, asks if user wants navigation
**Test 3 (Navigation confirm):** ✅ AI calls `navigate_to` function with correct photo ID
**Test 4 (Error handling):** ✅ Error message returned for excessive messages

### Clean Up

```bash
rm test-server-function.ts
```

✅ **Validation:** Server function works correctly with OpenAI function calling

---

## Step 2.4: Add More Campus Locations (Optional)

**Time:** 5 minutes (optional)

### Expand Location Database

If you want to add more locations, update the `CAMPUS_LOCATIONS` constant:

```typescript
const CAMPUS_LOCATIONS = {
  // A Block
  'a-f1-north-entrance': ['A Block', 'Main Entrance', 'Academic Building A'],
  'a-f2-mid-1': ['A Block Floor 2', 'Second Floor A Block'],

  // Library
  'library-f1-main-entrance': ['Library', 'Main Library', 'Books', 'Study Area'],
  'library-f2-study-area': ['Library Second Floor', 'Upstairs Library', 'Quiet Study'],

  // W Block
  'w-gym-entry': ['Gym', 'Gymnasium', 'Sports Hall', 'Recreation Center'],
  'w-f1-main-hall': ['W Block Main Hall', 'W Block Corridor'],

  // N Block
  'n-sandy-office': ['Professor Sandy Office', 'Sandy Office', 'Faculty Office'],
  'n-f1-entrance': ['N Block Entrance', 'N Building'],

  // S Block
  's-f1-entrance': ['S Block', 'S Building', 'Science Block'],
  's453-classroom': ['Room S453', 'S453', 'Classroom S453'],

  // X Block
  'x-f1-east-entrance': ['X Block', 'X Building', 'IT Block'],

  // Outside areas
  'outside-a-east-1': ['Outside', 'Campus Grounds', 'Courtyard'],

  // Student Lounge
  'lounge-main': ['Student Lounge', 'Common Area', 'Hangout', 'Social Space'],
} as const
```

**How to find photo IDs:**

1. Look in your data files: `src/data/blocks/*/`
2. Each photo has an `id` property
3. Add the most important/commonly asked-about locations

**Example from your data:**
```typescript
// From src/data/blocks/library/floor1.ts
export const floor1: Photo[] = [
  {
    id: 'library-f1-main-entrance',  // ← Use this as the key
    imageUrl: '/images/library/...',
    ...
  }
]
```

✅ **Validation:** AI can navigate to all added locations

---

## Phase 2 Complete! 🎉

### Checklist Review

- [x] 2.1 - Understood existing navigation system (`jumpToPhoto`)
- [x] 2.2 - Created `src/lib/ai.ts` with server function
- [x] 2.3 - Tested OpenAI function calling
- [x] 2.4 - (Optional) Added more campus locations

### What You Accomplished

✅ **Server function with full type safety**
✅ **OpenAI function calling configured**
✅ **Campus location knowledge embedded**
✅ **Error handling implemented**
✅ **Navigation commands working**

### Cost Incurred

**~$0.05** - Testing used ~3,000 tokens

---

## Key Architecture Points

### Type Safety

```typescript
const result = await getChatResponse(messages, currentLocation)
//    ^? ChatResponse (TypeScript knows the exact type!)

if (result.functionCall) {
  result.functionCall.arguments.photoId
  //                  ^? TypeScript autocomplete works!
}
```

### Server-Only Execution

```typescript
'use server' // ← Ensures this NEVER runs in browser

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY! // ← Safe! Never exposed to client
})
```

### Multi-User Isolation

Each user's browser:
1. Calls `getChatResponse(...)` with their own messages
2. Gets response on their HTTP connection
3. Executes navigation in their own browser
4. **Zero interference with other users**

---

## Next Steps

**Proceed to Phase 3:** [Phase 3 - Chat Component](./phase-3-chat-component.md)

You'll implement:
- Floating chat UI with minimize/maximize
- Conversation history management
- Direct integration with server function
- Loading states and error handling

**Estimated time:** 30 minutes
