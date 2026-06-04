'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Header() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-8">
          {/* Inicio */}
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              isActive('/')
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Inicio
          </Link>

          {/* Logo Shopcito */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">🤖</span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Shopcito
            </h1>
          </Link>

          {/* Chats */}
          <Link
            href="/chat"
            className={`text-sm font-medium transition-colors ${
              isActive('/chat')
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Chats
          </Link>
        </div>
      </div>
    </header>
  )
}
