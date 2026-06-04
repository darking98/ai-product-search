'use client'
import { useMemo } from 'react'
import { useChat as useVercelChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import type { UIMessage } from '@ai-sdk/react'

export function useChat(
  conversationId?: string,
  initialMessages?: UIMessage[]
) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api'}/chat/stream`,
        body: conversationId ? { conversationId } : {}
      }),
    [conversationId]
  )

  const { messages, sendMessage, status, error, setMessages } = useVercelChat({
    transport,
    messages: initialMessages || [],
    onError: (error) => {
      console.error('Error en chat:', error)
    }
  })

  return {
    messages,
    isLoading: status === 'streaming' || status === 'submitted',
    error: error?.message || null,
    sendMessage: async (userMessage: string) => {
      await sendMessage({
        text: userMessage
      })
    }
  }
}
