'use client';

import { useStore } from '@/store/useStore';
import { PRODUCTS } from '@/data/products';
import { ProductModel } from './ProductModel';
import { FloatingShelves } from './FloatingShelves';

export function ProductGallery() {
  const activeProductId = useStore((s) => s.activeProductId);
  const hoveredProductId = useStore((s) => s.hoveredProductId);
  const filterCategory = useStore((s) => s.filterCategory);
  const setActiveProductId = useStore((s) => s.setActiveProductId);
  const setHoveredProductId = useStore((s) => s.setHoveredProductId);

  // Filter products by category if selected
  const displayedProducts = filterCategory === 'All'
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === filterCategory || p.tier.includes(filterCategory));

  return (
    <group>
      {/* Architectural Continuous Floating Glass Shelves & Floor Mounts */}
      <FloatingShelves />

      {/* 10 Interactive 3D Sneaker Models */}
      {displayedProducts.map((product) => {
        const isActive = activeProductId === product.id;
        const isHovered = hoveredProductId === product.id;

        return (
          <ProductModel
            key={product.id}
            product={product}
            isActive={isActive}
            isHovered={isHovered}
            onClick={() => {
              if (!isActive) {
                setActiveProductId(product.id);
              }
            }}
            onPointerOver={() => setHoveredProductId(product.id)}
            onPointerOut={() => setHoveredProductId(null)}
          />
        );
      })}
    </group>
  );
}
