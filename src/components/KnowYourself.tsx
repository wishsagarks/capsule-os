import { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Zap, ArrowRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { getSpotifyAuthUrl } from '../lib/api';

export function KnowYourself() {
  const { currentTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleSpotifyConnect = () => {
    setIsLoading(true);
    const authUrl = getSpotifyAuthUrl();
    window.location.href = authUrl;
  };

  return (
    <div
      className="min-h-screen text-white overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: currentTheme.colors.background }}
    >
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(${currentTheme.colors.primary}80 1px, transparent 1px), linear-gradient(90deg, ${currentTheme.colors.primary}80 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative z-10">
        <nav className="container mx-auto px-6 py-8 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div
              className="w-12 h-12 rounded-xl border-2 flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
                borderColor: currentTheme.colors.border,
              }}
            >
              <Zap className="w-6 h-6 text-black" />
            </div>
            <span className="text-2xl font-black tracking-widest">CAPSULE OS</span>
          </motion.div>

          <ThemeToggle />
        </nav>

        <section className="container mx-auto px-6 py-24">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="inline-block mb-8"
              >
                <div
                  className="w-20 h-20 rounded-2xl border-4 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
                    borderColor: currentTheme.colors.border,
                  }}
                >
                  <Music className="w-10 h-10 text-black" />
                </div>
              </motion.div>

              <h1
                className="text-6xl font-black tracking-tighter mb-6 bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
                }}
              >
                KNOW YOURSELF
              </h1>

              <p
                className="text-xl mb-8 leading-relaxed"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                Unlock your musical identity. Discover behavioral patterns,
                mood profiles, and listening personalities based on deterministic
                computation from your Spotify data. No algorithms—just pure,
                explainable insights.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border-4 rounded-2xl p-12"
              style={{
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.border,
              }}
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black tracking-wider mb-3">
                  CONNECT WITH SPOTIFY
                </h2>
                <p
                  className="text-sm"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  Analyze your listening patterns and unlock your musical identity
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  {[
                    {
                      icon: '📊',
                      title: 'Listening Overview',
                      desc: 'Total tracks, artists, genres, and session patterns',
                    },
                    {
                      icon: '🎵',
                      title: 'Top Preferences',
                      desc: 'Your favorite artists, tracks, and genres ranked',
                    },
                    {
                      icon: '⏰',
                      title: 'Temporal Habits',
                      desc: 'Peak hours, weekday vs weekend patterns, binge behavior',
                    },
                    {
                      icon: '🎨',
                      title: 'Mood & Energy',
                      desc: 'Audio features reveal your emotional listening profile',
                    },
                    {
                      icon: '📈',
                      title: 'Taste Evolution',
                      desc: 'How your music preferences change over time',
                    },
                    {
                      icon: '🔍',
                      title: 'Discovery Index',
                      desc: 'Your exploration vs comfort listening balance',
                    },
                    {
                      icon: '🎭',
                      title: 'Personality Profile',
                      desc: 'Rule-based classification of your listening identity',
                    },
                  ].map((feature, i) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="flex gap-4 items-start"
                    >
                      <span className="text-2xl mt-1">{feature.icon}</span>
                      <div>
                        <h3 className="font-black text-sm tracking-wide">
                          {feature.title}
                        </h3>
                        <p
                          className="text-xs mt-1"
                          style={{ color: currentTheme.colors.textSecondary }}
                        >
                          {feature.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <button
                  onClick={handleSpotifyConnect}
                  disabled={isLoading}
                  className="w-full py-4 text-black font-black text-lg border-4 tracking-widest rounded-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
                  style={{
                    background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
                    borderColor: currentTheme.colors.border,
                    boxShadow: `0 8px 0 0 ${currentTheme.colors.border}`,
                  }}
                >
                  {isLoading ? 'CONNECTING...' : 'CONNECT SPOTIFY'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <div
                className="mt-8 pt-8 border-t-2 text-center"
                style={{ borderColor: currentTheme.colors.border }}
              >
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  Your data is processed locally. We never store your listening history.
                  <br />
                  SECURE • DETERMINISTIC • EXPLAINABLE
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-12 text-center"
            >
              <p
                className="text-xs tracking-widest font-black mb-3"
                style={{ color: currentTheme.colors.primary }}
              >
                ━━━━━━━━━━━━━━━━━━━
              </p>
              <p
                className="text-sm"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                Transform fragmented digital signals into coherent self-insight
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
