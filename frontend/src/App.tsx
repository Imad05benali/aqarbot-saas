import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './pages/Dashboard';
import CRM from './pages/CRM';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import Pricing from './pages/Pricing';
import Layout from './components/Layout';

// Component to protect routes that require authentication
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { isLoadingProfile } = useProfile();

  // Gate 1: Wait for Supabase Auth session to fully resolve
  // Gate 2: Wait for profile row fetch to complete before ANY child renders
  if (isLoading || (isAuthenticated && isLoadingProfile)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-500/20 rounded-full" />
            <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin absolute inset-0" />
          </div>
          <span className="text-emerald-400 font-medium text-sm tracking-widest uppercase animate-pulse">
            Chargement sécurisé du tableau de bord...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login...');
    window.location.replace('http://localhost:3000/auth/login');
    return null;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Protected Routes Wrapper (Layout) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="crm" element={<CRM />} />
        <Route path="chat" element={<Chat />} />
        <Route path="settings" element={<Settings />} />
        <Route path="pricing" element={<Pricing />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProfileProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
