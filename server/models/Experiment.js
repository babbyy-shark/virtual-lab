import mongoose from 'mongoose'

const bodySchema = new mongoose.Schema({
  type:     { type: String, required: true },
  material: { type: String, default: 'steel' },
  x:        { type: Number, required: true },
  y:        { type: Number, required: true },
  angle:    { type: Number, default: 0 },
  isStatic: { type: Boolean, default: false },
})

const experimentSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  author:      { type: String, default: 'anonymous' },
  bodies:      [bodySchema],
  constraints: { type: Array, default: [] },
  gravity:     { type: Number, default: 1 },
  tags:        [String],
  isPublic:    { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Experiment', experimentSchema)
