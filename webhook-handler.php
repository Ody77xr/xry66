<?php
/**
 * Gumroad Webhook Handler for HXMP Space
 * Place this file on your custom domain server
 * URL: https://yourdomain.com/webhook-handler.php
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get webhook data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Log webhook for debugging
error_log('Gumroad Webhook: ' . $input);

// Verify webhook (optional but recommended)
function verifyWebhook($data) {
    // Add your webhook verification logic here
    // Gumroad doesn't use signatures, but you can verify other fields
    return isset($data['seller_id']) && isset($data['product_id']);
}

if (!verifyWebhook($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid webhook']);
    exit;
}

// Supabase configuration
$supabaseUrl = 'https://iqyauoezuuuohwhmxnkh.supabase.co';
$supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxeWF1b2V6dXV1b2h3aG14bmtoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY4MTk1MSwiZXhwIjoyMDc2MjU3OTUxfQ.E6dpJnfF1sJcAw5PuEA85ed3uqOxA0h1K-qc9n9IQkk';

// Function to make Supabase API calls
function supabaseRequest($endpoint, $method = 'GET', $data = null) {
    global $supabaseUrl, $supabaseKey;
    
    $url = $supabaseUrl . '/rest/v1/' . $endpoint;
    
    $headers = [
        'apikey: ' . $supabaseKey,
        'Authorization: Bearer ' . $supabaseKey,
        'Content-Type: application/json',
        'Prefer: return=representation'
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'status' => $httpCode,
        'data' => json_decode($response, true)
    ];
}

// Process the webhook
try {
    $saleId = $data['sale_id'] ?? null;
    $productId = $data['product_id'] ?? null;
    $purchaserEmail = $data['email'] ?? null;
    $price = $data['price'] ?? 0;
    $customFields = $data['custom_fields'] ?? [];
    
    // Extract custom data
    $userId = null;
    $contentId = null;
    $subscriptionTier = null;
    $purchaseType = 'content'; // default
    
    // Parse custom fields (these come from the checkout URL parameters)
    foreach ($customFields as $field) {
        if ($field['name'] === 'user_id') {
            $userId = $field['value'];
        } elseif ($field['name'] === 'content_id') {
            $contentId = $field['value'];
        } elseif ($field['name'] === 'subscription_tier') {
            $subscriptionTier = $field['value'];
            $purchaseType = 'subscription';
        } elseif ($field['name'] === 'type') {
            $purchaseType = $field['value'];
        }
    }
    
    if (!$userId) {
        throw new Exception('Missing user_id in webhook data');
    }
    
    // Record purchase in database
    $purchaseData = [
        'user_id' => $userId,
        'purchase_type' => $purchaseType,
        'amount' => $price / 100, // Convert cents to dollars
        'currency' => 'USD',
        'payment_method' => 'gumroad',
        'gumroad_sale_id' => $saleId,
        'gumroad_product_id' => $productId,
        'status' => 'completed',
        'completed_at' => date('c')
    ];
    
    if ($contentId) {
        $purchaseData['content_id'] = $contentId;
    }
    
    $purchaseResult = supabaseRequest('purchases', 'POST', $purchaseData);
    
    if ($purchaseResult['status'] !== 201) {
        throw new Exception('Failed to record purchase: ' . json_encode($purchaseResult));
    }
    
    // Handle content purchase
    if ($purchaseType === 'content' && $contentId) {
        // Create video unlock
        $unlockData = [
            'user_id' => $userId,
            'content_id' => $contentId,
            'unlock_type' => 'purchase',
            'unlock_method' => 'gumroad',
            'gumroad_sale_id' => $saleId,
            'amount_paid' => $price / 100,
            'unlocked_at' => date('c')
        ];
        
        $unlockResult = supabaseRequest('video_unlocks', 'POST', $unlockData);
        
        if ($unlockResult['status'] !== 201) {
            error_log('Failed to create video unlock: ' . json_encode($unlockResult));
        }
        
        // Update creator earnings
        updateCreatorEarnings($contentId, $price / 100);
    }
    
    // Handle subscription purchase
    if ($purchaseType === 'subscription') {
        $tier = $subscriptionTier ?: 'vip';
        $expiresAt = date('c', strtotime('+1 month'));
        
        // Update user subscription
        $userUpdateData = [
            'subscription_tier' => $tier,
            'subscription_expires_at' => $expiresAt,
            'gumroad_subscription_id' => $saleId
        ];
        
        $userResult = supabaseRequest('users?id=eq.' . $userId, 'PATCH', $userUpdateData);
        
        if ($userResult['status'] !== 200) {
            error_log('Failed to update user subscription: ' . json_encode($userResult));
        }
        
        // Record subscription
        $subscriptionData = [
            'user_id' => $userId,
            'tier' => $tier,
            'price' => 12.99,
            'currency' => 'USD',
            'gumroad_subscription_id' => $saleId,
            'gumroad_product_id' => $productId,
            'status' => 'active',
            'starts_at' => date('c'),
            'expires_at' => $expiresAt,
            'auto_renew' => true
        ];
        
        $subResult = supabaseRequest('subscriptions', 'POST', $subscriptionData);
        
        if ($subResult['status'] !== 201) {
            error_log('Failed to record subscription: ' . json_encode($subResult));
        }
    }
    
    // Success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Webhook processed successfully',
        'sale_id' => $saleId,
        'user_id' => $userId,
        'type' => $purchaseType
    ]);
    
} catch (Exception $e) {
    error_log('Webhook error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Webhook processing failed',
        'message' => $e->getMessage()
    ]);
}

// Function to update creator earnings
function updateCreatorEarnings($contentId, $amount) {
    // Get content creator info
    $contentResult = supabaseRequest('content?id=eq.' . $contentId . '&select=creator_id,creator_revenue_share');
    
    if ($contentResult['status'] !== 200 || empty($contentResult['data'])) {
        return;
    }
    
    $content = $contentResult['data'][0];
    $creatorId = $content['creator_id'];
    $revenueShare = $content['creator_revenue_share'] ?? 70;
    
    if (!$creatorId) return;
    
    $creatorEarnings = $amount * ($revenueShare / 100);
    
    // Get creator wallet
    $walletResult = supabaseRequest('creator_wallets?creator_id=eq.' . $creatorId);
    
    if ($walletResult['status'] === 200 && !empty($walletResult['data'])) {
        $wallet = $walletResult['data'][0];
        $newBalance = $wallet['available_balance'] + $creatorEarnings;
        $newLifetimeEarnings = $wallet['lifetime_earnings'] + $creatorEarnings;
        
        // Update wallet
        $walletUpdateData = [
            'available_balance' => $newBalance,
            'lifetime_earnings' => $newLifetimeEarnings
        ];
        
        supabaseRequest('creator_wallets?creator_id=eq.' . $creatorId, 'PATCH', $walletUpdateData);
        
        // Record transaction
        $transactionData = [
            'wallet_id' => $wallet['id'],
            'type' => 'earning',
            'amount' => $creatorEarnings,
            'description' => 'Earnings from content sale: ' . $contentId,
            'content_id' => $contentId,
            'status' => 'completed'
        ];
        
        supabaseRequest('wallet_transactions', 'POST', $transactionData);
    }
}
?>