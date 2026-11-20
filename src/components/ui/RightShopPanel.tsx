'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { PRODUCTS } from '@/data/products';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Check, ChevronDown, RotateCcw, ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';

export function RightShopPanel() {
  const activeProductId = useStore((s) => s.activeProductId);
  const selectedVariants = useStore((s) => s.selectedVariants);
  const selectedColors = useStore((s) => s.selectedColors);
  const activeQuantity = useStore((s) => s.activeQuantity);
  const setActiveProductId = useStore((s) => s.setActiveProductId);
  const setSelectedVariant = useStore((s) => s.setSelectedVariant);
  const setSelectedColor = useStore((s) => s.setSelectedColor);
  const setActiveQuantity = useStore((s) => s.setActiveQuantity);
  const addToCart = useStore((s) => s.addToCart);

  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const product = activeProductId ? PRODUCTS.find((p) => p.id === activeProductId) : null;
  if (!product) return null;

  const currentVariantId = selectedVariants[product.id] ?? product.defaultVariantId;
  const currentColorId = selectedColors[product.id] ?? product.defaultColorId;
  const currentVariant = product.variants.find((v) => v.id === currentVariantId);
  const currentColor = product.colors.find((c) => c.id === currentColorId) ?? product.colors[0];

  const currentIndex = PRODUCTS.findIndex((p) => p.id === product.id);
  const prevProduct = PRODUCTS[(currentIndex - 1 + PRODUCTS.length) % PRODUCTS.length];
  const nextProduct = PRODUCTS[(currentIndex + 1) % PRODUCTS.length];

  const handleAdd = () => {
    addToCart(product.id, currentVariantId, currentColorId, activeQuantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 1600);
  };

  const totalPrice = product.price * activeQuantity;

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 16 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        aria-label="Product Purchase Configuration"
        className="hidden md:block absolute top-28 lg:top-32 right-8 lg:right-12 z-20 pointer-events-auto w-72 lg:w-80 text-white select-none"
      >
        {/* Price Header (Right aligned, clean minimalist luxury font) */}
        <div className="text-right mb-5">
          <div className="flex items-baseline justify-end gap-2">
            <span className="text-3xl lg:text-4xl font-black tracking-tight font-sans text-white">
              {product.currency}{totalPrice}
            </span>
            {activeQuantity > 1 && (
              <span className="text-xs font-mono text-zinc-400">
                ({product.currency}{product.price} / unit)
              </span>
            )}
          </div>
          <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase mt-0.5">
            VAT INCLUDED / ARCHIVE RUN
          </p>
        </div>

        {/* Configuration Controls Card */}
        <div className="p-4 rounded-3xl bg-zinc-950/70 border border-zinc-800/80 backdrop-blur-xl shadow-2xl space-y-4">
          {/* 1. Colorway Selector */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-zinc-400 font-mono uppercase tracking-wider text-[11px]">Colorway</span>
              <span className="text-zinc-300 font-semibold text-xs">
                {currentColor?.name ?? 'Standard'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {product.colors.map((c) => {
                const isSelected = c.id === currentColorId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(product.id, c.id)}
                    aria-label={`Select colorway ${c.name}`}
                    className={`h-9 px-2.5 rounded-xl flex items-center gap-2 border text-xs transition-all ${
                      isSelected
                        ? 'border-[#ff4d29] bg-zinc-900/90 text-white ring-2 ring-[#ff4d29]/30 font-medium'
                        : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/50 shrink-0 shadow"
                      style={{ backgroundColor: c.accentHex }}
                    />
                    <span className="text-[11px] truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. EU Size Selector Pill Dropdown */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-zinc-400 font-mono uppercase tracking-wider text-[11px]">EU Size</span>
              <span className="text-[10px] font-mono text-zinc-500">True to size</span>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setSizeDropdownOpen(!sizeDropdownOpen)}
                aria-haspopup="listbox"
                aria-expanded={sizeDropdownOpen}
                aria-label="Select shoe size"
                className="w-full h-11 px-4 rounded-xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 flex items-center justify-between text-xs font-medium text-zinc-200 transition-colors shadow-lg backdrop-blur-xl focus-visible:ring-2 focus-visible:ring-[#ff4d29]"
              >
                <span>{currentVariant?.label ?? 'Select a size'}</span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${sizeDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>

              {/* Dropdown Menu */}
              {sizeDropdownOpen && (
                <div
                  role="listbox"
                  aria-label="Available shoe sizes"
                  className="absolute top-12 left-0 right-0 z-50 bg-[#14121e] border border-zinc-800 rounded-2xl p-2 shadow-2xl grid grid-cols-3 gap-1.5 animate-in fade-in zoom-in-95"
                >
                  {product.variants.map((v) => {
                    const isSelected = v.id === currentVariantId;
                    const isAvail = v.available !== false;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        disabled={!isAvail}
                        onClick={() => {
                          setSelectedVariant(product.id, v.id);
                          setSizeDropdownOpen(false);
                        }}
                        className={`py-2 text-xs font-mono rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#ff4d29] ${
                          isSelected
                            ? 'bg-[#ff4d29] text-white font-bold'
                            : isAvail
                            ? 'hover:bg-zinc-800 text-zinc-300'
                            : 'opacity-30 line-through cursor-not-allowed'
                        }`}
                      >
                        {v.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 3. Quantity Stepper & Add to Bag CTA */}
          <div className="pt-1 flex items-center gap-2.5">
            {/* Quantity Stepper */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl h-11 px-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveQuantity(Math.max(1, activeQuantity - 1))}
                disabled={activeQuantity <= 1}
                aria-label="Decrease quantity"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-7 text-center font-mono font-bold text-xs text-white">
                {activeQuantity}
              </span>
              <button
                type="button"
                onClick={() => setActiveQuantity(Math.min(10, activeQuantity + 1))}
                disabled={activeQuantity >= 10}
                aria-label="Increase quantity"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add to Bag Pill CTA */}
            <button
              type="button"
              onClick={handleAdd}
              className={`flex-1 h-11 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all active:scale-[0.98] ${
                addedSuccess
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white hover:bg-zinc-200 text-black shadow-white/10'
              }`}
            >
              {addedSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Added to Bag
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" /> Add to Bag
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Navigation Switcher: Prev / Exit / Next */}
        <div className="flex items-center justify-between mt-4 px-2 text-[11px] font-mono text-zinc-400">
          <button
            onClick={() => setActiveProductId(prevProduct.id)}
            className="flex items-center gap-1 hover:text-white transition-colors"
            title="Previous Silhouette (←)"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <button
            onClick={() => setActiveProductId(null)}
            className="flex items-center gap-1.5 hover:text-[#ff4d29] transition-colors"
            title="Return to Collection (Esc)"
          >
            <RotateCcw className="w-3 h-3 text-[#ff4d29]" />
            <span>Collection</span>
          </button>

          <button
            onClick={() => setActiveProductId(nextProduct.id)}
            className="flex items-center gap-1 hover:text-white transition-colors"
            title="Next Silhouette (→)"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
