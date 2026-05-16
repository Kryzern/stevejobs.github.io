import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, PresentationControls, useGLTF, Center } from '@react-three/drei';
import * as THREE from 'three';

export function MacModel() {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(import.meta.env.BASE_URL + 'macintosh_classic_1991.glb');

  scene.traverse((child) => {
    if ((child as any).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <PresentationControls 
       global 
       rotation={[0, 0.3, 0]} 
       polar={[-Math.PI / 3, Math.PI / 3]} 
       azimuth={[-Math.PI / 1.4, Math.PI / 2]}
    >
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <group ref={group} dispose={null}>
          <Center scale={[10, 10, 10]} position={[0, 0, 0]}>
            <primitive object={scene} />
          </Center>
        </group>
      </Float>
    </PresentationControls>
  );
}

useGLTF.preload(import.meta.env.BASE_URL + 'macintosh_classic_1991.glb');

