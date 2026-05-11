/**
 * hooks/usePhysics.js
 * Phase 2 — adds constraint management on top of Phase 1 engine.
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import Matter from 'matter-js'
import {
  createEngine, createGround,
  createBody as _createBody,
  createConstraint as _createConstraint,
  startMotor, stopMotor, isMotorRunning,
  setGravity, getBodyKE, getBodyPE, queryBodyAtPoint,
  MATERIAL_PRESETS,
} from '../physics/engine.js'

const { Render, Runner, World, Composite, Events, Mouse, MouseConstraint, Body } = Matter

export default function usePhysics(canvasRef, containerRef) {
  const engineRef  = useRef(null)
  const renderRef  = useRef(null)
  const runnerRef  = useRef(null)

  const [ready,        setReady]        = useState(false)
  const [bodyCount,    setBodyCount]    = useState(0)
  const [selectedBody, setSelectedBody] = useState(null)
  const [analyticsData,setAnalyticsData]= useState([])
  const analyticsTimer = useRef(null)

  // Init
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return
    const { offsetWidth: W, offsetHeight: H } = containerRef.current

    const engine = createEngine()
    World.add(engine.world, createGround(W, H))

    const render = Render.create({
      canvas: canvasRef.current,
      engine,
      options: {
        width: W, height: H,
        background: '#0a0a0f',
        wireframes: false,
      },
    })

    const runner = Runner.create()

    // Mouse drag
    const mouse = Mouse.create(render.canvas)
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    })
    World.add(engine.world, mouseConstraint)
    render.mouse = mouse

    // Body count tracking
    Events.on(engine, 'afterUpdate', () => {
      const count = Composite.allBodies(engine.world)
        .filter(b => !b.isStatic).length
      setBodyCount(count)
    })

    Render.run(render)
    Runner.run(runner, engine)

    engineRef.current = engine
    renderRef.current = render
    runnerRef.current = runner
    setReady(true)

    // Analytics
    analyticsTimer.current = setInterval(() => {
      if (!engineRef.current) return
      const bodies = Composite.allBodies(engineRef.current.world).filter(b => !b.isStatic)
      if (!bodies.length) return
      const totalKE  = bodies.reduce((s, b) => s + getBodyKE(b), 0)
      const totalPE  = bodies.reduce((s, b) => s + getBodyPE(b, H - 30), 0)
      const maxSpeed = Math.max(...bodies.map(b => b.speed))
      setAnalyticsData(prev => [...prev.slice(-100), {
        t: Date.now(),
        ke:       +totalKE.toFixed(2),
        pe:       +totalPE.toFixed(2),
        total:    +(totalKE + totalPE).toFixed(2),
        maxSpeed: +maxSpeed.toFixed(2),
      }])
    }, 200)

    return () => {
      clearInterval(analyticsTimer.current)
      Render.stop(render)
      Runner.stop(runner)
      World.clear(engine.world)
      Matter.Engine.clear(engine)
      engineRef.current = null
      setReady(false)
    }
  }, [canvasRef, containerRef])

  // ── Body actions ────────────────────────────────────────────────────────

  const addBody = useCallback((type, x, y, material, isStatic) => {
    if (!engineRef.current) return null
    const body = _createBody(type, x, y, material, isStatic)
    World.add(engineRef.current.world, body)
    return body
  }, [])

  const removeBody = useCallback((body) => {
    if (!engineRef.current || !body) return
    stopMotor(body)
    World.remove(engineRef.current.world, body)
    setSelectedBody(null)
  }, [])

  const clearAll = useCallback(() => {
    if (!engineRef.current) return
    const bodies      = Composite.allBodies(engineRef.current.world).filter(b => !b.isStatic)
    const constraints = Composite.allConstraints(engineRef.current.world)
    bodies.forEach(stopMotor)
    World.remove(engineRef.current.world, bodies)
    World.remove(engineRef.current.world, constraints)
    setSelectedBody(null)
    setBodyCount(0)
    setAnalyticsData([])
  }, [])

  // ── Constraint actions ──────────────────────────────────────────────────

  const addConstraint = useCallback((type, bodyA, bodyB = null, pointB = null) => {
    if (!engineRef.current || !bodyA) return null
    const c = _createConstraint(type, bodyA, bodyB, pointB)
    World.add(engineRef.current.world, c)
    return c
  }, [])

  const removeConstraint = useCallback((constraint) => {
    if (!engineRef.current || !constraint) return
    World.remove(engineRef.current.world, constraint)
  }, [])

  const removeAllConstraintsForBody = useCallback((body) => {
    if (!engineRef.current || !body) return
    const constraints = Composite.allConstraints(engineRef.current.world)
      .filter(c => c.bodyA?.id === body.id || c.bodyB?.id === body.id)
    constraints.forEach(c => World.remove(engineRef.current.world, c))
  }, [])

  // ── Motor ───────────────────────────────────────────────────────────────

  const toggleMotor = useCallback((body, speed = 0.06) => {
    if (!body) return
    if (isMotorRunning(body)) {
      stopMotor(body)
    } else {
      startMotor(body, speed)
    }
    // Force re-render of inspector by cloning selected ref
    setSelectedBody(b => b?.id === body.id ? { ...body } : b)
  }, [])

  // ── Query ───────────────────────────────────────────────────────────────

  const getBodyAtPoint = useCallback((point) => {
    if (!engineRef.current) return null
    return queryBodyAtPoint(engineRef.current, point)
  }, [])

  // ── Engine controls ─────────────────────────────────────────────────────

  const setRunning = useCallback((running) => {
  if (runnerRef.current) runnerRef.current.enabled = running
}, [])

  const updateGravity = useCallback((y) => {
    if (engineRef.current) setGravity(engineRef.current, 0, y)
  }, [])

  const resetVelocities = useCallback(() => {
    if (!engineRef.current) return
    Composite.allBodies(engineRef.current.world)
      .filter(b => !b.isStatic)
      .forEach(b => {
        Body.setVelocity(b, { x: 0, y: 0 })
        Body.setAngularVelocity(b, 0)
      })
  }, [])

  return {
    ready, engineRef, renderRef, bodyCount,
    selectedBody, setSelectedBody,
    analyticsData,
    // Body
    addBody, removeBody, clearAll,
    // Constraint
    addConstraint, removeConstraint, removeAllConstraintsForBody,
    // Motor
    toggleMotor,
    // Query
    getBodyAtPoint,
    // Engine
    setRunning, updateGravity, resetVelocities,
  }
}
