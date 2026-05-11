/**
 * sockets/roomSocket.js
 * Multi-user room management — Phase 5
 * Right now: connects users, broadcasts cursor positions and body deltas.
 */

const rooms = new Map() // roomId → Set of socket ids

export default function roomSocket(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`)

    // Join a room
    socket.on('join-room', (roomId) => {
      socket.join(roomId)
      if (!rooms.has(roomId)) rooms.set(roomId, new Set())
      rooms.get(roomId).add(socket.id)
      io.to(roomId).emit('room-update', { users: rooms.get(roomId).size })
      console.log(`  → ${socket.id} joined room ${roomId}`)
    })

    // Body state delta broadcast
    socket.on('physics-delta', ({ roomId, bodies }) => {
      socket.to(roomId).emit('physics-delta', { senderId: socket.id, bodies })
    })

    // Cursor position
    socket.on('cursor', ({ roomId, x, y }) => {
      socket.to(roomId).emit('cursor', { id: socket.id, x, y })
    })

    // Chat message (Phase 6)
    socket.on('chat', ({ roomId, text, author }) => {
      io.to(roomId).emit('chat', { author, text, ts: Date.now() })
    })

    socket.on('disconnect', () => {
      rooms.forEach((members, roomId) => {
        if (members.delete(socket.id)) {
          io.to(roomId).emit('room-update', { users: members.size })
        }
      })
      console.log(`🔌 Client disconnected: ${socket.id}`)
    })
  })
}
