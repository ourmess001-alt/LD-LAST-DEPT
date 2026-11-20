import { create } from 'zustand';
import { CartItem, ProductItem } from '@/types';
import { PRODUCTS } from '@/data/products';

interface ShowroomStore {
  // Navigation & 3D state
  activeProductId: string | null;
  hoveredProductId: string | null;
  selectedVariants: Record<string, string>; // productId -> variantId (Size)
  selectedColors: Record<string, string>;   // productId -> colorId
  activeQuantity: number;
  filterCategory: string;

  // Cart & UI state
  cart: CartItem[];
  isCartOpen: boolean;
  isSearchOpen: boolean;

  // Actions
  setActiveProductId: (id: string | null) => void;
  setHoveredProductId: (id: string | null) => void;
  setSelectedVariant: (productId: string, variantId: string) => void;
  setSelectedColor: (productId: string, colorId: string) => void;
  setActiveQuantity: (qty: number) => void;
  setFilterCategory: (category: string) => void;
  setIsCartOpen: (open: boolean) => void;
  toggleCart: () => void;
  setIsSearchOpen: (open: boolean) => void;
  toggleSearch: () => void;

  // Cart operations
  addToCart: (productId: string, variantId?: string, colorId?: string, qty?: number) => void;
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, delta: number) => void;
  clearCart: () => void;

  // Helpers
  getActiveProduct: () => ProductItem | undefined;
  getCartTotalCount: () => number;
  getCartSubtotal: () => number;
}

export const useStore = create<ShowroomStore>((set, get) => ({
  activeProductId: null,
  hoveredProductId: null,
  selectedVariants: PRODUCTS.reduce((acc, p) => {
    acc[p.id] = p.defaultVariantId;
    return acc;
  }, {} as Record<string, string>),
  selectedColors: PRODUCTS.reduce((acc, p) => {
    acc[p.id] = p.defaultColorId;
    return acc;
  }, {} as Record<string, string>),
  activeQuantity: 1,
  filterCategory: 'All',

  cart: [],
  isCartOpen: false,
  isSearchOpen: false,

  setIsSearchOpen: (open) => set({ isSearchOpen: open }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),

  setActiveProductId: (id) => {
    set((state) => {
      if (id && !state.selectedVariants[id]) {
        const prod = PRODUCTS.find((p) => p.id === id);
        if (prod) {
          return {
            activeProductId: id,
            activeQuantity: 1,
            selectedVariants: { ...state.selectedVariants, [id]: prod.defaultVariantId },
            selectedColors: { ...state.selectedColors, [id]: prod.defaultColorId },
          };
        }
      }
      return { activeProductId: id, activeQuantity: 1 };
    });
  },

  setHoveredProductId: (id) => set({ hoveredProductId: id }),

  setSelectedVariant: (productId, variantId) => {
    set((state) => ({
      selectedVariants: { ...state.selectedVariants, [productId]: variantId },
    }));
  },

  setSelectedColor: (productId, colorId) => {
    set((state) => ({
      selectedColors: { ...state.selectedColors, [productId]: colorId },
    }));
  },

  setActiveQuantity: (qty) => set({ activeQuantity: Math.max(1, qty) }),

  setFilterCategory: (category) => set({ filterCategory: category }),

  setIsCartOpen: (open) => set({ isCartOpen: open }),

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  addToCart: (productId, variantId, colorId, qty = 1) => {
    const prod = PRODUCTS.find((p) => p.id === productId);
    if (!prod) return;

    const chosenVariant = variantId ?? get().selectedVariants[productId] ?? prod.defaultVariantId;
    const chosenColor = colorId ?? get().selectedColors[productId] ?? prod.defaultColorId;
    const quantityToAdd = qty > 0 ? qty : 1;
    const key = `${productId}-${chosenVariant}-${chosenColor}`;

    set((state) => {
      const existingIndex = state.cart.findIndex((item) => item.key === key);
      if (existingIndex > -1) {
        const updated = [...state.cart];
        updated[existingIndex].quantity += quantityToAdd;
        return { cart: updated, isCartOpen: true };
      }
      return {
        cart: [
          ...state.cart,
          {
            key,
            productId,
            variantId: chosenVariant,
            colorId: chosenColor,
            quantity: quantityToAdd,
            priceSnapshot: prod.price,
          },
        ],
        isCartOpen: true,
      };
    });
  },

  removeFromCart: (key) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.key !== key),
    }));
  },

  updateQuantity: (key, delta) => {
    set((state) => {
      const updated = state.cart
        .map((item) => {
          if (item.key === key) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
      return { cart: updated };
    });
  },

  clearCart: () => set({ cart: [] }),

  getActiveProduct: () => {
    const id = get().activeProductId;
    return id ? PRODUCTS.find((p) => p.id === id) : undefined;
  },

  getCartTotalCount: () => {
    return get().cart.reduce((sum, item) => sum + item.quantity, 0);
  },

  getCartSubtotal: () => {
    return get().cart.reduce((sum, item) => {
      return sum + item.priceSnapshot * item.quantity;
    }, 0);
  },
}));
