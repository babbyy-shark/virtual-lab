import Matter from 'matter-js'

const { Composite } = Matter

export function serializeWorld(engine, gravity = 1) {
  const dynamicBodies = Composite.allBodies(engine.world).filter(b => !b.isStatic)

  const bodies = dynamicBodies.map(b => ({
    type:     b.plugin?.type     || 'box',
    material: b.plugin?.material || 'steel',
    x:        b.position.x,
    y:        b.position.y,
    angle:    b.angle,
    isStatic: b.isStatic,
  }))

  const constraints = Composite.allConstraints(engine.world).map(c => ({
    type:       c.plugin?.constraintType || 'spring',
    bodyAIndex: dynamicBodies.findIndex(b => b.id === c.bodyA?.id),
    bodyBIndex: c.bodyB ? dynamicBodies.findIndex(b => b.id === c.bodyB?.id) : -1,
    pointBx:    c.pointB?.x ?? null,
    pointBy:    c.pointB?.y ?? null,
    length:     c.length,
  }))

  return { bodies, constraints, gravity }
}

export function deserializeWorld(data, addBody, addConstraint) {
  if (!data?.bodies) return
  const createdBodies = []

  for (const b of data.bodies) {
    const body = addBody(b.type, b.x, b.y, b.material, b.isStatic)
    if (body) createdBodies.push(body)
  }

  for (const c of data.constraints || []) {
    const bodyA  = createdBodies[c.bodyAIndex]
    const bodyB  = c.bodyBIndex >= 0 ? createdBodies[c.bodyBIndex] : null
    const pointB = c.pointBx !== null ? { x: c.pointBx, y: c.pointBy } : null
    if (bodyA) addConstraint(c.type, bodyA, bodyB, pointB)
  }
}
