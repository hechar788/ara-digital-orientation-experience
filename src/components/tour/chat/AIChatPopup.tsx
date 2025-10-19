import React, { useRef, useEffect, useState } from 'react'
import { Send, X, MapPin, AlertCircle, Loader2 } from 'lucide-react'
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
    path?: string[]
    distance?: number
    routeDescription?: string
    error?: string
  }
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

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  useEffect(() => {
    if (!isOpen) {
      setErrorMessage(null)
      return
    }

    if (messages.length === 0) {
      setMessages([
        {
          id: generateMessageId(),
          role: 'assistant',
          content: 'Hi there! I can help you find facilities across campus. Ask me where you would like to go next.',
          timestamp: new Date()
        }
      ])
    }
  }, [isOpen, messages.length])

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

  const processMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) {
      return
    }

    if (!currentPhotoId) {
      appendAssistantMessage(
        'I need to know where you are in the tour before I can calculate directions. Please try again once the viewer finishes loading.',
        { photoId: currentPhotoId ?? 'unknown-location', error: 'Missing current location.' }
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
        appendAssistantMessage(result.response.error, {
          photoId: currentPhotoId,
          error: result.response.error
        })
        setErrorMessage(result.response.error)
        return
      }

      const resolvedMessage =
        result.response.message ??
        (result.response.functionCall
          ? `Starting navigation to ${result.response.functionCall.arguments.photoId}.`
          : 'I’m here if you need directions around campus!')

      let navigationData: ChatMessageDisplay['navigationData'] | undefined

      if (result.response.functionCall) {
        const { photoId, path, distance, routeDescription, error } =
          result.response.functionCall.arguments

        navigationData = {
          photoId,
          path,
          distance,
          routeDescription,
          error
        }

        if (!error) {
          if (onNavigate) {
            setTimeout(() => {
              onNavigate(photoId)
            }, 500)
          } else {
            navigationData.error = 'Navigation handler is unavailable.'
          }
        }
      }

      appendAssistantMessage(resolvedMessage, navigationData)
    } catch (error) {
      console.error('[AI Chat Popup] Failed to fetch AI response', error)
      const fallbackMessage =
        'Sorry, I ran into a problem trying to contact the campus AI. Please try again in a moment.'
      appendAssistantMessage(fallbackMessage, {
        photoId: currentPhotoId ?? 'unknown-location',
        error: 'Network or service error.'
      })
      setErrorMessage('Unable to reach the AI service. Check your connection and try again.')
    } finally {
      setIsLoading(false)
      requestAnimationFrame(() => textareaRef.current?.focus())
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void processMessage()
  }

  const handleTextareaKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void processMessage()
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      <div className="flex w-[min(22rem,calc(100vw-2rem))] max-h-[80vh] lg:h-[50vh] min-h-[18rem] flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <p className="text-sm font-semibold">Campus Assistant</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white focus-visible:ring-offset-blue-600"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map(message => {
              const isUser = message.role === 'user'
              const timestamp = message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })
              const navigationData = message.navigationData

              return (
                <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                      isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>

                    {navigationData && (
                      <div
                        className={`mt-3 rounded-xl border px-3 py-2 text-xs ${
                          navigationData.error
                            ? 'border-red-200 bg-red-50 text-red-700'
                            : 'border-blue-200 bg-blue-50 text-blue-800'
                        }`}
                      >
                        {navigationData.error ? (
                          <div className="flex items-start gap-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <p>
                              Unable to complete navigation to{' '}
                              <strong>{navigationData.photoId}</strong>. {navigationData.error}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 font-medium">
                              <MapPin className="h-4 w-4" />
                              <span>
                                Route ready ({navigationData.distance ?? 0}{' '}
                                {navigationData.distance === 1 ? 'step' : 'steps'})
                              </span>
                            </div>
                            {navigationData.routeDescription && (
                              <p>{navigationData.routeDescription}</p>
                            )}
                            {navigationData.path && navigationData.path.length > 1 && (
                              <p className="text-[11px] text-blue-900/80">
                                Path: {navigationData.path.join(' → ')}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <p className="mt-1 text-[11px] opacity-70">{timestamp}</p>
                  </div>
                </div>
              )
            })}

            {isLoading && (
              <div className="flex items-center gap-2 rounded-2xl bg-gray-100 px-3 py-2 text-sm text-gray-700 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                Thinking…
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {errorMessage && (
            <div className="mx-4 mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="border-t border-gray-200 px-4 py-3">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={input}
                placeholder="Ask me about campus locations…"
                onChange={event => setInput(event.target.value)}
                onKeyDown={handleTextareaKeyDown}
                className="h-full max-h-32 min-h-[38px] w-full resize-none rounded-xl border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:bg-gray-100"
                disabled={isLoading}
                maxLength={500}
                onInput={event => {
                  const target = event.currentTarget
                  target.style.height = 'auto'
                  target.style.height = `${Math.min(target.scrollHeight, 128)}px`
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-blue-600 transition-colors hover:text-blue-500 disabled:text-gray-400"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-[11px] text-gray-500">Enter to send • Shift+Enter for a new line</p>
          </form>
        </div>
    </div>
  )
}
