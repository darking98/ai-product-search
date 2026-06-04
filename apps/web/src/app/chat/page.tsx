'use client'
import ChatForm from '@/views/index/components/chat-form'
import { useRouter } from 'next/navigation'
import { useConversations } from '@/contexts/conversations-context'

const Page = () => {
  const router = useRouter()
  const { saveConversation } = useConversations()

  const handleSendMessage = async (message: string) => {
    const uuid = crypto.randomUUID()

    const title = message.substring(0, 50)
    saveConversation({
      id: uuid,
      title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    router.push(`/chat/${uuid}?message=${encodeURIComponent(message)}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Efectos de blur decorativos */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none blur-blob" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none blur-blob" />
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none blur-blob" />

      <div className="text-center mb-8 relative z-10">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="text-6xl">🤖</div>
          <h1 className="text-6xl font-extrabold text-white tracking-tight">
            Shopcito
          </h1>
        </div>
        <p className="text-xl text-gray-300 max-w-2xl font-light tracking-wide leading-relaxed">
          Tu asistente de compras inteligente con IA.
          <br />
          Encuentra exactamente lo que necesitas con solo describirlo.
        </p>
      </div>

      <div className="w-full max-w-3xl mb-4 relative z-10">
        <ChatForm onSendMessage={handleSendMessage} isLoading={false} />
      </div>

      <p className="text-sm text-gray-400 font-light tracking-wide relative z-10">
        Prueba preguntas como: "Busco un celular económico" o "Necesito
        audífonos bluetooth"
      </p>
    </div>
  )
}

export default Page
