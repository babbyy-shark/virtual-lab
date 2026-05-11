/**
 * components/Toolbar.jsx — Phase 2: adds constraint + motor tools
 */
import { MATERIAL_PRESETS, CONSTRAINT_PRESETS } from '../physics/engine.js'

const SHAPES = [
  { id: 'box',      icon: '□', label: 'Box'      },
  { id: 'circle',   icon: '○', label: 'Circle'   },
  { id: 'triangle', icon: '△', label: 'Triangle' },
  { id: 'plank',    icon: '▬', label: 'Plank'    },
  { id: 'hexagon',  icon: '⬡', label: 'Hexagon'  },
  { id: 'wall',     icon: '▮', label: 'Wall'     },
]

const DIVIDER = (
  <div className="w-4/5 h-px bg-lab-border my-1.5" />
)

function ToolBtn({ active, color, onClick, title, children, small }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={active && color ? { borderColor: color, color, background: color + '22' } : {}}
      className={`flex items-center justify-center rounded border transition-all
        ${small ? 'w-11 h-7 text-[9px] font-bold' : 'w-11 h-11 text-lg'}
        ${active && !color
          ? 'bg-lab-accent/20 border-lab-accent text-lab-accent'
          : !active ? 'border-lab-border text-lab-muted hover:border-lab-muted hover:text-lab-text' : ''
        }`}
    >
      {children}
    </button>
  )
}

export default function Toolbar({
  mode, onMode,
  selectedShape, onShape,
  selectedMaterial, onMaterial,
  selectedConstraint, onConstraint,
  isStatic, onStaticToggle,
}) {
  return (
    <div className="flex flex-col gap-1 p-2 bg-lab-surface border-r border-lab-border w-16 items-center flex-shrink-0 overflow-y-auto">

      {/* Mode toggle */}
      <div className="text-[8px] text-lab-muted uppercase tracking-widest mb-0.5">Mode</div>
      <ToolBtn active={mode === 'place'} onClick={() => onMode('place')} title="Place shapes">
        ✚
      </ToolBtn>
      <ToolBtn active={mode === 'connect'} color="#00e5a0" onClick={() => onMode('connect')} title="Connect bodies">
        🔗
      </ToolBtn>
      <ToolBtn active={mode === 'motor'} color="#ffaa00" onClick={() => onMode('motor')} title="Toggle motor on body">
        ⚙
      </ToolBtn>
      <ToolBtn active={mode === 'delete'} color="#ff4466" onClick={() => onMode('delete')} title="Delete body or constraint">
        ✕
      </ToolBtn>

      {DIVIDER}

      {/* Shapes — only visible in place mode */}
      <div className="text-[8px] text-lab-muted uppercase tracking-widest mb-0.5">Shape</div>
      {SHAPES.map(s => (
        <ToolBtn key={s.id} active={selectedShape === s.id && mode === 'place'}
          onClick={() => { onShape(s.id); onMode('place') }} title={s.label}>
          {s.icon}
        </ToolBtn>
      ))}

      {DIVIDER}

      {/* Constraints — only in connect mode */}
      <div className="text-[8px] text-lab-muted uppercase tracking-widest mb-0.5">Link</div>
      {Object.entries(CONSTRAINT_PRESETS).map(([key, c]) => (
        <ToolBtn key={key} small active={selectedConstraint === key && mode === 'connect'}
          color={c.color}
          onClick={() => { onConstraint(key); onMode('connect') }}
          title={c.label}>
          {c.label.slice(0, 3).toUpperCase()}
        </ToolBtn>
      ))}

      {DIVIDER}

      {/* Materials */}
      <div className="text-[8px] text-lab-muted uppercase tracking-widest mb-0.5">Mat</div>
      {Object.entries(MATERIAL_PRESETS).map(([key, mat]) => (
        <button key={key} onClick={() => onMaterial(key)} title={mat.label}
          style={selectedMaterial === key
            ? { borderColor: mat.color, color: mat.color, background: mat.color + '25' }
            : {}}
          className={`w-11 h-7 rounded flex items-center justify-center text-[9px] font-bold border transition-all
            ${selectedMaterial !== key ? 'border-lab-border text-lab-muted hover:border-lab-muted' : ''}`}>
          {mat.label.slice(0, 3).toUpperCase()}
        </button>
      ))}

      {DIVIDER}

      {/* Static toggle */}
      <button onClick={onStaticToggle}
        title={isStatic ? 'Static (pinned)' : 'Dynamic (free)'}
        className={`w-11 h-8 rounded border text-[10px] font-bold transition-all
          ${isStatic
            ? 'border-lab-warning text-lab-warning bg-yellow-900/30'
            : 'border-lab-border text-lab-muted hover:border-lab-muted'}`}>
        {isStatic ? 'PIN' : 'FRE'}
      </button>
    </div>
  )
}
