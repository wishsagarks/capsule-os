import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

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

    const capsule = await generateCapsule(user.id);

    return new Response(
      JSON.stringify(capsule),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Capsule generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Capsule generation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateCapsule(authUserId: string): Promise<any> {
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
    const today = new Date().toISOString().split('T')[0];

    // Check if capsule already exists for today
    const { data: existingCapsule } = await supabase
      .from('insight_capsules')
      .select('*')
      .eq('user_id', userId)
      .eq('capsule_date', today)
      .single();

    if (existingCapsule) {
      return existingCapsule;
    }

    // Get today's metrics
    const { data: metricsData, error: metricsError } = await supabase
      .from('daily_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('metric_date', today);

    if (metricsError || !metricsData || metricsData.length === 0) {
      // No activity today, return quiet day template
      const quietCapsule = {
        user_id: userId,
        capsule_date: today,
        personality_label: 'Taking a Break',
        behavioral_insights: [
          {
            insight_text: 'No listening activity today',
            source_metrics: [],
            confidence: 1.0,
            insight_type: 'status',
          },
        ],
        trend_explanation: 'Quiet day - perfect for recharging',
        shareable_summary: "Today was a music-free day. Sometimes silence speaks louder.",
        generation_method: 'template',
        confidence_score: 1.0,
      };

      const { data: capsule } = await supabase
        .from('insight_capsules')
        .insert(quietCapsule)
        .select()
        .single();

      return capsule;
    }

    // Get historical averages (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const { data: historicalMetrics } = await supabase
      .from('daily_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('integration_name', 'spotify')
      .gte('metric_date', thirtyDaysAgoStr);

    // Prepare context for LLM
    const context = prepareContext(metricsData, historicalMetrics || []);

    // Generate insight using Gemini
    const insight = await generateWithGemini(context);

    // Store capsule
    const capsule = {
      user_id: userId,
      capsule_date: today,
      personality_label: insight.personality_label,
      behavioral_insights: insight.behavioral_insights,
      trend_explanation: insight.trend_explanation,
      shareable_summary: insight.shareable_summary,
      generation_method: 'llm',
      llm_provider: 'gemini',
      prompt_version: 'v1.0',
      confidence_score: 0.85,
    };

    const { data: storedCapsule } = await supabase
      .from('insight_capsules')
      .insert(capsule)
      .select()
      .single();

    return storedCapsule;
  } catch (error) {
    console.error('Capsule generation error:', error);
    throw error;
  }
}

interface Metric {
  metric_name: string;
  value: number;
  unit: string;
  confidence: number;
}

interface Context {
  current_metrics: { [key: string]: number };
  historical_averages: { [key: string]: number };
  deviations: { [key: string]: number };
}

function prepareContext(todayMetrics: Metric[], historicalMetrics: Metric[]): Context {
  const context: Context = {
    current_metrics: {},
    historical_averages: {},
    deviations: {},
  };

  // Group by metric name
  const metricsByName: { [key: string]: Metric[] } = {};
  todayMetrics.forEach((m) => {
    if (!metricsByName[m.metric_name]) {
      metricsByName[m.metric_name] = [];
    }
    metricsByName[m.metric_name].push(m);
  });

  historicalMetrics.forEach((m) => {
    if (!metricsByName[m.metric_name]) {
      metricsByName[m.metric_name] = [];
    }
    metricsByName[m.metric_name].push(m);
  });

  // Compute averages and deviations
  Object.entries(metricsByName).forEach(([name, metrics]) => {
    if (metrics.length > 0) {
      const avg = metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
      const todayValue = todayMetrics.find((m) => m.metric_name === name)?.value || 0;

      context.current_metrics[name] = todayValue;
      context.historical_averages[name] = avg;
      context.deviations[name] = avg > 0 ? (todayValue - avg) / avg : 0;
    }
  });

  return context;
}

async function generateWithGemini(context: Context): Promise<any> {
  const prompt = `
You are a personal music intelligence assistant. Analyze the following listening metrics for today and provide brief, insightful observations.

Metrics:
${JSON.stringify(context.current_metrics, null, 2)}

Historical Averages (30 days):
${JSON.stringify(context.historical_averages, null, 2)}

Provide a JSON response with:
1. personality_label (2-4 words describing today's listening personality)
2. behavioral_insights (array of 3 strings, each insight about today's listening)
3. trend_explanation (1 sentence about trending patterns)
4. shareable_summary (1-liner suitable for sharing)

Be concise, data-driven, and insightful.
`;

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY!,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
            topP: 0.8,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', response.status);
      return generateTemplateInsight(context);
    }

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        personality_label: parsed.personality_label || 'Eclectic Listener',
        behavioral_insights: [
          {
            insight_text: parsed.behavioral_insights[0] || 'Diverse listening taste',
            source_metrics: Object.keys(context.current_metrics),
            confidence: 0.8,
            insight_type: 'behavioral',
          },
          {
            insight_text: parsed.behavioral_insights[1] || 'Exploring new music',
            source_metrics: Object.keys(context.current_metrics),
            confidence: 0.8,
            insight_type: 'behavioral',
          },
          {
            insight_text: parsed.behavioral_insights[2] || 'Consistent listening patterns',
            source_metrics: Object.keys(context.current_metrics),
            confidence: 0.8,
            insight_type: 'behavioral',
          },
        ],
        trend_explanation: parsed.trend_explanation || 'Your taste continues to evolve',
        shareable_summary: parsed.shareable_summary || 'Today, music was my companion.',
      };
    }

    return generateTemplateInsight(context);
  } catch (error) {
    console.error('Gemini generation error:', error);
    return generateTemplateInsight(context);
  }
}

function generateTemplateInsight(context: Context): any {
  const discoveryRatio = context.current_metrics['discovery_ratio'] || 0;
  const avgPopularity = context.current_metrics['avg_artist_popularity'] || 50;
  const genreDiversity = context.current_metrics['genre_diversity'] || 5;

  let label = 'Balanced Explorer';
  if (discoveryRatio > 0.3) {
    label = 'Discovery Mode';
  } else if (discoveryRatio < 0.1) {
    label = 'Loyal Listener';
  }

  if (avgPopularity > 70) {
    label = `${label} (Mainstream)`;
  } else if (avgPopularity < 40) {
    label = `${label} (Indie)`;
  }

  return {
    personality_label: label,
    behavioral_insights: [
      `Discovery ratio at ${(discoveryRatio * 100).toFixed(0)}% - ${discoveryRatio > 0.3 ? 'actively exploring' : 'sticking with favorites'}`,
      `Artist popularity trending at ${avgPopularity.toFixed(0)} - ${avgPopularity > 70 ? 'mainstream preferences' : 'exploring indie artists'}`,
      `Genre diversity: ${genreDiversity} unique genres discovered`,
    ],
    trend_explanation: 'Your listening patterns reflect a blend of familiar favorites and new discoveries.',
    shareable_summary: 'Today was a good day for music.',
  };
}
