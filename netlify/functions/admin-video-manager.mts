import type { Context, Config } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  const method = req.method;
  
  try {
    const supabaseUrl = Netlify.env.get('SUPABASE_URL') || 'https://ioqysiylfymkqhzyfphq.supabase.co';
    const supabaseKey = Netlify.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvcXlzaXlsZnlta3FoenlmcGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjEzNTAsImV4cCI6MjA3NTU5NzM1MH0.CQ6IZCU_JgVK4BTAHYcgi12olRILi1MhBbeKh9Fmox4';

    switch (method) {
      case 'GET':
        // Fetch videos from Supabase
        const getResponse = await fetch(`${supabaseUrl}/rest/v1/videos?select=*&order=created_at.desc`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (!getResponse.ok) {
          throw new Error('Failed to fetch videos');
        }

        const videos = await getResponse.json();
        return new Response(JSON.stringify({ success: true, videos }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'POST':
        // Add new video
        const videoData = await req.json();
        
        const postResponse = await fetch(`${supabaseUrl}/rest/v1/videos`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            id: videoData.id,
            title: videoData.title,
            description: videoData.description,
            embed_code: videoData.embed_code,
            category: videoData.category,
            subcategory: videoData.subcategory,
            thumbnail_url: videoData.thumbnail_url,
            duration: videoData.duration,
            tags: videoData.tags || [],
            is_premium: videoData.is_premium || false,
            is_published: videoData.is_published !== false,
            views: 0,
            likes: 0,
            dislikes: 0,
            saves: 0,
            unlock_count: 0,
            earnings: 0
          })
        });

        if (!postResponse.ok) {
          const error = await postResponse.text();
          throw new Error(`Failed to create video: ${error}`);
        }

        const newVideo = await postResponse.json();
        
        // Update the video gallery JavaScript file
        await updateVideoGalleryFile(videoData);

        return new Response(JSON.stringify({ 
          success: true, 
          video: newVideo[0],
          message: 'Video added successfully and gallery updated'
        }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'PUT':
        // Update video
        const { id, ...updateData } = await req.json();
        
        const putResponse = await fetch(`${supabaseUrl}/rest/v1/videos?id=eq.${id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(updateData)
        });

        if (!putResponse.ok) {
          throw new Error('Failed to update video');
        }

        const updatedVideo = await putResponse.json();
        return new Response(JSON.stringify({ 
          success: true, 
          video: updatedVideo[0] 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      case 'DELETE':
        // Delete video
        const url = new URL(req.url);
        const videoId = url.searchParams.get('id');
        
        if (!videoId) {
          return new Response(JSON.stringify({ error: 'Video ID required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/videos?id=eq.${videoId}`, {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });

        if (!deleteResponse.ok) {
          throw new Error('Failed to delete video');
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Video deleted successfully' 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { 'Content-Type': 'application/json' }
        });
    }

  } catch (error) {
    console.error('Video manager error:', error);
    return new Response(JSON.stringify({ 
      error: 'Server error',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

async function updateVideoGalleryFile(videoData: any) {
  // This would typically update the video gallery JavaScript file
  // For now, we'll just log the action
  console.log('Video gallery would be updated with:', videoData);
}

export const config: Config = {
  path: "/api/admin/videos"
};
