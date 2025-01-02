import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: String,
  bio: String,
  skillsToShare: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  skillsToLearn: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
}, {
  timestamps: true,
})

export default mongoose.models.User || mongoose.model('User', UserSchema)
