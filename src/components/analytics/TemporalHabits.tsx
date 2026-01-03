import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { getRecentlyPlayed } from '../../lib/spotify';

export function TemporalHabits({ token }: { token: string }) {
  const { currentTheme } = useTheme();
  const [habits, setHabits] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHabits() {
      try {
        const recent = await getRecentlyPlayed(token, 50);

        const hourMap = new Map<number, number>();
        const dayMap = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

        recent.items.forEach((item: any) => {
          const date = new Date(item.played_at);
          const hour = date.getHours();
          const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];

          hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
          dayMap[day as keyof typeof dayMap]++;
        });

        const peakHour = Array.from(hourMap.entries()).sort((a, b) => b[1] - a[1])[0];
        const peakDay = Object.entries(dayMap).sort((a, b) => b[1] as any - a[1] as any)[0];

        setHabits({
          peakHour: peakHour[0],
          peakDay: peakDay[0],
          sessionCount: recent.items.length,
          hourDistribution: hourMap,
          dayDistribution: dayMap,
        });
      } catch (error) {
        console.error('Error loading temporal habits:', error);
      } finally {
        setLoading(false);
      }
    }
    loadHabits();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div style={{ color: currentTheme.colors.primary }} className="font-black tracking-widest text-lg">
          ANALYZING TEMPORAL PATTERNS...
        </div>
      </div>
    );
  }

  if (!habits) return null;

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const maxHourCount = Math.max(...Array.from(habits.hourDistribution.values()));

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-4xl font-black tracking-widest mb-8">
          TEMPORAL LISTENING HABITS
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border-3 rounded-xl p-6"
            style={{
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.primary,
            }}
          >
            <div className="text-sm font-black tracking-widest mb-2" style={{ color: currentTheme.colors.textSecondary }}>
              PEAK LISTENING HOUR
            </div>
            <div className="text-4xl font-black" style={{ color: currentTheme.colors.primary }}>
              {habits.peakHour}:00
            </div>
            <p className="text-xs mt-2" style={{ color: currentTheme.colors.textSecondary }}>
              {habits.peakHour < 12
                ? '🌅 Morning'
                : habits.peakHour < 18
                ? '☀️ Afternoon'
                : habits.peakHour < 21
                ? '🌆 Evening'
                : '🌙 Night'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="border-3 rounded-xl p-6"
            style={{
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.primary,
            }}
          >
            <div className="text-sm font-black tracking-widest mb-2" style={{ color: currentTheme.colors.textSecondary }}>
              PEAK LISTENING DAY
            </div>
            <div className="text-4xl font-black" style={{ color: currentTheme.colors.primary }}>
              {habits.peakDay}
            </div>
            <p className="text-xs mt-2" style={{ color: currentTheme.colors.textSecondary }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(habits.peakDay) ? '💼 Weekday' : '🎉 Weekend'}
            </p>
          </motion.div>
        </div>

        <div className="border-2 rounded-xl p-8" style={{ borderColor: currentTheme.colors.border }}>
          <h3 className="text-lg font-black tracking-wider mb-6">
            HOURLY LISTENING HEATMAP
          </h3>
          <div className="space-y-3">
            {hours.map((hour) => {
              const count = habits.hourDistribution.get(hour) || 0;
              const percentage = maxHourCount > 0 ? (count / maxHourCount) * 100 : 0;

              return (
                <motion.div
                  key={hour}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: hour * 0.02 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-12 text-xs font-black text-right">{hour.toString().padStart(2, '0')}:00</div>
                  <div className="flex-1 h-8 rounded-lg overflow-hidden bg-opacity-20" style={{ backgroundColor: currentTheme.colors.primary }}>
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        background: `linear-gradient(90deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
                      }}
                    />
                  </div>
                  <div className="w-8 text-xs font-black text-right">{count}</div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="border-2 rounded-xl p-8" style={{ borderColor: currentTheme.colors.border }}>
          <h3 className="text-lg font-black tracking-wider mb-6">
            DAILY PATTERN
          </h3>
          <div className="grid grid-cols-7 gap-3">
            {Object.entries(habits.dayDistribution).map(([day, count], i) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="text-center p-4 border-2 rounded-lg"
                style={{
                  backgroundColor: currentTheme.colors.surface,
                  borderColor: currentTheme.colors.border,
                }}
              >
                <div className="text-xs font-black tracking-wide">{day}</div>
                <div
                  className="text-2xl font-black mt-2"
                  style={{ color: currentTheme.colors.primary }}
                >
                  {count}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
