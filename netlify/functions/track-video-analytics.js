// Netlify Function: Track Video Analytics with Mistral AI
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const mistralApiKey = process.env.MISTRAL_API_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { videoId, userId, eventType, metadata } = JSON.parse(event.body);

    // Insert analytics event
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('video_analytics')
      .insert([{
        video_id: videoId,
        user_id: userId,
        event_type: eventType,
        metadata: metadata || {}
      }]);

    if (analyticsError) throw analyticsError;

    // Update video stats based on event type
    switch(eventType) {
      case 'view':
        await supabase.rpc('increment_video_views', { video_id_param: videoId });
        break;
      case 'like':
        await supabase
          .from('videos')
          .update({ likes: supabase.raw('likes + 1') })
          .eq('id', videoId);
        break;
      case 'dislike':
        await supabase
          .from('videos')
          .update({ dislikes: supabase.raw('dislikes + 1') })
          .eq('id', videoId);
        break;
      case 'save':
        await supabase.rpc('increment_video_saves', { video_id_param: videoId });
        break;
      case 'unlock':
        await supabase.rpc('track_unlock', { video_id_param: videoId });
        break;
    }

    // Use Mistral AI to process analytics patterns (optional enhancement)
    if (eventType === 'view') {
      // Could use Mistral to analyze viewing patterns, recommend videos, etc.
      // Keeping this optional for now
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Analytics tracked' })
    };
  } catch (error) {
    console.error('Analytics error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
