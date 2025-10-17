# 🚀 Deploy HXMP Space to GitHub Pages

## 📋 **Deployment Configuration**

### ✅ **Repository**: `Ody77xr/xry66`
### ✅ **GitHub Pages URL**: `https://ody77xr.github.io/xry66/`
### ✅ **Base Path**: `/xry66/` (configured in vite.config.js)

## 🛠️ **Deployment Methods**

### **Method 1: Automatic GitHub Actions (Recommended)**

The deployment will happen automatically when you push to the main branch.

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Deploy HXMP Space to GitHub Pages"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository: https://github.com/Ody77xr/xry66
   - Click "Settings" tab
   - Scroll to "Pages" section
   - Under "Source", select "GitHub Actions"
   - The workflow will automatically deploy your site

3. **Your site will be live at:**
   **https://ody77xr.github.io/xry66/**

### **Method 2: Manual Deployment**

```bash
# Install dependencies
npm install

# Build and deploy
npm run deploy:gh
```

## 🔧 **What's Configured**

### **GitHub Actions Workflow** (`.github/workflows/deploy.yml`)
- ✅ Triggers on push to main branch
- ✅ Builds with Node.js 18
- ✅ Deploys to GitHub Pages automatically
- ✅ Uses official GitHub Actions

### **Vite Configuration** (`vite.config.js`)
- ✅ Base path set to `/xry66/`
- ✅ All HTML pages included in build
- ✅ JavaScript and CSS files copied
- ✅ Assets properly handled

### **Build Process**
1. Vite builds all HTML pages
2. Copies JavaScript files (floating-nav.js, auth-utils.js, etc.)
3. Copies CSS files (styles.css, floating-nav.css)
4. Copies assets directory
5. Deploys to GitHub Pages

## 📁 **File Structure After Build**

```
dist/                           # GitHub Pages serves from here
├── index.html                  # Landing page
├── xrhome.html                 # Homepage
├── xrabout.html               # About page
├── xrvideoplayer.html         # Video player
├── xrmembership.html          # HXMPA Portal
├── xradmin-dashboard.html     # Admin dashboard
├── floating-nav.js            # Navigation system
├── auth-utils.js              # Authentication
├── supabase-config.js         # Database config
├── styles.css                 # Main styles
├── floating-nav.css           # Navigation styles
└── assets/                    # Images and media
    ├── xr1.png
    ├── xr2.png
    └── ...
```

## 🌐 **Live URLs**

After deployment, your pages will be available at:

- **Homepage**: https://ody77xr.github.io/xry66/xrhome.html
- **About**: https://ody77xr.github.io/xry66/xrabout.html
- **Video Player**: https://ody77xr.github.io/xry66/xrvideoplayer.html
- **HXMPA Portal**: https://ody77xr.github.io/xry66/xrmembership.html
- **Admin Dashboard**: https://ody77xr.github.io/xry66/xradmin-dashboard.html

## 🔐 **Environment Variables**

Since GitHub Pages is static hosting, environment variables are handled differently:

### **For Development:**
- Keep using `.env` file locally
- Supabase config is in `supabase-config.js`

### **For Production:**
- Supabase credentials are in `supabase-config.js`
- No server-side environment variables needed
- All config is client-side

## 🚨 **Important Notes**

### **GitHub Pages Limitations:**
- ❌ No server-side functions (Netlify functions won't work)
- ❌ No server-side environment variables
- ✅ Static files only
- ✅ Client-side JavaScript works fine
- ✅ Supabase client-side integration works

### **For Full Functionality:**
- GitHub Pages: Good for testing and demo
- Custom domain: Better for production with webhooks
- Netlify/Vercel: Best for full functionality with functions

## 🔄 **Deployment Steps**

### **Step 1: Push to GitHub**
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### **Step 2: Enable GitHub Pages**
1. Go to https://github.com/Ody77xr/xry66/settings/pages
2. Under "Source", select "GitHub Actions"
3. The workflow will run automatically

### **Step 3: Wait for Deployment**
- Check the "Actions" tab to see deployment progress
- Usually takes 2-3 minutes
- Green checkmark means successful deployment

### **Step 4: Visit Your Site**
**https://ody77xr.github.io/xry66/**

## 🎯 **Testing Checklist**

After deployment, verify:
- [ ] Homepage loads correctly
- [ ] Navigation works (floating nav at bottom)
- [ ] Video player opens
- [ ] About page displays properly
- [ ] Admin login page accessible
- [ ] All images and assets load
- [ ] Mobile responsive design works
- [ ] Supabase connection works (login/signup)

## 🔧 **Troubleshooting**

### **Build Fails:**
- Check GitHub Actions logs in the "Actions" tab
- Verify all dependencies are in package.json
- Make sure all referenced files exist

### **Site Doesn't Load:**
- Check if GitHub Pages is enabled in repository settings
- Verify the base path is `/xry66/` in vite.config.js
- Check browser console for errors

### **Assets Don't Load:**
- Verify assets are in the `assets/` directory
- Check that vite.config.js copies all necessary files
- Ensure paths are relative, not absolute

## 📈 **Next Steps**

After GitHub Pages deployment:

1. **Test all functionality**
2. **Set up custom domain** (your main domain)
3. **Implement Gumroad webhooks** (requires server-side handling)
4. **Move to Netlify/Vercel** for full functionality

## 🚀 **Deploy Now**

```bash
# Quick deploy command
git add . && git commit -m "Deploy HXMP Space" && git push origin main
```

**Your site will be live at: https://ody77xr.github.io/xry66/ in 2-3 minutes!** 🎉

---

**Ready to deploy? Run the command above and your site will be live!**