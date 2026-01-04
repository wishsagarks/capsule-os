import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { InteractiveDashboard } from './components/InteractiveDashboard';
import { SpotifyCallback } from './components/SpotifyCallback';
import { KnowYourself } from './components/KnowYourself';
import { SpotifyAnalytics } from './components/SpotifyAnalytics';
import { SetupPage } from './components/SetupPage';
import { ProfilePage } from './components/ProfilePage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-500 font-black text-xl tracking-widest">
          INITIALIZING CAPSULE OS...
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function SpotifyAnalyticsRoute() {
  const token = localStorage.getItem('spotify_token');

  if (!token) {
    return <Navigate to="/know-yourself" replace />;
  }

  return <SpotifyAnalytics token={token} />;
}

function AppRoutes() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-500 font-black text-xl tracking-widest">
          INITIALIZING CAPSULE OS...
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={session ? <Navigate to="/setup" replace /> : <LoginPage />}
      />
      <Route
        path="/setup"
        element={
          <ProtectedRoute>
            <SetupPage onSetupComplete={() => window.location.href = '/dashboard'} />
          </ProtectedRoute>
        }
      />
      <Route path="/know-yourself" element={<KnowYourself />} />
      <Route path="/spotify-analytics" element={<SpotifyAnalyticsRoute />} />
      <Route path="/spotify/callback" element={<SpotifyCallback />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <InteractiveDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
