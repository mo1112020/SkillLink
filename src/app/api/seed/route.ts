import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Skill from '@/models/Skill'

const initialSkills = [
  {
    name: 'Web Development',
    description: 'Building and maintaining websites and web applications',
  },
  {
    name: 'Mobile Development',
    description: 'Creating applications for mobile devices',
  },
  {
    name: 'UI/UX Design',
    description: 'Designing user interfaces and experiences',
  },
  {
    name: 'Data Science',
    description: 'Analyzing and interpreting complex data',
  },
  {
    name: 'Digital Marketing',
    description: 'Promoting products and services through digital channels',
  },
]

export async function GET() {
  try {
    await connectToDatabase()

    // Check if skills already exist
    const existingSkills = await Skill.find()
    if (existingSkills.length > 0) {
      return NextResponse.json({ message: 'Skills already seeded' })
    }

    // Create initial skills
    const skills = await Skill.create(initialSkills)
    return NextResponse.json({ message: 'Database seeded successfully', skills })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    )
  }
}
