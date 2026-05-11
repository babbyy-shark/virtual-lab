/**
 * routes/experiments.js
 */
import { Router } from 'express'
import Experiment from '../models/Experiment.js'

const router = Router()

// GET all public experiments
router.get('/', async (req, res) => {
  try {
    const experiments = await Experiment.find({ isPublic: true }).sort({ createdAt: -1 }).limit(50)
    res.json(experiments)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET one experiment
router.get('/:id', async (req, res) => {
  try {
    const exp = await Experiment.findById(req.params.id)
    if (!exp) return res.status(404).json({ error: 'Not found' })
    res.json(exp)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create experiment
router.post('/', async (req, res) => {
  try {
    const exp = await Experiment.create(req.body)
    res.status(201).json(exp)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE experiment
router.delete('/:id', async (req, res) => {
  try {
    await Experiment.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
