import { useState, useEffect } from 'react';
import { Youtube, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { youtubeClient } from '../lib/youtube';
import { useAuth } from '../contexts/AuthContext';

export default function YouTubeConnect() {
  const { session } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, [session]);

  const checkConnection = async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      const connected = await youtubeClient.isConnected(session.user.id);
      setIsConnected(connected);
    } catch (err) {
      console.error('Failed to check YouTube connection:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!session?.user?.id) return;

    try {
      setError(null);
      const authUrl = await youtubeClient.getAuthUrl(session.user.id);
      window.location.href = authUrl;
    } catch (err) {
      console.error('Failed to initiate YouTube auth:', err);
      setError('Failed to connect to YouTube. Please try again.');
    }
  };

  const handleDisconnect = async () => {
    if (!session?.user?.id) return;

    try {
      setError(null);
      await youtubeClient.disconnect(session.user.id);
      setIsConnected(false);
    } catch (err) {
      console.error('Failed to disconnect YouTube:', err);
      setError('Failed to disconnect YouTube. Please try again.');
    }
  };

  const handleSync = async () => {
    if (!session?.user?.id) return;

    try {
      setIsSyncing(true);
      setError(null);
      await youtubeClient.syncData(session.user.id);
    } catch (err) {
      console.error('Failed to sync YouTube data:', err);
      setError('Failed to sync data. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-red-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <Youtube className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              YouTube
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isConnected ? 'Connected' : 'Not connected'}
            </p>
          </div>
        </div>
        {isConnected ? (
          <CheckCircle className="w-6 h-6 text-green-500" />
        ) : (
          <XCircle className="w-6 h-6 text-gray-400" />
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {isConnected
          ? 'Your YouTube account is connected. We analyze your subscriptions, liked videos, and content preferences.'
          : 'Connect your YouTube account to unlock insights about your content consumption patterns, learning preferences, and viewing habits.'}
      </p>

      <div className="flex gap-2">
        {isConnected ? (
          <>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Data'}
            </button>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={handleConnect}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Youtube className="w-4 h-4" />
            Connect YouTube
          </button>
        )}
      </div>

      {isConnected && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <strong>Privacy:</strong> We only access your subscriptions and liked videos (public data). We never access your watch history or private information.
          </p>
        </div>
      )}
    </div>
  );
}
