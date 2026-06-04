'use server'
import { api } from '../lib/api'
import { Product } from '@/interfaces/product.interface'

interface PaginatedProductsResponse {
  success: boolean
  data: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface ProductResponse {
  success: boolean
  data: Product
  message?: string
}

interface PaginatedProductsParams {
  page?: number
  limit?: number
}

interface PaginatedProductsResult {
  products: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function getProducts(
  params: PaginatedProductsParams = {}
): Promise<PaginatedProductsResult> {
  const { page = 1, limit = 9 } = params

  try {
    // Llamar al backend con paginación
    const response = await api.get<PaginatedProductsResponse>(
      `/products?page=${page}&limit=${limit}`
    )

    return {
      products: response.data || [],
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages: response.totalPages
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return {
      products: [],
      total: 0,
      page,
      limit,
      totalPages: 0
    }
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const response = await api.get<ProductResponse>(`/products/slug/${slug}`, {
      cache: 'force-cache'
    })

    if (!response.success || !response.data) {
      return null
    }

    return response.data
  } catch (error) {
    console.error('Error fetching product by slug:', error)
    return null
  }
}
