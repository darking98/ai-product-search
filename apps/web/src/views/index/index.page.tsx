'use client'
import { ViewTransition } from 'react'
import { Product } from '@/interfaces/product.interface'
import { ProductCard } from '@/ui/cards/product-card'
import ChatForm from '@/views/index/components/chat-form'
import { useRouter } from 'next/navigation'
import PaginationWithQuery from '@/components/common/pagination-with-query'
import { useConversations } from '@/contexts/conversations-context'

interface IndexPageProps {
  products: Product[]
  currentPage: number
  total: number
  limit: number
}

export default function IndexPage({
  products,
  currentPage,
  total
}: IndexPageProps) {
  const router = useRouter()
  const { saveConversation } = useConversations()

  const handleSendMessage = async (message: string) => {
    // Generar un UUID para la nueva conversación
    const uuid = crypto.randomUUID()

    // Guardar conversación en localStorage
    const title = message.substring(0, 50)
    saveConversation({
      id: uuid,
      title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Navegar a la página de chat con el mensaje pendiente
    router.push(`/chat/${uuid}?message=${encodeURIComponent(message)}`)
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Efectos de blur decorativos */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none blur-blob" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none blur-blob" />
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none blur-blob" />

      {/* Header Section */}
      <div
        className="flex flex-col items-center justify-center px-4 py-16 relative z-10"
        style={{ viewTransitionName: 'site-header' }}
      >
        <div className="text-center mb-8">
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

        {/* IA Input Text */}
        <div className="w-full max-w-3xl mb-4">
          <ChatForm onSendMessage={handleSendMessage} isLoading={false} />
        </div>

        <p className="text-sm text-gray-400 font-light tracking-wide">
          Prueba preguntas como: "Busco un celular económico" o "Necesito
          audífonos bluetooth"
        </p>
      </div>

      {/* Products Section */}
      <ViewTransition
        enter={{
          'nav-forward': 'nav-forward',
          'nav-back': 'nav-back',
          default: 'none'
        }}
        exit={{
          'nav-forward': 'nav-forward',
          'nav-back': 'nav-back',
          default: 'none'
        }}
        default="none"
      >
        <div className="flex-1 px-4 py-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bold text-white tracking-tight">Productos</h2>
              <p className="text-gray-400 text-sm font-light tracking-wide">{total} productos en total</p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  No hay productos disponibles en este momento
                </p>
              </div>
            )}

            {/* Pagination */}
            <PaginationWithQuery count={total} page={currentPage} limit={12} />
          </div>
        </div>
      </ViewTransition>
    </div>
  )
}
