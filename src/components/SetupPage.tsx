import { useEffect, useState } from 'react';
import { Music, Sparkles, Loader, Zap, ArrowRight, Shield, TrendingUp, Brain, Radio } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { ProfileButton } from './ProfileButton';
import { supabase } from '../lib/supabase';
import { callEdgeFunction } from '../lib/api';

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

export function SetupPage({ onSetupComplete }: { onSetupComplete: () => void }) {
  const { session } = useAuth();
  const { currentTheme } = useTheme();
  const [hasSpotify, setHasSpotify] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    handleCallback();
  }, [session]);

  const handleCallback = async () => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const errorParam = params.get('error');

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      setLoading(false);
      window.history.replaceState({}, '', '/setup');
      return;
    }

    if (connected === 'true' && session) {
      setSyncing(true);
      try {
        const token = session.access_token;

        await callEdgeFunction('spotify-sync', { token });
        await callEdgeFunction('generate-capsule', { token });

        setHasSpotify(true);
      } catch (err) {
        console.warn('Initial sync failed:', err);
        setHasSpotify(true);
      } finally {
        setSyncing(false);
        setLoading(false);
        window.history.replaceState({}, '', '/setup');
      }
      return;
    }

    checkSetup();
  };

  const checkSetup = async () => {
    if (!session) return;

    try {
      const response = await supabase
        .from('integration_tokens')
        .select('id')
        .eq('integration_name', 'spotify')
        .maybeSingle();

      setHasSpotify(!!response.data);
    } catch (err) {
      console.error('Error checking setup:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSpotifyAuth = async () => {
    setAuthLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const params = new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: SPOTIFY_REDIRECT_URI,
        scope: 'user-read-private user-top-read user-read-recently-played',
        state: user.id,
      });

      window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start authentication');
      setAuthLoading(false);
    }
  };

  if (loading || syncing) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-500" style={{ backgroundColor: currentTheme.colors.background }}>
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 rounded-xl mb-6 mx-auto"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
              borderColor: currentTheme.colors.border,
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <Zap className="w-10 h-10 text-black" />
            </div>
          </motion.div>
          <p className="text-xl font-black tracking-widest" style={{ color: currentTheme.colors.primary }}>
            {syncing ? 'SYNCING YOUR DATA...' : 'INITIALIZING...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white overflow-hidden transition-colors duration-500" style={{ backgroundColor: currentTheme.colors.background }}>
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <ProfileButton />
        <ThemeToggle />
      </div>

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
        <nav className="container mx-auto px-6 py-8">
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
            <div>
              <span className="text-2xl font-black tracking-widest">CAPSULE OS</span>
              <p className="text-xs tracking-widest font-black" style={{ color: currentTheme.colors.secondary }}>SETUP PROTOCOL</p>
            </div>
          </motion.div>
        </nav>

        {hasSpotify ? (
          <section className="container mx-auto px-6 py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block w-24 h-24 border-4 rounded-xl mb-8"
                style={{
                  background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-12 h-12 text-black" />
                </div>
              </motion.div>

              <h1 className="text-5xl font-black tracking-wider mb-6">CONNECTION ESTABLISHED</h1>
              <div
                className="w-48 h-1 mx-auto mb-8 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
                }}
              ></div>

              <p className="text-xl mb-12 leading-relaxed" style={{ color: currentTheme.colors.textSecondary }}>
                Your Spotify integration is active. CapsuleOS is now analyzing your listening patterns
                and generating personalized intelligence capsules.
              </p>

              <button
                onClick={onSetupComplete}
                className="inline-block px-12 py-4 text-black font-black text-lg border-4 tracking-widest rounded-xl active:translate-y-2 transition-all duration-200"
                style={{
                  background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
                  borderColor: currentTheme.colors.border,
                  boxShadow: `0 8px 0 0 ${currentTheme.colors.border}`,
                }}
              >
                ENTER DASHBOARD
                <ArrowRight className="inline-block ml-2 w-6 h-6" />
              </button>
            </motion.div>
          </section>
        ) : (
          <>
            <section className="container mx-auto px-6 py-12 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1
                  className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(90deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary}, ${currentTheme.colors.primary})`,
                  }}
                >
                  CONNECT YOUR MUSIC
                </h1>
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-8">
                  UNLOCK BEHAVIORAL INTELLIGENCE
                </h2>
                <p className="text-xl max-w-3xl mx-auto mb-12 leading-relaxed" style={{ color: currentTheme.colors.textSecondary }}>
                  Link your Spotify account to begin analyzing your
                  <span style={{ color: currentTheme.colors.primary }}> listening patterns</span>,
                  <span style={{ color: currentTheme.colors.secondary }}> temporal habits</span>, and
                  <span style={{ color: currentTheme.colors.primary }}> musical evolution</span>.
                </p>
              </motion.div>
            </section>

            <section className="container mx-auto px-6 py-12">
              <div className="max-w-2xl mx-auto">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8 p-4 border-2 bg-red-500/20 border-red-500 text-red-300 text-sm font-black rounded-xl"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="border-4 rounded-2xl p-8 text-center"
                  style={{
                    backgroundColor: `${currentTheme.colors.surface}cc`,
                    borderColor: currentTheme.colors.border,
                  }}
                >
                  <div className="mb-8">
                    <div
                      className="inline-block w-16 h-16 rounded-xl border-2 mb-4"
                      style={{
                        background: 'linear-gradient(135deg, #1DB954, #1ed760)',
                        borderColor: currentTheme.colors.border,
                      }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-8 h-8 text-black" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-black tracking-wider mb-2">SPOTIFY INTEGRATION</h3>
                    <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                      Securely connect via OAuth 2.0
                    </p>
                  </div>

                  <button
                    onClick={handleSpotifyAuth}
                    disabled={authLoading}
                    className="w-full text-black font-black py-4 border-2 text-sm tracking-widest rounded-xl active:translate-y-1 transition-all duration-200 disabled:opacity-50 mb-6"
                    style={{
                      backgroundColor: '#1DB954',
                      borderColor: currentTheme.colors.border,
                      boxShadow: `0 4px 0 0 ${currentTheme.colors.border}`,
                    }}
                  >
                    {authLoading ? 'CONNECTING...' : 'CONNECT SPOTIFY'}
                  </button>

                  <div className="pt-6 border-t-2" style={{ borderColor: currentTheme.colors.border }}>
                    <p className="text-xs leading-relaxed" style={{ color: currentTheme.colors.textSecondary }}>
                      We only access listening history and preferences. Your data is encrypted and never shared.
                      You can revoke access anytime.
                    </p>
                  </div>
                </motion.div>
              </div>
            </section>

            <section className="container mx-auto px-6 py-12">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <h3 className="text-3xl font-black tracking-widest mb-4">WHAT YOU GET</h3>
                <div
                  className="w-32 h-1 mx-auto rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
                  }}
                ></div>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {[
                  {
                    icon: Brain,
                    title: 'AI CAPSULES',
                    desc: 'Daily personality insights generated from your listening behavior',
                    color: 'from-cyan-500 to-blue-600',
                  },
                  {
                    icon: TrendingUp,
                    title: 'EVOLUTION TRACKING',
                    desc: 'Watch your taste evolve over time with temporal analysis',
                    color: 'from-purple-500 to-fuchsia-600',
                  },
                  {
                    icon: Radio,
                    title: 'DEEP METRICS',
                    desc: 'Discovery index, mood patterns, and genre diversity analysis',
                    color: 'from-green-500 to-emerald-600',
                  },
                  {
                    icon: Shield,
                    title: 'PRIVACY FIRST',
                    desc: 'Only aggregated metrics stored. Raw data never persisted',
                    color: 'from-orange-500 to-red-600',
                  },
                ].map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="border-2 rounded-xl p-6 transition-all group"
                    style={{
                      backgroundColor: currentTheme.colors.surface,
                      borderColor: currentTheme.colors.border,
                    }}
                  >
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${feature.color} border-2 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                      style={{ borderColor: currentTheme.colors.border }}
                    >
                      <feature.icon className="w-7 h-7 text-black" />
                    </div>
                    <h4 className="text-lg font-black tracking-wider mb-3">{feature.title}</h4>
                    <p className="text-sm leading-relaxed" style={{ color: currentTheme.colors.textSecondary }}>
                      {feature.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="container mx-auto px-6 py-12">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl mx-auto"
              >
                <h3 className="text-3xl font-black tracking-widest mb-8 text-center">PROCESSING PIPELINE</h3>
                <div className="space-y-6">
                  {[
                    {
                      step: '01',
                      title: 'OAUTH AUTHENTICATION',
                      desc: 'Secure connection via Spotify OAuth 2.0 protocol',
                    },
                    {
                      step: '02',
                      title: 'DATA EXTRACTION',
                      desc: 'Fetch listening history and compute deterministic metrics',
                    },
                    {
                      step: '03',
                      title: 'AI SYNTHESIS',
                      desc: 'Generate personalized Insight Capsules using behavioral patterns',
                    },
                    {
                      step: '04',
                      title: 'DASHBOARD ACCESS',
                      desc: 'Explore your musical intelligence through interactive visualizations',
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-6 border-2 rounded-xl p-6"
                      style={{
                        backgroundColor: currentTheme.colors.surface,
                        borderColor: currentTheme.colors.border,
                      }}
                    >
                      <div
                        className="flex-shrink-0 w-14 h-14 border-2 rounded-xl flex items-center justify-center font-black text-2xl"
                        style={{
                          background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
                          borderColor: currentTheme.colors.border,
                          color: '#000000',
                        }}
                      >
                        {item.step}
                      </div>
                      <div>
                        <h4 className="text-xl font-black tracking-wider mb-2">{item.title}</h4>
                        <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                          {item.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </section>
          </>
        )}

        <footer className="container mx-auto px-6 py-12 text-center border-t-2" style={{ borderColor: `${currentTheme.colors.border}20` }}>
          <p className="text-xs tracking-widest font-black mb-4" style={{ color: currentTheme.colors.primary }}>━━━━━━━━━━━━━━━━━━━</p>
          <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
            CapsuleOS © 2024 • Secure by Design • Deterministic Intelligence
          </p>
        </footer>
      </div>
    </div>
  );
}
