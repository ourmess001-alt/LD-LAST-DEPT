export type ProductStatus = 'available' | 'out-of-stock' | 'pre-order';

export interface ProductVariant {
  id: string;
  label: string;
  available?: boolean;
}

export interface ColorVariant {
  id: string;
  name: string;
  hex: string;
  accentHex: string;
}

export interface ProductItem {
  id: string;
  slug: string;
  name: string;
  referenceCode: string;
  tier: string;
  subtitle: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  status: ProductStatus;
  accentColor: string;
  bodyColor: string;
  soleColor: string;
  laceColor: string;
  colors: ColorVariant[];
  defaultColorId: string;
  modelUrl?: string;
  imageUrl?: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  variants: ProductVariant[];
  defaultVariantId: string;
}

export interface CartItem {
  key: string;
  productId: string;
  variantId: string; // Size
  colorId: string;
  quantity: number;
  priceSnapshot: number;
}
