'use client'
import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useConversations } from '@/contexts/conversations-context'

function IndexLayoutInner({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { conversations, deleteConversation } = useConversations()

  const currentConversationId = pathname.startsWith('/chat/')
    ? pathname.replace('/chat/', '')
    : null

  const handleNewChat = () => {
    router.push('/')
  }

  const handleSelectConversation = (conversationId: string) => {
    router.push(`/chat/${conversationId}`)
  }

  const handleDeleteConversation = (
    e: React.MouseEvent,
    conversationId: string
  ) => {
    e.stopPropagation()
    deleteConversation(conversationId)
    if (currentConversationId === conversationId) {
      router.push('/')
    }
  }

  return (
    <div className="flex h-[calc(100vh-73px)] bg-black text-white">
      {/* Sidebar */}
      <aside
        className={`${
          isCollapsed ? 'w-16' : 'w-64'
        } bg-[#0d0d0d] border-r border-gray-800 flex flex-col transition-all duration-300 h-full`}
      >
        {/* Header with logo and collapse button */}
        <div className="flex items-center justify-between p-3">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
            </svg>
          </button>
        </div>

        {/* Nuevo chat */}
        <div className="px-2 mb-4">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-sm"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="flex-shrink-0"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            {!isCollapsed && <span>Nuevo chat</span>}
          </button>
        </div>

        {/* Lista de conversaciones */}
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto px-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-4">
                No hay conversaciones
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    currentConversationId === conversation.id
                      ? 'bg-gray-800'
                      : 'hover:bg-gray-800/50'
                  }`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="flex-shrink-0 text-gray-400"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span className="text-sm truncate flex-1">
                    {conversation.title}
                  </span>
                  <button
                    onClick={(e) =>
                      handleDeleteConversation(e, conversation.id)
                    }
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600/20 rounded transition-all"
                    aria-label="Eliminar conversación"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-red-500"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Spacer si está colapsado */}
        {isCollapsed && <div className="flex-1"></div>}

        {/* Configuración */}
        <div className="px-2 mb-3 border-t border-gray-800 pt-3">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-sm text-gray-300">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="flex-shrink-0"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6M6.34 6.34l4.24 4.24m5.66 5.66l4.24 4.24M1 12h6m6 0h6M6.34 17.66l4.24-4.24m5.66-5.66l4.24-4.24"></path>
            </svg>
            {!isCollapsed && <span>Configuración</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  )
}

export function IndexLayout({ children }: { children: React.ReactNode }) {
  return <IndexLayoutInner>{children}</IndexLayoutInner>
}
