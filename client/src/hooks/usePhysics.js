import { useEffect, useRef, useState, useCallback } from 'react'
import Matter from 'matter-js'
import {
  createEngine, createGround,
  createBody as _createBody,
  createConstraint as _createConstraint,
  startMotor, stopMotor, isMotorRunning,
  setGravity, getBodyKE, getBodyPE, queryBodyAtPoint,
  findBodyByNetworkId, getNetworkId,
} from '../physics/engine.js'

const { Render, Runner, World, Composite, Events, Mouse, MouseConstraint, Body } = Matter

export default function usePhysics(canvasRef, containerRef) {
  const engineRef  = useRef(null)
  const renderRef  = useRef(null)
  const runnerRef  = useRef(null)
  const playingRef = useRef(false)

  const [ready,         setReady]         = useState(false)
  const [bodyCount,     setBodyCount]     = useState(0)
  const [selectedBody,  setSelectedBody]  = useState(null)
  const [analyticsData, setAnalyticsData] = useState([])
  const [liveBodies,    setLiveBodies]    = useState([])

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return
    const { offsetWidth: W, offsetHeight: H } = containerRef.current

    const engine = createEngine()
    World.add(engine.world, createGround(W, H))

    const render = Render.create({
      canvas: canvasRef.current,
      engine,
      options: { width: W, height: H, background: '#0a0a0f', wireframes: false },
    })

    const runner = Runner.create()

    const mouse = Mouse.create(render.canvas)
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    })
    World.add(engine.world, mouseConstraint)
    render.mouse = mouse

    let lastAnalyticsTime = 0

    Events.on(engine, 'afterUpdate', () => {
      const dynamicBodies = Composite.allBodies(engine.world).filter(b => !b.isStatic)
      setBodyCount(dynamicBodies.length)

      const now = Date.now()
      if (dynamicBodies.length > 0 && now - lastAnalyticsTime > 200) {
        lastAnalyticsTime = now
        const totalKE  = dynamicBodies.reduce((s, b) => s + getBodyKE(b), 0)
        const currentGravity = engineRef.current?.gravity?.y ?? 1
        const totalPE = currentGravity <= 0
          ? 0
          : dynamicBodies.reduce((s, b) => s + getBodyPE(b, H - 30, currentGravity), 0)
        const maxSpeed = Math.max(...dynamicBodies.map(b => b.speed))
        setAnalyticsData(prev => [...prev.slice(-100), {
          t:        now,
          ke:       +totalKE.toFixed(2),
          pe:       +totalPE.toFixed(2),
          total:    +(totalKE + totalPE).toFixed(2),
          maxSpeed: +maxSpeed.toFixed(2),
        }])
        setLiveBodies([...dynamicBodies])
      }
    })

    Events.on(render, 'afterRender', () => {
      if (!playingRef.current) return
      const dynamicBodies = Composite.allBodies(engine.world).filter(b => !b.isStatic)
      const ctx = render.canvas.getContext('2d')
      drawForceVectors(ctx, dynamicBodies)
    })

    Render.run(render)
    Runner.run(runner, engine)

    engineRef.current = engine
    renderRef.current = render
    runnerRef.current = runner
    setReady(true)

    return () => {
      Render.stop(render)
      Runner.stop(runner)
      World.clear(engine.world)
      Matter.Engine.clear(engine)
      engineRef.current = null
      setReady(false)
    }
  }, [canvasRef, containerRef])

  function drawForceVectors(ctx, bodies) {
    bodies.forEach(body => {
      const speed = body.speed
      if (speed < 0.5) return
      const { x, y } = body.position
      const vx  = body.velocity.x
      const vy  = body.velocity.y
      const len = Math.sqrt(vx * vx + vy * vy)
      if (len === 0) return
      const nx    = vx / len
      const ny    = vy / len
      const scale = Math.min(speed * 3, 80)
      const ax    = x + nx * scale
      const ay    = y + ny * scale
      const angle = Math.atan2(ny, nx)

      ctx.save()
      ctx.strokeStyle = '#00e5a080'
      ctx.fillStyle   = '#00e5a0'
      ctx.lineWidth   = 2
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(ax, ay)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(ax, ay)
      ctx.lineTo(ax - 8 * Math.cos(angle - 0.4), ay - 8 * Math.sin(angle - 0.4))
      ctx.lineTo(ax - 8 * Math.cos(angle + 0.4), ay - 8 * Math.sin(angle + 0.4))
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    })
  }

  const addBody = useCallback((type, x, y, material, isStatic, options = {}) => {
    if (!engineRef.current) return null
    const body = _createBody(type, x, y, material, isStatic)
    body.plugin = {
      ...body.plugin,
      networkId: options.networkId ?? getNetworkId(body),
    }
    if (typeof options.angle === 'number') Body.setAngle(body, options.angle)
    World.add(engineRef.current.world, body)
    return body
  }, [])

  const removeBody = useCallback((body) => {
    if (!engineRef.current || !body) return
    stopMotor(body)
    World.remove(engineRef.current.world, body)
    setSelectedBody(null)
  }, [])

  const removeBodyByNetworkId = useCallback((networkId) => {
    if (!engineRef.current) return
    const body = findBodyByNetworkId(engineRef.current, networkId)
    if (!body) return
    stopMotor(body)
    removeAllConstraintsForBody(body)
    World.remove(engineRef.current.world, body)
    setSelectedBody(current => getNetworkId(current) === getNetworkId(body) ? null : current)
  }, [])

  const clearAll = useCallback(() => {
    if (!engineRef.current) return
    const bodies      = Composite.allBodies(engineRef.current.world).filter(b => !b.isStatic)
    const staticBodies = Composite.allBodies(engineRef.current.world)
      .filter(b => b.isStatic && !['ground', 'wall-left', 'wall-right'].includes(b.label))
    const constraints = Composite.allConstraints(engineRef.current.world)
      .filter(c => c.label !== 'Mouse Constraint')
    bodies.forEach(stopMotor)
    World.remove(engineRef.current.world, bodies)
    World.remove(engineRef.current.world, staticBodies)
    World.remove(engineRef.current.world, constraints)
    setSelectedBody(null)
    setBodyCount(0)
    setAnalyticsData([])
    setLiveBodies([])
  }, [])

  const addConstraint = useCallback((type, bodyA, bodyB = null, pointB = null, options = {}) => {
    if (!engineRef.current || !bodyA) return null
    const c = _createConstraint(type, bodyA, bodyB, pointB)
    if (typeof options.length === 'number') c.length = options.length
    c.plugin = {
      ...c.plugin,
      networkId: options.networkId ?? `${getNetworkId(bodyA)}-${getNetworkId(bodyB) || 'point'}-${Date.now()}`,
    }
    World.add(engineRef.current.world, c)
    return c
  }, [])

  const removeConstraint = useCallback((constraint) => {
    if (!engineRef.current || !constraint) return
    World.remove(engineRef.current.world, constraint)
  }, [])

  const removeAllConstraintsForBody = useCallback((body) => {
    if (!engineRef.current || !body) return
    Composite.allConstraints(engineRef.current.world)
      .filter(c => c.label !== 'Mouse Constraint')
      .filter(c => c.bodyA?.id === body.id || c.bodyB?.id === body.id)
      .forEach(c => World.remove(engineRef.current.world, c))
  }, [])

  const addConstraintByNetworkIds = useCallback((constraint) => {
    if (!engineRef.current || !constraint) return null
    const bodyA = findBodyByNetworkId(engineRef.current, constraint.bodyANetworkId)
    const bodyB = constraint.bodyBNetworkId
      ? findBodyByNetworkId(engineRef.current, constraint.bodyBNetworkId)
      : null
    const pointB = constraint.pointB || null
    if (!bodyA) return null
    return addConstraint(constraint.type, bodyA, bodyB, pointB, {
      length: constraint.length,
      networkId: constraint.networkId,
    })
  }, [addConstraint])

  const toggleMotor = useCallback((body, speed = 0.06) => {
    if (!body) return
    if (isMotorRunning(body)) stopMotor(body)
    else startMotor(body, speed)
    setSelectedBody(b => b?.id === body.id ? { ...body } : b)
  }, [])

  const getBodyAtPoint = useCallback((point) => {
    if (!engineRef.current) return null
    return queryBodyAtPoint(engineRef.current, point)
  }, [])

  const setRunning = useCallback((running) => {
    playingRef.current = running
    if (engineRef.current) engineRef.current.timing.timeScale = running ? 1 : 0
  }, [])

  const updateGravity = useCallback((y) => {
    if (engineRef.current) setGravity(engineRef.current, 0, y)
  }, [])

  const resetVelocities = useCallback(() => {
  if (!engineRef.current) return
  Composite.allBodies(engineRef.current.world)
    .filter(b => !b.isStatic)
    .forEach(b => {
      stopMotor(b)
      Body.setVelocity(b, { x: 0, y: 0 })
      Body.setAngularVelocity(b, 0)
    })
}, [])

  const moveBodyByNetworkId = useCallback((networkId, x, y, angle) => {
    if (!engineRef.current) return
    const body = findBodyByNetworkId(engineRef.current, networkId)
    if (!body) return
    Body.setPosition(body, { x, y })
    if (typeof angle === 'number') Body.setAngle(body, angle)
    Body.setVelocity(body, { x: 0, y: 0 })
    Body.setAngularVelocity(body, 0)
  }, [])

  const getNetworkIdForBody = useCallback((body) => getNetworkId(body), [])

  return {
    ready, engineRef, renderRef, bodyCount,
    selectedBody, setSelectedBody,
    analyticsData, liveBodies,
    addBody, removeBody, removeBodyByNetworkId, clearAll,
    addConstraint, addConstraintByNetworkIds, removeConstraint, removeAllConstraintsForBody,
    toggleMotor, getBodyAtPoint,
    moveBodyByNetworkId, getNetworkIdForBody,
    setRunning, updateGravity, resetVelocities,
  }
}
