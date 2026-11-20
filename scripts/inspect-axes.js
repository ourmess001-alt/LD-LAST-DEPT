const fs = require('fs');
const path = require('path');
const THREE = require('three');
const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');
const { MeshoptDecoder } = require('three/examples/jsm/libs/meshopt_decoder.module.js');

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

async function inspect() {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);

  for (let i = 0; i < models.length; i++) {
    const m = models[i];
    const buf = fs.readFileSync(path.join(__dirname, '..', 'public', 'models', 'sneakers', m));
    await new Promise((resolve) => {
      loader.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), '', (gltf) => {
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = size.x > size.z ? (size.x > size.y ? 'X' : 'Y') : (size.z > size.y ? 'Z' : 'Y');
        console.log(`Shoe ${i+1} (${m}): size=X:${size.x.toFixed(2)}, Y:${size.y.toFixed(2)}, Z:${size.z.toFixed(2)} -> Long axis: ${maxDim}`);
        resolve();
      }, (err) => {
        console.error(m, err.message);
        resolve();
      });
    });
  }
}
inspect();

