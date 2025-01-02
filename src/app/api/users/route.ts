import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'
import Skill from '@/models/Skill'
import mongoose from 'mongoose'

export async function GET() {
  try {
    await connectToDatabase()
    
    const users = await User.find()
      .select('-password')
      .populate({
        path: 'skillsToShare',
        model: Skill,
        select: 'name',
        options: { lean: true }
      })
      .populate({
        path: 'skillsToLearn',
        model: Skill,
        select: 'name',
        options: { lean: true }
      })
      .lean()
      .exec()

    // Ensure skills arrays exist even if empty
    const sanitizedUsers = users.map(user => ({
      ...user,
      skillsToShare: user.skillsToShare || [],
      skillsToLearn: user.skillsToLearn || []
    }))

    return NextResponse.json(sanitizedUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase()
    
    const body = await request.json()
    const user = await User.create(body)
    
    const userWithoutPassword = await User.findById(user._id)
      .select('-password')
      .populate({
        path: 'skillsToShare',
        model: Skill,
        select: 'name',
        options: { lean: true }
      })
      .populate({
        path: 'skillsToLearn',
        model: Skill,
        select: 'name',
        options: { lean: true }
      })
      .lean()

    // Ensure skills arrays exist even if empty
    const sanitizedUser = {
      ...userWithoutPassword,
      skillsToShare: userWithoutPassword?.skillsToShare || [],
      skillsToLearn: userWithoutPassword?.skillsToLearn || []
    }

    return NextResponse.json(sanitizedUser)
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create user' },
      { status: 500 }
    )
  }
}
