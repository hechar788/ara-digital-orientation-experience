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

const MAX_MESSAGE_COUNT = 20
const MAX_TOTAL_CHARACTERS = 5000

const NAVIGATION_TOOL = {
  type: 'function' as const,
  name: 'navigate_to',
  description:
    'Automatically move the campus viewer to a specific location after the user confirms. Confirmations include phrases like "yes", "sure", or "please take me there".',
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
  '- Do not call navigate_to if the user merely asks for information without confirming'
].join('\n')

const EXAMPLE_CONVERSATIONS = [
  'User: "Where is the library?"',
  'You: "The Library is southwest from the main entrance. From A Block, follow the corridor and turn left at the atrium. Would you like me to take you there automatically?"',
  '',
  'User: "yes please"',
  'You: [Call navigate_to function with photoId: "x-f1-mid-6-library"]',
  '',
  'User: "hi"',
  'You: "Hello! I can help you find locations around Ara Institute. What would you like to find?"',
  '',
  'User: "I need the Student Finance office."',
  'You: "Student Finance is inside X Block near Careers & Employment. From your current location, head toward the western wing. Would you like me to take you there?"'
].join('\n')

function buildSystemPrompt(currentLocation: string): string {
  return [
    'You are a helpful campus navigation assistant at Ara Institute of Canterbury.',
    '',
    `Current user location: ${currentLocation}`,
    '',
    'Knowledge source:',
    'Use the "locations" vector store via the file_search tool to interpret destinations, synonyms, and building context. If you cannot find a match, apologise and explain that the location is not yet available.',
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
  ].join('\n')
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
      temperature: 0.7,
      max_output_tokens: 200
    } satisfies ResponseCreateParamsNonStreaming)) as GeneratedResponse

    const message =
      response.output_text?.trim() ??
      parseResponseText(response.output) ??
      null
    const functionCall = parseFunctionCall(response.output)

    console.info('[AI] OpenAI response summary', {
      hasMessage: !!message,
      hasFunctionCall: !!functionCall
    })

    return {
      message,
      functionCall
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
