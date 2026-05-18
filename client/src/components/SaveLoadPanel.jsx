import { useState, useEffect } from 'react'
import { getExperiments, deleteExperiment } from '../utils/api.js'

export default function SaveLoadPanel({ onSave, onLoad, onDelete }) {
  const [experiments, setExperiments] = useState([])
  const [name,        setName]        = useState('')
  const [desc,        setDesc]        = useState('')
  const [loading,     setLoading]     = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [busyId,      setBusyId]      = useState(null)
  const [error,       setError]       = useState('')

  useEffect(() => {
    fetchList()
  }, [])

  async function fetchList() {
    setLoading(true)
    setError('')
    try {
      const data = await getExperiments()
      setExperiments(data || [])
    } catch (err) {
      setError(err.message || 'Unable to load experiments')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!name.trim() || saving) return
    setSaving(true)
    setError('')
    try {
      await onSave(name.trim(), desc.trim())
      setName('')
      setDesc('')
      await fetchList()
    } catch (err) {
      setError(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleLoad(id) {
    if (busyId) return
    setBusyId(id)
    setError('')
    try {
      await onLoad(id)
      await fetchList()
    } catch (err) {
      setError(err.message || 'Load failed')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(id) {
    if (busyId) return
    setBusyId(id)
    setError('')
    try {
      await deleteExperiment(id)
      onDelete && onDelete(id)
      await fetchList()
    } catch (err) {
      setError(err.message || 'Delete failed')
    } finally {
      setBusyId(null)
    }
  }

  const canSave = name.trim() && !saving

  return (
    <div style={{
      width: 260, background: '#12121a', borderLeft: '1px solid #2a2a3a',
      padding: 14, display: 'flex', flexDirection: 'column', gap: 10,
      fontFamily: 'JetBrains Mono', fontSize: 10, color: '#e8e8f0',
      overflowY: 'auto',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#00e5a0', letterSpacing: 2 }}>
        SAVE / LOAD
      </div>

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
        <button
          onClick={handleSave}
          disabled={!canSave}
          style={{
            padding: '6px 0', background: canSave ? '#00e5a020' : 'transparent',
            border: `1px solid ${canSave ? '#00e5a0' : '#2a2a3a'}`,
            borderRadius: 4, color: canSave ? '#00e5a0' : '#55556a',
            cursor: canSave ? 'pointer' : 'not-allowed',
            fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 10,
          }}
        >
          {saving ? 'SAVING...' : 'SAVE EXPERIMENT'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: 8, background: '#ff446615', border: '1px solid #ff446650',
          borderRadius: 6, color: '#ff4466', lineHeight: 1.5,
        }}>
          {error}
        </div>
      )}

      <div style={{ fontSize: 9, fontWeight: 700, color: '#8888a0', letterSpacing: 2 }}>
        SAVED EXPERIMENTS ({experiments.length})
      </div>

      {loading ? (
        <div style={{
          padding: 10, background: '#0a0a0f', borderRadius: 8,
          border: '1px solid #2a2a3a', color: '#8888a0',
        }}>
          Loading...
        </div>
      ) : experiments.length === 0 ? (
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
                disabled={!!busyId}
                style={{
                  flex: 1, padding: '4px 0', background: '#4488ff15',
                  border: '1px solid #4488ff', borderRadius: 4,
                  color: '#4488ff', cursor: busyId ? 'not-allowed' : 'pointer',
                  fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 700,
                  opacity: busyId && busyId !== exp._id ? 0.5 : 1,
                }}
              >
                {busyId === exp._id ? '...' : 'LOAD'}
              </button>
              <button
                onClick={() => handleDelete(exp._id)}
                disabled={!!busyId}
                style={{
                  padding: '4px 8px', background: '#ff446615',
                  border: '1px solid #ff4466', borderRadius: 4,
                  color: '#ff4466', cursor: busyId ? 'not-allowed' : 'pointer',
                  fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 700,
                  opacity: busyId && busyId !== exp._id ? 0.5 : 1,
                }}
              >
                X
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
