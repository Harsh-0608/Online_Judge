import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Users, ArrowLeft, ArrowRight, ShieldCheck, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

// Live countdown timer component
const CountdownTimer = ({ contest }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const start = new Date(contest.startTime);
      const end = new Date(contest.endTime);

      if (now < start) {
        const diff = start.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        
        if (days > 0) {
          setTimeLeft(`Starts in: ${days}d ${hrs}h ${mins}m`);
        } else {
          setTimeLeft(`Starts in: ${hrs}h ${mins}m ${secs}s`);
        }
      } else if (now >= start && now <= end) {
        const diff = end.getTime() - now.getTime();
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`Live ends in: ${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      } else {
        setTimeLeft('Finished');
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [contest]);

  const now = new Date();
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);
  const isActive = now >= start && now <= end;
  const isUpcoming = now < start;

  return (
    <span style={{ 
      fontSize: '11px', 
      fontWeight: '800', 
      backgroundColor: isActive ? 'var(--danger-glow)' : isUpcoming ? 'var(--primary-glow)' : 'rgba(255, 255, 255, 0.03)', 
      color: isActive ? 'var(--danger)' : isUpcoming ? 'var(--primary)' : 'var(--color-text-muted)',
      padding: '4px 10px', 
      borderRadius: '8px',
      border: `1px solid ${isActive ? 'rgba(220,38,38,0.15)' : isUpcoming ? 'rgba(79,70,229,0.15)' : 'var(--border-glass)'}`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      {timeLeft}
    </span>
  );
};

const Contests = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [error, setError] = useState('');

  const handleViewLeaderboard = async (contest) => {
    setSelectedContest(contest);
    navigate(`/contests?contestId=${contest._id}`);
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
          
          // Auto select contest if contestId query param matches
          const queryParams = new URLSearchParams(window.location.search);
          const urlContestId = queryParams.get('contestId');
          if (urlContestId) {
            const matchedContest = data.contests.find(c => c._id === urlContestId);
            if (matchedContest) {
              handleViewLeaderboard(matchedContest);
            }
          }
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

  const handleRegisterContest = async (contestId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/contests/${contestId}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        // Update contests state
        setContests(prev => prev.map(c => 
          c._id === contestId 
            ? { ...c, isRegistered: true, participantsCount: data.participantsCount }
            : c
        ));
        
        // If the registered contest is currently selected, update its state
        if (selectedContest && selectedContest._id === contestId) {
          setSelectedContest(prev => ({
            ...prev,
            isRegistered: true,
            participantsCount: data.participantsCount
          }));
        }
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Failed to register for contest:', err);
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
    <div className="responsive-container" style={{ maxWidth: '1200px', margin: '0 auto', background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent 40%)' }}>
      
      {/* Dynamic View Toggle */}
      {selectedContest ? (
        // Leaderboard Ranks View
        <div className="animate-fade-in">
          {/* Back button */}
          <button 
            onClick={() => {
              setSelectedContest(null);
              navigate('/contests');
            }}
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
              <div style={{ marginBottom: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                {getStatusBadge(selectedContest.status)}
                <CountdownTimer contest={selectedContest} />
              </div>
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

          {/* Two-Column Grid: Problems List (Left) & Standings (Right) */}
          <div className="contest-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '30px', alignItems: 'start' }}>
            
            {/* LEFT COLUMN: Problems list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass-card" style={{ padding: '24px 28px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} color="var(--primary)" />
                  Contest Challenges
                </h2>

                {selectedContest.status === 'Upcoming' ? (
                  <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--color-text-muted)' }}>
                    <Clock size={32} color="var(--primary)" style={{ opacity: 0.4, marginBottom: '12px', margin: '0 auto' }} />
                    <h4 style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '6px' }}>Challenges Locked</h4>
                    <p style={{ fontSize: '12.5px', lineHeight: '1.4' }}>This contest starts in a few days. Register now to be notified when it goes live!</p>
                  </div>
                ) : (!selectedContest.isRegistered && selectedContest.status !== 'Completed') ? (
                  <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--color-text-muted)' }}>
                    <Clock size={32} color="var(--primary)" style={{ opacity: 0.4, marginBottom: '12px', margin: '0 auto' }} filter="drop-shadow(0 2px 8px rgba(99,102,241,0.2))" />
                    <h4 style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '6px' }}>Registration Required</h4>
                    <p style={{ fontSize: '12.5px', lineHeight: '1.4', marginBottom: '16px' }}>You must join this contest to view and solve the challenges.</p>
                    <button
                      onClick={() => handleRegisterContest(selectedContest._id)}
                      className="btn btn-primary"
                      style={{ padding: '8px 18px', fontSize: '13px', fontWeight: '700' }}
                    >
                      Join Contest Now
                    </button>
                  </div>
                ) : selectedContest.problems && selectedContest.problems.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {selectedContest.problems.map((prob, idx) => (
                      <div key={prob._id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)' }}>Problem #{idx + 1}</span>
                          <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-main)' }}>{prob.title}</span>
                          <span style={{ 
                            fontSize: '11px', 
                            fontWeight: '800', 
                            width: 'fit-content',
                            color: prob.difficulty === 'Easy' ? 'var(--success)' : prob.difficulty === 'Medium' ? 'var(--warning)' : 'var(--danger)',
                            backgroundColor: prob.difficulty === 'Easy' ? 'var(--success-glow)' : prob.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.08)' : 'var(--danger-glow)',
                            padding: '2px 8px', 
                            borderRadius: '8px'
                          }}>
                            {prob.difficulty}
                          </span>
                        </div>
                        <button
                          onClick={() => navigate(`/problems/${prob.slug}?contestId=${selectedContest._id}`)}
                          className="btn btn-primary"
                          style={{ padding: '8px 16px', fontSize: '12.5px', fontWeight: '700' }}
                        >
                          Solve
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
                    No problems linked to this contest.
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Leaderboard Table */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
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

          </div>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      {getStatusBadge(contest.status)}
                      <span style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} />
                        Duration: {contest.duration}
                      </span>
                      <CountdownTimer contest={contest} />
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

                    {contest.status === 'Completed' ? (
                      <button
                        onClick={() => handleViewLeaderboard(contest)}
                        className="btn btn-outline"
                        style={{ padding: '10px 18px', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}
                      >
                        View Standings
                        <ArrowRight size={14} />
                      </button>
                    ) : contest.status === 'Active' ? (
                      contest.isRegistered ? (
                        <button
                          onClick={() => handleViewLeaderboard(contest)}
                          className="btn btn-primary"
                          style={{ padding: '10px 18px', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}
                        >
                          Enter Contest
                          <ArrowRight size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRegisterContest(contest._id)}
                          className="btn btn-outline"
                          style={{ padding: '10px 18px', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: 'var(--danger)', borderColor: 'var(--danger)', backgroundColor: 'var(--danger-glow)' }}
                        >
                          Join Contest
                          <ArrowRight size={14} />
                        </button>
                      )
                    ) : (
                      // Upcoming contest
                      contest.isRegistered ? (
                        <button
                          disabled
                          className="btn btn-outline"
                          style={{ padding: '10px 18px', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', opacity: 0.8, cursor: 'not-allowed', color: 'var(--success)', borderColor: 'var(--success)', backgroundColor: 'var(--success-glow)' }}
                        >
                          ✓ Registered
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRegisterContest(contest._id)}
                          className="btn btn-primary"
                          style={{ padding: '10px 18px', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}
                        >
                          Register Now
                          <ArrowRight size={14} />
                        </button>
                      )
                    )}
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
