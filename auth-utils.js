// Authentication Utilities for Hxmp Space
// Include this file in pages that require authentication

class AuthManager {
    constructor() {
        this.supabaseClient = null;
        this.currentUser = null;
        this.currentProfile = null;
        this.init();
    }

    async init() {
        // Initialize Supabase client
        const { createClient } = supabase;
        this.supabaseClient = createClient(
            supabaseConfig.url,
            supabaseConfig.anonKey,
            supabaseConfig.options
        );

        // Listen for auth state changes
        this.supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event);
            if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.currentProfile = null;
            }
        });
    }

    // Check if user is logged in
    async isAuthenticated() {
        const { data: { session } } = await this.supabaseClient.auth.getSession();
        return !!session;
    }

    // Get current user
    async getCurrentUser() {
        if (this.currentUser) return this.currentUser;

        const { data: { user }, error } = await this.supabaseClient.auth.getUser();
        if (error || !user) return null;

        this.currentUser = user;
        return user;
    }

    // Get user profile
    async getUserProfile(userId = null) {
        if (!userId) {
            const user = await this.getCurrentUser();
            if (!user) return null;
            userId = user.id;
        }

        if (this.currentProfile && this.currentProfile.id === userId) {
            return this.currentProfile;
        }

        const { data, error } = await this.supabaseClient
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }

        this.currentProfile = data;
        return data;
    }

    // Check if user has specific role
    async hasRole(role) {
        const profile = await this.getUserProfile();
        return profile && profile.role === role;
    }

    // Check if user is admin
    async isAdmin() {
        return await this.hasRole('admin');
    }

    // Check if user is creator
    async isCreator() {
        const profile = await this.getUserProfile();
        return profile && profile.is_creator === true;
    }

    // Check if user is VIP
    async isVIP() {
        const profile = await this.getUserProfile();
        if (!profile) return false;
        
        const tier = profile.subscription_tier;
        if (tier === 'lifetime') return true;
        if (tier === 'vip') {
            // Check if subscription is still active
            const expiresAt = new Date(profile.subscription_expires_at);
            return expiresAt > new Date();
        }
        return false;
    }

    // Check if user is free tier
    async isFreeTier() {
        const profile = await this.getUserProfile();
        return profile && profile.subscription_tier === 'free';
    }

    // Get remaining watch time for free users (in seconds)
    async getRemainingWatchTime() {
        const profile = await this.getUserProfile();
        if (!profile) return 0;

        const isVip = await this.isVIP();
        if (isVip) return Infinity; // Unlimited for VIP

        const maxTime = 3600; // 1 hour in seconds
        const used = profile.watch_time_used_today || 0;
        return Math.max(0, maxTime - used);
    }

    // Update watch time
    async updateWatchTime(seconds) {
        const user = await this.getCurrentUser();
        if (!user) return;

        const { error } = await this.supabaseClient.rpc('increment_watch_time', {
            user_id: user.id,
            seconds: seconds
        });

        if (error) {
            console.error('Error updating watch time:', error);
        }
    }

    // Check if user can watch content
    async canWatchContent(contentId) {
        const profile = await this.getUserProfile();
        if (!profile) return false;

        // Check if banned
        if (profile.is_banned) return false;

        // Get content details
        const { data: content } = await this.supabaseClient
            .from('content')
            .select('*')
            .eq('id', contentId)
            .single();

        if (!content) return false;

        // Free content - anyone can watch
        if (content.is_free) return true;

        // Check if user has unlocked this content
        const { data: unlock } = await this.supabaseClient
            .from('video_unlocks')
            .select('*')
            .eq('user_id', profile.id)
            .eq('content_id', contentId)
            .eq('is_expired', false)
            .single();

        if (unlock) return true;

        // VIP users can watch premium content (except Super Hxmp)
        const isVip = await this.isVIP();
        if (isVip && content.is_premium && !content.is_super_hxmp) {
            return true;
        }

        return false;
    }

    // Require authentication (redirect if not logged in)
    async requireAuth(redirectUrl = 'auth-login.html') {
        const isAuth = await this.isAuthenticated();
        if (!isAuth) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    // Require admin role
    async requireAdmin(redirectUrl = 'xrhome.html') {
        const isAuth = await this.requireAuth();
        if (!isAuth) return false;

        const isAdminUser = await this.isAdmin();
        if (!isAdminUser) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    // Require VIP subscription
    async requireVIP(redirectUrl = 'xrmembership.html') {
        const isAuth = await this.requireAuth();
        if (!isAuth) return false;

        const isVipUser = await this.isVIP();
        if (!isVipUser) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    // Sign out
    async signOut() {
        const { error } = await this.supabaseClient.auth.signOut();
        if (error) {
            console.error('Sign out error:', error);
            return false;
        }
        
        this.currentUser = null;
        this.currentProfile = null;
        window.location.href = 'xrhome.html';
        return true;
    }

    // Update user profile
    async updateProfile(updates) {
        const user = await this.getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        const { data, error } = await this.supabaseClient
            .from('users')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

        if (!error) {
            this.currentProfile = data;
        }

        return { data, error };
    }

    // Reset daily limits (called by cron or manually)
    async resetDailyLimits() {
        const user = await this.getCurrentUser();
        if (!user) return;

        const { error } = await this.supabaseClient
            .from('users')
            .update({
                watch_time_used_today: 0,
                ad_unlocks_used_today: 0,
                last_watch_reset: new Date().toISOString(),
                last_ad_reset: new Date().toISOString()
            })
            .eq('id', user.id);

        if (error) {
            console.error('Error resetting limits:', error);
        }
    }
}

// Create global instance
const authManager = new AuthManager();

// Helper functions for easy access
async function requireAuth() {
    return await authManager.requireAuth();
}

async function requireAdmin() {
    return await authManager.requireAdmin();
}

async function requireVIP() {
    return await authManager.requireVIP();
}

async function getCurrentUser() {
    return await authManager.getCurrentUser();
}

async function getUserProfile() {
    return await authManager.getUserProfile();
}

async function isAdmin() {
    return await authManager.isAdmin();
}

async function isVIP() {
    return await authManager.isVIP();
}

async function signOut() {
    return await authManager.signOut();
}
