/**
 * server/sockets/roomSocket.js
 * Phase 5 — Multi-user room management
 */

const rooms = new Map()

const USER_COLORS = [
  '#00e5a0', '#ff4466', '#4488ff', '#ffaa00',
  '#cc44ff', '#ff8800', '#00ccff', '#ff44cc',
]

function getRoomState(roomId) {
  const room = rooms.get(roomId)
  if (!room) return { users: [], bodyCount: 0, constraintCount: 0 }
  return {
    users:     Array.from(room.users.values()),
    bodyCount: room.bodies.size,
    constraintCount: room.constraints?.size || 0,
  }
}

function cleanupRoom(roomId) {
  if ((rooms.get(roomId)?.users?.size || 0) === 0) {
    rooms.delete(roomId)
    console.log(`🗑️  Room ${roomId} cleaned up`)
  }
}

export default function roomSocket(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Connected: ${socket.id}`)
    let currentRoom = null

    socket.on('join-room', ({ roomId, userName }) => {
      if (currentRoom) {
        socket.leave(currentRoom)
        const room = rooms.get(currentRoom)
        if (room) {
          room.users.delete(socket.id)
          socket.to(currentRoom).emit('user-left', { id: socket.id })
          io.to(currentRoom).emit('room-state', getRoomState(currentRoom))
          cleanupRoom(currentRoom)
        }
      }

      currentRoom = roomId

      if (!rooms.has(roomId)) {
        rooms.set(roomId, { users: new Map(), bodies: new Map(), constraints: new Map() })
      }

      const room  = rooms.get(roomId)
      const color = USER_COLORS[room.users.size % USER_COLORS.length]
      const user  = {
        id:     socket.id,
        name:   userName || `User${Math.floor(Math.random() * 1000)}`,
        color,
        cursor: { x: 0, y: 0 },
      }

      room.users.set(socket.id, user)
      socket.join(roomId)

      socket.emit('room-joined', {
        you:    user,
        state:  getRoomState(roomId),
        bodies: Array.from(room.bodies.values()),
        constraints: Array.from(room.constraints.values()),
      })

      socket.to(roomId).emit('user-joined', user)
      io.to(roomId).emit('room-state', getRoomState(roomId))

      console.log(`👤 ${user.name} joined room ${roomId} (${room.users.size} users)`)
    })

    socket.on('cursor-move', ({ roomId, x, y }) => {
      const room = rooms.get(roomId)
      if (!room) return
      const user = room.users.get(socket.id)
      if (user) user.cursor = { x, y }
      socket.to(roomId).emit('cursor-move', { id: socket.id, x, y })
    })

    socket.on('body-added', ({ roomId, body }) => {
      const room = rooms.get(roomId)
      if (!room) return
      if (!body.networkId) body.networkId = `${socket.id}-${Date.now()}`
      room.bodies.set(body.networkId, body)
      socket.to(roomId).emit('body-added', { body, senderId: socket.id })
      io.to(roomId).emit('room-state', getRoomState(roomId))
    })

    socket.on('body-removed', ({ roomId, networkId }) => {
      const room = rooms.get(roomId)
      if (!room) return
      room.bodies.delete(networkId)
      for (const [id, constraint] of room.constraints.entries()) {
        if (constraint.bodyANetworkId === networkId || constraint.bodyBNetworkId === networkId) {
          room.constraints.delete(id)
        }
      }
      socket.to(roomId).emit('body-removed', { networkId })
      io.to(roomId).emit('room-state', getRoomState(roomId))
    })

    socket.on('body-moved', ({ roomId, networkId, x, y, angle }) => {
      const room = rooms.get(roomId)
      const body = room?.bodies.get(networkId)
      if (body) {
        body.x = x
        body.y = y
        body.angle = angle
      }
      socket.to(roomId).emit('body-moved', { networkId, x, y, angle })
    })

    socket.on('constraint-added', ({ roomId, constraint }) => {
      const room = rooms.get(roomId)
      if (!room) return
      if (!constraint.networkId) constraint.networkId = `${socket.id}-constraint-${Date.now()}`
      room.constraints.set(constraint.networkId, constraint)
      socket.to(roomId).emit('constraint-added', { constraint, senderId: socket.id })
      io.to(roomId).emit('room-state', getRoomState(roomId))
    })

    socket.on('chat-message', ({ roomId, text }) => {
      const room = rooms.get(roomId)
      if (!room) return
      const user = room.users.get(socket.id)
      if (!user || !text?.trim()) return
      io.to(roomId).emit('chat-message', {
        id: Date.now(), userId: socket.id,
        name: user.name, color: user.color,
        text: text.trim(), ts: Date.now(),
      })
    })

    socket.on('clear-all', ({ roomId }) => {
      const room = rooms.get(roomId)
      if (!room) return
      room.bodies.clear()
      room.constraints.clear()
      socket.to(roomId).emit('clear-all')
      io.to(roomId).emit('room-state', getRoomState(roomId))
    })

    socket.on('disconnect', () => {
      if (!currentRoom) return
      const room = rooms.get(currentRoom)
      if (room) {
        room.users.delete(socket.id)
        socket.to(currentRoom).emit('user-left', { id: socket.id })
        io.to(currentRoom).emit('room-state', getRoomState(currentRoom))
        cleanupRoom(currentRoom)
      }
      console.log(`🔌 Disconnected: ${socket.id}`)
    })
  })
}
