import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, Eye, Lock, TrendingUp, Grid3x3, Cpu, Database, Code2, Music, Youtube } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

export function LandingPage() {
  const { currentTheme } = useTheme();

  return (
    <div className="min-h-screen text-white overflow-hidden transition-colors duration-500" style={{ backgroundColor: currentTheme.colors.background }}>
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
              className="w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-colors"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
                borderColor: currentTheme.colors.border,
              }}
            >
              <Zap className="w-6 h-6 text-black" />
            </div>
            <span className="text-2xl font-black tracking-widest">CAPSULE OS</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <ThemeToggle />
            <Link
              to="/login"
              className="px-6 py-2 font-black border-2 text-sm tracking-widest rounded-lg transition-all duration-200"
              style={{
                backgroundColor: currentTheme.colors.primary,
                borderColor: currentTheme.colors.border,
                color: '#000000',
                boxShadow: `0 4px 0 0 ${currentTheme.colors.shadow}`,
              }}
            >
              SIGN IN
            </Link>
          </motion.div>
        </nav>

        <section className="container mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1
              className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(90deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary}, ${currentTheme.colors.primary})`,
              }}
            >
              PERSONAL INTELLIGENCE
            </h1>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8">
              OPERATING SYSTEM
            </h2>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed" style={{ color: currentTheme.colors.textSecondary }}>
              Transform fragmented digital signals into coherent self-insight through
              <span style={{ color: currentTheme.colors.primary }}> deterministic computation</span> and
              <span style={{ color: currentTheme.colors.secondary }}> explainable intelligence</span>.
            </p>
            <Link
              to="/login"
              className="inline-block px-12 py-4 text-black font-black text-lg border-4 tracking-widest rounded-xl active:translate-y-2 transition-all duration-200"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
                borderColor: currentTheme.colors.border,
                boxShadow: `0 8px 0 0 ${currentTheme.colors.border}`,
              }}
            >
              START YOUR JOURNEY
            </Link>
          </motion.div>
        </section>

        <section className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-black tracking-widest mb-4">CORE PRINCIPLES</h3>
            <div
              className="w-32 h-1 mx-auto rounded-full"
              style={{
                background: `linear-gradient(90deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
              }}
            ></div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {[
              {
                icon: Cpu,
                title: 'DETERMINISTIC',
                desc: 'Every insight is reproducible and traceable. No black boxes, no random outputs.',
                color: 'from-cyan-500 to-blue-600',
                image: 'https://images.pexels.com/photos/355948/pexels-photo-355948.jpeg?auto=compress&cs=tinysrgb&w=400'
              },
              {
                icon: Eye,
                title: 'EXPLAINABLE',
                desc: 'Understand the why behind every metric. Full transparency in computation.',
                color: 'from-purple-500 to-fuchsia-600',
                image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400'
              },
              {
                icon: Lock,
                title: 'PRIVATE',
                desc: 'Your data stays yours. Self-hosted intelligence, zero external dependencies.',
                color: 'from-green-500 to-emerald-600',
                image: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=400'
              },
              {
                icon: Grid3x3,
                title: 'MODULAR',
                desc: 'Extensible architecture. Connect Spotify and YouTube, expand infinitely.',
                color: 'from-orange-500 to-red-600',
                image: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400'
              }
            ].map((principle, i) => (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="border-2 rounded-xl p-6 transition-all group overflow-hidden relative"
                style={{
                  backgroundColor: currentTheme.colors.surface,
                  borderColor: currentTheme.colors.border,
                }}
              >
                {principle.image && (
                  <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                    <img
                      src={principle.image}
                      alt={principle.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="relative z-10">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${principle.color} border-2 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    style={{ borderColor: currentTheme.colors.border }}
                  >
                    <principle.icon className="w-8 h-8 text-black" />
                  </div>
                  <h4 className="text-xl font-black tracking-wider mb-3">{principle.title}</h4>
                  <p className="text-sm leading-relaxed" style={{ color: currentTheme.colors.textSecondary }}>{principle.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-black tracking-widest mb-4">SUPPORTED INTEGRATIONS</h3>
            <div
              className="w-32 h-1 mx-auto mb-6 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
              }}
            ></div>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: currentTheme.colors.textSecondary }}>
              Connect your digital platforms to unlock cross-platform behavioral intelligence
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-32">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="border-4 rounded-2xl p-8 text-center transition-all hover:scale-105"
              style={{
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.border,
              }}
            >
              <div
                className="w-20 h-20 mx-auto rounded-xl border-2 flex items-center justify-center mb-6"
                style={{
                  background: 'linear-gradient(135deg, #1DB954, #1ed760)',
                  borderColor: currentTheme.colors.border,
                }}
              >
                <Music className="w-10 h-10 text-black" />
              </div>
              <h4 className="text-2xl font-black tracking-wider mb-4">SPOTIFY</h4>
              <p className="text-sm mb-6" style={{ color: currentTheme.colors.textSecondary }}>
                Analyze listening patterns, discover new music, track taste evolution, and understand your musical identity.
              </p>
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentTheme.colors.primary }}></div>
                  <span className="text-sm">Discovery Index</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentTheme.colors.primary }}></div>
                  <span className="text-sm">Mood & Energy Patterns</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentTheme.colors.primary }}></div>
                  <span className="text-sm">Genre Diversity Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentTheme.colors.primary }}></div>
                  <span className="text-sm">Temporal Listening Habits</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="border-4 rounded-2xl p-8 text-center transition-all hover:scale-105"
              style={{
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.border,
              }}
            >
              <div
                className="w-20 h-20 mx-auto rounded-xl border-2 flex items-center justify-center mb-6"
                style={{
                  background: 'linear-gradient(135deg, #FF0000, #cc0000)',
                  borderColor: currentTheme.colors.border,
                }}
              >
                <Youtube className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-2xl font-black tracking-wider mb-4">YOUTUBE</h4>
              <p className="text-sm mb-6" style={{ color: currentTheme.colors.textSecondary }}>
                Understand content consumption, track learning patterns, analyze subscription health, and discover viewing habits.
              </p>
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentTheme.colors.secondary }}></div>
                  <span className="text-sm">Content Identity Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentTheme.colors.secondary }}></div>
                  <span className="text-sm">Intellectual Diet Breakdown</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentTheme.colors.secondary }}></div>
                  <span className="text-sm">Subscription Intelligence</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentTheme.colors.secondary }}></div>
                  <span className="text-sm">Temporal Viewing Patterns</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-black tracking-widest mb-4">EXPANSION ROADMAP</h3>
            <div
              className="w-32 h-1 mx-auto mb-6 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
              }}
            ></div>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: currentTheme.colors.textSecondary }}>
              Built on free-tier infrastructure with patterns designed for unlimited platform expansion
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Database,
                title: 'PHASE 1: COMPLETE ✓',
                points: [
                  'Spotify listening analysis',
                  'Exploration index computation',
                  'Temporal pattern detection',
                  'Genre diversity metrics'
                ]
              },
              {
                icon: Youtube,
                title: 'PHASE 2: LIVE NOW ✓',
                points: [
                  'YouTube content analysis',
                  'Cross-platform intelligence',
                  'Subscription health tracking',
                  'Intellectual diet insights'
                ]
              },
              {
                icon: Code2,
                title: 'PHASE 3: SYNTHESIS',
                points: [
                  'Cross-platform correlation',
                  'Holistic behavior modeling',
                  'Predictive insights',
                  'Actionable recommendations'
                ]
              }
            ].map((phase, i) => (
              <motion.div
                key={phase.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="border-2 rounded-xl p-6"
                style={{
                  backgroundColor: currentTheme.colors.surface,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <phase.icon className="w-12 h-12 mb-4" style={{ color: currentTheme.colors.primary }} />
                <h4 className="text-lg font-black tracking-wide mb-4" style={{ color: currentTheme.colors.primary }}>{phase.title}</h4>
                <ul className="space-y-2">
                  {phase.points.map((point) => (
                    <li key={point} className="text-sm flex items-start gap-2" style={{ color: currentTheme.colors.textSecondary }}>
                      <span className="mt-1" style={{ color: currentTheme.colors.secondary }}>▸</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="border-4 rounded-2xl p-12 text-center"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.colors.primary}20, ${currentTheme.colors.secondary}20)`,
              borderColor: currentTheme.colors.border,
            }}
          >
            <h3 className="text-4xl md:text-5xl font-black tracking-wider mb-6">
              KNOW YOURSELF.<br />OPTIMIZE YOUR LIFE.
            </h3>
            <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: currentTheme.colors.textSecondary }}>
              Join the future of personal intelligence. Start with Spotify, expand to everything.
            </p>
            <Link
              to="/login"
              className="inline-block px-12 py-4 text-black font-black text-lg border-4 tracking-widest rounded-xl transition-all duration-200"
              style={{
                backgroundColor: currentTheme.colors.text,
                borderColor: currentTheme.colors.border,
                boxShadow: `0 8px 0 0 ${currentTheme.colors.primary}`,
              }}
            >
              GET STARTED NOW
            </Link>
          </motion.div>
        </section>

        <footer className="container mx-auto px-6 py-12 text-center border-t-2" style={{ borderColor: `${currentTheme.colors.border}20` }}>
          <p className="text-xs tracking-widest font-black mb-4" style={{ color: currentTheme.colors.primary }}>━━━━━━━━━━━━━━━━━━━</p>
          <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
            CapsuleOS © 2026 • Free-Tier Architecture • Deterministic Intelligence
          </p>
        </footer>
      </div>
    </div>
  );
}
