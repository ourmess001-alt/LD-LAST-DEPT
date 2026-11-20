'use client';

import { useStore } from '@/store/useStore';
import { Sparkles, Layers, ShieldCheck, Compass, ArrowUpRight, Cpu, Wind, Activity } from 'lucide-react';

export function FeaturesBentoSection() {
  const setActiveProductId = useStore((s) => s.setActiveProductId);

  const handleInspectShoe = (productId: string) => {
    setActiveProductId(productId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section
      id="studio"
      aria-label="Architectural Anatomy and Atelier Craft"
      className="relative w-full bg-[#090810] text-white py-24 sm:py-32 px-6 sm:px-12 lg:px-20 border-t border-zinc-800/80 z-20"
    >
      {/* Background ambient lighting accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#ff4d29]/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto space-y-20 relative">
        {/* ── 1. Section Header ─────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-zinc-800/80 pb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-widest text-[#ff4d29]">
              <span className="w-2 h-2 rounded-full bg-[#ff4d29] animate-pulse" />
              <span>// 02 ARCHITECTURAL ANATOMY</span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-sans uppercase tracking-tight text-white leading-none">
              Sculpted for Speed. <br />
              <span className="text-zinc-500">Engineered to Endure.</span>
            </h2>
          </div>
          <p className="text-zinc-400 text-sm sm:text-base font-sans max-w-md leading-relaxed">
            Every silhouette in Season 04 bridges generative digital algorithms and Italian handcrafted leathercraft. Built with zero compromise between biomechanical performance and runway aesthetics.
          </p>
        </div>

        {/* ── 2. Bento Box Grid (Apple / Modern Luxury Style) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[280px]">
          {/* Bento Card 1: Large Featured Core (Span 2 cols, 2 rows) */}
          <div className="md:col-span-2 md:row-span-2 rounded-3xl bg-gradient-to-b from-[#141220] to-[#0e0d16] border border-zinc-800/90 p-8 sm:p-10 flex flex-col justify-between group hover:border-[#ff4d29]/60 transition-all duration-300 relative overflow-hidden shadow-2xl">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#ff4d29]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#ff4d29]/20 transition-all duration-500" />
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-700/60 text-[11px] font-mono uppercase tracking-wider text-[#ff4d29]">
                  Patented Sole Architecture
                </span>
                <Activity className="w-5 h-5 text-zinc-500 group-hover:text-[#ff4d29] transition-colors" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold uppercase font-sans tracking-tight text-white">
                Dual-Chamber Kinetic Air Capsule
              </h3>

              <p className="text-zinc-400 text-sm leading-relaxed max-w-lg">
                Independent heel-to-toe shock dissipation pods encapsulated inside high-rebound vulcanized gum rubber. Tuned for instantaneous 38% energy recovery upon stride contact.
              </p>
            </div>

            {/* Live Metrics in Bento Card 1 */}
            <div className="pt-8 border-t border-zinc-800/80 grid grid-cols-3 gap-4 relative z-10">
              <div>
                <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">+38%</span>
                <p className="text-[11px] text-zinc-500 font-mono uppercase mt-0.5">Energy Return</p>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">0.02s</span>
                <p className="text-[11px] text-zinc-500 font-mono uppercase mt-0.5">Damping Latency</p>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black font-mono text-[#ff4d29] tracking-tight">42mm</span>
                <p className="text-[11px] text-zinc-500 font-mono uppercase mt-0.5">Stack Height</p>
              </div>
            </div>

            <button
              onClick={() => handleInspectShoe('aero-pulse-x1')}
              className="mt-6 w-full py-3.5 rounded-2xl bg-zinc-900/90 hover:bg-[#ff4d29] text-zinc-200 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-zinc-700/60 hover:border-transparent transition-all group-hover:shadow-lg group-hover:shadow-[#ff4d29]/20"
            >
              <span>Inspect Aero Pulse X1 in 3D</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Bento Card 2: Lightweight Carbon Composite (Span 1 col, 1 row) */}
          <div className="rounded-3xl bg-[#12111c] border border-zinc-800/80 p-6 flex flex-col justify-between hover:border-zinc-700 transition-colors group">
            <div className="flex items-center justify-between">
              <Cpu className="w-5 h-5 text-zinc-400 group-hover:text-[#ff4d29] transition-colors" />
              <span className="text-xs font-mono text-zinc-500">SPEC // 01</span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">280g</span>
              <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-200 mt-1">
                Ultralight Carbon Shank
              </h4>
              <p className="text-xs text-zinc-400 mt-2 line-clamp-2">
                Torsional arch stability plate forged from 3K twill weave aerospace composite.
              </p>
            </div>
          </div>

          {/* Bento Card 3: Thermal Micro-Mesh (Span 1 col, 1 row) */}
          <div className="rounded-3xl bg-[#12111c] border border-zinc-800/80 p-6 flex flex-col justify-between hover:border-zinc-700 transition-colors group">
            <div className="flex items-center justify-between">
              <Wind className="w-5 h-5 text-zinc-400 group-hover:text-[#ff4d29] transition-colors" />
              <span className="text-xs font-mono text-zinc-500">SPEC // 02</span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">360°</span>
              <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-200 mt-1">
                Active Vapor Permeability
              </h4>
              <p className="text-xs text-zinc-400 mt-2 line-clamp-2">
                Zonally variable jacquard weave dissipates heat 4.2x faster than traditional leather.
              </p>
            </div>
          </div>

          {/* Bento Card 4: Curated Global Capsule Drops (Span 2 cols, 1 row) */}
          <div className="md:col-span-2 rounded-3xl bg-[#12111c] border border-zinc-800/80 p-6 sm:p-8 flex flex-col justify-between hover:border-[#ff4d29]/40 transition-colors relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#ff4d29]" />
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                  Serialized Capsule Authentication
                </span>
              </div>
              <span className="text-xs font-mono text-zinc-500">LIMITED EDITION</span>
            </div>

            <div className="my-3">
              <h4 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-white">
                Edition 04 / 500 Pairs Worldwide
              </h4>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-md">
                Each physical sneaker contains an integrated passive cryptographic NFC chip pairing the physical pair with its decentralized ownership proof.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 text-xs font-mono text-zinc-400">
              <span>Civitanova Marche, Italy</span>
              <span className="text-zinc-500">•</span>
              <span className="text-emerald-400 font-semibold">Capsule 04 Active</span>
            </div>
          </div>
        </div>

        {/* ── 3. Atelier Philosophy Statement & Metric Band ───── */}
        <div className="rounded-3xl bg-zinc-950/80 border border-zinc-800/80 p-8 sm:p-14 relative overflow-hidden">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
              The Aether Manifesto
            </span>
            <blockquote className="text-xl sm:text-3xl font-extrabold uppercase font-sans tracking-tight text-white leading-snug">
              &ldquo;We don&apos;t manufacture footwear for mass consumption. We sculpt dynamic artefacts at the collision point of performance engineering and digital minimalism.&rdquo;
            </blockquote>
          </div>

          {/* 4 Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 pt-10 border-t border-zinc-800/80 text-center sm:text-left">
            <div>
              <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">10</span>
              <p className="text-xs text-zinc-400 font-sans mt-1">Curated 3D Silhouettes</p>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">100%</span>
              <p className="text-xs text-zinc-400 font-sans mt-1">Recycled Polymers & Suede</p>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">04</span>
              <p className="text-xs text-zinc-400 font-sans mt-1">Seasonal Capsules</p>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-black font-mono text-[#ff4d29] tracking-tight">500</span>
              <p className="text-xs text-zinc-400 font-sans mt-1">Pairs Per Silhouette Limit</p>
            </div>
          </div>
        </div>

        {/* ── 4. Quick Return to 3D Showroom CTA ──────────────── */}
        <div className="text-center pt-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-xl hover:shadow-[#ff4d29]/10"
          >
            <span>Return to 3D Exhibition Racks</span>
            <span className="text-[#ff4d29]">↑</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default FeaturesBentoSection;
