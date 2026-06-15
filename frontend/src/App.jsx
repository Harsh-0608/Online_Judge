import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Problems from './pages/Problems';
import ProblemDetail from './pages/ProblemDetail';
import Contests from './pages/Contests';
import SubmissionDetail from './pages/SubmissionDetail';

// Route protection wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-glass)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <span style={{ fontSize: '15px', color: 'var(--color-text-muted)', fontWeight: '600', letterSpacing: '0.02em' }}>
          Verifying credentials...
        </span>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/auth" element={
            <>
              <Navbar />
              <Auth />
            </>
          } />

          {/* Protected Main Application Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/problems" element={
            <ProtectedRoute>
              <Problems />
            </ProtectedRoute>
          } />

          <Route path="/problems/:slug" element={
            <ProtectedRoute>
              <ProblemDetail />
            </ProtectedRoute>
          } />

          <Route path="/contests" element={
            <ProtectedRoute>
              <Contests />
            </ProtectedRoute>
          } />

          <Route path="/submissions/:id" element={
            <ProtectedRoute>
              <SubmissionDetail />
            </ProtectedRoute>
          } />

          {/* Catch-all redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
