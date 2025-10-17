// Netlify Function: Mistral AI Analytics Processing
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
    const { action, videoId, userId, dateRange } = JSON.parse(event.body);

    let result;

    switch(action) {
      case 'video_stats':
        // Get comprehensive video statistics
        result = await getVideoStats(videoId);
        break;

      case 'user_analytics':
        // Get user behavior analytics
        result = await getUserAnalytics(userId, dateRange);
        break;

      case 'trending_analysis':
        // Use Mistral to analyze trending content
        result = await analyzeTrending();
        break;

      case 'earnings_report':
        // Generate earnings report
        result = await getEarningsReport(userId);
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
    console.error('Analytics error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

async function getVideoStats(videoId) {
  // Get video data
  const { data: video } = await supabase
    .from('videos')
    .select('*')
    .eq('id', videoId)
    .single();

  // Get analytics events
  const { data: analytics } = await supabase
    .from('video_analytics')
    .select('event_type, created_at')
    .eq('video_id', videoId);

  // Calculate stats
  const stats = {
    totalViews: video.views,
    totalLikes: video.likes,
    totalDislikes: video.dislikes,
    totalSaves: video.saves,
    totalUnlocks: video.unlock_count,
    totalEarnings: video.earnings,
    viewsByDay: groupByDay(analytics.filter(a => a.event_type === 'view')),
    likeRatio: video.likes / (video.likes + video.dislikes) || 0,
    saveRate: video.saves / video.views || 0
  };

  return stats;
}

async function getUserAnalytics(userId, dateRange) {
  const { data: analytics } = await supabase
    .from('video_analytics')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .lte('created_at', dateRange?.end || new Date());

  return {
    totalEvents: analytics.length,
    viewCount: analytics.filter(a => a.event_type === 'view').length,
    likeCount: analytics.filter(a => a.event_type === 'like').length,
    saveCount: analytics.filter(a => a.event_type === 'save').length,
    commentCount: analytics.filter(a => a.event_type === 'comment').length
  };
}

async function analyzeTrending() {
  // Get videos sorted by recent engagement
  const { data: videos } = await supabase
    .from('videos')
    .select('id, title, views, likes, saves, created_at')
    .eq('is_published', true)
    .order('views', { ascending: false })
    .limit(20);

  // Calculate trending score (views + likes*2 + saves*3 in last 7 days)
  const trending = videos.map(v => ({
    ...v,
    trendingScore: v.views + (v.likes * 2) + (v.saves * 3)
  })).sort((a, b) => b.trendingScore - a.trendingScore);

  return trending.slice(0, 10);
}

async function getEarningsReport(userId) {
  const { data: uploads } = await supabase
    .from('user_uploads')
    .select('earnings, title, views, likes')
    .eq('user_id', userId)
    .eq('status', 'approved');

  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, type, created_at')
    .eq('user_id', userId)
    .eq('type', 'earning');

  const totalEarnings = uploads.reduce((sum, u) => sum + parseFloat(u.earnings || 0), 0);
  const totalPaidOut = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  return {
    totalEarnings,
    totalPaidOut,
    pending: totalEarnings - totalPaidOut,
    topContent: uploads.sort((a, b) => b.earnings - a.earnings).slice(0, 5)
  };
}

function groupByDay(events) {
  const grouped = {};
  events.forEach(event => {
    const day = new Date(event.created_at).toISOString().split('T')[0];
    grouped[day] = (grouped[day] || 0) + 1;
  });
  return grouped;
}
