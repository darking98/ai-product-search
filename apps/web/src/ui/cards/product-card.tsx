'use client'
import React from 'react'
import { ViewTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Product } from '@/interfaces/product.interface'

interface ProductCardProps {
  product: Product
  context?: string // Optional context to make ViewTransition names unique
}

const ProductCardComponent: React.FC<ProductCardProps> = ({ product, context }) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Construir la URL completa de retorno
  const currentUrl = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname

  // Create unique ViewTransition names with optional context
  const vtPrefix = context ? `${context}-` : ''

  // Build URL with context if provided
  const productUrl = context
    ? `/product/${product.slug}?from=${encodeURIComponent(currentUrl)}&vtContext=${encodeURIComponent(context)}`
    : `/product/${product.slug}?from=${encodeURIComponent(currentUrl)}`

  return (
    <Link
      href={productUrl}
      transitionTypes={['nav-forward']}
      className="block group"
    >
      <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-800/50 hover:border-gray-700/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="relative h-48 bg-gradient-to-br from-gray-900 to-gray-950 overflow-hidden">
          {/* Overlay sutil en hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

          <ViewTransition name={`${vtPrefix}product-${product.slug}`} share="morph">
            <Image
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              width={300}
              height={300}
            />
          </ViewTransition>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <ViewTransition name={`${vtPrefix}product-title-${product.slug}`} share="morph">
              <h3 className="font-bold text-white text-lg line-clamp-2 group-hover:text-blue-300 transition-colors duration-300">
                {product.name}
              </h3>
            </ViewTransition>
            <ViewTransition name={`${vtPrefix}product-price-${product.slug}`} share="morph">
              <span className="text-green-400 font-bold text-xl ml-2 whitespace-nowrap bg-green-400/10 px-2 py-1 rounded-lg">
                ${product.price}
              </span>
            </ViewTransition>
          </div>

          <ViewTransition name={`${vtPrefix}product-description-${product.slug}`} share="morph">
            <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </ViewTransition>

          <div className="flex items-center justify-between mb-4">
            <ViewTransition name={`${vtPrefix}product-brand-${product.slug}`} share="morph">
              <span className="text-xs text-gray-500 font-light">
                Marca: <span className="text-gray-300 font-medium">{product.brand}</span>
              </span>
            </ViewTransition>
            <span className="text-xs text-gray-500">
              Stock:{' '}
              <span
                className={
                  product.stock > 10 ? 'text-green-400 font-semibold' : 'text-yellow-400 font-semibold'
                }
              >
                {product.stock}
              </span>
            </span>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 group-hover:from-blue-500 group-hover:to-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 text-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40">
              Ver Detalles
            </div>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                // Aquí iría la lógica para agregar al carrito
              }}
              className="bg-gray-800 hover:bg-gray-700 text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-110"
            >
              🛒
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Memoizar el componente para evitar re-renders innecesarios
export const ProductCard = React.memo(ProductCardComponent)
