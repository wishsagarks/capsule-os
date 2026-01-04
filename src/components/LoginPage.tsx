import { useState } from 'react';
import { Zap, ArrowLeft, Mail, Lock, User, Phone, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'IN', name: 'India' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'KR', name: 'South Korea' },
  { code: 'SG', name: 'Singapore' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'OTHER', name: 'Other' },
];

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('US');
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        if (!firstName || !lastName || !displayName) {
          throw new Error('Please fill in all required fields');
        }

        const { data, error: signUpError } = await signUpWithEmail(email, password, {
          first_name: firstName,
          last_name: lastName,
          display_name: displayName,
          phone: phone || null,
          country,
          provider_type: 'email',
        });

        if (signUpError) throw signUpError;

        setError('Check your email for confirmation link');
        setLoading(false);
      } else {
        await signInWithEmail(email, password);
        navigate('/setup');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const resetForm = () => {
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setDisplayName('');
    setPhone('');
    setCountry('US');
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
          <p className="text-xs tracking-widest font-black" style={{ color: currentTheme.colors.primary }}>PERSONAL INTELLIGENCE NEXUS</p>
        </div>

        <div className="space-y-6 border-4 rounded-2xl p-8 max-h-[calc(100vh-300px)] overflow-y-auto" style={{ backgroundColor: `${currentTheme.colors.surface}cc`, borderColor: currentTheme.colors.border }}>
          <div className="text-center mb-6">
            <h2 className="text-xl font-black text-white tracking-wider mb-2">SECURE AUTHENTICATION</h2>
            <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
              {isSignUp ? 'Create your account to continue' : 'Sign in to access your personal intelligence'}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 border-2 rounded-lg text-xs font-black ${
                error.includes('Check your email')
                  ? 'bg-green-500/20 border-green-500 text-green-300'
                  : 'bg-red-500/20 border-red-500 text-red-300'
              }`}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                      <input
                        type="text"
                        placeholder="FIRST NAME"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required={isSignUp}
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
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                      <input
                        type="text"
                        placeholder="LAST NAME"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required={isSignUp}
                        className="w-full pl-12 pr-4 py-3 border-2 rounded-xl font-black text-sm tracking-wider placeholder:text-xs focus:outline-none transition-all duration-200"
                        style={{
                          backgroundColor: currentTheme.colors.background,
                          borderColor: currentTheme.colors.border,
                          color: currentTheme.colors.text,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                    <input
                      type="text"
                      placeholder="DISPLAY NAME"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required={isSignUp}
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
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 rounded-xl font-black text-sm tracking-wider focus:outline-none transition-all duration-200 appearance-none"
                      style={{
                        backgroundColor: currentTheme.colors.background,
                        borderColor: currentTheme.colors.border,
                        color: currentTheme.colors.text,
                      }}
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                    <input
                      type="tel"
                      placeholder="PHONE (OPTIONAL)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 rounded-xl font-black text-sm tracking-wider placeholder:text-xs focus:outline-none transition-all duration-200"
                      style={{
                        backgroundColor: currentTheme.colors.background,
                        borderColor: currentTheme.colors.border,
                        color: currentTheme.colors.text,
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                <input
                  type="email"
                  placeholder="EMAIL ADDRESS"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
                  placeholder="PASSWORD"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {isSignUp && (
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
            )}

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
              {loading ? 'AUTHENTICATING...' : isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                resetForm();
              }}
              className="text-sm font-black tracking-wider hover:underline transition-all duration-200"
              style={{ color: currentTheme.colors.secondary }}
            >
              {isSignUp ? 'ALREADY HAVE AN ACCOUNT? SIGN IN' : "DON'T HAVE AN ACCOUNT? SIGN UP"}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2" style={{ borderColor: currentTheme.colors.border }}></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 text-xs font-black tracking-widest" style={{ backgroundColor: currentTheme.colors.surface, color: currentTheme.colors.textSecondary }}>
                OR
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full text-black font-black py-4 border-2 text-sm tracking-widest rounded-xl active:translate-y-1 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-3"
            style={{
              backgroundColor: currentTheme.colors.text,
              borderColor: currentTheme.colors.border,
              boxShadow: `0 4px 0 0 ${currentTheme.colors.primary}`,
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? 'AUTHENTICATING...' : 'SIGN IN WITH GOOGLE'}
          </button>

          <div className="pt-4 border-t-2" style={{ borderColor: currentTheme.colors.border }}>
            <p className="text-xs text-center leading-relaxed" style={{ color: currentTheme.colors.textSecondary }}>
              By signing in, you agree to our data privacy practices. Your data remains yours and is never shared.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center space-y-3">
          <p className="text-xs tracking-widest font-black" style={{ color: currentTheme.colors.primary }}>━━━━━━━━━━━━━━━━━━━</p>
          <p className="text-xs leading-relaxed max-w-sm mx-auto" style={{ color: currentTheme.colors.textSecondary }}>
            CapsuleOS synthesizes behavioral data across multiple life dimensions—transforming
            fragmented digital signals into coherent self-insight.
          </p>
          <p className="text-xs tracking-widest font-black" style={{ color: currentTheme.colors.secondary }}>SECURE • PRIVATE • DETERMINISTIC</p>
        </div>
      </motion.div>
    </div>
  );
}
