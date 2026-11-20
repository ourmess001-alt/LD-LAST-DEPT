'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { PRODUCTS } from '@/data/products';
import { X, ShoppingCart, ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react';

export function ProductDetails() {
  const activeProductId = useStore((s) => s.activeProductId);
  const selectedVariants = useStore((s) => s.selectedVariants);
  const setActiveProductId = useStore((s) => s.setActiveProductId);
  const setSelectedVariant = useStore((s) => s.setSelectedVariant);
  const addToCart = useStore((s) => s.addToCart);

  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!activeProductId) return null;

  const product = PRODUCTS.find((p) => p.id === activeProductId);
  if (!product) return null;

  const currentVariantId = selectedVariants[product.id] ?? product.defaultVariantId;

  // Find index for Previous / Next navigation
  const currentIndex = PRODUCTS.findIndex((p) => p.id === activeProductId);
  const prevProduct = PRODUCTS[(currentIndex - 1 + PRODUCTS.length) % PRODUCTS.length];
  const nextProduct = PRODUCTS[(currentIndex + 1) % PRODUCTS.length];

  const handleAddToCart = () => {
    addToCart(product.id, currentVariantId);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1600);
  };

  return (
    <aside
      aria-label="Product Inspection Details"
      className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8 z-20 pointer-events-auto max-w-sm w-[calc(100vw-2rem)] sm:w-96 bg-zinc-950/85 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-2xl text-white animate-in fade-in slide-in-from-right-4 duration-300"
    >
      {/* Top Bar with Category, Index, and Close Button */}
      <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: product.accentColor }}
          />
          <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400">
            {product.category} • Model 0{currentIndex + 1}
          </span>
        </div>

        <button
          onClick={() => setActiveProductId(null)}
          className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800/60 transition-colors"
          title="Exit Inspection (Esc)"
          aria-label="Close details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Title & Subtitle */}
      <div className="mb-3">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
          {product.name}
        </h2>
        {product.subtitle && (
          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{product.subtitle}</p>
        )}
      </div>

      {/* Price & Availability Tag */}
      <div className="flex items-baseline justify-between mb-4 bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/40">
        <div>
          <span className="text-xs text-zinc-400 font-medium">Price</span>
          <p className="text-2xl font-black text-white">
            {product.currency}{product.price}
          </p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Check className="w-3 h-3" /> Available Now
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-zinc-300 leading-relaxed mb-4">
        {product.description}
      </p>

      {/* EU Size Variant Selection */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-zinc-300">Select EU Size</label>
          <span className="text-[11px] text-zinc-400">True to fit</span>
        </div>

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
                    ? 'border-[#ff5a36] bg-[#ff5a36] text-white shadow-md shadow-[#ff5a36]/25 font-bold'
                    : isAvail
                    ? 'border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-zinc-700 hover:text-white'
                    : 'border-zinc-900/50 bg-zinc-950/40 text-zinc-600 line-through cursor-not-allowed'
                }`}
              >
                {v.label.replace('EU ', '')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add To Cart CTA Button */}
      <button
        onClick={handleAddToCart}
        className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-xl transition-all duration-200 active:scale-[0.98] ${
          addedAnimation
            ? 'bg-emerald-500 text-white shadow-emerald-500/25'
            : 'bg-[#ff5a36] hover:bg-[#ff6e4e] text-white shadow-[#ff5a36]/30'
        }`}
      >
        {addedAnimation ? (
          <>
            <Check className="w-4 h-4 animate-in zoom-in" />
            Added to Cart!
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            Add to Bag • {product.currency}{product.price}
          </>
        )}
      </button>

      {/* Footer Navigation: Previous / Next Sneaker */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800/50 text-xs text-zinc-400">
        <button
          onClick={() => setActiveProductId(prevProduct.id)}
          className="flex items-center gap-1 hover:text-white transition-colors p-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{prevProduct.name.split(' ')[0]}</span>
        </button>

        <span className="text-[10px] text-zinc-400 font-mono">Use ← → arrow keys</span>

        <button
          onClick={() => setActiveProductId(nextProduct.id)}
          className="flex items-center gap-1 hover:text-white transition-colors p-1"
        >
          <span>{nextProduct.name.split(' ')[0]}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}

