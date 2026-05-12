/**
 * components/SaveLoadPanel.jsx
 * ✅ Bug 2 fixed: using ref as guard instead of state
 * because setState is async — ref is synchronous
 */
import { useState, useEffect, useRef } from 'react'
import { getExperiments, deleteExperiment } from '../utils/api.js'

export default function SaveLoadPanel({ onSave, onLoad, onDelete }) {
  const [experiments, setExperiments] = useState([])
  const [name,        setName]        = useState('')
  const [desc,        setDesc]        = useState('')
  const [saving,      setSaving]      = useState(false)
  const savingRef = useRef(false) // ✅ synchronous guard

  useEffect(() => { fetchList() }, [])

  async function fetchList() {
  try {
    const data = await getExperiments()
    setExperiments(data || [])
  } catch (err) {
    console.error('Could not load experiments:', err.message)
  }
}

  const lastSaveTime = useRef(0)

async function handleSave() {
  if (!name.trim()) return
  const now = Date.now()
  if (now - lastSaveTime.current < 2000) return // block saves within 2 seconds
  lastSaveTime.current = now
  setSaving(true)
  try {
    await onSave(name, desc)
    setName('')
    setDesc('')
    await fetchList()
  } catch (err) {
    console.error('Save error:', err)
  } finally {
    setSaving(false)
  }
}

  async function handleLoad(id) {
    await onLoad(id)
    fetchList()
  }

  async function handleDelete(id) {
    await deleteExperiment(id)
    onDelete && onDelete(id)
    fetchList()
  }

  return (
    <div style={{
      width: 260, background: '#12121a', borderLeft: '1px solid #2a2a3a',
      padding: 14, display: 'flex', flexDirection: 'column', gap: 10,
      fontFamily: 'JetBrains Mono', fontSize: 10, color: '#e8e8f0',
      overflowY: 'auto',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#00e5a0', letterSpacing: 2 }}>
        💾 SAVE / LOAD
      </div>

      <div style={{
        padding: 10, background: '#0a0a0f', borderRadius: 8,
        border: '1px solid #2a2a3a', display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#8888a0', letterSpacing: 2 }}>
          SAVE CURRENT SCENE
        </div>
        <input
          id="exp-name"
          name="exp-name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Experiment name..."
          autoComplete="off"
          style={{
            background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 4,
            color: '#e8e8f0', padding: '5px 8px', fontSize: 10,
            fontFamily: 'JetBrains Mono', outline: 'none', width: '100%',
          }}
        />
        <input
          id="exp-desc"
          name="exp-desc"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Description (optional)..."
          autoComplete="off"
          style={{
            background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 4,
            color: '#e8e8f0', padding: '5px 8px', fontSize: 10,
            fontFamily: 'JetBrains Mono', outline: 'none', width: '100%',
          }}
        />
        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          style={{
            padding: '6px 0',
            background: (name.trim() && !saving) ? '#00e5a020' : 'transparent',
            border: `1px solid ${(name.trim() && !saving) ? '#00e5a0' : '#2a2a3a'}`,
            borderRadius: 4,
            color: (name.trim() && !saving) ? '#00e5a0' : '#55556a',
            cursor: (name.trim() && !saving) ? 'pointer' : 'not-allowed',
            fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 10,
          }}
        >
          {saving ? '⏳ SAVING...' : '💾 SAVE EXPERIMENT'}
        </button>
      </div>

      <div style={{ fontSize: 9, fontWeight: 700, color: '#8888a0', letterSpacing: 2 }}>
        SAVED EXPERIMENTS ({experiments.length})
      </div>

      {experiments.length === 0 ? (
        <div style={{
          padding: 10, background: '#0a0a0f', borderRadius: 8,
          border: '1px solid #2a2a3a', color: '#55556a', lineHeight: 1.6,
        }}>
          No saved experiments yet. Build something and save it!
        </div>
      ) : (
        experiments.map(exp => (
          <div key={exp._id} style={{
            padding: 10, background: '#0a0a0f', borderRadius: 8,
            border: '1px solid #2a2a3a',
          }}>
            <div style={{ fontWeight: 700, color: '#e8e8f0', marginBottom: 3 }}>{exp.name}</div>
            {exp.description && (
              <div style={{ color: '#8888a0', marginBottom: 6, lineHeight: 1.5 }}>{exp.description}</div>
            )}
            <div style={{ color: '#55556a', marginBottom: 8, fontSize: 9 }}>
              {exp.bodies?.length || 0} bodies · {new Date(exp.createdAt).toLocaleDateString()}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => handleLoad(exp._id)} style={{
                flex: 1, padding: '4px 0', background: '#4488ff15',
                border: '1px solid #4488ff', borderRadius: 4,
                color: '#4488ff', cursor: 'pointer',
                fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 700,
              }}>▶ LOAD</button>
              <button onClick={() => handleDelete(exp._id)} style={{
                padding: '4px 8px', background: '#ff446615',
                border: '1px solid #ff4466', borderRadius: 4,
                color: '#ff4466', cursor: 'pointer',
                fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 700,
              }}>✕</button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}