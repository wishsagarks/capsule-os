import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface SpotifyAuthRequest {
  code?: string;
  state?: string;
  refresh_token?: string;
}

const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');
const SPOTIFY_REDIRECT_URI = Deno.env.get('SPOTIFY_REDIRECT_URI');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci3--5173--365214aa.local-credentialless.webcontainer-api.io';

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Handle GET request from Spotify redirect
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');

      if (error) {
        return redirectWithToken('error', error, state);
      }

      if (!code) {
        return redirectWithToken('error', 'Missing authorization code', state);
      }

      return await handleAuthorizationCodeRedirect(code, state || '');
    }

    // Handle POST request (token refresh or get access token)
    const body: SpotifyAuthRequest = await req.json();

    if (body.code) {
      return await exchangeCodeForToken(body.code, body.state || '');
    }

    if (body.refresh_token) {
      return await handleTokenRefresh(body.refresh_token);
    }

    return new Response(
      JSON.stringify({ error: 'Missing code or refresh_token' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return new Response(
      JSON.stringify({ error: 'Authentication failed', details: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function redirectWithToken(
  status: 'success' | 'error',
  message: string,
  state?: string
): Response {
  const params = new URLSearchParams({
    status,
    message,
  });
  if (state) params.append('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      'Location': `${FRONTEND_URL}/spotify/callback?${params.toString()}`,
    },
  });
}

async function handleAuthorizationCodeRedirect(
  code: string,
  state: string
): Promise<Response> {
  try {
    const result = await exchangeSpotifyCode(code);

    if (result.error) {
      return redirectWithToken('error', result.error, state);
    }

    // Return success with token encoded in redirect
    const params = new URLSearchParams({
      status: 'success',
      message: 'authenticated',
      token: result.access_token,
      refresh: result.refresh_token || '',
      expires: String(result.expires_in || 3600),
    });
    if (state) params.append('state', state);

    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${FRONTEND_URL}/spotify/callback?${params.toString()}`,
      },
    });
  } catch (error) {
    console.error('Authorization code handling error:', error);
    return redirectWithToken('error', 'Token exchange failed', state);
  }
}

async function exchangeSpotifyCode(code: string): Promise<any> {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REDIRECT_URI) {
    throw new Error('Spotify credentials not configured');
  }

  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      client_id: SPOTIFY_CLIENT_ID,
      client_secret: SPOTIFY_CLIENT_SECRET,
    }).toString(),
  });

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.text();
    console.error('Spotify token exchange failed:', errorData);
    throw new Error('Failed to exchange code for token');
  }

  return await tokenResponse.json();
}

async function exchangeCodeForToken(
  code: string,
  state: string
): Promise<Response> {
  try {
    const result = await exchangeSpotifyCode(code);

    if (!result.access_token) {
      throw new Error('No access token received');
    }

    return new Response(
      JSON.stringify({
        success: true,
        access_token: result.access_token,
        expires_in: result.expires_in,
        refresh_token: result.refresh_token,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Token exchange error:', error);
    return new Response(
      JSON.stringify({ error: 'Token exchange failed' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

async function handleTokenRefresh(refreshToken: string): Promise<Response> {
  try {
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      throw new Error('Spotify credentials not configured');
    }

    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: SPOTIFY_CLIENT_ID,
        client_secret: SPOTIFY_CLIENT_SECRET,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      throw new Error('Token refresh failed');
    }

    const newTokens = await tokenResponse.json();

    return new Response(
      JSON.stringify({
        access_token: newTokens.access_token,
        expires_in: newTokens.expires_in,
        refresh_token: newTokens.refresh_token || refreshToken,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Token refresh error:', error);
    return new Response(
      JSON.stringify({ error: 'Token refresh failed' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}