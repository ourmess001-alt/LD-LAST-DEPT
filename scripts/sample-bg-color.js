const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function sampleImageColors() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const port = 9312;
  const imagePath = 'C:/Users/tsour/.gemini/antigravity/brain/352742db-1011-4733-b87b-e2f9870bcaf3/.user_uploaded/media_1794331440548_d8495919.jpg';
  const base64 = fs.readFileSync(imagePath).toString('base64');
  const dataUri = 'data:image/jpeg;base64,' + base64;

  const html = `
    <!DOCTYPE html>
    <html>
      <body>
        <img id="img" src="${dataUri}" />
        <script>
          window.sample = () => {
            const img = document.getElementById('img');
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            function getHex(x, y) {
              const p = ctx.getImageData(x, y, 1, 1).data;
              const hex = ((1 << 24) + (p[0] << 16) + (p[1] << 8) + p[2]).toString(16).slice(1);
              return { x, y, r: p[0], g: p[1], b: p[2], hex: '#' + hex };
            }

            const w = canvas.width;
            const h = canvas.height;
            return {
              w, h,
              topLeft: getHex(Math.round(w * 0.15), Math.round(h * 0.15)),
              topCenter: getHex(Math.round(w * 0.5), Math.round(h * 0.08)),
              midLeft: getHex(Math.round(w * 0.08), Math.round(h * 0.5)),
              bottomLeft: getHex(Math.round(w * 0.08), Math.round(h * 0.85)),
              bottomCenter: getHex(Math.round(w * 0.5), Math.round(h * 0.96)),
            };
          };
        </script>
      </body>
    </html>
  `;
  fs.writeFileSync('scratch/sample.html', html);

  const edge = spawn(edgePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    'http://localhost:3000'
  ]);

  await new Promise(r => setTimeout(r, 2000));

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

  const page = list[0];
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

  await send('Page.navigate', { url: 'file:///' + path.resolve('scratch/sample.html').replace(/\\/g, '/') });
  await new Promise(r => setTimeout(r, 1000));

  const result = await send('Runtime.evaluate', {
    expression: 'window.sample()',
    returnByValue: true
  });

  console.log('Sampled results:', result?.result?.value);

  ws.close();
  edge.kill();
}

sampleImageColors().catch(console.error);
