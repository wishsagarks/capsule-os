import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { getTopArtists, getTopTracks } from '../../lib/spotify';

export function TasteEvolution({ token }: { token: string }) {
  const { currentTheme } = useTheme();
  const [evolution, setEvolution] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvolution() {
      try {
        const [longTerm, mediumTerm, shortTerm] = await Promise.all([
          getTopArtists(token, 'long_term', 10),
          getTopArtists(token, 'medium_term', 10),
          getTopArtists(token, 'short_term', 10),
        ]);

        const [longTracks, mediumTracks, shortTracks] = await Promise.all([
          getTopTracks(token, 'long_term', 10),
          getTopTracks(token, 'medium_term', 10),
          getTopTracks(token, 'short_term', 10),
        ]);

        setEvolution({
          artists: {
            long: longTerm.items,
            medium: mediumTerm.items,
            short: shortTerm.items,
          },
          tracks: {
            long: longTracks.items,
            medium: mediumTracks.items,
            short: shortTracks.items,
          },
        });
      } catch (error) {
        console.error('Error loading taste evolution:', error);
      } finally {
        setLoading(false);
      }
    }
    loadEvolution();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="text-lg font-black tracking-widest"
          style={{ color: currentTheme.colors.primary }}
        >
          CALCULATING TASTE EVOLUTION...
        </div>
      </div>
    );
  }

  if (!evolution) return null;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-4xl font-black tracking-widest mb-8">
          TASTE EVOLUTION
        </h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-black tracking-wider mb-6">
              ARTIST EVOLUTION
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { period: 'ALL TIME', artists: evolution.artists.long, icon: '📚' },
                { period: 'LAST 6 MONTHS', artists: evolution.artists.medium, icon: '📖' },
                { period: 'LAST 4 WEEKS', artists: evolution.artists.short, icon: '📝' },
              ].map((section, sectionIdx) => (
                <motion.div
                  key={section.period}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIdx * 0.1 }}
                  className="border-2 rounded-xl p-6"
                  style={{
                    backgroundColor: currentTheme.colors.surface,
                    borderColor: currentTheme.colors.border,
                  }}
                >
                  <h4 className="text-sm font-black tracking-wider mb-4">
                    {section.icon} {section.period}
                  </h4>
                  <div className="space-y-2">
                    {section.artists.map((artist: any, i: number) => (
                      <div
                        key={artist.id}
                        className="text-xs leading-relaxed"
                        style={{ color: currentTheme.colors.textSecondary }}
                      >
                        <span className="font-black text-white">{i + 1}.</span> {artist.name}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-black tracking-wider mb-6">
              TRACK EVOLUTION
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { period: 'ALL TIME', tracks: evolution.tracks.long, icon: '🎵' },
                { period: 'LAST 6 MONTHS', tracks: evolution.tracks.medium, icon: '♪' },
                { period: 'LAST 4 WEEKS', tracks: evolution.tracks.short, icon: '♫' },
              ].map((section, sectionIdx) => (
                <motion.div
                  key={section.period}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + sectionIdx * 0.1 }}
                  className="border-2 rounded-xl p-6"
                  style={{
                    backgroundColor: currentTheme.colors.surface,
                    borderColor: currentTheme.colors.border,
                  }}
                >
                  <h4 className="text-sm font-black tracking-wider mb-4">
                    {section.icon} {section.period}
                  </h4>
                  <div className="space-y-3">
                    {section.tracks.map((track: any, i: number) => (
                      <div key={track.id} className="text-xs leading-tight">
                        <div className="font-black text-white truncate">
                          {i + 1}. {track.name}
                        </div>
                        <div
                          className="truncate mt-1"
                          style={{ color: currentTheme.colors.textSecondary }}
                        >
                          {track.artists[0]?.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="border-2 rounded-xl p-8"
            style={{ borderColor: currentTheme.colors.border }}
          >
            <h4 className="text-lg font-black tracking-wider mb-4">
              📊 INSIGHT
            </h4>
            <p style={{ color: currentTheme.colors.textSecondary }}>
              Your musical taste is continuously evolving. Compare your top choices across different time periods
              to see how your preferences shift. New discoveries and returning favorites both shape your identity.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
