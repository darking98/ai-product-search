'use client'
import { useMemo, useCallback, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useChat } from '../../hooks/use-chat'
import type { UIMessage } from '@ai-sdk/react'
import { ProductCard } from '../../ui/cards/product-card'
import ChatForm from '@/views/index/components/chat-form'
import { Product } from '@/interfaces/product.interface'
import { useScrollBottom } from '@/hooks/use-scroll-bottom'

interface ChatViewProps {
  conversationId: string
  initialMessages?: UIMessage[]
}

const getMessageText = (message: UIMessage): string => {
  if (!message.parts || !Array.isArray(message.parts)) {
    return ''
  }
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => ('text' in part ? part.text : ''))
    .join('')
}

// Helper para extraer productos de los datos del mensaje (memoizado)
const getProducts = (message: UIMessage): Product[] => {
  const dataProducts = message.parts?.find(
    (part) => part.type === 'data-products'
  )

  if (dataProducts && 'data' in dataProducts) {
    return dataProducts.data as Product[]
  }

  return []
}

export function ChatView({
  conversationId,
  initialMessages = []
}: ChatViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    messages,
    isLoading,
    sendMessage: originalSendMessage
  } = useChat(conversationId, initialMessages)
  const messageSentRef = useRef(false)
  const { elementRef } = useScrollBottom(messages)

  // Enviar mensaje automáticamente si viene en la URL (solo una vez)
  useEffect(() => {
    const pendingMessage = searchParams.get('message')

    if (pendingMessage && !messageSentRef.current && messages.length === 0) {
      messageSentRef.current = true
      originalSendMessage(pendingMessage)
      setTimeout(() => {
        router.replace(`/chat/${conversationId}`, { scroll: false })
      }, 500)
    }
  }, [
    conversationId,
    searchParams,
    router,
    originalSendMessage,
    messages.length
  ])

  // Pre-procesar todos los mensajes una sola vez (se recalcula solo cuando messages cambia)
  const processedMessages = useMemo(() => {
    return messages.map((message, index) => ({
      message,
      index,
      products: getProducts(message),
      messageText: getMessageText(message),
      id: `${message.role}-${index}`
    }))
  }, [messages, getProducts, getMessageText])

  return (
    <div className="h-full flex flex-col">
      {messages.length === 0 ? (
        /* Empty state - Centered content */
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <h1 className="text-3xl md:text-4xl font-medium text-gray-200 mb-12 text-center">
            ¿En qué estás trabajando?
          </h1>

          <div className="w-full max-w-3xl">
            <ChatForm
              onSendMessage={originalSendMessage}
              isLoading={isLoading}
            />
          </div>
        </div>
      ) : (
        /* Chat messages */
        <>
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-5xl mx-auto space-y-6">
              {processedMessages.map(
                ({ message, index, products, messageText, id }) => (
                  <div key={id}>
                    {/* Mensaje de usuario o texto del assistant */}
                    {messageText && (
                      <div
                        className={`flex gap-4 ${
                          message.role === 'user' ? 'justify-end' : ''
                        } mb-4`}
                      >
                        {message.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <circle cx="12" cy="12" r="10"></circle>
                            </svg>
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white rounded-2xl px-4 py-3'
                              : 'text-gray-200'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">
                            {messageText}
                            {isLoading &&
                              index === messages.length - 1 &&
                              message.role === 'assistant' && (
                                <span className="inline-block w-1 h-5 bg-gray-200 ml-1 animate-pulse" />
                              )}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Grid de productos si los hay */}
                    {products.length > 0 && (
                      <div className="flex gap-4">
                        {message.role === 'assistant' && (
                          <div className="w-8 flex-shrink-0"></div>
                        )}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {products.map((product) => (
                            <ProductCard key={product.id} product={product} context={`chat-msg-${index}`} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                  </div>
                  <div className="text-gray-400">
                    <div className="flex gap-1">
                      <span className="animate-pulse">●</span>
                      <span className="animate-pulse delay-75">●</span>
                      <span className="animate-pulse delay-150">●</span>
                    </div>
                  </div>
                </div>
              )}
              {/* Elemento invisible para scroll automático */}
              <div ref={elementRef} />
            </div>
          </div>

          {/* Input at bottom */}
          <div className="border-t border-gray-800 px-4 py-4 flex-shrink-0">
            <div className="max-w-3xl mx-auto">
              <ChatForm
                onSendMessage={originalSendMessage}
                isLoading={isLoading}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
