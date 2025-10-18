import React, { useRef, useEffect, useState } from 'react'
import { Send, X, MapPin, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import type { ConversationState } from '@/lib/ai'
import { getChatResponse } from '@/lib/ai-client'

/**
 * Props for the AIChatPopup component
 *
 * @property isOpen - Whether the popup is currently visible
 * @property onClose - Callback invoked when the popup should be dismissed
 * @property currentPhotoId - The ID of the location currently displayed in the viewer
 * @property onNavigate - Handler that jumps the viewer to the supplied destination photo
 */
interface AIChatPopupProps {
  isOpen: boolean
  onClose: () => void
  currentPhotoId: string
  onNavigate?: (photoId: string) => void
}

/**
 * Represents a single chat message rendered in the popup
 *
 * @property id - Stable identifier for list rendering
 * @property role - Origin of the message (`user` or `assistant`)
 * @property content - Text content displayed to the user
 * @property timestamp - Creation time of the message
 * @property navigationData - Navigation metadata when the AI triggers viewport movement
 */
interface ChatMessageDisplay {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  navigationData?: {
    photoId: string
    error?: string
  }
}

function Messages({
  messages,
  isLoading
}: {
  messages: Array<ChatMessageDisplay>
  isLoading: boolean
}) {
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  if (!messages.length) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
        Ask me anything about the panoramic view!
      </div>
    )
  }

  return (
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
      {messages.map(({ id, role, content }) => (
        <div
          key={id}
          className={`py-3 ${
            role === 'assistant'
              ? 'bg-gradient-to-r from-blue-500/5 to-purple-600/5'
              : 'bg-transparent'
          }`}
        >
          <div className="flex items-start gap-2 px-4">
            {role === 'assistant' ? (
              <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
                AI
              </div>
            ) : (
              <div className="w-6 h-6 rounded-lg bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700 flex-shrink-0">
                U
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-800 whitespace-pre-wrap">
                {content}
              </div>
            </div>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="py-3 bg-gradient-to-r from-blue-500/5 to-purple-600/5">
          <div className="flex items-start gap-2 px-4">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
              AI
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-gray-600 text-sm">Thinking...</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function generateMessageId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * AI chat popup that connects the UI to the campus navigation server function
 *
 * Displays the ongoing conversation, handles user input, and forwards requests
 * to the `getChatResponse` server function. When the AI returns a navigation
 * command, the component forwards it to the provided `onNavigate` handler so
 * the panoramic viewer can move to the requested destination.
 *
 * @param isOpen - Whether the dialog is currently visible
 * @param onClose - Callback to close the popup
 * @param currentPhotoId - Current location photo identifier for the user
 * @param onNavigate - Handler invoked when the AI requests automatic navigation
 * @returns React component representing the AI chat popup
 */
export const AIChatPopup: React.FC<AIChatPopupProps> = ({
  isOpen,
  onClose,
  currentPhotoId,
  onNavigate
}) => {
  const [messages, setMessages] = useState<ChatMessageDisplay[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [conversationState, setConversationState] = useState<ConversationState>({
    summary: null,
    messages: []
  })

  const appendAssistantMessage = (
    content: string,
    navigationData?: ChatMessageDisplay['navigationData']
  ) => {
    setMessages(prev => [
      ...prev,
      {
        id: generateMessageId(),
        role: 'assistant',
        content,
        timestamp: new Date(),
        navigationData
      }
    ])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    if (!currentPhotoId) {
      appendAssistantMessage(
        'I need to know where you currently are before I can help. Please try again once the viewer finishes loading.',
        { error: 'Missing current location.' }
      )
      setInput('')
      return
    }

    const userMessage: ChatMessageDisplay = {
      id: generateMessageId(),
      role: 'user',
      content: trimmed,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const result = await getChatResponse({
        state: conversationState,
        nextMessage: { role: 'user', content: trimmed },
        currentLocation: currentPhotoId
      })

      setConversationState(result.state)

      if (result.response.error) {
        appendAssistantMessage(
          result.response.error,
          { error: 'The AI service reported an error.' }
        )
        setErrorMessage(result.response.error)
        return
      }

      const messageText =
        result.response.message ??
        (result.response.functionCall
          ? `Starting navigation to ${result.response.functionCall.arguments.photoId}.`
          : 'I’m here if you need directions around campus!')

      let navigationData: ChatMessageDisplay['navigationData'] | undefined

      if (result.response.functionCall) {
        const destination = result.response.functionCall.arguments.photoId
        if (onNavigate) {
          onNavigate(destination)
          navigationData = { photoId: destination }
        } else {
          navigationData = {
            photoId: destination,
            error: 'Navigation handler is unavailable.'
          }
        }
      }

      appendAssistantMessage(messageText, navigationData)
    } catch (error) {
      console.error('[AI Chat Popup] Failed to fetch AI response', error)
      const fallbackMessage =
        'Sorry, I ran into a problem trying to contact the campus AI. Please try again in a moment.'
      appendAssistantMessage(fallbackMessage, { error: 'Network or service error.' })
      setErrorMessage('Unable to reach the AI service. Check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isOpen || messages.length > 0) {
      return
    }

    setMessages([
      {
        id: generateMessageId(),
        role: 'assistant',
        content: 'Hi there! I can help you find facilities across campus. Ask me where you’d like to go.',
        timestamp: new Date()
      }
    ])
  }, [isOpen, messages.length])

  useEffect(() => {
    if (!isOpen) {
      setErrorMessage(null)
    }
  }, [isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const latestAssistantNavigation = messages
    .slice()
    .reverse()
    .find(message => message.role === 'assistant' && message.navigationData)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-2xl max-h-[85vh] h-[600px] max-sm:h-[80vh] max-sm:w-[95vw] max-sm:max-w-none flex flex-col p-0">
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle>AI Chat Assistant</DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <DialogDescription className="sr-only">
            Chat with the AI assistant to get help with the panoramic viewer navigation and controls
          </DialogDescription>
        </DialogHeader>

        <Messages messages={messages} isLoading={isLoading} />

        {latestAssistantNavigation && latestAssistantNavigation.navigationData && (
          <div className="px-4 py-2 border-t border-gray-200 bg-blue-50 text-xs text-blue-800 flex items-center gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            {latestAssistantNavigation.navigationData.error ? (
              <span>
                Tried to navigate to <strong>{latestAssistantNavigation.navigationData.photoId}</strong>, but encountered an issue: {latestAssistantNavigation.navigationData.error}
              </span>
            ) : (
              <span>
                Navigating to <strong>{latestAssistantNavigation.navigationData.photoId}</strong>.
              </span>
            )}
          </div>
        )}

        {errorMessage && (
          <div className="px-4 py-2 border-t border-red-200 bg-red-50 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Ask me anything about the panoramic viewer..."
                className="w-full rounded-lg border border-gray-300 bg-white pl-3 pr-10 py-2 text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none overflow-hidden"
                rows={1}
                style={{ minHeight: '36px', maxHeight: '120px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height =
                    Math.min(target.scrollHeight, 120) + 'px'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading || !currentPhotoId}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-500 hover:text-blue-400 disabled:text-gray-400 transition-colors focus:outline-none"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
