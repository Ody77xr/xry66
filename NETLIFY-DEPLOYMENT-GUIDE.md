# 🚀 Netlify Deployment Guide for HXMP Space

## 📋 Pre-Deployment Checklist

### ✅ **Files Optimized for Netlify:**
- `vite.config.js` - Updated base path from `/xry66/` to `/`
- `netlify.toml` - Configured for proper build and caching
- `package.json` - Added build and verification scripts
- `_redirects` - Created for SPA routing
- Build scripts created for asset copying

### ✅ **Build Configuration:**
- **Publish Directory**: `dist`
- **Build Command**: `npm run build`
- **Node Version**: 18
- **Functions Directory**: `netlify/functions`

## 🛠️ Deployment Methods

### **Method 1: Automated Script (Recommended)**

```bash
# Run the automated deployment script
node deploy-to-netlify.js
```

This script will:
1. Build the project
2. Verify the build
3. Check Netlify CLI
4. Deploy to preview first
5. Deploy to production
6. Provide the live URL

### **Method 2: Manual Deployment**

```bash
# 1. Install Netlify CLI (if not installed)
npm install -g netlify-cli

# 2. Login to Netlify
netlify login

# 3. Build the project
npm run build

# 4. Verify build
npm run verify

# 5. Deploy to preview
netlify deploy --dir=dist

# 6. Deploy to production
netlify deploy --prod --dir=dist
```

### **Method 3: GitHub Integration**

1. Push code to GitHub repository
2. Connect repository to Netlify
3. Set build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 18

## 🔧 Build Process Details

### **What happens during build:**

1. **Vite Build**: Processes HTML, CSS, JS files
2. **Asset Copying**: Copies all necessary files to `dist/`
3. **Verification**: Checks all required files exist
4. **Function Preparation**: Netlify functions are automatically detected

### **Files copied to dist/:**
- All HTML pages
- JavaScript files (floating-nav.js, auth-utils.js, etc.)
- CSS files (styles.css, floating-nav.css)
- Assets directory
- Configuration files (_redirects, netlify.toml)

## 🌐 Site Configuration

### **Target URL**: `https://xrhxmp.netlify.app`

To get this specific URL:
1. In Netlify dashboard, go to Site Settings
2. Change site name to `xrhxmp`
3. Your site will be available at `https://xrhxmp.netlify.app`

### **Environment Variables**

Set these in Netlify dashboard (Site Settings → Environment Variables):

```
SUPABASE_URL=https://iqyauoezuuuohwhmxnkh.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
NETLIFY_ACCESS_TOKEN=your-netlify-token
```

## 🔍 Troubleshooting

### **Common Issues:**

#### **Build Fails**
```bash
# Check build locally first
npm run build
npm run verify

# Check for missing dependencies
npm install
```

#### **Functions Not Working**
- Ensure functions are in `netlify/functions/` directory
- Check function syntax (should export handler)
- Verify environment variables are set

#### **Assets Not Loading**
- Check `_redirects` file is in dist/
- Verify asset paths are relative, not absolute
- Check browser console for 404 errors

#### **Site Name Already Taken**
If `xrhxmp` is taken, try:
- `xrhxmp-space`
- `hxmp-space`
- `sirhxmp`

### **Verification Commands:**

```bash
# Test build locally
npm run build && npm run verify

# Test with local server
npx serve dist

# Check Netlify status
netlify status

# View deployment logs
netlify logs
```

## 📊 Post-Deployment Checklist

After successful deployment, verify:

- [ ] Homepage loads correctly
- [ ] Navigation works on all pages
- [ ] Video player functions
- [ ] Admin dashboard accessible
- [ ] Supabase connection works
- [ ] All assets load (images, CSS, JS)
- [ ] Mobile responsiveness
- [ ] HTTPS certificate active

## 🔐 Security Notes

### **Environment Variables:**
- Never commit `.env` to repository
- Set all secrets in Netlify dashboard
- Use different keys for production vs development

### **Admin Access:**
- Admin dashboard should only be accessible to authenticated admins
- Verify RLS policies are working in Supabase
- Test admin functions work correctly

## 📈 Performance Optimization

### **Already Configured:**
- ✅ Gzip compression enabled
- ✅ Asset caching (5 minutes for development)
- ✅ CDN distribution
- ✅ HTTPS by default

### **Additional Optimizations:**
- Consider image optimization for assets
- Implement lazy loading for videos
- Add service worker for offline functionality

## 🚀 Deployment Commands Summary

```bash
# Quick deployment
node deploy-to-netlify.js

# Manual step-by-step
npm run build
npm run verify
netlify deploy --prod --dir=dist

# Check deployment
netlify open
```

## 📞 Support

If deployment fails:
1. Check the build logs in Netlify dashboard
2. Verify all environment variables are set
3. Test build locally first
4. Check Netlify status page for outages

---

**Ready to deploy! Run `node deploy-to-netlify.js` to get started! 🚀**