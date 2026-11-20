'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { PRODUCTS } from '@/data/products';

export function LightingRig() {
  const activeProductId = useStore((s) => s.activeProductId);
  const activeSpotRef = useRef<THREE.PointLight>(null);

  useFrame((_, delta) => {
    if (activeSpotRef.current) {
      if (activeProductId) {
        const prod = PRODUCTS.find((p) => p.id === activeProductId);
        if (prod) {
          activeSpotRef.current.position.x = THREE.MathUtils.damp(
            activeSpotRef.current.position.x,
            prod.position[0] + 0.25,
            6,
            delta
          );
          activeSpotRef.current.position.y = THREE.MathUtils.damp(
            activeSpotRef.current.position.y,
            prod.position[1] + 1.0,
            6,
            delta
          );
          activeSpotRef.current.position.z = THREE.MathUtils.damp(
            activeSpotRef.current.position.z,
            prod.position[2] + 1.4,
            6,
            delta
          );
          activeSpotRef.current.intensity = THREE.MathUtils.damp(
            activeSpotRef.current.intensity,
            2.2,
            5,
            delta
          );
        }
      } else {
        activeSpotRef.current.intensity = THREE.MathUtils.damp(
          activeSpotRef.current.intensity,
          0,
          5,
          delta
        );
      }
    }
  });

  return (
    <group>
      {/* Deep charcoal/indigo studio ambient tone */}
      <ambientLight intensity={0.4} color="#151224" />

      {/* Main architectural key light from top-center */}
      <directionalLight
        position={[1.5, 8, 4]}
        intensity={1.2}
        color="#ffffff"
      />

      {/* Warm red/orange rim lighting from bottom-left */}
      <directionalLight
        position={[-6, -1, 3]}
        intensity={0.8}
        color="#ff5a36"
      />

      {/* Cool muted royal purple fill lighting */}
      <directionalLight
        position={[6, 4, -2]}
        intensity={0.6}
        color="#8b5cf6"
      />

      {/* Front gentle studio fill to illuminate laces and toe box without harsh specular flare */}
      <directionalLight
        position={[0, 3.5, 7]}
        intensity={0.35}
        color="#ffffff"
      />

      {/* Dynamic tracking spot that illuminates the actively inspected sneaker */}
      <pointLight
        ref={activeSpotRef}
        position={[0, 2, 3]}
        intensity={0}
        distance={8}
        color="#ffffff"
      />
    </group>
  );
}
