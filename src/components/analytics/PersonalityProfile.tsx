import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { getListeningPersonality } from '../../lib/spotify';

export function PersonalityProfile({ token }: { token: string }) {
  const { currentTheme } = useTheme();
  const [personality, setPersonality] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPersonality() {
      try {
        const result = await getListeningPersonality(token);
        setPersonality(result);
      } catch (error) {
        console.error('Error loading personality:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPersonality();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="text-lg font-black tracking-widest"
          style={{ color: currentTheme.colors.primary }}
        >
          DETERMINING YOUR PERSONALITY...
        </div>
      </div>
    );
  }

  if (!personality) return null;

  const personalities = [
    {
      name: 'The Explorer',
      emoji: '🧭',
      color: currentTheme.colors.primary,
      description: 'You constantly seek new music and artists. Discovery is your driving force.',
      traits: ['Adventure-seeking', 'Open-minded', 'Trendsetter', 'Genre-fluid'],
    },
    {
      name: 'The Loyalist',
      emoji: '💎',
      color: currentTheme.colors.secondary,
      description: 'You have found your favorite artists and stick with them deeply.',
      traits: ['Devoted', 'Consistent', 'Deep appreciation', 'Quality-focused'],
    },
    {
      name: 'The Night Owl',
      emoji: '🌙',
      color: currentTheme.colors.primary,
      description: 'Your taste leans toward high-energy, dynamic, intense sounds.',
      traits: ['Energetic', 'Passionate', 'Dynamic', 'Intense'],
    },
    {
      name: 'The Mood Regulator',
      emoji: '💭',
      color: currentTheme.colors.secondary,
      description:
        'Music is your emotional anchor. You use it to navigate and process feelings.',
      traits: ['Emotional', 'Introspective', 'Therapeutic', 'Self-aware'],
    },
    {
      name: 'The Focus Seeker',
      emoji: '🧠',
      color: currentTheme.colors.primary,
      description: 'Your selections support deep work, concentration, and flow states.',
      traits: ['Disciplined', 'Focused', 'Intentional', 'Productive'],
    },
  ];

  const activePersonality = personalities.find(
    (p) => p.name === personality.personality
  ) || personalities[0];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-4xl font-black tracking-widest mb-8">
          YOUR LISTENING PERSONALITY
        </h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border-4 rounded-2xl p-12 text-center mb-8"
          style={{
            backgroundColor: currentTheme.colors.surface,
            borderColor: activePersonality.color,
          }}
        >
          <div className="text-8xl mb-6">{activePersonality.emoji}</div>
          <h1 className="text-5xl font-black tracking-widest mb-4">
            {activePersonality.name}
          </h1>
          <p
            className="text-xl mb-8 leading-relaxed"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            {activePersonality.description}
          </p>

          <div className="flex justify-center gap-3 flex-wrap">
            {activePersonality.traits.map((trait) => (
              <span
                key={trait}
                className="px-4 py-2 rounded-full text-xs font-black tracking-wider"
                style={{
                  backgroundColor: `${activePersonality.color}30`,
                  color: activePersonality.color,
                  border: `2px solid ${activePersonality.color}`,
                }}
              >
                {trait}
              </span>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t-2" style={{ borderColor: currentTheme.colors.border }}>
            <div className="text-sm font-black tracking-widest mb-2" style={{ color: currentTheme.colors.textSecondary }}>
              CONFIDENCE LEVEL
            </div>
            <div className="text-3xl font-black" style={{ color: activePersonality.color }}>
              {personality.confidence.toFixed(0)}%
            </div>
            <div className="mt-4 h-3 rounded-full overflow-hidden" style={{ backgroundColor: `${activePersonality.color}40` }}>
              <div
                className="h-full transition-all"
                style={{
                  width: `${personality.confidence}%`,
                  backgroundColor: activePersonality.color,
                }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="border-2 rounded-xl p-8 mb-8"
          style={{ borderColor: currentTheme.colors.border }}
        >
          <h3 className="text-lg font-black tracking-wider mb-4">
            💡 WHAT THIS MEANS
          </h3>
          <p
            className="leading-relaxed"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            {personality.personality === 'The Explorer'
              ? `You're an adventurous listener who thrives on discovering new music. Your playlist is constantly evolving, and you use Spotify not just to listen, but to explore. You likely spend time checking recommendations and following new artists.`
              : personality.personality === 'The Loyalist'
              ? `You have developed deep connections with your favorite artists and genres. You return to familiar music because it resonates deeply with you. Quality and emotional connection matter more than quantity and novelty.`
              : personality.personality === 'The Night Owl'
              ? `High-energy, dynamic sounds define your taste. You gravitate toward music that energizes and excites you. Your listening supports active, intense activities and moods.`
              : personality.personality === 'The Mood Regulator'
              ? `You use music as an emotional tool. Your choices reflect your current mood or desired emotional state. Music is therapeutic and introspective for you.`
              : `Your listening patterns support focus and productivity. You carefully select music that enhances concentration and creates the right atmosphere for work or study.`}
          </p>
        </motion.div>

        <div>
          <h3 className="text-2xl font-black tracking-wider mb-6">
            ALL PERSONALITY TYPES
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {personalities.map((p) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border-2 rounded-xl p-6 text-center ${
                  personality.personality === p.name ? 'ring-2' : ''
                }`}
                style={{
                  borderColor: p.color,
                  backgroundColor:
                    personality.personality === p.name
                      ? `${p.color}20`
                      : currentTheme.colors.surface,
                  ringColor: p.color,
                }}
              >
                <div className="text-4xl mb-2">{p.emoji}</div>
                <h4 className="font-black text-sm tracking-wider">{p.name}</h4>
                <p
                  className="text-xs mt-2 leading-tight"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  {p.description.split('.')[0]}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="border-2 rounded-xl p-8 mt-8"
          style={{ borderColor: currentTheme.colors.border }}
        >
          <h3 className="text-lg font-black tracking-wider mb-4">
            🔬 HOW THIS IS CALCULATED
          </h3>
          <p
            className="text-sm leading-relaxed"
            style={{ color: currentTheme.colors.textSecondary }}
          >
            Your personality is determined through deterministic rule-based classification.
            We analyze your unique artist count, exploration score, energy levels, and mood
            patterns to assign you a personality type. This is not AI-generated—every result
            is reproducible and explainable through clear, transparent thresholds.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
