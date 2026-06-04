import { useEffect, useRef } from 'react'

export const useScrollBottom = (dependencies: React.DependencyList) => {
  const elementRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    elementRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [dependencies])

  return { elementRef }
}
