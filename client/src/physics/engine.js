/**
 * physics/engine.js
 * Wraps Matter.js. All physics logic lives here so the UI stays clean.
 */
import Matter from 'matter-js'

const {
  Engine, Render, Runner, Bodies, Body, World,
  Composite, Constraint, Mouse, MouseConstraint, Events,
} = Matter

export const MATERIAL_PRESETS = {
  steel:    { density: 0.004,  restitution: 0.3,  friction: 0.6,  frictionAir: 0.001, color: '#6688aa', label: 'Steel'    },
  rubber:   { density: 0.002,  restitution: 0.85, friction: 0.9,  frictionAir: 0.002, color: '#44cc66', label: 'Rubber'   },
  wood:     { density: 0.001,  restitution: 0.2,  friction: 0.5,  frictionAir: 0.001, color: '#cc9944', label: 'Wood'     },
  ice:      { density: 0.0015, restitution: 0.05, friction: 0.02, frictionAir: 0.0005,color: '#88ccff', label: 'Ice'      },
  concrete: { density: 0.006,  restitution: 0.1,  friction: 0.8,  frictionAir: 0.001, color: '#888888', label: 'Concrete' },
}

export function createEngine() {
  const engine = Engine.create({ gravity: { y: 1 } })
  return engine
}

export function createGround(width, height) {
  const ground = Bodies.rectangle(width / 2, height - 15, width, 30, {
    isStatic: true,
    label: 'ground',
    render: { fillStyle: '#1a1a2a' },
  })
  const wallL = Bodies.rectangle(-15, height / 2, 30, height, { isStatic: true, label: 'wall-left' })
  const wallR = Bodies.rectangle(width + 15, height / 2, 30, height, { isStatic: true, label: 'wall-right' })
  return [ground, wallL, wallR]
}

export function createBody(type, x, y, material = 'steel', isStatic = false) {
  const mat = MATERIAL_PRESETS[material]
  const opts = {
    density: mat.density,
    restitution: mat.restitution,
    friction: mat.friction,
    frictionAir: mat.frictionAir,
    isStatic,
    label: `${mat.label}-${type}`,
    render: { fillStyle: mat.color, strokeStyle: mat.color + '80', lineWidth: 1 },
    plugin: { material, type },
  }

  switch (type) {
    case 'box':      return Bodies.rectangle(x, y, 50, 50, opts)
    case 'circle':   return Bodies.circle(x, y, 25, opts)
    case 'triangle':
      return Bodies.polygon(x, y, 3, 35, opts)
    case 'plank':    return Bodies.rectangle(x, y, 150, 20, opts)
    case 'wall':
      return Bodies.rectangle(x, y, 20, 120, { ...opts, isStatic: true })
    case 'hexagon':  return Bodies.polygon(x, y, 6, 30, opts)
    default:         return Bodies.rectangle(x, y, 50, 50, opts)
  }
}

export function createSpring(bodyA, bodyB, length = 100, stiffness = 0.01) {
  return Constraint.create({
    bodyA,
    bodyB,
    length,
    stiffness,
    damping: 0.1,
    render: { strokeStyle: '#00e5a0', lineWidth: 2, type: 'spring' },
  })
}

export function createRope(bodyA, bodyB, length = 120) {
  return Constraint.create({
    bodyA,
    bodyB,
    length,
    stiffness: 1,
    damping: 0,
    render: { strokeStyle: '#cc9944', lineWidth: 2 },
  })
}

export function createPivot(body, point) {
  return Constraint.create({
    body,
    pointB: point,
    length: 0,
    stiffness: 1,
    render: { strokeStyle: '#ff4466', lineWidth: 2 },
  })
}

export function setGravity(engine, x = 0, y = 1) {
  engine.gravity.x = x
  engine.gravity.y = y
}

export function getBodyKE(body) {
  const vel = body.speed
  return 0.5 * body.mass * vel * vel
}

export function getBodyPE(body, groundY) {
  const h = Math.max(0, groundY - body.position.y)
  return body.mass * 9.81 * h * 0.01
}

export function serializeWorld(engine) {
  const bodies = Composite.allBodies(engine.world).filter(b => !b.isStatic || b.label?.startsWith('wall'))
  const constraints = Composite.allConstraints(engine.world)
  return JSON.stringify({ bodies: bodies.map(b => ({
    type: b.plugin?.type,
    material: b.plugin?.material,
    x: b.position.x,
    y: b.position.y,
    angle: b.angle,
    isStatic: b.isStatic,
  })), constraints: [] })
}

export { Engine, Render, Runner, World, Composite, Events, Mouse, MouseConstraint, Body }
