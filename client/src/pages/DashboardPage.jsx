/**
 * pages/DashboardPage.jsx — Phase 6
 * Project overview, room management, stats
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getExperiments } from '../utils/api.js'

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{
      padding: 20, background: '#12121a', border: `1px solid ${color}30`,
      borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ fontSize: 24 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 10, color: '#8888a0', textTransform: 'uppercase', letterSpacing: 2 }}>{label}</div>
    </div>
  )
}

const PHASE_ROADMAP = [
  { phase: 1, label: 'Physics Canvas',         desc: 'Matter.js engine, drag & drop shapes, materials',  done: true  },
  { phase: 2, label: 'Constraints',             desc: 'Springs, ropes, rods, pivots, motors',            done: true  },
  { phase: 3, label: 'Analytics Dashboard',     desc: 'Live energy charts, force vectors, body stats',   done: true  },
  { phase: 4, label: 'Save & Load',             desc: 'MongoDB persistence, experiment library',         done: true  },
  { phase: 5, label: 'Multi-user Collaboration',desc: 'Socket.io real-time sync, live cursors, chat',    done: true  },
  { phase: 6, label: 'Library & Polish',        desc: 'Templates, FPS counter, export, onboarding',      done: true  },
]

export default function DashboardPage() {
  const [experiments, setExperiments] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [roomInput,   setRoomInput]   = useState('')

  useEffect(() => {
    getExperiments()
      .then(data => { setExperiments(data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{
      width: '100%', height: '100%', background: '#0a0a0f',
      fontFamily: 'JetBrains Mono', color: '#e8e8f0',
      overflowY: 'auto', padding: '32px',
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        <Link to="/" style={{ color: '#8888a0', fontSize: 11, textDecoration: 'none', display: 'block', marginBottom: 24 }}>
          ← Back to Lab
        </Link>

        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#00e5a0', letterSpacing: 3, marginBottom: 6 }}>
          DASHBOARD
        </h1>
        <p style={{ color: '#8888a0', fontSize: 12, marginBottom: 32, lineHeight: 1.6 }}>
          Project overview, room management, and development roadmap.
        </p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          <StatCard icon="💾" label="Saved Experiments" value={loading ? '…' : experiments.length} color="#00e5a0" />
          <StatCard icon="⚛"  label="Physics Phases"    value="6/6"   color="#4488ff" />
          <StatCard icon="🔗" label="Real-time"         value="Live"  color="#cc44ff" />
          <StatCard icon="🗄" label="Database"          value="MongoDB" color="#ffaa00" />
        </div>

        {/* Join / Create Room */}
        <div style={{
          padding: 24, background: '#12121a', border: '1px solid #2a2a3a',
          borderRadius: 12, marginBottom: 32,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#cc44ff', letterSpacing: 2, marginBottom: 16 }}>
            🔗 ROOMS
          </div>
          <div style={{ fontSize: 11, color: '#8888a0', marginBottom: 16, lineHeight: 1.6 }}>
            Share a room link with collaborators to work together in real time.
            Each room is identified by its unique ID in the URL.
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              id="room-input"
              name="room-input"
              value={roomInput}
              onChange={e => setRoomInput(e.target.value.replace(/\s/g, '-').toLowerCase())}
              placeholder="Enter room name (e.g. physics-101)"
              autoComplete="off"
              style={{
                flex: 1, background: '#0a0a0f', border: '1px solid #2a2a3a',
                borderRadius: 6, color: '#e8e8f0', padding: '8px 12px',
                fontSize: 11, fontFamily: 'JetBrains Mono', outline: 'none',
              }}
            />
            <Link
              to={`/room/${roomInput || 'default'}`}
              style={{
                padding: '8px 20px', background: '#cc44ff20',
                border: '1px solid #cc44ff', borderRadius: 6,
                color: '#cc44ff', textDecoration: 'none',
                fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap',
              }}
            >
              Join / Create →
            </Link>
          </div>
          <div style={{ marginTop: 10, fontSize: 9, color: '#55556a' }}>
            URL will be: localhost:5173/room/{roomInput || 'default'}
          </div>
        </div>

        {/* Roadmap */}
        <div style={{
          padding: 24, background: '#12121a', border: '1px solid #2a2a3a',
          borderRadius: 12,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#e8e8f0', letterSpacing: 2, marginBottom: 20 }}>
            📋 DEVELOPMENT ROADMAP
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {PHASE_ROADMAP.map(p => (
              <div key={p.phase} style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                padding: 14, borderRadius: 8,
                background: p.done ? '#00e5a008' : '#0a0a0f',
                border: `1px solid ${p.done ? '#00e5a025' : '#1a1a2a'}`,
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: p.done ? '#00e5a020' : '#1a1a2a',
                  border: `1px solid ${p.done ? '#00e5a0' : '#2a2a3a'}`,
                  fontSize: 10, fontWeight: 700,
                  color: p.done ? '#00e5a0' : '#55556a',
                }}>
                  {p.done ? '✓' : p.phase}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12, color: p.done ? '#e8e8f0' : '#55556a', marginBottom: 3 }}>
                    Phase {p.phase} — {p.label}
                  </div>
                  <div style={{ fontSize: 10, color: '#8888a0' }}>{p.desc}</div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: 9, color: p.done ? '#00e5a0' : '#55556a', flexShrink: 0 }}>
                  {p.done ? '✅ DONE' : '🔄 PLANNED'}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
