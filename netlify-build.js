#!/usr/bin/env node

// Simple Netlify build script
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Netlify build for HXMP Space...');

try {
  // Step 1: Run Vite build
  console.log('📦 Running Vite build...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Step 2: Copy additional files that Vite might miss
  console.log('📁 Copying additional files...');
  
  const filesToCopy = [
    'floating-nav.js',
    'floating-nav.css',
    'supabase-config.js',
    'auth-utils.js',
    'gumroad-integration.js',
    'admin-dashboard.js',
    'styles.css',
    '_redirects'
  ];
  
  // Ensure dist directory exists
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  
  filesToCopy.forEach(file => {
    const srcPath = path.resolve(file);
    const destPath = path.resolve('dist', file);
    
    if (fs.existsSync(srcPath)) {
      try {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Copied ${file}`);
      } catch (error) {
        console.warn(`⚠️ Failed to copy ${file}:`, error.message);
      }
    } else {
      console.log(`ℹ️ File not found: ${file}`);
    }
  });
  
  // Step 3: Copy assets directory if it exists
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
      console.warn('⚠️ Failed to copy assets:', error.message);
    }
  }
  
  console.log('🎉 Netlify build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}