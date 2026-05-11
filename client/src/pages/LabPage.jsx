/**
 * pages/LabPage.jsx
 * Main Virtual Lab page — canvas + all panels.
 */
import { useRef, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import usePhysics from '../hooks/usePhysics.js'
import Toolbar from '../components/Toolbar.jsx'
import ControlBar from '../components/ControlBar.jsx'
import InspectorPanel from '../components/InspectorPanel.jsx'
import AnalyticsPanel from '../components/AnalyticsPanel.jsx'

export default function LabPage() {
  const containerRef = useRef(null)
  const canvasRef    = useRef(null)

  const {
    ready, bodyCount, selectedBody, analyticsData,
    addBody, removeBody, clearAll, setRunning,
    updateGravity, resetVelocities,
  } = usePhysics(canvasRef, containerRef)

  const [playing,         setPlaying]         = useState(false)
  const [selectedShape,   setSelectedShape]   = useState('box')
  const [selectedMaterial,setSelectedMaterial]= useState('steel')
  const [isStatic,        setIsStatic]        = useState(false)
  const [gravity,         setGravity]         = useState(1)
  const [showAnalytics,   setShowAnalytics]   = useState(false)

  // Sync gravity
  useEffect(() => { updateGravity(gravity) }, [gravity, updateGravity])

  // Sync play state
  useEffect(() => { setRunning(playing) }, [playing, setRunning])

  const handleCanvasClick = useCallback((e) => {
    if (!ready) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    addBody(selectedShape, x, y, selectedMaterial, isStatic || selectedShape === 'wall')
  }, [ready, selectedShape, selectedMaterial, isStatic, addBody])

  const handleReset = () => {
    resetVelocities()
    setPlaying(false)
  }

  const handleTogglePlay = () => setPlaying(p => !p)

  // Delete selected body on key press
  useEffect(() => {
    const handler = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBody) {
        removeBody(selectedBody)
      }
      if (e.key === ' ') {
        e.preventDefault()
        setPlaying(p => !p)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedBody, removeBody])

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-lab-bg">

      {/* Top nav */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-lab-border bg-lab-surface text-xs font-mono">
        <span className="text-lab-accent font-bold text-sm tracking-widest">⚛ VIRTUAL-LAB</span>
        <span className="text-lab-muted">v0.1</span>
        <div className="w-px h-4 bg-lab-border" />
        <Link to="/"         className="text-lab-text hover:text-lab-accent transition-colors">Lab</Link>
        <Link to="/library"  className="text-lab-muted hover:text-lab-accent transition-colors">Library</Link>
        <Link to="/dashboard"className="text-lab-muted hover:text-lab-accent transition-colors">Dashboard</Link>
        <div className="flex-1" />
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
        onToggle={handleTogglePlay}
        onReset={handleReset}
        onClear={clearAll}
        gravity={gravity}
        onGravity={setGravity}
      />

      {/* Main workspace */}
      <div className="flex flex-1 overflow-hidden">

        {/* Shape / material toolbar */}
        <Toolbar
          selectedShape={selectedShape}
          onShape={setSelectedShape}
          selectedMaterial={selectedMaterial}
          onMaterial={setSelectedMaterial}
          isStatic={isStatic}
          onStaticToggle={() => setIsStatic(s => !s)}
        />

        {/* Canvas */}
        <div
          ref={containerRef}
          className="flex-1 relative overflow-hidden cursor-crosshair"
          onClick={handleCanvasClick}
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center text-lab-muted text-sm">
              Initializing physics engine…
            </div>
          )}
        </div>

        {/* Right panel — inspector or analytics */}
        {showAnalytics
          ? <AnalyticsPanel data={analyticsData} />
          : <InspectorPanel body={selectedBody} />
        }
      </div>
    </div>
  )
}
