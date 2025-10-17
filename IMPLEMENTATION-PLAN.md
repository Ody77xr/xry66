# Hxmp Space - Complete Implementation Plan

## 🎯 **Project Overview**
Premium adult content platform with tiered memberships, time-based browsing limits, ad-supported free tier, and creator monetization.

---

## 📊 **Membership Tiers**

### **Free Tier**
- ✅ 1 hour free browsing time per day
- ✅ Watch ads for +30min (max 3x per day)
- ✅ 1 free video unlock per month (up to 30min video)
- ❌ No premium content access
- ❌ No messaging
- ❌ No content upload
- ❌ No gallery unlocks

### **Hxmpa' VIP ($12.99/month)**
- ✅ Unlimited browsing time
- ✅ Access to entire gallery (except Super Hxmp)
- ✅ Messaging with admin/support
- ✅ Upload content as creator
- ✅ Creator wallet & earnings
- ✅ No ads
- ❌ Super Hxmp content (separate purchase)

### **Super Hxmp (Individual Purchase)**
- Premium exclusive content
- Purchased separately via Gumroad
- Permanent access after purchase

---

## 🗄️ **Complete Database Schema**

### **Phase 1: Core Tables**

#### 1. **users** (Enhanced)
```sql
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
  
  -- Creator Status
  is_creator BOOLEAN DEFAULT false,
  creator_wallet_balance DECIMAL(10,2) DEFAULT 0,
  creator_payout_email TEXT,
  
  -- Browsing Limits
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
  banned_by UUID REFERENCES users(id),
  
  -- Profile
  bio TEXT,
  preferences JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);
```

#### 2. **content** (Enhanced)
```sql
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Basic Info
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT CHECK (content_type IN ('video', 'photo', 'gallery')),
  
  -- Files
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  preview_url TEXT, -- Short preview for free users
  preview_duration INTEGER, -- Preview length in seconds
  
  -- Video Metadata
  duration INTEGER, -- Full video duration in seconds
  file_size BIGINT,
  resolution TEXT,
  
  -- Organization
  category_id UUID REFERENCES categories(id),
  tags TEXT[],
  
  -- Access Control
  is_premium BOOLEAN DEFAULT false,
  is_free BOOLEAN DEFAULT false,
  is_super_hxmp BOOLEAN DEFAULT false, -- Highest tier content
  price DECIMAL(10,2),
  password TEXT, -- Optional password protection
  
  -- Creator Revenue
  creator_revenue_share DECIMAL(5,2) DEFAULT 70.00, -- Percentage
  
  -- Unlock Settings
  unlock_duration_days INTEGER, -- How long unlock lasts (null = permanent)
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. **watch_sessions** (NEW - Track Viewing Time)
```sql
CREATE TABLE watch_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  
  -- Session Info
  session_start TIMESTAMPTZ DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  duration_seconds INTEGER, -- Actual watch time
  
  -- Context
  ip_address TEXT,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_watch_sessions_user ON watch_sessions(user_id);
CREATE INDEX idx_watch_sessions_content ON watch_sessions(content_id);
CREATE INDEX idx_watch_sessions_date ON watch_sessions(session_start);
```

#### 4. **ad_views** (NEW - Track Ad Watches)
```sql
CREATE TABLE ad_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Ad Info
  ad_provider TEXT, -- 'google_adsense', 'custom', etc.
  ad_id TEXT,
  ad_duration INTEGER, -- Ad length in seconds
  
  -- Verification
  watched_completely BOOLEAN DEFAULT false,
  time_unlocked_minutes INTEGER DEFAULT 30,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ad_views_user ON ad_views(user_id);
CREATE INDEX idx_ad_views_date ON ad_views(created_at);
```

#### 5. **video_unlocks** (NEW - Track Unlocked Videos)
```sql
CREATE TABLE video_unlocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  
  -- Unlock Info
  unlock_type TEXT CHECK (unlock_type IN ('free_monthly', 'purchase', 'vip', 'admin_grant')),
  unlock_method TEXT, -- 'gumroad', 'free_tier', 'admin', 'subscription'
  
  -- Payment Info (if purchased)
  purchase_id UUID REFERENCES purchases(id),
  amount_paid DECIMAL(10,2),
  
  -- Expiration
  expires_at TIMESTAMPTZ, -- null = permanent
  is_expired BOOLEAN DEFAULT false,
  
  -- Timestamps
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_video_unlocks_user ON video_unlocks(user_id);
CREATE INDEX idx_video_unlocks_content ON video_unlocks(content_id);
CREATE UNIQUE INDEX idx_video_unlocks_unique ON video_unlocks(user_id, content_id) WHERE is_expired = false;
```

#### 6. **comments** (NEW - Video Comments)
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For replies
  
  -- Comment Content
  comment_text TEXT NOT NULL,
  
  -- Moderation
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  
  -- Stats
  like_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_content ON comments(content_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
```

#### 7. **saved_videos** (Favorites/Saved)
```sql
CREATE TABLE saved_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  
  -- Organization
  playlist_name TEXT,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_saved_videos_user ON saved_videos(user_id);
CREATE UNIQUE INDEX idx_saved_videos_unique ON saved_videos(user_id, content_id);
```

#### 8. **creator_wallets** (NEW - Creator Earnings)
```sql
CREATE TABLE creator_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
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

CREATE UNIQUE INDEX idx_creator_wallets_creator ON creator_wallets(creator_id);
```

#### 9. **wallet_transactions** (NEW - Wallet Activity)
```sql
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
  payout_id UUID REFERENCES payout_requests(id),
  
  -- Status
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_date ON wallet_transactions(created_at);
```

#### 10. **payout_requests** (NEW - Creator Payouts)
```sql
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

CREATE INDEX idx_payout_requests_creator ON payout_requests(creator_id);
CREATE INDEX idx_payout_requests_status ON payout_requests(status);
```

#### 11. **support_tickets** (NEW - Support System)
```sql
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Ticket Info
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT, -- 'technical', 'billing', 'content', 'account'
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

CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
```

#### 12. **admin_actions** (NEW - Audit Log)
```sql
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Action Info
  action_type TEXT NOT NULL, -- 'ban_user', 'delete_content', 'grant_membership', etc.
  target_type TEXT, -- 'user', 'content', 'comment', etc.
  target_id UUID,
  
  -- Details
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_actions_admin ON admin_actions(admin_id);
CREATE INDEX idx_admin_actions_type ON admin_actions(action_type);
CREATE INDEX idx_admin_actions_date ON admin_actions(created_at);
```

---

## 🔄 **Implementation Phases**

### **Phase 1: Foundation (Week 1)**
1. ✅ Create all database tables
2. ✅ Set up Supabase authentication
3. ✅ Implement RLS policies
4. ✅ Create indexes
5. ✅ Seed initial data (categories, admin user)

### **Phase 2: User System (Week 2)**
1. Login/Signup pages
2. User profile management
3. Password reset
4. Email verification
5. Session management

### **Phase 3: Content Management (Week 2-3)**
1. Admin content upload interface
2. Video/photo processing
3. Thumbnail generation
4. Preview creation
5. Category/tag system

### **Phase 4: Browsing & Time Limits (Week 3)**
1. Watch time tracking system
2. Daily limit enforcement
3. Ad integration for time unlocks
4. Free monthly unlock system
5. Timer UI components

### **Phase 5: Payments & Unlocks (Week 4)**
1. Gumroad API integration
2. Webhook handling
3. Video unlock system
4. Membership management
5. Transaction history

### **Phase 6: Creator Features (Week 5)**
1. Creator dashboard
2. Content upload for creators
3. Wallet system
4. Earnings tracking
5. Payout requests

### **Phase 7: Social Features (Week 5-6)**
1. Comments system
2. Likes/favorites
3. Saved videos
4. User messaging
5. Notifications

### **Phase 8: Admin Panel (Week 6)**
1. User management
2. Content moderation
3. Ban system
4. Support tickets
5. Analytics dashboard
6. Payout management

### **Phase 9: Polish & Deploy (Week 7)**
1. Testing all features
2. Performance optimization
3. Security audit
4. Deploy to Netlify
5. Configure CDN

---

## 🔐 **Gumroad Integration Plan**

### **Webhooks to Handle:**
1. `sale` - New purchase (video unlock or membership)
2. `subscription_started` - New VIP subscription
3. `subscription_ended` - Subscription cancelled/expired
4. `subscription_updated` - Subscription tier changed
5. `refund` - Handle refunds

### **API Endpoints Needed:**
```javascript
// Webhook receiver
POST /api/gumroad/webhook

// Verify purchase
GET /api/gumroad/verify/:purchaseId

// Check subscription status
GET /api/gumroad/subscription/:userId
```

---

## 📝 **Next Steps**

### **Immediate Actions:**
1. ✅ Review this plan
2. ✅ Answer clarifying questions
3. ✅ Approve database schema
4. ✅ Create SQL migration scripts
5. ✅ Set up Gumroad account & products

### **Questions to Answer:**
1. How should watch time limits work exactly?
2. What ad system will you use?
3. How do video unlocks expire?
4. What's the creator revenue split?
5. Any other features I missed?

---

**Ready to start building once you approve!** 🚀
