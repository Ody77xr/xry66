# Mobile Cache Fix Guide

## ✅ Changes Made to Fix Caching Issues

### 1. **Netlify Caching Configuration Updated**
   - **Old**: JS/CSS cached for 1 year (`max-age=31536000`)
   - **New**: JS/CSS cached for 5 minutes (`max-age=300`)
   - **File**: `netlify.toml`

### 2. **Cache-Busting Version Parameters Added**
   - All script tags now include `?v=2024010701`
   - Forces browsers to fetch new versions
   - **Example**: `<script src="floating-nav.js?v=2024010701"></script>`

### 3. **Duplicate Navigation Prevention**
   - Added cleanup code to `floating-nav.js`
   - Removes any existing navigation before creating new one
   - Prevents multiple icons from appearing

## 📱 Clear Mobile Cache - Step by Step

### **For iPhone/Safari:**
1. Go to **Settings** → **Safari**
2. Scroll down and tap **"Clear History and Website Data"**
3. Tap **"Clear History and Data"** to confirm
4. Alternatively, in Safari: Long-press the refresh button → **"Request Desktop Website"**

### **For Android/Chrome:**
1. Open **Chrome** app
2. Tap the **three dots** (⋮) in top right
3. Go to **Settings** → **Privacy and Security**
4. Tap **"Clear browsing data"**
5. Select **"Cached images and files"**
6. Tap **"Clear data"**

### **Quick Method (Any Mobile Browser):**
1. Open the page in **Incognito/Private Mode**
2. Chrome: Three dots → **"New Incognito Tab"**
3. Safari: Tabs icon → **"Private"**

## 🔧 Development Server Cache Fix

### **If using localhost:3000:**

1. **Stop the dev server** (Ctrl+C)

2. **Clear node_modules cache:**
   ```bash
   npm cache clean --force
   ```

3. **Restart the server:**
   ```bash
   npm run dev
   ```

4. **On mobile, access with cache-busting:**
   ```
   http://192.168.x.x:3000/xrhome.html?nocache=1
   ```

### **Hard Refresh on Mobile:**
- **iPhone Safari**: Tap address bar, then tap refresh while holding
- **Android Chrome**: Long press the reload button
- **Or**: Add `?t=` + current time to URL
  ```
  http://192.168.x.x:3000/xrhome.html?t=123456
  ```

## 🚀 Verification Steps

After clearing cache, you should see:
- ✅ **ONE navigation icon** (not two)
- ✅ **6 menu items** when opened (not 7 or 8)
- ✅ Menu items with **emoji icons** 🏠 🖼️ 💎 🌟 💬 ℹ️
- ✅ NO "Settings" or "Docs" options
- ✅ Navigation properly sized for your screen

## 🔍 Debugging - Still Seeing Duplicates?

### **Check in Browser Console:**
1. Enable console on mobile (use desktop Safari/Chrome remote debugging)
2. Look for errors or duplicate script loading
3. Check for messages like "Welcome to Hxmp Space!"

### **Network Inspection:**
1. Open DevTools → Network tab
2. Filter by "JS"
3. Check if `floating-nav.js?v=2024010701` is loading
4. Verify status is **200** (not 304 from cache)

### **Nuclear Option - Full Reset:**
```bash
# On your development machine:
1. Stop the server
2. Delete node_modules
3. npm install
4. Restart server
5. On mobile: Clear ALL browser data
6. Access site in private/incognito mode
```

## 📋 Expected Behavior

### **Desktop:**
- Single navigation icon at bottom center
- Opens to show 6-item menu
- Smooth animations

### **Mobile (all sizes):**
- Single navigation icon (scaled appropriately)
- Menu fits within screen width
- 2x3 grid layout (2 columns, 3 rows)
- No horizontal scrolling

## 🆘 Still Not Working?

If you still see issues after trying everything:

1. **Check browser version** - Update to latest
2. **Try different browser** - Test on Chrome vs Safari
3. **Check network** - Ensure you're on same network as dev server
4. **Verify IP address** - Make sure using correct local IP
5. **Check firewall** - Ensure port 3000 is accessible

## 📝 Quick Reference

**Current Version**: v2024010701  
**Navigation Items**: 6 (HOME, HXMP GALLERY, HXMP STASH, HXMPA' PORTAL, MESSAGING, ABOUT)  
**Cache Duration**: 5 minutes (300 seconds)  
**Files Modified**:
- ✅ app.js
- ✅ floating-nav.js  
- ✅ floating-nav.css
- ✅ netlify.toml
- ✅ All 11 HTML pages
