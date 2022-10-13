import * as THREE from 'three'
import { useState, useRef, Fragment, useLayoutEffect } from 'react'
import { Canvas, applyProps } from '@react-three/fiber'
import { OrbitControls, CubeCamera, useBoxProjectedEnv, Preload, Text, Html, Environment, BakeShadows, useGLTF } from '@react-three/drei'
import { useControls } from 'leva'
import { Stacy } from './scenes/Stacy'
import { VRButton } from './WebVr'
import { getMousePos } from './utls'

function SceneSelector({ onChange, position }) {
  const [scene, setSecene] = useState('')
  function handleChange(name) {
    onChange(name)
    setSecene(scene)
  }
  return (
    <Html position={position}>
      <select value={scene} onChange={(e) => handleChange(e.target.value)}>
        <option value="">Select Scene</option>
        <option value="field">Field</option>
        <option value="court">Court</option>
      </select>
    </Html>
  )
}

function ExcerciseSelector({ onAnimationChange, animation }) {
  function onChange(val) {
    onAnimationChange(val)
  }
  return (
    <Html position={[0.6, 0.13, 0.3]}>
      <select value={animation} onChange={(e) => onChange(e.target.value)}>
        <option value="checkPockets">Check Pockets</option>
        <option value="jumprope">Jump Rope</option>
        <option value="dance">Dance</option>
        <option value="jump">Jump</option>
        <option value="scared">Scared</option>
        <option value="idunno">I Dunno</option>
        <option value="hello">Hello</option>
        <option value="golf">Golf Swing</option>
        <option value="idle">Idle</option>
      </select>
    </Html>
  )
}

function Field({ onSceneChange }) {
  const mouse = useRef({ x: 0, y: 0 })
  const [animation, setAnimation] = useState('idle')
  const env = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/evening_road_01_2k.hdr'
  return (
    <Canvas
      vr
      onCreated={({ gl }) => {
        document.body.appendChild(VRButton.createButton(gl))
      }}
      onMouseMove={(e) => (mouse.current = getMousePos(e))}
      shadows
      camera={{ position: [0, 0, 12], fov: 30 }}>
      <Environment files={env} ground={{ height: 5, radius: 40, scale: 20 }} />
      <OrbitControls autoRotateSpeed={0.85} zoomSpeed={0.75} minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 2.55} />
      <Text font={200} position={[0.1, 1.5, 0.3]}>
        HealthifyStudio
      </Text>
      <ExcerciseSelector animation={animation} onAnimationChange={(e) => setAnimation(e)} />
      <SceneSelector position={[1, 1, 1]} onChange={onSceneChange} />
      <Stacy animation={animation} mouse={mouse} position={[0, -10, -17]} scale={[0.05, 0.05, 0.05]} />
    </Canvas>
  )
}

function Court({ onSceneChange }) {
  const mouse = useRef({ x: 0, y: 0 })
  const [animation, setAnimation] = useState('idle')
  return (
    <Canvas
      vr="true"
      onCreated={({ gl }) => {
        document.body.appendChild(VRButton.createButton(gl))
      }}
      onMouseMove={(e) => (mouse.current = getMousePos(e))}

      shadows>
      <fog attach="fog" args={['purple', 0, 130]} />
      <ambientLight intensity={0.1} />
      <group position={[0, -2, 0]}>
        <spotLight
          castShadow
          intensity={10}
          angle={0.1}
          position={[-200, 220, -100]}
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.000001}
        />
        <spotLight angle={0.1} position={[-250, 120, -200]} intensity={1} castShadow shadow-mapSize={[50, 50]} shadow-bias={-0.000001} />
        <spotLight angle={0.1} position={[250, 120, 200]} intensity={1} castShadow shadow-mapSize={[50, 50]} shadow-bias={-0.000001} />
        <CourtBase />
        <Floor />
      </group>
      <OrbitControls minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} />
      <Environment
        files="https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/hdris/noon-grass/noon_grass_1k.hdr"
        background
      />
      <BakeShadows />
      <Text font={200} position={[0.1, 1.5, 0.3]}>
        HealthifyStudio
      </Text>
      <ExcerciseSelector animation={animation} onAnimationChange={(e) => setAnimation(e)} />
      <SceneSelector position={[1, 1, 1]} onChange={onSceneChange} />
      <Stacy animation={animation} mouse={mouse} position={[0, -1, 2]} scale={[0.014, 0.014, 0.014]} />
    </Canvas>
  )
}

function CourtBase(props) {
  const { scene, nodes } = useGLTF('/court-transformed.glb')
  useLayoutEffect(() => {
    scene.traverse((o) => {
      if (o.isMesh) {
        if (o === nodes.GymFloor_ParquetShader_0) o.parent.remove(o)
        else applyProps(o, { castShadow: true, receiveShadow: true, 'material-envMapIntensity': 0.1 })
      }
    })
  }, [])
  return <primitive object={scene} {...props} />
}

function Floor(props) {
  const { nodes, materials } = useGLTF('/court-transformed.glb')
  const { up, scale, ...config } = useControls({
    up: { value: -0.5, min: -10, max: 10 },
    scale: { value: 27, min: 0, max: 50 },
    roughness: { value: 0.06, min: 0, max: 0.15, step: 0.001 },
    envMapIntensity: { value: 1, min: 0, max: 5 }
  })
  const projection = useBoxProjectedEnv([0, up, 0], [scale, scale, scale])
  return (
    <CubeCamera frames={1} position={[0, 0.5, 0]} rotation={[0, 0, 0]} resolution={2048} near={1} far={1000} {...props}>
      {(texture) => (
        <mesh
          receiveShadow
          position={[-13.68, -0.467, 17.52]}
          scale={0.02}
          geometry={nodes.GymFloor_ParquetShader_0.geometry}
          dispose={null}>
          <meshStandardMaterial
            map={materials.ParquetShader.map}
            normalMap={materials.ParquetShader.normalMap}
            normalMap-encoding={THREE.LinearEncoding}
            envMap={texture}
            metalness={0.0}
            normalScale={[0.25, -0.25]}
            color="#aaa"
            {...projection}
            {...config}
          />
        </mesh>
      )}
    </CubeCamera>
  )
}

export default function App() {
  const [scene, setScene] = useState('field')
  return (
    <Fragment>
      {scene === 'field' && <Field onSceneChange={(name) => setScene(name)} />}
      {scene === 'court' && <Court onSceneChange={(name) => setScene(name)} />}
    </Fragment>
  )
}
