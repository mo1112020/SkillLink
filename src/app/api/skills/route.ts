import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Skill from '@/models/Skill'

export async function GET() {
  try {
    await connectToDatabase()
    const skills = await Skill.find().lean().exec()
    return NextResponse.json(skills)
  } catch (error) {
    console.error('Error fetching skills:', error)
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase()
    const body = await request.json()
    const skill = await Skill.create(body)
    return NextResponse.json(skill)
  } catch (error) {
    console.error('Error creating skill:', error)
    return NextResponse.json(
      { error: 'Failed to create skill' },
      { status: 500 }
    )
  }
}
