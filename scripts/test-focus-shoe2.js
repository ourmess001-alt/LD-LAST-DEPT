const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function testShoe2() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9228',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--window-size=1400,900',
    'http://localhost:3000'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const list = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9228/json', (res) => {
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

    console.log('Page loaded, waiting 2s for 3D canvas...');
    await new Promise(r => setTimeout(r, 2000));

    // Capture overview
    let shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot && shot.data) {
      fs.writeFileSync('scratch/live_overview_fixed.png', Buffer.from(shot.data, 'base64'));
    }

    // Select Shoe 2 (Vortex Nitro - index dot 1)
    console.log('Selecting Shoe 2 (Vortex Nitro)...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('footer button'));
          if (btns.length > 1) {
            btns[1].click();
            return 'Clicked Shoe 2';
          }
          return 'Dot not found';
        })()
      `
    });

    // Wait 2.5s for camera transition to focus
    await new Promise(r => setTimeout(r, 2500));

    // Capture focus view of Shoe 2
    shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot && shot.data) {
      fs.writeFileSync('scratch/live_focus_shoe2.png', Buffer.from(shot.data, 'base64'));
      console.log('Focus screenshot saved to scratch/live_focus_shoe2.png');
    }

    // Now drag Shoe 2 to rotate in 3D
    console.log('Dragging Shoe 2 to rotate...');
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 700, y: 400, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 500, y: 380, button: 'left' });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 500, y: 380, button: 'left', clickCount: 1 });

    await new Promise(r => setTimeout(r, 500));

    shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot && shot.data) {
      fs.writeFileSync('scratch/live_focus_shoe2_rotated.png', Buffer.from(shot.data, 'base64'));
      console.log('Rotated screenshot saved to scratch/live_focus_shoe2_rotated.png');
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

testShoe2().catch(console.error);

