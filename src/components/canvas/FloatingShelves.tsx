'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { PRODUCTS } from '@/data/products';
import { ProductItem } from '@/types';

export function FloatingShelves() {
  const activeProductId = useStore((s) => s.activeProductId);
  const hoveredProductId = useStore((s) => s.hoveredProductId);

  // Textures
  const shadowTexture = useTexture('/images/sneaker_contact_shadow.png');
  const glowTexture = useTexture('/images/neon_wall_glow.png');
  const backdropTexture = useTexture('/images/studio_minimal_backdrop.png');

  useMemo(() => {
    shadowTexture.colorSpace = THREE.SRGBColorSpace;
    glowTexture.colorSpace = THREE.SRGBColorSpace;
    backdropTexture.colorSpace = THREE.SRGBColorSpace;
  }, [shadowTexture, glowTexture, backdropTexture]);

  return (
    <group position={[0, 0, 0]}>
      {/* ── 10 INDIVIDUAL MODERN HYBRID (BLACK TOP + SUSPENDED OPTICAL GLASS) DISPLAY PLINTHS ── */}
      {PRODUCTS.map((prod) => {
        const isActive = activeProductId === prod.id;
        const isHovered = hoveredProductId === prod.id;

        return (
          <ModernHybridPlinth
            key={`plinth-${prod.id}`}
            product={prod}
            isActive={isActive}
            isHovered={isHovered}
            shadowTexture={shadowTexture}
            glowTexture={glowTexture}
          />
        );
      })}

      {/* ── CLEAN MINIMAL STUDIO BACKDROP (Matches Reference Image) ── */}
      <mesh position={[0, 0.40, -1.05]}>
        <planeGeometry args={[28, 15.75]} />
        <meshBasicMaterial
          map={backdropTexture}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function ModernHybridPlinth({
  product,
  isActive,
  isHovered,
  shadowTexture,
  glowTexture,
}: {
  product: ProductItem;
  isActive: boolean;
  isHovered: boolean;
  shadowTexture: THREE.Texture;
  glowTexture: THREE.Texture;
}) {
  const neonMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const neonOuterMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const wallGlowMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const edgeLineMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  // Colors
  const idleNeonColor = useMemo(() => new THREE.Color('#100e1a'), []);
  const litNeonColor = useMemo(() => new THREE.Color('#ff4415'), []);
  const idleEmissive = useMemo(() => new THREE.Color('#000000'), []);
  const litEmissive = useMemo(() => new THREE.Color('#ff4415'), []);

  // Edge line colors: cyan crystal idle, radiant orange lit
  const idleEdgeColor = useMemo(() => new THREE.Color('#7ab8f5'), []);
  const litEdgeColor = useMemo(() => new THREE.Color('#ff6633'), []);
  const idleEdgeEmissive = useMemo(() => new THREE.Color('#10223a'), []);
  const litEdgeEmissive = useMemo(() => new THREE.Color('#ff4415'), []);

  // Dynamic values
  const isLit = isActive || isHovered;
  const targetNeonIntensity = isActive ? 5.2 : isHovered ? 3.6 : 0.0;
  const targetOuterOpacity = isActive ? 0.95 : isHovered ? 0.80 : 0.0;
  const targetGlowOpacity = isActive ? 0.96 : isHovered ? 0.80 : 0.0;
  const targetLightIntensity = isActive ? 2.8 : isHovered ? 1.6 : 0.0;
  const targetEdgeEmissiveIntensity = isActive ? 2.2 : isHovered ? 1.4 : 0.5;

  useFrame((_, delta) => {
    const smoothSpeed = 4.8;

    if (neonMatRef.current) {
      neonMatRef.current.emissiveIntensity = THREE.MathUtils.damp(
        neonMatRef.current.emissiveIntensity,
        targetNeonIntensity,
        smoothSpeed,
        delta
      );
      neonMatRef.current.color.lerp(
        isLit ? litNeonColor : idleNeonColor,
        THREE.MathUtils.clamp(delta * smoothSpeed, 0, 1)
      );
      neonMatRef.current.emissive.lerp(
        isLit ? litEmissive : idleEmissive,
        THREE.MathUtils.clamp(delta * smoothSpeed, 0, 1)
      );
    }

    if (edgeLineMatRef.current) {
      edgeLineMatRef.current.emissiveIntensity = THREE.MathUtils.damp(
        edgeLineMatRef.current.emissiveIntensity,
        targetEdgeEmissiveIntensity,
        smoothSpeed,
        delta
      );
      edgeLineMatRef.current.color.lerp(
        isLit ? litEdgeColor : idleEdgeColor,
        THREE.MathUtils.clamp(delta * smoothSpeed, 0, 1)
      );
      edgeLineMatRef.current.emissive.lerp(
        isLit ? litEdgeEmissive : idleEdgeEmissive,
        THREE.MathUtils.clamp(delta * smoothSpeed, 0, 1)
      );
    }

    if (neonOuterMatRef.current) {
      neonOuterMatRef.current.opacity = THREE.MathUtils.damp(
        neonOuterMatRef.current.opacity,
        targetOuterOpacity,
        smoothSpeed,
        delta
      );
    }

    if (wallGlowMatRef.current) {
      wallGlowMatRef.current.opacity = THREE.MathUtils.damp(
        wallGlowMatRef.current.opacity,
        targetGlowOpacity,
        smoothSpeed,
        delta
      );
    }

    if (lightRef.current) {
      lightRef.current.intensity = THREE.MathUtils.damp(
        lightRef.current.intensity,
        targetLightIntensity,
        smoothSpeed,
        delta
      );
    }
  });

  const position = product.position;
  const shelfY = position[1] - 0.40;

  // ── Proportions ──────────────────────────────────────────
  // 1. Sleek Matte Obsidian Black Top Plate
  const blackWidth = 1.76;
  const blackDepth = 0.62;
  const blackThickness = 0.024;

  // 2. Suspended Architectural Optical Glass Slab
  const glassWidth = 1.84;
  const glassDepth = 0.66;
  const glassThickness = 0.040;
  const floatGap = 0.022;
  const glassY = -blackThickness / 2 - floatGap - glassThickness / 2; // -0.053

  return (
    <group position={[position[0], shelfY, position[2]]}>
      {/* ── 1. MATTE ANODIZED OBSIDIAN BLACK TOP RACK ─────────── */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[blackWidth, blackThickness, blackDepth]} />
        <meshStandardMaterial
          color="#0c0b12"
          roughness={0.28}
          metalness={0.82}
          envMapIntensity={1.8}
        />
      </mesh>

      {/* Front Bevel Highlight on Black Rack */}
      <mesh position={[0, 0, blackDepth / 2 + 0.001]}>
        <boxGeometry args={[blackWidth, blackThickness * 0.9, 0.002]} />
        <meshStandardMaterial
          color="#2e2b3e"
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Realistic Sneaker Outsole Contact Shadow on Black Shelf Top */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, blackThickness / 2 + 0.001, 0]}
      >
        <planeGeometry args={[2.06, 0.68]} />
        <meshBasicMaterial
          map={shadowTexture}
          transparent
          opacity={isActive ? 0.92 : isHovered ? 0.78 : 0.86}
          depthWrite={false}
        />
      </mesh>

      {/* ── 2. PRECISION POLISHED CHROME STANDOFF PINS (Floating Suspension) ── */}
      {[
        [-blackWidth * 0.40, blackDepth * 0.32],
        [blackWidth * 0.40, blackDepth * 0.32],
        [-blackWidth * 0.40, -blackDepth * 0.32],
        [blackWidth * 0.40, -blackDepth * 0.32],
      ].map(([x, z], idx) => (
        <group key={`spacer-${idx}`} position={[x, -blackThickness / 2 - floatGap / 2, z]}>
          <mesh>
            <cylinderGeometry args={[0.015, 0.015, floatGap, 24]} />
            <meshStandardMaterial
              color="#e8ecf4"
              metalness={0.98}
              roughness={0.06}
              envMapIntensity={3.0}
            />
          </mesh>
        </group>
      ))}

      {/* ── 3. LOWER ARCHITECTURAL CRYSTAL OPTICAL GLASS SLAB ── */}
      <mesh position={[0, glassY, 0]}>
        <boxGeometry args={[glassWidth, glassThickness, glassDepth]} />
        <meshPhysicalMaterial
          color="#d0e4ff"
          transmission={0.96}
          opacity={0.92}
          transparent
          roughness={0.04}
          metalness={0.04}
          ior={1.52}
          thickness={0.12}
          specularIntensity={1.0}
          specularColor="#ffffff"
          attenuationColor="#60a5fa"
          attenuationDistance={1.4}
        />
      </mesh>

      {/* Top Glass Surface Polish Specular Reflection Rim */}
      <mesh position={[0, glassY + glassThickness / 2 + 0.0005, glassDepth / 2 - 0.004]}>
        <boxGeometry args={[glassWidth * 0.99, 0.001, 0.008]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.05}
          metalness={0.4}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Refined Lower Edge Chamfer LED Accent on Glass (Ultra-thin 5mm bevel) */}
      <mesh position={[0, glassY - glassThickness / 2 + 0.003, glassDepth / 2 + 0.0015]}>
        <boxGeometry args={[glassWidth * 0.98, 0.006, 0.002]} />
        <meshStandardMaterial
          ref={edgeLineMatRef}
          color="#7ab8f5"
          emissive="#10223a"
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.3}
          toneMapped={false}
        />
      </mesh>

      {/* Glass Side Edge Highlights (Left & Right Rims) */}
      {[-glassWidth / 2 - 0.001, glassWidth / 2 + 0.001].map((xEdge, i) => (
        <mesh key={`glass-edge-${i}`} position={[xEdge, glassY, 0]}>
          <boxGeometry args={[0.002, glassThickness * 0.90, glassDepth * 0.98]} />
          <meshStandardMaterial
            color="#9ac2f4"
            roughness={0.06}
            metalness={0.2}
            transparent
            opacity={0.35}
          />
        </mesh>
      ))}

      {/* ── 4. CHROME DUAL SUB-RUNNER RAILS (Architectural Under-Glass Cantilever) ── */}
      {[-0.56, 0.56].map((xRail) => (
        <mesh key={`rail-${xRail}`} position={[xRail, glassY - glassThickness / 2 - 0.007, 0]}>
          <boxGeometry args={[0.022, 0.014, glassDepth * 0.88]} />
          <meshStandardMaterial
            color="#222030"
            roughness={0.25}
            metalness={0.92}
            envMapIntensity={2.2}
          />
        </mesh>
      ))}

      {/* ── 5. GLOWING HORIZONTAL NEON LIGHT BAR (Recessed in Under-Channel) ── */}
      <mesh position={[0, glassY - glassThickness / 2 - 0.012, glassDepth * 0.08]}>
        <boxGeometry args={[glassWidth * 0.86, 0.014, glassDepth * 0.28]} />
        <meshStandardMaterial
          ref={neonMatRef}
          color="#100e1a"
          emissive="#000000"
          emissiveIntensity={0}
          roughness={0.15}
          toneMapped={false}
        />
      </mesh>

      {/* Outer Glowing Neon Diffusion Capsule */}
      <mesh position={[0, glassY - glassThickness / 2 - 0.012, glassDepth * 0.08]}>
        <boxGeometry args={[glassWidth * 0.90, 0.024, glassDepth * 0.34]} />
        <meshStandardMaterial
          ref={neonOuterMatRef}
          color="#ff5511"
          emissive="#ff4415"
          emissiveIntensity={0.5}
          transparent
          opacity={0}
          roughness={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* ── 6. DOWNWARD DIFFUSED NEON LIGHT WASH ON WALL ── */}
      <mesh position={[0, glassY - 0.34, -glassDepth / 2 - 0.02]}>
        <planeGeometry args={[glassWidth * 1.35, 0.75]} />
        <meshBasicMaterial
          ref={wallGlowMatRef}
          map={glowTexture}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ── 7. TECHNICAL INDICATOR TYPOGRAPHY (Laser-Engraved on Front Glass) ── */}
      <Text
        position={[-glassWidth / 2 + 0.05, glassY - glassThickness / 2 - 0.05, glassDepth / 2]}
        fontSize={0.030}
        color={isActive || isHovered ? '#ff5522' : '#6b6782'}
        anchorX="left"
        anchorY="top"
        letterSpacing={0.08}
      >
        {`${product.referenceCode} // ${product.category.toUpperCase()}`}
      </Text>

      {/* ── 8. PRECISION ARCHITECTURAL WALL MOUNTING CLAMPS ── */}
      {[-0.52, 0.52].map((xOffset) => (
        <group key={xOffset} position={[xOffset, -0.025, -glassDepth / 2 + 0.04]}>
          <mesh>
            <boxGeometry args={[0.06, 0.12, 0.09]} />
            <meshStandardMaterial color="#161420" metalness={0.92} roughness={0.18} />
          </mesh>
          {/* Chrome clamp bolt detail */}
          <mesh position={[0, 0.02, 0.046]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.009, 0.009, 0.008, 16]} />
            <meshStandardMaterial color="#d4d4d8" metalness={0.98} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* ── 9. DYNAMIC RADIANT ORANGE POINT LIGHT ON HOVER / ACTIVE ── */}
      <pointLight
        ref={lightRef}
        position={[0, glassY - 0.08, 0.04]}
        intensity={0}
        distance={2.4}
        decay={2}
        color="#ff4415"
      />
    </group>
  );
}
