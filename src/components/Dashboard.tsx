import { useState, useEffect } from 'react';
import { Music, Youtube, TrendingUp, LogOut, Loader, RefreshCw, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { callEdgeFunction } from '../lib/api';
import { InsightCapsule } from './InsightCapsule';
import SpotifyAnalytics from './SpotifyAnalytics';
import YouTubeAnalytics from './YouTubeAnalytics';
import { spotifyClient } from '../lib/spotify';
import { youtubeClient } from '../lib/youtube';

interface DashboardData {
  user: {
    display_name: string;
    email: string;
    last_sync: string;
  };
  capsule: any | null;
  metrics: any[];
  trends: { [key: string]: any[] };
}

export function Dashboard() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'spotify' | 'youtube'>('spotify');
  const [hasSpotify, setHasSpotify] = useState(false);
  const [hasYouTube, setHasYouTube] = useState(false);

  useEffect(() => {
    if (session) {
      checkIntegrations();
      loadDashboard();
    }
  }, [session]);

  const checkIntegrations = async () => {
    if (!session?.user?.id) return;

    try {
      const [spotify, youtube] = await Promise.all([
        spotifyClient.isConnected(session.user.id),
        youtubeClient.isConnected(session.user.id),
      ]);

      setHasSpotify(spotify);
      setHasYouTube(youtube);

      if (!spotify && youtube) {
        setActiveTab('youtube');
      }
    } catch (err) {
      console.error('Failed to check integrations:', err);
    }
  };

  const loadDashboard = async () => {
    if (!session) return;
    setLoading(true);
    setError('');

    try {
      const dashboard = await callEdgeFunction('dashboard', {
        token: session.access_token,
      });
      setData(dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!session) return;
    setSyncing(true);
    setError('');

    try {
      if (activeTab === 'spotify' && hasSpotify) {
        await callEdgeFunction('spotify-sync', {
          token: session.access_token,
        });
      } else if (activeTab === 'youtube' && hasYouTube) {
        await youtubeClient.syncData(session.user.id);
      }

      await callEdgeFunction('generate-capsule', {
        token: session.access_token,
      });

      await loadDashboard();
      await checkIntegrations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading your insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Music className="w-8 h-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">CapsuleOS</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/setup')}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync'}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {(hasSpotify || hasYouTube) && (
          <div className="mb-8 flex gap-2 border-b border-slate-700">
            {hasSpotify && (
              <button
                onClick={() => setActiveTab('spotify')}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
                  activeTab === 'spotify'
                    ? 'text-green-400 border-b-2 border-green-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Music className="w-5 h-5" />
                Spotify
              </button>
            )}
            {hasYouTube && (
              <button
                onClick={() => setActiveTab('youtube')}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
                  activeTab === 'youtube'
                    ? 'text-red-400 border-b-2 border-red-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Youtube className="w-5 h-5" />
                YouTube
              </button>
            )}
          </div>
        )}

        {data?.user && (
          <div className="mb-8">
            <p className="text-gray-400 text-sm">
              Welcome, <span className="text-white font-semibold">{data.user.display_name || data.user.email}</span>
            </p>
            {data.user.last_sync && (
              <p className="text-gray-500 text-xs mt-1">
                Last synced: {new Date(data.user.last_sync).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {!hasSpotify && !hasYouTube ? (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-6">No integrations connected yet.</p>
            <button
              onClick={() => navigate('/setup')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Connect Services
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'spotify' && hasSpotify && <SpotifyAnalytics />}
            {activeTab === 'youtube' && hasYouTube && <YouTubeAnalytics />}
          </>
        )}
      </main>
    </div>
  );
}
