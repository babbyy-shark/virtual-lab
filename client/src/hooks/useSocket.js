/**
 * hooks/useSocket.js
 * Phase 5 — Socket.io connection + room event management
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'

export default function useSocket() {
  const socketRef = useRef(null)

  const [connected,  setConnected]  = useState(false)
  const [roomState,  setRoomState]  = useState({ users: [], bodyCount: 0 })
  const [cursors,    setCursors]    = useState({})
  const [messages,   setMessages]   = useState([])
  const [you,        setYou]        = useState(null)

  const onBodyAdded   = useRef(null)
  const onBodyRemoved = useRef(null)
  const onBodyMoved   = useRef(null)
  const onClearAll    = useRef(null)
  const onRoomBodies  = useRef(null)

  useEffect(() => {
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    socket.on('connect',    () => { setConnected(true);  console.log('✅ Socket connected') })
    socket.on('disconnect', () => { setConnected(false); setCursors({}) })

    socket.on('room-joined', ({ you, state, bodies }) => {
      setYou(you)
      setRoomState(state)
      if (onRoomBodies.current && bodies?.length > 0) {
        onRoomBodies.current(bodies)
      }
    })

    socket.on('room-state', setRoomState)

    socket.on('user-joined', (user) => {
      console.log(`👤 ${user.name} joined`)
    })

    socket.on('user-left', ({ id }) => {
      setCursors(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    })

    socket.on('cursor-move', ({ id, x, y }) => {
      setCursors(prev => ({
        ...prev,
        [id]: { ...prev[id], x, y },
      }))
    })

    socket.on('room-state', (state) => {
      setRoomState(state)
      // Merge user info into cursors for name/color display
      setCursors(prev => {
        const next = { ...prev }
        state.users.forEach(u => {
          if (next[u.id]) next[u.id] = { ...next[u.id], name: u.name, color: u.color }
          else next[u.id] = { x: 0, y: 0, name: u.name, color: u.color }
        })
        return next
      })
    })

    socket.on('body-added',   ({ body })       => onBodyAdded.current?.(body))
    socket.on('body-removed', ({ networkId })  => onBodyRemoved.current?.(networkId))
    socket.on('body-moved',   (data)           => onBodyMoved.current?.(data))
    socket.on('clear-all',    ()               => onClearAll.current?.())

    socket.on('chat-message', (msg) => {
      setMessages(prev => [...prev.slice(-100), msg])
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  // ── Actions ──────────────────────────────────────────────────────────────

  const joinRoom = useCallback((roomId, userName) => {
    socketRef.current?.emit('join-room', { roomId, userName })
  }, [])

  // Throttled cursor emit — max 20/sec
  const lastCursorEmit = useRef(0)
  const emitCursor = useCallback((roomId, x, y) => {
    const now = Date.now()
    if (now - lastCursorEmit.current < 50) return
    lastCursorEmit.current = now
    socketRef.current?.emit('cursor-move', { roomId, x, y })
  }, [])

  const emitBodyAdded = useCallback((roomId, body) => {
    socketRef.current?.emit('body-added', { roomId, body })
  }, [])

  const emitBodyRemoved = useCallback((roomId, networkId) => {
    socketRef.current?.emit('body-removed', { roomId, networkId })
  }, [])

  const emitBodyMoved = useCallback((roomId, networkId, x, y, angle) => {
    socketRef.current?.emit('body-moved', { roomId, networkId, x, y, angle })
  }, [])

  const emitClearAll = useCallback((roomId) => {
    socketRef.current?.emit('clear-all', { roomId })
  }, [])

  const sendMessage = useCallback((roomId, text) => {
    socketRef.current?.emit('chat-message', { roomId, text })
  }, [])

  return {
    connected, roomState, cursors, messages, you,
    // Register callbacks
    onBodyAdded, onBodyRemoved, onBodyMoved, onClearAll, onRoomBodies,
    // Emit actions
    joinRoom, emitCursor, emitBodyAdded, emitBodyRemoved,
    emitBodyMoved, emitClearAll, sendMessage,
  }
}
