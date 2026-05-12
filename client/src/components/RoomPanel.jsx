/**
 * components/RoomPanel.jsx
 * Phase 5 — User list + chat panel
 */
import { useState, useRef, useEffect } from 'react'

function UserBadge({ user, isYou }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '6px 8px', borderRadius: 6,
      background: isYou ? user.color + '15' : 'transparent',
      border: `1px solid ${isYou ? user.color + '40' : 'transparent'}`,
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: user.color, flexShrink: 0,
        boxShadow: `0 0 6px ${user.color}`,
      }} />
      <span style={{ color: isYou ? user.color : '#e8e8f0', fontSize: 10 }}>
        {user.name} {isYou ? '(you)' : ''}
      </span>
    </div>
  )
}

export default function RoomPanel({ roomId, roomState, messages, you, onSendMessage, connected }) {
  const [text,      setText]      = useState('')
  const messagesEnd = useRef(null)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!text.trim()) return
    onSendMessage(text)
    setText('')
  }

  return (
    <div style={{
      width: 240, background: '#12121a', borderLeft: '1px solid #2a2a3a',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'JetBrains Mono', fontSize: 10, color: '#e8e8f0',
    }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #2a2a3a' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#cc44ff', letterSpacing: 2, marginBottom: 4 }}>
          🔗 ROOM
        </div>
        <div style={{
          fontSize: 9, color: connected ? '#00e5a0' : '#ff4466',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: connected ? '#00e5a0' : '#ff4466',
          }} />
          {connected ? 'Connected' : 'Disconnected'}
        </div>
        <div style={{ marginTop: 4, fontSize: 9, color: '#8888a0' }}>
          Room: <span style={{ color: '#e8e8f0' }}>{roomId}</span>
        </div>
      </div>

      {/* Users */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #2a2a3a' }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#8888a0', letterSpacing: 2, marginBottom: 6 }}>
          USERS ({roomState.users.length})
        </div>
        {roomState.users.map(u => (
          <UserBadge key={u.id} user={u} isYou={u.id === you?.id} />
        ))}
      </div>

      {/* Chat messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px' }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#8888a0', letterSpacing: 2, marginBottom: 8 }}>
          CHAT
        </div>
        {messages.length === 0 ? (
          <div style={{ color: '#55556a', lineHeight: 1.6 }}>
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: msg.color }} />
                <span style={{ color: msg.color, fontWeight: 700 }}>{msg.name}</span>
                <span style={{ color: '#55556a', fontSize: 8 }}>
                  {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div style={{ color: '#e8e8f0', paddingLeft: 10, lineHeight: 1.5 }}>{msg.text}</div>
            </div>
          ))
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Chat input */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid #2a2a3a', display: 'flex', gap: 6 }}>
        <input
          id="chat-input"
          name="chat-input"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          autoComplete="off"
          style={{
            flex: 1, background: '#0a0a0f', border: '1px solid #2a2a3a',
            borderRadius: 4, color: '#e8e8f0', padding: '5px 8px',
            fontSize: 10, fontFamily: 'JetBrains Mono', outline: 'none',
          }}
        />
        <button onClick={handleSend} style={{
          padding: '5px 10px', background: '#cc44ff20',
          border: '1px solid #cc44ff', borderRadius: 4,
          color: '#cc44ff', cursor: 'pointer',
          fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 10,
        }}>→</button>
      </div>
    </div>
  )
}
