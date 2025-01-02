'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { UserList } from '@/components/user-list'

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-bold">Explore Users</h1>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm hover:bg-blue-200">
            Web Development
          </button>
          <button className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm hover:bg-green-200">
            Mobile Development
          </button>
          <button className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm hover:bg-purple-200">
            UI/UX Design
          </button>
          <button className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm hover:bg-yellow-200">
            Data Science
          </button>
        </div>

        <UserList searchQuery={searchQuery} />
      </div>
    </div>
  )
}
