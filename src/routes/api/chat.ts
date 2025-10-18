import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { executeChatWithSummaries, type ExecuteChatWithSummariesInput } from '@/lib/ai'

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const payload = (await request.json()) as ExecuteChatWithSummariesInput
        const result = await executeChatWithSummaries(payload)
        return json(result)
      }
    }
  }
})
