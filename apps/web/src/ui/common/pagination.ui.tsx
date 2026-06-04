import { icons } from '@/utils/icons'
export interface PaginationProps {
  page: number
  count: number
  limit: number
  handlePage: (page: number) => void
  isPageDisabled: (page: number) => boolean
}

const RightArrowIcon = icons.arrowRight
const LeftArrowIcon = icons.arrowLeft

const Pagination = ({
  count,
  handlePage,
  isPageDisabled,
  limit,
  page
}: PaginationProps) => {
  const totalPages = Math.ceil(count / limit)

  if (count === 0 || totalPages <= 1) return null

  const getPages = () => {
    const pages: (number | string)[] = []
    const delta = 2 // cantidad de páginas a mostrar alrededor del actual
    const left = Math.max(2, page - delta)
    const right = Math.min(totalPages - 1, page + delta)
    pages.push(1) // siempre mostrar la primera
    if (left > 2) {
      pages.push('ellipsis-left') // marcador para ...
    }
    for (let i = left; i <= right; i++) {
      pages.push(i)
    }
    if (right < totalPages - 1) {
      pages.push('ellipsis-right') // marcador para ...
    }
    if (totalPages > 1) {
      pages.push(totalPages) // siempre mostrar la última
    }
    return pages
  }

  return (
    <div>
      <div className="flex justify-center items-center gap-1 flex-wrap text-xs">
        {/* Prev */}
        <button
          className="rounded-sm flex items-center py-2.5 px-3 duration-300 hover:bg-base-100 hover:ring-1 hover:ring-gray-100/20"
          onClick={() => handlePage(page - 1)}
          disabled={page === 1}
        >
          <LeftArrowIcon className="icon-size" />
        </button>
        {/* Páginas */}
        {getPages().map((p, index) => (
          <button
            key={index}
            className={`py-2 px-4 rounded-sm duration-300 ${page === p ? 'bg-base-100 ring-1 ring-gray-100/20' : 'hover:bg-base-100 hover:ring-1 hover:ring-gray-100/20'}`}
            onClick={() => handlePage(Number(p))}
            disabled={isPageDisabled(Number(p)) || isNaN(Number(p))}
          >
            {typeof p === 'string' ? (
              <span className="text-gray-500">...</span>
            ) : (
              <span>{p}</span>
            )}
          </button>
        ))}

        {/* Next */}
        <button
          disabled={page === totalPages}
          onClick={() => handlePage(page + 1)}
          className="rounded-sm flex items-center py-2.5 px-3 duration-300 hover:bg-base-100 hover:ring-1 hover:ring-gray-100/20"
        >
          <RightArrowIcon className="icon-size" />
        </button>
      </div>
    </div>
  )
}

export default Pagination
