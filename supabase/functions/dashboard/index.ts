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

    const dashboard = await getDashboardData(user.id);

    return new Response(
      JSON.stringify(dashboard),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to load dashboard' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getDashboardData(authUserId: string): Promise<any> {
  try {
    // Get user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, display_name, email, last_sync')
      .eq('auth_user_id', authUserId)
      .single();

    if (userError || !userData) {
      throw new Error('User not found');
    }

    const userId = userData.id;
    const today = new Date().toISOString().split('T')[0];

    // Get today's capsule
    const { data: capsule } = await supabase
      .from('insight_capsules')
      .select('*')
      .eq('user_id', userId)
      .eq('capsule_date', today)
      .single();

    // Get today's metrics
    const { data: todayMetrics } = await supabase
      .from('daily_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('metric_date', today);

    // Get last 7 days metrics for trends
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const { data: trendMetrics } = await supabase
      .from('daily_metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('metric_date', sevenDaysAgoStr)
      .order('metric_date', { ascending: true });

    // Organize trends by metric name
    const trends: { [key: string]: any[] } = {};
    (trendMetrics || []).forEach((metric) => {
      if (!trends[metric.metric_name]) {
        trends[metric.metric_name] = [];
      }
      trends[metric.metric_name].push({
        date: metric.metric_date,
        value: metric.value,
      });
    });

    return {
      user: userData,
      capsule: capsule || null,
      metrics: todayMetrics || [],
      trends: trends,
      last_updated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Dashboard data error:', error);
    throw error;
  }
}
