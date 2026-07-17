import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Look for photos in the public folder
const photosPath = path.resolve(__dirname, '../public/photos');
const outputPath = path.resolve(__dirname, '../public/months.json');

console.log(`📁 Looking for photos in: ${photosPath}`);

// Ensure the public folder exists
if (!fs.existsSync(path.dirname(outputPath))) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
}

const months = [];

if (fs.existsSync(photosPath)) {
  console.log('✅ Photos folder found!');
  const folders = fs.readdirSync(photosPath);
  console.log(`📂 Found ${folders.length} folders`);
  
  const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  folders.forEach(folder => {
    const folderPath = path.join(photosPath, folder);
    if (!fs.statSync(folderPath).isDirectory()) return;

    const parts = folder.split(' ');
    const month = parts.slice(0, -1).join(' ');
    const year = parseInt(parts[parts.length - 1]);

    if (isNaN(year) || !monthOrder.includes(month)) {
      console.log(`⚠️ Skipping invalid folder: ${folder}`);
      return;
    }

    const files = fs.readdirSync(folderPath);
    const images = files
      .filter(f => /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff|heic)$/i.test(f))
      .map(f => `/photos/${encodeURIComponent(folder)}/${encodeURIComponent(f)}`);

    if (images.length > 0) {
      months.push({
        year: year,
        month: month,
        displayName: `${month} ${year}`,
        images: images
      });
      console.log(`📸 Found ${images.length} images in ${folder}`);
    }
  });

  months.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
  });
} else {
  console.log(`❌ Photos folder NOT found at: ${photosPath}`);
  console.log('💡 Make sure your photos are in: my-gallery-app/public/photos/');
}

fs.writeFileSync(outputPath, JSON.stringify({ months }, null, 2));
console.log(`✅ Generated ${outputPath} with ${months.length} months`);
console.log(`📸 Total images: ${months.reduce((acc, m) => acc + m.images.length, 0)}`);