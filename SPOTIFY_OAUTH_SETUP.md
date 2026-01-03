# Spotify OAuth Setup Guide

This guide explains how to configure Spotify OAuth for CapsuleOS. This project uses **Supabase Edge Functions** (not FastAPI).

## Architecture Overview

```
Frontend (React/Vite)
    ↓ Initiates OAuth
Spotify OAuth Server
    ↓ Redirects with code
Frontend (/spotify/callback)
    ↓ Sends code to edge function
Supabase Edge Function (auth-spotify)
    ↓ Exchanges code for tokens
Supabase Database
```

## Step 1: Create Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click **Create App**
4. Fill in the details:
   - **App Name**: CapsuleOS
   - **App Description**: Personal Intelligence Platform
   - **Website**: `http://localhost:5173` (for development)
   - **Redirect URI**: `http://localhost:5173/spotify/callback`
5. Accept the Terms of Service
6. Click **Create**
7. Copy your **Client ID** and **Client Secret**

## Step 2: Configure Environment Variables

### Frontend (.env)

Update your `.env` file:

```env
VITE_SPOTIFY_CLIENT_ID=your-client-id-from-step-1
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/spotify/callback
```

## Step 3: Configure Supabase Edge Function Secrets

Your Spotify credentials need to be available to the edge function. Set these in your Supabase dashboard:

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Edge Functions** > **Manage Secrets**
4. Add the following secrets:
   - `SPOTIFY_CLIENT_ID`: Your client ID from Step 1
   - `SPOTIFY_CLIENT_SECRET`: Your client secret from Step 1
   - `SPOTIFY_REDIRECT_URI`: `http://localhost:5173/spotify/callback`

## Step 4: Local Development with ngrok (Optional)

If you want to test OAuth locally with a public URL:

### Install ngrok

Download from: https://ngrok.com/download

### Expose Local Development Server

```bash
# In terminal 1: Start your dev server (already running automatically)
# The dev server runs on http://localhost:5173

# In terminal 2: Start ngrok
ngrok http 5173
```

ngrok will give you a public URL like:
```
https://abcd-1234-5678.ngrok-free.app
```

### Update Redirect URIs

1. **In Spotify Dashboard**:
   - Add new redirect URI: `https://abcd-1234-5678.ngrok-free.app/spotify/callback`
   - Save changes

2. **In your .env file**:
   ```env
   VITE_SPOTIFY_REDIRECT_URI=https://abcd-1234-5678.ngrok-free.app/spotify/callback
   ```

3. **In Supabase Edge Function Secrets**:
   - Update `SPOTIFY_REDIRECT_URI` to: `https://abcd-1234-5678.ngrok-free.app/spotify/callback`

4. **Restart your dev server** to pick up the new environment variable

5. **Access your app via the ngrok URL**:
   - Open `https://abcd-1234-5678.ngrok-free.app` in your browser
   - The OAuth flow will now work with the public URL

### Important Notes for ngrok

- ngrok URLs change every time you restart ngrok (unless you have a paid account)
- You'll need to update the redirect URI each time you get a new ngrok URL
- For production deployment, use your actual domain instead

## Step 5: Production Deployment

When deploying to production:

1. **Update Spotify App Settings**:
   - Add your production domain redirect URI: `https://yourdomain.com/spotify/callback`

2. **Update Environment Variables**:
   ```env
   VITE_SPOTIFY_REDIRECT_URI=https://yourdomain.com/spotify/callback
   ```

3. **Update Supabase Secrets**:
   - Update `SPOTIFY_REDIRECT_URI` to your production URL

## Step 6: Test the Integration

1. Start your development server
2. Navigate to the dashboard
3. Look for the "Connect Spotify" button
4. Click it to initiate OAuth flow
5. Log in to Spotify and authorize the app
6. You should be redirected back to `/spotify/callback`
7. The callback will exchange the code for tokens and redirect to dashboard

## OAuth Flow Details

### What Happens During OAuth:

1. **User clicks "Connect Spotify"** → `SpotifyConnect.tsx:35`
   - Generates random state for CSRF protection
   - Redirects to Spotify authorization page

2. **User authorizes on Spotify** → Spotify server
   - User logs in and grants permissions
   - Spotify redirects back with authorization code

3. **Callback receives code** → `SpotifyCallback.tsx:12`
   - Verifies state matches (CSRF protection)
   - Sends code to edge function

4. **Edge function exchanges code** → `auth-spotify/index.ts:61`
   - Calls Spotify token endpoint
   - Receives access token and refresh token
   - Stores encrypted tokens in database

5. **User data synced** → Dashboard loaded
   - Initial sync triggers
   - Metrics computed
   - Dashboard displays insights

## Scopes Required

The app requests these Spotify scopes:
- `user-read-private`: Read user profile data
- `user-top-read`: Read top artists and tracks
- `user-read-recently-played`: Read recently played tracks

These are the minimum scopes needed for behavioral analysis.

## Troubleshooting

### Error: "Invalid redirect URI"
- Ensure the redirect URI in Spotify dashboard exactly matches `VITE_SPOTIFY_REDIRECT_URI`
- Check for trailing slashes (shouldn't have one)
- Verify the protocol (http vs https)

### Error: "State mismatch"
- This is CSRF protection working correctly
- Clear your browser's session storage and try again

### Error: "Edge function not found"
- Ensure edge functions are deployed to Supabase
- Check edge function logs in Supabase dashboard

### Error: "Failed to exchange code"
- Verify `SPOTIFY_CLIENT_SECRET` is set in Supabase secrets
- Check that the secret is correct (no extra spaces)
- Ensure `SPOTIFY_REDIRECT_URI` in Supabase matches exactly

### Tokens not being stored
- Check Supabase database has `integration_tokens` table
- Verify RLS policies allow the user to insert tokens
- Check edge function logs for errors

## Security Best Practices

- Never commit `.env` to version control (already in `.gitignore`)
- Use environment variables for all secrets
- Rotate client secrets regularly
- Monitor token usage in Spotify dashboard
- Keep dependencies updated

## Common Questions

### Do I need FastAPI or uvicorn?
No. This project uses Supabase Edge Functions, not FastAPI.

### Where are the tokens stored?
Tokens are stored encrypted in the Supabase `integration_tokens` table with RLS policies ensuring users can only access their own tokens.

### How often are tokens refreshed?
Tokens are refreshed automatically when they expire (typically after 1 hour). The edge function handles this transparently.

### Can I test without ngrok?
Yes. For local development, use `http://localhost:5173/spotify/callback` directly. ngrok is only needed if you want a public URL for testing.

## Summary

**Your VITE_SPOTIFY_REDIRECT_URI should be:**

- Local: `http://localhost:5173/spotify/callback`
- ngrok: `https://your-ngrok-url.ngrok-free.app/spotify/callback`
- Production: `https://yourdomain.com/spotify/callback`

This is the **frontend URL**, not an edge function URL. The frontend receives the OAuth code and sends it to the edge function for processing.
