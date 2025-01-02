import mongoose, { Schema } from 'mongoose'

const PostSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  skill: {
    type: Schema.Types.ObjectId,
    ref: 'Skill',
    required: true,
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
})

// Add index for better query performance
PostSchema.index({ author: 1, createdAt: -1 })
PostSchema.index({ skill: 1 })

// Ensure likes is always an array
PostSchema.pre('save', function(next) {
  if (!this.likes) {
    this.likes = [];
  }
  next();
});

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema)
export default Post
