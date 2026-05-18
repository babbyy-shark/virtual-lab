import { Router } from 'express'
import mongoose from 'mongoose'
import Experiment from '../models/Experiment.js'

const router = Router()

router.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database unavailable' })
  }
  next()
})

router.get('/', async (req, res) => {
  try {
    const experiments = await Experiment.find({ isPublic: true }).sort({ createdAt: -1 }).limit(50)
    res.json(experiments)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid experiment id' })
    }
    const exp = await Experiment.findById(req.params.id)
    if (!exp) return res.status(404).json({ error: 'Not found' })
    res.json(exp)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const exp = await Experiment.create(req.body)
    res.status(201).json(exp)
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'An experiment with that name already exists' })
    res.status(400).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid experiment id' })
    }
    const exp = await Experiment.findByIdAndDelete(req.params.id)
    if (!exp) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
