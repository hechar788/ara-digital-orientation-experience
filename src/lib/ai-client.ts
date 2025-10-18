import type { ExecuteChatWithSummariesInput, ExecuteChatWithSummariesResult } from './ai'

/**
 * Sends a chat request to the server with the current conversation state
 *
 * Forwards the rolling summary and latest message to the server function so
 * responses can be generated without hitting browser-side message limits.
 *
 * @param input - Payload containing prior conversation state, the next message, and current location
 * @returns ExecuteChatWithSummariesResult echoed from the server response
 *
 * @example
 * ```typescript
 * const result = await getChatResponse({
 *   state: { summary: null, messages: [] },
 *   nextMessage: { role: 'user', content: 'Where is the student lounge?' },
 *   currentLocation: 'a-f1-north-entrance'
 * })
 * ```
 */
export async function getChatResponse(
  input: ExecuteChatWithSummariesInput
): Promise<ExecuteChatWithSummariesResult> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(input)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `Request failed with status ${response.status}`)
    }

    return (await response.json()) as ExecuteChatWithSummariesResult
  } catch (error) {
    console.error('[AI Chat Client] Failed to reach /api/chat', error)
    throw error instanceof Error ? error : new Error('Unable to contact AI service.')
  }
}
