import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { executeChat, type GetChatResponseInput } from '@/lib/ai'

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const payload = (await request.json()) as GetChatResponseInput
        const result = await executeChat(payload)
        return json(result)
      }
    }
  }
})
