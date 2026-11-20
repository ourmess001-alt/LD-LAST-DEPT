const http = require('http');
const { spawn } = require('child_process');

async function testBrowser() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:3000'
  ]);

  console.log('Started Edge process PID:', edge.pid);
  
  // wait 2 seconds for port 9222 to open
  await new Promise(r => setTimeout(r, 2000));

  // get WebSocket debugger URL
  http.get('http://127.0.0.1:9222/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Pages:', data);
      edge.kill();
    });
  }).on('error', (err) => {
    console.error('Failed to connect to Edge debug port:', err.message);
    edge.kill();
  });
}

testBrowser();

