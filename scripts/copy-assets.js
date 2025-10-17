const fs = require('fs');
const path = require('path');

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Files to copy to dist
const filesToCopy = [
  // JavaScript files
  'floating-nav.js',
  'app.js',
  'supabase-config.js',
  'admin-dashboard.js',
  'auth-utils.js',
  'video-gallery.js',
  'hxmp-video-player.js',
  'access-control.js',
  'category-gallery.js',
  'photo-gallery.js',
  'gallery.js',
  'comments.js',
  
  // CSS files
  'styles.css',
  'floating-nav.css',
  
  // Config files
  '_redirects',
  'netlify.toml',
  
  // Images (if any in root)
  'xr1.png',
  'xr2.png',
  'xrcakey.jpg',
  'xrcakey.svg'
];

// Copy files
filesToCopy.forEach(file => {
  const srcPath = path.resolve(file);
  const destPath = path.resolve('dist', file);
  
  if (fs.existsSync(srcPath)) {
    try {
      fs.copyFileSync(srcPath, destPath);
      console.log(`✅ Copied ${file}`);
    } catch (error) {
      console.warn(`⚠️  Failed to copy ${file}:`, error.message);
    }
  } else {
    console.log(`ℹ️  File not found: ${file}`);
  }
});

// Copy assets directory if it exists
const assetsDir = 'assets';
const distAssetsDir = path.join('dist', 'assets');

if (fs.existsSync(assetsDir)) {
  if (!fs.existsSync(distAssetsDir)) {
    fs.mkdirSync(distAssetsDir, { recursive: true });
  }
  
  const copyDir = (src, dest) => {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };
  
  try {
    copyDir(assetsDir, distAssetsDir);
    console.log('✅ Copied assets directory');
  } catch (error) {
    console.warn('⚠️  Failed to copy assets:', error.message);
  }
}

console.log('🚀 Asset copying complete!');