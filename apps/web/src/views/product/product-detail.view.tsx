'use client'
import { ViewTransition } from 'react'
import { Product } from '@/interfaces/product.interface'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface ProductDetailViewProps {
  product: Product
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const searchParams = useSearchParams()
  const backUrl = searchParams.get('from') || '/'
  const vtContext = searchParams.get('vtContext')

  // Create unique ViewTransition names with optional context
  const vtPrefix = vtContext ? `${vtContext}-` : ''
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header con botón de volver */}
      <div
        className="border-b border-gray-800 px-4 py-4"
        style={{ viewTransitionName: 'site-header' }}
      >
        <div className="max-w-7xl mx-auto">
          <Link
            href={backUrl}
            transitionTypes={['nav-back']}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Volver
          </Link>
        </div>
      </div>

      {/* Contenido principal */}
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
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Imagen del producto */}
            <div className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-gray-800">
              <div className="relative aspect-square">
                <ViewTransition name={`${vtPrefix}product-${product.slug}`} share="morph">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </ViewTransition>
              </div>
            </div>

            {/* Información del producto */}
            <div className="flex flex-col gap-6">
              {/* Categoría y marca */}
              <div className="flex items-center gap-3 text-sm">
                {product.category && (
                  <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full">
                    {product.category.name}
                  </span>
                )}
                {product.brand && (
                  <ViewTransition
                    name={`${vtPrefix}product-brand-${product.slug}`}
                    share="morph"
                  >
                    <span className="text-gray-400">
                      Marca:{' '}
                      <span className="text-gray-300">{product.brand}</span>
                    </span>
                  </ViewTransition>
                )}
              </div>

              {/* Nombre del producto */}
              <ViewTransition
                name={`${vtPrefix}product-title-${product.slug}`}
                share="morph"
              >
                <h1 className="text-4xl font-bold">{product.name}</h1>
              </ViewTransition>

              {/* Precio */}
              <ViewTransition
                name={`${vtPrefix}product-price-${product.slug}`}
                share="morph"
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-green-400">
                    ${product.price}
                  </span>
                </div>
              </ViewTransition>

              {/* Stock */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Stock disponible:</span>
                <span
                  className={`font-semibold ${
                    product.stock > 10
                      ? 'text-green-400'
                      : product.stock > 0
                        ? 'text-yellow-400'
                        : 'text-red-400'
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} unidades` : 'Agotado'}
                </span>
              </div>

              {/* Descripción */}
              {product.description && (
                <div className="border-t border-gray-800 pt-6">
                  <h2 className="text-xl font-semibold mb-3">Descripción</h2>
                  <ViewTransition
                    name={`${vtPrefix}product-description-${product.slug}`}
                    share="morph"
                  >
                    <p className="text-gray-300 leading-relaxed">
                      {product.description}
                    </p>
                  </ViewTransition>
                </div>
              )}

              {/* Keywords */}
              {product.keywords && product.keywords.length > 0 && (
                <div className="border-t border-gray-800 pt-6">
                  <h2 className="text-xl font-semibold mb-3">
                    Características clave
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {product.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="border-t border-gray-800 pt-6 flex gap-4">
                <button
                  disabled={product.stock === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors"
                >
                  {product.stock > 0 ? 'Agregar al carrito' : 'Agotado'}
                </button>
                <button className="bg-gray-800 hover:bg-gray-700 text-white py-4 px-6 rounded-lg font-semibold transition-colors">
                  ❤️
                </button>
              </div>
            </div>
          </div>
        </div>
      </ViewTransition>
    </div>
  )
}
