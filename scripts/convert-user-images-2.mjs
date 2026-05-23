import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const brainDir = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\87ce872d-a76e-4a9f-ab54-71f40b287bb4';
const outputDir = 'public/images/blog';

// Map of source brain file to target filename
const imageMap = [
  { src: 'media__1779541654542.jpg', target: 'notebooks-in-shop-lineup.webp' },
  { src: 'media__1779541664138.jpg', target: 'asus-tuf-gaming-f15-blue.webp' },
  { src: 'media__1779541664147.jpg', target: 'acer-aspire-3-office-laptop.webp' },
  { src: 'media__1779541664159.jpg', target: 'asus-tuf-gaming-a15-red.webp' },
];

async function convertImages() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const item of imageMap) {
    const srcPath = path.join(brainDir, item.src);
    const destPath = path.join(outputDir, item.target);

    if (fs.existsSync(srcPath)) {
      await sharp(srcPath)
        .resize(1024) // Resize width to 1024 for web performance, maintaining aspect ratio
        .webp({ quality: 80 })
        .toFile(destPath);
      console.log(`Successfully converted and saved: ${destPath}`);
    } else {
      console.error(`Source file not found: ${srcPath}`);
    }
  }
}

convertImages().catch(err => {
  console.error('Error during conversion:', err);
  process.exit(1);
});
