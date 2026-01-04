import { useState, useEffect } from 'react';
import { Youtube, TrendingUp, Clock, Target, BookOpen, Zap } from 'lucide-react';
import { youtubeClient, type YouTubeAnalytics as YouTubeAnalyticsType } from '../lib/youtube';
import { useAuth } from '../contexts/AuthContext';

export default function YouTubeAnalytics() {
  const { session } = useAuth();
  const [analytics, setAnalytics] = useState<YouTubeAnalyticsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [session]);

  const loadAnalytics = async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      const data = await youtubeClient.getAnalytics(session.user.id);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load YouTube analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <Youtube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          No YouTube data available yet. Connect your account and sync your data to see insights.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <Target className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Content Identity
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your viewing personality
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-red-200 dark:border-red-800">
          <div className="flex items-start justify-between mb-3">
            <h4 className="text-3xl font-bold text-red-600 dark:text-red-400">
              {analytics.contentIdentity.type}
            </h4>
            <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
              {(analytics.contentIdentity.confidence * 100).toFixed(0)}% confidence
            </span>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            {analytics.contentIdentity.description}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Intellectual Diet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Content breakdown
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Learning</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {(analytics.intellectualDiet.learning * 100).toFixed(0)}%
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Entertainment</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {(analytics.intellectualDiet.entertainment * 100).toFixed(0)}%
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">News</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {(analytics.intellectualDiet.news * 100).toFixed(0)}%
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Motivation</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {(analytics.intellectualDiet.motivation * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Subscription Health
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Channel engagement metrics
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Utilization</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {(analytics.subscriptionHealth.utilization * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-600 h-full rounded-full transition-all"
                style={{ width: `${analytics.subscriptionHealth.utilization * 100}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Decayed Channels</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.subscriptionHealth.decayedCount}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Topic Diversity</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(analytics.subscriptionHealth.topicDiversity * 10).toFixed(1)}/10
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Temporal Patterns
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              When and how you watch
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Peak Hours</p>
            <div className="flex gap-2 flex-wrap">
              {analytics.temporalPatterns.peakHours.map((hour) => (
                <span
                  key={hour}
                  className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-medium"
                >
                  {hour}:00
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Weekday</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.temporalPatterns.weekdayVsWeekend.weekday}%
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Weekend</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.temporalPatterns.weekdayVsWeekend.weekend}%
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Session Style</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {analytics.temporalPatterns.sessionStyle}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Zap className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Content Depth
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              What you watch and how deeply
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Shorts Ratio</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {(analytics.contentDepth.shortsRatio * 100).toFixed(0)}%
            </p>
          </div>
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg p-4 border border-teal-200 dark:border-teal-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Duration</p>
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {Math.floor(analytics.contentDepth.avgDuration / 60)}m
            </p>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-lg p-4 border border-pink-200 dark:border-pink-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Exploration</p>
            <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
              {(analytics.contentDepth.explorationIndex * 10).toFixed(1)}/10
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
