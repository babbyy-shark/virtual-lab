import Matter from 'matter-js'

const { Composite } = Matter

const WORLD_BOUNDARY_LABELS = new Set(['ground', 'wall-left', 'wall-right'])

function isSerializableBody(body) {
  return !WORLD_BOUNDARY_LABELS.has(body.label)
}

export function serializeWorld(engine, gravity = 1) {
  const serializableBodies = Composite.allBodies(engine.world).filter(isSerializableBody)

  const bodies = serializableBodies.map(b => ({
    networkId: b.plugin?.networkId ?? b.id,
    type:     b.plugin?.type     || 'box',
    material: b.plugin?.material || 'steel',
    x:        b.position.x,
    y:        b.position.y,
    angle:    b.angle,
    isStatic: b.isStatic,
  }))

  const constraints = Composite.allConstraints(engine.world)
    .filter(c => c.label !== 'Mouse Constraint')
    .map(c => ({
    type:       c.plugin?.constraintType || 'spring',
    bodyAIndex: serializableBodies.findIndex(b => b.id === c.bodyA?.id),
    bodyBIndex: c.bodyB ? serializableBodies.findIndex(b => b.id === c.bodyB?.id) : -1,
    pointBx:    c.pointB?.x ?? null,
    pointBy:    c.pointB?.y ?? null,
    length:     c.length,
  }))
    .filter(c => c.bodyAIndex >= 0)

  return { bodies, constraints, gravity }
}

export function deserializeWorld(data, addBody, addConstraint) {
  if (!data?.bodies) return
  const createdBodies = []

  for (const b of data.bodies) {
    const body = addBody(b.type, b.x, b.y, b.material, b.isStatic, {
      networkId: b.networkId,
      angle: b.angle,
    })
    if (body) createdBodies.push(body)
  }

  for (const c of data.constraints || []) {
    const bodyA  = createdBodies[c.bodyAIndex]
    const bodyB  = c.bodyBIndex >= 0 ? createdBodies[c.bodyBIndex] : null
    const pointB = c.pointBx !== null ? { x: c.pointBx, y: c.pointBy } : null
    if (bodyA) addConstraint(c.type, bodyA, bodyB, pointB, { length: c.length })
  }

  return createdBodies
}
