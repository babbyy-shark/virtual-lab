/**
 * components/InspectorPanel.jsx
 */
import { MATERIAL_PRESETS } from '../physics/engine.js'

function Stat({ label, value, unit, accent }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-lab-muted">{label}</span>
      <span className={accent ? 'text-lab-accent' : 'text-lab-text'}>
        {value} {unit && <span className="text-lab-muted">{unit}</span>}
      </span>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="p-2.5 bg-lab-bg rounded-lg border border-lab-border">
      <div className="text-[9px] font-bold text-lab-muted uppercase tracking-widest mb-1.5">{title}</div>
      {children}
    </div>
  )
}

export default function InspectorPanel({ body }) {
  if (!body) return (
    <div className="w-52 bg-lab-surface border-l border-lab-border p-4 flex flex-col gap-3 font-mono text-xs">
      <div className="text-lab-accent font-bold tracking-widest uppercase text-[11px]">Inspector</div>
      <div className="p-3 bg-lab-bg rounded-lg border border-lab-border text-lab-muted leading-relaxed">
        Click an object to inspect its live physics properties.
      </div>
      <div className="mt-2 text-[9px] text-lab-muted leading-relaxed">
        <div className="text-lab-text font-semibold mb-1">KEYBOARD</div>
        <div>SPACE — play / pause</div>
        <div>DEL — delete selected</div>
        <div>Click — place shape</div>
        <div>Drag — move objects</div>
      </div>
    </div>
  )

  const mat = body.plugin?.material || 'steel'
  const matPreset = MATERIAL_PRESETS[mat] || MATERIAL_PRESETS.steel
  const vel = body.speed || 0
  const ke = +(0.5 * body.mass * vel * vel).toFixed(2)

  return (
    <div className="w-52 bg-lab-surface border-l border-lab-border p-3 flex flex-col gap-2 font-mono text-[10px] overflow-y-auto">
      <div className="text-lab-accent font-bold tracking-widest uppercase text-[11px]">Inspector</div>

      {/* Identity */}
      <div className="p-2.5 rounded-lg border" style={{ borderColor: matPreset.color + '50', background: matPreset.color + '10' }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-sm" style={{ background: matPreset.color }} />
          <span className="font-bold" style={{ color: matPreset.color }}>{body.label}</span>
        </div>
        <Stat label="Static" value={body.isStatic ? 'YES' : 'NO'} />
      </div>

      {/* Position */}
      <Section title="Position">
        <Stat label="X"     value={body.position.x.toFixed(1)} unit="px" />
        <Stat label="Y"     value={body.position.y.toFixed(1)} unit="px" />
        <Stat label="Angle" value={(body.angle * 180 / Math.PI).toFixed(1)} unit="°" />
      </Section>

      {/* Dynamics */}
      <Section title="Dynamics">
        <Stat label="Speed" value={vel.toFixed(2)}                 unit="px/s" accent={vel > 5} />
        <Stat label="Vx"    value={(body.velocity?.x || 0).toFixed(2)} unit="px/s" />
        <Stat label="Vy"    value={(body.velocity?.y || 0).toFixed(2)} unit="px/s" />
        <Stat label="ω"     value={(body.angularVelocity || 0).toFixed(3)} unit="r/s" />
      </Section>

      {/* Energy */}
      <Section title="Energy">
        <Stat label="KE"    value={ke}   unit="J" accent />
        <Stat label="Mass"  value={body.mass?.toFixed(3)} unit="kg" />
      </Section>

      {/* Material */}
      <Section title="Material">
        <Stat label="Type"     value={matPreset.label} />
        <Stat label="Bounce"   value={matPreset.restitution} />
        <Stat label="Friction" value={matPreset.friction} />
        <Stat label="Air drag" value={matPreset.frictionAir} />
      </Section>
    </div>
  )
}
