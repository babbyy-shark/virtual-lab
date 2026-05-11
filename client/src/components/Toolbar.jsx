/**
 * components/Toolbar.jsx
 */
import { MATERIAL_PRESETS } from '../physics/engine.js'

const SHAPES = [
  { id: 'box',      icon: '□', label: 'Box'      },
  { id: 'circle',   icon: '○', label: 'Circle'   },
  { id: 'triangle', icon: '△', label: 'Triangle' },
  { id: 'plank',    icon: '▬', label: 'Plank'    },
  { id: 'hexagon',  icon: '⬡', label: 'Hexagon'  },
  { id: 'wall',     icon: '▮', label: 'Wall'     },
]

export default function Toolbar({ selectedShape, onShape, selectedMaterial, onMaterial, isStatic, onStaticToggle }) {
  return (
    <div className="flex flex-col gap-1 p-2 bg-lab-surface border-r border-lab-border w-16 items-center flex-shrink-0">
      {/* Shapes */}
      <div className="text-[9px] text-lab-muted uppercase tracking-widest mb-1">Shape</div>
      {SHAPES.map(s => (
        <button
          key={s.id}
          onClick={() => onShape(s.id)}
          title={s.label}
          className={`w-11 h-11 flex items-center justify-center rounded-lg text-lg border transition-all ${
            selectedShape === s.id
              ? 'bg-lab-accent/20 border-lab-accent text-lab-accent'
              : 'border-lab-border text-lab-muted hover:border-lab-muted hover:text-lab-text'
          }`}
        >
          {s.icon}
        </button>
      ))}

      <div className="w-4/5 h-px bg-lab-border my-2" />

      {/* Materials */}
      <div className="text-[9px] text-lab-muted uppercase tracking-widest mb-1">Mat</div>
      {Object.entries(MATERIAL_PRESETS).map(([key, mat]) => (
        <button
          key={key}
          onClick={() => onMaterial(key)}
          title={mat.label}
          style={{
            borderColor: selectedMaterial === key ? mat.color : undefined,
            color: selectedMaterial === key ? mat.color : undefined,
            background: selectedMaterial === key ? mat.color + '25' : undefined,
          }}
          className={`w-11 h-7 rounded flex items-center justify-center text-[9px] font-bold border transition-all ${
            selectedMaterial !== key ? 'border-lab-border text-lab-muted hover:border-lab-muted' : ''
          }`}
        >
          {mat.label.slice(0, 3).toUpperCase()}
        </button>
      ))}

      <div className="w-4/5 h-px bg-lab-border my-2" />

      {/* Static toggle */}
      <button
        onClick={onStaticToggle}
        title={isStatic ? 'Static (pinned)' : 'Dynamic (free)'}
        className={`w-11 h-8 rounded border text-[10px] font-bold transition-all ${
          isStatic
            ? 'border-lab-warning text-lab-warning bg-yellow-900/30'
            : 'border-lab-border text-lab-muted hover:border-lab-muted'
        }`}
      >
        {isStatic ? 'PIN' : 'FRE'}
      </button>
    </div>
  )
}
