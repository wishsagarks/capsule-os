import { motion, AnimatePresence } from 'framer-motion';
import { Palette } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { currentTheme, themeName, setTheme, themeNames } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all"
        style={{
          backgroundColor: currentTheme.colors.primary,
          borderColor: currentTheme.colors.border,
          boxShadow: `0 2px 0 0 ${currentTheme.colors.border}`,
        }}
      >
        <Palette className="w-5 h-5 text-black" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute right-0 top-full mt-2 p-3 border-2 rounded-xl shadow-lg z-50 min-w-[200px]"
              style={{
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.border,
              }}
            >
              <p
                className="text-xs font-black tracking-widest mb-3 uppercase"
                style={{ color: currentTheme.colors.textSecondary }}
              >
                Select Theme
              </p>
              <div className="space-y-2">
                {themeNames.map((name) => (
                  <motion.button
                    key={name}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setTheme(name);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold tracking-wide transition-all border-2 ${
                      themeName === name ? 'translate-x-1' : ''
                    }`}
                    style={{
                      backgroundColor:
                        themeName === name
                          ? currentTheme.colors.primary
                          : 'transparent',
                      borderColor:
                        themeName === name
                          ? currentTheme.colors.border
                          : 'transparent',
                      color:
                        themeName === name
                          ? '#000000'
                          : currentTheme.colors.text,
                    }}
                  >
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
