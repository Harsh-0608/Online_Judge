import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Users, ArrowLeft, ArrowRight, ShieldCheck, Flame } from 'lucide-react';
import { API_BASE } from '../config';

const Contests = () => {
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/contests`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setContests(data.contests);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to fetch contests');
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  const handleViewLeaderboard = async (contest) => {
    setSelectedContest(contest);
    setLeaderboardLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/contests/${contest._id}/leaderboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.standings);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch standings');
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return (
          <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: 'var(--danger-glow)', color: 'var(--danger)', padding: '5px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '5px', border: '1px solid rgba(220,38,38,0.15)' }}>
            <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--danger)', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span>
            LIVE NOW
          </span>
        );
      case 'Upcoming':
        return (
          <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', padding: '5px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', border: '1px solid rgba(79,70,229,0.15)' }}>
            UPCOMING
          </span>
        );
      case 'Completed':
        return (
          <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: 'var(--success-glow)', color: 'var(--success)', padding: '5px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', border: '1px solid rgba(5,150,105,0.15)' }}>
            FINISHED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent 40%)' }}>
      
      {/* Dynamic View Toggle */}
      {selectedContest ? (
        // Leaderboard Ranks View
        <div className="animate-fade-in">
          {/* Back button */}
          <button 
            onClick={() => setSelectedContest(null)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: 'none',
              background: 'none',
              color: 'var(--primary)',
              fontWeight: '700',
              cursor: 'pointer',
              marginBottom: '24px',
              fontSize: '14.5px',
              outline: 'none'
            }}
          >
            <ArrowLeft size={16} />
            Back to Contests
          </button>

          {/* Contest info card */}
          <div className="glass-card" style={{ padding: '24px 32px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ marginBottom: '8px' }}>{getStatusBadge(selectedContest.status)}</div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-text-main)', marginBottom: '4px' }}>
                {selectedContest.title}
              </h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14.5px' }}>
                Leaderboard & Participant Rankings (Total Participants: {selectedContest.participantsCount})
              </p>
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="var(--primary)" />
                <span style={{ fontSize: '14px', fontWeight: '600' }}>Duration: {selectedContest.duration}</span>
              </div>
            </div>
          </div>

          {/* Leaderboard Rankings Table */}
          {leaderboardLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-glass)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <span style={{ color: 'var(--color-text-muted)', fontWeight: '600' }}>Loading contest standings...</span>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '0', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14.5px', minWidth: '680px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', backgroundColor: 'rgba(0, 0, 0, 0.015)' }}>
                    <th style={{ padding: '18px 24px', fontWeight: '700', width: '80px', color: 'var(--color-text-muted)', textAlign: 'center' }}>Rank</th>
                    <th style={{ padding: '18px 24px', fontWeight: '700', color: 'var(--color-text-main)' }}>Username</th>
                    <th style={{ padding: '18px 24px', fontWeight: '700', width: '150px', color: 'var(--color-text-muted)', textAlign: 'center' }}>Solved</th>
                    <th style={{ padding: '18px 24px', fontWeight: '700', width: '150px', color: 'var(--color-text-muted)', textAlign: 'center' }}>Score</th>
                    <th style={{ padding: '18px 24px', fontWeight: '700', width: '150px', color: 'var(--color-text-muted)', textAlign: 'center' }}>Penalty Time</th>
                    <th style={{ padding: '18px 24px', fontWeight: '700', width: '150px', color: 'var(--color-text-muted)', textAlign: 'center' }}>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((row) => (
                    <tr 
                      key={row.rank} 
                      style={{ 
                        borderBottom: '1px solid var(--border-glass)',
                        backgroundColor: row.isCurrentUser ? 'rgba(79, 70, 229, 0.04)' : 'transparent',
                        fontWeight: row.isCurrentUser ? '700' : 'normal'
                      }}
                    >
                      <td style={{ padding: '18px 24px', textAlign: 'center', verticalAlign: 'middle' }}>
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
                      <td style={{ padding: '18px 24px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {row.isCurrentUser && <Flame size={16} color="var(--primary)" />}
                          <span style={{ color: row.isCurrentUser ? 'var(--primary)' : 'var(--color-text-main)' }}>
                            {row.username}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '18px 24px', textAlign: 'center', verticalAlign: 'middle', fontWeight: '600' }}>
                        {row.solved} / 4
                      </td>
                      <td style={{ padding: '18px 24px', textAlign: 'center', verticalAlign: 'middle', fontWeight: '600', color: 'var(--success)' }}>
                        {row.points} pts
                      </td>
                      <td style={{ padding: '18px 24px', textAlign: 'center', verticalAlign: 'middle', color: 'var(--color-text-muted)' }}>
                        {row.time}
                      </td>
                      <td style={{ padding: '18px 24px', textAlign: 'center', verticalAlign: 'middle' }}>
                        <span style={{ 
                          fontSize: '12.5px', 
                          fontWeight: '800', 
                          color: row.rating >= 2400 ? '#ef4444' : row.rating >= 1800 ? 'var(--primary)' : 'var(--color-text-muted)' 
                        }}>
                          {row.rating}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        // Contests List View
        <div className="animate-fade-in">
          {/* Header Banner */}
          <div className="glass-card" style={{ padding: '24px 32px', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Trophy color="var(--primary)" size={26} />
              Contests & Live Matches
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>
              Compete in weekly coding battles, climb the leaderboard rankings, and build your rating index.
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-glass)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <span style={{ color: 'var(--color-text-muted)', fontWeight: '600' }}>Fetching active matches...</span>
            </div>
          ) : error ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', border: '1px solid rgba(220, 38, 38, 0.15)', backgroundColor: 'var(--danger-glow)' }}>
              <p style={{ color: 'var(--danger)', fontWeight: '700' }}>{error}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              {contests.map((contest) => (
                <div 
                  key={contest._id} 
                  className="glass-card contest-card" 
                  style={{ 
                    padding: '24px 32px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    gap: '20px',
                    flexWrap: 'wrap',
                    transition: 'var(--transition-smooth)',
                    borderLeft: contest.status === 'Active' ? '4px solid var(--danger)' : '1px solid var(--border-glass)'
                  }}
                >
                  <div style={{ flex: '1 1 500px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      {getStatusBadge(contest.status)}
                      <span style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} />
                        {contest.duration}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '18.5px', fontWeight: '800', color: 'var(--color-text-main)', marginBottom: '6px' }}>
                      {contest.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                      {contest.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}>
                      <Users size={18} />
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>
                        <strong>{contest.participantsCount}</strong> registered
                      </span>
                    </div>

                    <button
                      onClick={() => handleViewLeaderboard(contest)}
                      className="btn btn-outline"
                      style={{ 
                        padding: '10px 18px', 
                        fontSize: '13.5px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        fontWeight: '700',
                        backgroundColor: contest.status === 'Active' ? 'var(--primary-glow)' : 'transparent',
                        borderColor: contest.status === 'Active' ? 'var(--primary)' : 'rgba(0,0,0,0.15)',
                        color: contest.status === 'Active' ? 'var(--primary)' : 'var(--color-text-main)'
                      }}
                    >
                      {contest.status === 'Completed' ? 'View Standings' : contest.status === 'Active' ? 'Enter Contest' : 'Register Now'}
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        .contest-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35), 0 0 20px rgba(99, 102, 241, 0.08);
          border-color: rgba(255, 255, 255, 0.15) !important;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.4; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Contests;
