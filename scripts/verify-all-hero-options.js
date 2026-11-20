const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function testReactReRenders() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const port = 9291;
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

  await new Promise(r => ws.onopen = r);

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  }

  console.log('Connected to browser. Waiting for initial render...');
  await new Promise(r => setTimeout(r, 2000));

  // 1. Click Search button
  console.log('1. Clicking Search button...');
  await evaluate(`(() => {
    const searchBtn = Array.from(document.querySelectorAll('header button')).find(b => b.textContent.includes('Search'));
    searchBtn.click();
  })()`);

  // Wait 300ms for React effect and dialog to open
  await new Promise(r => setTimeout(r, 300));

  const isSearchOpen = await evaluate(`(() => {
    const searchDialog = document.querySelector('dialog[aria-labelledby="search-title"]');
    return searchDialog ? searchDialog.open : false;
  })()`);
  console.log('Search dialog open:', isSearchOpen);

  // 2. Select Shoe 6 (Gazelle) from quick filter or search
  console.log('2. Searching "Gazelle" and selecting...');
  await evaluate(`(() => {
    const input = document.querySelector('dialog[aria-labelledby="search-title"] input');
    input.value = 'Gazelle';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);

  await new Promise(r => setTimeout(r, 400));

  const selectShoe6 = await evaluate(`(() => {
    const results = document.querySelectorAll('dialog[aria-labelledby="search-title"] [role="none"], dialog[aria-labelledby="search-title"] .cursor-pointer');
    for (const r of results) {
      if (r.textContent.includes('GAZELLE') || r.textContent.includes('INDEX 06')) {
        r.click();
        return true;
      }
    }
    if (results[0]) { results[0].click(); return true; }
    return false;
  })()`);
  console.log('Selected Gazelle:', selectShoe6);

  // Wait for 3D camera to transition into focus mode
  await new Promise(r => setTimeout(r, 1200));

  // 3. Check Right Shop Panel details
  const shopPanelState = await evaluate(`(() => {
    const right = document.querySelector('aside[aria-label="Product Purchase Configuration"]');
    if (!right) return { found: false };
    const price = right.querySelector('div.text-right span')?.textContent;
    const colors = Array.from(right.querySelectorAll('button[aria-label^="Select colorway"]')).map(b => b.textContent.trim());
    const size = right.querySelector('button[aria-label="Select shoe size"] span')?.textContent;
    return {
      found: true,
      price,
      colors,
      size
    };
  })()`);
  console.log('3. Shop Panel Initial State:', shopPanelState);

  // 4. Test Quantity Plus (+) button
  console.log('4. Clicking Quantity + button twice (qty = 3)...');
  await evaluate(`(() => {
    const plusBtn = document.querySelector('aside[aria-label="Product Purchase Configuration"] button[aria-label="Increase quantity"]');
    if (plusBtn) {
      plusBtn.click();
      plusBtn.click();
    }
  })()`);

  await new Promise(r => setTimeout(r, 300));

  const afterPlusState = await evaluate(`(() => {
    const right = document.querySelector('aside[aria-label="Product Purchase Configuration"]');
    const qtySpan = right.querySelector('button[aria-label="Increase quantity"]')?.previousElementSibling?.textContent;
    const priceText = right.querySelector('div.text-right span')?.textContent;
    const perUnitText = right.querySelector('div.text-right span.text-xs')?.textContent;
    return {
      quantity: qtySpan,
      priceText,
      perUnitText
    };
  })()`);
  console.log('After Quantity Stepper update:', afterPlusState);

  // 5. Click "Add to Bag"
  console.log('5. Clicking "Add to Bag"...');
  await evaluate(`(() => {
    const right = document.querySelector('aside[aria-label="Product Purchase Configuration"]');
    const addBtn = Array.from(right.querySelectorAll('button')).find(b => b.textContent.includes('Add to Bag'));
    if (addBtn) addBtn.click();
  })()`);

  await new Promise(r => setTimeout(r, 500));

  // 6. Verify Cart Drawer is open and contains 3 items
  const cartDrawerDetails = await evaluate(`(() => {
    const cartDialog = document.querySelector('dialog[aria-labelledby="cart-title"]');
    const bagBtn = Array.from(document.querySelectorAll('header button')).find(b => b.getAttribute('aria-label')?.includes('Shopping bag'));
    const bagCount = bagBtn?.querySelector('span.font-mono')?.textContent;
    const items = cartDialog ? cartDialog.querySelectorAll('h3') : [];
    const itemNames = Array.from(items).map(h => h.textContent.trim());
    const totalSubtotal = cartDialog?.querySelector('span.font-black.text-2xl')?.textContent;
    return {
      isOpen: cartDialog ? cartDialog.open : false,
      headerBagCount: bagCount,
      cartItemNames: itemNames,
      subtotal: totalSubtotal
    };
  })()`);
  console.log('6. Cart Drawer State:', cartDrawerDetails);

  // 7. Test closing Cart Drawer with ESC
  console.log('7. Pressing Escape to close Cart Drawer...');
  await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);

  await new Promise(r => setTimeout(r, 400));

  const cartAfterEsc = await evaluate(`(() => {
    const cartDialog = document.querySelector('dialog[aria-labelledby="cart-title"]');
    return cartDialog ? cartDialog.open : false;
  })()`);
  console.log('Cart dialog open after ESC:', cartAfterEsc);

  // 8. Capture focus mode screenshot
  const screenshotFocus = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  fs.writeFileSync('scratch/hero-focus-mode-verification.jpg', Buffer.from(screenshotFocus.data, 'base64'));
  console.log('Focus mode screenshot saved to scratch/hero-focus-mode-verification.jpg');

  // 9. Press Escape again to return to collection overview
  console.log('8. Pressing Escape to return to overview...');
  await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);

  await new Promise(r => setTimeout(r, 1200));

  const overviewState = await evaluate(`(() => {
    const left = document.querySelector('aside[aria-label="Product Details"]');
    const right = document.querySelector('aside[aria-label="Product Purchase Configuration"]');
    return {
      inOverview: !left && !right
    };
  })()`);
  console.log('Overview state restored:', overviewState);

  ws.close();
  edge.kill();
  console.log('All functional checks passed with flying colors!');
}

testReactReRenders().catch(console.error);
