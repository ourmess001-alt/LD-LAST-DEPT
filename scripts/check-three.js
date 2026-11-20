const http = require('http');

async function checkThreePositions() {
  const list = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9226/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const page = list.find(p => p.type === 'page' && p.url.includes('localhost:3000'));
  if (!page) {
    console.log('No page');
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

  ws.onopen = async () => {
    await send('Runtime.enable');
    const res = await send('Runtime.evaluate', {
      expression: `
        (() => {
          // Find R3F canvas root
          const canvas = document.querySelector('canvas');
          const fiberKey = Object.keys(canvas).find(k => k.startsWith('__reactFiber'));
          let fiber = canvas[fiberKey];
          while (fiber && !fiber.stateNode?.__r3f) {
            fiber = fiber.return;
          }
          const scene = fiber?.stateNode?.__r3f?.root?.store?.getState?.()?.scene;
          if (!scene) return 'Scene not found';

          const results = [];
          scene.traverse(child => {
            if (child.name || child.type === 'Group') {
              // check if it has meshes
            }
          });

          return 'Scene found, children: ' + scene.children.length;
        })()
      `
    });
    console.log(res);
    ws.close();
  };
}

checkThreePositions().catch(console.error);

