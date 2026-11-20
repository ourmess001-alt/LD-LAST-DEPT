const fs = require('fs');
const { spawn } = require('child_process');

// Generate an ultra-smooth, multi-layer radiant neon wall glow SVG
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="512" viewBox="0 0 1024 512">
  <defs>
    <!-- Core hot light source gradient -->
    <radialGradient id="coreGlow" cx="50%" cy="0%" r="60%">
      <stop offset="0%" stop-color="#ff7a30" stop-opacity="0.95" />
      <stop offset="15%" stop-color="#ff5511" stop-opacity="0.80" />
      <stop offset="40%" stop-color="#ff3a00" stop-opacity="0.45" />
      <stop offset="70%" stop-color="#e02500" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <!-- Broad ambient downward wash gradient -->
    <radialGradient id="broadWash" cx="50%" cy="5%" r="75%" fx="50%" fy="0%">
      <stop offset="0%" stop-color="#ff5a15" stop-opacity="0.7" />
      <stop offset="30%" stop-color="#ff4008" stop-opacity="0.4" />
      <stop offset="65%" stop-color="#c02000" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" />
    </filter>
  </defs>

  <!-- Layer 1: Broad ambient downward wash -->
  <rect width="1024" height="512" fill="url(#broadWash)" filter="url(#softBlur)" />

  <!-- Layer 2: Intense optical center glow -->
  <ellipse cx="512" cy="10" rx="360" ry="220" fill="url(#coreGlow)" filter="url(#softBlur)" />
</svg>`;

fs.writeFileSync('scratch/smooth_neon_glow.svg', svg.trim());

async function rasterize() {
  const base64 = Buffer.from(svg).toString('base64');
  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:transparent;overflow:hidden;">
  <img src="data:image/svg+xml;base64,${base64}" width="1024" height="512" style="display:block;" />
</body>
</html>`;
  fs.writeFileSync('scratch/smooth_neon_glow.html', html);

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const proc = spawn(edgePath, [
    '--headless=new',
    '--screenshot=' + process.cwd() + '\\public\\images\\neon_wall_glow.png',
    '--window-size=1024,512',
    '--default-background-color=00000000',
    'file:///' + process.cwd().replace(/\\/g, '/') + '/scratch/smooth_neon_glow.html'
  ]);

  proc.on('close', (code) => {
    console.log('Rasterized new ultra-smooth neon_wall_glow.png with code', code);
  });
}

rasterize();

