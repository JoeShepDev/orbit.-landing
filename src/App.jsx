import './App.css'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Stars } from '@react-three/drei'
import { useRef, useState, useEffect } from 'react'
import { MathUtils } from 'three'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

function OrbitingDevice({angle, phase, flaggedIndex, index})
{
  const smallPlanet = useRef()
  const radiusRef = useRef(2)
  const yRef = useRef(0)
  const yVelRef = useRef(0)

  useFrame((state, delta) => {
    const isFlag = phase === 'flagged' && index === flaggedIndex
    const target = isFlag ? 3 : 2

    radiusRef.current = MathUtils.damp(radiusRef.current, target, 3, delta)

    const yTarget = phase === 'diagonal' ? Math.sin(angle + state.clock.elapsedTime) * 0.5 * Math.cos(angle) : 0
    yRef.current = MathUtils.damp(yRef.current, yTarget, 1.5, delta)

    smallPlanet.current.position.x = radiusRef.current * Math.cos(angle + state.clock.elapsedTime)
    smallPlanet.current.position.z = radiusRef.current * Math.sin(angle + state.clock.elapsedTime)
    smallPlanet.current.position.y = yRef.current

    const targetColor = isFlag ? '#ff0000' : '#b1b1b1'
    smallPlanet.current.material.color.set(targetColor)
  })

  return (
    <mesh ref={smallPlanet}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshToonMaterial color={"#b1b1b1"} />
    </mesh>
  )
}

function OrbitText({phase})
{
  const orbitText = useRef()

  useFrame((state) => {
    orbitText.current.outlineOpacity = 0.1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.7
  })

  return(
    <Text position={[0, 0, 0]}
          color="white"
          fillOpacity={1}
          outlineWidth={0.02}
          outlineColor="#ffffff"
          fontSize={phase === 'flagged' ? 0.3 : 1}
          ref={orbitText}>
      {phase === 'flagged' ? 'device flagged.' : 'Orbit.'}
    </Text>
  )
}

function LandingPage() {

  const [phase, setPhase] = useState('explosion')
  const [flaggedIndex] = useState(Math.floor(Math.random() * 5))

  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!email) return

    const { error } = await supabase.from('waitlist').insert([{ email }])

    if (!error) setSubmitted(true)
  }
  
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('explosion'), 0)
    const t2 = setTimeout(() => setPhase('diagonal'), 2000)
    const t3 = setTimeout(() => setPhase('settle'), 5000)
    const t4 = setTimeout(() => setPhase('flagged'), 7000)
    const t5 = setTimeout(() => setPhase('zoom'), 11000)
    const t6 = setTimeout(() => setPhase('return'), 14000)
    const t7 = setTimeout(() => setPhase('invite'), 17000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
      clearTimeout(t6)
      clearTimeout(t7)
    }
  }, [])

  return (
    <div className="main-section">
      
      <div className='canvas-section'>

        <Canvas>
          <ambientLight intensity={0.3} />
          <pointLight position={[3, 3, 3]} intensity={50} color="#cdcdcd" />
          <Stars />
          <OrbitText phase={phase}/>
          <OrbitingDevice angle={0} phase={phase} flaggedIndex={flaggedIndex} index={0}/>
          <OrbitingDevice angle={Math.PI * 2 / 5} phase={phase} flaggedIndex={flaggedIndex} index={1}/>
          <OrbitingDevice angle={Math.PI * 4 / 5} phase={phase} flaggedIndex={flaggedIndex} index={2}/>
          <OrbitingDevice angle={Math.PI * 6 / 5} phase={phase} flaggedIndex={flaggedIndex} index={3}/>
          <OrbitingDevice angle={Math.PI * 8 / 5} phase={phase} flaggedIndex={flaggedIndex} index={4}/>
        </Canvas>

      </div>

      <div className='waitlist-section'>
        <h2>Know Who's Around You</h2>
        <p>Orbit. is an app that allows you to have better piece of mind about your surroundings. whether you're hyper-aware or oblivous, Orbit.
          keeps you safe and prevents accidents <em>before</em> they happen. Curious about using the app yourself? Then sign up for our waitlist below...
        </p>
        <input 
          placeholder='johndoe@email.com'
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