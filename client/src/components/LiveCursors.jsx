/**
 * components/LiveCursors.jsx
 * Phase 5 — Renders other users' cursors as colored overlays
 */
export default function LiveCursors({ cursors, you }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {Object.entries(cursors).map(([id, cursor]) => {
        if (id === you?.id) return null
        if (!cursor.name) return null
        return (
          <div key={id} style={{
            position: 'absolute',
            left: cursor.x,
            top:  cursor.y,
            transform: 'translate(-2px, -2px)',
            pointerEvents: 'none',
            zIndex: 999,
          }}>
            {/* Cursor arrow */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M0 0L0 12L3.5 8.5L6 14L8 13L5.5 7.5L10 7.5Z"
                fill={cursor.color || '#00e5a0'}
                stroke="#0a0a0f" strokeWidth="0.5" />
            </svg>
            {/* Name tag */}
            <div style={{
              position: 'absolute', left: 14, top: 0,
              background: cursor.color || '#00e5a0',
              color: '#0a0a0f', fontSize: 9, fontWeight: 700,
              padding: '2px 5px', borderRadius: 3,
              fontFamily: 'JetBrains Mono', whiteSpace: 'nowrap',
            }}>
              {cursor.name}
            </div>
          </div>
        )
      })}
    </div>
  )
}
