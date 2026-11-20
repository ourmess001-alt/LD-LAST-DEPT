const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function testStoreSelect() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9225',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--window-size=1400,900',
    'http://localhost:3000'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const list = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9225/json', (res) => {
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

    console.log('Page loaded, waiting 2s...');
    await new Promise(r => setTimeout(r, 2000));

    // Click directly on Shoe 5 (Air Jordan 1, rightmost top shoe: x=1150, y=340)
    console.log('Dispatching direct canvas click on Shoe 5 at (1150, 340)...');
    await send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: 1150,
      y: 340,
      button: 'left',
      clickCount: 1
    });
    await send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: 1150,
      y: 340,
      button: 'left',
      clickCount: 1
    });

    // Wait 2.5s for camera transition
    await new Promise(r => setTimeout(r, 2500));

    // Capture screenshot of focus mode
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot && shot.data) {
      fs.writeFileSync('scratch/live_focus_button.png', Buffer.from(shot.data, 'base64'));
      console.log('Focus screenshot saved to scratch/live_focus_button.png');
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
    if (msg.method === 'Runtime.consoleAPICalled') {
      const args = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
      console.log(`[BROWSER CONSOLE]`, args);
    }
  };
}

testStoreSelect().catch(console.error);
