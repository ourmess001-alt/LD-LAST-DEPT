const http = require('http');
const { spawn } = require('child_process');

async function inspectBounds() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const port = 9260;
  const edge = spawn(edgePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--window-size=1440,900',
    'http://localhost:3000'
  ]);

  await new Promise(r => setTimeout(r, 3000));

  let list;
  try {
    list = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${port}/json`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      }).on('error', reject);
    });
  } catch (e) {
    console.error('Failed to connect to Edge:', e.message);
    edge.kill();
    return;
  }

  const page = list.find(p => p.type === 'page' && p.url.includes('localhost:3000'));
  if (!page) {
    console.log('No page found');
    edge.kill();
    return;
  }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 1;
  const pending = new Map();

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = id++;
      pending.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const resolve = pending.get(msg.id);
      pending.delete(msg.id);
      resolve(msg.result);
    }
  };

  ws.onopen = async () => {
    await send('Runtime.enable');
    console.log('Polling for canvas...');
    for (let i = 0; i < 30; i++) {
      const res = await send('Runtime.evaluate', {
        expression: '(() => { const c = document.querySelector("canvas"); return !!c && !document.body.innerText.includes("LOADING"); })()'
      });
      if (res && res.result && res.result.value) {
        break;
      }
      await new Promise(r => setTimeout(r, 1000));
    }

    await new Promise(r => setTimeout(r, 3000));

    // Evaluate three.js scene bounding boxes
    const info = await send('Runtime.evaluate', {
      expression: `
        (() => {
          // Find all 3D sneaker meshes or groups by searching for primitives in the scene
          const canvas = document.querySelector('canvas');
          // Access three.js scene from fiber internal if possible
          const key = Object.keys(canvas).find(k => k.startsWith('__reactFiber'));
          if (!key) return 'Fiber not found';
          
          let fiber = canvas[key];
          let scene = null;
          while (fiber) {
            if (fiber.stateNode && fiber.stateNode.scene) {
              scene = fiber.stateNode.scene;
              break;
            }
            fiber = fiber.return;
          }
          if (!scene) return 'Scene not found in fiber';

          const results = [];
          scene.traverse((obj) => {
            if (obj.name === 'Scene' || (obj.isGroup && obj.children.some(c => c.isMesh))) {
              // check if this is one of our sneaker models
            }
          });
          return 'Scene traversed, children count: ' + scene.children.length;
        })()
      `
    });

    console.log('Info:', info ? info.result : null);
    ws.close();
    edge.kill();
  };
}

inspectBounds();

