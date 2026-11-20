const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function testHover() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9229',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--window-size=1400,900',
    'http://localhost:3000'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const list = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9229/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

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

  ws.onopen = async () => {
    await send('Runtime.enable');
    await send('Page.enable');
    await send('Input.enable');

    console.log('Page loaded, waiting 3s for 3D canvas...');
    await new Promise(r => setTimeout(r, 3000));

    // 1. Capture Overview Screenshot (idle state)
    let shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot && shot.data) {
      fs.writeFileSync('scratch/live_overview_realistic.png', Buffer.from(shot.data, 'base64'));
      console.log('Saved scratch/live_overview_realistic.png');
    }

    // 2. Hover over Shoe 2 (Vortex Nitro / Forum Buckle) at (500, 330)
    console.log('Moving mouse to hover over Shoe 2 at (500, 330)...');
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 500, y: 330 });

    // Wait 1.5s for hover animation & orange glow to illuminate
    await new Promise(r => setTimeout(r, 1500));

    shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot && shot.data) {
      fs.writeFileSync('scratch/live_hover_shelf2.png', Buffer.from(shot.data, 'base64'));
      console.log('Saved scratch/live_hover_shelf2.png');
    }

    // 3. Click Shoe 2 to focus
    console.log('Clicking to focus on Shoe 2...');
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 500, y: 330, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 500, y: 330, button: 'left', clickCount: 1 });

    // Wait 2.5s for camera transition
    await new Promise(r => setTimeout(r, 2500));

    shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot && shot.data) {
      fs.writeFileSync('scratch/live_focus_realistic.png', Buffer.from(shot.data, 'base64'));
      console.log('Saved scratch/live_focus_realistic.png');
    }

    ws.close();
    edge.kill();
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const resolve = pending.get(msg.id);
      pending.delete(msg.id);
      resolve(msg.result);
    }
  };
}

testHover().catch(console.error);

