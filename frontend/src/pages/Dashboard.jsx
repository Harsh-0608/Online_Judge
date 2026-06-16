import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Mail, Calendar, CheckCircle, Award, Zap, Code, XCircle, Clock, TrendingUp, Trophy, Flame, ChevronRight, BarChart2, ShieldAlert, Circle, ArrowRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { API_BASE } from '../config';

const Dashboard = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({ timeEfficiency: 0, spaceEfficiency: 0, solvedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [loadingAllSubmissions, setLoadingAllSubmissions] = useState(false);
  const [searchParams] = useSearchParams();

  const view = searchParams.get('view');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const probRes = await fetch(`${API_BASE}/problems`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const probData = await probRes.json();

        const subRes = await fetch(`${API_BASE}/problems/submissions/recent`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const subData = await subRes.json();

        const lbRes = await fetch(`${API_BASE}/contests/leaderboard/global`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const lbData = await lbRes.json();

        const statsRes = await fetch(`${API_BASE}/problems/submissions/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const statsData = await statsRes.json();

        if (probData.success && subData.success) {
          setProblems(probData.problems);
          setRecentSubmissions(subData.submissions);
          if (lbData.success) {
            setLeaderboard(lbData.standings);
          }
          if (statsData.success) {
            setStats({
              timeEfficiency: statsData.timeEfficiency,
              spaceEfficiency: statsData.spaceEfficiency,
              solvedCount: statsData.solvedCount
            });
          }
        } else {
          setError(probData.message || subData.message);
        }
      } catch (err) {
        setError('Failed to connect to CodePlex servers');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (view === 'submissions') {
      const fetchAllSubmissions = async () => {
        setLoadingAllSubmissions(true);
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE}/problems/submissions/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            setAllSubmissions(data.submissions);
          }
        } catch (err) {
          console.error('Failed to load all submissions:', err);
        } finally {
          setLoadingAllSubmissions(false);
        }
      };
      fetchAllSubmissions();
    }
  }, [view]);

  if (!user) return null;

  const totalProblemsCount = problems.length;
  const solvedProblemsCount = problems.filter(p => p.isSolved).length;

  const getDifficultyStats = (difficulty) => {
    const categoryProblems = problems.filter(p => p.difficulty === difficulty);
    const solvedCategory = categoryProblems.filter(p => p.isSolved).length;
    return {
      solved: solvedCategory,
      total: categoryProblems.length
    };
  };

  const easyStats = getDifficultyStats('Easy');
  const mediumStats = getDifficultyStats('Medium');
  const hardStats = getDifficultyStats('Hard');

  const totalProblems = totalProblemsCount || 1;
  const solvePercent = Math.round((solvedProblemsCount / totalProblems) * 100);

  // Deterministic daily challenge selection (Easy -> Medium -> Hard cycle changing daily)
  const getDailyChallenge = () => {
    if (problems.length === 0) return null;
    const dayNumber = Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24));
    const difficulties = ['Easy', 'Medium', 'Hard'];
    const targetDifficulty = difficulties[dayNumber % 3];
    const candidates = problems.filter(p => p.difficulty === targetDifficulty);
    if (candidates.length === 0) {
      return problems[dayNumber % problems.length];
    }
    return candidates[dayNumber % candidates.length];
  };

  const dailyChallenge = getDailyChallenge();

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return 'var(--color-text-muted)';
    }
  };

  const getProblemAge = (createdAt) => {
    if (!createdAt) return 'Recently';
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) return `${diffMins || 1}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    
    return created.toLocaleDateString();
  };

  const CircleProgress = ({ percent, color, size = 120, strokeWidth = 10 }) => {
    const r = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * r;
    const offset = circumference * (1 - percent / 100);
    return (
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} fill="transparent" />
        <circle
          cx={size/2} cy={size/2} r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease-in-out', filter: `drop-shadow(0 0 6px ${color}60)` }}
        />
      </svg>
    );
  };

  const ProgressBar = ({ value, max, color, height = 8 }) => {
    const pct = max > 0 ? (value / max) * 100 : 0;
    return (
      <div style={{ height, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: height, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: height, transition: 'width 1s ease-in-out' }} />
      </div>
    );
  };

  const getStatusBadge = (status) => {
    let color = '#ef4444';
    let glow = 'var(--danger-glow)';

    if (status === 'Accepted') {
      color = '#10b981';
      glow = 'var(--success-glow)';
    }

    return (
      <span style={{
        fontSize: '11px',
        fontWeight: '800',
        color: color,
        backgroundColor: glow,
        padding: '4px 10px',
        borderRadius: '20px',
        border: `1px solid ${color}30`
      }}>
        {status}
      </span>
    );
  };

  const getLanguageLabel = (lang) => {
    switch (lang) {
      case 'javascript': return 'JavaScript';
      case 'python': return 'Python 3';
      case 'cpp': return 'C++ (GCC)';
      case 'java': return 'Java (JDK 23)';
      default: return lang;
    }
  };

  // If URL includes view=submissions, render all user submissions list
  if (view === 'submissions') {
    return (
      <div style={{ padding: '36px 40px', maxWidth: '1280px', margin: '0 auto', minHeight: 'calc(100vh - 70px)', background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent 40%)' }}>
        {/* Header Block */}
        <div className="glass-card animate-fade-in" style={{
          marginBottom: '28px', padding: '24px 32px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(12,15,26,0.6) 60%)',
          borderLeft: '4px solid var(--primary)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--primary-hover)' }}>
              Submission Logs
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--color-text-main)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Code size={26} color="var(--primary)" />
              All Submissions
            </h1>
          </div>
          <Link to="/dashboard" className="btn btn-outline" style={{ fontSize: '13px', padding: '8px 18px' }}>
            Back to Dashboard
          </Link>
        </div>

        {/* Submissions List */}
        <div className="glass-card animate-fade-in" style={{ padding: '24px 28px' }}>
          {loadingAllSubmissions ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-glass)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <span style={{ color: 'var(--color-text-muted)', fontWeight: '600' }}>Loading submissions...</span>
            </div>
          ) : allSubmissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-muted)' }}>
              <p style={{ margin: 0, fontSize: '13.5px' }}>No submissions found.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--color-text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Problem</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Language</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Runtime</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700' }}>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {allSubmissions.map((sub) => (
                    <tr key={sub._id} style={{ borderBottom: '1px solid var(--border-glass)', transition: 'var(--transition-smooth)' }} className="problem-row-hover">
                      <td style={{ padding: '14px 16px', fontWeight: '700' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {sub.status === 'Accepted' ? (
                            <CheckCircle size={15} color="#10b981" style={{ flexShrink: 0 }} />
                          ) : (
                            <XCircle size={15} color="#ef4444" style={{ flexShrink: 0 }} />
                          )}
                          {sub.problem ? (
                            <Link to={`/problems/${sub.problem.slug}`} style={{ color: sub.status === 'Accepted' ? 'var(--color-text-main)' : '#ef4444', textDecoration: 'none' }} className="problem-link">
                              {sub.problem.title}
                            </Link>
                          ) : (
                            <span style={{ color: 'var(--color-text-muted)' }}>Unknown Problem</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                        {getLanguageLabel(sub.language)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <Link to={`/submissions/${sub._id}`} style={{ textDecoration: 'none' }}>
                          {getStatusBadge(sub.status)}
                        </Link>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--color-text-main)', fontWeight: '700' }}>
                        {sub.executionTime} ms
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--color-text-muted)' }}>
                        {getProblemAge(sub.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If URL includes view=solved, render all solved problems list
  if (view === 'solved') {
    const solvedProblems = problems.filter(p => p.isSolved);

    return (
      <div style={{ padding: '36px 40px', maxWidth: '1280px', margin: '0 auto', minHeight: 'calc(100vh - 70px)', background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent 40%)' }}>
        {/* Header Block */}
        <div className="glass-card animate-fade-in" style={{
          marginBottom: '28px', padding: '24px 32px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(12,15,26,0.6) 60%)',
          borderLeft: '4px solid var(--primary)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--primary-hover)' }}>
              Completed Challenges
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--color-text-main)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={26} color="var(--success)" style={{ filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.25))' }} />
              All Solved Problems ({solvedProblems.length})
            </h1>
          </div>
          <Link to="/dashboard" className="btn btn-outline" style={{ fontSize: '13px', padding: '8px 18px' }}>
            Back to Dashboard
          </Link>
        </div>

        {/* Solved Problems List */}
        <div className="glass-card animate-fade-in" style={{ padding: '24px 28px' }}>
          {solvedProblems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-muted)' }}>
              <p style={{ margin: 0, fontSize: '13.5px' }}>You haven't solved any problems yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              {solvedProblems.map((prob) => (
                <div key={prob._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', backgroundColor: 'rgba(16,185,129,0.02)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0 }} />
                    <Link to={`/problems/${prob.slug}`} style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-main)', textDecoration: 'none' }} className="problem-link">
                      {prob.title}
                    </Link>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: getDifficultyColor(prob.difficulty), backgroundColor: prob.difficulty === 'Easy' ? 'var(--success-glow)' : prob.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.08)' : 'var(--danger-glow)', padding: '4px 10px', borderRadius: '12px', border: `1px solid ${getDifficultyColor(prob.difficulty)}30` }}>
                      {prob.difficulty}
                    </span>
                    <span style={{ fontSize: '13.5px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                      {prob.acceptanceRate}% AC
                    </span>
                    <Link to={`/problems/${prob.slug}`} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '12.5px', borderRadius: '6px' }}>
                      Solve Again
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // If URL includes view=leaderboard, render the global standings of all users on the platform
  if (view === 'leaderboard') {
    return (
      <div style={{ padding: '36px 40px', maxWidth: '900px', margin: '0 auto', minHeight: 'calc(100vh - 70px)', background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent 40%)' }}>
        {/* Header Block */}
        <div className="glass-card animate-fade-in" style={{
          marginBottom: '28px', padding: '24px 32px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(12,15,26,0.6) 60%)',
          borderLeft: '4px solid var(--primary)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--primary-hover)' }}>
              Developer Rankings
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--color-text-main)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Trophy size={26} color="var(--primary)" style={{ filter: 'drop-shadow(0 0 6px rgba(99,102,241,0.3))' }} />
              Global Leaderboard
            </h1>
          </div>
          <Link to="/dashboard" className="btn btn-outline" style={{ fontSize: '13px', padding: '8px 18px' }}>
            Back to Dashboard
          </Link>
        </div>

        {/* Standings List */}
        <div className="glass-card animate-fade-in" style={{ padding: '0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', backgroundColor: 'rgba(0, 0, 0, 0.02)', color: 'var(--color-text-muted)' }}>
                <th style={{ padding: '16px 24px', fontWeight: '800', width: '80px', textAlign: 'center' }}>Rank</th>
                <th style={{ padding: '16px 24px', fontWeight: '800' }}>User Account</th>
                <th style={{ padding: '16px 24px', fontWeight: '800', textAlign: 'center', width: '160px' }}>Problems Solved</th>
                <th style={{ padding: '16px 24px', fontWeight: '800', textAlign: 'center', width: '160px' }}>Contest Rating</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row) => (
                <tr 
                  key={row.rank} 
                  style={{ 
                    borderBottom: '1px solid var(--border-glass)',
                    backgroundColor: row.isCurrentUser ? 'rgba(99, 102, 241, 0.04)' : 'transparent',
                    fontWeight: row.isCurrentUser ? '700' : 'normal'
                  }}
                >
                  <td style={{ padding: '16px 24px', textAlign: 'center', fontWeight: '800' }}>
                    {row.rank === 1 ? (
                      <Trophy size={18} color="#d97706" style={{ filter: 'drop-shadow(0 2px 4px rgba(217,119,6,0.3))' }} />
                    ) : row.rank === 2 ? (
                      <Trophy size={18} color="#94a3b8" />
                    ) : row.rank === 3 ? (
                      <Trophy size={18} color="#b45309" />
                    ) : (
                      <span>{row.rank}</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {row.isCurrentUser && <Flame size={15} color="var(--primary)" />}
                      <span style={{ color: row.isCurrentUser ? 'var(--primary)' : 'var(--color-text-main)' }}>
                        {row.username}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center', fontWeight: '700', color: 'var(--success)' }}>
                    {row.solved} solved
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center', fontWeight: '800', color: '#f59e0b' }}>
                    {row.rating}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // If URL includes view=profile, render the full detailed profile dashboard
  if (view === 'profile') {
    const solvedProblems = problems.filter(p => p.isSolved);
    const unsolvedProblems = problems.filter(p => !p.isSolved);

    return (
      <div style={{ padding: '36px 40px', maxWidth: '1280px', margin: '0 auto', minHeight: 'calc(100vh - 70px)', background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent 40%)' }}>
        
        {/* Profile Header Block */}
        <div className="glass-card animate-fade-in" style={{
          marginBottom: '28px', padding: '24px 32px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(12,15,26,0.6) 60%)',
          borderLeft: '4px solid var(--primary)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--primary-hover)' }}>
              Developer Profile
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--color-text-main)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserIcon size={26} color="var(--primary)" />
              {user.username}'s Workspace
            </h1>
          </div>
          <Link to="/dashboard" className="btn btn-outline" style={{ fontSize: '13px', padding: '8px 18px' }}>
            Back to Challenges
          </Link>
        </div>

        {/* Profile Metrics Section */}
        <div className="glass-card animate-fade-in" style={{
          padding: '32px',
          marginBottom: '28px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(12, 15, 26, 0.5) 100%)',
          border: '1px solid var(--border-glass)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '28px'
        }}>
          
          {/* Centered Circular Solved Problems at Top */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '850', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Overall Problems Solved
            </span>
            <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircleProgress percent={solvePercent} color="var(--primary)" size={150} strokeWidth={12} />
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '950', color: 'var(--color-text-main)', lineHeight: '1.1' }}>
                  {solvedProblemsCount}
                  <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text-muted)' }}>/{totalProblemsCount}</span>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--primary-hover)', fontWeight: '800', textTransform: 'uppercase', marginTop: '4px', letterSpacing: '0.05em' }}>
                  Solved
                </div>
              </div>
            </div>
            <span style={{ fontSize: '13.5px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
              You have completed <strong style={{ color: 'var(--primary-hover)' }}>{solvePercent}%</strong> of the available challenges.
            </span>
          </div>

          {/* Divider */}
          <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--border-glass)' }}></div>

          {/* Down below: How good my solutions are (Time & Space Complexity in percentage) */}
          <div style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary-hover)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Solution Performance Metrics
              </span>
              <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--color-text-main)', marginTop: '4px' }}>
                Execution & Complexity Efficiency
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {/* Time Complexity Efficiency Card */}
              <div className="glass-card" style={{
                padding: '24px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                borderBottom: '4px solid #10b981',
                background: 'rgba(16, 185, 129, 0.02)'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '850', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Time Efficiency
                    </span>
                    <Zap size={20} color="#10b981" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '42px', fontWeight: '900', color: '#10b981', lineHeight: '1' }}>
                      {stats.timeEfficiency}
                    </span>
                    <span style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>%</span>
                  </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: '600' }}>
                    <span>vs. System Best Limits</span>
                    <span>Optimal</span>
                  </div>
                  <ProgressBar value={stats.timeEfficiency} max={100} color="#10b981" />
                </div>
              </div>

              {/* Space Complexity Efficiency Card */}
              <div className="glass-card" style={{
                padding: '24px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                borderBottom: '4px solid #3b82f6',
                background: 'rgba(59, 130, 246, 0.02)'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '850', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Space Efficiency
                    </span>
                    <BarChart2 size={20} color="#3b82f6" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '42px', fontWeight: '900', color: '#3b82f6', lineHeight: '1' }}>
                      {stats.spaceEfficiency}
                    </span>
                    <span style={{ fontSize: '24px', fontWeight: '800', color: '#3b82f6' }}>%</span>
                  </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: '600' }}>
                    <span>vs. Memory Constraints</span>
                    <span>Optimized</span>
                  </div>
                  <ProgressBar value={stats.spaceEfficiency} max={100} color="#3b82f6" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Profile content grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '28px', alignItems: 'start' }} className="responsive-profile-layout animate-fade-in">
          
          {/* Left Panel: Profile Details Card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '24px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary-glow)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(99, 102, 241, 0.25)' }}>
                <UserIcon size={36} color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text-main)' }}>{user.username}</h3>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', backgroundColor: user.role === 'admin' ? 'var(--danger-glow)' : 'var(--primary-glow)', color: user.role === 'admin' ? 'var(--danger)' : 'var(--primary-hover)', padding: '4px 12px', borderRadius: '12px', border: '1px solid var(--border-glass)', display: 'inline-block', marginTop: '6px' }}>
                  {user.role}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={16} color="var(--color-text-muted)" />
                <div style={{ minWidth: '0', flex: 1 }}>
                  <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Email Address</span>
                  <span style={{ color: 'var(--color-text-main)', wordBreak: 'break-all' }}>{user.email}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={16} color="var(--color-text-muted)" />
                <div>
                  <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Joined On</span>
                  <span style={{ color: 'var(--color-text-main)' }}>{new Date(user.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Award size={16} color="var(--color-text-muted)" />
                <div>
                  <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Total Solved</span>
                  <span style={{ color: 'var(--success)', fontWeight: '800' }}>{solvedProblemsCount} / {totalProblemsCount} ({solvePercent}%)</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trophy size={16} color="var(--color-text-muted)" />
                <div>
                  <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Contest Rating</span>
                  <span style={{ color: '#f59e0b', fontWeight: '850', fontSize: '15px' }}>{user.contestRating || 1500}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Panel: Solved and Unsolved Problems Lists */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Solved Problems List */}
            <div className="glass-card" style={{ padding: '24px 28px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--success)' }}>
                <CheckCircle size={18} color="var(--success)" style={{ filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.25))' }} />
                Solved Challenges ({solvedProblems.length})
              </h3>
              
              {solvedProblems.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '13.5px', margin: 0 }}>You haven't solved any problems yet. Go to the problems page to start coding!</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                  {solvedProblems.map(prob => (
                    <div key={prob._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'rgba(16,185,129,0.03)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input type="checkbox" checked readOnly style={{ accentColor: 'var(--success)', width: '16px', height: '16px', cursor: 'default' }} />
                        <Link to={`/problems/${prob.slug}`} style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-main)', textDecoration: 'none' }} className="problem-link">
                          {prob.title}
                        </Link>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: prob.difficulty === 'Easy' ? 'var(--success)' : prob.difficulty === 'Medium' ? 'var(--warning)' : 'var(--danger)' }}>
                          {prob.difficulty}
                        </span>
                        <span style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                          {prob.acceptanceRate}% AC
                        </span>
                        <Link to={`/problems/${prob.slug}`} style={{ color: 'var(--primary-hover)', display: 'inline-flex', alignItems: 'center' }}>
                          <ChevronRight size={16} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Unsolved Problems List */}
            <div className="glass-card" style={{ padding: '24px 28px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-hover)' }}>
                <Clock size={18} color="var(--primary)" />
                Remaining Challenges ({unsolvedProblems.length})
              </h3>

              {unsolvedProblems.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '13.5px', margin: 0 }}>🎉 Congratulations! You have solved all the challenges in CodePlex!</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                  {unsolvedProblems.map(prob => (
                    <div key={prob._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '10px', transition: 'var(--transition-smooth)' }} className="problem-row-hover-profile">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid var(--border-glass)' }}></div>
                        <Link to={`/problems/${prob.slug}`} style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-main)', textDecoration: 'none' }} className="problem-link">
                          {prob.title}
                        </Link>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: prob.difficulty === 'Easy' ? 'var(--success)' : prob.difficulty === 'Medium' ? 'var(--warning)' : 'var(--danger)' }}>
                          {prob.difficulty}
                        </span>
                        <span style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                          {prob.acceptanceRate}% AC
                        </span>
                        <Link to={`/problems/${prob.slug}`} className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '11.5px', borderRadius: '6px' }}>
                          Solve
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

        <style>{`
          .problem-row-hover-profile:hover {
            background-color: rgba(99, 102, 241, 0.02) !important;
            border-color: rgba(99, 102, 241, 0.15) !important;
          }
          .problem-link:hover {
            color: var(--primary) !important;
          }
        `}</style>
      </div>
    );
  }

  // DEFAULT VIEW: Only the problems list and solvers sidebar widget (no progress charts or dashboards)
  return (
    <div style={{ padding: '36px 40px', maxWidth: '1340px', margin: '0 auto', minHeight: 'calc(100vh - 70px)', background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent 40%)' }}>
      
      {/* Welcome Banner */}
      <div className="glass-card animate-fade-in" style={{
        marginBottom: '28px', padding: '24px 32px',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(12,15,26,0.6) 60%)',
        borderLeft: '4px solid var(--primary)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px'
      }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary-hover)', marginBottom: '4px' }}>
            🚀 Dashboard Workspace
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--color-text-main)' }}>
            Welcome back, {user.username}!
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '2px' }}>
            Choose a challenge from the list below to write, compile, and submit your code.
          </p>
        </div>
        
        {/* Quick contest link */}
        <Link to="/contests" className="btn btn-outline" style={{ padding: '10px 20px', fontSize: '13px', gap: '8px' }}>
          <Trophy size={15} />
          View Live Contests
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-glass)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <span style={{ color: 'var(--color-text-muted)', fontWeight: '600' }}>Loading challenges...</span>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'start' }} className="responsive-main-layout animate-fade-in">
          
          {/* Main dashboard content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Curated Recommended Challenges for You */}
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Zap size={18} color="var(--primary)" />
                Recommended Challenges for You
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                {(() => {
                  const unsolved = problems.filter(p => !p.isSolved);
                  const recommended = unsolved.length >= 3 
                    ? unsolved.slice(0, 3)
                    : [...unsolved, ...problems.filter(p => p.isSolved).slice(0, 3 - unsolved.length)].slice(0, 3);

                  if (recommended.length === 0) {
                    return (
                      <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', gridColumn: '1 / -1' }}>
                        No recommended problems available.
                      </div>
                    );
                  }

                  return recommended.map((prob) => (
                    <div 
                      key={prob._id} 
                      className="glass-card problem-row-hover-profile" 
                      style={{ 
                        padding: '24px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between',
                        minHeight: '160px',
                        borderLeft: `3px solid ${getDifficultyColor(prob.difficulty)}`,
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                          <span style={{ 
                            fontSize: '10px', 
                            fontWeight: '800', 
                            color: getDifficultyColor(prob.difficulty), 
                            backgroundColor: prob.difficulty === 'Easy' ? 'var(--success-glow)' : prob.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.08)' : 'var(--danger-glow)',
                            padding: '2px 8px', 
                            borderRadius: '10px' 
                          }}>
                            {prob.difficulty}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                            {prob.acceptanceRate}% AC
                          </span>
                        </div>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-main)', marginTop: '12px', marginBottom: '8px' }}>
                          {prob.title}
                        </h3>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid var(--border-glass)', paddingTop: '12px' }}>
                        <span style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                          {getProblemAge(prob.createdAt)}
                        </span>
                        <Link 
                          to={`/problems/${prob.slug}`} 
                          className="solve-btn"
                        >
                          <ArrowRight size={15} />
                        </Link>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Recent Submissions Feed */}
            <div className="glass-card" style={{ padding: '24px 28px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Clock size={18} color="var(--primary)" />
                Your Recent Submissions
              </h2>

              {recentSubmissions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-muted)' }}>
                  <p style={{ margin: 0, fontSize: '13.5px' }}>No submissions yet. Try solving one of the recommended challenges to get started!</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--color-text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <th style={{ padding: '12px 16px', fontWeight: '700' }}>Problem</th>
                        <th style={{ padding: '12px 16px', fontWeight: '700' }}>Language</th>
                        <th style={{ padding: '12px 16px', fontWeight: '700' }}>Status</th>
                        <th style={{ padding: '12px 16px', fontWeight: '700' }}>Runtime</th>
                        <th style={{ padding: '12px 16px', fontWeight: '700' }}>Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSubmissions.map((sub) => (
                        <tr key={sub._id} style={{ borderBottom: '1px solid var(--border-glass)', transition: 'var(--transition-smooth)' }} className="problem-row-hover">
                          <td style={{ padding: '14px 16px', fontWeight: '700' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {sub.status === 'Accepted' ? (
                                <CheckCircle size={15} color="#10b981" style={{ flexShrink: 0 }} />
                              ) : (
                                <XCircle size={15} color="#ef4444" style={{ flexShrink: 0 }} />
                              )}
                              {sub.problem ? (
                                <Link to={`/problems/${sub.problem.slug}`} style={{ color: sub.status === 'Accepted' ? 'var(--color-text-main)' : '#ef4444', textDecoration: 'none' }} className="problem-link">
                                  {sub.problem.title}
                                </Link>
                              ) : (
                                <span style={{ color: 'var(--color-text-muted)' }}>Unknown Problem</span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                            {getLanguageLabel(sub.language)}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            {getStatusBadge(sub.status)}
                          </td>
                          <td style={{ padding: '14px 16px', color: 'var(--color-text-main)', fontWeight: '700' }}>
                            {sub.executionTime} ms
                          </td>
                          <td style={{ padding: '14px 16px', color: 'var(--color-text-muted)' }}>
                            {getProblemAge(sub.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {recentSubmissions.length > 0 && (
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                  <Link to="/dashboard?view=solved" className="btn btn-outline" style={{ fontSize: '13px', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} color="#10b981" />
                    View All Solved Problems
                  </Link>
                  <Link to="/dashboard?view=submissions" className="btn btn-outline" style={{ fontSize: '13px', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Code size={14} color="var(--primary)" />
                    View All Submissions
                  </Link>
                </div>
              )}
            </div>

          </div>

          {/* Right sidebar widgets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Daily Challenge Card */}
            {dailyChallenge && (
              <div className="glass-card animate-fade-in" style={{ animationDelay: '0.15s', padding: '24px', background: 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(12,15,26,0.6) 80%)', borderLeft: '4px solid #f59e0b' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '16px', color: '#f59e0b' }}>
                  <Flame size={18} />
                  Daily Challenge
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.02em' }}>TODAY'S MISSION</span>
                    <h4 style={{ fontSize: '17px', fontWeight: '900', color: 'var(--color-text-main)', marginTop: '4px' }}>{dailyChallenge.title}</h4>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', fontWeight: '800', color: getDifficultyColor(dailyChallenge.difficulty), backgroundColor: dailyChallenge.difficulty === 'Easy' ? 'var(--success-glow)' : dailyChallenge.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.08)' : 'var(--danger-glow)', padding: '2px 8px', borderRadius: '10px' }}>{dailyChallenge.difficulty}</span>
                      <span style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', fontWeight: '500' }}>{dailyChallenge.acceptanceRate}% Acceptance</span>
                    </div>
                  </div>
                  
                  <Link to={`/problems/${dailyChallenge.slug}`} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', padding: '10px', fontSize: '13px', marginTop: '4px', display: 'flex', justifyContent: 'center', width: '100%', boxShadow: '0 4px 12px rgba(245,158,11,0.3)', gap: '6px' }}>
                    Solve Challenge <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}

            {/* Top Performers Widget */}
            <div className="glass-card animate-fade-in" style={{ animationDelay: '0.2s', padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '16px' }}>
                <Trophy size={18} color="var(--primary)" />
                Leaderboard Standings
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {leaderboard.slice(0, 3).map((participant, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '8px 12px', 
                    borderRadius: '8px', 
                    backgroundColor: participant.isCurrentUser ? 'rgba(99, 102, 241, 0.04)' : 'rgba(255,255,255,0.01)',
                    border: `1px solid ${participant.isCurrentUser ? 'rgba(99, 102, 241, 0.2)' : 'var(--border-glass)'}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: '800', 
                        color: participant.rank === 1 ? '#f59e0b' : participant.rank === 2 ? '#94a3b8' : participant.rank === 3 ? '#b45309' : 'var(--color-text-muted)',
                        width: '18px',
                        display: 'inline-block'
                      }}>
                        #{participant.rank}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: participant.isCurrentUser ? 'var(--primary)' : 'var(--color-text-main)' }}>{participant.username}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: '850', color: 'var(--color-text-main)', display: 'block' }}>{participant.rating}</span>
                      <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', fontWeight: '600' }}>{participant.solved} solved</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link to="/dashboard?view=leaderboard" className="btn btn-outline" style={{ width: '100%', fontSize: '12px', padding: '6px', marginTop: '12px', justifyContent: 'center', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <Award size={14} color="var(--primary)" />
                Check All Users Standings
              </Link>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', backgroundColor: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.12)', padding: '14px', borderRadius: '10px' }}>
              <ShieldAlert size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', lineHeight: '1.4', margin: 0 }}>
                All codes run inside secure sandboxed Docker containers under strict constraints (2.0s timeout, 256MB RAM).
              </p>
            </div>

          </div>

        </div>
      )}

      <style>{`
        .problem-row-hover:hover {
          background-color: rgba(99, 102, 241, 0.02);
        }
        .problem-link:hover {
          color: var(--primary) !important;
        }
        .solve-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: rgba(99, 102, 241, 0.05);
          color: var(--primary);
          transition: var(--transition-smooth);
          border: 1px solid rgba(99, 102, 241, 0.1);
        }
        .problem-row-hover:hover .solve-btn {
          background-color: var(--primary);
          color: white;
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
          transform: translateX(3px);
        }
        @media (max-width: 900px) {
          .responsive-main-layout {
            grid-template-columns: 1fr !important;
          }
          .responsive-profile-layout {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
