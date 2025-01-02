'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface Skill {
  _id: string
  name: string
}

interface User {
  _id: string
  name: string
  email: string
  image?: string
  bio?: string
  skillsToShare: Skill[]
  skillsToLearn: Skill[]
}

interface UserListProps {
  searchQuery?: string
}

export function UserList({ searchQuery = '' }: UserListProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users')
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch users')
        }
        const data = await response.json()
        // Filter out the current user
        const filteredUsers = data.filter((user: User) => user._id !== session?.user?.id)
        setUsers(filteredUsers)
      } catch (error) {
        console.error('Error:', error)
        setError(error instanceof Error ? error.message : 'Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [session?.user?.id])

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    const nameMatch = user.name.toLowerCase().includes(query)
    const skillsMatch = [
      ...(user.skillsToShare || []),
      ...(user.skillsToLearn || [])
    ].some(skill => skill.name.toLowerCase().includes(query))
    
    return nameMatch || skillsMatch
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  if (filteredUsers.length === 0) {
    return (
      <div className="text-gray-500 text-center p-4">
        {searchQuery ? 'No users found matching your search' : 'No users found'}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredUsers.map((user) => (
        <div key={user._id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button 
                onClick={() => router.push(`/profile/${user._id}`)}
                className="focus:outline-none"
              >
                <Image
                  src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  width={48}
                  height={48}
                  className="rounded-full mr-4 hover:opacity-80 transition-opacity"
                />
              </button>
              <div>
                <button 
                  onClick={() => router.push(`/profile/${user._id}`)}
                  className="font-semibold text-lg hover:text-blue-500 transition-colors focus:outline-none"
                >
                  {user.name}
                </button>
              </div>
            </div>
            {session && session.user.id !== user._id && (
              <button
                onClick={() => router.push(`/messages?userId=${user._id}`)}
                className="text-blue-500 hover:text-blue-700 ml-4"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Skills to Share</h4>
              <div className="flex flex-wrap gap-2">
                {user.skillsToShare.length > 0 ? (
                  user.skillsToShare.map((skill) => (
                    <span
                      key={`${user._id}-share-${skill._id}`}
                      className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                    >
                      {skill.name}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No skills to share listed</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Looking to Learn</h4>
              <div className="flex flex-wrap gap-2">
                {user.skillsToLearn.length > 0 ? (
                  user.skillsToLearn.map((skill) => (
                    <span
                      key={`${user._id}-learn-${skill._id}`}
                      className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800"
                    >
                      {skill.name}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No skills to learn listed</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
