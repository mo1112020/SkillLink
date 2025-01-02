'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { LogOut, Search, MessageCircle, Settings } from 'lucide-react'

export function Navbar() {
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !session) return null

  return (
    <nav className="fixed mb-10  bottom-0 left-0 right-0 md:top-0 md:bottom-auto bg-white border-t md:border-b border-gray-200 z-40">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo (hidden on mobile) */}
          <Link href="/" className="hidden md:flex items-center space-x-2">
            <Image src="/images/logoo.png" alt="Logo" width={104} height={104} />
          </Link>

          {/* Center - Navigation Links */}
          <div className="flex items-center justify-around md:justify-center w-full md:w-auto space-x-1 md:space-x-4">
            <button
              onClick={() => signOut()}
              className="p-2 text-gray-700 hover:text-blue-500 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-6 h-6" />
            </button>

            <Link
              href="/explore"
              className="p-2 text-gray-700 hover:text-blue-500 transition-colors"
              title="Explore"
            >
              <Search className="w-6 h-6" />
            </Link>

            <Link
              href="/posts"
              className="p-2 text-gray-700 hover:text-blue-500 transition-colors"
              title="Posts"
            >
              <svg 
                className="w-6 h-6"
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
            </Link>

            <Link
              href="/messages"
              className="p-2 text-gray-700 hover:text-blue-500 transition-colors"
              title="Messages"
            >
              <MessageCircle className="w-6 h-6" />
            </Link>

            <Link
              href="/settings"
              className="p-2 text-gray-700 hover:text-blue-500 transition-colors"
              title="Settings"
            >
              <Settings className="w-6 h-6" />
            </Link>
          </div>

          {/* Right side spacer (hidden on mobile) */}
          <div className="hidden md:block w-[88px]"></div>
        </div>
      </div>
    </nav>
  )
}
