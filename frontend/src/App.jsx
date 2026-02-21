import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AnnouncementBanner from './components/AnnouncementBanner';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminUsers from './pages/AdminUsers';
import LandingPage from './pages/LandingPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

// Protected User Route
const ProtectedUserRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'superadmin') return <Navigate to="/super-admin/dashboard" replace />;
  return children;
};

// Protected Admin Route
const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'user') return <Navigate to="/user/dashboard" replace />;
  return children;
};

// Public Route Wrapper
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    if (user.role === 'superadmin') return <Navigate to="/super-admin/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/user/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col">
      <AnnouncementBanner />
      <Navbar />
      <main className="flex-1 w-full relative">
        <Routes>
          <Route path="/" element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } />

          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          <Route path="/register" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          <Route path="/user/dashboard" element={
            <ProtectedUserRoute>
              <Dashboard />
            </ProtectedUserRoute>
          } />

          <Route path="/admin/dashboard" element={
            <ProtectedAdminRoute>
              <Dashboard />
            </ProtectedAdminRoute>
          } />

          <Route path="/admin/users" element={
            <ProtectedAdminRoute>
              <AdminUsers />
            </ProtectedAdminRoute>
          } />

          <Route path="/super-admin/dashboard" element={
            <ProtectedAdminRoute>
              <SuperAdminDashboard />
            </ProtectedAdminRoute>
          } />

          {/* Catch-all redirects for old URLs */}
          <Route path="/user/login" element={<Navigate to="/login" replace />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route path="/user/register" element={<Navigate to="/register" replace />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
