// Netlify Function: Admin User Management
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { action, adminId, userId, data } = JSON.parse(event.body);

    // Verify admin
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .select('role')
      .eq('id', adminId)
      .single();

    if (adminError || !admin || admin.role !== 'admin') {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Unauthorized: Admin access required' })
      };
    }

    let result;

    switch(action) {
      case 'promote_membership':
        result = await supabase
          .from('users')
          .update({ member_tier: data.tier })
          .eq('id', userId)
          .select();

        await logAdminAction(adminId, 'promote_membership', 'user', userId, { tier: data.tier });
        break;

      case 'ban_user':
        result = await supabase
          .from('users')
          .update({ 
            is_banned: true, 
            ban_reason: data.reason,
            messaging_enabled: false 
          })
          .eq('id', userId)
          .select();

        await logAdminAction(adminId, 'ban_user', 'user', userId, { reason: data.reason });
        break;

      case 'unban_user':
        result = await supabase
          .from('users')
          .update({ 
            is_banned: false, 
            ban_reason: null,
            messaging_enabled: true 
          })
          .eq('id', userId)
          .select();

        await logAdminAction(adminId, 'unban_user', 'user', userId, null);
        break;

      case 'grant_unlock':
        result = await supabase
          .from('unlocked_videos')
          .insert([{
            user_id: userId,
            video_id: data.videoId,
            unlock_type: 'admin',
            expires_at: data.permanent ? null : data.expiresAt
          }])
          .select();

        await logAdminAction(adminId, 'grant_unlock', 'unlock', userId, { videoId: data.videoId });
        break;

      case 'reset_browsing_limit':
        result = await supabase
          .from('users')
          .update({ 
            browsing_limit_minutes: data.minutes || 60,
            browsing_limit_reset_at: new Date()
          })
          .eq('id', userId)
          .select();

        await logAdminAction(adminId, 'reset_browsing_limit', 'user', userId, { minutes: data.minutes });
        break;

      case 'toggle_messaging':
        result = await supabase
          .from('users')
          .update({ messaging_enabled: data.enabled })
          .eq('id', userId)
          .select();

        await logAdminAction(adminId, 'toggle_messaging', 'user', userId, { enabled: data.enabled });
        break;

      case 'change_password':
        // Would integrate with Supabase Auth API
        result = { message: 'Password reset email sent' };
        await logAdminAction(adminId, 'change_user_password', 'user', userId, null);
        break;

      case 'change_username':
        result = await supabase
          .from('users')
          .update({ username: data.username })
          .eq('id', userId)
          .select();

        await logAdminAction(adminId, 'change_username', 'user', userId, { username: data.username });
        break;

      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: result })
    };
  } catch (error) {
    console.error('Admin user management error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

async function logAdminAction(adminId, action, targetType, targetId, details) {
  await supabase
    .from('admin_audit_log')
    .insert([{
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId,
      details
    }]);
}
