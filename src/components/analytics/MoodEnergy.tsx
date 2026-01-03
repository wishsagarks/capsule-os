import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { getMoodProfile, getTopTracks, getAudioFeatures } from '../../lib/spotify';

export function MoodEnergy({ token }: { token: string }) {
  const { currentTheme } = useTheme();
  const [mood, setMood] = useState<any>(null);
  const [audioDistribution, setAudioDistribution] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMood() {
      try {
        const moodData = await getMoodProfile(token);
        setMood(moodData);

        const topTracks = await getTopTracks(token, 'long_term', 50);
        const trackIds = topTracks.items.map((t: any) => t.id);
        const features = await getAudioFeatures(token, trackIds);
        const validFeatures = features.audio_features.filter((f: any) => f !== null);

        const energyBuckets = {
          low: validFeatures.filter((f: any) => f.energy < 0.33).length,
          medium: validFeatures.filter((f: any) => f.energy >= 0.33 && f.energy < 0.66).length,
          high: validFeatures.filter((f: any) => f.energy >= 0.66).length,
        };

        const valenceBuckets = {
          dark: validFeatures.filter((f: any) => f.valence < 0.33).length,
          neutral: validFeatures.filter((f: any) => f.valence >= 0.33 && f.valence < 0.66).length,
          happy: validFeatures.filter((f: any) => f.valence >= 0.66).length,
        };

        setAudioDistribution({
          energy: energyBuckets,
          valence: valenceBuckets,
        });
      } catch (error) {
        console.error('Error loading mood:', error);
      } finally {
        setLoading(false);
      }
    }
    loadMood();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="text-lg font-black tracking-widest"
          style={{ color: currentTheme.colors.primary }}
        >
          ANALYZING MOOD & ENERGY...
        </div>
      </div>
    );
  }

  if (!mood) return null;

  const getMoodEmoji = (type: string) => {
    switch (type) {
      case 'Uplifting':
        return '🌟';
      case 'Energetic':
        return '⚡';
      case 'Chill':
        return '😎';
      case 'Melancholic':
        return '🖤';
      case 'Dark & Deep':
        return '🌙';
      default:
        return '🎵';
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-4xl font-black tracking-widest mb-8">
          MOOD & ENERGY ANALYSIS
        </h2>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border-3 rounded-xl p-8 text-center"
            style={{
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.primary,
            }}
          >
            <div className="text-5xl mb-4">{getMoodEmoji(mood.moodType)}</div>
            <div className="text-sm font-black tracking-widest mb-2" style={{ color: currentTheme.colors.textSecondary }}>
              MOOD PROFILE
            </div>
            <div className="text-2xl font-black" style={{ color: currentTheme.colors.primary }}>
              {mood.moodType}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="border-3 rounded-xl p-8 text-center"
            style={{
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.secondary,
            }}
          >
            <div className="text-4xl mb-4">⚡</div>
            <div className="text-sm font-black tracking-widest mb-2" style={{ color: currentTheme.colors.textSecondary }}>
              ENERGY
            </div>
            <div className="text-2xl font-black" style={{ color: currentTheme.colors.secondary }}>
              {(mood.energy * 100).toFixed(0)}%
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="border-3 rounded-xl p-8 text-center"
            style={{
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.accent || currentTheme.colors.primary,
            }}
          >
            <div className="text-4xl mb-4">😊</div>
            <div className="text-sm font-black tracking-widest mb-2" style={{ color: currentTheme.colors.textSecondary }}>
              POSITIVITY
            </div>
            <div className="text-2xl font-black" style={{ color: currentTheme.colors.accent || currentTheme.colors.primary }}>
              {(mood.valence * 100).toFixed(0)}%
            </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="border-2 rounded-xl p-8"
            style={{ borderColor: currentTheme.colors.border }}
          >
            <h3 className="text-lg font-black tracking-wider mb-6">
              ENERGY DISTRIBUTION
            </h3>
            <div className="space-y-4">
              {[
                { label: '🔋 High Energy', value: audioDistribution?.energy.high, color: currentTheme.colors.primary },
                { label: '🎚️ Medium Energy', value: audioDistribution?.energy.medium, color: currentTheme.colors.secondary },
                { label: '😴 Low Energy', value: audioDistribution?.energy.low, color: currentTheme.colors.textSecondary },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex-1">
                    <div className="text-xs font-black mb-2">{item.label}</div>
                    <div className="h-4 bg-opacity-20 rounded-lg overflow-hidden" style={{ backgroundColor: item.color }}>
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${item.value ? (item.value / 50) * 100 : 0}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-xs font-black min-w-[30px] text-right">
                    {item.value}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="border-2 rounded-xl p-8"
            style={{ borderColor: currentTheme.colors.border }}
          >
            <h3 className="text-lg font-black tracking-wider mb-6">
              MOOD DISTRIBUTION
            </h3>
            <div className="space-y-4">
              {[
                { label: '🌟 Happy', value: audioDistribution?.valence.happy, color: currentTheme.colors.primary },
                { label: '😐 Neutral', value: audioDistribution?.valence.neutral, color: currentTheme.colors.secondary },
                { label: '🖤 Dark', value: audioDistribution?.valence.dark, color: currentTheme.colors.textSecondary },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex-1">
                    <div className="text-xs font-black mb-2">{item.label}</div>
                    <div className="h-4 bg-opacity-20 rounded-lg overflow-hidden" style={{ backgroundColor: item.color }}>
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${item.value ? (item.value / 50) * 100 : 0}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-xs font-black min-w-[30px] text-right">
                    {item.value}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
