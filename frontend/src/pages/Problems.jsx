import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Circle, Search, ArrowRight, BookOpen, Star, ShieldAlert, Clock, Flame, Trophy, Tag } from 'lucide-react';
import { API_BASE } from '../config';

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch problems
        const res = await fetch(`${API_BASE}/problems`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setProblems(data.problems);
        } else {
          setError(data.message);
        }

        // Fetch global leaderboard
        const lbRes = await fetch(`${API_BASE}/contests/leaderboard/global`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const lbData = await lbRes.json();
        if (lbData.success) {
          setLeaderboard(lbData.standings);
        }
      } catch (err) {
        setError('Failed to connect to server');
      } finally {
        setLoading(false);
        setLeaderboardLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDifficulty, filterStatus, selectedTag]);

  // Filter problems based on difficulty, status, search term, and tag
  const filteredProblems = problems.filter(prob => {
    const matchesSearch = prob.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'All' || prob.difficulty === filterDifficulty;
    const matchesStatus = filterStatus === 'All' || 
      (filterStatus === 'Solved' && prob.isSolved) || 
      (filterStatus === 'Unsolved' && !prob.isSolved);
    const matchesTag = selectedTag === 'All' || (prob.tags && prob.tags.includes(selectedTag));
    return matchesSearch && matchesDifficulty && matchesStatus && matchesTag;
  });

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

  const solvedCount = problems.filter(p => p.isSolved).length;
  const totalCount = problems.length;

  // Extract all unique tags
  const allTags = ['All', ...new Set(problems.flatMap(p => p.tags || []))];

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

  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage);
  const paginatedProblems = filteredProblems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1340px', margin: '0 auto', background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent 40%)' }}>
      
      {/* Title Header Section */}
      <div className="glass-card animate-fade-in" style={{ padding: '24px 32px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BookOpen color="var(--primary)" size={26} />
            Coding Challenges
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>
            Master data structures & algorithms by solving interactive sandbox problems.
          </p>
        </div>
        
        {/* Quick info box */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ textAlign: 'center', padding: '10px 20px', borderRadius: '12px', border: '1px solid var(--border-glass)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--success)', textShadow: '0 0 10px rgba(16,185,129,0.2)' }}>
              {solvedCount}
            </div>
            <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em', marginTop: '2px' }}>
              Solved
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px 20px', borderRadius: '12px', border: '1px solid var(--border-glass)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text-main)' }}>
              {totalCount}
            </div>
            <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em', marginTop: '2px' }}>
              Total
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="responsive-main-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'start' }}>
        
        {/* Left Column: Filters and Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Filter and Search Controls */}
          <div className="glass-card animate-fade-in" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', animationDelay: '0.05s' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {/* Filter Tabs Sub-Group */}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                
                {/* Difficulty Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Difficulty:</span>
                  <div style={{ display: 'flex', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)', padding: '3px', borderRadius: '16px' }}>
                    {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setFilterDifficulty(diff)}
                        style={{
                          border: 'none',
                          background: filterDifficulty === diff ? 'var(--primary)' : 'transparent',
                          color: filterDifficulty === diff ? 'white' : 'var(--color-text-muted)',
                          padding: '6px 14px',
                          borderRadius: '13px',
                          fontSize: '12.5px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'var(--transition-smooth)',
                          outline: 'none'
                        }}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Status:</span>
                  <div style={{ display: 'flex', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)', padding: '3px', borderRadius: '16px' }}>
                    {['All', 'Solved', 'Unsolved'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        style={{
                          border: 'none',
                          background: filterStatus === status ? 'var(--primary)' : 'transparent',
                          color: filterStatus === status ? 'white' : 'var(--color-text-muted)',
                          padding: '6px 14px',
                          borderRadius: '13px',
                          fontSize: '12.5px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'var(--transition-smooth)',
                          outline: 'none'
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Search Bar Input */}
              <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search challenges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: '20px',
                    border: '1px solid var(--border-glass)',
                    backgroundColor: 'rgba(12, 15, 26, 0.6)',
                    color: 'var(--color-text-main)',
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'var(--transition-smooth)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-glass)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Tag filtering list */}
            {allTags.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--border-glass)', paddingTop: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginRight: '6px' }}>
                  <Tag size={13} />
                  Tags:
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      style={{
                        border: 'none',
                        background: selectedTag === tag ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${selectedTag === tag ? 'var(--primary)' : 'var(--border-glass)'}`,
                        color: selectedTag === tag ? 'var(--primary-hover)' : 'var(--color-text-muted)',
                        padding: '4px 12px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'var(--transition-smooth)',
                        outline: 'none'
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Problems Display Area */}
          {loading ? (
            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} style={{ height: '60px', borderRadius: '12px', border: '1px solid var(--border-glass)', backgroundColor: 'rgba(255,255,255,0.01)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', animation: 'skeleton-pulse 1.5s ease-in-out infinite' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)' }}></div>
                    <div style={{ width: '140px', height: '16px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.04)' }}></div>
                  </div>
                  <div style={{ width: '60px', height: '16px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.04)' }}></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', border: '1px solid rgba(220, 38, 38, 0.15)', backgroundColor: 'var(--danger-glow)' }}>
              <p style={{ color: 'var(--danger)', fontWeight: '700' }}>{error}</p>
            </div>
          ) : filteredProblems.length === 0 ? (
            <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <Star size={36} color="var(--primary)" style={{ opacity: 0.3, marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '4px' }}>No problems match filters</h3>
              <p style={{ fontSize: '14px' }}>Try tweaking your search or tags filters above.</p>
            </div>
          ) : (
            <div className="glass-card animate-fade-in" style={{ padding: '0', overflow: 'hidden', animationDelay: '0.1s' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-glass)', backgroundColor: 'rgba(255, 255, 255, 0.01)' }}>
                      <th style={{ padding: '18px 24px', fontWeight: '700', width: '80px', color: 'var(--color-text-muted)' }}>Status</th>
                      <th style={{ padding: '18px 24px', fontWeight: '700', color: 'var(--color-text-main)' }}>Title</th>
                      <th style={{ padding: '18px 24px', fontWeight: '700', width: '140px', color: 'var(--color-text-muted)' }}>Difficulty</th>
                      <th style={{ padding: '18px 24px', fontWeight: '700', width: '130px', color: 'var(--color-text-muted)' }}>Acceptance</th>
                      <th style={{ padding: '18px 24px', fontWeight: '700', width: '130px', color: 'var(--color-text-muted)' }}>Stats</th>
                      <th style={{ padding: '18px 24px', fontWeight: '700', width: '100px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Solve</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProblems.map((problem) => (
                      <tr 
                        key={problem._id} 
                        style={{ 
                          borderBottom: '1px solid var(--border-glass)', 
                          transition: 'var(--transition-smooth)',
                        }}
                        className="problem-row-hover"
                      >
                        <td style={{ padding: '18px 24px', verticalAlign: 'middle' }}>
                          {problem.isSolved ? (
                            <CheckCircle size={18} color="var(--success)" style={{ filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.3))' }} />
                          ) : (
                            <Circle size={18} color="var(--border-glass)" />
                          )}
                        </td>
                        <td style={{ padding: '18px 24px', verticalAlign: 'middle' }}>
                          <Link to={`/problems/${problem.slug}`} style={{ color: 'var(--color-text-main)', textDecoration: 'none', transition: 'var(--transition-smooth)', fontWeight: '700', fontSize: '15px' }} className="problem-link">
                            {problem.title}
                          </Link>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                            {problem.tags && problem.tags.map(tag => (
                              <span key={tag} style={{ fontSize: '10px', fontWeight: '700', color: 'var(--primary-hover)', backgroundColor: 'rgba(99, 102, 241, 0.04)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '18px 24px', verticalAlign: 'middle' }}>
                          <span style={{ 
                            fontSize: '11px', 
                            fontWeight: '800', 
                            color: getDifficultyColor(problem.difficulty), 
                            backgroundColor: problem.difficulty === 'Easy' ? 'var(--success-glow)' : problem.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.08)' : 'var(--danger-glow)',
                            padding: '4px 10px', 
                            borderRadius: '20px',
                            border: `1px solid ${problem.difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.2)' : problem.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                          }}>
                            {problem.difficulty}
                          </span>
                        </td>
                        <td style={{ padding: '18px 24px', verticalAlign: 'middle', fontWeight: '600', color: 'var(--color-text-muted)' }}>
                          {problem.acceptanceRate}%
                        </td>
                        <td style={{ padding: '18px 24px', verticalAlign: 'middle', color: 'var(--color-text-muted)', fontSize: '12.5px' }}>
                          <div>{problem.acceptedSubmissions || 0} AC</div>
                          <div style={{ fontSize: '11px', opacity: 0.7 }}>{problem.totalSubmissions || 0} submissions</div>
                        </td>
                        <td style={{ padding: '18px 24px', verticalAlign: 'middle', textAlign: 'center' }}>
                          <Link 
                            to={`/problems/${problem.slug}`} 
                            className="solve-btn"
                          >
                            <ArrowRight size={15} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 24px',
                  borderTop: '1px solid var(--border-glass)',
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                    Showing <strong style={{ color: 'var(--color-text-main)' }}>{Math.min(filteredProblems.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredProblems.length, currentPage * itemsPerPage)}</strong> of <strong style={{ color: 'var(--color-text-main)' }}>{filteredProblems.length}</strong> challenges
                  </span>
                  
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(1)}
                      className="pagination-btn"
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-glass)',
                        backgroundColor: currentPage === 1 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                        color: currentPage === 1 ? 'rgba(255,255,255,0.2)' : 'var(--color-text-main)',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      First
                    </button>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className="pagination-btn"
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-glass)',
                        backgroundColor: currentPage === 1 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                        color: currentPage === 1 ? 'rgba(255,255,255,0.2)' : 'var(--color-text-main)',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      Prev
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                      .map((page, index, array) => {
                        const showDots = index > 0 && page - array[index - 1] > 1;
                        return (
                          <React.Fragment key={page}>
                            {showDots && <span style={{ color: 'var(--color-text-muted)', fontSize: '13px', margin: '0 4px' }}>...</span>}
                            <button
                              onClick={() => setCurrentPage(page)}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
                                border: `1px solid ${currentPage === page ? 'var(--primary)' : 'var(--border-glass)'}`,
                                backgroundColor: currentPage === page ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                                color: currentPage === page ? 'white' : 'var(--color-text-muted)',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'var(--transition-smooth)'
                              }}
                              className={currentPage === page ? 'active-page-btn' : 'page-btn'}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      })}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className="pagination-btn"
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-glass)',
                        backgroundColor: currentPage === totalPages ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                        color: currentPage === totalPages ? 'rgba(255,255,255,0.2)' : 'var(--color-text-main)',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      Next
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                      className="pagination-btn"
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-glass)',
                        backgroundColor: currentPage === totalPages ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                        color: currentPage === totalPages ? 'rgba(255,255,255,0.2)' : 'var(--color-text-main)',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      Last
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Sidebar (Daily Challenge & Leaderboard) */}
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
            
            {leaderboardLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[1, 2, 3].map(idx => (
                  <div key={idx} style={{ height: '38px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', animation: 'skeleton-pulse 1.5s ease-in-out infinite' }}></div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                 {leaderboard.slice(0, 3).map((participant) => (
                  <div key={participant.rank} style={{ 
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
            )}
            
            <Link to="/dashboard?view=leaderboard" className="btn btn-outline" style={{ width: '100%', fontSize: '12px', padding: '6px', marginTop: '12px', justifyContent: 'center', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <Trophy size={14} color="var(--primary)" />
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

      {/* Styled components inside app injection */}
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
        @keyframes skeleton-pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
        @media (max-width: 900px) {
          .responsive-main-layout {
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

export default Problems;
