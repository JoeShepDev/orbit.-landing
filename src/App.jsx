import './App.css'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Stars } from '@react-three/drei'
import { useRef } from 'react'

function OrbitingDevice({angle})
{
  const smallPlanet = useRef()

  useFrame((state, deltaTime) => {
    smallPlanet.current.position.x = 2 * Math.cos(angle + state.clock.elapsedTime)
    smallPlanet.current.position.z = 2 * Math.sin(angle + state.clock.elapsedTime)
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
          <OrbitingDevice angle={0}/>
          <OrbitingDevice angle={Math.PI * 2 / 5}/>
          <OrbitingDevice angle={Math.PI * 4 / 5}/>
          <OrbitingDevice angle={Math.PI * 6 / 5}/>
          <OrbitingDevice angle={Math.PI * 8 / 5}/>
        </Canvas>
      </div>

    </div>
  )
}

export default LandingPage