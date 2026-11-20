'use client';

import { useRef, useMemo, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { ProductItem } from '@/types';
import { SHOWROOM_CONFIG } from '@/config/showroom';
import { ModelErrorBoundary } from './ModelErrorBoundary';

interface ProductModelProps {
  product: ProductItem;
  isActive: boolean;
  isHovered: boolean;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
}

export function ProductModel(props: ProductModelProps) {
  const { product } = props;

  return (
    <ModelErrorBoundary fallback={<FallbackImageShoe {...props} />}>
      <Suspense fallback={<FallbackImageShoe {...props} />}>
        {product.modelUrl ? (
          <Real3DSneaker {...props} modelUrl={product.modelUrl} />
        ) : (
          <FallbackImageShoe {...props} />
        )}
      </Suspense>
    </ModelErrorBoundary>
  );
}

const SOLE_RESTING_Y = -0.375;

// ── REAL 3D GLTF SNEAKER COMPONENT ──────────────────────────────────────────
function Real3DSneaker({
  product,
  modelUrl,
  isActive,
  isHovered,
  onClick,
  onPointerOver,
  onPointerOut,
}: ProductModelProps & { modelUrl: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const containerRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Group>(null);

  // Load real GLTF / GLB 3D model with DRACO & Meshopt decoders enabled
  const { scene } = useGLTF(modelUrl, true, true);

  // Normalize model scale, centering, and sole elevation precisely
  const normalizedScene = useMemo(() => {
    const clone = scene.clone(true);

    // 1. Initial bounding box
    const initialBox = new THREE.Box3().setFromObject(clone);
    const initialSize = new THREE.Vector3();
    initialBox.getSize(initialSize);

    // 2. Uniform scale so longest dimension is calibrated (2.06 base * product.scale)
    // (Matches shelf proportions and reference photo)
    const maxDim = Math.max(initialSize.x, initialSize.y, initialSize.z);
    const modelScaleMultiplier = product.scale ?? 1.0;
    const targetScale = (2.06 * modelScaleMultiplier) / (maxDim || 1);
    clone.scale.setScalar(targetScale);
    clone.updateMatrixWorld(true);

    // 3. Center X and Z, and anchor the SOLE (lowest vertex) strictly at local Y = 0.000
    // This ensures that any scaling or Y-axis rotation never moves the sole below 0,
    // completely eliminating any clipping or penetration into the glass shelf!
    const scaledBox = new THREE.Box3().setFromObject(clone);
    const scaledCenter = new THREE.Vector3();
    scaledBox.getCenter(scaledCenter);

    clone.position.x = -scaledCenter.x;
    clone.position.z = -scaledCenter.z;
    clone.position.y = -scaledBox.min.y; // Lowest point of shoe is strictly at Y = 0.000

    // 4. Enhance materials for studio environment reflections and photorealism
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const mat = mesh.material;
        if (mat) {
          const materials = Array.isArray(mat) ? mat : [mat];
          materials.forEach((m) => {
            const std = m as THREE.MeshStandardMaterial;
            if ('envMapIntensity' in std) {
              std.envMapIntensity = 1.6;
            }

            // Sharpen diffuse textures with max anisotropy
            if (std.map) {
              std.map.anisotropy = 16;
              std.map.colorSpace = THREE.SRGBColorSpace;
              std.map.needsUpdate = true;
            }

            // Sharpen normal maps for stitch & grain depth
            if (std.normalMap) {
              std.normalMap.anisotropy = 16;
              std.normalScale.set(1.15, 1.15);
            }

            // Sharpen roughness maps
            if (std.roughnessMap) {
              std.roughnessMap.anisotropy = 16;
            }

            // Material specific tuning based on mesh name / material name
            const name = (mesh.name + ' ' + (std.name || '')).toLowerCase();
            if (name.includes('sole') || name.includes('rubber') || name.includes('outsole') || name.includes('midsole')) {
              std.roughness = 0.65;
              std.metalness = 0.04;
            } else if (name.includes('leather') || name.includes('patent') || name.includes('gloss') || name.includes('accent')) {
              std.roughness = 0.22;
              std.metalness = 0.08;
              std.envMapIntensity = 2.2;
            } else if (name.includes('suede') || name.includes('fabric') || name.includes('mesh') || name.includes('knit') || name.includes('canvas')) {
              std.roughness = 0.78;
              std.metalness = 0.02;
            } else if (std.roughness > 0.85) {
              std.roughness = 0.75;
            }

            std.needsUpdate = true;
          });
        }
      }
    });

    return clone;
  }, [scene, product.scale]);

  // Rotations: horizontal sole (rotX = 0, rotZ = 0) to keep sole flush with shelf plane
  const baseRotY = product.rotation ? product.rotation[1] : -0.38;

  const currentRotY = useRef(baseRotY);
  const currentRotX = useRef(0);
  const isDragging = useRef(false);
  const lastPointerX = useRef(0);
  const lastPointerY = useRef(0);

  // Global pointer move/up tracking for smooth 360 inspection even when dragging fast
  useEffect(() => {
    if (!isActive) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - lastPointerX.current;
      const deltaY = e.clientY - lastPointerY.current;
      lastPointerX.current = e.clientX;
      lastPointerY.current = e.clientY;

      // Smooth horizontal turntable 360 inspection around Y
      currentRotY.current += deltaX * 0.015;

      // Subtle, safe pitch tilt strictly constrained to avoid dipping
      currentRotX.current = Math.max(
        -0.05,
        Math.min(0.05, currentRotX.current + deltaY * 0.003)
      );
    };

    const handlePointerUp = () => {
      isDragging.current = false;
      document.body.style.cursor = 'grab';
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isActive]);

  useFrame((state, delta) => {
    if (!meshRef.current || !containerRef.current) return;
    const time = state.clock.getElapsedTime();

    // Subtle floating breathing motion - strictly UPWARDS, never dropping below shelf!
    const rawSin = Math.sin(time * SHOWROOM_CONFIG.animation.idleFloatSpeed + product.position[0]);
    const floatOffset = Math.max(0, (rawSin * 0.5 + 0.5) * SHOWROOM_CONFIG.animation.idleFloatDistance);

    if (isActive) {
      // In focus mode: gently auto-spin when not dragging
      if (!isDragging.current) {
        currentRotY.current += delta * SHOWROOM_CONFIG.animation.autoSpinSpeed;
        // Return pitch to zero level when not dragging so shoe sits completely flat
        currentRotX.current = THREE.MathUtils.damp(currentRotX.current, 0, 5, delta);
      }
      meshRef.current.rotation.y = currentRotY.current;
      meshRef.current.rotation.x = THREE.MathUtils.damp(
        meshRef.current.rotation.x,
        currentRotX.current,
        8,
        delta
      );

      // Pitch lift compensation: if shoe ever tilts on X, dynamically elevate by the exact sine offset
      // so neither the toe nor heel ever drops below the shelf surface!
      const pitchLift = Math.max(0, 0.86 * Math.sin(Math.abs(meshRef.current.rotation.x)));
      const targetY = SOLE_RESTING_Y + pitchLift;

      containerRef.current.position.y = THREE.MathUtils.damp(
        containerRef.current.position.y,
        targetY,
        8,
        delta
      );
    } else if (isHovered) {
      // Gentle, silky lift (+0.04) and subtle rotation on Y
      currentRotY.current = baseRotY - 0.14;
      meshRef.current.rotation.y = THREE.MathUtils.damp(
        meshRef.current.rotation.y,
        currentRotY.current,
        5.5,
        delta
      );
      meshRef.current.rotation.x = THREE.MathUtils.damp(
        meshRef.current.rotation.x,
        0,
        6,
        delta
      );
      containerRef.current.position.y = THREE.MathUtils.damp(
        containerRef.current.position.y,
        SOLE_RESTING_Y + floatOffset + 0.04,
        4.8,
        delta
      );
    } else {
      // Resting cleanly and horizontally on shelf
      currentRotY.current = baseRotY;
      currentRotX.current = 0;
      meshRef.current.rotation.y = THREE.MathUtils.damp(
        meshRef.current.rotation.y,
        baseRotY,
        5,
        delta
      );
      meshRef.current.rotation.x = THREE.MathUtils.damp(
        meshRef.current.rotation.x,
        0,
        5,
        delta
      );
      containerRef.current.position.y = THREE.MathUtils.damp(
        containerRef.current.position.y,
        SOLE_RESTING_Y + floatOffset,
        4,
        delta
      );
    }
  });

  return (
    <group ref={groupRef} position={product.position}>
      {/* Invisible Interactive Click & Drag Hit Box for 100% Reliable Events */}
      <mesh
        visible={false}
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerDown={(e) => {
          if (isActive) {
            e.stopPropagation();
            isDragging.current = true;
            lastPointerX.current = e.clientX;
            lastPointerY.current = e.clientY;
            document.body.style.cursor = 'grabbing';
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = isActive ? 'grab' : 'pointer';
          onPointerOver();
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          if (!isDragging.current) {
            document.body.style.cursor = 'auto';
          }
          onPointerOut();
        }}
      >
        <boxGeometry args={[2.5, 1.8, 1.4]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Main Sneaker Container: position.y strictly anchored to SOLE_RESTING_Y */}
      <group ref={containerRef} position={[0, SOLE_RESTING_Y, 0]}>
        {/* Model Group: scales upwards from sole pivot at Y=0 and rotates on turntable */}
        <group ref={meshRef} scale={isActive ? 1.15 : isHovered ? 1.04 : 1.0}>
          <primitive object={normalizedScene} />
        </group>
      </group>
    </group>
  );
}

// ── HIGH RESOLUTION 2D FALLBACK SNEAKER (If GLB loading fails) ───────────────
function FallbackImageShoe({
  product,
  isActive,
  isHovered,
  onClick,
  onPointerOver,
  onPointerOut,
}: ProductModelProps) {
  const meshRef = useRef<THREE.Group>(null);
  const texture = useTexture(product.imageUrl ?? `/images/products/sneaker-01.png`);
  texture.colorSpace = THREE.SRGBColorSpace;

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const rawSin = Math.sin(time * SHOWROOM_CONFIG.animation.idleFloatSpeed + product.position[0]);
    const floatOffset = Math.max(0, (rawSin * 0.5 + 0.5) * SHOWROOM_CONFIG.animation.idleFloatDistance);

    const baseElevation = SOLE_RESTING_Y + 0.575;
    const targetY = isActive
      ? baseElevation
      : isHovered
      ? baseElevation + floatOffset + 0.04
      : baseElevation + floatOffset;

    meshRef.current.position.y = THREE.MathUtils.damp(
      meshRef.current.position.y,
      targetY,
      4.8,
      delta
    );
  });

  return (
    <group
      position={product.position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
        onPointerOver();
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'auto';
        onPointerOut();
      }}
    >
      <group ref={meshRef} scale={isActive ? 1.15 : isHovered ? 1.04 : 1.0}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[2.1, 1.15]} />
          <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}
