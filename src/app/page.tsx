'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { FeaturedSkills } from '@/components/featured-skills'
import { Hero } from '@/components/hero'
import { RecentPosts } from '@/components/recent-posts'

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <div className="text-center space-y-6 py-12">
        <h1 className="text-4xl font-bold">
          Share Your Skills, Learn from Others
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Connect with people who want to learn what you know, and learn from those who have the skills you want to acquire.
        </p>
        <div className="flex justify-center gap-4">
          {session ? (
            <>
              <Link href="/posts/create" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
                Start Teaching
              </Link>
              <Link href="/posts" className="bg-white border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-md hover:bg-blue-50 transition-colors">
                Start Learning
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
                Sign In to Start
              </Link>
              <Link href="/auth/signup" className="bg-white border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-md hover:bg-blue-50 transition-colors">
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full" />
              <div>
                <h3 className="font-semibold">Example User {i + 1}</h3>
                <p className="text-sm text-gray-500">Skills: React, Node.js</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Looking to share knowledge in web development and learn mobile app development.
            </p>
            <div className="flex gap-2">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Web Dev</span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Mobile Dev</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
