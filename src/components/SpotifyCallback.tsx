import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { callEdgeFunction } from '../lib/api';
import { useTheme } from '../contexts/ThemeContext';

export function SpotifyCallback() {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const status = params.get('status');
        const message = params.get('message');
        const token = params.get('token');
        const refreshToken = params.get('refresh');

        console.log('Callback received:', { status, hasToken: !!token, hasRefresh: !!refreshToken });

        // Handle error from edge function redirect
        if (status === 'error') {
          throw new Error(message || 'Spotify authorization failed');
        }

        // Check if token was already exchanged by edge function
        if (status === 'success' && token) {
          // Store Spotify tokens in localStorage
          localStorage.setItem('spotify_token', token);
          if (refreshToken) {
            localStorage.setItem('spotify_refresh_token', refreshToken);
          }

          console.log('Tokens stored, checking Supabase auth...');

          // Try to get current authenticated user
          const { data: { user } } = await supabase.auth.getUser();

          console.log('Supabase user:', user ? 'authenticated' : 'not authenticated');

          if (user) {
            // User is authenticated with Supabase, go to dashboard
            console.log('Navigating to dashboard...');

            // Start sync in background, don't wait for it
            const sessionToken = (await supabase.auth.getSession()).data.session?.access_token;
            if (sessionToken) {
              Promise.all([
                callEdgeFunction('spotify-sync', { token: sessionToken }),
                callEdgeFunction('generate-capsule', { token: sessionToken }),
              ]).catch((syncError) => {
                console.warn('Background sync failed:', syncError);
              });
            }

            navigate('/dashboard');
          } else {
            // User not authenticated with Supabase, go to Spotify Analytics demo
            console.log('Navigating to spotify-analytics...');
            navigate('/spotify-analytics');
          }
        } else {
          throw new Error('Invalid callback state');
        }
      } catch (err) {
        console.error('Callback error:', err);
        setError(err instanceof Error ? err.message : 'Callback error');
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <div className="border-4 rounded-2xl p-8 max-w-md text-center" style={{ borderColor: currentTheme.colors.border, backgroundColor: currentTheme.colors.surface }}>
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-2xl font-black tracking-widest mb-4">CONNECTION FAILED</h2>
          <p style={{ color: currentTheme.colors.textSecondary }} className="mb-6">
            {error}
          </p>
          <button
            onClick={() => navigate('/know-yourself')}
            className="px-6 py-3 border-2 rounded-lg font-black tracking-widest"
            style={{
              backgroundColor: currentTheme.colors.primary,
              borderColor: currentTheme.colors.border,
              color: '#000000',
            }}
          >
            TRY AGAIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: currentTheme.colors.background }}
    >
      <div className="text-center">
        <div className="inline-block p-6 mb-6 rounded-2xl" style={{ backgroundColor: currentTheme.colors.surface }}>
          <Loader
            className="w-12 h-12 animate-spin"
            style={{ color: currentTheme.colors.primary }}
          />
        </div>
        <p className="text-xl font-black tracking-widest" style={{ color: currentTheme.colors.primary }}>
          CONNECTING TO SPOTIFY...
        </p>
      </div>
    </div>
  );
}
