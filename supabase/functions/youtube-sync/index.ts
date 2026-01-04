import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresAt: string }> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
      client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh access token");
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
  };
}

async function getValidAccessToken(
  supabase: any,
  userId: string
): Promise<string> {
  const { data: tokenData, error } = await supabase
    .from("integration_tokens")
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", userId)
    .eq("integration_name", "youtube")
    .maybeSingle();

  if (error || !tokenData) {
    throw new Error("No YouTube integration found");
  }

  const expiresAt = new Date(tokenData.expires_at);
  const now = new Date();

  if (expiresAt > now) {
    return tokenData.access_token;
  }

  const { accessToken, expiresAt: newExpiresAt } = await refreshAccessToken(
    tokenData.refresh_token
  );

  await supabase
    .from("integration_tokens")
    .update({
      access_token: accessToken,
      expires_at: newExpiresAt,
    })
    .eq("user_id", userId)
    .eq("integration_name", "youtube");

  return accessToken;
}

async function fetchSubscriptions(accessToken: string) {
  const url = `${YOUTUBE_API_BASE}/subscriptions?part=snippet&mine=true&maxResults=50`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch subscriptions");
  }

  const data = await response.json();
  return data.items || [];
}

async function fetchLikedVideos(accessToken: string) {
  const playlistUrl = `${YOUTUBE_API_BASE}/channels?part=contentDetails&mine=true`;
  const channelResponse = await fetch(playlistUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!channelResponse.ok) {
    return [];
  }

  const channelData = await channelResponse.json();
  const likedPlaylistId =
    channelData.items?.[0]?.contentDetails?.relatedPlaylists?.likes;

  if (!likedPlaylistId) {
    return [];
  }

  const videosUrl = `${YOUTUBE_API_BASE}/playlistItems?part=snippet&playlistId=${likedPlaylistId}&maxResults=50`;
  const videosResponse = await fetch(videosUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!videosResponse.ok) {
    return [];
  }

  const videosData = await videosResponse.json();
  return videosData.items || [];
}

async function fetchVideoDetails(accessToken: string, videoIds: string[]) {
  if (videoIds.length === 0) return [];

  const url = `${YOUTUBE_API_BASE}/videos?part=snippet,contentDetails,statistics&id=${videoIds.join(",")}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.items || [];
}

function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");

  return hours * 3600 + minutes * 60 + seconds;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { userId } = await req.json();

    if (!userId) {
      throw new Error("userId is required");
    }

    const accessToken = await getValidAccessToken(supabase, userId);

    let quotaUsed = 0;
    const operations: string[] = [];

    const subscriptions = await fetchSubscriptions(accessToken);
    quotaUsed += 1;
    operations.push("subscriptions");

    for (const sub of subscriptions) {
      await supabase.from("youtube_subscriptions").upsert(
        {
          user_id: userId,
          channel_id: sub.snippet.resourceId.channelId,
          channel_title: sub.snippet.title,
          subscribed_at: sub.snippet.publishedAt,
          last_interaction_at: new Date().toISOString(),
          interaction_count: 0,
        },
        { onConflict: "user_id,channel_id" }
      );
    }

    const likedVideos = await fetchLikedVideos(accessToken);
    quotaUsed += 2;
    operations.push("liked_videos");

    const videoIds = likedVideos
      .slice(0, 50)
      .map((item: any) => item.snippet.resourceId.videoId);

    if (videoIds.length > 0) {
      const videoDetails = await fetchVideoDetails(accessToken, videoIds);
      quotaUsed += 1;
      operations.push("video_details");

      for (const video of videoDetails) {
        await supabase.from("youtube_videos").upsert(
          {
            video_id: video.id,
            title: video.snippet.title,
            channel_id: video.snippet.channelId,
            channel_title: video.snippet.channelTitle,
            duration_seconds: parseDuration(video.contentDetails.duration),
            category: video.snippet.categoryId,
            published_at: video.snippet.publishedAt,
            metadata: {
              viewCount: video.statistics.viewCount,
              likeCount: video.statistics.likeCount,
              tags: video.snippet.tags || [],
            },
          },
          { onConflict: "video_id" }
        );

        await supabase.from("youtube_interactions").insert({
          user_id: userId,
          video_id: video.id,
          interaction_type: "liked",
          interaction_at: new Date().toISOString(),
        });

        const { data: existingSub } = await supabase
          .from("youtube_subscriptions")
          .select("interaction_count")
          .eq("user_id", userId)
          .eq("channel_id", video.snippet.channelId)
          .maybeSingle();

        if (existingSub) {
          await supabase
            .from("youtube_subscriptions")
            .update({
              interaction_count: (existingSub.interaction_count || 0) + 1,
              last_interaction_at: new Date().toISOString(),
            })
            .eq("user_id", userId)
            .eq("channel_id", video.snippet.channelId);
        }
      }
    }

    const today = new Date().toISOString().split("T")[0];
    await supabase.from("youtube_quota_usage").upsert(
      {
        user_id: userId,
        date: today,
        quota_used: quotaUsed,
        operations_performed: operations,
      },
      { onConflict: "user_id,date" }
    );

    return new Response(
      JSON.stringify({
        success: true,
        subscriptionsCount: subscriptions.length,
        likedVideosCount: likedVideos.length,
        quotaUsed,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("YouTube sync error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});