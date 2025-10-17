# Phase 3: Basic AI Server Function

**Duration:** 20 minutes
**Difficulty:** Medium
**Prerequisites:** Phases 1-2 complete (OpenAI setup + Pathfinding)

---

## Objectives

By the end of this phase, you will have:

1.  `src/lib/ai.ts` created with OpenAI integration
2.  TypeScript interfaces defined for type safety
3.  Locations vector store connected
4.  System prompt crafted for navigation assistance
5.  OpenAI Responses API tool-calling configured
6.  Error handling implemented
7.  Basic AI responses working (without pathfinding integration yet)

---

## Why Basic AI First?

**Strategic Decision:** We create the basic AI server function BEFORE integrating pathfinding because:

1. **Test AI Independently** - Verify OpenAI integration works without pathfinding complexity
2. **Iterate on Prompts** - Refine system prompt and conversation style quickly
3. **Simple First** - Get basic tool calling working before adding path calculations
4. **Phase 4 Enhancement** - We'll add pathfinding integration in the next phase

**Architecture:**
```
Phase 3: Basic AI (this phase)
    -> Returns simple photoId
    ->
Phase 4: Enhanced AI
    -> Returns photoId + full path array
```

---

## Step 3.1: Understand Server Functions

**Time:** 3 minutes

### What Are Server Functions?

**TanStack Start** provides `'use server'` directive for server-only code:

```typescript
export async function myServerFunction() {
  'use server'
  // This code NEVER runs in the browser
  // API keys are safe here
}
```

**Benefits:**
-  API keys never exposed to client
-  Type-safe calls (looks like regular function)
-  No manual fetch/JSON parsing
-  Automatic RPC endpoint creation

### Security Model

```
Client (Browser)                Server (Node.js)
              
User clicks button
    ->
Calls getChatResponse(...)
    ->
    HTTP POST-> TanStack Start receives
                                     ->
                                     Runs server function
                                     ->
                                     Calls OpenAI API
                                     (API key safe on server!)
                                     ->
    ->JSON response$ Returns result
    ->
Receives typed response
    ->
Updates UI
```

**Your API key NEVER leaves the server.**

---

## Step 3.2: Create AI Module File

**Time:** 1 minute

### Create the File

```bash
# File should already exist from Phase 2 directory creation
# If not, create it:
touch src/lib/ai.ts
```

**Windows:**
```bash
type nul > src\lib\ai.ts
```

---

## Step 3.3: Define TypeScript Interfaces

**Time:** 5 minutes

### Add Imports and Base Interfaces

Open `src/lib/ai.ts` and add the following code:

```typescript
'use server'

import OpenAI, { APIError } from 'openai'

/**
 * Chat message type for conversation history
 *
 * Standard OpenAI message format with role and content.
 * Used for maintaining conversation context across multiple interactions.
 *
 * Roles:
 * - 'system': Instructions for the AI (not shown to user)
 * - 'assistant': AI responses
 * - 'user': User messages
 *
 * @property role - Message sender role
 * @property content - Message text content
 *
 * @example
 * ```typescript
 * const messages: ChatMessage[] = [
 *   { role: 'user', content: 'Where is the library?' },
 *   { role: 'assistant', content: 'The library is southwest from here.' }
 * ]
 * ```
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/**
 * Navigation function call from AI (BASIC VERSION - Phase 3)
 *
 * Simple function call containing only destination photo ID.
 * Phase 4 will enhance this with pathfinding data (path array, distance, etc).
 *
 * This structure matches OpenAI's Responses API tool-calling format.
 *
 * @property name - Function name to call (always 'navigate_to' for now)
 * @property arguments - Function arguments object
 * @property arguments.photoId - Destination photo ID from campus locations
 *
 * @example
 * ```typescript
 * const functionCall: FunctionCall = {
 *   name: 'navigate_to',
 *   arguments: {
 *     photoId: 'library-f1-entrance'
 *   }
 * }
 * ```
 */
export interface FunctionCall {
  name: string
  arguments: {
    photoId: string
  })

export function getChatResponse(input: GetChatResponseInput): Promise<ChatResponse> {
  return getChatResponseServerFn({ data: input })
}

/**
 * AI chat response container
 *
 * Result from server function containing AI message and optional
 * navigation command. The error field is populated on failure.
 *
 * Response patterns:
 * - Normal response: { message: "text", functionCall: null, error: undefined }
 * - Navigation response: { message: "text", functionCall: {...}, error: undefined }
 * - Error response: { message: null, functionCall: null, error: "error message" }
 *
 * @property message - AI's text response (null if error occurred)
 * @property functionCall - Navigation command if AI wants to navigate user
 * @property error - Error message if request failed
 *
 * @example
 * ```typescript
 * // Successful response
 * const response: ChatResponse = {
 *   message: "I'll take you to the library!",
 *   functionCall: {
 *     name: 'navigate_to',
 *     arguments: { photoId: 'library-f1-entrance' }
 *   }
 * }
 *
 * // Error response
 * const errorResponse: ChatResponse = {
 *   message: null,
 *   functionCall: null,
 *   error: 'The AI service is temporarily unavailable.'
 * }
 * ```
 */
export interface ChatResponse {
  message: string | null
  functionCall: FunctionCall | null
  error?: string
}
```

### Why These Interfaces?

**ChatMessage:**
- Standard OpenAI format
- Enables conversation history
- Type-safe message construction

**FunctionCall:**
- Matches OpenAI Responses API tool-calling structure
- Will be enhanced in Phase 4 with path data
- Type-safe navigation commands

**ChatResponse:**
- Single return type for all scenarios
- Clear error handling
- Client knows exactly what to expect

 **Validation:** No TypeScript errors

---

## Step 3.4: Connect Campus Location Vector Store

**Time:** 5 minutes

### Configure the Vector Store Binding

Add this right after the environment variable check in `src/lib/ai.ts`:

```typescript
/**
 * OpenAI vector store containing campus locations
 *
 * Points to the "locations" vector store inside the OpenAI project
 * configured for this app. The ID lives in `.env.local` so it never
 * leaves your local environment or deployment secrets.
 *
 * @example
 * ```typescript
 * // .env.local
 * OPENAI_LOCATIONS_VECTOR_STORE_ID=vs_123456789
 * ```
 */
const LOCATIONS_VECTOR_STORE_ID = process.env.OPENAI_LOCATIONS_VECTOR_STORE_ID

if (!LOCATIONS_VECTOR_STORE_ID) {
  throw new Error(
    'OPENAI_LOCATIONS_VECTOR_STORE_ID is not set. Add it to your .env.local before using getChatResponse().'
  )
}

/**
 * Allowlist of photo IDs that the navigation tool can target
 *
 * The vector store now holds rich descriptions, but we still need a
 * lightweight set of valid targets to keep tool calls safe. Populate
 * this with every `photoId` you ingest into the "locations" vector store.
 * Exporting the data from `/api/nearby-rooms` is the quickest way to stay in sync.
 *
 * @example
 * ```typescript
 * const LOCATION_IDS = [
 *   'a-f1-north-entrance', // A Block main entrance
 *   'a-f1-north-3-side', // A121 - Academic Records
 *   'x-f1-east-4', // Coffee Infusion
 *   'x-f1-mid-6-library', // The Library
 *   // ...add the remainder of your curated locations here
 * ] as const
 *
 * const VALID_LOCATION_IDS = new Set<string>(LOCATION_IDS)
 * ```
 */
const LOCATION_IDS = [
  'a-f1-north-3-side',
  'a-f2-north-stairs-entrance',
  'n-f1-east-south-4',
  'n-f1-west-9',
  'n-f2-east-4',
  'n-f2-mid-3',
  's-f1-mid-3',
  's-f1-north-4',
  's-f1-south-2',
  's-f1-south-entrance',
  's-f2-mid-3',
  's-f2-mid-4',
  's-f2-south-5',
  's-f2-south-6',
  's-f2-south-7',
  's-f4-mid-4',
  's-f4-north-7',
  's-f4-north-8',
  'w-f2-4',
  'w-f2-5',
  'w-f2-6',
  'w-f2-7',
  'w-gym-overlook-1',
  'x-f1-east-4',
  'x-f1-mid-6-aside',
  'x-f1-mid-6-library',
  'x-f1-mid-7',
  'x-f1-mid-8',
  'x-f1-west-10',
  'x-f1-west-11',
  'x-f2-north-9-aside',
  'x-f2-west-2',
  'x-f2-west-3-aside',
  'x-f2-west-4',
  'x-f2-west-5-aside',
  'x-f2-west-6',
  'x-f3-east-6',
  'x-f3-east-8',
  'x-f3-west-1',
  'x-f3-west-1-aside'
] as const

const VALID_LOCATION_IDS = new Set<string>(LOCATION_IDS)

let cachedClient: OpenAI | null = null

/**
 * Lazily initialize OpenAI client for server usage
 *
 * Instantiates the SDK only when the server function runs, preventing build-time
 * environment checks from executing in the browser bundle.
 *
 * @returns Singleton OpenAI client
 */
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set. Add it to your .env.local before using getChatResponse().')
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({
      apiKey
    })
  }

  return cachedClient
}

/**
 * Resolve vector store identifier from environment variables
 *
 * Reads the ID lazily so dev builds do not throw before env files load.
 *
 * @returns Vector store ID used for campus locations
 */
function getVectorStoreId(): string {
  const vectorStoreId = process.env.OPENAI_LOCATIONS_VECTOR_STORE_ID

  if (!vectorStoreId) {
    throw new Error('OPENAI_LOCATIONS_VECTOR_STORE_ID is not set. Add it to your .env.local before using getChatResponse().')
  }

  return vectorStoreId
}
```

Add `OPENAI_LOCATIONS_VECTOR_STORE_ID=vs_xxx` to `.env.local`, using the ID shown for the "locations" store inside your OpenAI project console. Keep the value private—treat it the same way as your API key.

The `/api/nearby-rooms` export includes multiple rooms per photo; collapse them down to the unique `photoId` values (the 40 identifiers above) when updating the allowlist. When you upload the underlying records to the "locations" vector store, include natural language titles and synonyms—e.g., `Books`, `Main Library`, `The Library`—inside each document. That embedded context teaches the model to associate those phrases with the canonical `photoId` (`x-f1-mid-6-library` for the library scene) even though the allowlist itself only contains the photo identifiers.

### Why a Vector Store?

- **Smaller system prompt** – location details live outside the prompt, reducing token usage
- **Better recall** – embeddings capture synonyms and misspellings automatically
- **Single source of truth** – reuse the `/api/nearby-rooms` export when seeding the vector store

> ⚠️ Keep the allowlist synchronized with the vector store. If the AI returns a photo ID that isn't listed here, the tool call will be ignored. Running `/api/nearby-rooms` and copying the `photoId` values keeps everything current.

---

## Step 3.5: Craft System Prompt

**Time:** 3 minutes

### Add Main Server Function

Add this to `src/lib/ai.ts`:

```typescript
/**
 * AI Campus Chat Server Function (BASIC VERSION - Phase 3)
 *
 * Processes chat messages using the OpenAI Responses API with tool calling for navigation.
 * This is the basic version that returns simple photo IDs without pathfinding.
 * Phase 4 will enhance this to include path calculations.
 *
 * Runs entirely on server - API key never exposed to client.
 *
 * Flow:
 * 1. Validate input messages
 * 2. Construct system prompt and attach the locations vector store
 * 3. Call OpenAI Responses API with tool calling enabled
 * 4. Parse response (text + optional tool call)
 * 5. Return structured response to client
 * 6. Short-circuit when the caller supplies an unknown current location
 *
 * @param messages - Conversation history (user and assistant messages)
 * @param currentLocation - User's current photo ID for context
 * @returns AI response with optional navigation tool call
 *
 * @example
 * ```typescript
 * const result = await getChatResponse({
 *   messages: [
 *     { role: 'user', content: 'Where is the library?' },
 *     { role: 'assistant', content: 'The library is southwest...' },
 *     { role: 'user', content: 'Yes please' }
 *   ],
 *   currentLocation: 'a-f1-north-entrance'
 * })
 *
 * // Returns:
 * // {
 * //   message: "I'll take you there now!",
 * //   functionCall: {
 * //     name: 'navigate_to',
 * //     arguments: { photoId: 'library-f1-entrance' }
 * //   }
 * // }
 * ```
 */
const getChatResponseServerFn = createServerFn({ method: 'POST' })
  .inputValidator((payload: GetChatResponseInput) => payload)
  .handler(async ({ data }) => {
    const { messages, currentLocation } = data

    if (!currentLocation) {
      return {
      message: null,
      functionCall: null,
      error: 'Current location is required for navigation context.'
    }
  }


    try {
    // ============================================
    // STEP 1: Input Validation
    // ============================================

    if (!messages || messages.length === 0) {
      return {
        message: null,
        functionCall: null,
        error: 'No messages provided'
      }
    }

    // Protection against excessive conversation length
    // Prevents runaway token usage and keeps context focused
    if (messages.length > 20) {
      return {
        message: null,
        functionCall: null,
        error: 'Conversation too long. Please start a new chat.'
      }
    }

    // Protection against excessive message size
    // Prevents abuse and keeps responses fast
    const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0)
    if (totalChars > 5000) {
      return {
        message: null,
        functionCall: null,
        error: 'Message too long. Please be more concise.'
      }
    }

    // ============================================
    // STEP 2: Call OpenAI with Tool Calling
    // ============================================

    const client = getOpenAIClient()
    const vectorStoreId = getVectorStoreId()

    const response = await client.responses.create({
      model: 'gpt-4o-mini',
      input: [
        {
          role: 'system',
          content: `You are a helpful campus navigation assistant at ARA Institute of Canterbury.

**Current User Location:** ${currentLocation}

**Knowledge Source:**
Use the "locations" vector store (accessed through the file_search tool) to interpret campus destinations, synonyms, and building context. Rely on the retrieved information instead of memorising locations. If you cannot find a match in the store, apologise and explain that the location is not yet available.

**Your Role:**
When users ask about finding a location or getting directions:
1. Provide friendly, helpful text directions explaining how to get there from their current location
2. Ask if they'd like you to automatically navigate them there
3. If they say yes (or any affirmative response like "sure", "okay", "please", "take me there"), call the navigate_to tool

**Conversation Style:**
- Be conversational, helpful, and friendly
- Use clear, simple language
- Don't be overly verbose - keep responses concise
- Respond naturally to greetings and casual conversation
- If users ask about a location that is missing from the vector store, politely explain it is not available yet

**Example Conversations:**

User: "Where is the library?"
You: "The Library is located southwest from the main entrance. From where you are at A Block, head down the main corridor and turn left at the atrium. Would you like me to take you there automatically?"

User: "yes please"
You: [Call navigate_to tool with photoId: "library-f1-entrance"]

User: "hi"
You: "Hello! I'm your campus navigation assistant. I can help you find locations around ARA Institute. What are you looking for?"

User: "I need to find the gym"
You: "The Gymnasium is in W Block. From your current location, you'll need to head through the main corridor and take the connector bridge. It's about a 2-minute walk. Would you like me to navigate you there?"

User: "sure"
You: [Call navigate_to tool with photoId: "w-gym-entry"]

**Important:**
- Only call the navigate_to tool when the user confirms they want navigation
- Use the vector store results to double-check that the destination exists before navigating
- Don't call it just because they ask where something is
- Wait for their confirmation first`
        },
        ...messages.map(message => ({
          role: message.role,
          content: message.content,
          type: 'message'
        }))
      ],
      tools: [
        { type: 'file_search', vector_store_ids: [vectorStoreId] },
        {
          type: 'function',
          name: 'navigate_to',
          description:
            'Automatically navigate the user\'s viewport to a specific campus location. Only call this when the user confirms they want to be navigated there (e.g., "yes", "sure", "take me there").',
          parameters: {
            type: 'object',
            properties: {
              photoId: {
                type: 'string',
                enum: LOCATION_IDS,
                description: 'The photo ID to navigate to'
              }
            },
            required: ['photoId'],
            additionalProperties: false
          },
          strict: true
        }
      ],
      temperature: 0.7, // Balanced creativity vs consistency
      max_output_tokens: 200 // Keep responses concise
    })

    // ============================================
    // STEP 3: Parse OpenAI Response
    // ============================================

    let messageContent: string | null = null
    let functionCall: FunctionCall | null = null
    const messageParts: string[] = []

    for (const item of response.output ?? []) {
      if (item.type === 'message' && Array.isArray(item.content)) {
        for (const part of item.content) {
          if (part.type === 'output_text' && part.text) {
            messageParts.push(part.text)
          }
        }
      }

      if (item.type === 'tool_call' && item.function?.name === 'navigate_to' && !functionCall) {
        const rawArgs = item.function.arguments ?? '{}'

        try {
          const parsed = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs
          const photoId = typeof parsed.photoId === 'string' ? parsed.photoId : undefined

          if (photoId && VALID_LOCATION_IDS.has(photoId)) {
            functionCall = {
              name: item.function.name,
              arguments: { photoId }
            }
          } else {
            console.warn('[AI Server Function] Ignored tool call with unexpected arguments:', parsed)
          }
        } catch (parseError) {
          console.error('[AI Server Function] Failed to parse tool call arguments:', parseError)
        }
      } else if (item.type === 'tool_call' && item.function?.name !== 'navigate_to') {
        console.warn('[AI Server Function] Ignored tool call for unsupported function:', item.function?.name)
      }
    }

    if (messageParts.length > 0) {
      messageContent = messageParts.join('').trim() || null
    } else if (typeof response.output_text === 'string' && response.output_text.trim().length > 0) {
      messageContent = response.output_text.trim()
    }

    // ============================================
    // STEP 4: Return Structured Response
    // ============================================

    return {
      message: messageContent,
      functionCall
    }
    } catch (error: any) {
    // ============================================
    // ERROR HANDLING
    // ============================================

    console.error('[AI Server Function] Error:', error)

    if (error instanceof APIError) {
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
    }

    if (typeof error === 'object' && error && ('code' in error) && (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT')) {
      return {
        message: null,
        functionCall: null,
        error: 'Network error. Please check your internet connection.'
      }
    }

    return {
      message: null,
      functionCall: null,
      error: 'Sorry, I encountered an error. Please try again.'
    }
  }
}
```

> These guards highlight two critical failure modes early: missing API credentials and callers that report a photo ID outside the validated allowlist. Failing fast keeps Phase 4's pathfinding work from inheriting ambiguous errors.

### System Prompt Breakdown

**What makes this prompt effective:**

1. **Clear Role Definition** - "campus navigation assistant"
2. **Vector Store Context** - file_search pulls in the latest campus locations on demand
3. **Behavioral Instructions** - When to provide directions vs navigate
4. **Conversation Examples** - Shows desired interaction pattern
5. **Explicit Constraints** - Only navigate on confirmation

> The `file_search` tool is scoped to `LOCATIONS_VECTOR_STORE_ID`, so the AI pulls fresh location context from the "locations" store without inflating the system prompt.

**The Two-Step Flow:**
```
1. User: "Where is X?"
   AI: Provides directions + offers navigation

2. User: "Yes" (confirmation)
   AI: Calls navigate_to tool
```

This prevents unwanted navigation while keeping it conversational.

 **Validation:** Complete server function implemented

---

## Step 3.6: Test Basic AI Function

**Time:** 5 minutes

### Create Test Script

Create `test-ai-basic.ts` in project root:

```typescript
import { getChatResponse } from './src/lib/ai'

async function testBasicAI() {
  console.log('='.repeat(60))
  console.log('BASIC AI SERVER FUNCTION TEST')
  console.log('='.repeat(60))
  console.log('')

  // Test 1: Simple greeting
  console.log('Test 1: Greeting')
  console.log('-'.repeat(40))
  const test1 = await getChatResponse(
    [{ role: 'user', content: 'Hello!' }],
    'a-f1-north-entrance'
  )
  console.log('User: Hello!')
  console.log(`AI: ${test1.message}`)
  console.log(`Tool call: ${test1.functionCall ? 'YES' : 'NO'}`)
  console.log('Expected: Greeting response, no tool call')
  console.log('')

  // Test 2: Ask about location
  console.log('Test 2: Location Question')
  console.log('-'.repeat(40))
  const test2 = await getChatResponse(
    [{ role: 'user', content: 'Where is the library?' }],
    'a-f1-north-entrance'
  )
  console.log('User: Where is the library?')
  console.log(`AI: ${test2.message}`)
  console.log(`Tool call: ${test2.functionCall ? 'YES' : 'NO'}`)
  console.log('Expected: Directions + offer navigation, no tool call yet')
  console.log('')

  // Test 3: Confirm navigation
  console.log('Test 3: Navigation Confirmation')
  console.log('-'.repeat(40))
  const test3 = await getChatResponse(
    [
      { role: 'user', content: 'Where is the library?' },
      {
        role: 'assistant',
        content: 'The Library is southwest from here. Would you like me to take you there?'
      },
      { role: 'user', content: 'Yes please' }
    ],
    'a-f1-north-entrance'
  )
  console.log('User: Yes please')
  console.log(`AI: ${test3.message}`)
  console.log(`Tool call: ${test3.functionCall ? 'YES' : 'NO'}`)
  if (test3.functionCall) {
    console.log(`  Function: ${test3.functionCall.name}`)
    console.log(`  Photo ID: ${test3.functionCall.arguments.photoId}`)
  }
  console.log('Expected: Tool call to navigate_to with photoId')
  console.log('')

  // Test 4: Direct navigation request
  console.log('Test 4: Direct Navigation Request')
  console.log('-'.repeat(40))
  const test4 = await getChatResponse(
    [{ role: 'user', content: 'Take me to the gym' }],
    'a-f1-north-entrance'
  )
  console.log('User: Take me to the gym')
  console.log(`AI: ${test4.message}`)
  console.log(`Tool call: ${test4.functionCall ? 'YES' : 'NO'}`)
  if (test4.functionCall) {
    console.log(`  Photo ID: ${test4.functionCall.arguments.photoId}`)
  }
  console.log('Expected: May navigate directly or ask for confirmation')
  console.log('')

  // Test 5: Error handling (too many messages)
  console.log('Test 5: Error Handling (Message Limit)')
  console.log('-'.repeat(40))
  const tooManyMessages = Array(25)
    .fill(null)
    .map(() => ({ role: 'user' as const, content: 'Test message' }))
  const test5 = await getChatResponse(tooManyMessages, 'a-f1-north-entrance')
  console.log('Sent 25 messages (limit is 20)')
  console.log(`Error: ${test5.error}`)
  console.log('Expected: "Conversation too long" error')
  console.log('')

  // Test 6: Unknown location
  console.log('Test 6: Unknown Location')
  console.log('-'.repeat(40))
  const test6 = await getChatResponse(
    [{ role: 'user', content: 'Where is the moon?' }],
    'a-f1-north-entrance'
  )
  console.log('User: Where is the moon?')
  console.log(`AI: ${test6.message}`)
  console.log(`Tool call: ${test6.functionCall ? 'YES' : 'NO'}`)
  console.log('Expected: Polite message that location not available')
  console.log('')

  console.log('='.repeat(60))
  console.log('BASIC AI TESTS COMPLETE')
  console.log('='.repeat(60))
}

testBasicAI().catch(console.error)
```

**Token usage note:** This manual script issues a handful of short prompts (~200 tokens total). In CI or other automated environments, swap the OpenAI client for a stub so you do not burn tokens or require network access.

### Run Tests

```bash
npx tsx test-ai-basic.ts
```

**Expected Output:**
```
============================================================
BASIC AI SERVER FUNCTION TEST
============================================================

Test 1: Greeting
----------------------------------------
User: Hello!
AI: Hello! I'm your campus navigation assistant. I can help you find locations around ARA Institute. What are you looking for?
Tool call: NO
Expected: Greeting response, no tool call

Test 2: Location Question
----------------------------------------
User: Where is the library?
AI: The Library is southwest from the main entrance. From A Block, head down the main corridor and turn left at the atrium. Would you like me to take you there automatically?
Tool call: NO
Expected: Directions + offer navigation, no tool call yet

Test 3: Navigation Confirmation
----------------------------------------
User: Yes please
AI: Great! I'll navigate you to the library now.
Tool call: YES
  Function: navigate_to
  Photo ID: library-f1-entrance
Expected: Tool call to navigate_to with photoId

Test 4: Direct Navigation Request
----------------------------------------
User: Take me to the gym
AI: I'll take you to the Gymnasium right away!
Tool call: YES
  Photo ID: w-gym-entry
Expected: May navigate directly or ask for confirmation

Test 5: Error Handling (Message Limit)
----------------------------------------
Sent 25 messages (limit is 20)
Error: Conversation too long. Please start a new chat.
Expected: "Conversation too long" error

Test 6: Unknown Location
----------------------------------------
User: Where is the moon?
AI: I'm sorry, but I can only help you navigate to locations on campus. The locations I know about are A Block, the Library, the Gymnasium, Student Lounge, and faculty offices.
Tool call: NO
Expected: Polite message that location not available

============================================================
BASIC AI TESTS COMPLETE
============================================================
```

### Clean Up

```bash
rm test-ai-basic.ts
```

 **Validation:** Basic AI responding correctly with tool calling

---

## Phase 3 Complete! <->

### Checklist Review

- [x] 3.1 - Server function concept understood
- [x] 3.2 - `src/lib/ai.ts` file created
- [x] 3.3 - TypeScript interfaces defined
- [x] 3.4 - Locations vector store connected
- [x] 3.5 - System prompt crafted
- [x] 3.6 - Basic AI tested successfully

### What You Accomplished

 **Working OpenAI server function**
 **Type-safe interfaces for messages and responses**
 **Locations vector store wired into the AI flow**
 **Tool calling configured for navigation**
 **Comprehensive error handling**
 **Two-step navigation flow (directions -> confirmation -> navigate)**
 **Input validation and rate limiting**

### Files Created

```
src/
 lib/
    ai.ts (NEW - 400 lines)
```

### Key Takeaways

**Server Functions Are Powerful:**
- API key stays secure on server
- Type-safe client calls
- No manual API routing needed
- Built into TanStack Start

**Tool-Calling Pattern:**
```
1. User asks question
2. AI provides info
3. AI asks for confirmation
4. User confirms
5. AI calls tool
6. Client executes navigation
```

**Cost Protection:**
- Message count limit (20 messages)
- Character count limit (5000 chars)
- Reasonable max_output_tokens (200)
- OpenAI has built-in rate limits

---

## Troubleshooting

### AI Not Triggering Tool Call

**Cause:** System prompt unclear or user didn't confirm

**Solution:**
1. Check user said affirmative ("yes", "sure", "okay")
2. Review system prompt examples
3. Temperature might be too high (try 0.5-0.7)

### "Invalid API Key" Error

**Cause:** API key not loaded or incorrect

**Solution:**
```bash
# Check .env.local exists
cat .env.local

# Restart dev server to load env vars
npm run dev
```

### Tool Called with Wrong photoId

**Cause:** Photo ID missing from the VALID_LOCATION_IDS allowlist

**Solution:**
1. Confirm the destination exists in the "locations" vector store
2. Add the photoId to VALID_LOCATION_IDS so the tool schema stays in sync
3. Restart the dev server to reload environment variables

### Responses Too Verbose

**Cause:** Temperature too high or max_output_tokens too large

**Solution:**
```typescript
temperature: 0.5,  // Lower = more focused
max_output_tokens: 150 // Reduce for shorter responses
```

---

## Next Steps

**Proceed to Phase 4:** [Phase 4 - AI + Pathfinding Integration](./phase-4-ai-pathfinding.md)

You'll implement:
- Pathfinding integration into server function
- Enhanced FunctionCall interface with path data
- Path calculation in getChatResponse()
- "No path found" error handling

**Estimated time:** 30 minutes

---

**Your AI is responding! Now let's add pathfinding in Phase 4. ->**
