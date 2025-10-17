// Gumroad Payment Integration for HXMP Space
// This handles purchases, subscriptions, and content unlocking

class GumroadIntegration {
    constructor() {
        this.apiKey = 'nfp_obDpHP6rUViyYLALbnkrw7cTfButfDRE2aa7'; // From your .env
        this.baseUrl = 'https://api.gumroad.com/v2';
        this.webhookSecret = 'your-webhook-secret'; // Set this in Gumroad
        this.init();
    }

    init() {
        console.log('🔄 Initializing Gumroad integration...');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for purchase buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('gumroad-purchase-btn')) {
                this.handlePurchaseClick(e);
            }
        });

        // Listen for subscription buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('gumroad-subscription-btn')) {
                this.handleSubscriptionClick(e);
            }
        });
    }

    // Handle individual video/content purchases
    async handlePurchaseClick(event) {
        event.preventDefault();
        
        const button = event.target;
        const contentId = button.dataset.contentId;
        const price = button.dataset.price;
        const title = button.dataset.title;
        
        console.log(`🛒 Initiating purchase for content: ${contentId}`);
        
        try {
            // Get current user
            const user = await authManager.getCurrentUser();
            if (!user) {
                window.location.href = 'auth-login.html';
                return;
            }

            // Create Gumroad product (or use existing)
            const productData = await this.createOrGetProduct({
                name: `HXMP - ${title}`,
                price: price,
                description: `Premium HXMP content: ${title}`,
                content_id: contentId
            });

            // Redirect to Gumroad checkout
            this.redirectToCheckout(productData.permalink, {
                user_id: user.id,
                content_id: contentId,
                type: 'content_purchase'
            });

        } catch (error) {
            console.error('Purchase error:', error);
            alert('Failed to initiate purchase. Please try again.');
        }
    }

    // Handle VIP subscription purchases
    async handleSubscriptionClick(event) {
        event.preventDefault();
        
        const button = event.target;
        const tier = button.dataset.tier || 'vip';
        
        console.log(`💎 Initiating subscription: ${tier}`);
        
        try {
            // Get current user
            const user = await authManager.getCurrentUser();
            if (!user) {
                window.location.href = 'auth-login.html';
                return;
            }

            // VIP subscription product
            const subscriptionData = {
                name: 'HXMPA\' VIP Membership',
                price: 1299, // $12.99 in cents
                description: 'Unlimited access to HXMP content, messaging, creator uploads, and more!',
                type: 'subscription',
                recurrence: 'monthly'
            };

            const productData = await this.createOrGetProduct(subscriptionData);

            // Redirect to Gumroad checkout
            this.redirectToCheckout(productData.permalink, {
                user_id: user.id,
                subscription_tier: tier,
                type: 'subscription'
            });

        } catch (error) {
            console.error('Subscription error:', error);
            alert('Failed to initiate subscription. Please try again.');
        }
    }

    // Create or get existing Gumroad product
    async createOrGetProduct(productData) {
        try {
            // In a real implementation, you'd check if product exists first
            // For now, we'll use pre-created products
            
            if (productData.type === 'subscription') {
                return {
                    id: 'hxmp-vip-subscription',
                    permalink: 'hxmp-vip-membership',
                    url: 'https://sirhxmp.gumroad.com/l/hxmp-vip-membership'
                };
            } else {
                // Individual content purchase
                return {
                    id: `hxmp-content-${productData.content_id}`,
                    permalink: `hxmp-content-${productData.content_id}`,
                    url: `https://sirhxmp.gumroad.com/l/hxmp-content-${productData.content_id}`
                };
            }

        } catch (error) {
            console.error('Product creation error:', error);
            throw error;
        }
    }

    // Redirect to Gumroad checkout with custom data
    redirectToCheckout(permalink, customData) {
        const baseUrl = 'https://sirhxmp.gumroad.com/l/' + permalink;
        
        // Add custom data as URL parameters
        const params = new URLSearchParams();
        Object.keys(customData).forEach(key => {
            params.append(key, customData[key]);
        });

        const checkoutUrl = `${baseUrl}?${params.toString()}`;
        
        console.log('🔗 Redirecting to checkout:', checkoutUrl);
        
        // Open in same window
        window.location.href = checkoutUrl;
        
        // Or open in new window/tab
        // window.open(checkoutUrl, '_blank');
    }

    // Handle webhook from Gumroad (server-side)
    async handleWebhook(webhookData) {
        console.log('📨 Processing Gumroad webhook:', webhookData);

        try {
            // Verify webhook signature (important for security)
            if (!this.verifyWebhookSignature(webhookData)) {
                throw new Error('Invalid webhook signature');
            }

            const { sale, subscription } = webhookData;

            if (sale) {
                await this.processSale(sale);
            }

            if (subscription) {
                await this.processSubscription(subscription);
            }

        } catch (error) {
            console.error('Webhook processing error:', error);
            throw error;
        }
    }

    // Process individual content sale
    async processSale(saleData) {
        console.log('💰 Processing sale:', saleData);

        const {
            sale_id,
            product_id,
            purchaser_id,
            email,
            price,
            custom_fields
        } = saleData;

        try {
            // Extract custom data
            const userId = custom_fields?.user_id;
            const contentId = custom_fields?.content_id;
            const type = custom_fields?.type;

            if (!userId || !contentId) {
                throw new Error('Missing user_id or content_id in sale data');
            }

            // Record purchase in database
            const { error: purchaseError } = await authManager.supabaseClient
                .from('purchases')
                .insert({
                    user_id: userId,
                    content_id: contentId,
                    purchase_type: 'content',
                    amount: price / 100, // Convert cents to dollars
                    currency: 'USD',
                    payment_method: 'gumroad',
                    gumroad_sale_id: sale_id,
                    gumroad_product_id: product_id,
                    status: 'completed',
                    completed_at: new Date().toISOString()
                });

            if (purchaseError) throw purchaseError;

            // Create video unlock
            const { error: unlockError } = await authManager.supabaseClient
                .from('video_unlocks')
                .insert({
                    user_id: userId,
                    content_id: contentId,
                    unlock_type: 'purchase',
                    unlock_method: 'gumroad',
                    gumroad_sale_id: sale_id,
                    amount_paid: price / 100,
                    unlocked_at: new Date().toISOString()
                });

            if (unlockError) throw unlockError;

            // Update creator earnings (if applicable)
            await this.updateCreatorEarnings(contentId, price / 100);

            console.log('✅ Sale processed successfully');

        } catch (error) {
            console.error('Sale processing error:', error);
            throw error;
        }
    }

    // Process subscription
    async processSubscription(subscriptionData) {
        console.log('💎 Processing subscription:', subscriptionData);

        const {
            subscription_id,
            product_id,
            subscriber_id,
            email,
            status,
            custom_fields
        } = subscriptionData;

        try {
            const userId = custom_fields?.user_id;
            const tier = custom_fields?.subscription_tier || 'vip';

            if (!userId) {
                throw new Error('Missing user_id in subscription data');
            }

            // Update user subscription
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month from now

            const { error: userError } = await authManager.supabaseClient
                .from('users')
                .update({
                    subscription_tier: tier,
                    subscription_expires_at: expiresAt.toISOString(),
                    gumroad_subscription_id: subscription_id
                })
                .eq('id', userId);

            if (userError) throw userError;

            // Record subscription in database
            const { error: subError } = await authManager.supabaseClient
                .from('subscriptions')
                .insert({
                    user_id: userId,
                    tier: tier,
                    price: 12.99,
                    currency: 'USD',
                    gumroad_subscription_id: subscription_id,
                    gumroad_product_id: product_id,
                    status: 'active',
                    starts_at: new Date().toISOString(),
                    expires_at: expiresAt.toISOString(),
                    auto_renew: true
                });

            if (subError) throw subError;

            console.log('✅ Subscription processed successfully');

        } catch (error) {
            console.error('Subscription processing error:', error);
            throw error;
        }
    }

    // Update creator earnings
    async updateCreatorEarnings(contentId, amount) {
        try {
            // Get content creator
            const { data: content } = await authManager.supabaseClient
                .from('content')
                .select('creator_id, creator_revenue_share')
                .eq('id', contentId)
                .single();

            if (!content || !content.creator_id) return;

            const creatorShare = (amount * (content.creator_revenue_share / 100));

            // Update creator wallet
            const { error } = await authManager.supabaseClient
                .from('creator_wallets')
                .update({
                    available_balance: authManager.supabaseClient.rpc('increment_balance', { 
                        amount: creatorShare 
                    }),
                    lifetime_earnings: authManager.supabaseClient.rpc('increment_earnings', { 
                        amount: creatorShare 
                    })
                })
                .eq('creator_id', content.creator_id);

            if (error) throw error;

            // Record transaction
            await authManager.supabaseClient
                .from('wallet_transactions')
                .insert({
                    wallet_id: content.creator_id, // This should be wallet_id, not creator_id
                    type: 'earning',
                    amount: creatorShare,
                    description: `Earnings from content sale: ${contentId}`,
                    content_id: contentId,
                    status: 'completed'
                });

        } catch (error) {
            console.error('Creator earnings update error:', error);
        }
    }

    // Verify webhook signature (security)
    verifyWebhookSignature(webhookData) {
        // In production, verify the webhook signature
        // For now, return true (implement proper verification)
        return true;
    }

    // Check if user has purchased content
    async hasPurchased(userId, contentId) {
        try {
            const { data, error } = await authManager.supabaseClient
                .from('video_unlocks')
                .select('id')
                .eq('user_id', userId)
                .eq('content_id', contentId)
                .eq('is_expired', false)
                .single();

            return !error && data;

        } catch (error) {
            console.error('Purchase check error:', error);
            return false;
        }
    }

    // Get user's subscription status
    async getSubscriptionStatus(userId) {
        try {
            const { data, error } = await authManager.supabaseClient
                .from('users')
                .select('subscription_tier, subscription_expires_at')
                .eq('id', userId)
                .single();

            if (error || !data) return { tier: 'free', active: false };

            const isActive = data.subscription_tier !== 'free' && 
                           new Date(data.subscription_expires_at) > new Date();

            return {
                tier: data.subscription_tier,
                active: isActive,
                expires_at: data.subscription_expires_at
            };

        } catch (error) {
            console.error('Subscription status error:', error);
            return { tier: 'free', active: false };
        }
    }
}

// Initialize Gumroad integration
const gumroadIntegration = new GumroadIntegration();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GumroadIntegration;
}