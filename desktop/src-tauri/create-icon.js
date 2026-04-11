// Create ICO file for Tauri
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function createIco() {
  const sizes = [16, 32, 48, 64, 128, 256];
  const icons = [];
  
  // Load base image
  const basePath = path.join(__dirname, '..', '..', 'AppAssets', 'Web', 'android-chrome-512x512.png');
  
  if (!fs.existsSync(basePath)) {
    console.log('Base image not found, creating placeholder...');
    // Create simple placeholder
    for (const size of sizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // Background
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, size, size);
      
      // Text
      ctx.fillStyle = '#58a6ff';
      ctx.font = `${Math.floor(size/2)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('N', size/2, size/2);
      
      icons.push(canvas.toBuffer('image/png'));
    }
  } else {
    const img = await loadImage(basePath);
    
    for (const size of sizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);
      icons.push(canvas.toBuffer('image/png'));
    }
  }
  
  // Write PNG files for Tauri
  const iconsDir = path.join(__dirname, 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  // Write individual PNGs
  sizes.forEach((size, i) => {
    const filename = `icon-${size}x${size}.png`;
    fs.writeFileSync(path.join(iconsDir, filename), icons[i]);
    console.log(`Created ${filename}`);
  });
  
  console.log('PNG icons created successfully!');
}

createIco().catch(console.error);
