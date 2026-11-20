'use client';

import dynamic from 'next/dynamic';
import { Header } from '@/components/ui/Header';
import { LeftInfoPanel } from '@/components/ui/LeftInfoPanel';
import { RightShopPanel } from '@/components/ui/RightShopPanel';
import { MobileDetailSheet } from '@/components/ui/MobileDetailSheet';
import { Footer } from '@/components/ui/Footer';
import { CartDrawer } from '@/components/ui/CartDrawer';
import { SearchModal } from '@/components/ui/SearchModal';
import { KeyboardControls } from '@/components/ui/KeyboardControls';
import { ShowroomFallback } from '@/components/ui/ShowroomFallback';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import FeaturesBentoSection from '@/components/ui/FeaturesBentoSection';

// Dynamic import for Three.js Canvas with SSR disabled
const SceneCanvas = dynamic(
  () => import('@/components/canvas/SceneCanvas'),
  {
    ssr: false,
    loading: () => <LoadingScreen />,
  }
);

export function ShowroomClient() {
  return (
    <div className="relative w-full min-h-screen bg-[#18161c] overflow-x-hidden">
      {/* ── SECTION 1: HERO 3D EXHIBITION SHOWROOM (100vh) ──── */}
      <section className="relative w-full h-screen overflow-hidden">
        {/* 1. Header Navigation & Brand Identity */}
        <Header />

        {/* 2. 3D React Three Fiber Canvas with Floating Shelves & Bloom */}
        <SceneCanvas />

        {/* 3. Left Specification HUD Overlay (Desktop) */}
        <LeftInfoPanel />

        {/* 4. Right Configuration & Shopping HUD Overlay (Desktop) */}
        <RightShopPanel />

        {/* 5. Compact Responsive Bottom Sheet (Mobile) */}
        <MobileDetailSheet />

        {/* 6. Footer Interaction Guide & Gallery Navigation Dots */}
        <Footer />
      </section>

      {/* ── SECTION 2: ARCHITECTURAL ANATOMY & ATELIER BENTO GRID ── */}
      <FeaturesBentoSection />

      {/* Global Overlays & Utilities */}
      <SearchModal />
      <CartDrawer />
      <KeyboardControls />
      <ShowroomFallback />
    </div>
  );
}
