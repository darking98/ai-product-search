import { getProductBySlug, getProducts } from '@/actions/products.action'
import { notFound } from 'next/navigation'
import ProductDetailView from '@/views/product/product-detail.view'

export const dynamic = 'force-static'

export async function generateStaticParams() {
  const products = await getProducts({ limit: Number.MAX_SAFE_INTEGER })
  if (products.products.length === 0) return []
  return products.products.map((product) => ({
    productSlug: product.slug
  }))
}

interface PageProps {
  params: Promise<{
    productSlug: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { productSlug } = await params
  const product = await getProductBySlug(productSlug)

  if (!product) {
    notFound()
  }

  return <ProductDetailView product={product} />
}
