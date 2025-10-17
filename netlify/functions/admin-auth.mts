import type { Context, Config } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { email, password } = await req.json();
    
    // Validate credentials for admin user
    if (email === 'oodasenior@gmail.com' && password === 'globalMikrlo123$') {
      // Create a simple JWT-like token for admin session
      const adminToken = btoa(JSON.stringify({
        email,
        role: 'admin',
        username: 'SirHumpAlot94',
        timestamp: Date.now()
      }));

      return new Response(JSON.stringify({
        success: true,
        token: adminToken,
        user: {
          email,
          username: 'SirHumpAlot94',
          role: 'admin'
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Invalid credentials' 
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config: Config = {
  path: "/api/admin/auth"
};
