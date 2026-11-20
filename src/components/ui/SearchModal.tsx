'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { PRODUCTS } from '@/data/products';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';

const QUICK_TAGS = ['All', 'Runner', 'Basketball', 'Court', 'Skate', 'High-Top'];

export function SearchModal() {
  const isSearchOpen = useStore((s) => s.isSearchOpen);
  const setIsSearchOpen = useStore((s) => s.setIsSearchOpen);
  const setActiveProductId = useStore((s) => s.setActiveProductId);
  const setHoveredProductId = useStore((s) => s.setHoveredProductId);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronize native <dialog> with Zustand isSearchOpen state
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isSearchOpen) {
      if (!dialog.open) {
        dialog.showModal();
        setQuery('');
        setSelectedIndex(0);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isSearchOpen]);

  // Handle native close, cancel, and light dismiss
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      dialog.returnValue = '';
      setIsSearchOpen(false);
    };

    const handleCancel = () => {
      setIsSearchOpen(false);
    };

    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isInside = (
        rect.top <= event.clientY &&
        event.clientY <= rect.bottom &&
        rect.left <= event.clientX &&
        event.clientX <= rect.right
      );
      if (!isInside) {
        dialog.close();
      }
    };

    dialog.addEventListener('close', handleClose);
    dialog.addEventListener('cancel', handleCancel);
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', handleBackdropClick);
    }

    return () => {
      dialog.removeEventListener('close', handleClose);
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('click', handleBackdropClick);
    };
  }, [setIsSearchOpen]);

  // Filtered products based on query
  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q === 'all') return PRODUCTS;

    return PRODUCTS.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchRef = p.referenceCode.toLowerCase().includes(q);
      const matchTier = p.tier.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q);
      const matchSub = p.subtitle.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchColors = p.colors.some((c) => c.name.toLowerCase().includes(q));
      const matchPrice = p.price.toString().includes(q);

      return (
        matchName ||
        matchRef ||
        matchTier ||
        matchCategory ||
        matchSub ||
        matchDesc ||
        matchColors ||
        matchPrice
      );
    });
  }, [query]);

  // Handle selecting product
  const handleSelectProduct = (productId: string) => {
    setIsSearchOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveProductId(productId);
    setHoveredProductId(productId);
  };

  // Keyboard navigation within search results (Up, Down, Enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredProducts.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredProducts.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredProducts.length) % filteredProducts.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredProducts[selectedIndex]) {
        handleSelectProduct(filteredProducts[selectedIndex].id);
      }
    }
  };

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: 'any' } as any)}
      aria-labelledby="search-title"
      className="fixed inset-0 m-auto w-full max-w-2xl h-fit max-h-[85vh] flex flex-col bg-[#110f1c] border border-zinc-800 rounded-3xl p-0 text-white shadow-2xl z-50 overflow-hidden backdrop:bg-black/80 backdrop:backdrop-blur-md"
      onKeyDown={handleKeyDown}
    >
      {/* ── Search Input Bar ────────────────────────────── */}
      <div className="p-4 sm:p-6 border-b border-zinc-800/80 flex items-center gap-3 relative">
        <Search className="w-5 h-5 text-zinc-400 shrink-0" aria-hidden="true" />
        <h2 id="search-title" className="sr-only">Search Showroom Collection</h2>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          placeholder="Search by silhouette, tier, category, or colorway..."
          className="w-full bg-transparent text-base sm:text-lg font-sans placeholder:text-zinc-500 text-white focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
            aria-label="Clear search input"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <form method="dialog">
          <button
            type="submit"
            className="px-2 py-1 rounded-lg text-xs font-mono text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800"
            aria-label="Close search"
          >
            ESC
          </button>
        </form>
      </div>

      {/* ── Quick Category Chips ───────────────────────── */}
      <div className="px-6 py-2.5 border-b border-zinc-800/40 bg-zinc-950/40 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider shrink-0">
          Quick Filters:
        </span>
        {QUICK_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              setQuery(tag === 'All' ? '' : tag);
              inputRef.current?.focus();
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
              (query === tag || (tag === 'All' && !query))
                ? 'bg-[#ff4d29] text-white font-bold'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* ── Filtered Search Results ─────────────────────── */}
      <div className="max-h-[380px] overflow-y-auto p-3 sm:p-4 space-y-1.5 divide-y divide-zinc-900">
        {filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-zinc-400">
            <p className="text-sm font-medium">No matching silhouettes found</p>
            <p className="text-xs text-zinc-500 mt-1">
              Try searching for &ldquo;Air Max&rdquo;, &ldquo;Jordan&rdquo;, &ldquo;Runner&rdquo;, or &ldquo;Gazelle&rdquo;.
            </p>
          </div>
        ) : (
          filteredProducts.map((prod, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={prod.id}
                onClick={() => handleSelectProduct(prod.id)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`p-3 rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-zinc-900/90 border border-zinc-700/80 shadow-lg'
                    : 'hover:bg-zinc-900/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Swatch & Index Badge */}
                  <div
                    className="w-12 h-12 rounded-xl border border-zinc-800 flex items-center justify-center relative overflow-hidden shrink-0 shadow-inner"
                    style={{ backgroundColor: prod.bodyColor }}
                  >
                    <div
                      className="w-full h-2.5 absolute bottom-0"
                      style={{ backgroundColor: prod.accentColor }}
                    />
                    <span className="text-[10px] font-mono font-bold text-white drop-shadow">
                      0{idx + 1}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono tracking-widest text-[#ff4d29] font-bold uppercase">
                        {prod.referenceCode}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">
                        {prod.tier.split('/')[1]?.trim() ?? prod.tier}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm sm:text-base text-white uppercase tracking-tight">
                      {prod.name}
                    </h3>

                    <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                      {prod.subtitle}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-3">
                  <div>
                    <span className="font-black text-sm sm:text-base font-mono text-white">
                      {prod.currency}{prod.price}
                    </span>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase mt-0.5">
                      {prod.category}
                    </p>
                  </div>

                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-[#ff4d29] text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Footer Guidance ─────────────────────────────── */}
      <div className="px-6 py-3 border-t border-zinc-800/80 bg-zinc-950/70 flex items-center justify-between text-[11px] font-mono text-zinc-400">
        <div className="flex items-center gap-3">
          <span><kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">↓</kbd> to navigate</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">↵</kbd> to select in 3D</span>
        </div>
        <span>{filteredProducts.length} silhouettes available</span>
      </div>
    </dialog>
  );
}
