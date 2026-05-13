/**
 * components/OnboardingTooltip.jsx — Phase 6
 * First-time user guide — shows once, dismissed on close
 */
import { useState, useEffect } from 'react'

const STEPS = [
  { icon: '✚', title: 'Place Shapes',       desc: 'Click anywhere on the canvas to drop a shape. Choose from Box, Circle, Triangle, Plank and more from the left toolbar.' },
  { icon: '🎨', title: 'Pick Materials',     desc: 'Select Steel, Rubber, Wood, Ice or Concrete. Each has unique density, bounce and friction properties.' },
  { icon: '▶',  title: 'Run Simulation',     desc: 'Hit PLAY or press SPACE to start gravity. Watch bodies collide and interact in real time.' },
  { icon: '🔗', title: 'Connect Bodies',     desc: 'Switch to Connect mode and click two bodies to link them with Springs, Ropes, Rods or Pivots.' },
  { icon: '💾', title: 'Save Your Work',     desc: 'Open the Save/Load panel to store your experiment in MongoDB and reload it anytime.' },
  { icon: '👥', title: 'Collaborate',        desc: 'Share the URL with teammates. Everyone in the same room sees live cursors and body changes instantly.' },
]

export default function OnboardingTooltip() {
  const [visible, setVisible] = useState(false)
  const [step,    setStep]    = useState(0)

  useEffect(() => {
    const seen = localStorage.getItem('vlab-onboarding-done')
    if (!seen) setVisible(true)
  }, [])

  const handleClose = () => {
    localStorage.setItem('vlab-onboarding-done', '1')
    setVisible(false)
  }

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else handleClose()
  }

  if (!visible) return null

  const current = STEPS[step]

  return (
    <div style={{
      position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      zIndex: 10000, width: 380,
      background: '#12121a', border: '1px solid #00e5a040',
      borderRadius: 14, padding: 24, boxShadow: '0 8px 40px #00e5a015',
      fontFamily: 'JetBrains Mono',
    }}>
      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, justifyContent: 'center' }}>
        {STEPS.map((_, i) => (
          <div key={i} onClick={() => setStep(i)} style={{
            width: i === step ? 20 : 6, height: 6, borderRadius: 3,
            background: i === step ? '#00e5a0' : i < step ? '#00e5a050' : '#2a2a3a',
            cursor: 'pointer', transition: 'all 0.2s',
          }} />
        ))}
      </div>

      <div style={{ fontSize: 28, marginBottom: 10 }}>{current.icon}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#e8e8f0', marginBottom: 8 }}>{current.title}</div>
      <div style={{ fontSize: 11, color: '#8888a0', lineHeight: 1.7, marginBottom: 20 }}>{current.desc}</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={handleClose} style={{
          background: 'transparent', border: 'none',
          color: '#55556a', cursor: 'pointer', fontSize: 10,
          fontFamily: 'JetBrains Mono',
        }}>
          Skip tour
        </button>
        <button onClick={handleNext} style={{
          padding: '7px 20px', background: '#00e5a020',
          border: '1px solid #00e5a0', borderRadius: 6,
          color: '#00e5a0', cursor: 'pointer', fontWeight: 700,
          fontSize: 11, fontFamily: 'JetBrains Mono',
        }}>
          {step < STEPS.length - 1 ? 'Next →' : 'Get Started!'}
        </button>
      </div>
    </div>
  )
}
