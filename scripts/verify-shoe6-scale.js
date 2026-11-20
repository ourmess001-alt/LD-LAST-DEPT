const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function verifyShoe6() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const port = 9265;
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
    await send('Page.enable');

    console.log('Polling for canvas and waiting for loading screen to dismiss...');
    for (let i = 0; i < 30; i++) {
      const res = await send('Runtime.evaluate', {
        expression: '(() => { const c = document.querySelector("canvas"); return !!c && !document.body.innerText.includes("LOADING"); })()'
      });
      if (res && res.result && res.result.value) {
        break;
      }
      await new Promise(r => setTimeout(r, 1000));
    }

    // Wait 3.5s for 3D GLTF models and textures to settle
    await new Promise(r => setTimeout(r, 3500));

    // 1. Overview screenshot with Shoe 6 scaled nicely
    let shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot && shot.data) {
      fs.writeFileSync('scratch/overview_calibrated_shoe6.png', Buffer.from(shot.data, 'base64'));
      console.log('Saved scratch/overview_calibrated_shoe6.png');
    }

    // 2. Click Shoe 6 (Index 5 in footer dots)
    console.log('Clicking Shoe 6 (Index 5)...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('footer button'));
          if (btns.length > 5) {
            btns[5].click();
            return 'Clicked dot 6';
          }
          return 'Dot 6 not found';
        })()
      `
    });

    // Wait 3.5s for camera transition to Shoe 6
    await new Promise(r => setTimeout(r, 3500));

    shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot && shot.data) {
      fs.writeFileSync('scratch/focus_shoe6_calibrated.png', Buffer.from(shot.data, 'base64'));
      console.log('Saved scratch/focus_shoe6_calibrated.png');
    }

    ws.close();
    edge.kill();
    console.log('Done!');
  };
}

verifyShoe6();

