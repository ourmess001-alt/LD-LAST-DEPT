const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function testHover() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const port = 9250;
  const edge = spawn(edgePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--window-size=1440,900',
    'http://localhost:3000'
  ]);

  await new Promise(r => setTimeout(r, 2500));

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
    await send('Page.enable');
    await send('Input.enable');

    console.log('Polling for canvas...');
    for (let i = 0; i < 20; i++) {
      const res = await send('Runtime.evaluate', {
        expression: '!!document.querySelector("canvas")'
      });
      if (res && res.result && res.result.value) {
        break;
      }
      await new Promise(r => setTimeout(r, 800));
    }

    console.log('Waiting 3s for models to render...');
    await new Promise(r => setTimeout(r, 3000));

    // Move pointer over Shoe 2 in 3D: x: 520, y: 320
    console.log('Dispatching mouseMove to Shoe 2 (520, 320)...');
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 520, y: 320 });

    // Wait 900ms for smooth luxury lighting bloom
    await new Promise(r => setTimeout(r, 900));

    let shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot && shot.data) {
      fs.writeFileSync('scratch/live_hover_direct.png', Buffer.from(shot.data, 'base64'));
      console.log('Saved scratch/live_hover_direct.png');
    }

    // Now move pointer to Shoe 5 (Air Jordan 1, top right, x: 1140, y: 320)
    console.log('Dispatching mouseMove to Shoe 5 (1140, 320)...');
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1140, y: 320 });

    await new Promise(r => setTimeout(r, 900));

    shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot && shot.data) {
      fs.writeFileSync('scratch/live_hover_shoe5.png', Buffer.from(shot.data, 'base64'));
      console.log('Saved scratch/live_hover_shoe5.png');
    }

    ws.close();
    edge.kill();
    console.log('Hover tests complete!');
  };
}

testHover();

