import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Post from '@/models/Post'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const posts = await Post.find({ author: params.id })
      .populate('author', 'name image')
      .populate('skill', 'name')
      .sort({ createdAt: -1 })
      .exec()

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching user posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user posts' },
      { status: 500 }
    )
  }
}
