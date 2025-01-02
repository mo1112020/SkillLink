import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Post from '@/models/Post'
import { connectToDatabase } from '@/lib/mongodb'
import { Server } from 'socket.io'

declare global {
  var io: Server | undefined
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    const post = await Post.findById(params.id)
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    const userId = session.user.id
    const userLikedPost = post.likes.includes(userId)

    if (userLikedPost) {
      post.likes = post.likes.filter((id: string) => id !== userId)
    } else {
      post.likes.push(userId)
    }

    await post.save()

    // Emit socket event for real-time update
    if (global.io) {
      global.io.emit('postLiked', {
        postId: params.id,
        userId: userId,
        likes: post.likes
      })
    }

    return NextResponse.json({
      success: true,
      postId: params.id,
      userId: userId,
      likes: post.likes,
      action: userLikedPost ? 'unlike' : 'like'
    })
  } catch (error) {
    console.error('Error liking post:', error)
    return NextResponse.json(
      { error: 'Failed to like post' },
      { status: 500 }
    )
  }
}
