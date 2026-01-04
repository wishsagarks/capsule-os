import { useState, useEffect, useRef } from 'react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const { currentTheme } = useTheme();

  useEffect(() => {
    loadUserProfile();
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadUserProfile = async () => {
    if (!session) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('display_name, first_name')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();

      if (data) {
        setDisplayName(data.display_name || data.first_name || session.user.email?.split('@')[0] || 'User');
      } else {
        const metadata = session.user.user_metadata;
        setDisplayName(
          metadata?.display_name ||
          metadata?.full_name ||
          metadata?.name ||
          session.user.email?.split('@')[0] ||
          'User'
        );
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setDisplayName(session.user.email?.split('@')[0] || 'User');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = () => {
    return displayName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div
        className="w-10 h-10 rounded-lg border-2 flex items-center justify-center animate-pulse"
        style={{
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.border,
        }}
      >
        <User className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200"
        style={{
          backgroundColor: currentTheme.colors.surface,
          borderColor: isOpen ? currentTheme.colors.primary : currentTheme.colors.border,
        }}
      >
        <div
          className="w-8 h-8 rounded-lg border-2 flex items-center justify-center font-black text-xs"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
            borderColor: currentTheme.colors.border,
            color: '#000',
          }}
        >
          {getInitials()}
        </div>
        <span className="hidden md:block font-black text-sm tracking-wider" style={{ color: currentTheme.colors.text }}>
          {displayName}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: currentTheme.colors.primary }}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 border-4 rounded-xl shadow-2xl overflow-hidden z-50"
            style={{
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.border,
            }}
          >
            <div className="p-4 border-b-2" style={{ borderColor: currentTheme.colors.border }}>
              <p className="text-xs font-black tracking-widest mb-1" style={{ color: currentTheme.colors.primary }}>
                SIGNED IN AS
              </p>
              <p className="font-black text-sm truncate" style={{ color: currentTheme.colors.text }}>
                {displayName}
              </p>
              <p className="text-xs truncate mt-1" style={{ color: currentTheme.colors.textSecondary }}>
                {session?.user.email}
              </p>
            </div>

            <div className="p-2">
              <button
                onClick={() => {
                  navigate('/profile');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-left transition-all duration-200 hover:translate-x-1 mb-2"
                style={{
                  backgroundColor: currentTheme.colors.background,
                  borderColor: currentTheme.colors.border,
                  color: currentTheme.colors.text,
                }}
              >
                <Settings className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                <div>
                  <p className="font-black text-sm tracking-wider">PROFILE</p>
                  <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                    Manage your account
                  </p>
                </div>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-left transition-all duration-200 hover:translate-x-1"
                style={{
                  backgroundColor: currentTheme.colors.background,
                  borderColor: currentTheme.colors.border,
                  color: currentTheme.colors.text,
                }}
              >
                <LogOut className="w-5 h-5" style={{ color: currentTheme.colors.secondary }} />
                <div>
                  <p className="font-black text-sm tracking-wider">SIGN OUT</p>
                  <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                    End your session
                  </p>
                </div>
              </button>
            </div>

            <div className="p-3 border-t-2 text-center" style={{ borderColor: currentTheme.colors.border }}>
              <p className="text-xs font-black tracking-widest" style={{ color: currentTheme.colors.primary }}>
                CAPSULE OS v1.0
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
