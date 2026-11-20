const fs = require('fs');
const path = require('path');
const THREE = require('three');
const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');

const models = [
  'air-max-90.glb',
  'forum-buckle.glb',
  'forge-runner.glb',
  'dunk-low.glb',
  'air-jordan-1.glb',
  'gazelle.glb',
  'chuck-taylor.glb',
  'puma-suede.glb',
  'air-force-1.glb',
  'MaterialsVariantsShoe.glb'
];

async function testModels() {
  const loader = new GLTFLoader();
  
  for (const m of models) {
    const filePath = path.join(__dirname, '..', 'public', 'models', 'sneakers', m);
    if (!fs.existsSync(filePath)) {
      console.log(`[NOT FOUND] ${m}`);
      continue;
    }
    const buffer = fs.readFileSync(filePath);
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    
    await new Promise((resolve) => {
      loader.parse(
        arrayBuffer,
        '',
        (gltf) => {
          const scene = gltf.scene;
          const box = new THREE.Box3().setFromObject(scene);
          const size = new THREE.Vector3();
          box.getSize(size);
          const center = new THREE.Vector3();
          box.getCenter(center);
          
          let meshCount = 0;
          let matNames = [];
          scene.traverse((child) => {
            if (child.isMesh) {
              meshCount++;
              if (child.material) {
                if (Array.isArray(child.material)) {
                  matNames.push(...child.material.map(mat => mat.name || mat.type));
                } else {
                  matNames.push(child.material.name || child.material.type);
                }
              }
            }
          });
          
          console.log(`[OK] ${m}: meshes=${meshCount}, size=(x:${size.x.toFixed(2)}, y:${size.y.toFixed(2)}, z:${size.z.toFixed(2)}), center=(x:${center.x.toFixed(2)}, y:${center.y.toFixed(2)}, z:${center.z.toFixed(2)}), mats=${matNames.slice(0, 3).join(', ')}`);
          resolve();
        },
        (error) => {
          console.error(`[FAIL] ${m}:`, error);
          resolve();
        }
      );
    });
  }
}

testModels();
