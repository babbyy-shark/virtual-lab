/**
 * pages/LibraryPage.jsx
 * Experiment Library — Phase 6
 */
import { Link } from 'react-router-dom'

const TEMPLATES = [
  { id: 'pendulum',   name: 'Pendulum',         desc: 'Classic single pendulum with pivot constraint',      icon: '🔄', phase: 'Phase 3' },
  { id: 'bridge',     name: 'Bridge Stress',    desc: 'Suspension bridge under load testing',              icon: '🌉', phase: 'Phase 3' },
  { id: 'gears',      name: 'Gear Train',       desc: 'Motorized gear system with torque transmission',    icon: '⚙️', phase: 'Phase 3' },
  { id: 'projectile', name: 'Projectile Motion',desc: 'Angle and velocity controlled launch experiment',   icon: '🚀', phase: 'Phase 4' },
  { id: 'dominos',    name: 'Domino Chain',     desc: 'Kinetic energy cascade through domino tiles',       icon: '🁣', phase: 'Phase 4' },
  { id: 'ramp',       name: 'Ramp & Friction',  desc: 'Compare materials sliding down inclined planes',    icon: '📐', phase: 'Phase 5' },
]

export default function LibraryPage() {
  return (
    <div className="w-full h-full bg-lab-bg font-mono text-lab-text overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-lab-muted hover:text-lab-accent text-xs mb-6 block">← Back to Lab</Link>
        <h1 className="text-2xl font-bold text-lab-accent tracking-widest mb-1">EXPERIMENT LIBRARY</h1>
        <p className="text-lab-muted text-sm mb-8">Pre-built physics scenarios for classroom use. Click a template to load it into the lab.</p>

        <div className="grid grid-cols-3 gap-4">
          {TEMPLATES.map(t => (
            <div key={t.id} className="p-4 bg-lab-surface border border-lab-border rounded-xl hover:border-lab-accent/50 transition-all cursor-pointer group">
              <div className="text-3xl mb-3">{t.icon}</div>
              <div className="font-bold text-lab-text group-hover:text-lab-accent transition-colors mb-1">{t.name}</div>
              <div className="text-xs text-lab-muted mb-3 leading-relaxed">{t.desc}</div>
              <div className="text-[9px] text-lab-muted border border-lab-border rounded px-2 py-0.5 inline-block">{t.phase}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 p-4 bg-lab-surface border border-lab-border rounded-xl text-lab-muted text-xs">
          ⚡ Templates will be fully interactive in Phase 6. Currently showing placeholders.
        </div>
      </div>
    </div>
  )
}
