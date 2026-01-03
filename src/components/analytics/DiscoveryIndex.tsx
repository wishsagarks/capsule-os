import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { getExplorationIndex } from '../../lib/spotify';

export function DiscoveryIndex({ token }: { token: string }) {
  const { currentTheme } = useTheme();
  const [index, setIndex] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadIndex() {
      try {
        const result = await getExplorationIndex(token);
        setIndex(result);
      } catch (error) {
        console.error('Error loading discovery index:', error);
      } finally {
        setLoading(false);
      }
    }
    loadIndex();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="text-lg font-black tracking-widest"
          style={{ color: currentTheme.colors.primary }}
        >
          ANALYZING DISCOVERY PATTERNS...
        </div>
      </div>
    );
  }

  if (!index) return null;

  const getProfile = () => {
    const score = index.explorationScore;
    if (score > 60) {
      return {
        name: 'The Bold Explorer',
        desc: 'You actively seek new music and artists. Discovery is your driving force.',
        emoji: '🧭',
      };
    } else if (score > 40) {
      return {
        name: 'The Balanced Listener',
        desc: 'You maintain a healthy mix of familiar favorites and new discoveries.',
        emoji: '⚖️',
      };
    } else {
      return {
        name: 'The Comfort Seeker',
        desc: 'You prefer familiar artists and genres. Music is your safe space.',
        emoji: '🏠',
      };
    }
  };

  const profile = getProfile();

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-4xl font-black tracking-widest mb-8">
          DISCOVERY VS COMFORT INDEX
        </h2>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border-3 rounded-xl p-8 text-center"
            style={{
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.primary,
            }}
          >
            <div className="text-6xl mb-4">{profile.emoji}</div>
            <h3 className="text-2xl font-black tracking-wider mb-2">
              {profile.name}
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              {profile.desc}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="border-3 rounded-xl p-6" style={{ borderColor: currentTheme.colors.primary, backgroundColor: currentTheme.colors.surface }}>
              <div className="text-sm font-black tracking-widest mb-2" style={{ color: currentTheme.colors.textSecondary }}>
                EXPLORATION SCORE
              </div>
              <div className="text-4xl font-black" style={{ color: currentTheme.colors.primary }}>
                {index.explorationScore.toFixed(1)}%
              </div>
              <div className="mt-4 h-3 rounded-full overflow-hidden" style={{ backgroundColor: `${currentTheme.colors.primary}40` }}>
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${index.explorationScore}%`,
                    background: `linear-gradient(90deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
                  }}
                />
              </div>
            </div>

            <div className="border-3 rounded-xl p-6" style={{ borderColor: currentTheme.colors.secondary, backgroundColor: currentTheme.colors.surface }}>
              <div className="text-sm font-black tracking-widest mb-2" style={{ color: currentTheme.colors.textSecondary }}>
                FAMILIARITY SCORE
              </div>
              <div className="text-4xl font-black" style={{ color: currentTheme.colors.secondary }}>
                {index.familiarityScore.toFixed(1)}%
              </div>
              <div className="mt-4 h-3 rounded-full overflow-hidden" style={{ backgroundColor: `${currentTheme.colors.secondary}40` }}>
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${index.familiarityScore}%`,
                    background: `linear-gradient(90deg, ${currentTheme.colors.secondary}, ${currentTheme.colors.primary})`,
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="border-2 rounded-xl p-8"
            style={{ borderColor: currentTheme.colors.border }}
          >
            <h3 className="text-lg font-black tracking-wider mb-6">
              🌟 NEW ARTISTS DISCOVERED
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <div style={{ color: currentTheme.colors.textSecondary }} className="text-sm">
                  In recently played
                </div>
                <div
                  className="text-3xl font-black"
                  style={{ color: currentTheme.colors.primary }}
                >
                  {index.newArtistsDiscovered}
                </div>
              </div>
              <p
                className="text-xs mt-4"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                Out of {index.totalRecent} recent tracks, you discovered{' '}
                {index.newArtistsDiscovered} new artists. This shows your appetite
                for new music.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="border-2 rounded-xl p-8"
            style={{ borderColor: currentTheme.colors.border }}
          >
            <h3 className="text-lg font-black tracking-wider mb-6">
              💎 FAMILIAR FAVORITES
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <div style={{ color: currentTheme.colors.textSecondary }} className="text-sm">
                  Your comfort zone
                </div>
                <div
                  className="text-3xl font-black"
                  style={{ color: currentTheme.colors.secondary }}
                >
                  {index.totalRecent - index.newArtistsDiscovered}
                </div>
              </div>
              <p
                className="text-xs mt-4"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                You return to familiar artists {index.totalRecent - index.newArtistsDiscovered} times in
                recent plays. These are your trusted, reliable choices.
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="border-2 rounded-xl p-8"
          style={{ borderColor: currentTheme.colors.border }}
        >
          <h3 className="text-lg font-black tracking-wider mb-4">
            🔍 INTERPRETATION
          </h3>
          <p style={{ color: currentTheme.colors.textSecondary }} className="leading-relaxed">
            Your exploration score reveals your listening personality. High exploration
            suggests you're adventurous and use music as a discovery tool. High familiarity
            suggests you have developed deep connections with specific artists and use
            music as emotional stability. Both are valid and healthy listening patterns.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
