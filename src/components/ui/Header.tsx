'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { ShoppingBag, RotateCcw, Search } from 'lucide-react';

export function Header() {
  const activeProductId = useStore((s) => s.activeProductId);
  const isCartOpen = useStore((s) => s.isCartOpen);
  const isSearchOpen = useStore((s) => s.isSearchOpen);
  const setActiveProductId = useStore((s) => s.setActiveProductId);
  const toggleCart = useStore((s) => s.toggleCart);
  const toggleSearch = useStore((s) => s.toggleSearch);
  const cartTotal = useStore((s) => s.getCartTotalCount());

  const [activeSection, setActiveSection] = useState<'collection' | 'studio'>('collection');

  useEffect(() => {
    const handleScroll = () => {
      const studioEl = document.getElementById('studio');
      if (studioEl) {
        const rect = studioEl.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.45) {
          setActiveSection('studio');
          return;
        }
      }
      setActiveSection('collection');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none p-6 sm:p-8 flex items-start justify-between">
      {/* ── Brand Identity (Matching reference video top-left) ── */}
      <div className="pointer-events-auto">
        <button
          onClick={() => {
            setActiveProductId(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-left group focus:outline-none"
        >
          <div className="flex items-center gap-2">
            <span className="text-white font-black tracking-tight text-base sm:text-lg font-sans">
              LD <span className="font-light tracking-widest text-zinc-300">LAST DEPT.</span>
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-normal mt-0.5 tracking-wide">
            A different perspective.
          </p>
        </button>
      </div>

      {/* ── Center Navigation (Collection / Studio) ── */}
      <nav className="pointer-events-auto hidden md:flex items-center gap-6 px-5 py-2 rounded-full bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md">
        <button
          onClick={() => {
            setActiveProductId(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`text-xs font-semibold tracking-widest uppercase transition-colors ${
            activeSection === 'collection' && !activeProductId ? 'text-[#ff4d29]' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Collection
        </button>
        <span className="w-1 h-1 rounded-full bg-zinc-700" />
        <button
          onClick={() => {
            const el = document.getElementById('studio');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`text-xs font-semibold tracking-widest uppercase transition-colors ${
            activeSection === 'studio' ? 'text-[#ff4d29]' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Studio
        </button>
      </nav>

      {/* ── Right Actions: Search, Back to Overview & Cart ─────────── */}
      <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-3">
        <button
          onClick={toggleSearch}
          aria-label="Search Collection"
          aria-expanded={isSearchOpen}
          aria-controls="search-title"
          className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white backdrop-blur-md transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#ff4d29]"
        >
          <Search className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline text-xs font-medium">Search</span>
          <kbd className="hidden lg:inline ml-1 px-1.5 py-0.2 rounded bg-zinc-800/80 border border-zinc-700/60 text-[10px] font-mono text-zinc-400">⌘K</kbd>
        </button>

        {activeProductId && (
          <button
            onClick={() => setActiveProductId(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-colors backdrop-blur-md"
            title="Return to Collection (Escape)"
          >
            <RotateCcw className="w-3 h-3 text-[#ff4d29]" />
            <span className="hidden sm:inline">Collection</span>
          </button>
        )}

        <button
          onClick={toggleCart}
          aria-label={`Shopping bag containing ${cartTotal} items`}
          aria-expanded={isCartOpen}
          aria-controls="cart-title"
          className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-white backdrop-blur-md transition-colors focus-visible:ring-2 focus-visible:ring-[#ff4d29]"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-zinc-300" />
          <span className="text-xs font-mono font-bold text-[#ff4d29]">{cartTotal}</span>
        </button>
      </div>
    </header>
  );
}
