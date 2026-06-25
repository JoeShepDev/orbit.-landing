import './App.css'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text, Stars } from '@react-three/drei'
import { useRef, useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { MathUtils, Vector3 } from 'three'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

function OrbitingDevice({ angle, phase, flaggedIndex, index, flaggedPositionRef }) {
  const smallPlanet = useRef()
  const radiusRef = useRef(0.1)
  const yRef = useRef(0)

  useFrame((state, delta) => {
    const isFlag = phase === 'flagged' || phase === 'zoom' || phase === 'return'
      ? index === flaggedIndex
      : false

    const targetRadius = phase === 'explosion'
      ? 0.1
      : (phase === 'flagged' || phase === 'zoom') && index === flaggedIndex
      ? 3
      : 2

    radiusRef.current = MathUtils.damp(radiusRef.current, targetRadius, 2, delta)

    const yTarget = phase === 'diagonal'
      ? Math.sin(angle + state.clock.elapsedTime) * 0.8 * Math.cos(angle)
      : 0
    yRef.current = MathUtils.damp(yRef.current, yTarget, 1.5, delta)

    const x = radiusRef.current * Math.cos(angle + state.clock.elapsedTime)
    const z = radiusRef.current * Math.sin(angle + state.clock.elapsedTime)

    smallPlanet.current.position.x = x
    smallPlanet.current.position.z = z
    smallPlanet.current.position.y = yRef.current

    if (index === flaggedIndex && flaggedPositionRef) {
      flaggedPositionRef.current.x = x
      flaggedPositionRef.current.z = z
      flaggedPositionRef.current.y = yRef.current
    }

    const targetColor = (phase === 'flagged' || phase === 'zoom') && index === flaggedIndex
      ? '#ff0000'
      : '#b1b1b1'
    smallPlanet.current.material.color.set(targetColor)
  })

  return (
    <mesh ref={smallPlanet}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshToonMaterial color="#b1b1b1" />
    </mesh>
  )
}

function OrbitText({ phase }) {
  const orbitText = useRef()
  const opacityRef = useRef(0)
  const fontSizeRef = useRef(1)

  useFrame((state, delta) => {
    if (!orbitText.current) return

    const targetOpacity = phase === 'explosion' ? 0 : 1
    opacityRef.current = MathUtils.damp(opacityRef.current, targetOpacity, 2, delta)
    orbitText.current.fillOpacity = opacityRef.current
    orbitText.current.outlineOpacity = (0.1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.7) * opacityRef.current

    const targetSize = phase === 'flagged' || phase === 'zoom' ? 0.3 : 1
    fontSizeRef.current = MathUtils.damp(fontSizeRef.current, targetSize, 3, delta)
    orbitText.current.fontSize = fontSizeRef.current
  })

  const getText = () => {
    if (phase === 'flagged' || phase === 'zoom') return 'device flagged.'
    return 'Orbit.'
  }

  return (
    <Text
      position={[0, 0, 0]}
      color="white"
      fillOpacity={0}
      outlineWidth={0.02}
      outlineColor="#ffffff"
      fontSize={1}
      ref={orbitText}
    >
      {getText()}
    </Text>
  )
}

function CameraController({ phase, flaggedPositionRef }) {
  const { camera } = useThree()
  const currentPos = useRef(new Vector3(0, 0, 5))

  useFrame((_, delta) => {
    let targetX = 0
    let targetY = 0
    let targetZ = 5

    if (phase === 'zoom' && flaggedPositionRef.current) {
      const fp = flaggedPositionRef.current
      targetX = fp.x * 0.5
      targetY = fp.y + 0.5
      targetZ = fp.z + 2.5
    }

    currentPos.current.x = MathUtils.damp(currentPos.current.x, targetX, 2, delta)
    currentPos.current.y = MathUtils.damp(currentPos.current.y, targetY, 2, delta)
    currentPos.current.z = MathUtils.damp(currentPos.current.z, targetZ, 2, delta)

    camera.position.copy(currentPos.current)
    camera.lookAt(
      phase === 'zoom' && flaggedPositionRef.current
        ? flaggedPositionRef.current.x
        : 0,
      phase === 'zoom' && flaggedPositionRef.current
        ? flaggedPositionRef.current.y
        : 0,
      phase === 'zoom' && flaggedPositionRef.current
        ? flaggedPositionRef.current.z
        : 0
    )
  })

  return null
}

function LandingPage() {
  const [phase, setPhase] = useState('explosion')
  const [flaggedIndex] = useState(Math.floor(Math.random() * 5))
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const flaggedPositionRef = useRef({ x: 0, y: 0, z: 0 })

  const handleSubmit = async () => {
    if (!email) return
    const { error } = await supabase.from('waitlist').insert([{ email }])
    if (!error) setSubmitted(true)
  }

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('diagonal'), 2000)
    const t2 = setTimeout(() => setPhase('settle'), 5000)
    const t3 = setTimeout(() => setPhase('flagged'), 7000)
    const t4 = setTimeout(() => setPhase('zoom'), 11000)
    const t5 = setTimeout(() => setPhase('return'), 14000)
    const t6 = setTimeout(() => setPhase('invite'), 17000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
      clearTimeout(t6)
    }
  }, [])

  return (
    <div className="main-section">
      <div className="canvas-section">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[3, 3, 3]} intensity={50} color="#cdcdcd" />
          <Stars />
          <OrbitText phase={phase} />
          <CameraController phase={phase} flaggedPositionRef={flaggedPositionRef} />
          <OrbitingDevice angle={0} phase={phase} flaggedIndex={flaggedIndex} index={0} flaggedPositionRef={flaggedPositionRef} />
          <OrbitingDevice angle={Math.PI * 2 / 5} phase={phase} flaggedIndex={flaggedIndex} index={1} flaggedPositionRef={flaggedPositionRef} />
          <OrbitingDevice angle={Math.PI * 4 / 5} phase={phase} flaggedIndex={flaggedIndex} index={2} flaggedPositionRef={flaggedPositionRef} />
          <OrbitingDevice angle={Math.PI * 6 / 5} phase={phase} flaggedIndex={flaggedIndex} index={3} flaggedPositionRef={flaggedPositionRef} />
          <OrbitingDevice angle={Math.PI * 8 / 5} phase={phase} flaggedIndex={flaggedIndex} index={4} flaggedPositionRef={flaggedPositionRef} />
        </Canvas>
      </div>

      <div className="waitlist-section">
        <h2>Know Who's Around You</h2>
        <p>
          Orbit. passive bluetooth safety. whether you're hyper-aware or oblivious — Orbit. keeps you safe and prevents incidents <em>before</em> they happen.
        </p>
        <input
          placeholder="johndoe@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {submitted
          ? <p>you're on the list.</p>
          : <button onClick={handleSubmit}>Join The Waitlist</button>
        }
      </div>
    </div>
  )
}

export default LandingPage