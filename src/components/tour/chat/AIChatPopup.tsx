import React, { useRef, useEffect, useState } from 'react'
import { Send, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface AIChatPopupProps {
  isOpen: boolean
  onClose: () => void
}

function Messages({ messages, isLoading }: { messages: Array<Message>; isLoading: boolean }) {
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

export const AIChatPopup: React.FC<AIChatPopupProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I understand you're asking about: "${userMessage.content}". As an AI assistant for the panoramic viewer, I can help you with navigation, controls, and understanding the immersive experience. What would you like to know more about?`
      }
      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

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
                disabled={!input.trim() || isLoading}
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