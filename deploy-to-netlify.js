#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Deploying HXMP Space to Netlify...\n');

// Step 1: Build the project
console.log('📦 Building project...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 2: Verify build
console.log('🔍 Verifying build...');
try {
  execSync('npm run verify', { stdio: 'inherit' });
  console.log('✅ Build verification passed!\n');
} catch (error) {
  console.error('❌ Build verification failed');
  process.exit(1);
}

// Step 3: Check if Netlify CLI is installed
console.log('🔧 Checking Netlify CLI...');
try {
  execSync('netlify --version', { stdio: 'pipe' });
  console.log('✅ Netlify CLI is installed\n');
} catch (error) {
  console.log('⚠️  Netlify CLI not found. Installing...');
  try {
    execSync('npm install -g netlify-cli', { stdio: 'inherit' });
    console.log('✅ Netlify CLI installed successfully!\n');
  } catch (installError) {
    console.error('❌ Failed to install Netlify CLI:', installError.message);
    console.log('Please install manually: npm install -g netlify-cli');
    process.exit(1);
  }
}

// Step 4: Check if logged in to Netlify
console.log('🔐 Checking Netlify authentication...');
try {
  const result = execSync('netlify status', { encoding: 'utf8' });
  if (result.includes('Not logged in')) {
    console.log('⚠️  Not logged in to Netlify. Please run: netlify login');
    process.exit(1);
  }
  console.log('✅ Authenticated with Netlify\n');
} catch (error) {
  console.log('⚠️  Please login to Netlify first: netlify login');
  process.exit(1);
}

// Step 5: Deploy to Netlify
console.log('🌐 Deploying to Netlify...');
try {
  // First, try to deploy to preview
  console.log('📤 Creating preview deployment...');
  const previewResult = execSync('netlify deploy --dir=dist', { encoding: 'utf8' });
  console.log(previewResult);
  
  // If preview succeeds, deploy to production
  console.log('🚀 Deploying to production...');
  const prodResult = execSync('netlify deploy --prod --dir=dist', { encoding: 'utf8' });
  console.log(prodResult);
  
  // Extract the URL from the output
  const urlMatch = prodResult.match(/Website URL: (https:\/\/[^\s]+)/);
  if (urlMatch) {
    const deployUrl = urlMatch[1];
    console.log('\n' + '='.repeat(60));
    console.log('🎉 DEPLOYMENT SUCCESSFUL!');
    console.log('🌐 Your site is live at:', deployUrl);
    console.log('='.repeat(60));
    
    // Save the URL for reference
    fs.writeFileSync('DEPLOYMENT-URL.txt', `HXMP Space Live URL: ${deployUrl}\nDeployed: ${new Date().toISOString()}`);
  }
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  console.log('\nTroubleshooting tips:');
  console.log('1. Make sure you\'re logged in: netlify login');
  console.log('2. Check your site settings in Netlify dashboard');
  console.log('3. Verify your build directory is correct (should be "dist")');
  process.exit(1);
}

console.log('\n✅ Deployment process completed!');