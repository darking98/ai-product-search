'use client'
import Pagination, { PaginationProps } from '@/ui/common/pagination.ui'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const PaginationWithQuery = ({
  count,
  page,
  limit
}: Omit<PaginationProps, 'handlePage' | 'isPageDisabled'>) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handlePage = (page: number) => {
    const params = new URLSearchParams(searchParams?.toString())
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const isPageDisabled = (value: number) => {
    const params = new URLSearchParams(searchParams?.toString())
    const currentPage = params.get('page')
    return currentPage === value.toString() || (!currentPage && value === 1)
  }
  return (
    <Pagination
      count={count}
      limit={limit}
      page={page}
      handlePage={handlePage}
      isPageDisabled={isPageDisabled}
    />
  )
}

export default PaginationWithQuery
