/**
 * pages/DashboardPage.jsx
 * Multi-user dashboard — Phase 5
 */
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  return (
    <div className="w-full h-full bg-lab-bg font-mono text-lab-text overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-lab-muted hover:text-lab-accent text-xs mb-6 block">← Back to Lab</Link>
        <h1 className="text-2xl font-bold text-lab-accent tracking-widest mb-1">DASHBOARD</h1>
        <p className="text-lab-muted text-sm mb-8">Multi-user collaboration and session management — coming in Phase 5.</p>
        <div className="p-4 bg-lab-surface border border-lab-border rounded-xl text-lab-muted text-xs">
          🔌 Real-time collaboration with Socket.io will be built in Phase 5.
        </div>
      </div>
    </div>
  )
}
