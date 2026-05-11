/**
 * components/AnalyticsPanel.jsx
 * Real-time energy + speed charts using Recharts.
 */
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-lab-surface border border-lab-border rounded p-2 text-[9px] font-mono">
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value?.toFixed(2)}
        </div>
      ))}
    </div>
  )
}

function Chart({ title, data, lines }) {
  return (
    <div className="mb-3">
      <div className="text-[9px] font-bold text-lab-muted uppercase tracking-widest mb-2">{title}</div>
      <ResponsiveContainer width="100%" height={90}>
        <LineChart data={data} margin={{ top: 2, right: 4, bottom: 2, left: -20 }}>
          <XAxis dataKey="t" hide />
          <YAxis tick={{ fontSize: 8, fill: '#8888a0' }} />
          <Tooltip content={<CustomTooltip />} />
          {lines.map(l => (
            <Line
              key={l.key}
              type="monotone"
              dataKey={l.key}
              name={l.name}
              stroke={l.color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function AnalyticsPanel({ data }) {
  return (
    <div className="w-56 bg-lab-surface border-l border-lab-border p-3 flex flex-col gap-2 font-mono text-[10px] overflow-y-auto">
      <div className="text-lab-info font-bold tracking-widest uppercase text-[11px]">📈 Analytics</div>

      {data.length === 0 ? (
        <div className="p-3 bg-lab-bg rounded-lg border border-lab-border text-lab-muted">
          Play the simulation to see live energy charts.
        </div>
      ) : (
        <>
          <Chart
            title="Energy (J)"
            data={data}
            lines={[
              { key: 'ke',    name: 'KE',    color: '#ff4466' },
              { key: 'pe',    name: 'PE',    color: '#4488ff' },
              { key: 'total', name: 'Total', color: '#00e5a0' },
            ]}
          />
          <Chart
            title="Max Speed (px/s)"
            data={data}
            lines={[
              { key: 'maxSpeed', name: 'Speed', color: '#ffaa00' },
            ]}
          />

          {/* Latest values */}
          {data.length > 0 && (() => {
            const last = data[data.length - 1]
            return (
              <div className="p-2.5 bg-lab-bg rounded-lg border border-lab-border">
                <div className="text-[9px] font-bold text-lab-muted uppercase tracking-widest mb-1.5">Live Values</div>
                <div className="flex justify-between"><span className="text-lab-muted">KE</span><span className="text-lab-danger">{last.ke} J</span></div>
                <div className="flex justify-between"><span className="text-lab-muted">PE</span><span className="text-lab-info">{last.pe} J</span></div>
                <div className="flex justify-between"><span className="text-lab-muted">Total</span><span className="text-lab-accent">{last.total} J</span></div>
                <div className="flex justify-between"><span className="text-lab-muted">Speed</span><span className="text-lab-warning">{last.maxSpeed} px/s</span></div>
              </div>
            )
          })()}
        </>
      )}
    </div>
  )
}
