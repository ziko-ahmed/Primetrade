import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import AdminAuth from './pages/AdminAuth';
import Dashboard from './pages/Dashboard';
import AdminUsers from './pages/AdminUsers';
import LandingPage from './pages/LandingPage';

// Protected User Route
const ProtectedUserRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/user/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return children;
};

// Protected Admin Route
const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/user/dashboard" replace />;
  return children;
};

// Public Route Wrapper
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    return <Navigate to={user.role === 'admin' ? "/admin/dashboard" : "/user/dashboard"} replace />;
  }
  return children;
};

function App() {
  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col">
      <Navbar />
      <main className="flex-1 w-full relative">
        <Routes>
          <Route path="/" element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } />

          <Route path="/user/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          <Route path="/user/register" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          <Route path="/admin/login" element={
            <PublicRoute>
              <AdminAuth />
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

          {/* Catch-all redirects for old URLs */}
          <Route path="/login" element={<Navigate to="/user/login" replace />} />
          <Route path="/register" element={<Navigate to="/user/register" replace />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
