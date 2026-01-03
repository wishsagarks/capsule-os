import { useState, useEffect } from 'react';
import { Music, TrendingUp, LogOut, Loader, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { callEdgeFunction } from '../lib/api';
import { InsightCapsule } from './InsightCapsule';

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
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) {
      loadDashboard();
    }
  }, [session]);

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
      await callEdgeFunction('spotify-sync', {
        token: session.access_token,
      });

      await callEdgeFunction('generate-capsule', {
        token: session.access_token,
      });

      await loadDashboard();
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

        {data?.capsule && (
          <div className="mb-8">
            <InsightCapsule capsule={data.capsule} />
          </div>
        )}

        {data?.metrics && data.metrics.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {data.metrics.map((metric) => (
              <div
                key={metric.id}
                className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 hover:border-slate-500 transition"
              >
                <p className="text-gray-400 text-sm font-medium mb-2">
                  {metric.metric_name.replace(/_/g, ' ').toUpperCase()}
                </p>
                <p className="text-3xl font-bold text-white mb-2">
                  {typeof metric.value === 'number'
                    ? metric.value.toFixed(metric.unit === 'ratio' ? 2 : 1)
                    : metric.value}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-xs">{metric.unit}</span>
                  <span className="text-green-400 text-xs font-semibold">
                    {(metric.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {data?.trends && Object.keys(data.trends).length > 0 && (
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">7-Day Trends</h2>
            </div>
            <div className="space-y-4">
              {Object.entries(data.trends).map(([metricName, values]) => (
                <div key={metricName}>
                  <p className="text-gray-400 text-sm font-medium mb-2">
                    {metricName.replace(/_/g, ' ').toUpperCase()}
                  </p>
                  <div className="flex gap-1 h-12 items-end">
                    {(values as any[]).map((point, idx) => {
                      const maxValue = Math.max(...(values as any[]).map(v => v.value));
                      const height = maxValue > 0 ? (point.value / maxValue) * 100 : 0;
                      return (
                        <div
                          key={idx}
                          className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t opacity-70 hover:opacity-100 transition"
                          style={{ height: `${Math.max(height, 10)}%` }}
                          title={`${point.date}: ${point.value.toFixed(2)}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
