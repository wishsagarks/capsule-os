import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Globe, Zap, Save, ArrowLeft, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
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

export function ProfilePage() {
  const { session } = useAuth();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('US');
  const [email, setEmail] = useState('');
  const [providerType, setProviderType] = useState('');

  useEffect(() => {
    loadProfile();
  }, [session]);

  const loadProfile = async () => {
    if (!session) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setDisplayName(data.display_name || '');
        setPhone(data.phone || '');
        setCountry(data.country || 'US');
        setEmail(data.email || session.user.email || '');
        setProviderType(data.provider_type || 'email');
      } else {
        setEmail(session.user.email || '');
        const provider = session.user.app_metadata?.provider || 'email';
        setProviderType(provider);

        const userMetadata = session.user.user_metadata;
        if (userMetadata) {
          setFirstName(userMetadata.first_name || userMetadata.given_name || '');
          setLastName(userMetadata.last_name || userMetadata.family_name || '');
          setDisplayName(userMetadata.display_name || userMetadata.full_name || userMetadata.name || '');
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!session) throw new Error('Not authenticated');

      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();

      const profileData = {
        auth_user_id: session.user.id,
        email: session.user.email,
        first_name: firstName,
        last_name: lastName,
        display_name: displayName,
        phone: phone || null,
        country,
        provider_type: providerType,
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        const { error: updateError } = await supabase
          .from('users')
          .update(profileData)
          .eq('auth_user_id', session.user.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('users')
          .insert(profileData);

        if (insertError) throw insertError;
      }

      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
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
            LOADING PROFILE...
          </p>
        </div>
      </div>
    );
  }

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

      <div className="relative z-10 container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
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
                <User className="w-8 h-8 text-black" />
              </div>
            </motion.div>

            <h1
              className="text-4xl md:text-5xl font-black tracking-tighter mb-4 bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(90deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary}, ${currentTheme.colors.primary})`,
              }}
            >
              PROFILE MANAGEMENT
            </h1>
            <p className="text-sm tracking-widest font-black" style={{ color: currentTheme.colors.secondary }}>
              UPDATE YOUR PERSONAL INFORMATION
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 border-2 bg-red-500/20 border-red-500 text-red-300 text-sm font-black rounded-xl"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 border-2 bg-green-500/20 border-green-500 text-green-300 text-sm font-black rounded-xl"
            >
              {success}
            </motion.div>
          )}

          <form onSubmit={handleSave} className="space-y-6 border-4 rounded-2xl p-8" style={{ backgroundColor: `${currentTheme.colors.surface}cc`, borderColor: currentTheme.colors.border }}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black tracking-widest mb-2" style={{ color: currentTheme.colors.primary }}>
                  FIRST NAME
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                  <input
                    type="text"
                    placeholder="FIRST NAME"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
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
                <label className="block text-xs font-black tracking-widest mb-2" style={{ color: currentTheme.colors.primary }}>
                  LAST NAME
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                  <input
                    type="text"
                    placeholder="LAST NAME"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
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
              <label className="block text-xs font-black tracking-widest mb-2" style={{ color: currentTheme.colors.primary }}>
                DISPLAY NAME
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                <input
                  type="text"
                  placeholder="DISPLAY NAME"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
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
              <label className="block text-xs font-black tracking-widest mb-2" style={{ color: currentTheme.colors.primary }}>
                EMAIL
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full pl-12 pr-4 py-3 border-2 rounded-xl font-black text-sm tracking-wider opacity-60 cursor-not-allowed"
                  style={{
                    backgroundColor: currentTheme.colors.background,
                    borderColor: currentTheme.colors.border,
                    color: currentTheme.colors.text,
                  }}
                />
              </div>
              <p className="text-xs mt-2" style={{ color: currentTheme.colors.textSecondary }}>
                Email cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-xs font-black tracking-widest mb-2" style={{ color: currentTheme.colors.primary }}>
                COUNTRY
              </label>
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
              <label className="block text-xs font-black tracking-widest mb-2" style={{ color: currentTheme.colors.primary }}>
                PHONE (OPTIONAL)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                <input
                  type="tel"
                  placeholder="PHONE NUMBER"
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

            <div className="pt-6 border-t-2" style={{ borderColor: currentTheme.colors.border }}>
              <button
                type="submit"
                disabled={saving}
                className="w-full text-black font-black py-4 border-2 text-sm tracking-widest rounded-xl active:translate-y-1 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-3"
                style={{
                  backgroundColor: currentTheme.colors.primary,
                  borderColor: currentTheme.colors.border,
                  boxShadow: `0 4px 0 0 ${currentTheme.colors.secondary}`,
                }}
              >
                {saving ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    SAVING...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    SAVE PROFILE
                  </>
                )}
              </button>
            </div>

            <div className="text-center pt-4">
              <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>
                Provider: <span className="font-black">{providerType.toUpperCase()}</span>
              </p>
            </div>
          </form>
        </motion.div>
      </div>

      <footer className="relative z-10 container mx-auto px-6 py-12 text-center border-t-2" style={{ borderColor: `${currentTheme.colors.border}20` }}>
        <p className="text-xs tracking-widest font-black mb-4" style={{ color: currentTheme.colors.primary }}>━━━━━━━━━━━━━━━━━━━</p>
        <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
          CapsuleOS © 2026 • Your Data, Your Control
        </p>
      </footer>
    </div>
  );
}
