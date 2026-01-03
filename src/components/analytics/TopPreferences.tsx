import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { getTopArtists, getTopTracks } from '../../lib/spotify';

export function TopPreferences({ token }: { token: string }) {
  const { currentTheme } = useTheme();
  const [artists, setArtists] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'artists' | 'tracks'>('artists');

  useEffect(() => {
    async function loadData() {
      try {
        const [artistsRes, tracksRes] = await Promise.all([
          getTopArtists(token, 'long_term', 20),
          getTopTracks(token, 'long_term', 20),
        ]);
        setArtists(artistsRes.items);
        setTracks(tracksRes.items);
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="text-lg font-black tracking-widest"
          style={{ color: currentTheme.colors.primary }}
        >
          LOADING YOUR TOP PREFERENCES...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-4xl font-black tracking-widest mb-8">
          TOP PREFERENCES
        </h2>

        <div className="flex gap-4 mb-8">
          {(['artists', 'tracks'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-6 py-3 border-2 rounded-lg font-black tracking-wider transition-all"
              style={{
                backgroundColor:
                  view === v ? currentTheme.colors.primary : 'transparent',
                borderColor: currentTheme.colors.border,
                color: view === v ? '#000000' : currentTheme.colors.primary,
              }}
            >
              {v === 'artists' ? '🎤 TOP ARTISTS' : '🎵 TOP TRACKS'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {(view === 'artists' ? artists : tracks).map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 p-4 border-2 rounded-lg"
              style={{
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.border,
              }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 font-black"
                style={{
                  background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
                }}
              >
                {i + 1}
              </div>

              <div className="flex-1">
                <h3 className="font-black text-sm tracking-wide">
                  {view === 'artists' ? item.name : item.name}
                </h3>
                <p
                  className="text-xs mt-1"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  {view === 'artists'
                    ? `${item.genres.slice(0, 2).join(', ')}`
                    : `${item.artists.map((a: any) => a.name).join(', ')}`}
                </p>
              </div>

              {item.popularity && (
                <div className="text-right">
                  <div
                    className="text-xs font-black"
                    style={{ color: currentTheme.colors.primary }}
                  >
                    {item.popularity}%
                  </div>
                  <p
                    className="text-xs"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    POPULARITY
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
