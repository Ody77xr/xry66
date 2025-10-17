# Hxmp Space - Database Schema Design

## 📊 Database Architecture

### Core Tables

#### 1. **users** (Authentication & Profiles)
```sql
- id (uuid, primary key)
- email (text, unique)
- username (text, unique)
- display_name (text)
- avatar_url (text)
- role (enum: 'user', 'vip', 'admin')
- subscription_tier (enum: 'free', 'basic', 'premium', 'lifetime')
- subscription_expires_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
- last_login (timestamp)
- is_active (boolean)
- bio (text)
- preferences (jsonb)
```

#### 2. **content** (Videos & Photos)
```sql
- id (uuid, primary key)
- creator_id (uuid, foreign key → users.id)
- title (text)
- description (text)
- content_type (enum: 'video', 'photo', 'gallery')
- file_url (text)
- thumbnail_url (text)
- duration (integer) -- for videos in seconds
- file_size (bigint)
- resolution (text) -- e.g., "1920x1080"
- category (text)
- tags (text[])
- is_premium (boolean)
- is_free (boolean)
- price (decimal)
- view_count (integer)
- like_count (integer)
- download_count (integer)
- status (enum: 'draft', 'processing', 'published', 'archived')
- published_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 3. **galleries** (Photo Collections)
```sql
- id (uuid, primary key)
- creator_id (uuid, foreign key → users.id)
- title (text)
- description (text)
- cover_image_url (text)
- is_premium (boolean)
- price (decimal)
- photo_count (integer)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 4. **gallery_photos** (Photos in Galleries)
```sql
- id (uuid, primary key)
- gallery_id (uuid, foreign key → galleries.id)
- content_id (uuid, foreign key → content.id)
- order_index (integer)
- created_at (timestamp)
```

#### 5. **purchases** (Content Purchases)
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → users.id)
- content_id (uuid, foreign key → content.id, nullable)
- gallery_id (uuid, foreign key → galleries.id, nullable)
- subscription_id (uuid, foreign key → subscriptions.id, nullable)
- amount (decimal)
- currency (text) -- 'USD', 'BTC', 'ETH', etc.
- payment_method (enum: 'crypto', 'card', 'paypal')
- transaction_id (text)
- status (enum: 'pending', 'completed', 'failed', 'refunded')
- created_at (timestamp)
- completed_at (timestamp)
```

#### 6. **subscriptions** (VIP Memberships)
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → users.id)
- tier (enum: 'basic', 'premium', 'lifetime')
- price (decimal)
- currency (text)
- payment_method (text)
- status (enum: 'active', 'cancelled', 'expired', 'paused')
- starts_at (timestamp)
- expires_at (timestamp)
- auto_renew (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 7. **custom_requests** (Custom Content Requests)
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → users.id)
- title (text)
- description (text)
- category (text)
- budget (decimal)
- currency (text)
- status (enum: 'pending', 'accepted', 'in_progress', 'completed', 'rejected', 'cancelled')
- priority (enum: 'normal', 'high', 'urgent')
- deadline (timestamp)
- admin_notes (text)
- created_at (timestamp)
- updated_at (timestamp)
- completed_at (timestamp)
```

#### 8. **messages** (User-Admin Messaging)
```sql
- id (uuid, primary key)
- conversation_id (uuid)
- sender_id (uuid, foreign key → users.id)
- recipient_id (uuid, foreign key → users.id)
- content (text)
- attachments (jsonb) -- array of file URLs
- is_read (boolean)
- read_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 9. **conversations** (Message Threads)
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → users.id)
- admin_id (uuid, foreign key → users.id)
- subject (text)
- last_message_at (timestamp)
- is_archived (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 10. **favorites** (User Favorites)
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → users.id)
- content_id (uuid, foreign key → content.id, nullable)
- gallery_id (uuid, foreign key → galleries.id, nullable)
- created_at (timestamp)
```

#### 11. **views** (Content View Tracking)
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → users.id, nullable)
- content_id (uuid, foreign key → content.id)
- ip_address (text)
- user_agent (text)
- duration (integer) -- seconds watched
- created_at (timestamp)
```

#### 12. **analytics** (Site Analytics)
```sql
- id (uuid, primary key)
- event_type (text) -- 'page_view', 'content_view', 'purchase', etc.
- user_id (uuid, foreign key → users.id, nullable)
- metadata (jsonb)
- created_at (timestamp)
```

#### 13. **notifications** (User Notifications)
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → users.id)
- type (text) -- 'new_content', 'message', 'purchase', etc.
- title (text)
- message (text)
- link (text)
- is_read (boolean)
- created_at (timestamp)
- read_at (timestamp)
```

#### 14. **categories** (Content Categories)
```sql
- id (uuid, primary key)
- name (text, unique)
- slug (text, unique)
- description (text)
- icon (text)
- order_index (integer)
- is_active (boolean)
- created_at (timestamp)
```

#### 15. **tags** (Content Tags)
```sql
- id (uuid, primary key)
- name (text, unique)
- slug (text, unique)
- usage_count (integer)
- created_at (timestamp)
```

## 🔐 Row Level Security (RLS) Policies

### Users Table
- Users can read their own profile
- Users can update their own profile
- Admins can read/update all profiles

### Content Table
- Everyone can read published, non-premium content
- VIP users can read premium content
- Users who purchased content can read it
- Only admins can create/update/delete content

### Messages Table
- Users can only read their own messages
- Users can only send messages to admins
- Admins can read all messages

### Purchases Table
- Users can only read their own purchases
- Admins can read all purchases

## 📈 Indexes for Performance

```sql
-- Content indexes
CREATE INDEX idx_content_creator ON content(creator_id);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_published ON content(published_at);
CREATE INDEX idx_content_category ON content(category);

-- Purchase indexes
CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE INDEX idx_purchases_content ON purchases(content_id);
CREATE INDEX idx_purchases_status ON purchases(status);

-- Message indexes
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);

-- View indexes
CREATE INDEX idx_views_content ON views(content_id);
CREATE INDEX idx_views_user ON views(user_id);
CREATE INDEX idx_views_created ON views(created_at);
```

## 🔄 Next Steps

1. Review and approve this schema
2. Create tables in Supabase
3. Set up RLS policies
4. Create indexes
5. Seed initial data (categories, admin user)
6. Test authentication flows
7. Implement API endpoints

---
**Status:** Design Phase - Awaiting Approval
**Last Updated:** October 17, 2025
