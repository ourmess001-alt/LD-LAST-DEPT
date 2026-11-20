export interface ModelAssetMetadata {
  productId: string;
  modelUrl: string;
  scale?: number;
  rotationOffset?: [number, number, number];
  positionOffset?: [number, number, number];
}

// Registry of external GLB models (supports both local public/models/ and remote CDNs)
export const MODEL_REGISTRY: Record<string, ModelAssetMetadata> = {
  // Example entry format:
  // 'aero-strider-01': {
  //   productId: 'aero-strider-01',
  //   modelUrl: '/models/sneaker-01.glb',
  //   scale: 1.0,
  // },
};

/**
 * Checks if a valid 3D model asset is registered and available for a given product ID
 */
export function getRegisteredModel(productId: string): ModelAssetMetadata | null {
  return MODEL_REGISTRY[productId] ?? null;
}

