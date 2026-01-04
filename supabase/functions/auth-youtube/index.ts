import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
const REDIRECT_URI = Deno.env.get("GOOGLE_REDIRECT_URI");

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

    const { userId: authUserId, code, action } = await req.json();
    console.log("Request params:", { authUserId, hasCode: !!code, action });

    if (action === "callback" && code) {
      console.log("Processing callback for auth user:", authUserId);

      // Get the user_id from users table using auth_user_id
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", authUserId)
        .maybeSingle();

      if (userError || !userData) {
        console.error("User lookup failed:", userError);
        throw new Error(`User not found for auth_user_id: ${authUserId}`);
      }

      const userId = userData.id;
      console.log("Found user_id:", userId);

      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID!,
          client_secret: GOOGLE_CLIENT_SECRET!,
          redirect_uri: REDIRECT_URI!,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("Google token exchange failed:", errorText);
        throw new Error(`Failed to exchange code for tokens: ${errorText}`);
      }

      const tokens = await tokenResponse.json();
      console.log("Got tokens from Google, expires_in:", tokens.expires_in);

      // Upsert the token directly (service role bypasses RLS)
      const { error } = await supabase
        .from("integration_tokens")
        .upsert({
          user_id: userId,
          integration_name: "youtube",
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || null,
          expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,integration_name",
        });

      if (error) {
        console.error("Database upsert error:", JSON.stringify(error, null, 2));
        throw new Error(`Database error: ${error.message}`);
      }

      console.log("Successfully stored tokens for user:", userId);

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // For initial auth URL generation, authUserId is passed
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID!);
    authUrl.searchParams.set("redirect_uri", REDIRECT_URI!);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "https://www.googleapis.com/auth/youtube.readonly");
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");
    authUrl.searchParams.set("state", authUserId);

    return new Response(
      JSON.stringify({ authUrl: authUrl.toString() }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("YouTube auth error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: error instanceof Error ? error.stack : String(error)
      }),
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