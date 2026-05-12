/**
 * pages/LabPage.jsx — Phase 4
 */
import { useRef, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import usePhysics from '../hooks/usePhysics.js'
import Toolbar from '../components/Toolbar.jsx'
import ControlBar from '../components/ControlBar.jsx'
import InspectorPanel from '../components/InspectorPanel.jsx'
import AnalyticsDashboard from '../components/AnalyticsDashboard.jsx'
import SaveLoadPanel from '../components/SaveLoadPanel.jsx'
import { CONSTRAINT_PRESETS } from '../physics/engine.js'
import { serializeWorld, deserializeWorld } from '../utils/serializer.js'
import { saveExperiment, getExperiment } from '../utils/api.js'

export default function LabPage() {
  const containerRef = useRef(null)
  const canvasRef    = useRef(null)

  const {
    ready, bodyCount,
    selectedBody, setSelectedBody,
    analyticsData, liveBodies,
    engineRef,
    addBody, removeBody, clearAll,
    addConstraint, removeAllConstraintsForBody,
    toggleMotor,
    getBodyAtPoint,
    setRunning, updateGravity, resetVelocities,
  } = usePhysics(canvasRef, containerRef)

  const [playing,            setPlaying]            = useState(false)
  const [mode,               setMode]               = useState('place')
  const [selectedShape,      setSelectedShape]      = useState('box')
  const [selectedMaterial,   setSelectedMaterial]   = useState('steel')
  const [selectedConstraint, setSelectedConstraint] = useState('spring')
  const [isStatic,           setIsStatic]           = useState(false)
  const [gravity,            setGravity]            = useState(1)
  const [rightPanel,         setRightPanel]         = useState('inspector') // inspector | analytics | saveload
  const [connectingFrom,     setConnectingFrom]     = useState(null)
  const [toast,              setToast]              = useState(null) // { msg, type }

  useEffect(() => { updateGravity(gravity) }, [gravity, updateGravity])
  useEffect(() => { setRunning(playing)    }, [playing, setRunning])
  useEffect(() => { setConnectingFrom(null) }, [mode])

  // Toast helper
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async (name, desc) => {
    if (!engineRef.current) return
    try {
      const worldData = serializeWorld(engineRef.current, gravity)
      const result = await saveExperiment({
        name,
        description: desc,
        gravity,
        ...worldData,
      })
      showToast(`✅ Saved "${name}"`)
      return result
    } catch (err) {
      // 🐛 BUG 1 surfaces here — crash logged but user sees nothing useful
      console.error('Save failed:', err)
      showToast('❌ Save failed — check console', 'error')
    }
  }, [engineRef, gravity])

  // ── Load ──────────────────────────────────────────────────────────────────
  const handleLoad = useCallback(async (id) => {
  if (!engineRef.current) return
  try {
    // ✅ Fetch FIRST before clearing anything
    const exp = await getExperiment(id)
    if (!exp?.bodies) {
      showToast('❌ Experiment has no bodies', 'error')
      return
    }
    // ✅ Now clear synchronously
    clearAll()
    setGravity(exp.gravity || 1)
    // ✅ Wait one tick for Matter.js to process clearAll
    // before adding new bodies
    setTimeout(() => {
      deserializeWorld(exp, addBody, addConstraint)
      showToast(`📂 Loaded "${exp.name}"`)
    }, 50)
  } catch (err) {
    showToast('❌ Load failed — is the server running?', 'error')
  }
}, [engineRef, clearAll, addBody, addConstraint])

  // ── Canvas click ──────────────────────────────────────────────────────────
  const handleCanvasClick = useCallback((e) => {
    if (!ready) return
    const rect = containerRef.current.getBoundingClientRect()
    const pos  = { x: e.clientX - rect.left, y: e.clientY - rect.top }

    if (mode === 'place') {
      const clicked = getBodyAtPoint(pos)
      if (clicked) { setSelectedBody(clicked); return }
      const newBody = addBody(selectedShape, pos.x, pos.y, selectedMaterial,
        isStatic || selectedShape === 'wall')
      if (newBody) setSelectedBody(newBody)
      return
    }
    if (mode === 'connect') {
      const clicked = getBodyAtPoint(pos)
      if (!connectingFrom) {
        if (clicked) { setConnectingFrom(clicked); setSelectedBody(clicked) }
        return
      }
      if (clicked && clicked.id === connectingFrom.id) { setConnectingFrom(null); return }
      if (selectedConstraint === 'pivot') addConstraint('pivot', connectingFrom, null, pos)
      else if (clicked) addConstraint(selectedConstraint, connectingFrom, clicked)
      else addConstraint(selectedConstraint, connectingFrom, null, pos)
      setConnectingFrom(null)
      setSelectedBody(clicked || null)
      return
    }
    if (mode === 'motor') {
      const clicked = getBodyAtPoint(pos)
      if (clicked && !clicked.isStatic) { toggleMotor(clicked); setSelectedBody({ ...clicked }) }
      return
    }
    if (mode === 'delete') {
      const clicked = getBodyAtPoint(pos)
      if (clicked) { removeAllConstraintsForBody(clicked); removeBody(clicked) }
      return
    }
  }, [
    ready, mode, selectedShape, selectedMaterial, isStatic,
    selectedConstraint, connectingFrom,
    addBody, addConstraint, removeBody, removeAllConstraintsForBody,
    toggleMotor, getBodyAtPoint, setSelectedBody,
  ])

  useEffect(() => {
    const handler = (e) => {
      if (document.activeElement?.tagName === 'INPUT') return
      if (e.key === ' ')      { e.preventDefault(); setPlaying(p => !p) }
      if (e.key === 'Escape') { setConnectingFrom(null); setMode('place') }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBody) {
        removeAllConstraintsForBody(selectedBody)
        removeBody(selectedBody)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedBody, removeBody, removeAllConstraintsForBody])

  const cursorStyle = {
    place: 'crosshair', connect: connectingFrom ? 'cell' : 'crosshair',
    motor: 'pointer',   delete: 'not-allowed',
  }[mode] || 'crosshair'

  const connectPreset = CONSTRAINT_PRESETS[selectedConstraint]

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-lab-bg">

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, padding: '8px 20px', borderRadius: 8,
          background: toast.type === 'error' ? '#ff446620' : '#00e5a020',
          border: `1px solid ${toast.type === 'error' ? '#ff4466' : '#00e5a0'}`,
          color: toast.type === 'error' ? '#ff4466' : '#00e5a0',
          fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: 600,
        }}>
          {toast.msg}
        </div>
      )}

      {/* Nav */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-lab-border bg-lab-surface text-xs font-mono">
        <span className="text-lab-accent font-bold text-sm tracking-widest">⚛ VIRTUAL-LAB</span>
        <span className="text-lab-muted">v0.4</span>
        <div className="w-px h-4 bg-lab-border" />
        <Link to="/"          className="text-lab-text  hover:text-lab-accent transition-colors">Lab</Link>
        <Link to="/library"   className="text-lab-muted hover:text-lab-accent transition-colors">Library</Link>
        <Link to="/dashboard" className="text-lab-muted hover:text-lab-accent transition-colors">Dashboard</Link>
        <div className="flex-1" />

        {mode === 'connect' && (
          <div className="flex items-center gap-2 px-3 py-1 rounded border text-[10px]"
            style={{ borderColor: connectPreset.color, color: connectPreset.color, background: connectPreset.color + '15' }}>
            {connectPreset.icon} {connectPreset.label} —
            {connectingFrom ? <span className="font-bold ml-1">Click 2nd body</span> : <span className="ml-1">Click 1st body</span>}
            <button onClick={() => { setMode('place'); setConnectingFrom(null) }} className="ml-2 opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Right panel toggle buttons */}
        {['inspector','analytics','saveload'].map(panel => (
          <button key={panel}
            onClick={() => setRightPanel(p => p === panel ? 'inspector' : panel)}
            className={`px-3 py-1 rounded border text-xs transition-all ${
              rightPanel === panel
                ? panel === 'analytics' ? 'border-lab-info text-lab-info bg-blue-900/30'
                : panel === 'saveload'  ? 'border-lab-accent text-lab-accent bg-emerald-900/30'
                : 'border-lab-border text-lab-text'
                : 'border-lab-border text-lab-muted hover:text-lab-text'
            }`}
          >
            {panel === 'inspector' ? '🔍 Inspector' : panel === 'analytics' ? '📈 Analytics' : '💾 Save/Load'}
          </button>
        ))}

        <span className="text-lab-muted">Bodies: <span className="text-lab-text">{bodyCount}</span></span>
      </div>

      <ControlBar
        playing={playing} onToggle={() => setPlaying(p => !p)}
        onReset={() => { resetVelocities(); setPlaying(false); setConnectingFrom(null) }}
        onClear={clearAll} gravity={gravity} onGravity={setGravity}
      />

      <div className="flex flex-1 overflow-hidden">
        <Toolbar
          mode={mode}                            onMode={setMode}
          selectedShape={selectedShape}           onShape={setSelectedShape}
          selectedMaterial={selectedMaterial}     onMaterial={setSelectedMaterial}
          selectedConstraint={selectedConstraint} onConstraint={setSelectedConstraint}
          isStatic={isStatic}                     onStaticToggle={() => setIsStatic(s => !s)}
        />

        <div ref={containerRef} className="flex-1 relative overflow-hidden"
          style={{ cursor: cursorStyle }} onClick={handleCanvasClick}>
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center text-lab-muted text-sm">
              Initializing physics engine…
            </div>
          )}
          {connectingFrom && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-mono border animate-pulse pointer-events-none"
              style={{ borderColor: connectPreset.color, color: connectPreset.color, background: connectPreset.color + '15' }}>
              {connectPreset.icon} From: <strong>{connectingFrom.label}</strong> — click target
            </div>
          )}
        </div>

        {rightPanel === 'analytics'
          ? <AnalyticsDashboard data={analyticsData} bodies={liveBodies} />
          : rightPanel === 'saveload'
          ? <SaveLoadPanel onSave={handleSave} onLoad={handleLoad} />
          : <InspectorPanel body={selectedBody} onToggleMotor={toggleMotor} />
        }
      </div>
    </div>
  )
}
