export const SHOWROOM_CONFIG = {
  preset: 'floating-shelf' as const,
  brand: {
    name: 'AETHER',
    subtitle: 'ATELIER',
    tagline: 'Digital Footwear Exhibition • Season 04',
    currencySymbol: '€',
    currencyCode: 'EUR',
  },
  grid: {
    rows: 2,
    columns: 5,
    xSpacing: 2.5,
    rowY: [1.32, -1.32] as [number, number],
    productZ: 0,
    shelfDepth: 1.5,
    shelfMarginX: 1.2,
    shelfThickness: 0.08,
  },
  camera: {
    overviewPosition: [0, 0.02, 8.5] as [number, number, number],
    overviewLookAt: [0, 0, 0] as [number, number, number],
    focusOffset: [0.28, 0.16, 2.35] as [number, number, number],
    pointerParallax: { x: 0.35, y: 0.20 },
    smoothTime: 0.42,
    lookAtSmoothTime: 0.36,
    fov: 44,
    near: 0.1,
    far: 100,
  },
  lighting: {
    background: '#18161c', // Velvet studio slate charcoal matching reference image
    ambientIntensity: 0.7,
    keyLightColor: '#ffffff',
    keyLightIntensity: 2.0,
    rimLightColor: '#ff5a36', // Warm red-orange glow
    rimLightIntensity: 1.5,
    accentCoolColor: '#8b5cf6', // Muted royal purple fill
    accentCoolIntensity: 0.9,
    shelfAccent: '#ff4d29',
    shelfGlowIdle: 0.65,
    shelfGlowHover: 2.4,
    shelfGlowActive: 5.0,
  },
  bloom: {
    intensity: 1.2,
    luminanceThreshold: 0.82,
    luminanceSmoothing: 0.3,
  },
  animation: {
    idleFloatSpeed: 1.4,
    idleFloatDistance: 0.04,
    autoSpinSpeed: 0.35,
  },
} as const;

export function calculateGridPosition(index: number): [number, number, number] {
  const { columns, xSpacing, rowY, productZ } = SHOWROOM_CONFIG.grid;
  const col = index % columns;
  const row = Math.floor(index / columns);
  const x = (col - (columns - 1) / 2) * xSpacing;
  const y = rowY[row] ?? 0;
  return [x, y, productZ];
}

// Compute the shelf dimensions based on product spacing and margin
export function calculateShelfDimensions() {
  const { columns, xSpacing, shelfDepth, shelfThickness, shelfMarginX } = SHOWROOM_CONFIG.grid;
  const totalSpan = (columns - 1) * xSpacing;
  const width = totalSpan + shelfMarginX * 2;
  return { width, depth: shelfDepth, thickness: shelfThickness };
}
