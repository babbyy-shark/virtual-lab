/**
 * hooks/usePhysics.js
 * Initializes and manages the Matter.js engine + renderer lifecycle.
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import Matter from 'matter-js'
import {
  createEngine, createGround, createBody as _createBody,
  setGravity, getBodyKE, getBodyPE,
  MATERIAL_PRESETS,
} from '../physics/engine.js'

const { Render, Runner, World, Composite, Events, Mouse, MouseConstraint, Body } = Matter

export default function usePhysics(canvasRef, containerRef) {
  const engineRef  = useRef(null)
  const renderRef  = useRef(null)
  const runnerRef  = useRef(null)
  const mouseRef   = useRef(null)
  const [ready, setReady]           = useState(false)
  const [bodyCount, setBodyCount]   = useState(0)
  const [selectedBody, setSelectedBody] = useState(null)
  const [analyticsData, setAnalyticsData] = useState([])
  const analyticsTimer = useRef(null)

  // Init engine + renderer
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const { offsetWidth: W, offsetHeight: H } = containerRef.current
    const engine = createEngine()
    const grounds = createGround(W, H)
    World.add(engine.world, grounds)

    const render = Render.create({
      canvas: canvasRef.current,
      engine,
      options: {
        width: W,
        height: H,
        background: '#0a0a0f',
        wireframes: false,
        showVelocity: false,
        showAngleIndicator: false,
      },
    })

    const runner = Runner.create()

    // Mouse control
    const mouse = Mouse.create(render.canvas)
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    })
    World.add(engine.world, mouseConstraint)
    render.mouse = mouse
    mouseRef.current = mouseConstraint

    // Click → select body
    Events.on(mouseConstraint, 'mousedown', (e) => {
      const bodies = Composite.allBodies(engine.world).filter(b => !b.isStatic || b.label?.startsWith('wall'))
      const clicked = Matter.Query.point(bodies, e.mouse.position)[0]
      setSelectedBody(clicked || null)
    })

    // Track body count
    Events.on(engine, 'afterUpdate', () => {
      const count = Composite.allBodies(engine.world).filter(b => !b.isStatic).length
      setBodyCount(count)
    })

    Render.run(render)
    Runner.run(runner, engine)

    engineRef.current = engine
    renderRef.current = render
    runnerRef.current = runner
    setReady(true)

    // Analytics sampling every 200ms
    analyticsTimer.current = setInterval(() => {
      if (!engineRef.current) return
      const bodies = Composite.allBodies(engineRef.current.world).filter(b => !b.isStatic)
      if (bodies.length === 0) return
      const totalKE = bodies.reduce((s, b) => s + getBodyKE(b), 0)
      const totalPE = bodies.reduce((s, b) => s + getBodyPE(b, H - 30), 0)
      const maxSpeed = Math.max(...bodies.map(b => b.speed))
      setAnalyticsData(prev => [...prev.slice(-100), {
        t: Date.now(), ke: +totalKE.toFixed(2), pe: +totalPE.toFixed(2),
        total: +(totalKE + totalPE).toFixed(2), maxSpeed: +maxSpeed.toFixed(2),
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

  const addBody = useCallback((type, x, y, material, isStatic) => {
    if (!engineRef.current) return
    const body = _createBody(type, x, y, material, isStatic)
    World.add(engineRef.current.world, body)
    setBodyCount(c => c + 1)
    return body
  }, [])

  const removeBody = useCallback((body) => {
    if (!engineRef.current || !body) return
    World.remove(engineRef.current.world, body)
    setSelectedBody(null)
    setBodyCount(c => c - 1)
  }, [])

  const clearAll = useCallback(() => {
    if (!engineRef.current) return
    const bodies = Composite.allBodies(engineRef.current.world).filter(b => !b.isStatic)
    const constraints = Composite.allConstraints(engineRef.current.world)
    World.remove(engineRef.current.world, bodies)
    World.remove(engineRef.current.world, constraints)
    setSelectedBody(null)
    setBodyCount(0)
    setAnalyticsData([])
  }, [])

  const setRunning = useCallback((running) => {
    if (!runnerRef.current) return
    runnerRef.current.enabled = running
  }, [])

  const updateGravity = useCallback((y) => {
    if (!engineRef.current) return
    setGravity(engineRef.current, 0, y)
  }, [])

  const resetVelocities = useCallback(() => {
    if (!engineRef.current) return
    const bodies = Composite.allBodies(engineRef.current.world).filter(b => !b.isStatic)
    bodies.forEach(b => {
      Body.setVelocity(b, { x: 0, y: 0 })
      Body.setAngularVelocity(b, 0)
    })
  }, [])

  return {
    ready, engineRef, renderRef, bodyCount,
    selectedBody, setSelectedBody,
    analyticsData,
    addBody, removeBody, clearAll, setRunning,
    updateGravity, resetVelocities,
  }
}
