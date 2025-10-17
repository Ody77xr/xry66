# Quick Fix Commands

## 🚀 If Mobile Still Shows Two Icons or Old Menu

### **On Your Computer (Development Server):**

```bash
# 1. Stop the server (Ctrl + C)

# 2. Clear npm cache
npm cache clean --force

# 3. Restart the development server
npm run dev

# 4. Note the new network address shown (e.g., http://192.168.1.100:3000)
```

### **On Your Mobile Device:**

#### **Option A: Clear Cache (iPhone)**
1. Settings → Safari
2. "Clear History and Website Data"
3. Confirm

#### **Option B: Clear Cache (Android)**
1. Chrome → ⋮ (three dots)
2. Settings → Privacy and Security
3. Clear browsing data → Cached files
4. Clear

#### **Option C: Quick Test (Any Phone)**
1. Open **Private/Incognito tab**
2. Visit: `http://YOUR_IP:3000/xrhome.html`
3. This bypasses ALL cache

#### **Option D: Force New Version (No Cache Clear Needed)**
Add timestamp to URL:
```
http://192.168.1.100:3000/xrhome.html?nocache=12345

(Change 12345 to any random number each time)
```

## 🔧 Nuclear Option (If Nothing Else Works)

On your computer:
```bash
# Stop server
# Then run:

rm -rf node_modules package-lock.json
npm install
npm run dev
```

On mobile:
- Delete browser app completely
- Reinstall from App Store
- Access site in private mode first

## ✅ What You Should See After Fix

- ✅ **ONE icon only** (bottom center)
- ✅ **6 menu items** with emojis
- ✅ No "Settings" or "Docs"
- ✅ Menu fits screen properly

## 📱 Test URLs (Replace YOUR_IP with your computer's IP)

```
Main page (with cache bust):
http://YOUR_IP:3000/xrhome.html?v=2024010701

Gallery entrance:
http://YOUR_IP:3000/xrgallery-entrance.html?v=2024010701

About page:
http://YOUR_IP:3000/xrabout.html?v=2024010701
```

## 💡 Pro Tips

1. **Always test in private/incognito first** - Confirms the fix works
2. **Check IP address matches** - Computer and phone on same WiFi
3. **Firewall might block** - Temporarily disable to test
4. **Try different port** - If 3000 doesn't work, try 8080 or 5173

## 🆘 Emergency Verification

Open browser console on mobile (via desktop remote debugging):

**Should see:**
```
Welcome to Hxmp Space! 🚀
Built with modern web technologies
```

**Should NOT see:**
- Multiple "Welcome" messages (indicates duplicate loading)
- JavaScript errors about navigation
- 404 errors for scripts

## 📞 Quick Checklist

Before you start:
- [ ] Computer and phone on same WiFi network
- [ ] Server running on computer (`npm run dev`)
- [ ] Note the network IP address from terminal
- [ ] Mobile browser cache cleared OR using private mode
- [ ] Using the correct IP:port combination

After loading:
- [ ] See only ONE nav icon
- [ ] Icon opens to show 6 items
- [ ] No Settings/Docs in menu
- [ ] Touch interactions work
