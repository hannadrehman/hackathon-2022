import * as THREE from "three";
import { useState, useRef, Fragment, useLayoutEffect, useEffect } from "react";
import { Canvas, applyProps } from "@react-three/fiber";
import {
  OrbitControls,
  CubeCamera,
  useBoxProjectedEnv,
  Text,
  Html,
  Environment,
  BakeShadows,
  useGLTF,
  Stars,
  Billboard,
  PositionalAudio,
} from "@react-three/drei";
import { useControls } from "leva";
import { Stacy } from "./scenes/Stacy";
import { VRButton } from "./WebVr";
import { getMousePos } from "./utls";

function SceneSelector({ onChange, position }) {
  const [scene, setSecene] = useState("");
  function handleChange(name) {
    onChange(name);
    setSecene(scene);
  }
  return (
    <Html position={position}>
      <select value={scene} onChange={(e) => handleChange(e.target.value)}>
        <option value="">Select Scene</option>
        <option value="field">Field</option>
        <option value="court">Court</option>
      </select>
    </Html>
  );
}

function ExcerciseSelector({ onAnimationChange, animation }) {
  function onChange(val) {
    onAnimationChange(val);
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
  );
}

function Field({ onSceneChange }) {
  const d = 8.25;
  const mouse = useRef({ x: 0, y: 0 });
  const [animation, setAnimation] = useState("idle");
  const [counter, setCounter] = useState(0);
  const [startExercise, setStartExercise] = useState(false);
  const [hoverStartExercise, setHoverStartExercise] = useState(false);
  const [hoverJumpRope, setHoverJumpRope] = useState(false);
  const [hoverDance, setHoverDance] = useState(false);
  const [hoverJump, setHoverJump] = useState(false);
  const [showExercise, setShowExercise] = useState(false);

  useEffect(() => {
    counter > 0 && setTimeout(() => setCounter(counter - 1), 1000);
  }, [counter]);

  useEffect(() => {
    if (counter === 0) {
      setAnimation(null);
    }
  }, [counter]);

  function handleStartExercise() {
    setStartExercise(true);
    setShowExercise(true);
  }

  function handleAnimationSelection(value) {
    setAnimation(value);
    setCounter(20);
  }

  return (
    <Canvas
      vr
      onCreated={({ gl }) => {
        document.body.appendChild(VRButton.createButton(gl));
      }}
      onMouseMove={(e) => (mouse.current = getMousePos(e))}
      shadows
      shadowMap
      pixelRatio={[1, 1.5]}
      camera={{ position: [0, 3, 18] }}
    >
      <color attach="background" args={["black"]} />

      <OrbitControls />
      <mesh
        rotation={[-0.5 * Math.PI, 0, 0]}
        position={[0, -10, 0]}
        receiveShadow
      >
        <ambientLight intensity={0.6} />
        <planeBufferGeometry args={[500, 500, 1, 1]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
      <Stars radius={100} depth={50} count={15000} factor={2} saturation fade />
      <hemisphereLight
        skyColor="black"
        groundColor="green"
        intensity={0.5}
        position={[0, 50, 0]}
      />
      <directionalLight
        position={[-8, 20, 8]}
        shadow-camera-left={d * -1}
        shadow-camera-bottom={d * -1}
        shadow-camera-right={d}
        shadow-camera-top={d}
        shadow-camera-near={0.1}
        shadow-camera-far={1500}
        castShadow
      />
      <gridHelper args={[100, 100, `white`, `green`]} position={[0, -10, 0]} />
      <Text fontSize={2} color="red" position={[0, 10, -4]}>
        Healthify Studio
      </Text>

      {counter <= 20 && counter !== 0 && animation === "dance" && (
        <PositionalAudio autoplay loop url="/music1.mp3" distance={5} />
      )}
      {counter <= 20 &&
        counter !== 0 &&
        (animation === "jumprope" || animation === "jump") && (
          <PositionalAudio autoplay loop url="/music2.mp3" distance={5} />
        )}
      {counter <= 20 && counter !== 0 && (
        <Text fontSize={2} position={[0, 9, -10]} color="white">
          {counter}
        </Text>
      )}

      <Billboard
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false} // Lock the rotation on the z axis (default=false)
        position={[-20, -0.2, -0.3]}
      >
        <Text
          fontSize={1}
          color="red"
          onClick={() => onSceneChange("home")}
          curveSegments={32}
        >
          Exit
        </Text>
      </Billboard>
      {!showExercise && (
        <Text
          onPointerOver={() => setHoverStartExercise(true)}
          onPointerOut={() => setHoverStartExercise(false)}
          fontSize={2}
          position={[0, 0, -2]}
          scale={hoverStartExercise ? [1.2, 1.2, 1.2] : [1, 1, 1]}
          onClick={handleStartExercise}
          color="white"
        >
          Choose Exercise
        </Text>
      )}
      {showExercise && counter === 0 && (
        <>
          <Text
            onPointerOver={() => setHoverJumpRope(true)}
            onPointerOut={() => setHoverJumpRope(false)}
            fontSize={0.8}
            scale={hoverJumpRope ? [1.2, 1.2, 1.2] : [1, 1, 1]}
            onClick={(e) => handleAnimationSelection("jumprope")}
            position={[-6, 6, -4]}
          >
            Jump Rope
          </Text>
          <Text
            onPointerOver={() => setHoverDance(true)}
            onPointerOut={() => setHoverDance(false)}
            fontSize={0.8}
            scale={hoverDance ? [1.2, 1.2, 1.2] : [1, 1, 1]}
            onClick={(e) => handleAnimationSelection("dance")}
            position={[0, 6, -4]}
          >
            Dance
          </Text>
          <Text
            onPointerOver={() => setHoverJump(true)}
            onPointerOut={() => setHoverJump(false)}
            fontSize={0.8}
            scale={hoverJump ? [1.2, 1.2, 1.2] : [1, 1, 1]}
            onClick={(e) => handleAnimationSelection("jump")}
            position={[6, 6, -4]}
          >
            Jump
          </Text>
        </>
      )}
      <Stacy
        animation={animation}
        mouse={mouse}
        position={[0, -10, -17]}
        scale={[0.08, 0.08, 0.08]}
      />
    </Canvas>
  );
}

function Court({ onSceneChange }) {
  const mouse = useRef({ x: 0, y: 0 });
  const [animation, setAnimation] = useState("idle");
  const [counter, setCounter] = useState(0);
  const [startExercise, setStartExercise] = useState(false);
  const [hoverStartExercise, setHoverStartExercise] = useState(false);
  const [hoverJumpRope, setHoverJumpRope] = useState(false);
  const [hoverDance, setHoverDance] = useState(false);
  const [hoverJump, setHoverJump] = useState(false);
  const [showExercise, setShowExercise] = useState(false);

  useEffect(() => {
    counter > 0 && setTimeout(() => setCounter(counter - 1), 1000);
  }, [counter]);

  useEffect(() => {
    if (counter === 0) {
      setAnimation(null);
    }
  }, [counter]);

  function handleStartExercise() {
    setStartExercise(true);
    setShowExercise(true);
  }

  function handleAnimationSelection(value) {
    setAnimation(value);
    setCounter(20);
  }

  return (
    <Canvas
      vr="true"
      onCreated={({ gl }) => {
        document.body.appendChild(VRButton.createButton(gl));
      }}
      onMouseMove={(e) => (mouse.current = getMousePos(e))}
      shadows
      camera={{ position: [0, -8, 5], fov: 80 }}
    >
      <fog attach="fog" args={["purple", 0, 130]} />
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
        <spotLight
          angle={0.1}
          position={[-250, 120, -200]}
          intensity={1}
          castShadow
          shadow-mapSize={[50, 50]}
          shadow-bias={-0.000001}
        />
        <spotLight
          angle={0.1}
          position={[250, 120, 200]}
          intensity={1}
          castShadow
          shadow-mapSize={[50, 50]}
          shadow-bias={-0.000001}
        />
        <CourtBase />
        <Floor />
      </group>
      <OrbitControls minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} />
      <Environment
        files="https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/hdris/noon-grass/noon_grass_1k.hdr"
        background
      />
      <BakeShadows />
      <Text fontSize={2} color="red" position={[0, 5, -4]}>
        Healthify Studio
      </Text>

      {counter <= 20 && counter !== 0 && animation === "dance" && (
        <PositionalAudio autoplay loop url="/music1.mp3" distance={5} />
      )}
      {counter <= 20 &&
        counter !== 0 &&
        (animation === "jumprope" || animation === "jump") && (
          <PositionalAudio autoplay loop url="/music2.mp3" distance={5} />
        )}
      {counter <= 20 && counter !== 0 && (
        <Text fontSize={2} position={[0, 10, -10]} color="white">
          {counter}
        </Text>
      )}

      <Billboard
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false} // Lock the rotation on the z axis (default=false)
        position={[-12, -0.2, -0.3]}
      >
        <Text
          fontSize={1}
          color="red"
          onClick={() => onSceneChange("home")}
          curveSegments={32}
        >
          Exit
        </Text>
      </Billboard>
      {!showExercise && (
        <Text
          onPointerOver={() => setHoverStartExercise(true)}
          onPointerOut={() => setHoverStartExercise(false)}
          fontSize={2}
          position={[0, 0, -2]}
          scale={hoverStartExercise ? [1.2, 1.2, 1.2] : [1, 1, 1]}
          onClick={handleStartExercise}
          color="white"
        >
          Choose Exercise
        </Text>
      )}
      {showExercise && counter === 0 && (
        <>
          <Text
            onPointerOver={() => setHoverJumpRope(true)}
            onPointerOut={() => setHoverJumpRope(false)}
            fontSize={0.8}
            scale={hoverJumpRope ? [1.2, 1.2, 1.2] : [1, 1, 1]}
            onClick={(e) => handleAnimationSelection("jumprope")}
            position={[-6, 2, -4]}
          >
            Jump Rope
          </Text>
          <Text
            onPointerOver={() => setHoverDance(true)}
            onPointerOut={() => setHoverDance(false)}
            fontSize={0.8}
            scale={hoverDance ? [1.2, 1.2, 1.2] : [1, 1, 1]}
            onClick={(e) => handleAnimationSelection("dance")}
            position={[0, 2, -4]}
          >
            Dance
          </Text>
          <Text
            onPointerOver={() => setHoverJump(true)}
            onPointerOut={() => setHoverJump(false)}
            fontSize={0.8}
            scale={hoverJump ? [1.2, 1.2, 1.2] : [1, 1, 1]}
            onClick={(e) => handleAnimationSelection("jump")}
            position={[6, 2, -4]}
          >
            Jump
          </Text>
        </>
      )}
      {counter <= 10 && counter !== 0 && (
        <Text fontSize={1} color="white" position={[0, 2, -4]}>
          {counter}
        </Text>
      )}
      {showExercise && (
        <Stacy
          animation={animation}
          mouse={mouse}
          position={[0, -1.5, -4]}
          scale={[0.012, 0.012, 0.012]}
        />
      )}
    </Canvas>
  );
}

function Home({ onSceneChange }) {
  const mouse = useRef({ x: 0, y: 0 });
  const [hoverCourtEnv, setHoverCourtEnv] = useState(false);
  const [hoverFieldEnv, setHoverFieldEnv] = useState(false);

  function handleEnvSelection(value) {
    onSceneChange(value);
  }

  return (
    <Canvas
      vr="true"
      onCreated={({ gl }) => {
        document.body.appendChild(VRButton.createButton(gl));
      }}
      onMouseMove={(e) => (mouse.current = getMousePos(e))}
      shadows
      camera={{ position: [0, 0, 30], fov: 5 }}
    >
      <fog attach="fog" args={["purple", 0, 130]} />
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
        <spotLight
          angle={0.1}
          position={[-250, 120, -200]}
          intensity={1}
          castShadow
          shadow-mapSize={[50, 50]}
          shadow-bias={-0.000001}
        />
        <spotLight
          angle={0.1}
          position={[250, 120, 200]}
          intensity={1}
          castShadow
          shadow-mapSize={[50, 50]}
          shadow-bias={-0.000001}
        />
        <HomeBase />
        <Floor />
      </group>
      <OrbitControls minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} />
      <BakeShadows />
      <Text fontSize={0.3} position={[0, 0.6, 0]} color="red">
        Healthify
      </Text>
      <Text fontSize={0.2} position={[0, 0.4, 0]} color="grey">
        Studio
      </Text>
      <Text
        fontSize={0.2}
        position={[1, -0.4, 0]}
        color="black"
        onPointerOver={() => setHoverCourtEnv(true)}
        onPointerOut={() => setHoverCourtEnv(false)}
        scale={hoverCourtEnv ? [1.2, 1.2, 1.2] : [1, 1, 1]}
        onClick={(e) => handleEnvSelection("court")}
      >
        Court Feel
      </Text>
      <Text
        fontSize={0.2}
        position={[-1, -0.4, 0]}
        color="black"
        onPointerOver={() => setHoverFieldEnv(true)}
        onPointerOut={() => setHoverCourtEnv(false)}
        scale={hoverFieldEnv ? [1.2, 1.2, 1.2] : [1, 1, 1]}
        onClick={(e) => handleEnvSelection("field")}
      >
        Field Feel
      </Text>
    </Canvas>
  );
}

function CourtBase(props) {
  const { scene, nodes } = useGLTF("/court-transformed.glb");
  useLayoutEffect(() => {
    scene.traverse((o) => {
      if (o.isMesh) {
        if (o === nodes.GymFloor_ParquetShader_0) o.parent.remove(o);
        else
          applyProps(o, {
            castShadow: true,
            receiveShadow: true,
            "material-envMapIntensity": 0.1,
          });
      }
    });
  }, [nodes.GymFloor_ParquetShader_0, scene]);
  return <primitive object={scene} {...props} />;
}

function HomeBase(props) {
  const { scene, nodes } = useGLTF("/dining_room__kichen_baked.glb");
  useLayoutEffect(() => {
    scene.traverse((o) => {
      if (o.isMesh) {
        if (o === nodes.GymFloor_ParquetShader_0) o.parent.remove(o);
        else
          applyProps(o, {
            castShadow: true,
            receiveShadow: true,
            "material-envMapIntensity": 0.1,
          });
      }
    });
  }, [nodes.GymFloor_ParquetShader_0, scene]);
  return <primitive object={scene} {...props} />;
}

function Floor(props) {
  const { nodes, materials } = useGLTF("/court-transformed.glb");
  const { up, scale, ...config } = useControls({
    up: { value: -0.5, min: -10, max: 10 },
    scale: { value: 27, min: 0, max: 50 },
    roughness: { value: 0.06, min: 0, max: 0.15, step: 0.001 },
    envMapIntensity: { value: 1, min: 0, max: 5 },
  });
  const projection = useBoxProjectedEnv([0, up, 0], [scale, scale, scale]);
  return (
    <CubeCamera
      frames={1}
      position={[0, 0.5, 0]}
      rotation={[0, 0, 0]}
      resolution={2048}
      near={1}
      far={1000}
      {...props}
    >
      {(texture) => (
        <mesh
          receiveShadow
          position={[-13.68, -0.467, 17.52]}
          scale={0.02}
          geometry={nodes.GymFloor_ParquetShader_0.geometry}
          dispose={null}
        >
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
  );
}

export default function App() {
  const [scene, setScene] = useState("home");
  return (
    <Fragment>
      {scene === "home" && <Home onSceneChange={(name) => setScene(name)} />}
      {scene === "field" && <Field onSceneChange={(name) => setScene(name)} />}
      {scene === "court" && <Court onSceneChange={(name) => setScene(name)} />}
    </Fragment>
  );
}
