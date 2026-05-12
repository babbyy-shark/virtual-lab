/**
 * pages/LibraryPage.jsx — Phase 4: shows real saved experiments from DB
 */
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getExperiments, deleteExperiment } from '../utils/api.js'

export default function LibraryPage() {
  const [experiments, setExperiments] = useState([])
  const [loading,     setLoading]     = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // 🐛 BUG 3: no try/catch — if server down, loading spinner spins forever
    getExperiments().then(data => {
      setExperiments(data || [])
      setLoading(false)
    })
  }, [])

  async function handleDelete(id, e) {
    e.stopPropagation()
    await deleteExperiment(id)
    setExperiments(prev => prev.filter(ex => ex._id !== id))
  }

  return (
    <div className="w-full h-full bg-lab-bg font-mono text-lab-text overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-lab-muted hover:text-lab-accent text-xs mb-6 block">← Back to Lab</Link>
        <h1 className="text-2xl font-bold text-lab-accent tracking-widest mb-1">EXPERIMENT LIBRARY</h1>
        <p className="text-lab-muted text-sm mb-8">Your saved physics experiments. Click any to load it in the lab.</p>

        {loading ? (
          <div className="text-lab-muted text-sm animate-pulse">Loading experiments…</div>
        ) : experiments.length === 0 ? (
          <div className="p-6 bg-lab-surface border border-lab-border rounded-xl text-lab-muted">
            No experiments saved yet.{' '}
            <Link to="/" className="text-lab-accent hover:underline">Go to the lab</Link>{' '}
            and save your first scene!
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {experiments.map(exp => (
              <div key={exp._id}
                onClick={() => navigate('/', { state: { loadId: exp._id } })}
                className="p-4 bg-lab-surface border border-lab-border rounded-xl hover:border-lab-accent/50 transition-all cursor-pointer group"
              >
                <div className="font-bold text-lab-text group-hover:text-lab-accent transition-colors mb-1">
                  {exp.name}
                </div>
                {exp.description && (
                  <div className="text-xs text-lab-muted mb-3 leading-relaxed">{exp.description}</div>
                )}
                <div className="flex items-center justify-between mt-3">
                  <div className="text-[9px] text-lab-muted">
                    {exp.bodies?.length || 0} bodies · {new Date(exp.createdAt).toLocaleDateString()}
                  </div>
                  <button
                    onClick={(e) => handleDelete(exp._id, e)}
                    className="text-[9px] text-lab-danger opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
