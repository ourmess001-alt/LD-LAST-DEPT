'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { PRODUCTS } from '@/data/products';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export function CartDrawer() {
  const isCartOpen = useStore((s) => s.isCartOpen);
  const cart = useStore((s) => s.cart);
  const setIsCartOpen = useStore((s) => s.setIsCartOpen);
  const updateQuantity = useStore((s) => s.updateQuantity);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const clearCart = useStore((s) => s.clearCart);
  const subtotal = useStore((s) => s.getCartSubtotal());

  const dialogRef = useRef<HTMLDialogElement>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  // Synchronize native <dialog> with Zustand isCartOpen state
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isCartOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isCartOpen]);

  // Handle native close & cancel events and fallback light-dismiss
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      dialog.returnValue = '';
      setIsCartOpen(false);
    };

    const handleCancel = (e: Event) => {
      // Default cancel event allows Escape dismissal and synchronizes state
      setIsCartOpen(false);
    };

    // Fallback light-dismiss for browsers without native 'closedby' attribute support
    // (Mandatory per modern-web-guidance: test click coordinates against getBoundingClientRect())
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
  }, [setIsCartOpen]);

  const handleUpdateQty = (key: string, productName: string, delta: number) => {
    updateQuantity(key, delta);
    setLiveAnnouncement(`Updated quantity for ${productName}`);
  };

  const handleRemove = (key: string, productName: string) => {
    removeFromCart(key);
    setLiveAnnouncement(`Removed ${productName} from bag`);
  };

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: 'any' } as any)}
      aria-labelledby="cart-title"
      className="fixed inset-y-0 right-0 left-auto m-0 h-full max-h-screen w-full max-w-md bg-[#0e0d16] border-l border-zinc-800/80 p-6 flex-col text-white shadow-2xl z-50 overflow-hidden"
    >
      {/* Polite ARIA live region for screen-reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <ShoppingBag className="w-5 h-5 text-[#ff4d29]" aria-hidden="true" />
          <h2 id="cart-title" className="text-base font-bold font-mono tracking-wider uppercase">
            Your Bag ({cart.length})
          </h2>
        </div>
        <form method="dialog">
          <button
            type="submit"
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4d29]"
            aria-label="Close shopping bag dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Cart Item List */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 p-6">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
              <ShoppingBag className="w-8 h-8 text-zinc-600" aria-hidden="true" />
            </div>
            <p className="font-semibold text-zinc-200 text-sm">Your exhibition bag is empty</p>
            <p className="text-xs text-zinc-400 mt-1 max-w-[220px]">
              Select any 3D sneaker in the showroom to inspect and add to your bag.
            </p>
          </div>
        ) : (
          cart.map((item) => {
            const product = PRODUCTS.find((p) => p.id === item.productId);
            if (!product) return null;
            const variant = product.variants.find((v) => v.id === item.variantId);
            const color = product.colors.find((c) => c.id === item.colorId);

            return (
              <div
                key={item.key}
                className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 gap-3"
              >
                <div className="flex items-center gap-3">
                  {/* Visual Color Swatch */}
                  <div
                    className="w-12 h-12 rounded-lg border border-zinc-800 flex items-center justify-center relative overflow-hidden shrink-0"
                    style={{ backgroundColor: color?.hex ?? product.bodyColor }}
                    aria-hidden="true"
                  >
                    <div
                      className="w-full h-2 absolute bottom-0"
                      style={{ backgroundColor: color?.accentHex ?? product.accentColor }}
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-zinc-100 uppercase">{product.name}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {color?.name ?? 'Standard'} • <span className="text-zinc-200 font-semibold">{variant?.label}</span>
                    </p>
                    <p className="text-xs font-bold font-mono text-[#ff4d29] mt-1">
                      €{item.priceSnapshot * item.quantity}
                    </p>
                  </div>
                </div>

                {/* Quantity Stepper & Remove */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item.key, product.name, -1)}
                      className="p-1 hover:text-[#ff4d29] text-zinc-400"
                      aria-label={`Decrease quantity of ${product.name}`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-mono font-bold text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item.key, product.name, 1)}
                      className="p-1 hover:text-[#ff4d29] text-zinc-400"
                      aria-label={`Increase quantity of ${product.name}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(item.key, product.name)}
                    className="text-zinc-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
                    aria-label={`Remove ${product.name} from bag`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer with Summary & Demo Checkout */}
      {cart.length > 0 && (
        <div className="border-t border-zinc-800/80 pt-4 space-y-3 shrink-0">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400 font-mono uppercase text-xs">Total Subtotal</span>
            <span className="font-black text-2xl font-mono text-white">€{subtotal}</span>
          </div>

          <p className="text-[10px] text-zinc-400 text-center font-mono">
            *Showcase Exhibition Mode: Cart simulation. No live payment gateway processed.
          </p>

          <button
            type="button"
            onClick={() => alert(`Exhibition order complete for €${subtotal}! Thank you for visiting AETHER ATELIER.`)}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#ff4d29] to-[#ff6b4a] hover:from-[#ff5e3b] hover:to-[#ff7b5c] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#ff4d29]/25 transition-transform active:scale-[0.98]"
          >
            Exhibition Checkout
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              clearCart();
              setLiveAnnouncement('Cleared all items from bag');
            }}
            className="w-full text-center text-xs text-zinc-400 hover:text-zinc-300 py-1 transition-colors font-mono"
          >
            Clear Bag
          </button>
        </div>
      )}
    </dialog>
  );
}
