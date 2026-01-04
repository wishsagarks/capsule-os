import { useState, useEffect } from 'react';
import { Youtube, Loader } from 'lucide-react';
import { youtubeClient } from '../lib/youtube';
import { useAuth } from '../contexts/AuthContext';

export default function YouTubeConnect({ onConnected }: { onConnected?: () => void }) {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    checkYouTubeConnection();
  }, []);

  const checkYouTubeConnection = async () => {
    if (!session?.user?.id) return;

    try {
      const isConnected = await youtubeClient.isConnected(session.user.id);
      setConnected(isConnected);
    } catch (err) {
      console.error('Error checking YouTube connection:', err);
    }
  };

  const handleYouTubeAuth = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    setError('');

    try {
      const authUrl = await youtubeClient.getAuthUrl(session.user.id);
      window.location.href = authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start authentication');
      setLoading(false);
    }
  };

  if (connected) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Youtube className="w-6 h-6 text-red-600" />
          <h3 className="font-semibold text-red-900">YouTube Connected</h3>
        </div>
        <p className="text-red-700 text-sm mb-4">
          Your YouTube account is connected. CapsuleOS is analyzing your content patterns.
        </p>
        <button
          onClick={onConnected}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <Youtube className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect YouTube</h2>
        <p className="text-gray-600">
          Link your YouTube account to get personalized insights about your content consumption
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleYouTubeAuth}
        disabled={loading}
        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:shadow-lg disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-3 transition"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Youtube className="w-5 h-5" />
            Connect with YouTube
          </>
        )}
      </button>

      <p className="text-gray-500 text-xs text-center mt-6">
        We use your YouTube data securely and never share it. Only aggregated metrics
        are stored for analysis.
      </p>
    </div>
  );
}
