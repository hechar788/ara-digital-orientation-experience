import React, { useRef, useEffect, useState, useCallback, useLayoutEffect } from 'react'
import { Send, X, MapPin, AlertCircle, Loader2 } from 'lucide-react'
import type { ConversationState } from '@/lib/ai'
import { getChatResponse } from '@/lib/ai-client'
import type { UseRouteNavigationReturn, RouteNavigationHandlerOptions } from '@/hooks/useRouteNavigation'
import { formatLocationId } from './locationFormat'

/**
 * Props for the AIChatPopup component
 *
 * @property isOpen - Whether the popup is currently visible
 * @property onClose - Callback invoked when the popup should be dismissed
 * @property currentPhotoId - The ID of the location currently displayed in the viewer
 * @property onNavigate - Handler that jumps the viewer to the supplied destination photo
 * @property routeNavigation - Sequential navigation controller used to walk through AI-provided routes
 */
interface AIChatPopupProps {
  isOpen: boolean
  onClose: () => void
  currentPhotoId: string
  onNavigate?: (photoId: string, options?: RouteNavigationHandlerOptions) => Promise<void> | void
  routeNavigation?: UseRouteNavigationReturn
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

function sanitizeAssistantMessage(content: string): string {
  const uploadPattern = /\b(upload|uploaded|uploading|file|files|attachment|attachments)\b/i
  if (uploadPattern.test(content)) {
    return 'I\'m here to help with campus locations and navigation. Let me know which building, room, or facility you would like to find.'
  }
  return content
}

function ensureQuestionSpacing(message: string): string {
  const trailingWhitespaceMatch = message.match(/\s*$/)
  const trailingWhitespace = trailingWhitespaceMatch ? trailingWhitespaceMatch[0] : ''
  const core = message.slice(0, message.length - trailingWhitespace.length)
  const lastQuestionIndex = core.lastIndexOf('?')
  if (lastQuestionIndex === -1) {
    return core + trailingWhitespace
  }

  const boundaryCandidates = [
    core.lastIndexOf('\n', lastQuestionIndex - 1),
    core.lastIndexOf('!', lastQuestionIndex - 1),
    core.lastIndexOf('.', lastQuestionIndex - 1),
    core.lastIndexOf('?', lastQuestionIndex - 1)
  ]
  let boundaryIndex = Math.max(...boundaryCandidates)
  if (boundaryIndex === -1) {
    boundaryIndex = 0
  } else {
    boundaryIndex += 1
  }

  const questionText = core.slice(boundaryIndex).trim()
  const leading = core.slice(0, boundaryIndex).trimEnd()

  if (leading.length === 0) {
    return `${questionText}${trailingWhitespace}`
  }

  const separator = leading.endsWith('\n\n') ? '' : '\n\n'

  return `${leading}${separator}${questionText}${trailingWhitespace}`
}

function formatAssistantMessageContent(content: string): string {
  const sanitized = sanitizeAssistantMessage(content)
  if (sanitized.length === 0) {
    return sanitized
  }
  
  // Simply ensure proper spacing before the final question
  return ensureQuestionSpacing(sanitized)
}

/**
 * Parses message content and returns formatted JSX with bold location headers and bullet points for lists
 *
 * Identifies lines that appear to be location/facility names (followed by
 * description text) and wraps them in strong tags for emphasis. Also detects
 * list items separated by blank lines and formats them as bullet points.
 *
 * @param content - Raw message text from the assistant
 * @param isUser - Whether this is a user message (skips formatting for user messages)
 * @returns React nodes with formatted content
 */
function formatMessageWithHeaders(content: string, isUser: boolean): React.ReactNode {
  if (isUser) {
    return content
  }

  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0
  
  while (i < lines.length) {
    const line = lines[i]
    const trimmedLine = line.trim()
    const nextLine = i < lines.length - 1 ? lines[i + 1] : null
    const nextTrimmed = nextLine ? nextLine.trim() : null
    
    // Check if this line ends with a colon (potential list introduction)
    if (trimmedLine.endsWith(':')) {
      // Look ahead to see if we have a list pattern
      // List pattern: multiple lines ending with periods, separated by blank lines
      let tempIndex = i + 1
      const potentialListItems: string[] = []
      
      while (tempIndex < lines.length) {
        const checkLine = lines[tempIndex].trim()
        
        if (checkLine.length === 0) {
          // Empty line, skip
          tempIndex++
          continue
        }
        
        if (checkLine.endsWith('.') && /^[A-Z]/.test(checkLine)) {
          // Potential list item
          potentialListItems.push(checkLine)
          tempIndex++
          
          // Skip any following empty lines
          while (tempIndex < lines.length && lines[tempIndex].trim().length === 0) {
            tempIndex++
          }
        } else {
          // Not a list item pattern, stop looking
          break
        }
      }
      
      // If we found multiple items that look like list items, treat as a list
      if (potentialListItems.length >= 2) {
        // Render the intro line
        elements.push(
          <React.Fragment key={`text-${i}`}>
            {line}
            <br />
          </React.Fragment>
        )
        
        // Render the list
        elements.push(
          <ul key={`list-${i}`} className="list-disc list-outside space-y-1.5 my-2 ml-5">
            {potentialListItems.map((item, idx) => (
              <li key={`item-${i}-${idx}`}>{item}</li>
            ))}
          </ul>
        )
        
        // Add spacing after the list
        elements.push(<br key={`br-list-${i}`} />)
        
        // Skip past the list items we just rendered
        i = tempIndex
        continue
      }
    }
    
    // Check if this line looks like a header:
    // - Not empty
    // - Starts with a capital letter
    // - Doesn't end with sentence-ending punctuation
    // - Next line exists and looks like a description
    const isHeader = 
      trimmedLine.length > 0 &&
      /^[A-Z]/.test(trimmedLine) &&
      !/[.!?]$/.test(trimmedLine) &&
      nextTrimmed &&
      nextTrimmed.length > 0 &&
      /^(A |An |The |[A-Z])/.test(nextTrimmed) &&
      nextTrimmed.endsWith('.')
    
    if (isHeader) {
      elements.push(
        <strong key={`header-${i}`} className="underline">{line}</strong>,
        <br key={`br-${i}`} />
      )
    } else if (trimmedLine.length === 0) {
      elements.push(<br key={`br-${i}`} />)
    } else {
      elements.push(
        <React.Fragment key={`text-${i}`}>
          {line}
          {i < lines.length - 1 && <br />}
        </React.Fragment>
      )
    }
    
    i++
  }
  
  return elements
}

const AFFIRMATIVE_RESPONSES = ['Sure thing!', 'Okay!', 'Here we go!', 'You got it!'] as const
function pickAffirmativeResponse(): string {
  const randomIndex = Math.floor(Math.random() * AFFIRMATIVE_RESPONSES.length)
  return AFFIRMATIVE_RESPONSES[randomIndex]
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
  onNavigate,
  routeNavigation
}) => {
  const [messages, setMessages] = useState<ChatMessageDisplay[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [conversationState, setConversationState] = useState<ConversationState>({
    summary: null,
    messages: []
  })
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const adjustTextareaHeight = useCallback((element?: HTMLTextAreaElement | null) => {
    if (typeof window === 'undefined') {
      return
    }

    const target = element ?? textareaRef.current
    if (!target) {
      return
    }

    const styles = window.getComputedStyle(target)
    const fontSize = Number.parseFloat(styles.fontSize) || 0
    const rawLineHeight = Number.parseFloat(styles.lineHeight)
    const fallbackLineHeight = fontSize > 0 ? fontSize * 1.2 : 16
    const lineHeight = Number.isFinite(rawLineHeight) && rawLineHeight > 0 ? rawLineHeight : fallbackLineHeight
    const paddingTop = Number.parseFloat(styles.paddingTop) || 0
    const paddingBottom = Number.parseFloat(styles.paddingBottom) || 0
    const singleLineHeight = lineHeight + paddingTop + paddingBottom
    const doubleLineHeight = lineHeight * 2 + paddingTop + paddingBottom

    target.style.height = 'auto'
    target.style.minHeight = `${singleLineHeight}px`
    target.style.maxHeight = `${doubleLineHeight}px`
    const constrainedHeight = Math.min(Math.max(target.scrollHeight, singleLineHeight), doubleLineHeight)
    target.style.height = `${constrainedHeight}px`
    target.style.overflowY = target.scrollHeight > doubleLineHeight ? 'auto' : 'hidden'
  }, [])

  const scheduleClose = useCallback(
    (action?: () => void) => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
      closeTimeoutRef.current = setTimeout(() => {
        action?.()
        onClose()
        closeTimeoutRef.current = null
      }, 1500)
    },
    [onClose]
  )

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
          content:
            'Kia ora!\n\nI can help you find facilities and services around campus, answer questions about your studies at Ara, and help guide you where you need to go.',
          timestamp: new Date()
        }
      ])
    }
  }, [isOpen, messages.length])

  useEffect(
    () => () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    },
    []
  )

  useEffect(() => {
    if (!isOpen && closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }, [isOpen])

  useLayoutEffect(() => {
    if (!isOpen) {
      return
    }
    adjustTextareaHeight()
  }, [isOpen, adjustTextareaHeight])

  useEffect(() => {
    if (!isOpen) {
      return
    }
    adjustTextareaHeight()
  }, [input, isOpen, adjustTextareaHeight])

  const appendAssistantMessage = (
    content: string,
    navigationData?: ChatMessageDisplay['navigationData']
  ) => {
    setMessages(prev => [
      ...prev,
      {
        id: generateMessageId(),
        role: 'assistant',
        content: formatAssistantMessageContent(content),
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
          : 'I\'m here if you need directions around campus!')

      let navigationData: ChatMessageDisplay['navigationData'] | undefined
      let navigationAction: (() => void) | undefined

      if (result.response.functionCall) {
        const { photoId, path, distance, routeDescription, finalOrientation, error } =
          result.response.functionCall.arguments

        const pathArray = Array.isArray(path) ? path : []
        const hasRoute = pathArray.length > 0

        console.info('[AI Chat Popup] Navigation payload', {
          destination: photoId,
          pathLength: pathArray.length,
          distance,
          routeDescription,
          finalOrientation,
          error,
          path: pathArray
        })

        navigationData = {
          photoId,
          path: pathArray,
          distance,
          routeDescription,
          error
        }

        if (!error) {
          if (hasRoute && routeNavigation) {
            routeNavigation.cancelNavigation()
            navigationAction = () => routeNavigation.startNavigation(pathArray, finalOrientation)
          } else if (onNavigate) {
            routeNavigation?.cancelNavigation()
            navigationAction = () => {
              onNavigate(photoId)
            }
          } else {
            navigationData.error = 'Navigation handler is unavailable.'
          }

          const acknowledgement = pickAffirmativeResponse()
          appendAssistantMessage(acknowledgement)
          setIsLoading(false)
          scheduleClose(navigationAction)
          return
        }
      }

      appendAssistantMessage(resolvedMessage, navigationData)
      navigationAction?.()
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
      <div className="flex w-[calc(85vw-1.7rem)] max-w-[22rem] h-[min(28.8rem,calc(100vh-5.4rem))] min-h-[16.2rem] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl lg:h-[50vh] lg:w-[min(22rem,calc(100vw-2rem))]">
        <div className="flex items-center justify-between rounded-t-2xl bg-[#0C586E] px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <p className="text-sm font-semibold">Campus Assistant</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white focus-visible:ring-offset-[#0C586E]"
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
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                      isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div>{formatMessageWithHeaders(message.content, isUser)}</div>

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
                                Path:{' '}
                                {navigationData.path
                                  .map(segment => formatLocationId(segment))
                                  .join(' → ')}
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
                className="w-full resize-none overflow-y-auto rounded-xl border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:bg-gray-100"
                disabled={isLoading}
                maxLength={500}
                onInput={event => adjustTextareaHeight(event.currentTarget)}
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