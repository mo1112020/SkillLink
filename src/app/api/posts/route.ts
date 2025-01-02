import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Post from '@/models/Post'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    await connectToDatabase()
    const posts = await Post.find()
      .populate('author', 'name image')
      .populate('skill', 'name')
      .populate('likes', '_id')
      .sort({ createdAt: -1 })
      .exec()

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    
    // Handle both JSON and FormData
    let title: string, description: string, skillId: string;
    
    const contentType = req.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const body = await req.json();
      title = body.title;
      description = body.description;
      skillId = body.skillId;
    } else {
      const formData = await req.formData();
      title = formData.get('title') as string;
      description = formData.get('description') as string;
      skillId = formData.get('skillId') as string;
    }

    if (!title || !description || !skillId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const post = await Post.create({
      title,
      description,
      skill: skillId,
      author: session.user.id,
      likes: []
    })

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name image')
      .populate('skill', 'name')
      .lean()

    // Emit socket event for real-time update
    if (global.io) {
      global.io.emit('postCreated', populatedPost)
    }

    return NextResponse.json(populatedPost)
  } catch (error: any) {
    console.error('Error creating post:', error)
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid data provided', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create post', details: error.message },
      { status: 500 }
    )
  }
}
