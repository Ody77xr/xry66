-- Hump Heaven Complete Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with admin support
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  member_tier TEXT DEFAULT 'free' CHECK (member_tier IN ('free', 'vip')),
  member_id TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  total_uploads INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  browsing_limit_minutes INTEGER DEFAULT 60,
  browsing_limit_reset_at TIMESTAMP,
  messaging_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create admin user
INSERT INTO users (email, username, password_hash, role, member_tier, display_name, messaging_enabled)
VALUES (
  'oodasenior@gmail.com',
  'SirHumpAlot94',
  crypt('globalMikrlo123$', gen_salt('bf')),
  'admin',
  'vip',
  'SirHumpAlot94',
  true
);

-- Videos table (replaces JS-based videos)
CREATE TABLE videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  embed_code TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  thumbnail_url TEXT,
  duration TEXT NOT NULL,
  tags TEXT[],
  is_premium BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  unlock_count INTEGER DEFAULT 0,
  earnings DECIMAL(10,2) DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Saved videos (user's stash)
CREATE TABLE saved_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  video_id TEXT REFERENCES videos(id) ON DELETE CASCADE,
  saved_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Unlocked videos tracking
CREATE TABLE unlocked_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  video_id TEXT REFERENCES videos(id) ON DELETE CASCADE,
  unlock_type TEXT CHECK (unlock_type IN ('master', 'unlock', 'trial', 'monthly', 'admin')),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  password_used TEXT,
  UNIQUE(user_id, video_id, unlock_type)
);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  video_id TEXT REFERENCES videos(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Comment replies
CREATE TABLE comment_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reply_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User uploads (for VIP content creators)
CREATE TABLE user_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('video', 'photo')),
  category TEXT,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  earnings DECIMAL(10,2) DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES users(id)
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('subscription', 'unlock', 'earning', 'payout', 'refund')),
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Video analytics (for Mistral AI processing)
CREATE TABLE video_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id TEXT REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT CHECK (event_type IN ('view', 'like', 'dislike', 'save', 'unlock', 'comment', 'share')),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Admin audit log
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  target_type TEXT, -- 'user', 'video', 'upload', etc.
  target_id TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Password vault (encrypted storage)
CREATE TABLE password_vault (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  video_id TEXT,
  video_title TEXT,
  password_encrypted TEXT, -- Encrypted password
  unlock_type TEXT,
  saved_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocked_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_vault ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: Can view own data, admins can view all
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all users" ON users FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Videos: Public read, admin write
CREATE POLICY "Anyone can view published videos" ON videos FOR SELECT USING (is_published = true OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage videos" ON videos FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Saved videos: Users own data
CREATE POLICY "Users manage own saved videos" ON saved_videos FOR ALL USING (user_id = auth.uid());

-- Unlocked videos: Users own data
CREATE POLICY "Users manage own unlocks" ON unlocked_videos FOR ALL USING (user_id = auth.uid());

-- Comments: Public read, own write
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can manage own comments" ON comments FOR ALL USING (user_id = auth.uid());

-- Comment replies: Public read, own write
CREATE POLICY "Anyone can view replies" ON comment_replies FOR SELECT USING (true);
CREATE POLICY "Users can manage own replies" ON comment_replies FOR ALL USING (user_id = auth.uid());

-- User uploads: Own data + admin
CREATE POLICY "Users can view own uploads" ON user_uploads FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can manage own uploads" ON user_uploads FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins can review uploads" ON user_uploads FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Transactions: Own data only
CREATE POLICY "Users view own transactions" ON transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System creates transactions" ON transactions FOR INSERT USING (true);

-- Messages: Sender or recipient
CREATE POLICY "Users view own messages" ON messages FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "Users send messages" ON messages FOR INSERT USING (sender_id = auth.uid());

-- Analytics: Insert only, admin read
CREATE POLICY "Users can create analytics" ON video_analytics FOR INSERT USING (user_id = auth.uid());
CREATE POLICY "Admins can view analytics" ON video_analytics FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Admin audit: Admin only
CREATE POLICY "Admins can view audit log" ON admin_audit_log FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Password vault: Own data only
CREATE POLICY "Users manage own vault" ON password_vault FOR ALL USING (user_id = auth.uid());

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment video views
CREATE OR REPLACE FUNCTION increment_video_views(video_id_param TEXT)
RETURNS void AS $$
BEGIN
  UPDATE videos SET views = views + 1 WHERE id = video_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment video saves
CREATE OR REPLACE FUNCTION increment_video_saves(video_id_param TEXT)
RETURNS void AS $$
BEGIN
  UPDATE videos SET saves = saves + 1 WHERE id = video_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track unlock
CREATE OR REPLACE FUNCTION track_unlock(video_id_param TEXT)
RETURNS void AS $$
BEGIN
  UPDATE videos SET unlock_count = unlock_count + 1 WHERE id = video_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes for performance
CREATE INDEX idx_videos_category ON videos(category);
CREATE INDEX idx_videos_published ON videos(is_published);
CREATE INDEX idx_saved_videos_user ON saved_videos(user_id);
CREATE INDEX idx_unlocked_videos_user ON unlocked_videos(user_id);
CREATE INDEX idx_comments_video ON comments(video_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_analytics_video ON video_analytics(video_id);
CREATE INDEX idx_analytics_user ON video_analytics(user_id);
CREATE INDEX idx_user_uploads_status ON user_uploads(status);

-- Create storage buckets (run separately in Supabase Storage UI or via API)
-- 1. content-videos (public)
-- 2. content-photos (public)
-- 3. user-avatars (public)
-- 4. thumbnails (public)
-- 5. admin-review (private - admin only)
