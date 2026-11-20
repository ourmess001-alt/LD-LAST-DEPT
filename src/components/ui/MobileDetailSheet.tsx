'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { PRODUCTS } from '@/data/products';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Check, Plus, Minus, X, RotateCcw, ChevronLeft, ChevronRight, Sliders } from 'lucide-react';

export function MobileDetailSheet() {
  const activeProductId = useStore((s) => s.activeProductId);
  const selectedVariants = useStore((s) => s.selectedVariants);
  const selectedColors = useStore((s) => s.selectedColors);
  const activeQuantity = useStore((s) => s.activeQuantity);
  const setActiveProductId = useStore((s) => s.setActiveProductId);
  const setSelectedVariant = useStore((s) => s.setSelectedVariant);
  const setSelectedColor = useStore((s) => s.setSelectedColor);
  const setActiveQuantity = useStore((s) => s.setActiveQuantity);
  const addToCart = useStore((s) => s.addToCart);

  const [activeTab, setActiveTab] = useState<'info' | 'shop'>('shop');
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const product = activeProductId ? PRODUCTS.find((p) => p.id === activeProductId) : null;
  if (!product) return null;

  const currentVariantId = selectedVariants[product.id] ?? product.defaultVariantId;
  const currentColorId = selectedColors[product.id] ?? product.defaultColorId;

  const currentIndex = PRODUCTS.findIndex((p) => p.id === product.id);
  const prevProduct = PRODUCTS[(currentIndex - 1 + PRODUCTS.length) % PRODUCTS.length];
  const nextProduct = PRODUCTS[(currentIndex + 1) % PRODUCTS.length];

  const handleAdd = () => {
    addToCart(product.id, currentVariantId, currentColorId, activeQuantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 1600);
  };

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        aria-label="Mobile Product Inspection Panel"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0e0d16]/95 backdrop-blur-2xl border-t border-zinc-800/80 rounded-t-3xl shadow-2xl text-white pointer-events-auto"
      >
        {/* Handle / Drag bar */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full pt-3 pb-2 flex flex-col items-center justify-center cursor-pointer"
        >
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>

        {/* Compact Header Summary */}
        <div className="px-5 pb-3 flex items-center justify-between border-b border-zinc-800/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-[#ff4d29] uppercase font-bold">
                {product.referenceCode}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {currentIndex + 1} / {PRODUCTS.length}
              </span>
            </div>
            <h3 className="text-lg font-black tracking-tight uppercase text-white leading-tight">
              {product.name}
            </h3>
          </div>

          <div className="text-right">
            <span className="text-lg font-black font-mono text-white">
              {product.currency}{product.price * activeQuantity}
            </span>
            <div className="flex items-center gap-1 mt-0.5 justify-end">
              <button
                onClick={() => setActiveProductId(prevProduct.id)}
                className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                aria-label="Previous"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveProductId(nextProduct.id)}
                className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                aria-label="Next"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab switcher: Info vs Purchase options */}
        <div className="px-5 py-2 flex items-center gap-2 border-b border-zinc-800/40">
          <button
            onClick={() => setActiveTab('shop')}
            className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${
              activeTab === 'shop'
                ? 'bg-[#ff4d29] text-white'
                : 'text-zinc-400 hover:text-white bg-zinc-900/60'
            }`}
          >
            Configure & Buy
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${
              activeTab === 'info'
                ? 'bg-[#ff4d29] text-white'
                : 'text-zinc-400 hover:text-white bg-zinc-900/60'
            }`}
          >
            Specs & Details
          </button>
          <button
            onClick={() => setActiveProductId(null)}
            className="ml-auto text-[11px] font-mono text-zinc-400 hover:text-white flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3 text-[#ff4d29]" />
            Exit
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 max-h-[50vh] overflow-y-auto space-y-4">
          {activeTab === 'shop' ? (
            <>
              {/* Color Selection */}
              <div>
                <span className="text-xs text-zinc-400 block mb-1.5 font-medium">Colorway</span>
                <div className="flex items-center gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedColor(product.id, c.id)}
                      className={`h-8 px-3 rounded-lg flex items-center gap-2 border text-xs font-medium ${
                        c.id === currentColorId
                          ? 'border-[#ff4d29] bg-zinc-800 text-white ring-1 ring-[#ff4d29]'
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
                      }`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.accentHex }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <span className="text-xs text-zinc-400 block mb-1.5 font-medium">EU Size</span>
                <div className="grid grid-cols-6 gap-1.5">
                  {product.variants.map((v) => {
                    const isSelected = v.id === currentVariantId;
                    const isAvail = v.available !== false;
                    return (
                      <button
                        key={v.id}
                        disabled={!isAvail}
                        onClick={() => setSelectedVariant(product.id, v.id)}
                        className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                          isSelected
                            ? 'border-[#ff4d29] bg-[#ff4d29] text-white font-bold'
                            : isAvail
                            ? 'border-zinc-800 bg-zinc-900/60 text-zinc-300'
                            : 'border-zinc-900/60 bg-zinc-950/40 text-zinc-600 line-through'
                        }`}
                      >
                        {v.label.replace('EU ', '')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity & CTA */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1">
                  <button
                    onClick={() => setActiveQuantity(activeQuantity - 1)}
                    disabled={activeQuantity <= 1}
                    className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-mono font-bold text-sm">{activeQuantity}</span>
                  <button
                    onClick={() => setActiveQuantity(activeQuantity + 1)}
                    className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all ${
                    addedSuccess
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gradient-to-r from-[#ff4d29] to-[#ff6b4a] text-white'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4" /> Added
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Add to Bag
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-zinc-300 leading-relaxed">{product.description}</p>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-400">
                <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/60">
                  <span className="block text-zinc-500 text-[10px]">TIER</span>
                  <span className="text-zinc-200">{product.tier}</span>
                </div>
                <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/60">
                  <span className="block text-zinc-500 text-[10px]">CATEGORY</span>
                  <span className="text-zinc-200">{product.category}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

