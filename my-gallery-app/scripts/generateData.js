import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your photos folder (relative to the script)
const photosPath = path.resolve(__dirname, '../public/photos');
const outputPath = path.resolve(__dirname, '../public/months.json');

const months = [];

try {
  // Check if photos folder exists
  if (!fs.existsSync(photosPath)) {
    console.error(`Photos folder not found at: ${photosPath}`);
    console.log('Creating empty months.json for build...');
    fs.writeFileSync(outputPath, JSON.stringify({ months: [] }, null, 2));
    process.exit(0);
  }

  const folders = fs.readdirSync(photosPath);
  
  const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  folders.forEach(folder => {
    const folderPath = path.join(photosPath, folder);
    if (!fs.statSync(folderPath).isDirectory()) return;

    const parts = folder.split(' ');
    const month = parts.slice(0, -1).join(' ');
    const year = parseInt(parts[parts.length - 1]);

    if (isNaN(year) || !monthOrder.includes(month)) return;

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
    }
  });

  // Sort months chronologically
  months.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
  });

  fs.writeFileSync(outputPath, JSON.stringify({ months }, null, 2));
  console.log(`✅ Generated months.json with ${months.length} months`);

} catch (error) {
  console.error('Error generating months.json:', error);
  // Create empty file to prevent build failure
  fs.writeFileSync(outputPath, JSON.stringify({ months: [] }, null, 2));
}