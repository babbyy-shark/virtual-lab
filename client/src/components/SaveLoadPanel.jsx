/**
 * components/SaveLoadPanel.jsx
 * Phase 4 — Save & Load experiments
 *
 * 🐛 BUG 2: No loading/saving state tracked.
 * If user clicks Save twice quickly:
 * - Two POST requests fire simultaneously
 * - DB gets two identical experiments
 * Fix: disable button while request is in flight
 */
import { useState, useEffect } from 'react'
import { getExperiments, saveExperiment, deleteExperiment } from '../utils/api.js'

export default function SaveLoadPanel({ onSave, onLoad, onDelete }) {
  const [experiments, setExperiments] = useState([])
  const [name,        setName]        = useState('')
  const [desc,        setDesc]        = useState('')
  // 🐛 BUG 2: No `saving` or `loading` boolean state here
  // So button is never disabled during the request

  // Load list on mount
  useEffect(() => {
    fetchList()
  }, [])

  async function fetchList() {
    // 🐛 BUG 3: No try/catch — silent failure if server is down
    const data = await getExperiments()
    setExperiments(data || [])
  }

  async function handleSave() {
    if (!name.trim()) return
    // 🐛 BUG 2: No guard here — clicking Save twice fires 2 requests
    // 🐛 BUG 3: No try/catch
    await onSave(name, desc)
    setName('')
    setDesc('')
    fetchList() // refresh list
  }

  async function handleLoad(id) {
    // 🐛 BUG 4: Race condition — we call onLoad immediately
    // but onLoad calls clearAll + addBody in sequence.
    // If clearAll hasn't finished processing before addBody runs,
    // old bodies can remain and new ones stack on top.
    // Fix: await clearAll properly or add a small defer.
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

      {/* Save form */}
      <div style={{
        padding: 10, background: '#0a0a0f', borderRadius: 8,
        border: '1px solid #2a2a3a', display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#8888a0', letterSpacing: 2 }}>
          SAVE CURRENT SCENE
        </div>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Experiment name..."
          style={{
            background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 4,
            color: '#e8e8f0', padding: '5px 8px', fontSize: 10,
            fontFamily: 'JetBrains Mono', outline: 'none', width: '100%',
          }}
        />
        <input
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Description (optional)..."
          style={{
            background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 4,
            color: '#e8e8f0', padding: '5px 8px', fontSize: 10,
            fontFamily: 'JetBrains Mono', outline: 'none', width: '100%',
          }}
        />
        {/* 🐛 BUG 2: button is never disabled — double-click = duplicate saves */}
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          style={{
            padding: '6px 0', background: name.trim() ? '#00e5a020' : 'transparent',
            border: `1px solid ${name.trim() ? '#00e5a0' : '#2a2a3a'}`,
            borderRadius: 4, color: name.trim() ? '#00e5a0' : '#55556a',
            cursor: name.trim() ? 'pointer' : 'not-allowed',
            fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 10,
          }}
        >
          💾 SAVE EXPERIMENT
        </button>
      </div>

      {/* Saved experiments list */}
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
              <button
                onClick={() => handleLoad(exp._id)}
                style={{
                  flex: 1, padding: '4px 0', background: '#4488ff15',
                  border: '1px solid #4488ff', borderRadius: 4,
                  color: '#4488ff', cursor: 'pointer',
                  fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 700,
                }}
              >
                ▶ LOAD
              </button>
              <button
                onClick={() => handleDelete(exp._id)}
                style={{
                  padding: '4px 8px', background: '#ff446615',
                  border: '1px solid #ff4466', borderRadius: 4,
                  color: '#ff4466', cursor: 'pointer',
                  fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 700,
                }}
              >
                ✕
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
