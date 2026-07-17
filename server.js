import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// ----- PHOTOS PATH - CHANGE THIS TO YOUR ACTUAL PATH -----
const PHOTOS_BASE = './photos'; // Change if needed
// -------------------------------------------------------

const photosPath = path.resolve(PHOTOS_BASE);

console.log(`\n📁 Looking for photos at: ${photosPath}`);

// Check if path exists
if (!fs.existsSync(photosPath)) {
  console.error(`\n❌ ERROR: Photos folder not found at: ${photosPath}`);
  console.error('\n💡 Please create this folder and add your month subfolders.');
  console.error('   Example:');
  console.error(`   mkdir -p "${photosPath}/July 2025"`);
  console.error(`   cp your-photos/* "${photosPath}/July 2025/"\n`);
}

// Serve photos statically
app.use('/photos', express.static(photosPath));

// API endpoint
app.get('/api/months', (req, res) => {
  try {
    const months = [];
    
    if (!fs.existsSync(photosPath)) {
      return res.json({ error: 'Photos folder not found' });
    }
    
    const folders = fs.readdirSync(photosPath);
    console.log(`📂 Found folders:`, folders);
    
    if (folders.length === 0) {
      console.log('⚠️  No folders found in photos directory');
      return res.json([]);
    }
    
    const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    const parsedFolders = folders
      .map(folder => {
        const folderPath = path.join(photosPath, folder);
        if (!fs.statSync(folderPath).isDirectory()) return null;
        
        const parts = folder.split(' ');
        const month = parts.slice(0, -1).join(' ');
        const year = parseInt(parts[parts.length - 1]);
        
        if (isNaN(year) || !monthOrder.includes(month)) {
          console.log(`⚠️  Skipping invalid folder: ${folder}`);
          return null;
        }
        
        return { folder, month, year, monthIndex: monthOrder.indexOf(month) };
      })
      .filter(Boolean);
    
    parsedFolders.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.monthIndex - b.monthIndex;
    });
    
    parsedFolders.forEach(({ folder, month, year }) => {
      const folderPath = path.join(photosPath, folder);
      const files = fs.readdirSync(folderPath);
      
      const imageFiles = files.filter(f => 
        /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff|heic|JPG|JPEG|PNG|GIF|WEBP|SVG|BMP|TIFF|HEIC)$/i.test(f)
      );
      
      console.log(`📸 Found ${imageFiles.length} images in ${folder}`);
      
      const images = imageFiles.map(f => `/photos/${encodeURIComponent(folder)}/${encodeURIComponent(f)}`);
      
      if (images.length > 0) {
        months.push({
          year: year,
          month: month,
          displayName: `${month} ${year}`,
          folderName: folder,
          imageCount: images.length,
          images: images
        });
      }
    });
    
    console.log(`✅ API returning ${months.length} months with photos`);
    res.json(months);
  } catch (error) {
    console.error('❌ Error in /api/months:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving photos from: ${photosPath}`);
  console.log(`🔗 API: http://localhost:${PORT}/api/months`);
  console.log(`\n📸 Test an image: http://localhost:${PORT}/photos/July%202025/your-image.jpg\n`);
});