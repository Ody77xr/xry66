// Supabase Configuration for Hxmp Space
// This file contains the configuration and helper functions for Supabase integration

// Supabase Configuration
const supabaseConfig = {
    url: 'https://ioqysiylfymkqhzyfphq.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvcXlzaXlsZnlta3FoenlmcGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjEzNTAsImV4cCI6MjA3NTU5NzM1MH0.CQ6IZCU_JgVK4BTAHYcgi12olRILi1MhBbeKh9Fmox4',
    options: {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
};

// Initialize Supabase client
let supabaseClient = null;
if (typeof supabase !== 'undefined') {
    const { createClient } = supabase;
    supabaseClient = createClient(supabaseConfig.url, supabaseConfig.anonKey, supabaseConfig.options);
}

// Database Schema Reference
const databaseSchema = {
    tables: {
        users: {
            id: 'uuid (primary key)',
            email: 'text (unique)',
            username: 'text (unique)',
            display_name: 'text',
            avatar_url: 'text',
            bio: 'text',
            membership_type: 'text (free, premium, vip)',
            created_at: 'timestamp',
            updated_at: 'timestamp'
        },
        content: {
            id: 'uuid (primary key)',
            user_id: 'uuid (foreign key to users)',
            title: 'text',
            description: 'text',
            file_url: 'text',
            thumbnail_url: 'text',
            content_type: 'text (video, image)',
            category: 'text',
            tags: 'text[]',
            privacy_level: 'text (public, private, premium)',
            view_count: 'integer',
            like_count: 'integer',
            created_at: 'timestamp',
            updated_at: 'timestamp'
        },
        messages: {
            id: 'uuid (primary key)',
            sender_id: 'uuid (foreign key to users)',
            recipient_id: 'uuid (foreign key to users)',
            content: 'text',
            message_type: 'text (text, image, video)',
            is_read: 'boolean',
            created_at: 'timestamp'
        },
        likes: {
            id: 'uuid (primary key)',
            user_id: 'uuid (foreign key to users)',
            content_id: 'uuid (foreign key to content)',
            created_at: 'timestamp'
        },
        favorites: {
            id: 'uuid (primary key)',
            user_id: 'uuid (foreign key to users)',
            content_id: 'uuid (foreign key to content)',
            created_at: 'timestamp'
        }
    }
};

// Authentication Helper Functions
class AuthService {
    constructor(client) {
        this.client = client;
    }

    async signUp(email, password, userData = {}) {
        try {
            const { data, error } = await this.client.auth.signUp({
                email,
                password,
                options: {
                    data: userData
                }
            });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async signIn(email, password) {
        try {
            const { data, error } = await this.client.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            const { error } = await this.client.auth.signOut();
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getCurrentUser() {
        try {
            const { data: { user }, error } = await this.client.auth.getUser();
            if (error) throw error;
            return { success: true, user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Content Management Helper Functions
class ContentService {
    constructor(client) {
        this.client = client;
    }

    async uploadContent(contentData) {
        try {
            const { data, error } = await this.client
                .from('content')
                .insert([contentData])
                .select();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getGalleryContent(filters = {}) {
        try {
            let query = this.client
                .from('content')
                .select(`
                    *,
                    users(username, display_name, avatar_url)
                `);

            // Apply filters
            if (filters.category) {
                query = query.eq('category', filters.category);
            }
            
            if (filters.contentType) {
                query = query.eq('content_type', filters.contentType);
            }

            if (filters.privacyLevel) {
                query = query.eq('privacy_level', filters.privacyLevel);
            }

            // Order by created_at descending
            query = query.order('created_at', { ascending: false });

            const { data, error } = await query;
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getUserContent(userId) {
        try {
            const { data, error } = await this.client
                .from('content')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async likeContent(userId, contentId) {
        try {
            const { data, error } = await this.client
                .from('likes')
                .insert([{ user_id: userId, content_id: contentId }]);
            
            if (error) throw error;
            
            // Update like count
            await this.updateLikeCount(contentId);
            
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async updateLikeCount(contentId) {
        try {
            const { count } = await this.client
                .from('likes')
                .select('*', { count: 'exact' })
                .eq('content_id', contentId);

            await this.client
                .from('content')
                .update({ like_count: count })
                .eq('id', contentId);
            
            return { success: true, count };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Messaging Helper Functions
class MessagingService {
    constructor(client) {
        this.client = client;
    }

    async sendMessage(senderId, recipientId, content, messageType = 'text') {
        try {
            const { data, error } = await this.client
                .from('messages')
                .insert([{
                    sender_id: senderId,
                    recipient_id: recipientId,
                    content,
                    message_type: messageType
                }])
                .select();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getConversation(userId, otherUserId) {
        try {
            const { data, error } = await this.client
                .from('messages')
                .select(`
                    *,
                    sender:users!sender_id(username, display_name, avatar_url),
                    recipient:users!recipient_id(username, display_name, avatar_url)
                `)
                .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
                .order('created_at', { ascending: true });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getUserConversations(userId) {
        try {
            const { data, error } = await this.client
                .from('messages')
                .select(`
                    *,
                    sender:users!sender_id(username, display_name, avatar_url),
                    recipient:users!recipient_id(username, display_name, avatar_url)
                `)
                .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// File Storage Helper Functions
class StorageService {
    constructor(client) {
        this.client = client;
        this.buckets = {
            content: 'content-files',
            avatars: 'user-avatars',
            thumbnails: 'thumbnails'
        };
    }

    async uploadFile(bucket, file, fileName) {
        try {
            const { data, error } = await this.client.storage
                .from(bucket)
                .upload(fileName, file);
            
            if (error) throw error;
            
            // Get public URL
            const { data: urlData } = this.client.storage
                .from(bucket)
                .getPublicUrl(fileName);
            
            return { success: true, data, publicUrl: urlData.publicUrl };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async deleteFile(bucket, fileName) {
        try {
            const { data, error } = await this.client.storage
                .from(bucket)
                .remove([fileName]);
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Real-time Subscriptions
class RealtimeService {
    constructor(client) {
        this.client = client;
        this.subscriptions = new Map();
    }

    subscribeToMessages(userId, callback) {
        const subscription = this.client
            .channel('messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `recipient_id=eq.${userId}`
            }, callback)
            .subscribe();

        this.subscriptions.set('messages', subscription);
        return subscription;
    }

    subscribeToContentUpdates(callback) {
        const subscription = this.client
            .channel('content')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'content'
            }, callback)
            .subscribe();

        this.subscriptions.set('content', subscription);
        return subscription;
    }

    unsubscribe(channelName) {
        const subscription = this.subscriptions.get(channelName);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(channelName);
        }
    }

    unsubscribeAll() {
        this.subscriptions.forEach((subscription, channelName) => {
            subscription.unsubscribe();
        });
        this.subscriptions.clear();
    }
}

// Export services for use in other files
// Uncomment when Supabase is properly initialized
/*
const authService = new AuthService(supabaseClient);
const contentService = new ContentService(supabaseClient);
const messagingService = new MessagingService(supabaseClient);
const storageService = new StorageService(supabaseClient);
const realtimeService = new RealtimeService(supabaseClient);

// Make services globally available
window.HxmpServices = {
    auth: authService,
    content: contentService,
    messaging: messagingService,
    storage: storageService,
    realtime: realtimeService
};
*/

// Setup Instructions (for developers)
console.log(`
🚀 Supabase Setup Instructions for Hxmp Space:

1. Create a new Supabase project at https://supabase.com
2. Copy your project URL and anon key
3. Replace 'YOUR_SUPABASE_URL' and 'YOUR_SUPABASE_ANON_KEY' in this file
4. Run the SQL commands below in your Supabase SQL editor to create tables:

-- Create users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    membership_type TEXT DEFAULT 'free' CHECK (membership_type IN ('free', 'premium', 'vip')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content table
CREATE TABLE content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    content_type TEXT NOT NULL CHECK (content_type IN ('video', 'image')),
    category TEXT NOT NULL,
    tags TEXT[],
    privacy_level TEXT DEFAULT 'public' CHECK (privacy_level IN ('public', 'private', 'premium')),
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create likes table
CREATE TABLE likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_id)
);

-- Create favorites table
CREATE TABLE favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_id)
);

5. Set up Row Level Security (RLS) policies for each table
6. Create storage buckets: 'content-files', 'user-avatars', 'thumbnails'
7. Include Supabase JS client in your HTML files:
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
8. Uncomment the initialization code in this file
`);

export { supabaseConfig, databaseSchema };
