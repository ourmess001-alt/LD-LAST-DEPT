'use client';

import { useStore } from '@/store/useStore';
import { PRODUCTS } from '@/data/products';

export function Footer() {
  const activeProductId = useStore((s) => s.activeProductId);
  const hoveredProductId = useStore((s) => s.hoveredProductId);
  const setActiveProductId = useStore((s) => s.setActiveProductId);
  const setHoveredProductId = useStore((s) => s.setHoveredProductId);

  // Determine roving tabindex target: active product or hovered product or first item
  const rovingId = activeProductId || hoveredProductId || PRODUCTS[0]?.id;

  const hoveredProduct = hoveredProductId ? PRODUCTS.find((p) => p.id === hoveredProductId) : null;

  return (
    <footer className="absolute bottom-6 left-0 right-0 z-20 pointer-events-none flex flex-col sm:flex-row items-center justify-between px-6 sm:px-8 text-xs text-zinc-400 font-sans tracking-wide">
      {/* ── Left Indicator (Coordinates / Brand) ───────────── */}
      <div className="pointer-events-auto hidden sm:flex items-center gap-2 text-[11px] font-mono text-zinc-500">
        <span>LAST DEPT. // 2026</span>
        <span aria-hidden="true">•</span>
        <span>EXHIBITION 04</span>
      </div>

      {/* ── Center Prompt / Keyboard shortcuts ── */}
      <div className="pointer-events-auto text-center my-2 sm:my-0">
        {activeProductId ? (
          <span className="text-zinc-300 font-medium text-xs sm:text-sm">
            Drag shoe horizontally to orbit 360° • Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-[11px] border border-zinc-700">Esc</kbd> to return
          </span>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-zinc-400 font-normal text-xs sm:text-sm tracking-wide">
              Use <kbd className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-300 font-mono text-[11px] border border-zinc-700/60">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-300 font-mono text-[11px] border border-zinc-700/60">→</kbd> <kbd className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-300 font-mono text-[11px] border border-zinc-700/60">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-300 font-mono text-[11px] border border-zinc-700/60">↓</kbd> to navigate • Click or press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-300 font-mono text-[11px] border border-zinc-700/60">Enter</kbd> to inspect
            </span>
            <button
              type="button"
              onClick={() => {
                document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-[11px] font-mono text-zinc-400 hover:text-[#ff4d29] border border-zinc-800 transition-colors shadow-sm cursor-pointer"
              title="Explore Architectural Anatomy"
            >
              <span>Explore Anatomy</span>
              <span className="text-[#ff4d29]">↓</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Right: 10 Subtle Index Dots with Roving Tabindex & Hover Tooltip ── */}
      <div className="relative pointer-events-auto hidden sm:flex items-center">
        {/* Hover preview tooltip pill */}
        {hoveredProduct && !activeProductId && (
          <div className="absolute -top-9 right-0 px-2.5 py-1 rounded-lg bg-zinc-900/95 border border-zinc-800 text-[10px] font-mono text-white shadow-xl whitespace-nowrap animate-in fade-in slide-in-from-bottom-1 pointer-events-none flex items-center gap-1.5">
            <span className="text-[#ff4d29] font-bold">{hoveredProduct.referenceCode}</span>
            <span>{hoveredProduct.name}</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-300">{hoveredProduct.currency}{hoveredProduct.price}</span>
          </div>
        )}

        <div
          role="tablist"
          aria-label="Sneaker collection navigation"
          className="flex items-center gap-2 p-1.5 rounded-full bg-zinc-950/70 border border-zinc-800/80 backdrop-blur-md"
        >
          {PRODUCTS.map((prod) => {
            const isSelected = activeProductId === prod.id;
            const isHovered = hoveredProductId === prod.id;
            const isRovingActive = rovingId === prod.id;

            return (
              <button
                key={prod.id}
                role="tab"
                type="button"
                aria-selected={isSelected}
                tabIndex={isRovingActive ? 0 : -1}
                onClick={() => {
                  setActiveProductId(isSelected ? null : prod.id);
                  setHoveredProductId(prod.id);
                }}
                onFocus={() => setHoveredProductId(prod.id)}
                onMouseEnter={() => setHoveredProductId(prod.id)}
                onMouseLeave={() => {
                  if (!activeProductId) setHoveredProductId(null);
                }}
                title={`${prod.name} (${prod.referenceCode})`}
                className={`h-2 rounded-full transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4d29] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0d0c14] ${
                  isSelected
                    ? 'w-6 bg-[#ff4d29] shadow-[0_0_8px_rgba(255,77,41,0.6)]'
                    : isHovered
                    ? 'w-3.5 bg-zinc-300'
                    : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                }`}
                aria-label={`${prod.name} - ${prod.referenceCode}`}
              />
            );
          })}
        </div>
      </div>
    </footer>
  );
}
