-- Hxmp Space - Complete Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- 1. USERS TABLE (Enhanced with all features)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  
  -- Membership & Role
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'creator', 'admin')),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'vip', 'lifetime')),
  subscription_expires_at TIMESTAMPTZ,
  gumroad_subscription_id TEXT,
  gumroad_customer_id TEXT,
  
  -- Creator Status
  is_creator BOOLEAN DEFAULT false,
  creator_status TEXT DEFAULT 'none' CHECK (creator_status IN ('none', 'pending', 'approved', 'rejected')),
  creator_wallet_balance DECIMAL(10,2) DEFAULT 0,
  creator_payout_email TEXT,
  creator_applied_at TIMESTAMPTZ,
  
  -- Browsing Limits (Free Tier)
  watch_time_used_today INTEGER DEFAULT 0, -- in seconds
  ad_unlocks_used_today INTEGER DEFAULT 0,
  free_unlock_used_this_month BOOLEAN DEFAULT false,
  last_watch_reset TIMESTAMPTZ DEFAULT NOW(),
  last_ad_reset TIMESTAMPTZ DEFAULT NOW(),
  last_unlock_reset TIMESTAMPTZ DEFAULT NOW(),
  
  -- Account Status
  is_active BOOLEAN DEFAULT true,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  banned_at TIMESTAMPTZ,
  banned_by UUID,
  
  -- Profile
  bio TEXT,
  preferences JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- 2. CATEGORIES TABLE
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  cover_image_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CONTENT TABLE (Videos & Photos)
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Basic Info
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT CHECK (content_type IN ('video', 'photo')),
  
  -- Files
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  preview_url TEXT, -- Short preview for free users
  preview_duration INTEGER, -- Preview length in seconds
  
  -- Video Metadata
  duration INTEGER, -- Full video duration in seconds
  file_size BIGINT,
  resolution TEXT,
  format TEXT, -- 'mp4', 'mov', 'jpg', 'png'
  
  -- Organization
  category_id UUID REFERENCES categories(id),
  tags TEXT[],
  
  -- Access Control
  is_premium BOOLEAN DEFAULT false,
  is_free BOOLEAN DEFAULT false,
  is_super_hxmp BOOLEAN DEFAULT false, -- Highest tier content
  price DECIMAL(10,2),
  password TEXT, -- Optional password protection (encrypted)
  
  -- Creator Revenue
  creator_revenue_share DECIMAL(5,2) DEFAULT 70.00, -- Percentage to creator
  
  -- Unlock Settings
  unlock_duration_days INTEGER, -- null = permanent
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'published', 'archived', 'rejected')),
  rejection_reason TEXT,
  published_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. GALLERIES TABLE (Photo/Video Collections)
CREATE TABLE galleries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  
  -- Access Control
  is_premium BOOLEAN DEFAULT false,
  is_super_hxmp BOOLEAN DEFAULT false,
  price DECIMAL(10,2),
  discount_percentage DECIMAL(5,2) DEFAULT 0, -- Discount vs buying individually
  
  -- Stats
  item_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. GALLERY_ITEMS TABLE (Content in Galleries)
CREATE TABLE gallery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gallery_id, content_id)
);

-- 6. WATCH_SESSIONS TABLE (Track Viewing Time)
CREATE TABLE watch_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  
  -- Session Info
  session_start TIMESTAMPTZ DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  duration_seconds INTEGER, -- Actual watch time
  progress_percentage DECIMAL(5,2), -- How much they watched
  
  -- Context
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AD_VIEWS TABLE (Track Ad Watches for Time Unlocks)
CREATE TABLE ad_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Ad Info
  ad_provider TEXT DEFAULT 'google_adsense',
  ad_id TEXT,
  ad_duration INTEGER, -- Ad length in seconds
  
  -- Verification
  watched_completely BOOLEAN DEFAULT false,
  time_unlocked_minutes INTEGER DEFAULT 30,
  verification_token TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. VIDEO_UNLOCKS TABLE (Track Unlocked Videos)
CREATE TABLE video_unlocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  
  -- Unlock Info
  unlock_type TEXT CHECK (unlock_type IN ('free_monthly', 'purchase', 'vip', 'admin_grant', 'password')),
  unlock_method TEXT, -- 'gumroad', 'free_tier', 'admin', 'subscription', 'password'
  
  -- Payment Info (if purchased)
  gumroad_sale_id TEXT,
  amount_paid DECIMAL(10,2),
  
  -- Expiration
  expires_at TIMESTAMPTZ, -- null = permanent
  is_expired BOOLEAN DEFAULT false,
  
  -- Timestamps
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. GALLERY_UNLOCKS TABLE (Track Unlocked Galleries)
CREATE TABLE gallery_unlocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  
  -- Unlock Info
  unlock_type TEXT CHECK (unlock_type IN ('purchase', 'vip', 'admin_grant')),
  gumroad_sale_id TEXT,
  amount_paid DECIMAL(10,2),
  
  -- Expiration
  expires_at TIMESTAMPTZ,
  is_expired BOOLEAN DEFAULT false,
  
  -- Timestamps
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PURCHASES TABLE (All Transactions)
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Purchase Type
  purchase_type TEXT CHECK (purchase_type IN ('content', 'gallery', 'subscription')),
  content_id UUID REFERENCES content(id),
  gallery_id UUID REFERENCES galleries(id),
  
  -- Payment Info
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT DEFAULT 'gumroad',
  
  -- Gumroad Info
  gumroad_sale_id TEXT UNIQUE,
  gumroad_product_id TEXT,
  gumroad_permalink TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 11. SUBSCRIPTIONS TABLE (VIP Memberships)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Subscription Info
  tier TEXT CHECK (tier IN ('vip', 'lifetime')),
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  
  -- Gumroad Info
  gumroad_subscription_id TEXT UNIQUE,
  gumroad_product_id TEXT,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. COMMENTS TABLE (Video Comments)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  -- Comment Content
  comment_text TEXT NOT NULL,
  
  -- Moderation
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  flagged_by UUID REFERENCES users(id),
  
  -- Stats
  like_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. COMMENT_LIKES TABLE
CREATE TABLE comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- 14. CONTENT_LIKES TABLE
CREATE TABLE content_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_id, user_id)
);

-- 15. SAVED_VIDEOS TABLE (Favorites)
CREATE TABLE saved_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  playlist_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- 16. CREATOR_WALLETS TABLE
CREATE TABLE creator_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Balance
  available_balance DECIMAL(10,2) DEFAULT 0,
  pending_balance DECIMAL(10,2) DEFAULT 0,
  lifetime_earnings DECIMAL(10,2) DEFAULT 0,
  
  -- Payout Info
  payout_method TEXT, -- 'paypal', 'bank', 'crypto'
  payout_email TEXT,
  payout_address TEXT,
  minimum_payout DECIMAL(10,2) DEFAULT 50.00,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. WALLET_TRANSACTIONS TABLE
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID REFERENCES creator_wallets(id) ON DELETE CASCADE,
  
  -- Transaction Info
  type TEXT CHECK (type IN ('earning', 'payout', 'refund', 'adjustment')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  
  -- Related Records
  content_id UUID REFERENCES content(id),
  purchase_id UUID REFERENCES purchases(id),
  
  -- Status
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. PAYOUT_REQUESTS TABLE
CREATE TABLE payout_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES creator_wallets(id) ON DELETE CASCADE,
  
  -- Payout Info
  amount DECIMAL(10,2) NOT NULL,
  payout_method TEXT,
  payout_address TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  admin_notes TEXT,
  processed_by UUID REFERENCES users(id),
  
  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. MESSAGES TABLE (User-Admin Messaging)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Message Content
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. CONVERSATIONS TABLE
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES users(id),
  
  -- Conversation Info
  subject TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_preview TEXT,
  
  -- Status
  is_archived BOOLEAN DEFAULT false,
  unread_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. SUPPORT_TICKETS TABLE
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Ticket Info
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('technical', 'billing', 'content', 'account', 'other')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Status
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
  assigned_to UUID REFERENCES users(id),
  
  -- Resolution
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. ADMIN_ACTIONS TABLE (Audit Log)
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Action Info
  action_type TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  
  -- Details
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. NOTIFICATIONS TABLE
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification Info
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  icon TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. ANALYTICS TABLE
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Event Info
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Context
  page_url TEXT,
  referrer TEXT,
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_subscription ON users(subscription_tier);
CREATE INDEX idx_users_creator ON users(is_creator);

-- Content indexes
CREATE INDEX idx_content_creator ON content(creator_id);
CREATE INDEX idx_content_category ON content(category_id);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_type ON content(content_type);
CREATE INDEX idx_content_published ON content(published_at);
CREATE INDEX idx_content_premium ON content(is_premium);
CREATE INDEX idx_content_super ON content(is_super_hxmp);

-- Watch sessions indexes
CREATE INDEX idx_watch_sessions_user ON watch_sessions(user_id);
CREATE INDEX idx_watch_sessions_content ON watch_sessions(content_id);
CREATE INDEX idx_watch_sessions_date ON watch_sessions(created_at);

-- Video unlocks indexes
CREATE INDEX idx_video_unlocks_user ON video_unlocks(user_id);
CREATE INDEX idx_video_unlocks_content ON video_unlocks(content_id);
CREATE INDEX idx_video_unlocks_expired ON video_unlocks(is_expired);

-- Purchases indexes
CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE INDEX idx_purchases_content ON purchases(content_id);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_purchases_gumroad ON purchases(gumroad_sale_id);

-- Comments indexes
CREATE INDEX idx_comments_content ON comments(content_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);

-- Messages indexes
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);

-- Wallet indexes
CREATE INDEX idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_date ON wallet_transactions(created_at);

-- Analytics indexes
CREATE INDEX idx_analytics_event ON analytics(event_type);
CREATE INDEX idx_analytics_user ON analytics(user_id);
CREATE INDEX idx_analytics_date ON analytics(created_at);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_galleries_updated_at BEFORE UPDATE ON galleries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creator_wallets_updated_at BEFORE UPDATE ON creator_wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment content view count
CREATE OR REPLACE FUNCTION increment_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE content SET view_count = view_count + 1 WHERE id = NEW.content_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER increment_content_views AFTER INSERT ON watch_sessions
    FOR EACH ROW EXECUTE FUNCTION increment_view_count();

-- Function to update comment count
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE content SET comment_count = comment_count + 1 WHERE id = NEW.content_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE content SET comment_count = comment_count - 1 WHERE id = OLD.content_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_content_comment_count AFTER INSERT OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- Function to update like count
CREATE OR REPLACE FUNCTION update_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE content SET like_count = like_count + 1 WHERE id = NEW.content_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE content SET like_count = like_count - 1 WHERE id = OLD.content_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_content_like_count AFTER INSERT OR DELETE ON content_likes
    FOR EACH ROW EXECUTE FUNCTION update_like_count();

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default categories
INSERT INTO categories (name, slug, description, icon, order_index) VALUES
('Featured', 'featured', 'Featured content', '⭐', 1),
('New Releases', 'new-releases', 'Latest uploads', '🆕', 2),
('Popular', 'popular', 'Most viewed content', '🔥', 3),
('Exclusive', 'exclusive', 'Exclusive premium content', '💎', 4),
('Collections', 'collections', 'Curated collections', '📚', 5);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Database schema created successfully!';
    RAISE NOTICE '📊 Total tables: 24';
    RAISE NOTICE '🔐 Ready for RLS policies';
    RAISE NOTICE '🚀 Next step: Set up Row Level Security';
END $$;
