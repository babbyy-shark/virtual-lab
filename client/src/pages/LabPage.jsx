/**
 * pages/LabPage.jsx — Phase 6 Final
 */
import { useRef, useState, useEffect, useCallback } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import usePhysics from '../hooks/usePhysics.js'
import useSocket  from '../hooks/useSocket.js'
import Toolbar           from '../components/Toolbar.jsx'
import ControlBar        from '../components/ControlBar.jsx'
import InspectorPanel    from '../components/InspectorPanel.jsx'
import AnalyticsDashboard from '../components/AnalyticsDashboard.jsx'
import SaveLoadPanel     from '../components/SaveLoadPanel.jsx'
import RoomPanel         from '../components/RoomPanel.jsx'
import LiveCursors       from '../components/LiveCursors.jsx'
import OnboardingTooltip from '../components/OnboardingTooltip.jsx'
import { CONSTRAINT_PRESETS } from '../physics/engine.js'
import { serializeWorld, deserializeWorld } from '../utils/serializer.js'
import { saveExperiment, getExperiment }    from '../utils/api.js'

export default function LabPage() {
  const containerRef = useRef(null)
  const canvasRef    = useRef(null)
  const { roomId }   = useParams()
  const location     = useLocation()
  const activeRoomId = roomId || 'default'

  const {
    ready, bodyCount,
    selectedBody, setSelectedBody,
    analyticsData, liveBodies,
    engineRef,
    addBody, removeBody, clearAll,
    addConstraint, removeAllConstraintsForBody,
    toggleMotor, getBodyAtPoint,
    setRunning, updateGravity, resetVelocities,
  } = usePhysics(canvasRef, containerRef)

  const {
    connected, roomState, cursors, messages, you,
    onBodyAdded, onBodyRemoved, onClearAll, onRoomBodies,
    joinRoom, emitCursor, emitBodyAdded, emitBodyRemoved,
    emitClearAll, sendMessage,
  } = useSocket()

  const [playing,            setPlaying]            = useState(false)
  const [mode,               setMode]               = useState('place')
  const [selectedShape,      setSelectedShape]      = useState('box')
  const [selectedMaterial,   setSelectedMaterial]   = useState('steel')
  const [selectedConstraint, setSelectedConstraint] = useState('spring')
  const [isStatic,           setIsStatic]           = useState(false)
  const [gravity,            setGravity]            = useState(1)
  const [rightPanel,         setRightPanel]         = useState('inspector')
  const [connectingFrom,     setConnectingFrom]     = useState(null)
  const [toast,              setToast]              = useState(null)
  const [userName]           = useState(() => `User${Math.floor(Math.random() * 1000)}`)

  useEffect(() => { updateGravity(gravity) }, [gravity, updateGravity])
  useEffect(() => { setRunning(playing)    }, [playing, setRunning])
  useEffect(() => { setConnectingFrom(null) }, [mode])

  // Join socket room
  useEffect(() => {
    if (connected) joinRoom(activeRoomId, userName)
  }, [connected, activeRoomId, userName, joinRoom])

  // Register socket → physics callbacks
  useEffect(() => {
    onBodyAdded.current   = (body) => addBody(body.type, body.x, body.y, body.material, body.isStatic)
    onClearAll.current    = () => clearAll()
    onRoomBodies.current  = (bodies) => bodies.forEach(b => addBody(b.type, b.x, b.y, b.material, b.isStatic))
  }, [addBody, clearAll])

  // Load template or saved experiment passed via navigation state
  useEffect(() => {
    if (!ready) return
    const state = location.state
    if (!state) return

    if (state.template) {
      const t = state.template
      clearAll()
      setTimeout(() => {
        deserializeWorld(t, addBody, addConstraint)
        setGravity(t.gravity || 1)
        showToast(`📐 Loaded template: ${t.name}`)
      }, 100)
    } else if (state.loadId) {
      handleLoad(state.loadId)
    }
  }, [ready, location.state])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Mouse move → cursor broadcast ────────────────────────────────────────
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    emitCursor(activeRoomId, e.clientX - rect.left, e.clientY - rect.top)
  }, [activeRoomId, emitCursor])

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
      if (newBody) {
        setSelectedBody(newBody)
        emitBodyAdded(activeRoomId, {
          networkId: newBody.id, type: selectedShape,
          x: pos.x, y: pos.y, material: selectedMaterial,
          isStatic: isStatic || selectedShape === 'wall',
        })
      }
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
      if (clicked) {
        removeAllConstraintsForBody(clicked)
        removeBody(clicked)
        emitBodyRemoved(activeRoomId, clicked.id)
      }
      return
    }
  }, [
    ready, mode, selectedShape, selectedMaterial, isStatic,
    selectedConstraint, connectingFrom, activeRoomId,
    addBody, addConstraint, removeBody, removeAllConstraintsForBody,
    toggleMotor, getBodyAtPoint, setSelectedBody,
    emitBodyAdded, emitBodyRemoved,
  ])

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async (name, desc) => {
    if (!engineRef.current) return
    try {
      const worldData = serializeWorld(engineRef.current, gravity)
      await saveExperiment({ name, description: desc, gravity, ...worldData })
      showToast(`✅ Saved "${name}"`)
    } catch (err) {
      showToast('❌ Save failed — is the server running?', 'error')
    }
  }, [engineRef, gravity])

  // ── Load ──────────────────────────────────────────────────────────────────
  const handleLoad = useCallback(async (id) => {
    if (!engineRef.current) return
    try {
      const exp = await getExperiment(id)
      if (!exp?.bodies) return
      clearAll()
      emitClearAll(activeRoomId)
      setGravity(exp.gravity || 1)
      setTimeout(() => {
        deserializeWorld(exp, addBody, addConstraint)
        showToast(`📂 Loaded "${exp.name}"`)
      }, 50)
    } catch (err) {
      showToast('❌ Load failed — is the server running?', 'error')
    }
  }, [engineRef, clearAll, addBody, addConstraint, activeRoomId, emitClearAll])

  // ── Clear ─────────────────────────────────────────────────────────────────
  const handleClear = useCallback(() => {
    clearAll()
    emitClearAll(activeRoomId)
  }, [clearAll, emitClearAll, activeRoomId])

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (document.activeElement?.tagName === 'INPUT') return
      if (e.key === ' ')      { e.preventDefault(); setPlaying(p => !p) }
      if (e.key === 'Escape') { setConnectingFrom(null); setMode('place') }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBody) {
        removeAllConstraintsForBody(selectedBody)
        removeBody(selectedBody)
        emitBodyRemoved(activeRoomId, selectedBody.id)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedBody, removeBody, removeAllConstraintsForBody, activeRoomId, emitBodyRemoved])

  const cursorStyle = {
    place: 'crosshair', connect: connectingFrom ? 'cell' : 'crosshair',
    motor: 'pointer',   delete: 'not-allowed',
  }[mode] || 'crosshair'

  const connectPreset = CONSTRAINT_PRESETS[selectedConstraint]

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-lab-bg">

      <OnboardingTooltip />

      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, padding: '8px 20px', borderRadius: 8,
          background: toast.type === 'error' ? '#ff446620' : '#00e5a020',
          border: `1px solid ${toast.type === 'error' ? '#ff4466' : '#00e5a0'}`,
          color: toast.type === 'error' ? '#ff4466' : '#00e5a0',
          fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: 600,
          pointerEvents: 'none',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Nav */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-lab-border bg-lab-surface text-xs font-mono">
        <span className="text-lab-accent font-bold text-sm tracking-widest">⚛ VIRTUAL-LAB</span>
        <span className="text-lab-muted">v1.0</span>
        <div className="w-px h-4 bg-lab-border" />
        <Link to="/"           className="text-lab-text  hover:text-lab-accent transition-colors">Lab</Link>
        <Link to="/library"    className="text-lab-muted hover:text-lab-accent transition-colors">Library</Link>
        <Link to="/dashboard"  className="text-lab-muted hover:text-lab-accent transition-colors">Dashboard</Link>

        <div className="flex items-center gap-2 px-3 py-1 rounded border border-lab-border">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-lab-accent' : 'bg-lab-danger'}`} />
          <span className="text-lab-muted">Room:</span>
          <span className="text-lab-text">{activeRoomId}</span>
          <span className="text-lab-muted">·</span>
          <span className="text-lab-text">{roomState.users.length} online</span>
        </div>

        <div className="flex-1" />

        {mode === 'connect' && (
          <div className="flex items-center gap-2 px-3 py-1 rounded border text-[10px]"
            style={{ borderColor: connectPreset.color, color: connectPreset.color, background: connectPreset.color + '15' }}>
            {connectPreset.icon} {connectingFrom
              ? <span className="font-bold">Click 2nd body</span>
              : <span>Click 1st body</span>}
            <button onClick={() => { setMode('place'); setConnectingFrom(null) }} className="ml-1 opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        {['inspector','analytics','saveload','room'].map(panel => (
          <button key={panel}
            onClick={() => setRightPanel(p => p === panel ? 'inspector' : panel)}
            className={`px-3 py-1 rounded border text-xs transition-all ${
              rightPanel === panel
                ? panel === 'analytics' ? 'border-lab-info   text-lab-info   bg-blue-900/30'
                : panel === 'saveload'  ? 'border-lab-accent text-lab-accent bg-emerald-900/30'
                : panel === 'room'      ? 'border-purple-400 text-purple-400 bg-purple-900/30'
                : 'border-lab-border text-lab-text'
                : 'border-lab-border text-lab-muted hover:text-lab-text'
            }`}>
            {panel === 'inspector' ? '🔍 Inspector'
              : panel === 'analytics' ? '📈 Analytics'
              : panel === 'saveload'  ? '💾 Save/Load'
              : `🔗 Room (${roomState.users.length})`}
          </button>
        ))}

        <span className="text-lab-muted">Bodies: <span className="text-lab-text">{bodyCount}</span></span>
      </div>

      <ControlBar
        playing={playing}   onToggle={() => setPlaying(p => !p)}
        onReset={() => { resetVelocities(); setPlaying(false); setConnectingFrom(null) }}
        onClear={handleClear} gravity={gravity} onGravity={setGravity}
        canvasRef={canvasRef}
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
          style={{ cursor: cursorStyle }}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          <LiveCursors cursors={cursors} you={you} />

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
          : rightPanel === 'room'
          ? <RoomPanel
              roomId={activeRoomId} roomState={roomState}
              messages={messages}   you={you} connected={connected}
              onSendMessage={(text) => sendMessage(activeRoomId, text)}
            />
          : <InspectorPanel body={selectedBody} onToggleMotor={toggleMotor} />
        }
      </div>
    </div>
  )
}
