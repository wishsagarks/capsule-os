import { useEffect, useState } from 'react';
import { Music, Sparkles, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SpotifyConnect } from './SpotifyConnect';
import { supabase } from '../lib/supabase';
import { callEdgeFunction } from '../lib/api';

export function SetupPage({ onSetupComplete }: { onSetupComplete: () => void }) {
  const { session } = useAuth();
  const [hasSpotify, setHasSpotify] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    handleCallback();
  }, [session]);

  const handleCallback = async () => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const errorParam = params.get('error');

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      setLoading(false);
      window.history.replaceState({}, '', '/setup');
      return;
    }

    if (connected === 'true' && session) {
      setSyncing(true);
      try {
        const token = session.access_token;

        await callEdgeFunction('spotify-sync', { token });
        await callEdgeFunction('generate-capsule', { token });

        setHasSpotify(true);
      } catch (err) {
        console.warn('Initial sync failed:', err);
        setHasSpotify(true);
      } finally {
        setSyncing(false);
        setLoading(false);
        window.history.replaceState({}, '', '/setup');
      }
      return;
    }

    checkSetup();
  };

  const checkSetup = async () => {
    if (!session) return;

    try {
      const response = await supabase
        .from('integration_tokens')
        .select('id')
        .eq('integration_name', 'spotify')
        .maybeSingle();

      setHasSpotify(!!response.data);
    } catch (err) {
      console.error('Error checking setup:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <Music className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">CapsuleOS</h1>
          </div>
          <p className="text-gray-400 mt-2">Your personal music intelligence platform</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">What is CapsuleOS?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
              <Sparkles className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Insights</h3>
              <p className="text-gray-400">
                Get daily personality profiles and behavioral insights about your music taste
              </p>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
              <Music className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Spotify Connected</h3>
              <p className="text-gray-400">
                Securely analyze your listening patterns and discover new things about yourself
              </p>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Privacy First</h3>
              <p className="text-gray-400">
                Only aggregated metrics are stored. Your raw listening data is never persisted
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-8">
            <p className="text-red-200 text-center">{error}</p>
          </div>
        )}

        <div className="bg-slate-700/30 rounded-xl border border-slate-600 p-12">
          {loading || syncing ? (
            <div className="text-center">
              <Loader className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-300">
                {syncing ? 'Syncing your Spotify data...' : 'Loading...'}
              </p>
            </div>
          ) : hasSpotify ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Music className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Spotify Connected!</h3>
              <p className="text-gray-400 mb-8">Your account is all set up. Let's explore your insights.</p>
              <button
                onClick={onSetupComplete}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg text-white font-semibold py-3 px-8 rounded-lg transition"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div>
              <h3 className="text-2xl font-bold text-white mb-8 text-center">Connect Your Spotify Account</h3>
              <SpotifyConnect onConnected={onSetupComplete} />
            </div>
          )}
        </div>

        <div className="mt-16 pt-12 border-t border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">How It Works</h3>
          <ol className="space-y-4 text-gray-400">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                1
              </span>
              <span>Connect your Spotify account securely via OAuth</span>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                2
              </span>
              <span>We fetch your listening data and compute behavioral metrics deterministically</span>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                3
              </span>
              <span>AI generates daily Insight Capsules interpreting your music behavior</span>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                4
              </span>
              <span>View trends, share insights, and reflect on your musical identity</span>
            </li>
          </ol>
        </div>
      </main>
    </div>
  );
}
