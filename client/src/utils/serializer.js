/**
 * utils/serializer.js
 * Converts Matter.js world state → plain JSON and back.
 *
 * 🐛 BUG 1: serializeWorld_BROKEN tries to JSON.stringify
 * the raw Matter.js body object directly.
 * Matter.js bodies have circular references (body → world → bodies → body)
 * This causes: "TypeError: Converting circular structure to JSON"
 * and crashes the entire save operation.
 *
 * ✅ serializeWorld_FIXED extracts only the fields we need
 * into a plain object with no circular references.
 */
import Matter from 'matter-js'

const { Composite } = Matter

// 🐛 BUG 1 — This will CRASH with circular reference error
export function serializeWorld_BROKEN(engine) {
  const bodies = Composite.allBodies(engine.world).filter(b => !b.isStatic)

  // Trying to stringify raw Matter.js objects → circular reference crash
  return JSON.parse(JSON.stringify(bodies))
}

// ✅ FIXED — Extract only what we need into plain objects
export function serializeWorld(engine, gravity = 1) {
  const bodies = Composite.allBodies(engine.world)
    .filter(b => !b.isStatic)
    .map(b => ({
      type:     b.plugin?.type     || 'box',
      material: b.plugin?.material || 'steel',
      x:        b.position.x,
      y:        b.position.y,
      angle:    b.angle,
      isStatic: b.isStatic,
    }))

  const constraints = Composite.allConstraints(engine.world)
    .map(c => ({
      type:    c.plugin?.constraintType || 'spring',
      // Store indices so we can reconnect on load
      bodyAIndex: Composite.allBodies(engine.world)
        .filter(b => !b.isStatic)
        .findIndex(b => b.id === c.bodyA?.id),
      bodyBIndex: c.bodyB
        ? Composite.allBodies(engine.world)
            .filter(b => !b.isStatic)
            .findIndex(b => b.id === c.bodyB?.id)
        : -1,
      pointBx: c.pointB?.x || null,
      pointBy: c.pointB?.y || null,
      length:  c.length,
    }))

  return { bodies, constraints, gravity }
}

// Reconstruct bodies from saved data
export function deserializeWorld(data, addBody, addConstraint) {
  if (!data?.bodies) return

  const createdBodies = []

  // Recreate bodies
  for (const b of data.bodies) {
    const body = addBody(b.type, b.x, b.y, b.material, b.isStatic)
    if (body) createdBodies.push(body)
  }

  // Recreate constraints
  for (const c of data.constraints || []) {
    const bodyA = createdBodies[c.bodyAIndex]
    const bodyB = c.bodyBIndex >= 0 ? createdBodies[c.bodyBIndex] : null
    const pointB = c.pointBx !== null ? { x: c.pointBx, y: c.pointBy } : null
    if (bodyA) addConstraint(c.type, bodyA, bodyB, pointB)
  }
}
