'use client'
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { Conversation } from '@/interfaces/conversation.interface'

const STORAGE_KEY = 'ai-product-search:conversations'

interface ConversationsContextType {
  conversations: Conversation[]
  saveConversation: (conversation: Conversation) => void
  deleteConversation: (conversationId: string) => void
  getConversation: (conversationId: string) => Conversation | undefined
  updateConversationTitle: (conversationId: string, title: string) => void
}

const ConversationsContext = createContext<ConversationsContextType | undefined>(undefined)

export function ConversationsProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([])

  // Cargar conversaciones desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setConversations(parsed)
      } catch (error) {
        console.error('Error loading conversations:', error)
      }
    }
  }, [])

  // Guardar conversación
  const saveConversation = useCallback((conversation: Conversation) => {
    setConversations((prev) => {
      // Verificar si ya existe
      const exists = prev.find((c) => c.id === conversation.id)
      if (exists) {
        // Actualizar existente
        const updated = prev.map((c) =>
          c.id === conversation.id ? conversation : c
        )
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        return updated
      } else {
        // Agregar nueva (al inicio)
        const updated = [conversation, ...prev]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        return updated
      }
    })
  }, [])

  // Eliminar conversación
  const deleteConversation = useCallback((conversationId: string) => {
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== conversationId)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  // Obtener conversación por ID
  const getConversation = useCallback(
    (conversationId: string) => {
      return conversations.find((c) => c.id === conversationId)
    },
    [conversations]
  )

  // Actualizar título de conversación
  const updateConversationTitle = useCallback(
    (conversationId: string, title: string) => {
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === conversationId ? { ...c, title, updated_at: new Date().toISOString() } : c
        )
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        return updated
      })
    },
    []
  )

  return (
    <ConversationsContext.Provider
      value={{
        conversations,
        saveConversation,
        deleteConversation,
        getConversation,
        updateConversationTitle,
      }}
    >
      {children}
    </ConversationsContext.Provider>
  )
}

export function useConversations() {
  const context = useContext(ConversationsContext)
  if (!context) {
    throw new Error('useConversations must be used within ConversationsProvider')
  }
  return context
}
