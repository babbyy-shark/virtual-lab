/**
 * pages/LibraryPage.jsx — Phase 6
 * Pre-built experiment templates + saved experiments
 */
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getExperiments, deleteExperiment } from '../utils/api.js'

const TEMPLATES = [
  {
    id: 'pendulum',
    name: 'Simple Pendulum',
    desc: 'A classic pendulum demonstrating simple harmonic motion and energy conservation.',
    icon: '🔄',
    tags: ['mechanics', 'energy'],
    bodies: [
      { type: 'circle', x: 400, y: 80,  material: 'concrete', isStatic: true },
      { type: 'circle', x: 560, y: 220, material: 'rubber',   isStatic: false },
    ],
    constraints: [{ type: 'rod', bodyAIndex: 0, bodyBIndex: 1, length: 200 }],
    gravity: 1,
  },
  {
    id: 'newtons-cradle',
    name: "Newton's Cradle",
    desc: 'Five steel balls demonstrating conservation of momentum and energy transfer.',
    icon: '⚫',
    tags: ['momentum', 'collision'],
    bodies: [
      // 5 static anchor points at top
      { type: 'circle', x: 250, y: 80, material: 'concrete', isStatic: true },
      { type: 'circle', x: 300, y: 80, material: 'concrete', isStatic: true },
      { type: 'circle', x: 350, y: 80, material: 'concrete', isStatic: true },
      { type: 'circle', x: 400, y: 80, material: 'concrete', isStatic: true },
      { type: 'circle', x: 450, y: 80, material: 'concrete', isStatic: true },
      // 5 hanging steel balls — first one pulled aside to start the swing
      { type: 'circle', x: 110, y: 220, material: 'steel', isStatic: false },
      { type: 'circle', x: 300, y: 240, material: 'steel', isStatic: false },
      { type: 'circle', x: 350, y: 240, material: 'steel', isStatic: false },
      { type: 'circle', x: 400, y: 240, material: 'steel', isStatic: false },
      { type: 'circle', x: 450, y: 240, material: 'steel', isStatic: false },
    ],
    constraints: [
      { type: 'rod', bodyAIndex: 0, bodyBIndex: 5, length: 160 },
      { type: 'rod', bodyAIndex: 1, bodyBIndex: 6, length: 160 },
      { type: 'rod', bodyAIndex: 2, bodyBIndex: 7, length: 160 },
      { type: 'rod', bodyAIndex: 3, bodyBIndex: 8, length: 160 },
      { type: 'rod', bodyAIndex: 4, bodyBIndex: 9, length: 160 },
    ],
    gravity: 1,
  },
  {
    id: 'bridge',
    name: 'Suspension Bridge',
    desc: 'A rope bridge under load — test structural integrity with different materials.',
    icon: '🌉',
    tags: ['structures', 'stress'],
    bodies: [
      // two fixed anchor pillars
      { type: 'circle', x: 150, y: 200, material: 'concrete', isStatic: true },
      { type: 'circle', x: 650, y: 200, material: 'concrete', isStatic: true },
      // three bridge planks hanging below
      { type: 'plank', x: 270, y: 320, material: 'wood', isStatic: false },
      { type: 'plank', x: 400, y: 320, material: 'wood', isStatic: false },
      { type: 'plank', x: 530, y: 320, material: 'wood', isStatic: false },
      // heavy load on the middle plank
      { type: 'box',   x: 400, y: 270, material: 'steel', isStatic: false },
    ],
    constraints: [
      { type: 'rope', bodyAIndex: 0, bodyBIndex: 2, length: 150 },
      { type: 'rope', bodyAIndex: 2, bodyBIndex: 3, length: 140 },
      { type: 'rope', bodyAIndex: 3, bodyBIndex: 4, length: 140 },
      { type: 'rope', bodyAIndex: 4, bodyBIndex: 1, length: 150 },
    ],
    gravity: 1,
  },
  {
    id: 'dominoes',
    name: 'Domino Chain',
    desc: 'A chain of dominos demonstrating kinetic energy cascade.',
    icon: '🁣',
    tags: ['energy', 'chain reaction'],
    bodies: [
      // tall standing dominoes — use wall type which is tall and narrow
      ...Array.from({ length: 10 }, (_, i) => ({
        type: 'wall', x: 160 + i * 70, y: 380,
        material: 'wood', isStatic: false,
      })),
      // a ball to knock the first domino
      { type: 'circle', x: 60, y: 330, material: 'rubber', isStatic: false },
    ],
    constraints: [],
    gravity: 1,
  },
  {
  id: 'ramp',
  name: 'Friction Ramp',
  desc: 'Compare how different materials slide down an inclined plane.',
  icon: '📐',
  tags: ['friction', 'comparison'],
  bodies: [
    { type: 'plank', x: 380, y: 360, material: 'concrete', isStatic: true, angle: -0.4 },
    { type: 'box', x: 280, y: 290, material: 'ice',    isStatic: false },
    { type: 'box', x: 320, y: 250, material: 'rubber', isStatic: false },
    { type: 'box', x: 360, y: 210, material: 'steel',  isStatic: false },
  ],
  constraints: [],
  gravity: 1,
  },
  {
    id: 'spring-mass',
    name: 'Spring Mass System',
    desc: "Classic spring-mass oscillator showing Hooke's Law in action.",
    icon: '〰',
    tags: ['oscillation', 'springs'],
    bodies: [
      { type: 'box', x: 400, y: 80,  material: 'concrete', isStatic: true  },
      { type: 'box', x: 400, y: 320, material: 'steel',    isStatic: false },
    ],
    constraints: [
      { type: 'spring', bodyAIndex: 0, bodyBIndex: 1, length: 240 },
    ],
    gravity: 1,
  },
]

export default function LibraryPage() {
  const [saved,      setSaved]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [activeTab,  setActiveTab]  = useState('templates')
  const navigate = useNavigate()

  useEffect(() => {
    getExperiments()
      .then(data => { setSaved(data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleDeleteSaved(id, e) {
    e.stopPropagation()
    try {
      await deleteExperiment(id)
      setSaved(prev => prev.filter(ex => ex._id !== id))
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  function handleLoadTemplate(template) {
    navigate('/', { state: { template } })
  }

  function handleLoadSaved(id) {
    navigate('/', { state: { loadId: id } })
  }

  const TabBtn = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: '6px 16px', borderRadius: 6, cursor: 'pointer',
        fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 700,
        border: `1px solid ${activeTab === id ? '#00e5a0' : '#2a2a3a'}`,
        background: activeTab === id ? '#00e5a015' : 'transparent',
        color: activeTab === id ? '#00e5a0' : '#8888a0',
        transition: 'all 0.15s',
      }}
    >{label}</button>
  )

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
          EXPERIMENT LIBRARY
        </h1>
        <p style={{ color: '#8888a0', fontSize: 12, marginBottom: 28, lineHeight: 1.6 }}>
          Pre-built physics scenarios and your saved experiments.
          Click any card to load it into the lab.
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <TabBtn id="templates" label={`Templates (${TEMPLATES.length})`} />
          <TabBtn id="saved"     label={`My Experiments (${saved.length})`} />
        </div>

        {/* Templates */}
        {activeTab === 'templates' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {TEMPLATES.map(t => (
              <div
                key={t.id}
                onClick={() => handleLoadTemplate(t)}
                style={{
                  padding: 20, background: '#12121a', border: '1px solid #2a2a3a',
                  borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#00e5a050'
                  e.currentTarget.style.background   = '#12121a'
                  e.currentTarget.style.transform    = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#2a2a3a'
                  e.currentTarget.style.transform   = 'translateY(0)'
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>{t.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#e8e8f0', marginBottom: 6 }}>{t.name}</div>
                <div style={{ fontSize: 10, color: '#8888a0', lineHeight: 1.6, marginBottom: 12 }}>{t.desc}</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {t.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: 8, padding: '2px 6px', borderRadius: 3,
                      background: '#00e5a015', border: '1px solid #00e5a030',
                      color: '#00e5a0', textTransform: 'uppercase', letterSpacing: 1,
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Saved experiments */}
        {activeTab === 'saved' && (
          loading ? (
            <div style={{ color: '#8888a0', fontSize: 12 }}>Loading…</div>
          ) : saved.length === 0 ? (
            <div style={{
              padding: 24, background: '#12121a', border: '1px solid #2a2a3a',
              borderRadius: 12, color: '#8888a0', fontSize: 12, lineHeight: 1.8,
            }}>
              No saved experiments yet.{' '}
              <Link to="/" style={{ color: '#00e5a0' }}>Go to the lab</Link>{' '}
              and save your first scene!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {saved.map(exp => (
                <div
                  key={exp._id}
                  onClick={() => handleLoadSaved(exp._id)}
                  style={{
                    padding: 20, background: '#12121a', border: '1px solid #2a2a3a',
                    borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#4488ff50'
                    e.currentTarget.style.transform   = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#2a2a3a'
                    e.currentTarget.style.transform   = 'translateY(0)'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#e8e8f0', marginBottom: 6 }}>{exp.name}</div>
                  {exp.description && (
                    <div style={{ fontSize: 10, color: '#8888a0', lineHeight: 1.6, marginBottom: 10 }}>{exp.description}</div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <span style={{ fontSize: 9, color: '#55556a' }}>
                      {exp.bodies?.length || 0} bodies · {new Date(exp.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={(e) => handleDeleteSaved(exp._id, e)}
                      style={{
                        fontSize: 9, color: '#ff4466', background: 'transparent',
                        border: '1px solid #ff446630', borderRadius: 4,
                        padding: '2px 8px', cursor: 'pointer',
                        fontFamily: 'JetBrains Mono',
                      }}
                    >Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
