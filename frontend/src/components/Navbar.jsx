import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code, LogOut, User, Trophy, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const isProfileActive = location.pathname === '/dashboard' && searchParams.get('view') === 'profile';
  const isDashboardActive = location.pathname === '/dashboard' && !isProfileActive;
  const isProblemsActive = location.pathname.startsWith('/problems') || location.pathname.startsWith('/submissions');
  const isContestsActive = location.pathname.startsWith('/contests');

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="navbar">
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
        <div style={{ backgroundColor: 'var(--primary-glow)', padding: '8px', borderRadius: '10px', border: '1px solid rgba(79, 70, 229, 0.2)', display: 'flex', alignItems: 'center' }}>
          <Code size={24} color="var(--primary)" />
        </div>
        <span style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '0.04em', fontFamily: 'var(--font-sans)' }}>
          <span style={{ color: 'var(--color-text-main)' }}>Code</span>
          <span style={{ color: 'var(--primary)' }}>Plex</span>
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        {user ? (
          <>
            <Link 
              to="/dashboard" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                color: isDashboardActive ? 'var(--primary)' : 'var(--color-text-muted)', 
                textDecoration: 'none', 
                fontSize: '14px', 
                fontWeight: '600', 
                transition: 'var(--transition-smooth)' 
              }}
            >
              <LayoutDashboard size={18} />
              <span className="nav-text">Dashboard</span>
            </Link>
            <Link 
              to="/problems" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                color: isProblemsActive ? 'var(--primary)' : 'var(--color-text-muted)', 
                textDecoration: 'none', 
                fontSize: '14px', 
                fontWeight: '600', 
                transition: 'var(--transition-smooth)' 
              }}
            >
              <Code size={18} />
              <span className="nav-text">Problems</span>
            </Link>
            <Link 
              to="/contests" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                color: isContestsActive ? 'var(--primary)' : 'var(--color-text-muted)', 
                textDecoration: 'none', 
                fontSize: '14px', 
                fontWeight: '600', 
                transition: 'var(--transition-smooth)' 
              }}
            >
              <Trophy size={18} />
              <span className="nav-text">Contests</span>
            </Link>
            
            <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-glass)' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link 
                to="/dashboard?view=profile" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '6px 12px', 
                  borderRadius: '20px', 
                  backgroundColor: isProfileActive ? 'var(--primary-glow)' : 'rgba(255, 255, 255, 0.05)', 
                  border: isProfileActive ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
                  textDecoration: 'none',
                  color: isProfileActive ? 'var(--primary-hover)' : 'inherit',
                  transition: 'var(--transition-smooth)'
                }}
                className="profile-btn-nav"
              >
                <User size={16} color="var(--primary)" />
                <span className="nav-text" style={{ fontSize: '13px', fontWeight: '600' }}>{user.username}</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LogOut size={14} />
                <span className="nav-text">Logout</span>
              </button>
            </div>
          </>
        ) : null}
      </div>
    </nav>
  );
};

export default Navbar;
