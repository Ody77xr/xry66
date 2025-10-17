import type { Context, Config } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { analyticsData, action } = await req.json();
    const mistralApiKey = Netlify.env.get('MISTRAL_API_KEY') || '8k34GYRHjyOLMcI11OCSQtESLvO9tvPl';

    let prompt = '';
    switch (action) {
      case 'analyze_views':
        prompt = `Analyze these video view analytics and provide insights on user engagement patterns: ${JSON.stringify(analyticsData)}`;
        break;
      case 'analyze_user_behavior':
        prompt = `Analyze user behavior patterns from this data and suggest improvements: ${JSON.stringify(analyticsData)}`;
        break;
      case 'generate_report':
        prompt = `Generate a comprehensive analytics report from this data with actionable insights: ${JSON.stringify(analyticsData)}`;
        break;
      default:
        prompt = `Analyze this data and provide insights: ${JSON.stringify(analyticsData)}`;
    }

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mistralApiKey}`
      },
      body: JSON.stringify({
        model: 'mistral-small',
        messages: [{
          role: 'user',
          content: prompt
        }],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error('Mistral API request failed');
    }

    const data = await response.json();
    const insights = data.choices?.[0]?.message?.content || 'No insights available';

    return new Response(JSON.stringify({
      success: true,
      insights,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Analytics processing error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process analytics',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config: Config = {
  path: "/api/admin/analytics"
};
