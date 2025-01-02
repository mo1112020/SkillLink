import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Message from '@/models/Message'
import { connectToDatabase } from '@/lib/mongodb'

export async function DELETE(
  req: NextRequest,
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
    const message = await Message.findById(params.id)

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    // Check if the user is the sender of the message
    if (message.sender.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this message' },
        { status: 403 }
      )
    }

    await message.deleteOne()
    return NextResponse.json({ message: 'Message deleted successfully' })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
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

    const { read } = await req.json()

    await connectToDatabase()
    const message = await Message.findById(params.id)

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    // Check if the user is the receiver of the message
    if (message.receiver.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this message' },
        { status: 403 }
      )
    }

    message.read = read
    await message.save()

    const updatedMessage = await Message.findById(message._id)
      .populate('sender', 'name image')
      .populate('receiver', 'name image')
      .exec()

    return NextResponse.json(updatedMessage)
  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    )
  }
}
