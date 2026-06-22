import './App.css'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Stars } from '@react-three/drei'
import { useRef, useState, useEffect } from 'react'

function OrbitingDevice({angle, phase, flaggedIndex, index})
{
  const smallPlanet = useRef()
  const radiusRef = useRef(2)
  useFrame((state) => {

    const isFlag = phase === 'flagged' && index === flaggedIndex
    const target = isFlag ? 3 : 2

    radiusRef.current += (target - radiusRef.current) * 0.05

    smallPlanet.current.position.x = radiusRef.current * Math.cos(angle + state.clock.elapsedTime)
    smallPlanet.current.position.z = radiusRef.current * Math.sin(angle + state.clock.elapsedTime)

    smallPlanet.current.material.color.set(isFlag ? '#fb0000' : '#b1b1b1')
  })

  return (
    <mesh ref={smallPlanet}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshToonMaterial color={"#b1b1b1"} />
    </mesh>
  )
}

function OrbitText()
{
  const orbitText = useRef()

  useFrame((state, deltaTime)=> {
    orbitText.current.outlineOpacity = 0.3 + Math.sin(state.clock.elapsedTime * 0.8) * 0.7
  })

  return(
    <Text position={[0, 0, 0]} 
          fontSize={1} 
          color="white"
          fillOpacity={1}
          outlineWidth={0.02}
          outlineColor="#ffffff"
          ref={orbitText}>Orbit.</Text>
  )
}

function LandingPage() {
  const [phase, setPhase] = useState('explosion')
  const [flaggedIndex] = useState(Math.floor(Math.random() * 5))

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('flagged'), 1500)
    const t2 = setTimeout(() => setPhase('settle'), 5000)
    

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  return (
    <div className="main-section">

      <div className='canvas-section'>
        <Canvas>
          <ambientLight intensity={0.3} />

          <pointLight 
              position={[3, 3, 3]} 
              intensity={50} 
              color="#cdcdcd" />

          <Stars />

          <OrbitText />
          <OrbitingDevice angle={0} phase={phase} flaggedIndex={flaggedIndex} index={0}/>
          <OrbitingDevice angle={Math.PI * 2 / 5} phase={phase} flaggedIndex={flaggedIndex} index={1}/>
          <OrbitingDevice angle={Math.PI * 4 / 5} phase={phase} flaggedIndex={flaggedIndex} index={2}/>
          <OrbitingDevice angle={Math.PI * 6 / 5} phase={phase} flaggedIndex={flaggedIndex} index={3}/>
          <OrbitingDevice angle={Math.PI * 8 / 5} phase={phase} flaggedIndex={flaggedIndex} index={4}/>
        </Canvas>
      </div>

    </div>
  )
}

export default LandingPage