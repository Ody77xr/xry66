// Netlify Function: Admin Video Management
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { action, adminId, videoData, videoId } = JSON.parse(event.body);

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
      case 'create':
        // Create new video
        const { data: newVideo, error: createError } = await supabase
          .from('videos')
          .insert([{
            ...videoData,
            created_by: adminId
          }])
          .select();

        if (createError) throw createError;
        result = newVideo;

        // Log admin action
        await logAdminAction(adminId, 'create_video', 'video', newVideo[0].id, videoData);
        break;

      case 'update':
        // Update existing video
        const { data: updatedVideo, error: updateError } = await supabase
          .from('videos')
          .update(videoData)
          .eq('id', videoId)
          .select();

        if (updateError) throw updateError;
        result = updatedVideo;

        await logAdminAction(adminId, 'update_video', 'video', videoId, videoData);
        break;

      case 'delete':
        // Delete video
        const { error: deleteError } = await supabase
          .from('videos')
          .delete()
          .eq('id', videoId);

        if (deleteError) throw deleteError;
        result = { deleted: videoId };

        await logAdminAction(adminId, 'delete_video', 'video', videoId, null);
        break;

      case 'toggle_publish':
        // Toggle published status
        const { data: currentVideo } = await supabase
          .from('videos')
          .select('is_published')
          .eq('id', videoId)
          .single();

        const { data: toggled, error: toggleError } = await supabase
          .from('videos')
          .update({ is_published: !currentVideo.is_published })
          .eq('id', videoId)
          .select();

        if (toggleError) throw toggleError;
        result = toggled;

        await logAdminAction(adminId, 'toggle_publish_video', 'video', videoId, { is_published: !currentVideo.is_published });
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
    console.error('Admin video management error:', error);
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
