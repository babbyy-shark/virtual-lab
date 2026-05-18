import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import mongoose from 'mongoose'

import experimentRoutes from './routes/experiments.js'
import roomSocket from './sockets/roomSocket.js'

const app        = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', methods: ['GET', 'POST'] },
})
roomSocket(io)

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (_, res) => res.json({ status: 'ok', version: '1.0.0' }))
app.use('/api/experiments', experimentRoutes)

const PORT      = process.env.PORT     || 5000
const MONGO_URI = process.env.MONGO_URI|| 'mongodb://localhost:27017/virtuallab'

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
  })
  .catch(err => {
    console.warn('MongoDB not connected (offline mode):', err.message)
    httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT} (no DB)`))
  })
