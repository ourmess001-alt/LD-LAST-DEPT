'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { damp3 } from 'maath/easing';
import { SHOWROOM_CONFIG } from '@/config/showroom';
import { useStore } from '@/store/useStore';
import { PRODUCTS } from '@/data/products';

export function CameraRig() {
  const activeProductId = useStore((s) => s.activeProductId);
  const { camera, pointer } = useThree();

  // Persistent vectors across frames (never allocate inside frame loop)
  const currentLookAt = useRef(new THREE.Vector3(...SHOWROOM_CONFIG.camera.overviewLookAt));
  const targetCamPos = useRef(new THREE.Vector3(...SHOWROOM_CONFIG.camera.overviewPosition));
  const targetLookAt = useRef(new THREE.Vector3(...SHOWROOM_CONFIG.camera.overviewLookAt));

  useFrame((_, delta) => {
    // Limit delta to prevent camera jumping on lag or background tab wake-up
    const safeDelta = Math.min(delta, 0.1);

    if (activeProductId) {
      const activeProd = PRODUCTS.find((p) => p.id === activeProductId);
      if (activeProd) {
        const [px, py, pz] = activeProd.position;
        const [ox, oy, oz] = SHOWROOM_CONFIG.camera.focusOffset;

        // Position camera in front of the selected sneaker with configured framing offset
        // Keeping neighboring sneakers and shelf visible in peripheral background
        targetCamPos.current.set(px + ox, py + oy, pz + oz);
        targetLookAt.current.set(px, py + 0.08, pz);
      }
    } else {
      // Overview mode with subtle cinematic pointer parallax
      const { overviewPosition, overviewLookAt, pointerParallax } = SHOWROOM_CONFIG.camera;
      const parallaxX = pointer.x * pointerParallax.x;
      const parallaxY = pointer.y * pointerParallax.y;

      targetCamPos.current.set(
        overviewPosition[0] + parallaxX,
        overviewPosition[1] + parallaxY,
        overviewPosition[2]
      );
      targetLookAt.current.set(...overviewLookAt);
    }

    // Smooth frame-rate independent camera position interpolation using damp3 from maath/easing
    damp3(
      camera.position,
      targetCamPos.current,
      SHOWROOM_CONFIG.camera.smoothTime,
      safeDelta
    );

    // Smooth frame-rate independent look-at interpolation using damp3 from maath/easing
    damp3(
      currentLookAt.current,
      targetLookAt.current,
      SHOWROOM_CONFIG.camera.lookAtSmoothTime,
      safeDelta
    );

    camera.lookAt(currentLookAt.current);
  });

  return null;
}
