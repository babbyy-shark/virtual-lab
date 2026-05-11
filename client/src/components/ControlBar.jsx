/**
 * components/ControlBar.jsx
 */
export default function ControlBar({ playing, onToggle, onReset, onClear, gravity, onGravity }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-lab-surface border-b border-lab-border font-mono text-xs">

      <button
        onClick={onToggle}
        className={`px-4 py-1.5 rounded border font-bold tracking-wider transition-all ${
          playing
            ? 'border-lab-danger text-lab-danger bg-red-900/30 hover:bg-red-900/50'
            : 'border-lab-accent text-lab-accent bg-emerald-900/30 hover:bg-emerald-900/50'
        }`}
      >
        {playing ? '⏸ PAUSE' : '▶ PLAY'}
      </button>

      <button
        onClick={onReset}
        className="px-3 py-1.5 rounded border border-lab-border text-lab-muted hover:text-lab-text hover:border-lab-muted transition-all"
      >
        ↺ RESET
      </button>

      <button
        onClick={onClear}
        className="px-3 py-1.5 rounded border border-lab-border text-lab-muted hover:text-lab-danger hover:border-lab-danger transition-all"
      >
        ✕ CLEAR
      </button>

      <div className="w-px h-5 bg-lab-border mx-1" />

      <span className="text-lab-muted">Gravity:</span>
      <input
        type="range" min="0" max="3" step="0.05" value={gravity}
        onChange={e => onGravity(+e.target.value)}
        className="w-24"
      />
      <span className="text-lab-text w-8">{gravity.toFixed(2)}</span>

      <div className="flex-1" />

      <span className="text-lab-muted text-[10px]">SPACE=play/pause · DEL=remove · Click=place</span>
    </div>
  )
}
