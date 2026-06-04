import type { Metadata } from 'next'
import { IndexLayout } from '@/views/index/index.layout'

export const metadata: Metadata = {
  title: 'AI Product Search - Chat',
  description: 'Busca productos con inteligencia artificial'
}

export default function ChatLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return <IndexLayout>{children}</IndexLayout>
}