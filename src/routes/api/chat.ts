import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { executeChatWithSummaries, type ExecuteChatWithSummariesInput } from '@/lib/ai'

/**
 * Server route handler that proxies AI chat requests to the OpenAI integration
 *
 * Exposes a POST endpoint forwarding the rolling conversation state to
 * `executeChatWithSummaries` and returns the assistant reply payload.
 *
 * @property server - Route configuration scoped to the API server handlers
 * @returns Route definition consumed by TanStack Router's server runtime
 */
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
