import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Message from '@/models/Message'
import { connectToDatabase } from '@/lib/mongodb'
import mongoose from 'mongoose'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const recipientId = searchParams.get('recipientId')

    if (!recipientId) {
      return NextResponse.json(
        { error: 'Recipient ID is required' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const userId = new mongoose.Types.ObjectId(session.user.id)
    const recipientObjectId = new mongoose.Types.ObjectId(recipientId)

    // Mark messages as read
    await Message.updateMany(
      {
        sender: recipientObjectId,
        receiver: userId,
        read: false
      },
      {
        $set: { read: true }
      }
    )

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: recipientObjectId },
        { sender: recipientObjectId, receiver: userId }
      ]
    })
      .populate('sender', 'name image')
      .populate('receiver', 'name image')
      .sort({ createdAt: 1 })
      .exec()

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
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

    const { content, receiverId } = await req.json()

    if (!content || !receiverId) {
      return NextResponse.json(
        { error: 'Content and receiver ID are required' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const userId = new mongoose.Types.ObjectId(session.user.id)
    const recipientObjectId = new mongoose.Types.ObjectId(receiverId)

    const message = await Message.create({
      content,
      sender: userId,
      receiver: recipientObjectId,
    })

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name image')
      .populate('receiver', 'name image')
      .exec()

    return NextResponse.json(populatedMessage)
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}
