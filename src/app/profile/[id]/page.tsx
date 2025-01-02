'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { MessageCircle } from 'lucide-react'
import Chat from '@/components/chat'

interface User {
  _id: string
  name: string
  email: string
  image?: string
  bio?: string
  skillsToShare: Array<{
    _id: string
    name: string
  }>
  skillsToLearn: Array<{
    _id: string
    name: string
  }>
}

interface Post {
  _id: string
  title: string
  description: string
  createdAt: string
  author: {
    _id: string
    name: string
    image?: string
  }
  skill: {
    _id: string
    name: string
  }
  likes: string[]
}

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    async function fetchUserData() {
      try {
        const [userRes, postsRes] = await Promise.all([
          fetch(`/api/users/${params.id}`),
          fetch(`/api/users/${params.id}/posts`)
        ])

        if (!userRes.ok) {
          const errorData = await userRes.json()
          throw new Error(errorData.error || 'Failed to fetch user data')
        }

        if (!postsRes.ok) {
          const errorData = await postsRes.json()
          throw new Error(errorData.error || 'Failed to fetch user posts')
        }

        const [userData, postsData] = await Promise.all([
          userRes.json(),
          postsRes.json()
        ])

        setUser(userData)
        setPosts(postsData)
      } catch (error) {
        console.error('Error fetching user data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load user data')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'User not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Image
              src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
              alt={user.name}
              width={100}
              height={100}
              className="rounded-full"
            />
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              {user.bio && <p className="text-gray-600 mt-2">{user.bio}</p>}
            </div>
          </div>
          {session && session.user.id !== params.id && (
            <button
              onClick={() => setShowChat(true)}
              className="text-blue-500 hover:text-blue-700"
            >
              <MessageCircle className="h-6 w-6" />
            </button>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Skills to Share</h2>
            <div className="flex flex-wrap gap-2">
              {user.skillsToShare.length > 0 ? (
                user.skillsToShare.map((skill) => (
                  <span
                    key={skill._id}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {skill.name}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No skills to share listed</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Looking to Learn</h2>
            <div className="flex flex-wrap gap-2">
              {user.skillsToLearn.length > 0 ? (
                user.skillsToLearn.map((skill) => (
                  <span
                    key={skill._id}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {skill.name}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No skills to learn listed</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showChat && session && (
        <Chat
          recipientId={params.id}
          recipientName={user.name}
          onClose={() => setShowChat(false)}
        />
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Posts</h2>
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div key={post._id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-4">{post.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span>{post.likes.length} likes</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No posts yet</p>
        )}
      </div>
    </div>
  )
}
