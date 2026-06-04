import { ConversationsProvider } from '@/contexts/conversations-context'
import type { Metadata } from 'next'
import '../styles/globals.css'
import { Header } from '@/components/layout/header'

export const metadata: Metadata = {
  title: 'AI Product Search',
  description: 'Busca productos con inteligencia artificial'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ConversationsProvider>
          <Header />
          {children}
        </ConversationsProvider>
      </body>
    </html>
  )
}
