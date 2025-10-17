import type { ChatResponse, GetChatResponseInput } from './ai'

export async function getChatResponse(input: GetChatResponseInput): Promise<ChatResponse> {
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

    return (await response.json()) as ChatResponse
  } catch (error) {
    console.error('[AI Chat Client] Failed to reach /api/chat', error)
    throw error instanceof Error ? error : new Error('Unable to contact AI service.')
  }
}
