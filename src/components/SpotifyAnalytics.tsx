import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, LogOut, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { ListeningOverview } from './analytics/ListeningOverview';
import { TopPreferences } from './analytics/TopPreferences';
import { TemporalHabits } from './analytics/TemporalHabits';
import { MoodEnergy } from './analytics/MoodEnergy';
import { TasteEvolution } from './analytics/TasteEvolution';
import { DiscoveryIndex } from './analytics/DiscoveryIndex';
import { PersonalityProfile } from './analytics/PersonalityProfile';

interface Tab {
  id: string;
  name: string;
  component: React.ComponentType<{ token: string }>;
}

const TABS: Tab[] = [
  {
    id: 'listening',
    name: 'Listening Overview',
    component: ListeningOverview,
  },
  {
    id: 'preferences',
    name: 'Top Preferences',
    component: TopPreferences,
  },
  {
    id: 'temporal',
    name: 'Temporal Habits',
    component: TemporalHabits,
  },
  {
    id: 'mood',
    name: 'Mood & Energy',
    component: MoodEnergy,
  },
  {
    id: 'taste',
    name: 'Taste Evolution',
    component: TasteEvolution,
  },
  {
    id: 'discovery',
    name: 'Discovery Index',
    component: DiscoveryIndex,
  },
  {
    id: 'personality',
    name: 'Your Personality',
    component: PersonalityProfile,
  },
];

export function SpotifyAnalytics({ token }: { token: string }) {
  const { currentTheme } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('https://api.spotify.com/v1/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }
    fetchUser();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('spotify_token');
    window.location.href = '/';
  };

  const CurrentComponent = TABS[activeTab].component;

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
        <nav
          className="border-b-2 sticky top-0 transition-colors"
          style={{
            backgroundColor: `${currentTheme.colors.surface}f0`,
            borderColor: currentTheme.colors.border,
          }}
        >
          <div className="container mx-auto px-6 py-6 flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div
                className="w-10 h-10 rounded-lg border-2 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <Music className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-wider">
                  SPOTIFY INSIGHTS
                </h1>
                {user && (
                  <p
                    className="text-xs"
                    style={{ color: currentTheme.colors.textSecondary }}
                  >
                    {user.display_name}
                  </p>
                )}
              </div>
            </motion.div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="px-4 py-2 border-2 rounded-lg text-sm font-black tracking-wider transition-all"
                style={{
                  borderColor: currentTheme.colors.border,
                  color: currentTheme.colors.primary,
                }}
              >
                <LogOut className="w-4 h-4 inline mr-2" />
                EXIT
              </button>
            </div>
          </div>

          <div className="border-t-2" style={{ borderColor: currentTheme.colors.border }}>
            <div className="container mx-auto px-6">
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 py-4 min-w-min">
                  {TABS.map((tab, i) => (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(i)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-4 py-2 rounded-lg text-xs font-black tracking-wider whitespace-nowrap border-2 transition-all ${
                        activeTab === i ? 'translate-y-0' : ''
                      }`}
                      style={{
                        backgroundColor: activeTab === i ? currentTheme.colors.primary : 'transparent',
                        borderColor: currentTheme.colors.border,
                        color: activeTab === i ? '#000000' : currentTheme.colors.primary,
                        boxShadow: activeTab === i ? `0 4px 0 0 ${currentTheme.colors.primary}` : 'none',
                      }}
                    >
                      {tab.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-6 py-12">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CurrentComponent token={token} />
          </motion.div>
        </main>

        <footer
          className="border-t-2 mt-12 py-8"
          style={{ borderColor: `${currentTheme.colors.border}40` }}
        >
          <div className="container mx-auto px-6 text-center">
            <p
              className="text-xs tracking-widest font-black mb-2"
              style={{ color: currentTheme.colors.primary }}
            >
              ━━━━━━━━━━━━━━━━━━━
            </p>
            <p
              className="text-xs"
              style={{ color: currentTheme.colors.textSecondary }}
            >
              CAPSULE OS • Deterministic Spotify Analytics
              <br />
              Your data is processed locally. We never store your history.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
