const fs = require('fs');
const { spawn } = require('child_process');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="256" viewBox="0 0 512 256">
  <defs>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ff4415" stop-opacity="0.95" />
      <stop offset="25%" stop-color="#ff5511" stop-opacity="0.75" />
      <stop offset="60%" stop-color="#ff3300" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#ff2200" stop-opacity="0" />
    </linearGradient>
    <radialGradient id="horizFade" cx="50%" cy="0%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
      <stop offset="70%" stop-color="#ffffff" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>
    <mask id="glowMask">
      <rect width="512" height="256" fill="url(#horizFade)" />
    </mask>
    <filter id="glowBlur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="14" />
    </filter>
  </defs>

  <rect width="512" height="256" fill="url(#glowGrad)" mask="url(#glowMask)" filter="url(#glowBlur)" />
</svg>`;

fs.writeFileSync('scratch/neon_glow.svg', svg.trim());

async function rasterize() {
  const base64 = Buffer.from(svg).toString('base64');
  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:transparent;overflow:hidden;">
  <img src="data:image/svg+xml;base64,${base64}" width="512" height="256" style="display:block;" />
</body>
</html>`;
  fs.writeFileSync('scratch/neon_glow.html', html);

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const proc = spawn(edgePath, [
    '--headless=new',
    '--screenshot=' + process.cwd() + '\\public\\images\\neon_wall_glow.png',
    '--window-size=512,256',
    '--default-background-color=00000000',
    'file:///' + process.cwd().replace(/\\/g, '/') + '/scratch/neon_glow.html'
  ]);

  proc.on('close', (code) => {
    console.log('Rasterized neon_wall_glow.png with code', code);
  });
}

rasterize();

