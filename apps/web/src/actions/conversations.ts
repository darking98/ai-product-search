'use server'
import { api } from '@/lib/api'
import { Product } from '@/interfaces/product.interface'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  products?: Product[]
  created_at: string
}

interface MessagesResponse {
  success: boolean
  data: Message[]
  total: number
}

interface ConversationResponse {
  success: boolean
  data: {
    id: string
    title: string
    active: boolean
    created_at: string
    updated_at: string
  } | null
}

/**
 * Obtiene los mensajes de una conversación desde el backend
 * Devuelve formato simple y serializable
 */
export async function getConversationMessages(
  conversationId: string
): Promise<Message[]> {
  try {
    const data = await api.get<MessagesResponse>(
      `/conversations/${conversationId}/messages`
    )
    if (!data.success || !data.data) {
      return []
    }

    return data.data
  } catch (error) {
    console.error('Error in getConversationMessages:', error)
    return []
  }
}

/**
 * Verifica si una conversación existe
 */
export async function conversationExists(
  conversationId: string
): Promise<boolean> {
  try {
    const data = await api.get<ConversationResponse>(
      `/conversations/${conversationId}`
    )
    return data.success && data.data !== null
  } catch (error) {
    console.error('Error checking conversation existence:', error)
    return false
  }
}
