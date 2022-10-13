import * as THREE from 'three'
import React, { useEffect, useRef, useState } from 'react'
import { useLoader, useFrame } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { getMouseDegrees } from '../utls'

function moveJoint(mouse, joint, degreeLimit = 40) {
  let degrees = getMouseDegrees(mouse.current.x, mouse.current.y, degreeLimit)
  joint.rotation.xD = THREE.MathUtils.lerp(joint.rotation.xD || 0, degrees.y, 0.1)
  joint.rotation.yD = THREE.MathUtils.lerp(joint.rotation.yD || 0, degrees.x, 0.1)
  joint.rotation.x = THREE.MathUtils.degToRad(joint.rotation.xD)
  joint.rotation.y = THREE.MathUtils.degToRad(joint.rotation.yD)
}

export function Stacy({ mouse, animation = 'idle', ...props }) {
  const group = useRef()
  const { nodes, animations } = useLoader(GLTFLoader, '/stacy.glb')
  const texture = useLoader(THREE.TextureLoader, '/stacy.jpg')

  const actions = useRef()
  const [mixer] = useState(() => new THREE.AnimationMixer())
  useFrame((state, delta) => mixer.update(delta))
  useEffect(() => {
    actions.current = {
      checkPockets: mixer.clipAction(animations[0], group.current),
      jumprope: mixer.clipAction(animations[1], group.current),
      dance: mixer.clipAction(animations[2], group.current),
      jump: mixer.clipAction(animations[3], group.current),
      scared: mixer.clipAction(animations[4], group.current),
      idunno: mixer.clipAction(animations[5], group.current),
      hello: mixer.clipAction(animations[6], group.current),
      golf: mixer.clipAction(animations[7], group.current),
      idle: mixer.clipAction(animations[8], group.current)
    }
    if (typeof actions.current[animation] === 'undefined') {
      animation = 'idle'
    }
    Object.values(actions.current).forEach((a) => a.stop())
    actions.current[animation].play()
  }, [animation])

  // useFrame((state, delta) => {
  //   mixer.update(delta)
  //   moveJoint(mouse, nodes.mixamorigNeck)
  //   moveJoint(mouse, nodes.mixamorigSpine)
  // })

  return (
    <group ref={group} {...props} dispose={null}>
      <group rotation={[Math.PI / 2, 0, 0]}>
        <primitive object={nodes['mixamorigHips']} />
        <skinnedMesh receiveShadow castShadow geometry={nodes['stacy'].geometry} skeleton={nodes['stacy'].skeleton}>
          <meshStandardMaterial map={texture} map-flipY={false} skinning />
        </skinnedMesh>
      </group>
    </group>
  )
}
