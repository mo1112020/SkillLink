import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'
import Skill from '@/models/Skill'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const user = await User.findById(params.id)
      .populate({
        path: 'skillsToShare',
        model: 'Skill',
        select: 'name'
      })
      .populate({
        path: 'skillsToLearn',
        model: 'Skill',
        select: 'name'
      })
      .select('-password')
      .lean()

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.id !== params.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    
    const body = await request.json()
    const { skillsToShare, skillsToLearn, ...otherData } = body

    // Process skills to share
    const skillsToShareIds = await Promise.all(
      (skillsToShare || []).map(async (skillData: { name: string }) => {
        const skill = await Skill.findOneAndUpdate(
          { name: skillData.name.toLowerCase() },
          { name: skillData.name.toLowerCase() },
          { upsert: true, new: true }
        )
        return skill._id
      })
    )

    // Process skills to learn
    const skillsToLearnIds = await Promise.all(
      (skillsToLearn || []).map(async (skillData: { name: string }) => {
        const skill = await Skill.findOneAndUpdate(
          { name: skillData.name.toLowerCase() },
          { name: skillData.name.toLowerCase() },
          { upsert: true, new: true }
        )
        return skill._id
      })
    )

    // Update user with processed skills
    const user = await User.findByIdAndUpdate(
      params.id,
      {
        $set: {
          ...otherData,
          skillsToShare: skillsToShareIds,
          skillsToLearn: skillsToLearnIds,
        }
      },
      { new: true }
    )
      .populate({
        path: 'skillsToShare',
        model: 'Skill',
        select: 'name'
      })
      .populate({
        path: 'skillsToLearn',
        model: 'Skill',
        select: 'name'
      })
      .select('-password')
      .lean()

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.id !== params.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    
    const user = await User.findByIdAndDelete(params.id)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
