import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await syncSpotifyData(user.id);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({ error: 'Sync failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function syncSpotifyData(authUserId: string): Promise<any> {
  try {
    // Get user from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', authUserId)
      .single();

    if (userError || !userData) {
      throw new Error('User not found');
    }

    const userId = userData.id;

    // Get Spotify tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from('integration_tokens')
      .select('access_token_encrypted')
      .eq('user_id', userId)
      .eq('integration_name', 'spotify')
      .single();

    if (tokenError || !tokenData?.access_token_encrypted) {
      throw new Error('No Spotify token found');
    }

    const spotifyAccessToken = tokenData.access_token_encrypted;

    // Fetch Spotify data (short-term, medium-term, long-term)
    const [shortTerm, mediumTerm, longTerm] = await Promise.all([
      fetchSpotifyData(spotifyAccessToken, 'short_term'),
      fetchSpotifyData(spotifyAccessToken, 'medium_term'),
      fetchSpotifyData(spotifyAccessToken, 'long_term'),
    ]);

    // Compute metrics
    const today = new Date().toISOString().split('T')[0];
    const metrics = computeMetrics(shortTerm, mediumTerm, longTerm, today);

    // Store metrics
    for (const metric of metrics) {
      await supabase.from('daily_metrics').upsert(
        {
          user_id: userId,
          metric_date: today,
          integration_name: 'spotify',
          metric_name: metric.metric_name,
          value: metric.value,
          unit: metric.unit,
          confidence: metric.confidence,
          metadata: metric.metadata,
        },
        { onConflict: 'user_id,metric_date,integration_name,metric_name' }
      );
    }

    // Update last_sync timestamp
    await supabase
      .from('users')
      .update({ last_sync: new Date().toISOString() })
      .eq('id', userId);

    return {
      success: true,
      metrics_count: metrics.length,
      synced_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Sync error:', error);
    throw error;
  }
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  played_at?: string;
  audio_features?: { energy: number };
}

interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
}

interface SpotifyData {
  tracks: SpotifyTrack[];
  artists: SpotifyArtist[];
}

async function fetchSpotifyData(
  accessToken: string,
  timeRange: 'short_term' | 'medium_term' | 'long_term'
): Promise<SpotifyData> {
  try {
    const [topTracksRes, topArtistsRes] = await Promise.all([
      fetch(
        `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=50`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      ),
      fetch(
        `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=50`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      ),
    ]);

    if (!topTracksRes.ok || !topArtistsRes.ok) {
      throw new Error('Failed to fetch Spotify data');
    }

    const tracks = await topTracksRes.json();
    const artists = await topArtistsRes.json();

    return {
      tracks: tracks.items || [],
      artists: artists.items || [],
    };
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

interface Metric {
  metric_name: string;
  value: number;
  unit: string;
  confidence: number;
  metadata: Record<string, any>;
}

function computeMetrics(
  shortTerm: SpotifyData,
  mediumTerm: SpotifyData,
  longTerm: SpotifyData,
  date: string
): Metric[] {
  const metrics: Metric[] = [];

  // Discovery ratio: new artists in short-term vs all short-term artists
  const shortTermArtistIds = new Set(shortTerm.artists.map((a) => a.id));
  const longTermArtistIds = new Set(longTerm.artists.map((a) => a.id));
  const newArtists = new Set(
    Array.from(shortTermArtistIds).filter((id) => !longTermArtistIds.has(id))
  );
  const discoveryRatio =
    shortTermArtistIds.size > 0
      ? newArtists.size / shortTermArtistIds.size
      : 0;

  metrics.push({
    metric_name: 'discovery_ratio',
    value: parseFloat(discoveryRatio.toFixed(4)),
    unit: 'ratio',
    confidence: 0.95,
    metadata: {
      new_artists: newArtists.size,
      total_artists: shortTermArtistIds.size,
      data_points: shortTerm.artists.length,
    },
  });

  // Average popularity
  const avgPopularity =
    shortTerm.artists.length > 0
      ? shortTerm.artists.reduce((sum, a) => sum + a.popularity, 0) /
        shortTerm.artists.length
      : 0;

  metrics.push({
    metric_name: 'avg_artist_popularity',
    value: parseFloat(avgPopularity.toFixed(2)),
    unit: 'popularity_score',
    confidence: 0.9,
    metadata: {
      data_points: shortTerm.artists.length,
    },
  });

  // Genre diversity (unique genres)
  const allGenres = new Set<string>();
  shortTerm.artists.forEach((artist) => {
    artist.genres.forEach((genre) => allGenres.add(genre));
  });

  metrics.push({
    metric_name: 'genre_diversity',
    value: allGenres.size,
    unit: 'count',
    confidence: 0.95,
    metadata: {
      unique_genres: allGenres.size,
      sample_genres: Array.from(allGenres).slice(0, 5),
    },
  });

  return metrics;
}
