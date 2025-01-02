import mongoose from 'mongoose'

const SkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  teachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  learners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
}, {
  timestamps: true,
})

export default mongoose.models.Skill || mongoose.model('Skill', SkillSchema)
