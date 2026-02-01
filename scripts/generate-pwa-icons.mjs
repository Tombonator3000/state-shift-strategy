import sharp from 'sharp';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const iconsDir = join(publicDir, 'icons');

// Ensure icons directory exists
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

const svgBuffer = readFileSync(join(iconsDir, 'icon.svg'));

// Icon sizes to generate
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Generate regular icons
async function generateIcons() {
  console.log('Generating PWA icons...');

  for (const size of sizes) {
    const outputPath = join(iconsDir, `icon-${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`  Created: icon-${size}.png`);
  }

  // Generate maskable icons (with padding for safe zone)
  // Maskable icons need content in center 80% (safe zone)
  for (const size of [192, 512]) {
    const outputPath = join(iconsDir, `icon-maskable-${size}.png`);
    const iconSize = Math.floor(size * 0.8); // 80% of total for safe zone
    const padding = Math.floor((size - iconSize) / 2);

    // Create icon with padding for maskable
    const iconBuffer = await sharp(svgBuffer)
      .resize(iconSize, iconSize)
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 26, g: 26, b: 46, alpha: 1 } // #1a1a2e
      }
    })
      .composite([{
        input: iconBuffer,
        left: padding,
        top: padding
      }])
      .png()
      .toFile(outputPath);
    console.log(`  Created: icon-maskable-${size}.png`);
  }

  // Generate Apple touch icon
  const appleTouchIconPath = join(iconsDir, 'apple-touch-icon.png');
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(appleTouchIconPath);
  console.log('  Created: apple-touch-icon.png');

  // Generate favicon-32
  const favicon32Path = join(iconsDir, 'favicon-32x32.png');
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(favicon32Path);
  console.log('  Created: favicon-32x32.png');

  // Generate favicon-16
  const favicon16Path = join(iconsDir, 'favicon-16x16.png');
  await sharp(svgBuffer)
    .resize(16, 16)
    .png()
    .toFile(favicon16Path);
  console.log('  Created: favicon-16x16.png');

  console.log('\nPWA icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
