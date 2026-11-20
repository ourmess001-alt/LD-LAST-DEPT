'use client';

import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { SHOWROOM_CONFIG } from '@/config/showroom';
import { useStore } from '@/store/useStore';
import { CameraRig } from './CameraRig';
import { LightingRig } from './LightingRig';
import { ProductGallery } from './ProductGallery';

export default function SceneCanvas() {
  const setActiveProductId = useStore((s) => s.setActiveProductId);

  return (
    <div className="absolute inset-0 w-full h-full bg-[#0d0c14]">
      <Canvas
        shadows
        camera={{
          position: SHOWROOM_CONFIG.camera.overviewPosition,
          fov: SHOWROOM_CONFIG.camera.fov,
          near: SHOWROOM_CONFIG.camera.near,
          far: SHOWROOM_CONFIG.camera.far,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.95,
        }}
      >
        <color attach="background" args={[SHOWROOM_CONFIG.lighting.background]} />
        <fog attach="fog" args={[SHOWROOM_CONFIG.lighting.background, 12, 32]} />

        {/* High-End Procedural Studio Softbox Reflections (Clean, Deep, Luxury Contrast) */}
        <Environment resolution={256}>
          <group rotation={[-Math.PI / 4, -0.3, 0]}>
            <Lightformer
              form="rect"
              intensity={2.2}
              position={[0, 7, -1]}
              scale={[14, 5, 1]}
              color="#ffffff"
            />
            <Lightformer
              form="rect"
              intensity={1.5}
              position={[-6, 2, 2]}
              scale={[8, 3, 1]}
              color="#ff6b4a"
            />
            <Lightformer
              form="rect"
              intensity={1.2}
              position={[6, 2, 2]}
              scale={[8, 3, 1]}
              color="#a78bfa"
            />
            <Lightformer
              form="ring"
              intensity={1.8}
              position={[0, 4, 3]}
              scale={5}
              color="#ffffff"
            />
          </group>
        </Environment>

        {/* Dynamic Multi-point Studio Lighting */}
        <LightingRig />

        {/* Smooth Camera Interpolation Rig using damp3 */}
        <CameraRig />

        {/* Floating Shelf Architecture & 10 Interactive 3D Sneakers */}
        <ProductGallery />

        {/* Soft floor shadow beneath shelves */}
        <ContactShadows
          position={[0, -2.6, 0]}
          opacity={0.65}
          scale={28}
          blur={2.4}
          far={8}
          color="#040306"
        />

        {/* Post-processing Bloom for emissive neon edge & sole glow */}
        <EffectComposer enableNormalPass={false} multisampling={4}>
          <Bloom
            luminanceThreshold={0.88}
            luminanceSmoothing={0.2}
            intensity={0.6}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
