const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying build for Netlify deployment...\n');

// Check if dist directory exists
if (!fs.existsSync('dist')) {
  console.error('❌ dist directory not found! Run npm run build first.');
  process.exit(1);
}

// Required files for the app to work
const requiredFiles = [
  'index.html',
  'xrhome.html',
  'xrabout.html',
  'xrgallery-entrance.html',
  'xrvideoplayer.html',
  'xrmembership.html',
  'xradmin-dashboard.html',
  'floating-nav.js',
  'floating-nav.css',
  'supabase-config.js',
  'auth-utils.js',
  '_redirects',
  'netlify.toml'
];

let allGood = true;

console.log('📋 Checking required files:');
requiredFiles.forEach(file => {
  const filePath = path.join('dist', file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} (${Math.round(stats.size / 1024)}KB)`);
  } else {
    console.log(`❌ ${file} - MISSING!`);
    allGood = false;
  }
});

// Check for common issues
console.log('\n🔍 Checking for common issues:');

// Check if HTML files have correct script references
const htmlFiles = fs.readdirSync('dist').filter(f => f.endsWith('.html'));
htmlFiles.forEach(htmlFile => {
  const content = fs.readFileSync(path.join('dist', htmlFile), 'utf8');
  
  // Check for absolute paths that might break
  if (content.includes('src="/') && !content.includes('src="https://')) {
    console.log(`⚠️  ${htmlFile} may have absolute paths that could break on Netlify`);
  }
  
  // Check for missing script files
  const scriptMatches = content.match(/src="([^"]+\.js)"/g);
  if (scriptMatches) {
    scriptMatches.forEach(match => {
      const scriptPath = match.match(/src="([^"]+)"/)[1];
      if (!scriptPath.startsWith('http') && !scriptPath.startsWith('//')) {
        const fullPath = path.join('dist', scriptPath);
        if (!fs.existsSync(fullPath)) {
          console.log(`❌ ${htmlFile} references missing script: ${scriptPath}`);
          allGood = false;
        }
      }
    });
  }
});

// Check Netlify functions
const functionsDir = 'netlify/functions';
if (fs.existsSync(functionsDir)) {
  const functions = fs.readdirSync(functionsDir);
  console.log(`✅ Found ${functions.length} Netlify functions:`, functions.join(', '));
} else {
  console.log('ℹ️  No Netlify functions found');
}

// Check environment variables
console.log('\n🔐 Environment variables check:');
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  const envVars = envContent.split('\n').filter(line => line.includes('='));
  console.log(`✅ Found ${envVars.length} environment variables in .env`);
  
  // Check for Supabase config
  if (envContent.includes('SUPABASE_URL')) {
    console.log('✅ Supabase configuration found');
  } else {
    console.log('⚠️  Supabase configuration not found in .env');
  }
} else {
  console.log('⚠️  No .env file found');
}

// Final verdict
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('🎉 Build verification PASSED! Ready for Netlify deployment.');
  console.log('\nNext steps:');
  console.log('1. Run: netlify deploy --prod');
  console.log('2. Or push to GitHub and let Netlify auto-deploy');
} else {
  console.log('❌ Build verification FAILED! Fix the issues above before deploying.');
  process.exit(1);
}

console.log('='.repeat(50));