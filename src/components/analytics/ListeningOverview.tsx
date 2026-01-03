import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import {
  calculateListeningStats,
  getRecentlyPlayed,
} from '../../lib/spotify';

export function ListeningOverview({ token }: { token: string }) {
  const { currentTheme } = useTheme();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const result = await calculateListeningStats(token);
        setStats(result);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="text-lg font-black tracking-widest"
          style={{ color: currentTheme.colors.primary }}
        >
          ANALYZING YOUR LISTENING PATTERNS...
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p style={{ color: currentTheme.colors.textSecondary }}>
          Unable to load listening data
        </p>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Tracks',
      value: stats.totalTracks,
      icon: '🎵',
    },
    {
      label: 'Unique Artists',
      value: stats.uniqueArtists,
      icon: '🎤',
    },
    {
      label: 'Unique Genres',
      value: stats.uniqueGenres,
      icon: '🎸',
    },
    {
      label: 'Energy Level',
      value: (stats.averageEnergy * 100).toFixed(0) + '%',
      icon: '⚡',
    },
    {
      label: 'Mood (Valence)',
      value: (stats.averageValence * 100).toFixed(0) + '%',
      icon: '😊',
    },
    {
      label: 'Avg Tempo',
      value: Math.round(stats.averageTempo) + ' BPM',
      icon: '♪',
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-4xl font-black tracking-widest mb-8">
          LISTENING OVERVIEW
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="border-3 rounded-xl p-6"
              style={{
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.primary,
              }}
            >
              <div className="text-3xl mb-3">{kpi.icon}</div>
              <div
                className="text-sm font-black tracking-widest mb-2"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                {kpi.label}
              </div>
              <div className="text-3xl font-black" style={{ color: currentTheme.colors.primary }}>
                {kpi.value}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="border-2 rounded-xl p-8" style={{ borderColor: currentTheme.colors.border }}>
          <h3 className="text-xl font-black tracking-wider mb-6">
            TOP GENRES YOU EXPLORE
          </h3>
          <div className="space-y-3">
            {stats.dominantGenres.slice(0, 8).map((genre: string, i: number) => (
              <motion.div
                key={genre}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4"
              >
                <div
                  className="w-full bg-gradient-to-r rounded-lg h-6"
                  style={{
                    background: `linear-gradient(90deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
                    width: `${100 - i * 12}%`,
                  }}
                />
                <span className="font-black text-sm min-w-[120px] text-right capitalize">
                  {genre.replace('-', ' ')}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
