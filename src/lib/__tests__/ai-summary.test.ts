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

describe('executeChatWithSummaries', () => {
  let executeChatSpy: ReturnType<typeof vi.spyOn>

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
    const payload = executeChatSpy.mock.calls[0][0]
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

    const payload = executeChatSpy.mock.calls[0][0]
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
})
