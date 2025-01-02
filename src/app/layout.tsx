import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { Navbar } from '@/components/navbar'
import dynamic from 'next/dynamic'
import { Toaster } from 'react-hot-toast'
import type { Metadata } from 'next'

// Dynamically import CallHandler with no SSR
const CallHandler = dynamic(() => import('@/components/call-handler'), {
  ssr: false,
})

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Skillshare Platform',
  description: 'Connect, learn, and share skills with others',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="min-h-screen pb-24">
            {children}
          </main>
          <CallHandler />
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  )
}
