import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files
app.use('/photos', express.static('public/photos'));

// API endpoint to get all months and images
app.get('/api/months', (req, res) => {
  const basePath = './public/photos';
  const months = [];
  
  try {
    // Get all folders in the photos directory
    const folders = fs.readdirSync(basePath);
    
    // Sort folders chronologically
    const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Parse folder names like "August 2025"
    const parsedFolders = folders.map(folder => {
      const parts = folder.split(' ');
      const month = parts.slice(0, -1).join(' ');
      const year = parseInt(parts[parts.length - 1]);
      return { folder, month, year, monthIndex: monthOrder.indexOf(month) };
    });
    
    // Sort by year first, then by month
    parsedFolders.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.monthIndex - b.monthIndex;
    });
    
    parsedFolders.forEach(({ folder, month, year }) => {
      const folderPath = path.join(basePath, folder);
      
      // Check if it's a directory
      if (!fs.statSync(folderPath).isDirectory()) return;
      
      // Get all image files
      const files = fs.readdirSync(folderPath);
      const images = files
        .filter(f => /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i.test(f))
        .map(f => `/photos/${encodeURIComponent(folder)}/${encodeURIComponent(f)}`);
      
      // Only add if there are images
      if (images.length > 0) {
        months.push({
          year: year,
          month: month,
          displayName: `${month} ${year}`,
          folderName: folder,
          images: images
        });
      }
    });
    
    res.json(months);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:3001`);
  console.log(`📸 API: http://localhost:3001/api/months`);
});