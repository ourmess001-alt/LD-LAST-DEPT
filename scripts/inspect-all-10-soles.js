const fs = require('fs');
const path = require('path');
const THREE = require('three');
const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');
const { DRACOLoader } = require('three/examples/jsm/loaders/DRACOLoader.js');
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

async function inspectModels() {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);

  for (let i = 0; i < models.length; i++) {
    const filename = models[i];
    const filePath = path.join(__dirname, '..', 'public', 'models', 'sneakers', filename);
    const buf = fs.readFileSync(filePath);
    try {
      await new Promise((resolve) => {
        loader.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), '', (gltf) => {
          const root = gltf.scene;
          const box = new THREE.Box3().setFromObject(root);
          const size = new THREE.Vector3();
          box.getSize(size);
          console.log(`\n--- Model ${i+1}: ${filename} ---`);
          console.log(`Raw bounds: min=(${box.min.x.toFixed(2)}, ${box.min.y.toFixed(2)}, ${box.min.z.toFixed(2)}), max=(${box.max.x.toFixed(2)}, ${box.max.y.toFixed(2)}, ${box.max.z.toFixed(2)})`);
          console.log(`Dimensions: X=${size.x.toFixed(2)}, Y=${size.y.toFixed(2)}, Z=${size.z.toFixed(2)}`);

          // Find lowest vertices in front half (toe) vs back half (heel)
          let minFrontY = Infinity;
          let minBackY = Infinity;

          // Determine longest horizontal axis (is shoe oriented along X or Z?)
          const isXLong = size.x > size.z;
          console.log(`Long axis: ${isXLong ? 'X' : 'Z'}`);

          root.traverse((child) => {
            if (child.isMesh && child.geometry) {
              const geom = child.geometry;
              const pos = geom.attributes.position;
              if (pos) {
                const v = new THREE.Vector3();
                for (let k = 0; k < pos.count; k++) {
                  v.fromBufferAttribute(pos, k);
                  v.applyMatrix4(child.matrixWorld);
                  if (isXLong) {
                    if (v.x > (box.min.x + box.max.x) / 2) {
                      if (v.y < minFrontY) minFrontY = v.y;
                    } else {
                      if (v.y < minBackY) minBackY = v.y;
                    }
                  } else {
                    if (v.z > (box.min.z + box.max.z) / 2) {
                      if (v.y < minFrontY) minFrontY = v.y;
                    } else {
                      if (v.y < minBackY) minBackY = v.y;
                    }
                  }
                }
              }
            }
          });

          console.log(`Lowest points: Front half=${minFrontY.toFixed(3)}, Back half=${minBackY.toFixed(3)}, Diff=${(minFrontY - minBackY).toFixed(3)}`);
          resolve();
        }, (err) => {
          console.log(`Could not parse ${filename}:`, err.message || err);
          resolve();
        });
      });
    } catch (e) {
      console.log(`Error on ${filename}:`, e.message);
    }
  }
}

inspectModels();

