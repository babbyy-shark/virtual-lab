import { useRef, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import usePhysics from '../hooks/usePhysics.js'
import Toolbar from '../components/Toolbar.jsx'
import ControlBar from '../components/ControlBar.jsx'
import InspectorPanel from '../components/InspectorPanel.jsx'
import AnalyticsDashboard from '../components/AnalyticsDashboard.jsx'
import { CONSTRAINT_PRESETS } from '../physics/engine.js'

export default function LabPage() {
  const containerRef = useRef(null)
  const canvasRef    = useRef(null)

  const {
    ready, bodyCount,
    selectedBody, setSelectedBody,
    analyticsData, liveBodies,
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
  const [showAnalytics,      setShowAnalytics]      = useState(false)
  const [connectingFrom,     setConnectingFrom]     = useState(null)

  useEffect(() => { updateGravity(gravity) }, [gravity, updateGravity])
  useEffect(() => { setRunning(playing)    }, [playing, setRunning])
  useEffect(() => { setConnectingFrom(null) }, [mode])

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
      if (selectedConstraint === 'pivot') {
        addConstraint('pivot', connectingFrom, null, pos)
      } else if (clicked) {
        addConstraint(selectedConstraint, connectingFrom, clicked)
      } else {
        addConstraint(selectedConstraint, connectingFrom, null, pos)
      }
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

      {/* Nav */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-lab-border bg-lab-surface text-xs font-mono">
        <span className="text-lab-accent font-bold text-sm tracking-widest">⚛ VIRTUAL-LAB</span>
        <span className="text-lab-muted">v0.3</span>
        <div className="w-px h-4 bg-lab-border" />
        <Link to="/"          className="text-lab-text  hover:text-lab-accent transition-colors">Lab</Link>
        <Link to="/library"   className="text-lab-muted hover:text-lab-accent transition-colors">Library</Link>
        <Link to="/dashboard" className="text-lab-muted hover:text-lab-accent transition-colors">Dashboard</Link>
        <div className="flex-1" />

        {mode === 'connect' && (
          <div className="flex items-center gap-2 px-3 py-1 rounded border text-[10px]"
            style={{ borderColor: connectPreset.color, color: connectPreset.color, background: connectPreset.color + '15' }}>
            {connectPreset.icon} {connectPreset.label} —
            {connectingFrom
              ? <span className="font-bold ml-1">Click 2nd body or point</span>
              : <span className="ml-1">Click 1st body</span>}
            <button onClick={() => { setMode('place'); setConnectingFrom(null) }}
              className="ml-2 opacity-60 hover:opacity-100">✕</button>
          </div>
        )}
        {mode === 'motor' && (
          <div className="flex items-center gap-2 px-3 py-1 rounded border text-[10px] border-lab-warning text-lab-warning bg-yellow-900/20">
            ⚙ Motor — click body to toggle
            <button onClick={() => setMode('place')} className="ml-2 opacity-60 hover:opacity-100">✕</button>
          </div>
        )}
        {mode === 'delete' && (
          <div className="flex items-center gap-2 px-3 py-1 rounded border text-[10px] border-lab-danger text-lab-danger bg-red-900/20">
            ✕ Delete — click body to remove
            <button onClick={() => setMode('place')} className="ml-2 opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        <button
          onClick={() => setShowAnalytics(a => !a)}
          className={`px-3 py-1 rounded border text-xs transition-all ${
            showAnalytics
              ? 'border-lab-info text-lab-info bg-blue-900/30'
              : 'border-lab-border text-lab-muted hover:border-lab-info hover:text-lab-info'
          }`}
        >
          📈 Analytics
        </button>
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

        <div
          ref={containerRef}
          className="flex-1 relative overflow-hidden"
          style={{ cursor: cursorStyle }}
          onClick={handleCanvasClick}
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center text-lab-muted text-sm">
              Initializing physics engine…
            </div>
          )}
          {connectingFrom && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-mono border animate-pulse pointer-events-none"
              style={{ borderColor: connectPreset.color, color: connectPreset.color, background: connectPreset.color + '15' }}>
              {connectPreset.icon} Connected from: <strong>{connectingFrom.label}</strong> — click target
            </div>
          )}
        </div>

        {showAnalytics
          ? <AnalyticsDashboard data={analyticsData} bodies={liveBodies} />
          : <InspectorPanel body={selectedBody} onToggleMotor={toggleMotor} />
        }
      </div>
    </div>
  )
}
