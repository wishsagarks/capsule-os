import { useState, useEffect } from 'react';
import { Music, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { callEdgeFunction } from '../lib/api';

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

export function SpotifyConnect({ onConnected }: { onConnected: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    checkSpotifyConnection();
  }, []);

  const checkSpotifyConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await supabase
        .from('integration_tokens')
        .select('id')
        .eq('integration_name', 'spotify')
        .maybeSingle();

      setConnected(!!response.data);
    } catch (err) {
      console.error('Error checking connection:', err);
    }
  };

  const handleSpotifyAuth = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const params = new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: SPOTIFY_REDIRECT_URI,
        scope: 'user-read-private user-top-read user-read-recently-played',
        state: user.id,
      });

      window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start authentication');
      setLoading(false);
    }
  };

  if (connected) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Music className="w-6 h-6 text-green-600" />
          <h3 className="font-semibold text-green-900">Spotify Connected</h3>
        </div>
        <p className="text-green-700 text-sm mb-4">
          Your Spotify account is connected. CapsuleOS is analyzing your listening patterns.
        </p>
        <button
          onClick={onConnected}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <Music className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Spotify</h2>
        <p className="text-gray-600">
          Link your Spotify account to get personalized insights about your music taste
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleSpotifyAuth}
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-3 transition"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Music className="w-5 h-5" />
            Connect with Spotify
          </>
        )}
      </button>

      <p className="text-gray-500 text-xs text-center mt-6">
        We use your Spotify data securely and never share it. Only aggregated metrics
        are stored for analysis.
      </p>
    </div>
  );
}
