const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function verifyModernRack() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const port = 9305;
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

  await new Promise(r => ws.onopen = r);

  console.log('Connected to Edge. Waiting for 3D scene to load...');
  await new Promise(r => setTimeout(r, 3000));

  // 1. Capture Overview Screenshot
  console.log('Capturing overview screenshot of modern racks...');
  const ssOverview = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync('scratch/modern-rack-overview.jpg', Buffer.from(ssOverview.data, 'base64'));
  console.log('Saved scratch/modern-rack-overview.jpg');

  // 2. Focus on shoe 6 (Gazelle) for close-up view of the black top + glass bottom
  console.log('Focusing on Shoe 6 (Gazelle)...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const dots = document.querySelectorAll('footer [role="tab"]');
      if (dots[5]) dots[5].click();
    })()`
  });

  await new Promise(r => setTimeout(r, 1600));

  const ssFocus = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync('scratch/modern-rack-focus.jpg', Buffer.from(ssFocus.data, 'base64'));
  console.log('Saved scratch/modern-rack-focus.jpg');

  ws.close();
  edge.kill();
  console.log('Verification done!');
}

verifyModernRack().catch(console.error);

