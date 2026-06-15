import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Code, Play, CheckCircle2, ShieldAlert, Clock, Database, ChevronUp, ChevronDown, CheckCircle, HelpCircle, Tag, Eye, XCircle, RotateCcw } from 'lucide-react';
import { API_BASE } from '../config';

const ProblemDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Tab layout states
  const [leftTab, setLeftTab] = useState('description'); // 'description' or 'submissions'
  const [submissions, setSubmissions] = useState([]);
  const [showAllSubmissions, setShowAllSubmissions] = useState(false);
  
  // Workspace tabs state for mobile
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('statement'); // 'statement' or 'editor'

  // Editor configuration
  const [selectedLanguage, setSelectedLanguage] = useState(() => localStorage.getItem('codeplex_last_lang_global') || 'java');
  const [editorTheme, setEditorTheme] = useState(() => localStorage.getItem('codeplex_editor_theme') || 'vs-dark');
  const [codeBuffers, setCodeBuffers] = useState({
    javascript: '',
    python: '',
    cpp: '',
    java: ''
  });

  // Run/Submit console states
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [consoleTab, setConsoleTab] = useState('testcase'); // 'testcase' or 'result'
  const [customInput, setCustomInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [selectedConsoleTestCaseIdx, setSelectedConsoleTestCaseIdx] = useState(0);

  // Sync theme selection to localStorage
  useEffect(() => {
    localStorage.setItem('codeplex_editor_theme', editorTheme);
  }, [editorTheme]);

  useEffect(() => {
    // Prevent document body scrolling to keep the viewport locked
    document.body.style.overflow = 'hidden';

    const fetchProblemData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/problems/${slug}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setProblem(data.problem);
          
          // Load default templates first
          const defaultBuffers = {
            javascript: data.problem.templates.javascript,
            python: data.problem.templates.python,
            cpp: data.problem.templates.cpp,
            java: data.problem.templates.java || ''
          };
          
          // Override with any auto-saved drafts from localStorage
          const langs = ['javascript', 'python', 'cpp', 'java'];
          const userId = user?.id || user?._id || 'guest';
          langs.forEach(lang => {
            const savedDraft = localStorage.getItem(`codeplex_draft_${userId}_${data.problem._id}_${lang}`);
            if (savedDraft) {
              defaultBuffers[lang] = savedDraft;
            }
          });

          setCodeBuffers(defaultBuffers);

          const savedLang = localStorage.getItem(`codeplex_last_lang_global`) || localStorage.getItem(`codeplex_last_lang_${data.problem._id}`);
          if (savedLang && langs.includes(savedLang)) {
            setSelectedLanguage(savedLang);
          } else {
            setSelectedLanguage('java');
          }

          // Set first sample case as default custom input
          if (data.problem.sampleTestCases.length > 0) {
            setCustomInput(data.problem.sampleTestCases[0].input);
          }
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to load problem statement');
      } finally {
        setLoading(false);
      }
    };

    fetchProblemData();
    fetchSubmissionsHistory();

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [slug, user]);

  const fetchSubmissionsHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/problems/${slug}/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.submissions);
      }
    } catch (err) {
      console.error('Failed to load submission logs:', err);
    }
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setSelectedLanguage(lang);
    if (problem) {
      localStorage.setItem(`codeplex_last_lang_${problem._id}`, lang);
      localStorage.setItem(`codeplex_last_lang_global`, lang);
    }
  };

  const handleEditorChange = (value) => {
    if (value === undefined) return;
    setCodeBuffers(prev => ({
      ...prev,
      [selectedLanguage]: value
    }));
    // Save draft auto-save
    if (problem) {
      const userId = user?.id || user?._id || 'guest';
      localStorage.setItem(`codeplex_draft_${userId}_${problem._id}_${selectedLanguage}`, value);
    }
  };

  const handleResetCode = () => {
    if (!problem) return;
    const confirmReset = window.confirm("Are you sure you want to reset your code to the default template? This will discard your current changes.");
    if (confirmReset) {
      const defaultTemplate = problem.templates[selectedLanguage] || '';
      setCodeBuffers(prev => ({
        ...prev,
        [selectedLanguage]: defaultTemplate
      }));
      // Remove the draft from localStorage
      const userId = user?.id || user?._id || 'guest';
      localStorage.removeItem(`codeplex_draft_${userId}_${problem._id}_${selectedLanguage}`);
    }
  };

  const handleRunCode = async () => {
    if (isRunning || isSubmitting) return;
    setIsRunning(true);
    setIsConsoleOpen(true);
    setConsoleTab('result');
    setExecutionResult({ running: true });
    setSelectedConsoleTestCaseIdx(0);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/problems/${slug}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: codeBuffers[selectedLanguage],
          language: selectedLanguage,
          customInput
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setExecutionResult(data.result);
        if (data.result && data.result.testCaseResults && data.result.testCaseResults.length > 0) {
          const firstFailedIdx = data.result.testCaseResults.findIndex(tc => tc.status !== 'Accepted');
          setSelectedConsoleTestCaseIdx(firstFailedIdx !== -1 ? firstFailedIdx : 0);
        }
      } else {
        setExecutionResult({ status: 'Error', errorDetails: data.message });
      }
    } catch (err) {
      setExecutionResult({ status: 'Error', errorDetails: 'Connection failed' });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (isRunning || isSubmitting) return;
    setIsSubmitting(true);
    setIsConsoleOpen(true);
    setConsoleTab('result');
    setExecutionResult({ running: true });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/problems/${slug}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: codeBuffers[selectedLanguage],
          language: selectedLanguage
        })
      });

      const data = await res.json();
      if (data.success) {
        if (problem) {
          localStorage.setItem(`codeplex_last_lang_${problem._id}`, selectedLanguage);
          localStorage.setItem(`codeplex_last_lang_global`, selectedLanguage);
        }
        // Redirect to submission detail result page
        navigate(`/submissions/${data.submissionId}`);
      } else {
        setExecutionResult({ status: 'Error', errorDetails: data.message });
      }
    } catch (err) {
      setExecutionResult({ status: 'Error', errorDetails: 'Connection failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Setup Keyboard Shortcuts via Ref to access latest states without listener rebuilds
  const runCodeRef = useRef(handleRunCode);
  const submitCodeRef = useRef(handleSubmitCode);

  useEffect(() => {
    runCodeRef.current = handleRunCode;
    submitCodeRef.current = handleSubmitCode;
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Enter or Cmd+Enter to Run
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          submitCodeRef.current();
        } else {
          runCodeRef.current();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getStatusColor = (status) => {
    return status === 'Accepted' ? 'var(--success)' : 'var(--danger)';
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

  const getMonacoLanguage = (lang) => {
    if (lang === 'cpp') return 'cpp';
    if (lang === 'python') return 'python';
    if (lang === 'java') return 'java';
    return 'javascript';
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-glass)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <span style={{ fontSize: '15px', color: 'var(--color-text-muted)', fontWeight: '600' }}>Initializing CodePlex IDE...</span>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--danger)', marginBottom: '10px' }}>Error Loading Workspace</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>{error || 'Problem not found'}</p>
        <button onClick={() => navigate('/problems')} className="btn btn-primary">Return to Challenges</button>
      </div>
    );
  }

  return (
    <div style={{ height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      
      {/* Mobile view Tab bar */}
      <div className="mobile-workspace-tabs" style={{ display: 'none', backgroundColor: '#0e1220', borderBottom: '1px solid var(--border-glass)', padding: '6px', justifyContent: 'center', gap: '8px', zIndex: 12 }}>
        <button 
          onClick={() => setActiveWorkspaceTab('statement')}
          className={`tab-toggle ${activeWorkspaceTab === 'statement' ? 'active' : ''}`}
          style={{ padding: '6px 18px', fontSize: '12px' }}
        >
          Description & Details
        </button>
        <button 
          onClick={() => setActiveWorkspaceTab('editor')}
          className={`tab-toggle ${activeWorkspaceTab === 'editor' ? 'active' : ''}`}
          style={{ padding: '6px 18px', fontSize: '12px' }}
        >
          Code Editor
        </button>
      </div>

      <div className={`workspace-grid show-${activeWorkspaceTab}`} style={{ flexGrow: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr', overflow: 'hidden' }}>
        
        {/* LEFT COLUMN: Problem description/submissions */}
        <div className="workspace-col-statement" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border-glass)', height: '100%', minHeight: '0', overflow: 'hidden' }}>
          {/* Navigation back and tabs */}
          <div style={{ borderBottom: '1px solid var(--border-glass)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <button 
              onClick={() => navigate('/problems')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: 'none', background: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '13.5px', fontWeight: '700', transition: 'var(--transition-smooth)' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--primary-hover)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--color-text-muted)'}
            >
              <ArrowLeft size={16} />
              Problems
            </button>
            
            <div style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '15px', padding: '2px', border: '1px solid var(--border-glass)' }}>
              <button 
                onClick={() => setLeftTab('description')}
                className={`tab-toggle ${leftTab === 'description' ? 'active' : ''}`}
              >
                Description
              </button>
              <button 
                onClick={() => setLeftTab('submissions')}
                className={`tab-toggle ${leftTab === 'submissions' ? 'active' : ''}`}
              >
                Submissions ({submissions.length})
              </button>
            </div>
          </div>

          {/* Tab Content (Scrollable) */}
          <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px 30px', minHeight: '0' }}>
            {leftTab === 'description' ? (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: '850', marginBottom: '8px', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {problem.isSolved && (
                      <CheckCircle size={22} color="var(--success)" style={{ filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.3))' }} />
                    )}
                    {problem.title}
                    {problem.isSolved && (
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: '850', 
                        color: 'var(--success)', 
                        backgroundColor: 'rgba(16, 185, 129, 0.08)',
                        padding: '3px 10px', 
                        borderRadius: '20px', 
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        <CheckCircle size={12} color="var(--success)" />
                        Solved
                      </span>
                    )}
                  </h1>
                  
                  {/* Tags and Stats Row */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: '800', 
                      color: problem.difficulty === 'Easy' ? 'var(--success)' : problem.difficulty === 'Medium' ? 'var(--warning)' : 'var(--danger)',
                      backgroundColor: problem.difficulty === 'Easy' ? 'var(--success-glow)' : problem.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.08)' : 'var(--danger-glow)',
                      padding: '4px 12px', 
                      borderRadius: '12px',
                      border: `1px solid ${problem.difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.2)' : problem.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                    }}>
                      {problem.difficulty}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                      Acceptance Rate: <strong style={{ color: 'var(--color-text-main)' }}>{problem.acceptanceRate}%</strong>
                    </span>
                    <span style={{ height: '12px', width: '1px', backgroundColor: 'var(--border-glass)' }}></span>
                    <span style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', fontWeight: '500' }}>
                      Passed: <strong style={{ color: 'var(--color-text-main)' }}>{problem.acceptedSubmissions || 0}</strong> / {problem.totalSubmissions || 0}
                    </span>
                  </div>

                  {/* Problem Tags display */}
                  {problem.tags && problem.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      {problem.tags.map(tag => (
                        <span key={tag} style={{ fontSize: '10px', fontWeight: '700', color: 'var(--primary-hover)', backgroundColor: 'rgba(99, 102, 241, 0.04)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(99, 102, 241, 0.1)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Tag size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--border-glass)' }}></div>

                {/* Description Markdown text */}
                <div style={{ fontSize: '14.5px', color: 'var(--color-text-main)', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {problem.description}
                </div>

                {/* Input Format */}
                {problem.inputFormat && (
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '10px', padding: '16px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                      Input Format
                    </h4>
                    <p style={{ fontSize: '13.5px', color: 'var(--color-text-main)', lineHeight: '1.5' }}>{problem.inputFormat}</p>
                  </div>
                )}

                {/* Output Format */}
                {problem.outputFormat && (
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '10px', padding: '16px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                      Output Format
                    </h4>
                    <p style={{ fontSize: '13.5px', color: 'var(--color-text-main)', lineHeight: '1.5' }}>{problem.outputFormat}</p>
                  </div>
                )}

                {/* Constraints formatted list */}
                {problem.constraints && (
                  <div>
                    <h4 style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                      Constraints
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {problem.constraints.split('\n').filter(c => c.trim().length > 0).map((constraint, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-main)', fontFamily: 'monospace', backgroundColor: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
                          <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--primary)', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }}></span>
                          <span>{constraint.replace(/^[•\s\-\*]+/, '')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sample test cases */}
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                    Sample Test Cases
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {problem.sampleTestCases.map((tc, index) => (
                      <div key={tc._id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--primary)' }}>Sample #{index + 1}</span>
                        <div className="responsive-sample-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div>
                            <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>INPUT</div>
                            <pre style={{ margin: 0, padding: '10px 14px', backgroundColor: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-glass)', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12.5px', overflowX: 'auto', color: 'var(--color-text-main)' }}>{tc.input}</pre>
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>OUTPUT</div>
                            <pre style={{ margin: 0, padding: '10px 14px', backgroundColor: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-glass)', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12.5px', overflowX: 'auto', color: 'var(--color-text-main)' }}>{tc.output}</pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Submissions List Tab
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {submissions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
                    <HelpCircle size={32} color="var(--primary)" style={{ opacity: 0.3, marginBottom: '12px' }} />
                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-main)' }}>No Submissions Found</h4>
                    <p style={{ fontSize: '13px' }}>Your compilation and submission history for this challenge will appear here.</p>
                  </div>
                ) : (
                  <>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', textAlign: 'left', minWidth: '400px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--color-text-muted)' }}>
                            <th style={{ padding: '12px 10px', fontWeight: '700' }}>Status</th>
                            <th style={{ padding: '12px 10px', fontWeight: '700', width: '100px' }}>Language</th>
                            <th style={{ padding: '12px 10px', fontWeight: '700', textAlign: 'center' }}>Time</th>
                            <th style={{ padding: '12px 10px', fontWeight: '700', textAlign: 'center' }}>Memory</th>
                            <th style={{ padding: '12px 10px', fontWeight: '700', textAlign: 'right' }}>Submitted</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(showAllSubmissions ? submissions : submissions.slice(0, 10)).map((sub) => (
                            <tr key={sub._id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                              <td style={{ padding: '14px 10px', verticalAlign: 'middle' }}>
                                <Link to={`/submissions/${sub._id}`} style={{ textDecoration: 'none', fontWeight: '700', color: getStatusColor(sub.status), display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  {sub.status === 'Accepted' ? (
                                    <CheckCircle size={14} color="var(--success)" style={{ flexShrink: 0 }} />
                                  ) : (
                                    <XCircle size={14} color="var(--danger)" style={{ flexShrink: 0 }} />
                                  )}
                                  {sub.status}
                                </Link>
                              </td>
                              <td style={{ padding: '14px 10px', verticalAlign: 'middle', textTransform: 'capitalize', color: 'var(--color-text-main)' }}>
                                {sub.language === 'cpp' ? 'C++' : sub.language}
                              </td>
                              <td style={{ padding: '14px 10px', verticalAlign: 'middle', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                {sub.executionTime}ms
                              </td>
                              <td style={{ padding: '14px 10px', verticalAlign: 'middle', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                {(sub.executionMemory / 1024).toFixed(2)} MB
                              </td>
                              <td style={{ padding: '14px 10px', verticalAlign: 'middle', textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '12.5px' }}>
                                {getProblemAge(sub.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {submissions.length > 10 && !showAllSubmissions && (
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                        <button
                          onClick={() => setShowAllSubmissions(true)}
                          className="btn btn-outline"
                          style={{ padding: '6px 16px', fontSize: '12.5px', borderRadius: '6px' }}
                        >
                          View All Submissions
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Code editor & Run buttons */}
        <div className="workspace-col-editor" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', minHeight: '0', overflow: 'hidden' }}>
          
          {/* Editor controls banner */}
          <div style={{ borderBottom: '1px solid var(--border-glass)', padding: '12px 20px', display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, backgroundColor: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code size={18} color="var(--primary)" />
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-main)' }}>Workspace IDE</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {/* Theme selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--color-text-muted)' }}>Theme:</span>
                <select
                  value={editorTheme}
                  onChange={(e) => setEditorTheme(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    color: 'var(--color-text-main)',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="vs-dark">Dark Theme</option>
                  <option value="light">Light Theme</option>
                  <option value="hc-black">High Contrast</option>
                </select>
              </div>

              {/* Language selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--color-text-muted)' }}>Lang:</span>
                <select
                  value={selectedLanguage}
                  onChange={handleLanguageChange}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    color: 'var(--color-text-main)',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python 3</option>
                  <option value="cpp">C++ (GCC)</option>
                  <option value="java">Java (JDK 23)</option>
                </select>
              </div>

              {/* Reset button */}
              <button
                onClick={handleResetCode}
                title="Reset code to default template"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  backgroundColor: 'rgba(239, 68, 68, 0.04)',
                  color: '#f87171',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'var(--transition-smooth)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                }}
              >
                <RotateCcw size={13} />
                Reset
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div style={{ flexGrow: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#1e1e1e', minHeight: '0' }}>
            <Editor
              height="100%"
              language={getMonacoLanguage(selectedLanguage)}
              theme={editorTheme}
              value={codeBuffers[selectedLanguage]}
              onChange={handleEditorChange}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                automaticLayout: true,
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                padding: { top: 12, bottom: 12 }
              }}
            />
          </div>

          {/* Dynamic Execution Drawer Console */}
          <div 
            style={{ 
              position: 'absolute',
              bottom: '60px',
              left: 0,
              right: 0,
              backgroundColor: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border-glass)',
              boxShadow: '0 -8px 30px rgba(0,0,0,0.3)',
              height: isConsoleOpen ? '280px' : '0',
              transition: 'height 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              overflow: 'hidden',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Console tabs */}
            <div style={{ display: 'flex', backgroundColor: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-glass)', padding: '6px 20px', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setConsoleTab('testcase')}
                  className={`console-tab-btn ${consoleTab === 'testcase' ? 'active' : ''}`}
                >
                  Custom Input
                </button>
                <button 
                  onClick={() => setConsoleTab('result')}
                  className={`console-tab-btn ${consoleTab === 'result' ? 'active' : ''}`}
                >
                  Result
                </button>
              </div>
              
              <button 
                onClick={() => setIsConsoleOpen(false)}
                style={{ border: 'none', background: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '13px', fontWeight: '700', outline: 'none' }}
              >
                Close
              </button>
            </div>

            {/* Console Tab Content */}
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '16px 20px', backgroundColor: 'var(--bg-secondary)' }}>
              {consoleTab === 'testcase' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
                  {/* Sample Test Case Quick Load Buttons */}
                  {problem && problem.sampleTestCases && problem.sampleTestCases.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', marginRight: '4px' }}>Load Sample Case:</span>
                      {problem.sampleTestCases.map((tc, idx) => (
                        <button
                          key={tc._id}
                          type="button"
                          onClick={() => setCustomInput(tc.input)}
                          className="sample-tc-btn"
                          style={{
                            padding: '4px 10px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border-glass)',
                            borderRadius: '6px',
                            color: 'var(--color-text-main)',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'var(--transition-smooth)'
                          }}
                        >
                          Case #{idx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter custom inputs here..."
                    style={{
                      width: '100%',
                      flexGrow: 1,
                      minHeight: '100px',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '8px',
                      padding: '12px',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      resize: 'none',
                      color: 'var(--color-text-main)'
                    }}
                  />
                </div>
              ) : (
                // Results Display
                <div style={{ height: '100%' }}>
                  {executionResult ? (
                    executionResult.running ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', minHeight: '140px' }}>
                        <div style={{ width: '30px', height: '30px', border: '3px solid var(--border-glass)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        <span style={{ fontSize: '13.5px', color: 'var(--color-text-muted)', fontWeight: '600' }}>Evaluating code submissions...</span>
                      </div>
                    ) : executionResult.status === 'Compile Error' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)', fontWeight: '700', fontSize: '14.5px' }}>
                            <ShieldAlert size={18} />
                            Compilation Error
                          </div>
                          {executionResult.totalCount !== undefined && (
                            <span style={{ fontSize: '12.5px', fontWeight: '700', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--color-text-muted)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                              Passed: 0 / {executionResult.totalCount} sample test cases
                            </span>
                          )}
                        </div>
                        <pre style={{ margin: 0, padding: '12px', backgroundColor: 'var(--danger-glow)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px', overflowX: 'auto', maxHeight: '140px', whiteSpace: 'pre-wrap' }}>{executionResult.errorDetails}</pre>
                      </div>
                    ) : executionResult.status === 'Runtime Error' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontWeight: '700', fontSize: '14.5px' }}>
                            <ShieldAlert size={18} />
                            Runtime Error
                          </div>
                          {executionResult.passedCount !== undefined && (
                            <span style={{ fontSize: '12.5px', fontWeight: '700', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--color-text-muted)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                              Passed: {executionResult.passedCount} / {executionResult.totalCount} sample test cases
                            </span>
                          )}
                        </div>
                        <pre style={{ margin: 0, padding: '12px', backgroundColor: 'var(--danger-glow)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px', overflowX: 'auto', maxHeight: '140px', whiteSpace: 'pre-wrap' }}>{executionResult.errorDetails}</pre>
                      </div>
                    ) : (
                      // Solved details (Accepted / Wrong Answer / TLE)
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '16px', color: getStatusColor(executionResult.status) }}>
                              {executionResult.status === 'Accepted' ? <CheckCircle2 size={20} /> : <ShieldAlert size={20} />}
                              {executionResult.status}
                            </div>
                            {executionResult.passedCount !== undefined && (
                              <span style={{ 
                                fontSize: '12px', 
                                fontWeight: '700', 
                                backgroundColor: executionResult.status === 'Accepted' ? 'var(--success-glow)' : 'rgba(255, 255, 255, 0.05)', 
                                color: executionResult.status === 'Accepted' ? 'var(--success)' : 'var(--color-text-muted)',
                                padding: '2px 8px', 
                                borderRadius: '12px',
                                border: `1px solid ${executionResult.status === 'Accepted' ? 'rgba(16,185,129,0.2)' : 'var(--border-glass)'}`
                              }}>
                                Passed: {executionResult.passedCount} / {executionResult.totalCount} sample test cases
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={14} />
                              Time: <strong style={{ color: 'var(--color-text-main)' }}>{executionResult.executionTime}ms</strong>
                              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', opacity: 0.7 }}> (Limit: {(problem.timeLimit / 1000).toFixed(1)}s)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Database size={14} />
                              Memory: <strong style={{ color: 'var(--color-text-main)' }}>{(executionResult.executionMemory / 1024).toFixed(2)} MB</strong>
                              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', opacity: 0.7 }}> (Limit: {Math.round(problem.memoryLimit / 1024)}MB)</span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive list of testcase buttons */}
                        {executionResult.testCaseResults && executionResult.testCaseResults.length > 0 && (
                          <div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                              {executionResult.testCaseResults.map((tc, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setSelectedConsoleTestCaseIdx(idx)}
                                  style={{
                                    padding: '5px 12px',
                                    borderRadius: '6px',
                                    border: `1px solid ${selectedConsoleTestCaseIdx === idx ? 'var(--primary)' : 'var(--border-glass)'}`,
                                    backgroundColor: selectedConsoleTestCaseIdx === idx 
                                      ? 'rgba(99, 102, 241, 0.12)' 
                                      : tc.status === 'Accepted'
                                        ? 'rgba(16, 185, 129, 0.04)'
                                        : 'rgba(239, 68, 68, 0.04)',
                                    color: tc.status === 'Accepted' ? 'var(--success)' : 'var(--danger)',
                                    cursor: 'pointer',
                                    fontSize: '11.5px',
                                    fontWeight: '700',
                                    outline: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    transition: 'var(--transition-smooth)'
                                  }}
                                >
                                  <span style={{ 
                                    width: '5px', 
                                    height: '5px', 
                                    borderRadius: '50%', 
                                    backgroundColor: tc.status === 'Accepted' ? 'var(--success)' : 'var(--danger)' 
                                  }}></span>
                                  {tc.isCustom ? 'Custom Input' : `Case #${idx + 1}`}
                                </button>
                              ))}
                            </div>

                            {/* Details of the selected case */}
                            {executionResult.testCaseResults[selectedConsoleTestCaseIdx] && (() => {
                              const tc = executionResult.testCaseResults[selectedConsoleTestCaseIdx];
                              const isCustom = !tc.expected || (typeof tc.expected === 'string' && tc.expected.trim().length === 0);
                              const isFailed = tc.status !== 'Accepted';
                              return (
                                <div style={{ 
                                  backgroundColor: 'rgba(0,0,0,0.15)', 
                                  border: isFailed ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid var(--border-glass)', 
                                  borderRadius: '8px', 
                                  padding: '12px', 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  gap: '8px',
                                  boxShadow: isFailed ? 'inset 0 0 12px rgba(239, 68, 68, 0.04)' : 'none'
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                    <span style={{ fontWeight: '800', color: tc.status === 'Accepted' ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: tc.status === 'Accepted' ? 'var(--success)' : 'var(--danger)', display: 'inline-block' }}></span>
                                      Status: {tc.status}
                                    </span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                      <span>Time: <strong>{tc.executionTime || 0}ms</strong></span>
                                      <span>Memory: <strong>{((tc.executionMemory || 0) / 1024).toFixed(2)} MB</strong></span>
                                    </div>
                                  </div>

                                  {isFailed && !isCustom && (
                                    <div style={{ padding: '6px 10px', backgroundColor: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '4px', fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                                      <strong style={{ color: 'var(--danger)' }}>Output Mismatch:</strong> Expected output does not match actual output.
                                    </div>
                                  )}

                                  <div style={{ display: 'grid', gridTemplateColumns: isCustom ? '1fr 1fr' : '1fr 1.5fr 1.5fr', gap: '10px' }} className="responsive-tc-details">
                                    <div>
                                      <div style={{ fontSize: '9px', fontWeight: '800', color: 'var(--color-text-muted)', marginBottom: '3px', textTransform: 'uppercase' }}>INPUT</div>
                                      <pre style={{ margin: 0, padding: '6px 10px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-text-main)', overflowX: 'auto', maxHeight: '100px', borderLeft: '2px solid var(--color-text-muted)' }}>
                                        {tc.input}
                                      </pre>
                                    </div>
                                    {!isCustom && (
                                      <div>
                                        <div style={{ fontSize: '9px', fontWeight: '800', color: 'var(--color-text-muted)', marginBottom: '3px', textTransform: 'uppercase' }}>EXPECTED</div>
                                        <pre style={{ margin: 0, padding: '6px 10px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--success)', overflowX: 'auto', maxHeight: '100px', fontWeight: '700', borderLeft: '2px solid var(--success)' }}>
                                          {tc.expected}
                                        </pre>
                                      </div>
                                    )}
                                    <div>
                                      <div style={{ fontSize: '9px', fontWeight: '800', color: 'var(--color-text-muted)', marginBottom: '3px', textTransform: 'uppercase' }}>YOUR OUTPUT</div>
                                      <pre style={{ margin: 0, padding: '6px 10px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px', color: tc.status === 'Accepted' ? 'var(--success)' : 'var(--danger)', overflowX: 'auto', maxHeight: '100px', fontWeight: '700', borderLeft: isFailed ? '2px solid var(--danger)' : '2px solid var(--success)' }}>
                                        {tc.actual || '[No Output / Crash]'}
                                      </pre>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* Display success message if Accepted and no results are shown (backup) */}
                        {executionResult.status === 'Accepted' && (!executionResult.testCaseResults || executionResult.testCaseResults.length === 0) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', backgroundColor: 'var(--success-glow)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--success)', borderRadius: '6px', fontSize: '13.5px', fontWeight: '700' }}>
                            <CheckCircle size={18} />
                            All sample test cases passed successfully! Code execution is verified.
                          </div>
                        )}

                        {/* TLE limits (backup) */}
                        {executionResult.status === 'Time Limit Exceeded' && (!executionResult.testCaseResults || executionResult.testCaseResults.length === 0) && (
                          <div style={{ color: '#fbbf24', fontSize: '13.5px', fontWeight: '600' }}>
                            {executionResult.errorDetails || 'Time Limit Exceeded'}
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '13.5px', textAlign: 'center', padding: '20px 0' }}>
                      Click Run Code to compile against sample inputs.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Editor bottom controls footer */}
          <div style={{ borderTop: '1px solid var(--border-glass)', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, backgroundColor: 'var(--bg-secondary)', zIndex: 11 }}>
            <button
              onClick={() => setIsConsoleOpen(!isConsoleOpen)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-main)',
                fontSize: '13px',
                fontWeight: '700',
                outline: 'none',
                transition: 'var(--transition-smooth)'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--color-text-main)'}
            >
              Console
              {isConsoleOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleRunCode}
                disabled={isRunning || isSubmitting}
                className="btn btn-outline"
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: '700',
                  cursor: isRunning || isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                <Play size={12} fill="currentColor" />
                {isRunning ? 'Running...' : 'Run Code'}
              </button>
              <button
                onClick={handleSubmitCode}
                disabled={isRunning || isSubmitting}
                className="btn btn-primary"
                style={{
                  padding: '8px 18px',
                  fontSize: '13px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: '700',
                  cursor: isRunning || isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                <CheckCircle2 size={12} />
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Styled toggle and console components */}
      <style>{`
        .tab-toggle {
          border: none;
          background: transparent;
          padding: 6px 14px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          color: var(--color-text-muted);
          cursor: pointer;
          transition: var(--transition-smooth);
          outline: none;
        }
        .tab-toggle.active {
          background-color: rgba(255, 255, 255, 0.08);
          color: var(--primary-hover);
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.2);
        }
        .console-tab-btn {
          border: none;
          background: transparent;
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 700;
          color: var(--color-text-muted);
          cursor: pointer;
          outline: none;
          border-bottom: 2px solid transparent;
          transition: var(--transition-smooth);
        }
        .console-tab-btn.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }
        .sample-tc-btn:hover {
          background-color: rgba(99, 102, 241, 0.15) !important;
          border-color: rgba(99, 102, 241, 0.3) !important;
        }
        select option {
          background-color: #0c0f1a;
          color: #f1f5f9;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .workspace-grid {
            grid-template-columns: 1fr !important;
          }
          .mobile-workspace-tabs {
            display: flex !important;
          }
          .workspace-grid.show-statement .workspace-col-editor {
            display: none !important;
          }
          .workspace-grid.show-editor .workspace-col-statement {
            display: none !important;
          }
          .responsive-sample-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
};

export default ProblemDetail;
