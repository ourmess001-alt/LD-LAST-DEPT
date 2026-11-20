const fs = require('fs');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="256" viewBox="0 0 512 256">
  <defs>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="16" />
    </filter>
    <filter id="core" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="8" />
    </filter>
    <filter id="tight" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="4" />
    </filter>
  </defs>

  <!-- Outer penumbra diffuse shadow -->
  <path d="M 60 128 C 60 75, 105 60, 180 68 C 240 74, 270 95, 320 80 C 375 62, 435 78, 455 128 C 435 178, 375 194, 320 176 C 270 161, 240 182, 180 188 C 105 196, 60 181, 60 128 Z" 
        fill="#040307" opacity="0.45" filter="url(#soft)" />

  <!-- Mid contact shadow -->
  <path d="M 80 128 C 80 85, 115 72, 180 78 C 235 83, 265 102, 315 88 C 365 72, 420 86, 440 128 C 420 170, 365 184, 315 168 C 265 154, 235 173, 180 178 C 115 184, 80 171, 80 128 Z" 
        fill="#020104" opacity="0.75" filter="url(#core)" />

  <!-- Direct contact occlusion core -->
  <path d="M 100 128 C 100 95, 125 84, 180 88 C 230 92, 260 108, 310 96 C 355 82, 405 94, 425 128 C 405 162, 355 174, 310 160 C 260 148, 230 164, 180 168 C 125 172, 100 161, 100 128 Z" 
        fill="#000000" opacity="0.95" filter="url(#tight)" />
</svg>`;

fs.writeFileSync('public/images/sneaker_contact_shadow.svg', svg.trim());
console.log('Saved public/images/sneaker_contact_shadow.svg');

