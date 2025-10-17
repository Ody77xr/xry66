# Deployment Guide - Hump Heaven to Netlify

## 📋 Prerequisites Completed

✅ Supabase URL configured: `https://ioqysiylfymkqhzyfphq.supabase.co`
✅ Supabase Anon Key configured
✅ Netlify token ready
✅ Environment variables created

## 🚀 Deploy to Netlify

### **Option 1: Netlify CLI (Recommended)**

```bash
# 1. Install Netlify CLI globally (if not installed)
npm install -g netlify-cli

# 2. Login to Netlify using your token
netlify login

# 3. Initialize Netlify in your project
cd c:/Users/arizo/Desktop/xr7
netlify init

# 4. Deploy to Netlify
netlify deploy --prod

# Follow the prompts:
# - Choose "Create & configure a new site"
# - Team: Select your team
# - Site name: hump-heaven (or your preferred name)
# - Publish directory: . (current directory)
```

### **Option 2: Netlify Web UI**

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose "Deploy manually"
4. Drag and drop your entire `xr7` folder
5. Site will be deployed instantly!

### **Option 3: Git-Based Deployment**

```bash
# 1. Initialize git repository (if not done)
cd c:/Users/arizo/Desktop/xr7
git init
git add .
git commit -m "Initial deployment - Hump Heaven v1.0"

# 2. Push to GitHub/GitLab
# (Create repository first on GitHub)
git remote add origin YOUR_REPO_URL
git push -u origin main

# 3. In Netlify dashboard:
# - Click "Add new site" → "Import from Git"
# - Connect your repository
# - Build settings: Leave blank (static site)
# - Publish directory: . (root)
# - Click "Deploy"
```

## ⚙️ Netlify Environment Variables

After deployment, add these in Netlify Dashboard → Site Settings → Environment Variables:

```
SUPABASE_URL = https://ioqysiylfymkqhzyfphq.supabase.co
SUPABASE_ANON_KEY = K6uDYFWzQVyt2WpOe4yBW3jZIGTnLRXZj4e98PCkIyYcQFLJzBYMFv1IVNwwzXzeVidExY1kA5dC5YMH0CWUYg==
```

## 🗄️ Supabase Database Setup

### **1. Create Tables**

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  member_tier TEXT DEFAULT 'free', -- 'free' or 'vip'
  member_id TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  avatar_url TEXT,
  total_uploads INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0
);

-- Saved videos table
CREATE TABLE saved_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  video_title TEXT,
  saved_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Unlocked videos table
CREATE TABLE unlocked_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  unlock_type TEXT, -- 'master', 'unlock', 'trial', 'monthly'
  unlocked_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  UNIQUE(user_id, video_id)
);

-- User content uploads table
CREATE TABLE user_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT, -- 'video' or 'photo'
  category TEXT,
  file_url TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  earnings DECIMAL(10,2) DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'subscription', 'unlock', 'earning'
  description TEXT,
  amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Password vault table (encrypted)
CREATE TABLE password_vault (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  video_title TEXT,
  password_hash TEXT, -- Store encrypted, not plain text
  unlock_type TEXT,
  saved_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocked_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_vault ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their own data)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own saved videos" ON saved_videos FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can view own unlocks" ON unlocked_videos FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can view own uploads" ON user_uploads FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can view own comments" ON comments FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can view own transactions" ON transactions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can view own vault" ON password_vault FOR ALL USING (user_id = auth.uid());

-- Public read for approved uploads
CREATE POLICY "Anyone can view approved uploads" ON user_uploads FOR SELECT USING (status = 'approved');
```

### **2. Create Storage Buckets**

In Supabase Dashboard → Storage:

1. **content-videos** - For video uploads
2. **content-photos** - For photo uploads
3. **user-avatars** - For profile pictures
4. **thumbnails** - For video thumbnails

Configure bucket policies to allow authenticated uploads.

## 🔧 Post-Deployment Configuration

### **1. Update Netlify Settings**

In your Netlify site settings:

**Build Settings:**
- Build command: (leave empty - static site)
- Publish directory: `.`
- Functions directory: `netlify/functions`

**Deploy Settings:**
- Production branch: `main`
- Auto-deploy: Enabled

### **2. Custom Domain (Optional)**

```bash
# In Netlify dashboard:
1. Go to Domain settings
2. Add custom domain
3. Follow DNS configuration instructions
```

### **3. HTTPS/SSL**

- Automatically enabled by Netlify
- Force HTTPS redirect already configured in netlify.toml

## 📱 Testing Deployment

After deployment:

```bash
# Get your Netlify URL
netlify status

# Open in browser
netlify open
```

Your site will be at: `https://[your-site-name].netlify.app`

## ✅ Deployment Checklist

- [ ] Supabase configured with URL and keys
- [ ] Database tables created
- [ ] Storage buckets created
- [ ] RLS policies enabled
- [ ] Netlify site deployed
- [ ] Environment variables set
- [ ] Custom domain configured (optional)
- [ ] Test all pages work
- [ ] Test video player
- [ ] Test authentication
- [ ] Test save functionality
- [ ] Test HXMP Stash
- [ ] Mobile responsiveness verified

## 🚨 Important Notes

**Security:**
- Never commit `.env` file to git (add to `.gitignore`)
- Keep service role key secret
- Use anon key for client-side
- Enable RLS on all tables

**Caching:**
- Current cache: 5 minutes (development)
- For production: Increase to 1 hour or more
- Update in netlify.toml

**Performance:**
- All pages are static HTML
- JavaScript loads dynamically
- localStorage for offline capability
- Fast CDN delivery via Netlify

## 📊 MCP Installation (For Local Development)

**Note:** MCP servers are configured in Amp settings, not via code.

To use Supabase and Netlify MCPs:

1. Open Amp settings
2. Go to MCP Servers
3. Add Supabase MCP configuration
4. Add Netlify MCP configuration
5. Restart Amp

This will allow you to manage Supabase and Netlify directly from Amp in future sessions.

---

**Your app is ready to deploy!** 🚀
