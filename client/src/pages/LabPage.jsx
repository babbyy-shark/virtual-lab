/**
 * pages/LabPage.jsx — Phase 2: constraint two-click workflow, motor, delete modes
 */
import { useRef, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import usePhysics from '../hooks/usePhysics.js'
import Toolbar from '../components/Toolbar.jsx'
import ControlBar from '../components/ControlBar.jsx'
import InspectorPanel from '../components/InspectorPanel.jsx'
import AnalyticsPanel from '../components/AnalyticsPanel.jsx'
import { CONSTRAINT_PRESETS } from '../physics/engine.js'

export default function LabPage() {
  const containerRef = useRef(null)
  const canvasRef    = useRef(null)

  const {
    ready, bodyCount,
    selectedBody, setSelectedBody,
    analyticsData,
    addBody, removeBody, clearAll,
    addConstraint, removeAllConstraintsForBody,
    toggleMotor,
    getBodyAtPoint,
    setRunning, updateGravity, resetVelocities,
  } = usePhysics(canvasRef, containerRef)

  // ── UI state ──────────────────────────────────────────────────────────────
  const [playing,           setPlaying]           = useState(false)
  const [mode,              setMode]              = useState('place')   // place | connect | motor | delete
  const [selectedShape,     setSelectedShape]     = useState('box')
  const [selectedMaterial,  setSelectedMaterial]  = useState('steel')
  const [selectedConstraint,setSelectedConstraint]= useState('spring')
  const [isStatic,          setIsStatic]          = useState(false)
  const [gravity,           setGravity]           = useState(1)
  const [showAnalytics,     setShowAnalytics]     = useState(false)

  // Connect-mode: tracks which body was clicked first
  const [connectingFrom, setConnectingFrom] = useState(null)

  // Sync gravity
  useEffect(() => { updateGravity(gravity) }, [gravity, updateGravity])
  // Sync play
  useEffect(() => { setRunning(playing)    }, [playing, setRunning])
  // Clear connect state when switching modes
  useEffect(() => { setConnectingFrom(null) }, [mode])

  // ── Canvas click handler ──────────────────────────────────────────────────
  const handleCanvasClick = useCallback((e) => {
    if (!ready) return
    const rect = containerRef.current.getBoundingClientRect()
    const pos  = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }

    // ── PLACE MODE ──────────────────────────────────────────────────────────
    if (mode === 'place') {
      const clicked = getBodyAtPoint(pos)
      if (clicked) {
        setSelectedBody(clicked)
        return
      }
      const newBody = addBody(selectedShape, pos.x, pos.y, selectedMaterial,
        isStatic || selectedShape === 'wall')
      if (newBody) setSelectedBody(newBody)
      return
    }

    // ── CONNECT MODE ────────────────────────────────────────────────────────
    if (mode === 'connect') {
      const clicked = getBodyAtPoint(pos)

      if (!connectingFrom) {
        // First click — select source body (or fixed point for pivot)
        if (clicked) {
          setConnectingFrom(clicked)
          setSelectedBody(clicked)
        }
        return
      }

      // Second click — create constraint
      if (clicked && clicked.id === connectingFrom.id) {
        // Clicked same body — cancel
        setConnectingFrom(null)
        return
      }

      if (selectedConstraint === 'pivot') {
        // Pivot: body → fixed point in space (second click position)
        addConstraint('pivot', connectingFrom, null, pos)
      } else if (clicked) {
        // Body → Body
        addConstraint(selectedConstraint, connectingFrom, clicked)
      } else {
        // Body → fixed point
        addConstraint(selectedConstraint, connectingFrom, null, pos)
      }
      setConnectingFrom(null)
      setSelectedBody(clicked || null)
      return
    }

    // ── MOTOR MODE ──────────────────────────────────────────────────────────
    if (mode === 'motor') {
      const clicked = getBodyAtPoint(pos)
      if (clicked && !clicked.isStatic) {
        toggleMotor(clicked)
        setSelectedBody({ ...clicked })
      }
      return
    }

    // ── DELETE MODE ─────────────────────────────────────────────────────────
    if (mode === 'delete') {
      const clicked = getBodyAtPoint(pos)
      if (clicked) {
        removeAllConstraintsForBody(clicked)
        removeBody(clicked)
      }
      return
    }
  }, [
    ready, mode, selectedShape, selectedMaterial, isStatic,
    selectedConstraint, connectingFrom,
    addBody, addConstraint, removeBody, removeAllConstraintsForBody,
    toggleMotor, getBodyAtPoint, setSelectedBody,
  ])

  const handleReset = () => {
    resetVelocities()
    setPlaying(false)
    setConnectingFrom(null)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (document.activeElement?.tagName === 'INPUT') return
      if (e.key === ' ')         { e.preventDefault(); setPlaying(p => !p) }
      if (e.key === 'Escape')    { setConnectingFrom(null); setMode('place') }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBody) {
        removeAllConstraintsForBody(selectedBody)
        removeBody(selectedBody)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedBody, removeBody, removeAllConstraintsForBody])

  // ── Cursor style ──────────────────────────────────────────────────────────
  const cursorStyle = {
    place:   'crosshair',
    connect: connectingFrom ? 'cell' : 'crosshair',
    motor:   'pointer',
    delete:  'not-allowed',
  }[mode] || 'crosshair'

  const connectPreset = CONSTRAINT_PRESETS[selectedConstraint]

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-lab-bg">

      {/* Top nav */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-lab-border bg-lab-surface text-xs font-mono">
        <span className="text-lab-accent font-bold text-sm tracking-widest">⚛ VIRTUAL-LAB</span>
        <span className="text-lab-muted">v0.2</span>
        <div className="w-px h-4 bg-lab-border" />
        <Link to="/"          className="text-lab-text   hover:text-lab-accent transition-colors">Lab</Link>
        <Link to="/library"   className="text-lab-muted  hover:text-lab-accent transition-colors">Library</Link>
        <Link to="/dashboard" className="text-lab-muted  hover:text-lab-accent transition-colors">Dashboard</Link>
        <div className="flex-1" />

        {/* Connect mode status banner */}
        {mode === 'connect' && (
          <div className="flex items-center gap-2 px-3 py-1 rounded border text-[10px]"
            style={{ borderColor: connectPreset.color, color: connectPreset.color, background: connectPreset.color + '15' }}>
            {connectPreset.icon} {connectPreset.label} —
            {connectingFrom
              ? <span className="font-bold ml-1">Click 2nd body or point</span>
              : <span className="ml-1">Click 1st body</span>
            }
            <button onClick={() => { setMode('place'); setConnectingFrom(null) }}
              className="ml-2 opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        {mode === 'motor' && (
          <div className="flex items-center gap-2 px-3 py-1 rounded border text-[10px] border-lab-warning text-lab-warning bg-yellow-900/20">
            ⚙ Motor — click a body to toggle spin
            <button onClick={() => setMode('place')} className="ml-2 opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        {mode === 'delete' && (
          <div className="flex items-center gap-2 px-3 py-1 rounded border text-[10px] border-lab-danger text-lab-danger bg-red-900/20">
            ✕ Delete — click a body to remove
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

      {/* Control bar */}
      <ControlBar
        playing={playing}
        onToggle={() => setPlaying(p => !p)}
        onReset={handleReset}
        onClear={clearAll}
        gravity={gravity}
        onGravity={setGravity}
      />

      {/* Workspace */}
      <div className="flex flex-1 overflow-hidden">
        <Toolbar
          mode={mode}                         onMode={setMode}
          selectedShape={selectedShape}        onShape={setSelectedShape}
          selectedMaterial={selectedMaterial}  onMaterial={setSelectedMaterial}
          selectedConstraint={selectedConstraint} onConstraint={setSelectedConstraint}
          isStatic={isStatic}                  onStaticToggle={() => setIsStatic(s => !s)}
        />

        {/* Canvas */}
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

          {/* Visual indicator for connecting-from body */}
          {connectingFrom && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-mono border animate-pulse pointer-events-none"
              style={{ borderColor: connectPreset.color, color: connectPreset.color, background: connectPreset.color + '15' }}>
              {connectPreset.icon} Connected from: <strong>{connectingFrom.label}</strong> — now click target
            </div>
          )}
        </div>

        {/* Right panel */}
        {showAnalytics
          ? <AnalyticsPanel data={analyticsData} />
          : <InspectorPanel body={selectedBody} onToggleMotor={toggleMotor} />
        }
      </div>
    </div>
  )
}
