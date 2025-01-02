import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Post from '@/models/Post'
import { connectToDatabase } from '@/lib/mongodb'
import { Server } from 'socket.io'
import mongoose from 'mongoose'

declare global {
  var io: Server | undefined
}

interface PostDocument {
  _id: mongoose.Types.ObjectId;
  author: {
    _id: mongoose.Types.ObjectId;
  };
  title: string;
  description: string;
  skill: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
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
      .lean() as PostDocument | null

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

    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Error deleting post' },
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

    const body = await request.json()
    const { title, description, skill } = body

    if (!title || !description || !skill) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const post = await Post.findById(params.id)
      .populate('author', '_id')
      .lean() as PostDocument | null

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
      { title, description, skill },
      { new: true }
    )
      .populate('author', '_id name image')
      .populate('skill', '_id name')
      .lean()

    // Emit socket event for real-time update
    if (global.io) {
      global.io.emit('postUpdated', updatedPost)
    }

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Error updating post' },
      { status: 500 }
    )
  }
}
