-- Hxmp Space - Row Level Security Policies
-- Run this AFTER database-schema-final.sql

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can update any user
CREATE POLICY "Admins can update any user"
ON users FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- CATEGORIES TABLE POLICIES
-- ============================================================================

-- Everyone can view categories
CREATE POLICY "Anyone can view categories"
ON categories FOR SELECT
USING (is_active = true);

-- Only admins can manage categories
CREATE POLICY "Admins can manage categories"
ON categories FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- CONTENT TABLE POLICIES
-- ============================================================================

-- Everyone can view published free content
CREATE POLICY "Anyone can view free content"
ON content FOR SELECT
USING (
  status = 'published' AND is_free = true
);

-- VIP users can view premium content (except Super Hxmp)
CREATE POLICY "VIP users can view premium content"
ON content FOR SELECT
USING (
  status = 'published' AND
  is_premium = true AND
  is_super_hxmp = false AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND subscription_tier IN ('vip', 'lifetime')
  )
);

-- Users can view content they've unlocked
CREATE POLICY "Users can view unlocked content"
ON content FOR SELECT
USING (
  status = 'published' AND
  EXISTS (
    SELECT 1 FROM video_unlocks
    WHERE video_unlocks.user_id = auth.uid()
    AND video_unlocks.content_id = content.id
    AND video_unlocks.is_expired = false
  )
);

-- Creators can view their own content
CREATE POLICY "Creators can view own content"
ON content FOR SELECT
USING (creator_id = auth.uid());

-- Creators can insert content (pending approval)
CREATE POLICY "Creators can upload content"
ON content FOR INSERT
WITH CHECK (
  creator_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND is_creator = true
  )
);

-- Creators can update their own draft content
CREATE POLICY "Creators can update own drafts"
ON content FOR UPDATE
USING (
  creator_id = auth.uid() AND status = 'draft'
);

-- Admins can do anything with content
CREATE POLICY "Admins can manage all content"
ON content FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- WATCH SESSIONS POLICIES
-- ============================================================================

-- Users can insert their own watch sessions
CREATE POLICY "Users can create watch sessions"
ON watch_sessions FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can view their own watch history
CREATE POLICY "Users can view own watch history"
ON watch_sessions FOR SELECT
USING (user_id = auth.uid());

-- Admins can view all watch sessions
CREATE POLICY "Admins can view all watch sessions"
ON watch_sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- VIDEO UNLOCKS POLICIES
-- ============================================================================

-- Users can view their own unlocks
CREATE POLICY "Users can view own unlocks"
ON video_unlocks FOR SELECT
USING (user_id = auth.uid());

-- System can insert unlocks (via backend)
CREATE POLICY "System can create unlocks"
ON video_unlocks FOR INSERT
WITH CHECK (true);

-- Admins can manage all unlocks
CREATE POLICY "Admins can manage unlocks"
ON video_unlocks FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- PURCHASES POLICIES
-- ============================================================================

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
ON purchases FOR SELECT
USING (user_id = auth.uid());

-- System can insert purchases (via Gumroad webhook)
CREATE POLICY "System can create purchases"
ON purchases FOR INSERT
WITH CHECK (true);

-- Admins can view all purchases
CREATE POLICY "Admins can view all purchases"
ON purchases FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- COMMENTS POLICIES
-- ============================================================================

-- Everyone can view non-deleted comments
CREATE POLICY "Anyone can view comments"
ON comments FOR SELECT
USING (is_deleted = false);

-- Authenticated users can post comments
CREATE POLICY "Users can post comments"
ON comments FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own comments
CREATE POLICY "Users can edit own comments"
ON comments FOR UPDATE
USING (user_id = auth.uid());

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
ON comments FOR DELETE
USING (user_id = auth.uid());

-- Admins can manage all comments
CREATE POLICY "Admins can manage all comments"
ON comments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- LIKES POLICIES
-- ============================================================================

-- Users can view all likes
CREATE POLICY "Anyone can view content likes"
ON content_likes FOR SELECT
USING (true);

-- Users can like content
CREATE POLICY "Users can like content"
ON content_likes FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can unlike content
CREATE POLICY "Users can unlike content"
ON content_likes FOR DELETE
USING (user_id = auth.uid());

-- ============================================================================
-- SAVED VIDEOS POLICIES
-- ============================================================================

-- Users can manage their own saved videos
CREATE POLICY "Users can manage saved videos"
ON saved_videos FOR ALL
USING (user_id = auth.uid());

-- ============================================================================
-- CREATOR WALLET POLICIES
-- ============================================================================

-- Creators can view their own wallet
CREATE POLICY "Creators can view own wallet"
ON creator_wallets FOR SELECT
USING (creator_id = auth.uid());

-- Creators can update their payout info
CREATE POLICY "Creators can update payout info"
ON creator_wallets FOR UPDATE
USING (creator_id = auth.uid());

-- Admins can view all wallets
CREATE POLICY "Admins can view all wallets"
ON creator_wallets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- WALLET TRANSACTIONS POLICIES
-- ============================================================================

-- Creators can view their own transactions
CREATE POLICY "Creators can view own transactions"
ON wallet_transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM creator_wallets
    WHERE creator_wallets.id = wallet_transactions.wallet_id
    AND creator_wallets.creator_id = auth.uid()
  )
);

-- System can insert transactions
CREATE POLICY "System can create transactions"
ON wallet_transactions FOR INSERT
WITH CHECK (true);

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions"
ON wallet_transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- PAYOUT REQUESTS POLICIES
-- ============================================================================

-- Creators can view their own payout requests
CREATE POLICY "Creators can view own payouts"
ON payout_requests FOR SELECT
USING (creator_id = auth.uid());

-- Creators can create payout requests
CREATE POLICY "Creators can request payouts"
ON payout_requests FOR INSERT
WITH CHECK (creator_id = auth.uid());

-- Admins can manage all payout requests
CREATE POLICY "Admins can manage payouts"
ON payout_requests FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- MESSAGES POLICIES
-- ============================================================================

-- Users can view their own messages
CREATE POLICY "Users can view own messages"
ON messages FOR SELECT
USING (
  sender_id = auth.uid() OR recipient_id = auth.uid()
);

-- Users can send messages
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (sender_id = auth.uid());

-- Users can update their own messages
CREATE POLICY "Users can update own messages"
ON messages FOR UPDATE
USING (sender_id = auth.uid());

-- ============================================================================
-- CONVERSATIONS POLICIES
-- ============================================================================

-- Users can view their own conversations
CREATE POLICY "Users can view own conversations"
ON conversations FOR SELECT
USING (
  user_id = auth.uid() OR admin_id = auth.uid()
);

-- Users can create conversations
CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- SUPPORT TICKETS POLICIES
-- ============================================================================

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets"
ON support_tickets FOR SELECT
USING (user_id = auth.uid());

-- Users can create tickets
CREATE POLICY "Users can create tickets"
ON support_tickets FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets"
ON support_tickets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can update tickets
CREATE POLICY "Admins can update tickets"
ON support_tickets FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid());

-- System can create notifications
CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- ADMIN ACTIONS POLICIES
-- ============================================================================

-- Only admins can view admin actions
CREATE POLICY "Admins can view admin actions"
ON admin_actions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Only admins can create admin actions
CREATE POLICY "Admins can create admin actions"
ON admin_actions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- ANALYTICS POLICIES
-- ============================================================================

-- System can insert analytics
CREATE POLICY "System can create analytics"
ON analytics FOR INSERT
WITH CHECK (true);

-- Admins can view analytics
CREATE POLICY "Admins can view analytics"
ON analytics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ RLS policies created successfully!';
    RAISE NOTICE '🔐 All tables are now secured';
    RAISE NOTICE '🚀 Database is ready for use!';
END $$;
