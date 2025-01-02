'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Search, MessageCircle } from 'lucide-react'
import Chat from '@/components/chat'

interface Message {
  _id: string
  sender: {
    _id: string
    name: string
    image: string
  }
  receiver: {
    _id: string
    name: string
    image: string
  }
  content: string
  read: boolean
  createdAt: string
}

interface User {
  _id: string
  name: string
  image: string
  lastMessage?: Message
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Get userId from URL parameters
    const userId = searchParams.get('userId')
    if (userId) {
      setSelectedUser(userId)
    }
  }, [searchParams])

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/messages/conversations')
        if (!response.ok) throw new Error('Failed to fetch conversations')
        const data = await response.json()
        setUsers(data)
      } catch (error) {
        console.error('Error fetching conversations:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchUsers()
    }
  }, [session])

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl mt-10">
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl mt-10">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold mb-4">Messages</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        <div className="divide-y">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user._id)}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedUser === user._id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Image
                    src={user.image || `/api/avatar/${user._id}`}
                    alt={user.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  {user.lastMessage && !user.lastMessage.read && user.lastMessage.receiver._id === session?.user?.id && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold truncate">{user.name}</h3>
                    {user.lastMessage && (
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {formatTimestamp(user.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  {user.lastMessage ? (
                    <p className={`text-sm truncate ${
                      !user.lastMessage.read && user.lastMessage.receiver._id === session?.user?.id
                        ? 'font-semibold text-gray-900'
                        : 'text-gray-500'
                    }`}>
                      {user.lastMessage.sender._id === session?.user?.id && 'You: '}
                      {user.lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">No messages yet</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              {searchQuery ? (
                <div>
                  <p className="mb-2">No conversations found matching "{searchQuery}"</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <MessageCircle className="w-12 h-12 mx-auto text-gray-400" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Start chatting with someone from the explore page!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute inset-x-0 bottom-0 top-16 bg-white rounded-t-xl overflow-hidden shadow-xl">
            <Chat
              recipientId={selectedUser}
              onClose={() => setSelectedUser(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
