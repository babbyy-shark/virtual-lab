import Matter from 'matter-js'

const { Engine, Render, Runner, Bodies, Body, World, Composite, Constraint, Mouse, MouseConstraint, Events, Query } = Matter

export const MATERIAL_PRESETS = {
  steel:    { density: 0.004,  restitution: 0.3,  friction: 0.6,  frictionAir: 0.001,  color: '#6688aa', label: 'Steel'    },
  rubber:   { density: 0.002,  restitution: 0.85, friction: 0.9,  frictionAir: 0.002,  color: '#44cc66', label: 'Rubber'   },
  wood:     { density: 0.001,  restitution: 0.2,  friction: 0.5,  frictionAir: 0.001,  color: '#cc9944', label: 'Wood'     },
  ice:      { density: 0.0015, restitution: 0.05, friction: 0.02, frictionAir: 0.0005, color: '#88ccff', label: 'Ice'      },
  concrete: { density: 0.006,  restitution: 0.1,  friction: 0.8,  frictionAir: 0.001,  color: '#888888', label: 'Concrete' },
}

export const CONSTRAINT_PRESETS = {
  spring: { label: 'Spring', icon: '〰', color: '#00e5a0', stiffness: 0.02, damping: 0.1,  renderType: 'spring' },
  rope:   { label: 'Rope',   icon: '➰', color: '#cc9944', stiffness: 0.8,  damping: 0.05, renderType: 'line'   },
  rod:    { label: 'Rod',    icon: '━',  color: '#6688aa', stiffness: 1,    damping: 0.3,  renderType: 'line'   },
  pivot:  { label: 'Pivot',  icon: '⊕',  color: '#ff4466', stiffness: 1,    damping: 0.2,  renderType: 'line'   },
}

export function createEngine() {
  return Engine.create({ gravity: { y: 1 } })
}

export function createGround(width, height) {
  const ground = Bodies.rectangle(width / 2, height - 15, width, 30, {
    isStatic: true, label: 'ground',
    render: { fillStyle: '#1a1a2a', strokeStyle: '#00e5a040', lineWidth: 1 },
  })
  const wallL = Bodies.rectangle(-15, height / 2, 30, height, { isStatic: true, label: 'wall-left',  render: { fillStyle: '#1a1a2a' } })
  const wallR = Bodies.rectangle(width + 15, height / 2, 30, height, { isStatic: true, label: 'wall-right', render: { fillStyle: '#1a1a2a' } })
  return [ground, wallL, wallR]
}

export function createBody(type, x, y, material = 'steel', isStatic = false) {
  const mat  = MATERIAL_PRESETS[material]
  const opts = {
    density: mat.density, restitution: mat.restitution,
    friction: mat.friction, frictionAir: mat.frictionAir,
    isStatic,
    label: `${mat.label}-${type}`,
    render: { fillStyle: mat.color, strokeStyle: mat.color + '80', lineWidth: 1 },
    plugin: { material, type },
  }
  switch (type) {
    case 'box':      return Bodies.rectangle(x, y, 50, 50, opts)
    case 'circle':   return Bodies.circle(x, y, 25, opts)
    case 'triangle': return Bodies.polygon(x, y, 3, 35, opts)
    case 'plank':    return Bodies.rectangle(x, y, 150, 20, opts)
    case 'hexagon':  return Bodies.polygon(x, y, 6, 30, opts)
    case 'wall':     return Bodies.rectangle(x, y, 20, 120, { ...opts, isStatic: true, render: { fillStyle: '#444455', strokeStyle: '#66667780', lineWidth: 1 } })
    default:         return Bodies.rectangle(x, y, 50, 50, opts)
  }
}

export function createConstraint(type, bodyA, bodyB = null, pointB = null) {
  const preset = CONSTRAINT_PRESETS[type]
  const posA   = bodyA.position
  const posB   = bodyB ? bodyB.position : pointB
  const dx     = posB.x - posA.x
  const dy     = posB.y - posA.y
  const length = Math.max(10, Math.sqrt(dx * dx + dy * dy))

  const config = {
    bodyA,
    stiffness: preset.stiffness,
    damping:   preset.damping,
    length,
    render: { strokeStyle: preset.color, lineWidth: type === 'rod' ? 3 : 2, type: preset.renderType },
    label:  `constraint-${type}`,
    plugin: { constraintType: type },
  }

  if (bodyB)      config.bodyB  = bodyB
  else if (pointB) config.pointB = { x: pointB.x, y: pointB.y }

  return Constraint.create(config)
}

const motorIntervals = new Map()

export function startMotor(body, speed = 0.05) {
  stopMotor(body)
  const id = setInterval(() => Body.setAngularVelocity(body, speed), 16)
  motorIntervals.set(body.id, id)
  body.plugin = { ...body.plugin, isMotor: true, motorSpeed: speed }
}

export function stopMotor(body) {
  if (motorIntervals.has(body.id)) {
    clearInterval(motorIntervals.get(body.id))
    motorIntervals.delete(body.id)
  }
  if (body.plugin) body.plugin.isMotor = false
}

export function isMotorRunning(body) {
  return motorIntervals.has(body.id)
}

export function setGravity(engine, x = 0, y = 1) {
  engine.gravity.x = x
  engine.gravity.y = y
}

export function getBodyKE(body) {
  return 0.5 * body.mass * body.speed * body.speed
}

export function getBodyPE(body, groundY) {
  return body.mass * 9.81 * Math.max(0, groundY - body.position.y) * 0.01
}

export function queryBodyAtPoint(engine, point) {
  const bodies = Composite.allBodies(engine.world).filter(
    b => b.label !== 'ground' && b.label !== 'wall-left' && b.label !== 'wall-right'
  )
  return Query.point(bodies, point)[0] || null
}

export { Engine, Render, Runner, World, Composite, Constraint, Events, Mouse, MouseConstraint, Body, Query }
