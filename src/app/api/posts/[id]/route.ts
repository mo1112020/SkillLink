import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Post from '@/models/Post'
import { connectToDatabase } from '@/lib/mongodb'
import { Server } from 'socket.io'

declare global {
  var io: Server | undefined
}

export async function DELETE(
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
      .populate('author', '_id')
      .lean()

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (post.author._id.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only delete your own posts' },
        { status: 403 }
      )
    }

    await Post.findByIdAndDelete(params.id)

    // Emit socket event for real-time update
    if (global.io) {
      global.io.emit('postDeleted', params.id)
    }

    return NextResponse.json({ 
      success: true,
      message: 'Post deleted successfully',
      postId: params.id
    })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const body = await request.json()
    const post = await Post.findById(params.id)
      .populate('author', '_id')
      .lean()

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (post.author._id.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only edit your own posts' },
        { status: 403 }
      )
    }

    const updatedPost = await Post.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true }
    )
      .populate('author', 'name image')
      .populate('skill', 'name')

    // Emit socket event for real-time update
    if (global.io) {
      global.io.emit('postUpdated', updatedPost)
    }

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}
