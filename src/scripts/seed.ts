import { faker } from '@faker-js/faker'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import User from '../models/User'
import Skill from '../models/Skill'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// List of predefined skills
const SKILLS = [
  'JavaScript',
  'Python',
  'React',
  'Node.js',
  'TypeScript',
  'GraphQL',
  'MongoDB',
  'SQL',
  'AWS',
  'Docker',
  'Kubernetes',
  'Machine Learning',
  'Data Science',
  'UI/UX Design',
  'Digital Marketing',
  'Content Writing',
  'Photography',
  'Video Editing',
  'Project Management',
  'Public Speaking'
]

interface SkillDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  teachers: mongoose.Types.ObjectId[];
  learners: mongoose.Types.ObjectId[];
}

async function seed() {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined')
    }
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Clear existing data
    await User.deleteMany({})
    await Skill.deleteMany({})

    // Create skills
    const skillDocs: SkillDocument[] = await Promise.all(
      SKILLS.map(skillName => 
        Skill.create({
          name: skillName,
          description: faker.lorem.sentence()
        })
      )
    )

    console.log('Created skills')

    // Create 20 users
    const users = []
    const password = await bcrypt.hash('12341234', 10)

    for (let i = 0; i < 20; i++) {
      // Randomly select 2-3 skills to share
      const skillsToShare: SkillDocument[] = faker.helpers.arrayElements(
        skillDocs,
        faker.number.int({ min: 2, max: 3 })
      )

      // Randomly select 2-3 different skills to learn
      const remainingSkills = skillDocs.filter(
        (skill: SkillDocument) => !skillsToShare.includes(skill)
      )
      const skillsToLearn: SkillDocument[] = faker.helpers.arrayElements(
        remainingSkills,
        faker.number.int({ min: 2, max: 3 })
      )

      const user = await User.create({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password,
        image: faker.image.avatar(),
        bio: faker.lorem.paragraph(),
        skillsToShare: skillsToShare.map((skill: SkillDocument) => skill._id),
        skillsToLearn: skillsToLearn.map((skill: SkillDocument) => skill._id)
      })

      // Update skills with the user reference
      await Promise.all([
        ...skillsToShare.map((skill: SkillDocument) =>
          Skill.findByIdAndUpdate(skill._id, {
            $push: { teachers: user._id }
          })
        ),
        ...skillsToLearn.map((skill: SkillDocument) =>
          Skill.findByIdAndUpdate(skill._id, {
            $push: { learners: user._id }
          })
        )
      ])

      users.push(user)
      console.log(`Created user ${i + 1}/20`)
    }

    console.log('Database seeded successfully')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

seed()
