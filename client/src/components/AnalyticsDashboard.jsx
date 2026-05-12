/**
 * components/AnalyticsDashboard.jsx
 * Phase 3 — FIXED version
 *
 * ✅ Bug 1 fixed: no interval = no memory leak
 * ✅ Bug 2 fixed: use `data` prop directly, no stale closure
 */
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'

const COLORS = {
  ke:       '#ff4466',
  pe:       '#4488ff',
  total:    '#00e5a0',
  maxSpeed: '#ffaa00',
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#12121a', border: '1px solid #2a2a3a',
      borderRadius: 6, padding: '6px 10px', fontSize: 10, fontFamily: 'JetBrains Mono',
    }}>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {Number(p.value).toFixed(2)}
        </div>
      ))}
    </div>
  )
}

function MiniChart({ title, data, lines }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 9, fontWeight: 700, color: '#8888a0',
        textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6,
      }}>{title}</div>
      <ResponsiveContainer width="100%" height={80}>
        <LineChart data={data} margin={{ top: 2, right: 4, bottom: 0, left: -28 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a28" />
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

export default function AnalyticsDashboard({ data, bodies }) {
  // ✅ No useState, no useEffect, no interval
  // React automatically re-renders this component
  // whenever the parent sends new `data` down as a prop
  const last = data[data.length - 1]

  return (
    <div style={{
      width: 280, background: '#12121a', borderLeft: '1px solid #2a2a3a',
      padding: 14, display: 'flex', flexDirection: 'column', gap: 4,
      fontFamily: 'JetBrains Mono', fontSize: 10, color: '#e8e8f0',
      overflowY: 'auto',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#4488ff', letterSpacing: 2, marginBottom: 8 }}>
        📈 ANALYTICS
      </div>

      {data.length === 0 ? (
        <div style={{
          padding: 12, background: '#0a0a0f', borderRadius: 8,
          border: '1px solid #2a2a3a', color: '#8888a0', lineHeight: 1.6,
        }}>
          Hit ▶ PLAY and add some bodies to see live charts.
        </div>
      ) : (
        <>
          <MiniChart
            title="Energy (J)"
            data={data}
            lines={[
              { key: 'ke',    name: 'KE',    color: COLORS.ke    },
              { key: 'pe',    name: 'PE',    color: COLORS.pe    },
              { key: 'total', name: 'Total', color: COLORS.total },
            ]}
          />
          <MiniChart
            title="Max Speed (px/s)"
            data={data}
            lines={[{ key: 'maxSpeed', name: 'Speed', color: COLORS.maxSpeed }]}
          />

          {last && (
            <div style={{
              padding: 10, background: '#0a0a0f', borderRadius: 8,
              border: '1px solid #2a2a3a',
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#8888a0', marginBottom: 6, letterSpacing: 2 }}>
                LIVE VALUES
              </div>
              {[
                { label: 'KE',    value: last.ke,       color: COLORS.ke       },
                { label: 'PE',    value: last.pe,       color: COLORS.pe       },
                { label: 'Total', value: last.total,    color: COLORS.total    },
                { label: 'Speed', value: last.maxSpeed, color: COLORS.maxSpeed },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span style={{ color: '#8888a0' }}>{label}</span>
                  <span style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          )}

          {bodies?.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#8888a0', letterSpacing: 2, marginBottom: 6 }}>
                BODIES
              </div>
              <div style={{
                background: '#0a0a0f', borderRadius: 8, border: '1px solid #2a2a3a',
                overflow: 'hidden',
              }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 60px 60px',
                  padding: '4px 8px', borderBottom: '1px solid #2a2a3a',
                  fontSize: 8, color: '#55556a',
                }}>
                  <span>Label</span><span>Speed</span><span>KE</span>
                </div>
                {bodies.map(b => (
                  <div key={b.id} style={{
                    display: 'grid', gridTemplateColumns: '1fr 60px 60px',
                    padding: '3px 8px', borderBottom: '1px solid #1a1a28', fontSize: 9,
                  }}>
                    <span style={{ color: '#e8e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.label?.split('-')[0]}
                    </span>
                    <span style={{ color: '#ffaa00' }}>{(b.speed || 0).toFixed(1)}</span>
                    <span style={{ color: '#ff4466' }}>
                      {(0.5 * b.mass * (b.speed || 0) ** 2).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}