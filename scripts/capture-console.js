const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--window-size=1400,900',
    'http://localhost:3000'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const list = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9223/json', (res) => {
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

  console.log('Connecting to page:', page.title, page.webSocketDebuggerUrl);

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
    fs.mkdirSync('scratch', { recursive: true });
    await send('Network.enable');
    await send('Runtime.enable');
    await send('Log.enable');
    await send('Page.enable');

    console.log('Listening for console messages for 5 seconds...');
    await new Promise(r => setTimeout(r, 6000));

    // Capture screenshot
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot && shot.data) {
      fs.writeFileSync('scratch/live_showroom.png', Buffer.from(shot.data, 'base64'));
      console.log('Screenshot saved to scratch/live_showroom.png');
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
      return;
    }

    if (msg.method === 'Network.responseReceived') {
      const resp = msg.params.response;
      if (resp.status >= 400) {
        console.log(`[NETWORK ${resp.status}] ${resp.url}`);
      }
    } else if (msg.method === 'Network.loadingFailed') {
      console.log(`[NETWORK FAIL] ${msg.params.errorText}`);
    } else if (msg.method === 'Runtime.consoleAPICalled') {
      const args = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
      console.log(`[BROWSER CONSOLE ${msg.params.type}]`, args);
    } else if (msg.method === 'Log.entryAdded') {
      console.log(`[BROWSER LOG ${msg.params.entry.level}]`, msg.params.entry.text);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      console.log(`[BROWSER EXCEPTION]`, JSON.stringify(msg.params.exceptionDetails));
    }
  };
}

run().catch(console.error);
