import { supabase } from './supabase';

export interface YouTubeChannel {
  id: string;
  title: string;
  thumbnail?: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  channelId: string;
  channelTitle: string;
  thumbnail?: string;
  duration: number;
  category?: string;
  publishedAt?: string;
}

export interface YouTubeSubscription {
  channelId: string;
  channelTitle: string;
  subscribedAt?: string;
  lastInteractionAt?: string;
  interactionCount: number;
  isDecayed: boolean;
}

export interface YouTubeInteraction {
  videoId: string;
  interactionType: 'liked' | 'playlist_add' | 'subscription';
  interactionAt: string;
  playlistId?: string;
}

export interface ContentIdentity {
  type: 'Explorer' | 'Specialist' | 'Escapist' | 'Optimizer';
  confidence: number;
  description: string;
}

export interface IntellectualDiet {
  learning: number;
  news: number;
  entertainment: number;
  motivation: number;
}

export interface YouTubeAnalytics {
  contentIdentity: ContentIdentity;
  intellectualDiet: IntellectualDiet;
  subscriptionHealth: {
    utilization: number;
    decayedCount: number;
    topicDiversity: number;
  };
  temporalPatterns: {
    peakHours: number[];
    weekdayVsWeekend: { weekday: number; weekend: number };
    sessionStyle: 'Binge' | 'Casual' | 'Focused';
  };
  contentDepth: {
    shortsRatio: number;
    avgDuration: number;
    explorationIndex: number;
  };
}

export class YouTubeClient {
  async getAuthUrl(userId: string): Promise<string> {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-youtube`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get YouTube auth URL');
    }

    const { authUrl } = await response.json();
    return authUrl;
  }

  async handleCallback(code: string, userId: string): Promise<void> {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-youtube`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, userId, action: 'callback' }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('YouTube callback error:', errorText);
      throw new Error(`Failed to complete YouTube authentication: ${errorText}`);
    }
  }

  async isConnected(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('integration_tokens')
      .select('id')
      .eq('user_id', userId)
      .eq('integration_name', 'youtube')
      .maybeSingle();

    return !error && !!data;
  }

  async disconnect(userId: string): Promise<void> {
    const { error } = await supabase
      .from('integration_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('integration_name', 'youtube');

    if (error) {
      throw new Error('Failed to disconnect YouTube');
    }
  }

  async syncData(userId: string): Promise<void> {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/youtube-sync`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to sync YouTube data');
    }
  }

  async getSubscriptions(userId: string): Promise<YouTubeSubscription[]> {
    const { data, error } = await supabase
      .from('youtube_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('interaction_count', { ascending: false });

    if (error) {
      throw error;
    }

    return data.map(sub => ({
      channelId: sub.channel_id,
      channelTitle: sub.channel_title,
      subscribedAt: sub.subscribed_at,
      lastInteractionAt: sub.last_interaction_at,
      interactionCount: sub.interaction_count,
      isDecayed: sub.is_decayed,
    }));
  }

  async getRecentInteractions(userId: string, limit = 50): Promise<YouTubeInteraction[]> {
    const { data, error } = await supabase
      .from('youtube_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('interaction_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data.map(interaction => ({
      videoId: interaction.video_id,
      interactionType: interaction.interaction_type,
      interactionAt: interaction.interaction_at,
      playlistId: interaction.playlist_id,
    }));
  }

  async getAnalytics(userId: string): Promise<YouTubeAnalytics | null> {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/youtube-analytics?userId=${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  }

  async getQuotaUsage(userId: string): Promise<{ used: number; limit: number; percentage: number }> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('youtube_quota_usage')
      .select('quota_used')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    const used = data?.quota_used || 0;
    const limit = 10000;

    return {
      used,
      limit,
      percentage: (used / limit) * 100,
    };
  }
}

export const youtubeClient = new YouTubeClient();
