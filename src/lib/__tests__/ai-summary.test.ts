import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest'

const createResponseMock: Mock = vi.fn()

vi.mock('openai', () => {
  class MockOpenAI {
    responses = {
      create: createResponseMock
    }
    constructor() {}
  }

  class APIError extends Error {
    status?: number
  }

  return {
    default: MockOpenAI,
    APIError
  }
})

import * as aiModule from '../ai'

describe('executeChat pathfinding integration', () => {
  beforeEach(() => {
    createResponseMock.mockReset()
    process.env.OPENAI_API_KEY = 'test-key'
    process.env.OPENAI_LOCATIONS_VECTOR_STORE_ID = 'test-vector-store'
  })

  it('attaches pathfinding metadata to navigation tool calls', async () => {
    createResponseMock.mockResolvedValueOnce({
      id: 'resp_test_path',
      object: 'response',
      created_at: Date.now(),
      output_text: 'Absolutely, I can guide you there.',
      error: null,
      incomplete_details: null,
      instructions: null,
      metadata: null,
      model: 'gpt-4o-mini',
      output: [
        {
          type: 'message',
          role: 'assistant',
          content: [
            {
              type: 'output_text',
              text: 'Absolutely, I can guide you there.'
            }
          ]
        },
        {
          type: 'function_call',
          name: 'navigate_to',
          arguments: JSON.stringify({ photoId: 'library-f1-entrance' })
        }
      ],
      parallel_tool_calls: false,
      temperature: 0.2,
      tool_choice: { type: 'auto' },
      tools: []
    } as unknown)

    const response = await aiModule.executeChat({
      messages: [{ role: 'user', content: 'Take me to the library' }],
      currentLocation: 'a-f1-north-entrance'
    })

    expect(response.functionCall).not.toBeNull()
    expect(response.functionCall?.arguments.photoId).toBe('library-f1-entrance')
    expect(response.functionCall?.arguments.path).toBeDefined()
    expect(response.functionCall?.arguments.path?.[0]).toBe('a-f1-north-entrance')
    const resolvedPath = response.functionCall?.arguments.path ?? []
    expect(resolvedPath[resolvedPath.length - 1]).toBe('library-f1-entrance')
    expect(response.functionCall?.arguments.distance).toBeGreaterThanOrEqual(1)
    expect(response.functionCall?.arguments.routeDescription).toMatch(/Route found:/)
  })

  it('surfaces an error when no route can be computed', async () => {
    createResponseMock.mockResolvedValueOnce({
      id: 'resp_test_error',
      object: 'response',
      created_at: Date.now(),
      output_text: 'Attempting to navigate.',
      error: null,
      incomplete_details: null,
      instructions: null,
      metadata: null,
      model: 'gpt-4o-mini',
      output: [
        {
          type: 'message',
          role: 'assistant',
          content: [
            {
              type: 'output_text',
              text: 'Attempting to navigate.'
            }
          ]
        },
        {
          type: 'function_call',
          name: 'navigate_to',
          arguments: JSON.stringify({ photoId: 'library-f1-entrance' })
        }
      ],
      parallel_tool_calls: false,
      temperature: 0.2,
      tool_choice: { type: 'auto' },
      tools: []
    } as unknown)

    const response = await aiModule.executeChat({
      messages: [{ role: 'user', content: 'Navigate to the library' }],
      currentLocation: 'invalid-photo-id'
    })

    expect(response.functionCall).not.toBeNull()
    expect(response.functionCall?.arguments.photoId).toBe('library-f1-entrance')
    expect(response.functionCall?.arguments.error).toMatch(/Unable to calculate a route/i)
    expect(response.functionCall?.arguments.path).toBeUndefined()
    expect(response.functionCall?.arguments.distance).toBeUndefined()
  })
})

describe('executeChatWithSummaries', () => {
  let executeChatSpy: ReturnType<typeof vi.spyOn<any, any>>

  beforeEach(() => {
    createResponseMock.mockReset()
    executeChatSpy = vi
      .spyOn(aiModule, 'executeChat')
      .mockResolvedValue({ message: 'Acknowledged.', functionCall: null })

    process.env.OPENAI_API_KEY = 'test-key'
    process.env.OPENAI_LOCATIONS_VECTOR_STORE_ID = 'test-vector-store'
  })

  afterEach(() => {
    executeChatSpy.mockRestore()
  })

  it('returns assistant reply without generating a summary when under threshold', async () => {
    const result = await aiModule.executeChatWithSummaries({
      state: { summary: null, messages: [] },
      nextMessage: { role: 'user', content: 'Hello AI helper' },
      currentLocation: 'a-f1-north-entrance'
    })

    expect(executeChatSpy).toHaveBeenCalledTimes(1)
    const payload = executeChatSpy.mock.calls[0]?.[0] as Parameters<typeof aiModule.executeChat>[0]
    expect(payload.messages).toEqual([{ role: 'user', content: 'Hello AI helper' }])
    expect(result.state.summary).toBeNull()
    expect(result.state.messages).toHaveLength(2)
    expect(result.state.messages[0]).toEqual({ role: 'user', content: 'Hello AI helper' })
    expect(result.state.messages[1]).toEqual({ role: 'assistant', content: 'Acknowledged.' })
  })

  it('compacts history and prepends the summary once the threshold is reached', async () => {
    createResponseMock.mockResolvedValueOnce({
      output_text: 'Goals: Reach the library\nConfirmed: None\nFollowUps: Ask about study spaces'
    })

    executeChatSpy.mockResolvedValueOnce({
      message: 'Here is how to reach the library from your location.',
      functionCall: null
    })

    const longHistory = Array.from({ length: 15 }, (_, index) => {
      const role = index % 2 === 0 ? 'user' : 'assistant'
      const content = role === 'user' ? `User message ${index}` : `Assistant message ${index}`
      return { role, content } as const
    })

    const result = await aiModule.executeChatWithSummaries({
      state: { summary: null, messages: longHistory },
      nextMessage: { role: 'user', content: 'Can you guide me to the library?' },
      currentLocation: 'a-f1-north-entrance'
    })

    expect(createResponseMock).toHaveBeenCalledTimes(1)
    expect(executeChatSpy).toHaveBeenCalledTimes(1)

    const payload = executeChatSpy.mock.calls[0]?.[0] as Parameters<typeof aiModule.executeChat>[0]
    expect(payload.messages[0].role).toBe('system')
    expect(payload.messages[0].content).toContain('Conversation summary: Goals: Reach the library')
    expect(payload.messages.slice(1)).toHaveLength(6)

    expect(result.state.summary).toContain('Goals: Reach the library')
    expect(result.state.messages[0]).toEqual({ role: 'user', content: 'User message 10' })
    expect(result.state.messages[result.state.messages.length - 1]).toEqual({
      role: 'assistant',
      content: 'Here is how to reach the library from your location.'
    })
    expect(result.state.messages).toHaveLength(7)
  })

  it('strips markdown bold markers from assistant messages stored in state', async () => {
    executeChatSpy.mockResolvedValueOnce({
      message: 'The cafe offers **coffee**, **snacks**, and comfortable seating.',
      functionCall: null
    })

    const result = await aiModule.executeChatWithSummaries({
      state: { summary: null, messages: [] },
      nextMessage: { role: 'user', content: 'Tell me about the cafe' },
      currentLocation: 'a-f1-north-entrance'
    })

    const latestMessage = result.state.messages[result.state.messages.length - 1]
    expect(latestMessage).toEqual({
      role: 'assistant',
      content: 'The cafe offers coffee, snacks, and comfortable seating.'
    })
    expect(result.response.message).toBe('The cafe offers coffee, snacks, and comfortable seating.')
  })
})
