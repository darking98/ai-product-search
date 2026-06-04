import { getConversationMessages, Message } from '@/actions/conversations'
import { ChatView } from '@/views/chat/chat-view'
import type { UIMessage } from '@ai-sdk/react'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params

  // Fetch messages on the server (SSR)
  const messages = await getConversationMessages(id)
  // Transform to UIMessage format for client component
  const initialMessages: UIMessage[] = messages.map((msg: Message) => {
    const uiMessage: UIMessage = {
      id: msg.id,
      role: msg.role,
      parts: [{ type: 'text', text: msg.content }]
    }

    if (msg.products && msg.products.length > 0) {
      uiMessage.parts.push({
        type: 'data-products',
        data: msg.products
      })
    }

    return uiMessage
  })

  return <ChatView conversationId={id} initialMessages={initialMessages} />
}

export default Page
