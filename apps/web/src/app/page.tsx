import IndexPage from '@/views/index/index.page'
import { getProducts } from '@/actions/products.action'

interface PageProps {
  searchParams?: Promise<{
    page?: string
  }>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const page = params?.page ? parseInt(params.page) : 1
  const limit = 12
  const { products, total } = await getProducts({
    page,
    limit
  })

  return (
    <IndexPage
      products={products}
      currentPage={page}
      total={total}
      limit={limit}
    />
  )
}
