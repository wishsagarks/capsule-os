# Google OAuth Setup Guide

To enable Google Sign-In for CapsuleOS, you need to configure Google OAuth in your Supabase project.

## Step 1: Configure Supabase Email Authentication

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** > **Providers** > **Email**
4. **IMPORTANT**: Disable "Confirm email" option
   - This allows users to sign in immediately without email verification
5. Save the configuration

## Step 2: Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if you haven't already:
   - Choose "External" user type
   - Fill in application name: "CapsuleOS"
   - Add your email as support email
   - Add authorized domains (if deploying)
6. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: "CapsuleOS"
   - Authorized redirect URIs: Add your Supabase callback URL:
     ```
     https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
     ```
7. Copy the **Client ID** and **Client Secret**

## Step 3: Configure Supabase Google Provider

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** > **Providers**
4. Find **Google** in the list and click to enable it
5. Paste your **Client ID** and **Client Secret** from Google Cloud Console
6. Save the configuration

## Step 4: Update Redirect URLs (if needed)

If you're deploying to a custom domain, make sure to:

1. Add your custom domain to authorized redirect URIs in Google Cloud Console
2. Update the `redirectTo` parameter in the code if necessary

## Step 5: Test the Integration

### Testing Email/Password Authentication:
1. Run your application
2. Click "Sign In" on the landing page
3. Click "DON'T HAVE AN ACCOUNT? SIGN UP"
4. Enter your email and password
5. Click "CREATE ACCOUNT"
6. You should be able to sign in immediately (no email confirmation required)

### Testing Google Authentication:
1. Run your application
2. Click "Sign In" on the landing page
3. Click "SIGN IN WITH GOOGLE"
4. Complete the Google authentication flow
5. You should be redirected to the Spotify setup page

## Troubleshooting

- **Error: redirect_uri_mismatch**: Make sure the redirect URI in Google Cloud Console exactly matches your Supabase callback URL
- **Error: Access denied**: Check that the OAuth consent screen is properly configured
- **No redirect after sign-in**: Verify the `redirectTo` parameter matches your application URL

## Security Notes

- Never commit your Google Client Secret to version control
- Use environment variables for sensitive configuration
- Regularly review authorized domains and redirect URIs
- Monitor OAuth usage in Google Cloud Console
