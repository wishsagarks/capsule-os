# YouTube OAuth Setup Guide

This guide will help you set up Google OAuth for YouTube integration with CapsuleOS.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on "Select a project" dropdown at the top
3. Click "NEW PROJECT"
4. Enter project name: `CapsuleOS-YouTube`
5. Click "CREATE"

## Step 2: Enable YouTube Data API v3

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "YouTube Data API v3"
3. Click on it and then click "ENABLE"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (unless you have a Google Workspace)
3. Click "CREATE"
4. Fill in the required fields:
   - App name: `CapsuleOS`
   - User support email: Your email
   - Developer contact information: Your email
5. Click "SAVE AND CONTINUE"
6. On the "Scopes" page:
   - Click "ADD OR REMOVE SCOPES"
   - Find and select: `YouTube Data API v3` → `.../auth/youtube.readonly`
   - Click "UPDATE" then "SAVE AND CONTINUE"
7. On "Test users" page (if in testing mode):
   - Add your email address as a test user
   - Click "SAVE AND CONTINUE"
8. Review and click "BACK TO DASHBOARD"

## Step 4: Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "CREATE CREDENTIALS" > "OAuth client ID"
3. Select "Web application"
4. Enter name: `CapsuleOS YouTube Client`
5. Add Authorized redirect URIs:
   - For development: `http://localhost:5173/youtube/callback`
   - For production: `https://your-domain.com/youtube/callback`
6. Click "CREATE"
7. Copy your **Client ID** and **Client Secret**

## Step 5: Configure Environment Variables

### For Local Development

Add to your `.env` file:

```bash
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:5173/youtube/callback
```

### For Supabase Edge Functions

The edge functions need these secrets configured in your Supabase project:

1. Go to your Supabase project dashboard
2. Navigate to "Project Settings" > "Edge Functions"
3. Add the following secrets:
   - `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret
   - `GOOGLE_REDIRECT_URI`: Your callback URL (production URL for deployed functions)

You can also set these via Supabase CLI:

```bash
supabase secrets set GOOGLE_CLIENT_ID=your-client-id
supabase secrets set GOOGLE_CLIENT_SECRET=your-client-secret
supabase secrets set GOOGLE_REDIRECT_URI=https://your-domain.com/youtube/callback
```

## Step 6: Update Redirect URIs for Production

When deploying to production:

1. Go back to Google Cloud Console > "APIs & Services" > "Credentials"
2. Click on your OAuth client
3. Add your production redirect URI to "Authorized redirect URIs":
   - `https://your-production-domain.com/youtube/callback`
4. Update the `GOOGLE_REDIRECT_URI` in your production environment variables

## Step 7: Publish Your OAuth App (Optional)

If you want to make your app available to all users:

1. Go to "OAuth consent screen"
2. Click "PUBLISH APP"
3. Complete Google's verification process (may take several days)

**Note**: While in testing mode, only added test users can authenticate. This is fine for personal use.

## Scope Information

CapsuleOS uses the following OAuth scope:

- `https://www.googleapis.com/auth/youtube.readonly`
  - Allows read-only access to:
    - User's subscriptions
    - Liked videos (via playlist API)
    - User's playlists
    - Public video metadata

**Privacy Note**: CapsuleOS does NOT access:
- Watch history
- YouTube Analytics data
- Private user information
- Any data that requires write permissions

## Quota Management

YouTube Data API has a free tier quota of 10,000 units per day. CapsuleOS is designed to:

- Use approximately 100-150 units per user sync
- Support 50-75 users per day comfortably
- Implement graceful degradation when approaching quota limits
- Cache data to minimize API calls

## Troubleshooting

### "Access blocked: This app's request is invalid"

- Make sure you've enabled the YouTube Data API v3
- Verify your redirect URI exactly matches what's configured in Google Cloud Console
- Check that you're using the correct client ID and secret

### "The OAuth client was not found"

- Verify your `GOOGLE_CLIENT_ID` is correct
- Make sure you're using the Web application client ID, not any other type

### "redirect_uri_mismatch"

- The redirect URI in your code must exactly match one configured in Google Cloud Console
- Include the protocol (`http://` or `https://`)
- No trailing slashes

### Quota Exceeded

- Check your API usage in Google Cloud Console
- Implement longer caching periods
- Consider requesting a quota increase from Google

## Testing

1. Start your development server
2. Navigate to the Setup page
3. Click "Connect YouTube"
4. Authorize the application
5. You should be redirected back with a successful connection

## Security Best Practices

1. Never commit your `.env` file to version control
2. Use different OAuth clients for development and production
3. Regularly rotate your client secrets
4. Monitor API usage in Google Cloud Console
5. Keep your dependencies updated

## Additional Resources

- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [YouTube API Quota Calculator](https://developers.google.com/youtube/v3/determine_quota_cost)
