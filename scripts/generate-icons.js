const fs = require('fs');
const path = require('path');

// Simple SVG icon template
const createSVG = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#06b6d4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#grad)"/>
  <text x="256" y="340" font-size="280" text-anchor="middle" fill="white">🎯</text>
</svg>
`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const iconsDir = path.join(__dirname, '../public/icons');

// Ensure directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create placeholder SVG files for each size
// In production, convert these to PNG using a tool like sharp
sizes.forEach(size => {
  const svgContent = createSVG(size);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.svg`), svgContent);
  console.log(`Created icon-${size}x${size}.svg`);
});

console.log('Icon generation complete!');
console.log('Note: Convert SVGs to PNGs for full PWA support');
