import { useState } from 'react';
import { Lock, Zap, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { useNavigate } from 'react-router-dom';

export function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { updatePassword } = useAuth();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      await updatePassword(newPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 overflow-hidden transition-colors duration-500" style={{ backgroundColor: currentTheme.colors.background }}>
      <div className="absolute top-6 left-6 z-50">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-black text-sm tracking-wider transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.border,
            color: currentTheme.colors.primary,
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          BACK
        </button>
      </div>

      <div className="absolute top-6 right-6 z-50">
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block w-16 h-16 border-4 rounded-xl mb-6"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
              borderColor: currentTheme.colors.border,
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-black" />
            </div>
          </motion.div>

          <h1 className="text-5xl font-black text-white mb-2 tracking-widest">CAPSULE OS</h1>
          <p className="text-xs tracking-widest font-black" style={{ color: currentTheme.colors.primary }}>RESET YOUR PASSWORD</p>
        </div>

        <div className="space-y-6 border-4 rounded-2xl p-8" style={{ backgroundColor: `${currentTheme.colors.surface}cc`, borderColor: currentTheme.colors.border }}>
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: currentTheme.colors.primary }} />
              <h2 className="text-2xl font-black text-white mb-2">PASSWORD UPDATED!</h2>
              <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                Redirecting you to dashboard...
              </p>
            </motion.div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl font-black text-white tracking-wider mb-2">CREATE NEW PASSWORD</h2>
                <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                  Enter your new password below
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 border-2 bg-red-500/20 border-red-500 text-red-300 text-xs font-black rounded-xl"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                    <input
                      type="password"
                      placeholder="NEW PASSWORD"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-12 pr-4 py-3 border-2 rounded-xl font-black text-sm tracking-wider placeholder:text-xs focus:outline-none transition-all duration-200"
                      style={{
                        backgroundColor: currentTheme.colors.background,
                        borderColor: currentTheme.colors.border,
                        color: currentTheme.colors.text,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                    <input
                      type="password"
                      placeholder="CONFIRM PASSWORD"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-12 pr-4 py-3 border-2 rounded-xl font-black text-sm tracking-wider placeholder:text-xs focus:outline-none transition-all duration-200"
                      style={{
                        backgroundColor: currentTheme.colors.background,
                        borderColor: currentTheme.colors.border,
                        color: currentTheme.colors.text,
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-black font-black py-4 border-2 text-sm tracking-widest rounded-xl active:translate-y-1 transition-all duration-200 disabled:opacity-50"
                  style={{
                    backgroundColor: currentTheme.colors.primary,
                    borderColor: currentTheme.colors.border,
                    boxShadow: `0 4px 0 0 ${currentTheme.colors.secondary}`,
                  }}
                >
                  {loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
                </button>
              </form>

              <div className="pt-4 border-t-2" style={{ borderColor: currentTheme.colors.border }}>
                <p className="text-xs text-center leading-relaxed" style={{ color: currentTheme.colors.textSecondary }}>
                  Your password must be at least 6 characters long
                </p>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 text-center space-y-3">
          <p className="text-xs tracking-widest font-black" style={{ color: currentTheme.colors.primary }}>━━━━━━━━━━━━━━━━━━━</p>
          <p className="text-xs leading-relaxed max-w-sm mx-auto" style={{ color: currentTheme.colors.textSecondary }}>
            Secure your personal intelligence with a strong password
          </p>
          <p className="text-xs tracking-widest font-black" style={{ color: currentTheme.colors.secondary }}>SECURE • PRIVATE • DETERMINISTIC</p>
        </div>
      </motion.div>
    </div>
  );
}
