import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';

export function ProfileButton() {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate('/profile')}
      className="w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all duration-200"
      style={{
        backgroundColor: currentTheme.colors.surface,
        borderColor: currentTheme.colors.border,
      }}
      title="Profile"
    >
      <User className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
    </motion.button>
  );
}
