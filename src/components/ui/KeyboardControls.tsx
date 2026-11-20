'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { PRODUCTS } from '@/data/products';

export function KeyboardControls() {
  const activeProductId = useStore((s) => s.activeProductId);
  const isCartOpen = useStore((s) => s.isCartOpen);
  const isSearchOpen = useStore((s) => s.isSearchOpen);
  const setActiveProductId = useStore((s) => s.setActiveProductId);
  const setHoveredProductId = useStore((s) => s.setHoveredProductId);
  const setIsCartOpen = useStore((s) => s.setIsCartOpen);
  const setIsSearchOpen = useStore((s) => s.setIsSearchOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Search Shortcut (Cmd+K / Ctrl+K or '/')
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !isSearchOpen)) {
        const target = e.composedPath()[0];
        if (!target || !(target instanceof Element) || !target.matches('input, textarea, select')) {
          e.preventDefault();
          setIsSearchOpen(true);
          return;
        }
      }

      // Don't intercept navigation when user is typing in an input/textarea
      const target = e.composedPath()[0];
      if (target && target instanceof Element && target.matches('input, textarea, select, [contenteditable="true"]')) {
        return;
      }

      // 2. Escape key: closes search first, then cart, or returns to collection overview
      if (e.key === 'Escape') {
        if (isSearchOpen) {
          setIsSearchOpen(false);
          e.preventDefault();
        } else if (isCartOpen) {
          setIsCartOpen(false);
          e.preventDefault();
        } else if (activeProductId) {
          setActiveProductId(null);
          setHoveredProductId(null);
          e.preventDefault();
        }
        return;
      }

      // If search or cart is open, let native dialog handle focus containment
      if (isSearchOpen || isCartOpen) return;

      // 2. Spatial 2D Navigation in Overview Mode (2 rows of 5 shoes)
      if (!activeProductId) {
        // Find currently hovered shoe or default to first shoe
        const currentHoveredId = useStore.getState().hoveredProductId;
        let currentIndex = currentHoveredId ? PRODUCTS.findIndex((p) => p.id === currentHoveredId) : -1;

        if (e.key === 'ArrowRight') {
          e.preventDefault();
          const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % PRODUCTS.length;
          setHoveredProductId(PRODUCTS[nextIndex].id);
          focusFooterDot(nextIndex);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const prevIndex = currentIndex === -1 ? 0 : (currentIndex - 1 + PRODUCTS.length) % PRODUCTS.length;
          setHoveredProductId(PRODUCTS[prevIndex].id);
          focusFooterDot(prevIndex);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          // Jump from Row 1 (0..4) to Row 2 (5..9)
          if (currentIndex >= 0 && currentIndex < 5) {
            const nextRowIndex = currentIndex + 5;
            setHoveredProductId(PRODUCTS[nextRowIndex].id);
            focusFooterDot(nextRowIndex);
          } else if (currentIndex === -1) {
            setHoveredProductId(PRODUCTS[5].id);
            focusFooterDot(5);
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          // Jump from Row 2 (5..9) to Row 1 (0..4)
          if (currentIndex >= 5) {
            const prevRowIndex = currentIndex - 5;
            setHoveredProductId(PRODUCTS[prevRowIndex].id);
            focusFooterDot(prevRowIndex);
          } else if (currentIndex === -1) {
            setHoveredProductId(PRODUCTS[0].id);
            focusFooterDot(0);
          }
        } else if (e.key === 'Enter' || e.key === ' ') {
          if (currentHoveredId) {
            e.preventDefault();
            setActiveProductId(currentHoveredId);
          }
        }
        return;
      }

      // 3. Sequential Navigation in Focus Mode (Left/Right arrow cycles products)
      if (activeProductId) {
        const currentIndex = PRODUCTS.findIndex((p) => p.id === activeProductId);
        if (currentIndex === -1) return;

        if (e.key === 'ArrowRight') {
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % PRODUCTS.length;
          setActiveProductId(PRODUCTS[nextIndex].id);
          setHoveredProductId(PRODUCTS[nextIndex].id);
          focusFooterDot(nextIndex);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const prevIndex = (currentIndex - 1 + PRODUCTS.length) % PRODUCTS.length;
          setActiveProductId(PRODUCTS[prevIndex].id);
          setHoveredProductId(PRODUCTS[prevIndex].id);
          focusFooterDot(prevIndex);
        }
      }
    };

    function focusFooterDot(index: number) {
      const buttons = document.querySelectorAll<HTMLButtonElement>('footer [role="tab"]');
      if (buttons[index]) {
        buttons[index].focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProductId, isCartOpen, isSearchOpen, setActiveProductId, setHoveredProductId, setIsCartOpen, setIsSearchOpen]);

  return null;
}
