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
Calls executeChat(...)
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

### Confirm the core types

Open `src/lib/ai.ts` and verify these interfaces appear exactly as follows:

```typescript
/**
 * Describes a chat message exchanged with the AI assistant
 *
 * Used to pass prior conversation history back to the Responses API so the model
 * can reply with awareness of previous turns.
 *
 * @property role - Sender role for the message (`user`, `assistant`, or `system`)
 * @property content - Message body text provided to the model
 *
 * @example
 * ```typescript
 * const message: ChatMessage = { role: 'user', content: 'Where is the cafe?' }
 * ```
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/**
 * Represents a navigation tool call returned by the AI assistant
 *
 * When the AI confirms that a user wants to travel to a destination, the
 * navigate_to function is invoked with the chosen campus photo identifier.
 *
 * @property name - Function identifier returned by the model (always `navigate_to`)
 * @property arguments - Named parameters supplied with the tool call
 * @property arguments.photoId - Campus photo identifier that the client should load
 *
 * @example
 * ```typescript
 * const call: FunctionCall = {
 *   name: 'navigate_to',
 *   arguments: { photoId: 'x-f1-mid-6-library' }
 * }
 * ```
 */
export interface FunctionCall {
  name: 'navigate_to'
  arguments: {
    photoId: string
  }
}

/**
 * Structured response returned from getChatResponse
 *
 * Used by the UI to differentiate between plain text replies, navigation tool
 * invocations, and recoverable errors.
 *
 * @property message - Assistant text reply or `null` when an error occurs
 * @property functionCall - Navigation command selected by the AI assistant
 * @property error - Present when the request fails for any reason
 *
 * @example
 * ```typescript
 * const response: ChatResponse = {
 *   message: 'Head through the atrium, then turn left toward the library entrance.',
 *   functionCall: null
 * }
 * ```
 */
export interface ChatResponse {
  message: string | null
  functionCall: FunctionCall | null
  error?: string
}
```

**Validation:** No TypeScript errors. These definitions match the compiled output and are consumed by the client UI without transformation.


---

## Step 3.4: Connect Campus Location Vector Store

**Time:** 5 minutes

### Configure the vector store binding and allowlist

Keep the top of `src/lib/ai.ts` aligned with the production implementation:

```typescript
'use server'

import OpenAI, { APIError } from 'openai'
import type { ResponseCreateParamsNonStreaming } from 'openai/resources/responses/responses'

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
  'inside-student-lounge',
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

const VALID_LOCATION_ID_SET = new Set<string>(LOCATION_IDS)

const LOCATION_KEYWORD_OVERRIDES = [
  {
    photoId: 'x-f1-east-4',
    keywords: ['coffee infusion', 'caf', 'cafe', 'café', 'coffee shop', 'coffee bar', 'coffee barista']
  },
  {
    photoId: 'inside-student-lounge',
    keywords: ['student lounge', 'student hub', 'student social space', 'student commons', 'student hangout']
  }
] as const satisfies Array<{
  photoId: (typeof LOCATION_IDS)[number]
  keywords: string[]
}>
let cachedClient: OpenAI | null = null
type GeneratedResponse = Awaited<ReturnType<OpenAI['responses']['create']>>

function getOpenAIClient(): OpenAI {
  if (!cachedClient) {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set. Add it to your environment before using getChatResponse().')
    }

    cachedClient = new OpenAI({
      apiKey
    })
  }

  return cachedClient
}

function getVectorStoreId(): string {
  const vectorStoreId = process.env.OPENAI_LOCATIONS_VECTOR_STORE_ID

  if (!vectorStoreId) {
    throw new Error('OPENAI_LOCATIONS_VECTOR_STORE_ID is not set. Add it to your environment before using getChatResponse().')
  }

  return vectorStoreId
}
```

Replace the `LOCATION_IDS` placeholder with the full allowlist shown in the source file. The keyword overrides let the assistant correct misclassified destinations (for example mapping "coffee infusion" directly to the café photo). Both helpers lazily read environment variables so the build does not crash before `.env.local` loads.

> ⚠️ Keep `LOCATION_IDS` synchronized with the vector store ingestion. If the AI returns an ID that the set does not contain, the tool call is discarded.

### Why a vector store?

- **Smaller system prompt** – location details live outside the prompt, reducing token usage
- **Better recall** – embeddings capture synonyms and misspellings automatically
- **Single source of truth** – reuse the `/api/nearby-rooms` export when seeding the vector store

---

## Step 3.5: Craft System Prompt and Server Function

**Time:** 7 minutes

### Review the production implementation

The working server helper is composed of several focused functions. Copy the following block from `src/lib/ai.ts` so that the prompt, validation, and response parsing stay in sync with the shipped code:

```typescript
const MAX_MESSAGE_COUNT = 20
const MAX_TOTAL_CHARACTERS = 5000

const NAVIGATION_TOOL = {
  type: 'function' as const,
  name: 'navigate_to',
  description:
    'Automatically move the campus viewer to a specific location after the user confirms. Confirmations include phrases like "yes", "sure", or "please take me there". Use the photoId from the vector store record that matches the user request.',
  parameters: {
    type: 'object',
    properties: {
      photoId: {
        type: 'string',
        enum: LOCATION_IDS,
        description: 'Destination campus photo identifier'
      }
    },
    required: ['photoId'],
    additionalProperties: false
  },
  strict: true
}

const AFFIRMATION_REMINDER = [
  '- Only call the navigate_to tool when the user confirms they want navigation',
  '- Use the vector store results to double-check that the destination exists before navigating',
  '- Do not call navigate_to if the user merely asks for information without confirming',
  '- When a user explicitly provides a photoId (for example, photoId: "x-f1-east-4"), call navigate_to with that exact identifier as long as it appears in the allowlist',
  '- When you identify the correct record in the vector store, use that document’s id as the navigate_to photoId. Do not substitute a different allowlisted id',
  '- Example: For Coffee Infusion, call navigate_to with photoId: "x-f1-east-4" once the user confirms'
].join('
')

const EXAMPLE_CONVERSATIONS = [
  'User: "Where is the library?"',
  'You: "The Library is southwest from the main entrance. From A Block, follow the corridor and turn left at the atrium. Would you like me to take you there automatically?"',
  '',
  'User: "yes please"',
  'You: [Call navigate_to function with photoId: "x-f1-mid-6-library"]',
  '',
  'User: "I can't find the cafe."',
  'You: "The café, Coffee Infusion, is inside X Block on the first floor. Would you like me to take you there automatically?"',
  '',
  'User: "yes please"',
  'You: [Call navigate_to function with photoId: "x-f1-east-4"]',
  '',
  'User: "hi"',
  'You: "Hello! I can help you find locations around Ara Institute. What would you like to find?"',
  '',
  'User: "I need the Student Finance office."',
  'You: "Student Finance is inside X Block near Careers & Employment. From your current location, head toward the western wing. Would you like me to take you there?"'
].join('
')

function buildSystemPrompt(currentLocation: string): string {
  return [
    'You are a helpful campus navigation assistant at Ara Institute of Canterbury.',
    '',
    `Current user location: ${currentLocation}`,
    '',
    'Knowledge source:',
    'Use the "locations" vector store via the file_search tool to interpret destinations, synonyms, and building context. If you cannot find a match, apologise and explain that the location is not yet available.',
    '- When you cite a vector store result, use that document’s `id` as the photoId if the user confirms navigation.',
    '',
    'Your role:',
    '1. Provide concise, friendly directions from the current location.',
    '2. Ask whether the user would like automatic navigation.',
    '3. Only when the user confirms with an affirmative phrase, call the navigate_to tool.',
    '',
    'Conversation style:',
    '- Be approachable and clear.',
    '- Keep responses focused and free of filler.',
    '- Handle greetings naturally.',
    '- Apologise when a destination is unavailable.',
    '',
    'Example conversations:',
    EXAMPLE_CONVERSATIONS,
    '',
    'Important reminders:',
    AFFIRMATION_REMINDER
  ].join('
')
}

function parseResponseText(output: GeneratedResponse['output']): string | null {
  const parts: string[] = []
  for (const item of output ?? []) {
    if (item.type === 'message' && Array.isArray(item.content)) {
      for (const contentPart of item.content) {
        if (contentPart.type === 'output_text' && contentPart.text) {
          parts.push(contentPart.text)
        }
      }
    }
  }
  const combined = parts.join('').trim()
  return combined.length > 0 ? combined : null
}

function parseFunctionCall(output: GeneratedResponse['output']): FunctionCall | null {
  for (const item of output ?? []) {
    if (item.type === 'function_call' && item.name === 'navigate_to') {
      try {
        const parsedArguments = JSON.parse(item.arguments ?? '{}')
        const photoId = typeof parsedArguments.photoId === 'string' ? parsedArguments.photoId : undefined
        if (photoId && VALID_LOCATION_ID_SET.has(photoId)) {
          return {
            name: 'navigate_to',
            arguments: { photoId }
          }
        }
      } catch (error) {
        console.error('[AI] Failed to parse function call arguments', error)
      }
    }
  }
  return null
}

function normaliseMessageInput(messages: ChatMessage[]) {
  return messages.map(message => ({
    role: message.role,
    content: message.content,
    type: 'message' as const
  }))
}

function findOverrideFromText(text: string | null): string | null {
  if (!text) {
    return null
  }
  const normalised = text.toLowerCase()
  for (const mapping of LOCATION_KEYWORD_OVERRIDES) {
    if (mapping.keywords.some(keyword => normalised.includes(keyword))) {
      return mapping.photoId
    }
  }
  return null
}

function findLatestUserMessage(messages: ChatMessage[]): string | null {
  for (let index = messages.length - 1; index >= 0; index--) {
    const message = messages[index]
    if (message.role === 'user') {
      return message.content
    }
  }
  return null
}

function applyKeywordOverrides(
  originalCall: FunctionCall | null,
  assistantMessage: string | null,
  messages: ChatMessage[]
): FunctionCall | null {
  if (!originalCall) {
    return null
  }
  const sources: Array<string | null> = [assistantMessage, findLatestUserMessage(messages)]
  for (const source of sources) {
    const overridePhotoId = findOverrideFromText(source)
    if (overridePhotoId && overridePhotoId !== originalCall.arguments.photoId && VALID_LOCATION_ID_SET.has(overridePhotoId)) {
      return {
        name: 'navigate_to',
        arguments: {
          photoId: overridePhotoId
        }
      }
    }
  }
  return originalCall
}

function validateMessages(messages: ChatMessage[]): string | null {
  if (!messages || messages.length === 0) {
    return 'No messages provided.'
  }
  if (messages.length > MAX_MESSAGE_COUNT) {
    return 'Conversation too long. Please start a new chat.'
  }
  const totalCharacters = messages.reduce((total, message) => total + message.content.length, 0)
  if (totalCharacters > MAX_TOTAL_CHARACTERS) {
    return 'Message too long. Please be more concise.'
  }
  return null
}

function handleKnownApiErrors(error: unknown): ChatResponse | null {
  if (error instanceof APIError) {
    if (error.status === 429) {
      return {
        message: null,
        functionCall: null,
        error: 'The AI is responding to many requests right now. Please try again shortly.'
      }
    }
    if (error.status === 401) {
      return {
        message: null,
        functionCall: null,
        error: 'AI service configuration error. Check your API credentials.'
      }
    }
    if (typeof error.status === 'number' && error.status >= 500) {
      return {
        message: null,
        functionCall: null,
        error: 'The AI service is temporarily unavailable. Please try again.'
      }
    }
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code &&
    ['ECONNREFUSED', 'ETIMEDOUT'].includes((error as { code: string }).code)
  ) {
    return {
      message: null,
      functionCall: null,
      error: 'Network error while contacting the AI service. Please check your connection.'
    }
  }
  return null
}

type GetChatResponseInput = {
  messages: ChatMessage[]
  currentLocation: string
}

export async function executeChat({ messages, currentLocation }: GetChatResponseInput): Promise<ChatResponse> {
  console.info('[AI] getChatResponse invoked', {
    messageCount: messages?.length ?? 0,
    currentLocation
  })

  if (!currentLocation) {
    return {
      message: null,
      functionCall: null,
      error: 'Current location is required for navigation.'
    }
  }

  const validationError = validateMessages(messages)
  if (validationError) {
    return {
      message: null,
      functionCall: null,
      error: validationError
    }
  }

  try {
    const client = getOpenAIClient()
    const vectorStoreId = getVectorStoreId()

    console.info('[AI] Preparing OpenAI request', {
      vectorStoreId,
      messageCount: messages.length
    })

    const response = (await client.responses.create({
      model: 'gpt-4o-mini',
      input: [
        {
          role: 'system',
          content: buildSystemPrompt(currentLocation),
          type: 'message'
        },
        ...normaliseMessageInput(messages)
      ],
      tools: [
        {
          type: 'file_search',
          vector_store_ids: [vectorStoreId]
        },
        NAVIGATION_TOOL
      ],
      temperature: 0.2,
      max_output_tokens: 200
    } satisfies ResponseCreateParamsNonStreaming)) as GeneratedResponse

    const message =
      response.output_text?.trim() ??
      parseResponseText(response.output) ??
      null
    const functionCall = parseFunctionCall(response.output)

    const adjustedFunctionCall = applyKeywordOverrides(functionCall, message, messages)

    console.info('[AI] OpenAI response summary', {
      hasMessage: !!message,
      hasFunctionCall: !!adjustedFunctionCall
    })

    return {
      message,
      functionCall: adjustedFunctionCall
    }
  } catch (error) {
    console.error('[AI] Response generation failed', error)
    const handled = handleKnownApiErrors(error)
    if (handled) {
      return handled
    }
    return {
      message: null,
      functionCall: null,
      error: 'Sorry, something went wrong while contacting the AI service.'
    }
  }
}
```

**Key callouts:**

- `MAX_MESSAGE_COUNT` and `MAX_TOTAL_CHARACTERS` guard against runaway token costs. Right now the function fails fast with user-facing errors when either limit is exceeded.
- `normaliseMessageInput` adapts our local `ChatMessage` objects to the Responses API format.
- `applyKeywordOverrides` provides deterministic fallbacks for high-value landmarks like the café.
- `handleKnownApiErrors` centralises friendly error strings so the UI can display actionable feedback.
- `executeChat` is the only exported function — the UI calls it with `{ messages, currentLocation }`.

Once this block matches the repository, the backend and documentation stay aligned for future phases.

---


---

## Step 3.6: Test Basic AI Function

**Time:** 5 minutes

### Create Test Script

Create `test-ai-basic.ts` in project root:

```typescript
import { executeChat } from './src/lib/ai'

async function testBasicAI() {
  console.log('='.repeat(60))
  console.log('BASIC AI SERVER FUNCTION TEST')
  console.log('='.repeat(60))
  console.log('')

  // Test 1: Simple greeting
  console.log('Test 1: Greeting')
  console.log('-'.repeat(40))
  const test1 = await executeChat({
    messages: [{ role: 'user', content: 'Hello!' }],
    currentLocation: 'a-f1-north-entrance'
  })
  console.log('User: Hello!')
  console.log(`AI: ${test1.message}`)
  console.log(`Tool call: ${test1.functionCall ? 'YES' : 'NO'}`)
  console.log('Expected: Greeting response, no tool call')
  console.log('')

  // Test 2: Ask about location
  console.log('Test 2: Location Question')
  console.log('-'.repeat(40))
  const test2 = await executeChat({
    messages: [{ role: 'user', content: 'Where is the library?' }],
    currentLocation: 'a-f1-north-entrance'
  })
  console.log('User: Where is the library?')
  console.log(`AI: ${test2.message}`)
  console.log(`Tool call: ${test2.functionCall ? 'YES' : 'NO'}`)
  console.log('Expected: Directions + offer navigation, no tool call yet')
  console.log('')

  // Test 3: Confirm navigation
  console.log('Test 3: Navigation Confirmation')
  console.log('-'.repeat(40))
  const test3 = await executeChat({
    messages: [
      { role: 'user', content: 'Where is the library?' },
      {
        role: 'assistant',
        content: 'The Library is southwest from here. Would you like me to take you there?'
      },
      { role: 'user', content: 'Yes please' }
    ],
    currentLocation: 'a-f1-north-entrance'
  })
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
  const test4 = await executeChat({
    messages: [{ role: 'user', content: 'Take me to the gym' }],
    currentLocation: 'a-f1-north-entrance'
  })
  console.log('User: Take me to the gym')
  console.log(`AI: ${test4.message}`)
  console.log(`Tool call: ${test4.functionCall ? 'YES' : 'NO'}`)
  if (test4.functionCall) {
    console.log(`  Photo ID: ${test4.functionCall.arguments.photoId}`)
  }
  console.log('Expected: May navigate directly or ask for confirmation depending on context')
  console.log('')

  // Test 5: Error handling (too many messages)
  console.log('Test 5: Error Handling (Message Limit)')
  console.log('-'.repeat(40))
  const tooManyMessages = Array(25)
    .fill(null)
    .map(() => ({ role: 'user' as const, content: 'Test message' }))
  const test5 = await executeChat({
    messages: tooManyMessages,
    currentLocation: 'a-f1-north-entrance'
  })
  console.log('Sent 25 messages (limit is 20)')
  console.log(`Error: ${test5.error}`)
  console.log('Expected: "Conversation too long" error')
  console.log('')

  // Test 6: Unknown location
  console.log('Test 6: Unknown Location')
  console.log('-'.repeat(40))
  const test6 = await executeChat({
    messages: [{ role: 'user', content: 'Where is the moon?' }],
    currentLocation: 'a-f1-north-entrance'
  })
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

**Token usage note:** The manual script issues a handful of short prompts (~200 tokens total). In CI or other automated environments, swap the OpenAI client for a stub so you do not burn tokens or require network access.

### Run Tests

```bash
npm install --save-dev ts-node
npx ts-node test-ai-basic.ts
```

You should see structured output showing each test result and any errors. Confirm the error handling message for too many messages to ensure it matches `Conversation too long. Please start a new chat.` — that confirms the guard and documentation stay in sync.

---

## Step 3.7: Plan Conversation Summaries

**Time:** 10 minutes

### Motivation

- The current guard stops chats at 20 turns to protect token budgets and stay within the model context window.
- Real users expect longer sessions, especially when exploring multiple destinations.
- Summarising earlier turns lets us preserve intent without resending the entire transcript.

### Proposed architecture

1. **Extend state tracking:** Introduce a `ConversationState` structure that stores the running `summary` (string) alongside the recent `messages`.
2. **Add a summariser helper:** Create `summariseConversation({ priorSummary, messages })` that calls a lightweight model (still `gpt-4o-mini`) with a prompt that extracts goals, confirmed destinations, and unresolved follow-ups.
3. **Fold summaries automatically:** When `messages.length` approaches `MAX_MESSAGE_COUNT`, aggregate the oldest turns into the summary, trim them from the live history, and keep only the last 4–6 granular exchanges.
4. **Seed the next request:** Prepend the summary as a synthetic `system` message (for example, `"Conversation summary: …"`) before calling `executeChat`.
5. **Persist on the client:** Store the returned summary so the UI can reuse it on the next turn without rerequesting OpenAI just to remember state.

### Implementation sketch

```typescript
type ConversationState = {
  summary: string | null
  messages: ChatMessage[]
}

export async function executeChatWithSummaries(
  state: ConversationState,
  nextMessage: ChatMessage,
  currentLocation: string
): Promise<{ response: ChatResponse; state: ConversationState }> {
  const combined = [...state.messages, nextMessage]

  if (combined.length > MAX_MESSAGE_COUNT) {
    const summary = await summariseConversation({
      priorSummary: state.summary,
      messages: combined.slice(0, -5)
    })

    return {
      response: await executeChat({
        messages: [
          ...(summary ? [{ role: 'system', content: `Conversation summary: ${summary}` }] : []),
          ...combined.slice(-5)
        ],
        currentLocation
      }),
      state: {
        summary,
        messages: combined.slice(-5)
      }
    }
  }

  return {
    response: await executeChat({ messages: combined, currentLocation }),
    state: { summary: state.summary, messages: combined }
  }
}
```

### Next steps

- Finalise the summarisation prompt so it captures confirmed destinations, pending requests, and tone.
- Decide on a refresh cadence (for example, summarise every 6th turn) so we never hit the hard error.
- Update the UI flow to surface a seamless experience—users should never be told the conversation is “too long” once summarisation is enabled.

Documenting the plan here keeps Phase 3 accurate today while setting clear direction for the upcoming enhancement.

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
- Path calculation in executeChat()
- "No path found" error handling

**Estimated time:** 30 minutes

---

**Your AI is responding! Now let's add pathfinding in Phase 4. ->**
