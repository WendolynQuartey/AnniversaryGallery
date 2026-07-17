import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// ----- FIX: Define where your photos are -----
// Option 1: If photos are in the project root inside a 'photos' folder
const PHOTOS_BASE = './photos'; 

// Resolve the absolute path
const photosPath = path.resolve(PHOTOS_BASE);

console.log(`\n📁 Looking for photos at: ${photosPath}`);

// Check if the path exists
if (!fs.existsSync(photosPath)) {
  console.error(`\n❌ ERROR: Photos folder not found at: ${photosPath}`);
  console.error('\n💡 Please:');
  console.error('   1. Create a "photos" folder in your project root');
  console.error('   2. Inside it, create month folders like "July 2025"');
  console.error('   3. Add your images inside those folders');
  console.error('   4. OR update PHOTOS_BASE in server.js to your actual path\n');
  
  // Create the folder to help you out
  console.log('🛠️  Creating "photos" folder for you...');
  fs.mkdirSync(photosPath, { recursive: true });
  console.log(`✅ Created: ${photosPath}`);
  console.log('📂 Now add your month folders and images inside it.\n');
}

// Serve photos statically
app.use('/photos', express.static(photosPath));

// API endpoint
app.get('/api/months', (req, res) => {
  try {
    const months = [];
    
    // Check if photos path exists and is readable
    if (!fs.existsSync(photosPath)) {
      return res.json([]);
    }
    
    const folders = fs.readdirSync(photosPath);
    
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
        
        if (isNaN(year) || !monthOrder.includes(month)) return null;
        
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
      
      const images = files
        .filter(f => /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff|heic)$/i.test(f))
        .map(f => `/photos/${encodeURIComponent(folder)}/${encodeURIComponent(f)}`);
      
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
    
    console.log(`✅ Found ${months.length} months with photos`);
    res.json(months);
  } catch (error) {
    console.error('❌ Error in /api/months:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving photos from: ${photosPath}`);
  console.log(`🔗 API: http://localhost:${PORT}/api/months\n`);
});