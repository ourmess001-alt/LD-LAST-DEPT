const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function testFocus() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9224',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--window-size=1400,900',
    'http://localhost:3000'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const list = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9224/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const page = list.find(p => p.type === 'page' && p.url.includes('localhost:3000'));
  if (!page) {
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

    console.log('Page loaded, waiting 2s...');
    await new Promise(r => setTimeout(r, 2000));

    // Click on center top shoe (index 2: x=0, y=1.35 -> screen: 700, 270)
    console.log('Dispatching mouse click on center shoe (700, 270)...');
    await send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: 700,
      y: 270,
      button: 'left',
      clickCount: 1
    });
    await send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: 700,
      y: 270,
      button: 'left',
      clickCount: 1
    });

    // Wait 2s for camera animation to finish
    await new Promise(r => setTimeout(r, 2500));

    // Capture screenshot of focus mode
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot && shot.data) {
      fs.writeFileSync('scratch/live_focus.png', Buffer.from(shot.data, 'base64'));
      console.log('Focus screenshot saved to scratch/live_focus.png');
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

testFocus().catch(console.error);
