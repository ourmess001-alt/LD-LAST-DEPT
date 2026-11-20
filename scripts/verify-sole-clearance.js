const fs = require('fs');
const path = require('path');
const THREE = require('three');
const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');
const { MeshoptDecoder } = require('three/examples/jsm/libs/meshopt_decoder.module.js');

const models = [
  'air-max-90.glb',
  'forum-buckle.glb',
  'old-skool.glb',
  'dunk-low.glb',
  'air-jordan-1.glb',
  'gazelle.glb',
  'chuck-taylor.glb',
  'puma-suede.glb',
  'bape-sta.glb',
  'MaterialsVariantsShoe.glb'
];

async function checkClearance() {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);

  const shelfTopY = -0.3725;

  for (let i = 0; i < models.length; i++) {
    const m = models[i];
    const buf = fs.readFileSync(path.join(__dirname, '..', 'public', 'models', 'sneakers', m));
    await new Promise((resolve) => {
      loader.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), '', (gltf) => {
        const clone = gltf.scene;
        const initialBox = new THREE.Box3().setFromObject(clone);
        const initialSize = new THREE.Vector3();
        initialBox.getSize(initialSize);

        const maxDim = Math.max(initialSize.x, initialSize.y, initialSize.z);
        const targetScale = 1.72 / (maxDim || 1);
        clone.scale.setScalar(targetScale);
        clone.updateMatrixWorld(true);

        const scaledBox = new THREE.Box3().setFromObject(clone);
        const scaledCenter = new THREE.Vector3();
        scaledBox.getCenter(scaledCenter);

        clone.position.x = -scaledCenter.x;
        clone.position.z = -scaledCenter.z;
        clone.position.y = -scaledBox.min.y - 0.360;
        clone.updateMatrixWorld(true);

        const finalBox = new THREE.Box3().setFromObject(clone);
        const clearance = finalBox.min.y - shelfTopY;
        console.log(`Model ${i+1} (${m}): final min Y = ${finalBox.min.y.toFixed(4)}, clearance above shelf = ${clearance.toFixed(4)}`);
        resolve();
      }, (err) => {
        // if texture error in node, ignore since geometry is parsed
        resolve();
      });
    });
  }
}

checkClearance();

