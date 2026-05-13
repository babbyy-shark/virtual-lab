/**
 * components/ControlBar.jsx — Phase 6
 * Added FPS counter and screenshot export
 */
import { useState, useEffect, useRef } from 'react'

function FPSCounter() {
  const [fps, setFps] = useState(0)
  const frames = useRef(0)
  const last   = useRef(performance.now())

  useEffect(() => {
    let animId
    const loop = () => {
      frames.current++
      const now  = performance.now()
      const diff = now - last.current
      if (diff >= 500) {
        setFps(Math.round((frames.current / diff) * 1000))
        frames.current = 0
        last.current   = now
      }
      animId = requestAnimationFrame(loop)
    }
    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [])

  const color = fps >= 55 ? '#00e5a0' : fps >= 30 ? '#ffaa00' : '#ff4466'
  return (
    <span style={{ color, fontSize: 10, fontFamily: 'JetBrains Mono' }}>
      {fps} FPS
    </span>
  )
}

export default function ControlBar({
  playing, onToggle, onReset, onClear,
  gravity, onGravity, canvasRef,
}) {
  const handleScreenshot = () => {
    if (!canvasRef?.current) return
    const link = document.createElement('a')
    link.download = `virtual-lab-${Date.now()}.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-lab-surface border-b border-lab-border font-mono text-xs">

      <button onClick={onToggle}
        className={`px-4 py-1.5 rounded border font-bold tracking-wider transition-all ${
          playing
            ? 'border-lab-danger  text-lab-danger  bg-red-900/30  hover:bg-red-900/50'
            : 'border-lab-accent  text-lab-accent  bg-emerald-900/30 hover:bg-emerald-900/50'
        }`}>
        {playing ? '⏸ PAUSE' : '▶ PLAY'}
      </button>

      <button onClick={onReset}
        className="px-3 py-1.5 rounded border border-lab-border text-lab-muted hover:text-lab-text hover:border-lab-muted transition-all">
        ↺ RESET
      </button>

      <button onClick={onClear}
        className="px-3 py-1.5 rounded border border-lab-border text-lab-muted hover:text-lab-danger hover:border-lab-danger transition-all">
        ✕ CLEAR
      </button>

      <button onClick={handleScreenshot}
        className="px-3 py-1.5 rounded border border-lab-border text-lab-muted hover:text-lab-info hover:border-lab-info transition-all"
        title="Export as PNG">
        📷 Export
      </button>

      <div className="w-px h-5 bg-lab-border mx-1" />

      <span className="text-lab-muted">Gravity:</span>
      <input type="range" min="0" max="3" step="0.05" value={gravity}
        onChange={e => onGravity(+e.target.value)} className="w-24" />
      <span className="text-lab-text w-8">{gravity.toFixed(2)}</span>

      <div className="flex-1" />

      <FPSCounter />
      <div className="w-px h-4 bg-lab-border mx-1" />
      <span className="text-lab-muted text-[10px]">SPACE=play · DEL=remove · Click=place · ESC=cancel</span>
    </div>
  )
}
