const fs = require('fs');
const { spawn } = require('child_process');

async function rasterize() {
  const svg = fs.readFileSync('public/images/sneaker_contact_shadow.svg', 'utf8');
  const base64 = Buffer.from(svg).toString('base64');
  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:transparent;overflow:hidden;">
  <img src="data:image/svg+xml;base64,${base64}" width="512" height="256" style="display:block;" />
</body>
</html>`;
  fs.writeFileSync('scratch/shadow_render.html', html);

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const proc = spawn(edgePath, [
    '--headless=new',
    '--screenshot=' + process.cwd() + '\\public\\images\\sneaker_contact_shadow.png',
    '--window-size=512,256',
    '--default-background-color=00000000',
    'file:///' + process.cwd().replace(/\\/g, '/') + '/scratch/shadow_render.html'
  ]);

  proc.on('close', (code) => {
    console.log('Finished with code', code);
    if (fs.existsSync('public/images/sneaker_contact_shadow.png')) {
      console.log('Created public/images/sneaker_contact_shadow.png, size:', fs.statSync('public/images/sneaker_contact_shadow.png').size);
    }
  });
}

rasterize();

