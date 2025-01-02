import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Message from '@/models/Message'
import User from '@/models/User'
import { connectToDatabase } from '@/lib/mongodb'
import mongoose from 'mongoose'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    const userId = new mongoose.Types.ObjectId(session.user.id)

    // Get all conversations where the user is either sender or receiver
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { receiver: userId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.sender',
          foreignField: '_id',
          as: 'lastMessage.sender'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.receiver',
          foreignField: '_id',
          as: 'lastMessage.receiver'
        }
      },
      {
        $unwind: '$lastMessage.sender'
      },
      {
        $unwind: '$lastMessage.receiver'
      },
      {
        $project: {
          _id: '$user._id',
          name: '$user.name',
          image: '$user.image',
          email: '$user.email',
          lastMessage: {
            _id: '$lastMessage._id',
            content: '$lastMessage.content',
            read: '$lastMessage.read',
            createdAt: '$lastMessage.createdAt',
            sender: {
              _id: '$lastMessage.sender._id',
              name: '$lastMessage.sender.name',
              image: '$lastMessage.sender.image'
            },
            receiver: {
              _id: '$lastMessage.receiver._id',
              name: '$lastMessage.receiver.name',
              image: '$lastMessage.receiver.image'
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ])

    // If there's a userId in query params, add it to conversations if not already present
    const queryUserId = session.query?.userId
    if (queryUserId && !conversations.some(conv => conv._id.toString() === queryUserId)) {
      const user = await User.findById(queryUserId).select('_id name image email')
      if (user) {
        conversations.push({
          _id: user._id,
          name: user.name,
          image: user.image,
          email: user.email,
        })
      }
    }

    return NextResponse.json(conversations)
  } catch (error) {
    console.error('Error in conversations route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
