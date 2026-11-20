'use client';

import { useStore } from '@/store/useStore';
import { PRODUCTS } from '@/data/products';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownRight, Sparkles } from 'lucide-react';

export function LeftInfoPanel() {
  const activeProductId = useStore((s) => s.activeProductId);

  const product = activeProductId ? PRODUCTS.find((p) => p.id === activeProductId) : null;

  return (
    <AnimatePresence>
      {product && (
        <motion.aside
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Product Details"
          className="hidden md:block absolute top-28 lg:top-32 left-8 lg:left-12 z-20 pointer-events-auto max-w-sm text-white select-text"
        >
          {/* Reference Code & Category Pill */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold tracking-widest text-[#ff4d29] uppercase">
              {product.referenceCode}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="px-2 py-0.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              {product.category}
            </span>
          </div>

          {/* Silhouette Name */}
          <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-white uppercase font-sans mb-1.5 leading-none">
            {product.name}
          </h2>

          {/* Subtitle with bullet */}
          <p className="text-xs text-zinc-300 font-normal tracking-wide mb-3 flex items-center gap-1.5">
            <span className="text-[#ff4d29]">•</span>
            {product.subtitle}
          </p>

          {/* Technical specification & description card */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 backdrop-blur-xl shadow-xl space-y-3">
            <p className="leading-relaxed text-zinc-300 font-sans text-xs">
              {product.description}
            </p>

            <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-500 uppercase">TIER SPECIFICATION</span>
              <span className="text-zinc-300 font-semibold">{product.tier}</span>
            </div>

            {/* Link to Anatomy Section */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('studio');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full pt-2 mt-1 border-t border-zinc-800/40 flex items-center justify-between text-[11px] font-mono text-zinc-400 hover:text-[#ff4d29] transition-colors group cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#ff4d29]" />
                Explore Anatomy Architecture
              </span>
              <ArrowDownRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
