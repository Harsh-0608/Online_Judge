import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, ShieldAlert, Clock, Database, ArrowLeft, Code, Zap, Award, CheckCircle, HelpCircle } from 'lucide-react';
import { API_BASE } from '../config';

const SubmissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(window.location.search);
  const contestId = queryParams.get('contestId');
  
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState(0);

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/problems/submissions/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        
        if (data.success) {
          setSubmission(data.submission);
          if (data.submission.testCaseResults && data.submission.testCaseResults.length > 0) {
            const firstFailedIdx = data.submission.testCaseResults.findIndex(tc => tc.status !== 'Accepted');
            setSelectedTestCaseIdx(firstFailedIdx !== -1 ? firstFailedIdx : 0);
          }
        } else {
          setError(data.message || 'Submission not found');
        }
      } catch (err) {
        setError('Failed to connect to CodePlex servers');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubmissionDetails();
  }, [id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted': return 'var(--success)';
      case 'Wrong Answer': return 'var(--danger)';
      case 'Compile Error': return 'var(--warning)';
      case 'Runtime Error': return 'var(--danger)';
      case 'Time Limit Exceeded': return 'var(--warning)';
      default: return 'var(--color-text-muted)';
    }
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

  const getConclusions = (sub) => {
    const status = sub.status;
    const time = sub.executionTime;
    const timeLimit = sub.problem?.timeLimit || 2000;

    if (status === 'Accepted') {
      const isExtremelyFast = time < 100;
      const isModerate = time >= 100 && time < 500;
      
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ color: 'var(--success)', fontWeight: '700', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={18} />
            Excellent Work!
          </div>
          <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
            Your solution is correct and passed <strong>all {sub.totalCount} test cases</strong> successfully. 
            {isExtremelyFast ? (
              <span> The code executed in just <strong>{time}ms</strong>, which is extremely fast and well within the limit of {timeLimit}ms. Your algorithm has optimal time complexity.</span>
            ) : isModerate ? (
              <span> The code executed in <strong>{time}ms</strong>. It is optimal, but you could squeeze out further performance by reducing constant factors, pre-allocating memory, or using simpler conditional logic.</span>
            ) : (
              <span> The code ran in <strong>{time}ms</strong>. While it passed, this is relatively close to the limit of {timeLimit}ms. Consider refactoring if there are nested loops, as an O(N^2) algorithm might time out on larger inputs.</span>
            )}
          </p>
        </div>
      );
    }

    if (status === 'Wrong Answer') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ color: 'var(--danger)', fontWeight: '700', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={18} />
            Logic Analysis
          </div>
          <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
            Your code returned an unexpected output on test case <strong>#{sub.passedCount + 1}</strong>.
            This indicates that while the structure is sound, there is a logical bug or an unhandled edge case.
          </p>
          <div style={{ fontSize: '13px', color: 'var(--color-text-main)' }}>
            <strong style={{ color: 'var(--primary-hover)', display: 'block', marginBottom: '6px' }}>Bugs Debugging Checklist:</strong>
            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--color-text-muted)' }}>
              <li>Did you test for empty/null values, single-element lists, or empty strings?</li>
              <li>For integer problems, does your code handle negative integers, zero, and integer overflow thresholds?</li>
              <li>Check for off-by-one index boundaries (e.g. loops going from `0` to `len` instead of `len - 1`).</li>
              <li>Try writing down step-by-step executions of the failing test case inputs.</li>
            </ul>
          </div>
        </div>
      );
    }

    if (status === 'Time Limit Exceeded') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ color: 'var(--warning)', fontWeight: '700', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={18} color="var(--warning)" />
            Performance Optimization Required
          </div>
          <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
            Your solution exceeded the maximum allowed time limit of <strong>{timeLimit}ms</strong> on test case <strong>#{sub.passedCount + 1}</strong>. 
            This means the algorithmic complexity of your code is too high for larger test cases.
          </p>
          <div style={{ padding: '10px 14px', backgroundColor: 'rgba(245, 158, 11, 0.03)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: '8px', fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
            <strong style={{ color: 'var(--warning)', display: 'block', marginBottom: '4px' }}>How to optimize:</strong>
            <span style={{ display: 'block', lineHeight: '1.5' }}>
              • Avoid nested loops (like loops within loops) which create O(N^2) complexity.
              <br />
              • Use a **Hash Map / Object Lookup** to fetch values in O(1) constant time instead of scanning arrays.
              <br />
              • Apply the **Two Pointers** or **Sliding Window** techniques if dealing with sorted arrays.
              <br />
              • If recursion is used, implement **Memoization** (Dynamic Programming) to store intermediate computations.
            </span>
          </div>
        </div>
      );
    }

    if (status === 'Compile Error') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ color: 'var(--warning)', fontWeight: '700', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={18} />
            Syntax & Compilation Review
          </div>
          <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
            The compiler could not build your code draft. This is usually caused by missing brackets, mismatched typings, or syntax typos.
          </p>
          <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
            Review the error log below. Look specifically for the listed **file line numbers** and token points (e.g. `^` markers) which point directly to the code bug.
          </p>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ color: 'var(--danger)', fontWeight: '700', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldAlert size={18} />
          Runtime Diagnostics
        </div>
        <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
          Your code crashed during execution on case <strong>#{sub.passedCount + 1}</strong>.
          Common causes include accessing null/undefined keys, array index out of bounds, infinite recursion (stack overflows), or dividing by zero.
        </p>
        <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
          Inspect the error logs below to trace the execution call stack trace and locate where the code execution crashed.
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-glass)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <span style={{ fontSize: '15px', color: 'var(--color-text-muted)', fontWeight: '600' }}>Retrieving submission report...</span>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div style={{ padding: '60px 40px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '40px' }}>
          <ShieldAlert size={48} color="var(--danger)" style={{ marginBottom: '16px', opacity: 0.8 }} />
          <h2 style={{ color: 'var(--color-text-main)', fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Error Fetching Report</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '14px' }}>{error || 'Submission not found or unauthorized access'}</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ padding: '10px 20px' }}>Return to Dashboard</button>
        </div>
      </div>
    );
  }

  const hasLimits = submission.problem !== null;
  const timeLimitS = hasLimits ? (submission.problem.timeLimit / 1000).toFixed(1) : '2.0';
  const memoryLimitMB = hasLimits ? Math.round(submission.problem.memoryLimit / 1024) : 256;

  return (
    <div className="responsive-container" style={{ maxWidth: '1000px', margin: '0 auto', minHeight: 'calc(100vh - 70px)', background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent 40%)' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {submission.problem ? (
            <Link to={contestId ? `/problems/${submission.problem.slug}?contestId=${contestId}` : `/problems/${submission.problem.slug}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', color: 'var(--color-text-muted)', transition: 'var(--transition-smooth)' }} className="problem-row-hover-profile">
              <ArrowLeft size={18} />
            </Link>
          ) : (
            <Link to={contestId ? `/contests?contestId=${contestId}` : '/dashboard'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', color: 'var(--color-text-muted)', transition: 'var(--transition-smooth)' }} className="problem-row-hover-profile">
              <ArrowLeft size={18} />
            </Link>
          )}
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--color-text-main)', margin: 0 }}>
              Submission Report
            </h1>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
              Challenge: {submission.problem ? (
                <Link to={contestId ? `/problems/${submission.problem.slug}?contestId=${contestId}` : `/problems/${submission.problem.slug}`} style={{ color: 'var(--primary-hover)', textDecoration: 'none', fontWeight: '700' }} className="problem-link">{submission.problem.title}</Link>
              ) : (
                <span style={{ color: 'var(--color-text-muted)', fontWeight: '700' }}>Unknown Challenge</span>
              )}
            </span>
          </div>
        </div>
        
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', backgroundColor: 'rgba(255,255,255,0.02)', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--border-glass)', fontWeight: '700' }}>
          SUBMITTED ON: {new Date(submission.createdAt).toLocaleString()}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '28px' }}>
        
        {/* Results Overview Block */}
        <div className="glass-card animate-fade-in" style={{ padding: '28px', borderLeft: `4px solid ${getStatusColor(submission.status)}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px', marginBottom: '20px' }}>
            
            {/* Status & Testcase Count */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px', fontWeight: '950', color: getStatusColor(submission.status) }}>
                {submission.status === 'Accepted' ? (
                  <CheckCircle2 size={28} style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.4))' }} />
                ) : (
                  <ShieldAlert size={28} style={{ filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.4))' }} />
                )}
                {submission.status}
              </div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                Passed: <strong style={{ color: 'var(--color-text-main)', fontSize: '15px' }}>{submission.passedCount}</strong> / {submission.totalCount} test cases
              </div>
            </div>

            {/* Metrics cards */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              
              <div style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border-glass)', backgroundColor: 'rgba(255,255,255,0.01)', minWidth: '130px' }}>
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TIME ELAPSED</span>
                <span style={{ fontSize: '18px', fontWeight: '850', color: 'var(--color-text-main)', display: 'block', marginTop: '2px' }}>
                  {submission.executionTime} ms
                </span>
                <span style={{ fontSize: '10.5px', color: 'var(--color-text-muted)', display: 'block', marginTop: '1px' }}>
                  Limit: {timeLimitS}s
                </span>
              </div>

              <div style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border-glass)', backgroundColor: 'rgba(255,255,255,0.01)', minWidth: '130px' }}>
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MEMORY CONSUMED</span>
                <span style={{ fontSize: '18px', fontWeight: '850', color: 'var(--color-text-main)', display: 'block', marginTop: '2px' }}>
                  {(submission.executionMemory / 1024).toFixed(2)} MB
                </span>
                <span style={{ fontSize: '10.5px', color: 'var(--color-text-muted)', display: 'block', marginTop: '1px' }}>
                  Limit: {memoryLimitMB}MB
                </span>
              </div>

              <div style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border-glass)', backgroundColor: 'rgba(255,255,255,0.01)', minWidth: '130px' }}>
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>LANGUAGE</span>
                <span style={{ fontSize: '18px', fontWeight: '850', color: 'var(--color-text-main)', display: 'block', marginTop: '2px' }}>
                  {getLanguageLabel(submission.language)}
                </span>
              </div>

              {submission.complexityAnalysis && submission.complexityAnalysis.approach && (
                <div style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.25)', backgroundColor: 'rgba(99, 102, 241, 0.04)', minWidth: '150px', boxShadow: 'inset 0 0 12px rgba(99, 102, 241, 0.05)' }}>
                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--primary-hover)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>APPROACH</span>
                  <span style={{ fontSize: '15px', fontWeight: '900', color: 'var(--color-text-main)', display: 'block', marginTop: '2px', textShadow: '0 0 10px rgba(99, 102, 241, 0.2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {submission.complexityAnalysis.approach}
                  </span>
                </div>
              )}

            </div>
          </div>

          {/* Dynamic Conclusions */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', padding: '20px', borderRadius: '12px', marginBottom: submission.status !== 'Compile Error' ? '20px' : '0' }}>
            {getConclusions(submission)}
          </div>

          {/* Complexity Insight Block */}
          {submission.status !== 'Compile Error' && (
            <div style={{ 
              padding: '20px', 
              backgroundColor: 'rgba(99, 102, 241, 0.02)', 
              border: '1px solid var(--border-glass)', 
              borderRadius: '12px', 
              fontSize: '13.5px', 
              color: 'var(--color-text-muted)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <strong style={{ color: 'var(--color-text-main)', fontSize: '14.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={16} color="var(--primary)" style={{ filter: 'drop-shadow(0 0 4px var(--primary))' }} />
                  Algorithmic Complexity & Insight
                </strong>
                
                {submission.complexityAnalysis && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: '800', 
                      padding: '3px 8px', 
                      borderRadius: '6px',
                      backgroundColor: submission.complexityAnalysis.timeComplexity.includes('N^2') || submission.complexityAnalysis.timeComplexity.includes('2^N') ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                      color: submission.complexityAnalysis.timeComplexity.includes('N^2') || submission.complexityAnalysis.timeComplexity.includes('2^N') ? 'var(--danger)' : 'var(--success)',
                      border: `1px solid ${submission.complexityAnalysis.timeComplexity.includes('N^2') || submission.complexityAnalysis.timeComplexity.includes('2^N') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                    }}>
                      Time: {submission.complexityAnalysis.timeComplexity}
                    </span>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: '800', 
                      padding: '3px 8px', 
                      borderRadius: '6px',
                      backgroundColor: submission.complexityAnalysis.spaceComplexity.includes('1') ? 'rgba(16, 185, 129, 0.08)' : 'rgba(99, 102, 241, 0.08)',
                      color: submission.complexityAnalysis.spaceComplexity.includes('1') ? 'var(--success)' : 'var(--primary-hover)',
                      border: `1px solid ${submission.complexityAnalysis.spaceComplexity.includes('1') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`
                    }}>
                      Space: {submission.complexityAnalysis.spaceComplexity}
                    </span>
                  </div>
                )}
              </div>
              
              {submission.complexityAnalysis ? (
                <p style={{ margin: 0, lineHeight: '1.6', color: 'var(--color-text-muted)' }}>
                  {submission.complexityAnalysis.insight}
                </p>
              ) : (
                <p style={{ margin: 0, lineHeight: '1.6', color: 'var(--color-text-muted)' }}>
                  Aim for linear time O(N) or logarithmic O(N log N) space/time bounds to keep your solutions running at maximum speed.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Test Case Breakdown Details Grid */}
        {submission.testCaseResults && submission.testCaseResults.length > 0 && (
          <div className="glass-card animate-fade-in" style={{ padding: '24px', animationDelay: '0.05s' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '16px' }}>
              <CheckCircle2 size={16} color="var(--primary)" />
              Test Case Breakdown ({submission.passedCount} / {submission.totalCount} Passed)
            </h2>
            
            {/* Grid of clickable testcase badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              {submission.testCaseResults.map((tc, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTestCaseIdx(idx)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: `1px solid ${selectedTestCaseIdx === idx ? 'var(--primary)' : 'var(--border-glass)'}`,
                    backgroundColor: selectedTestCaseIdx === idx 
                      ? 'rgba(99, 102, 241, 0.12)' 
                      : tc.status === 'Accepted'
                        ? 'rgba(16, 185, 129, 0.04)'
                        : 'rgba(239, 68, 68, 0.04)',
                    color: tc.status === 'Accepted' ? 'var(--success)' : 'var(--danger)',
                    cursor: 'pointer',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <span style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    backgroundColor: tc.status === 'Accepted' ? 'var(--success)' : 'var(--danger)' 
                  }}></span>
                  Case #{idx + 1}
                  <span style={{ fontSize: '10px', opacity: 0.6 }}>({tc.status === 'Accepted' ? 'AC' : 'WA'})</span>
                </button>
              ))}
            </div>

            {/* Details of selected testcase */}
            {selectedTestCaseIdx !== null && submission.testCaseResults[selectedTestCaseIdx] && (() => {
              const tc = submission.testCaseResults[selectedTestCaseIdx];
              const isFailed = tc.status !== 'Accepted';
              // Passing secret case — server sends null fields for privacy
              const isHiddenPassing = !tc.isSample && !isFailed && tc.input === null;
              // Show YOUR OUTPUT if: it's a sample case (always) OR if the case failed (any type)
              const showYourOutput = tc.isSample || isFailed;
              // Show EXPECTED OUTPUT always for sample cases; for secret cases only if failed
              const showExpected = tc.isSample || isFailed;
              return (
                <div style={{ 
                  backgroundColor: 'rgba(0,0,0,0.15)', 
                  border: isFailed ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid var(--border-glass)', 
                  borderRadius: '10px', 
                  padding: '18px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '14px',
                  boxShadow: isFailed ? 'inset 0 0 16px rgba(239, 68, 68, 0.04)' : 'none'
                }}>
                  {/* Status header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '850', color: isFailed ? 'var(--danger)' : 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isFailed ? 'var(--danger)' : 'var(--success)', display: 'inline-block' }}></span>
                      Test Case #{selectedTestCaseIdx + 1} Result: {tc.status}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                      <span>Time: <strong style={{ color: 'var(--color-text-main)' }}>{tc.executionTime || 0}ms</strong></span>
                      <span style={{ height: '12px', width: '1px', backgroundColor: 'var(--border-glass)' }}></span>
                      <span>Memory: <strong style={{ color: 'var(--color-text-main)' }}>{((tc.executionMemory || 0) / 1024).toFixed(2)} MB</strong></span>
                      <span style={{ height: '12px', width: '1px', backgroundColor: 'var(--border-glass)' }}></span>
                      <span style={{ textTransform: 'uppercase', fontSize: '9.5px', padding: '2px 8px', borderRadius: '4px', backgroundColor: tc.isSample ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)', color: tc.isSample ? 'var(--primary)' : 'var(--color-text-muted)', border: '1px solid var(--border-glass)' }}>
                        {tc.isSample ? 'Sample Case' : 'Secret Case'}
                      </span>
                    </div>
                  </div>

                  {/* Debugging banner for failures */}
                  {isFailed && (
                    <div style={{ padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.12)', borderRadius: '6px', fontSize: '12.5px', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                      <strong style={{ color: 'var(--danger)' }}>Debugging Info:</strong> Output mismatch detected. Review the expected output and your program's stdout below to align your algorithm.
                    </div>
                  )}

                  {/* I/O Grid — only shown when data is available */}
                  {isHiddenPassing ? (
                    <div style={{ padding: '12px 16px', backgroundColor: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.12)', borderRadius: '6px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      <strong style={{ color: 'var(--success)' }}>✓ Passed:</strong> This is a hidden secret test case. Its inputs and outputs are kept private to prevent cheating.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: showYourOutput ? '1fr 1fr 1fr' : '1fr 1fr', gap: '14px' }} className="responsive-tc-details">
                      {/* INPUT — always shown */}
                      <div>
                        <div style={{ fontSize: '9.5px', fontWeight: '800', color: 'var(--color-text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>INPUT</div>
                        <pre style={{ margin: 0, padding: '10px 14px', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12.5px', color: 'var(--color-text-main)', overflowX: 'auto', borderLeft: '3px solid var(--color-text-muted)' }}>
                          {tc.input}
                        </pre>
                      </div>

                      {/* EXPECTED OUTPUT — shown for sample cases always, and for failed secret cases */}
                      {showExpected && (
                        <div>
                          <div style={{ fontSize: '9.5px', fontWeight: '800', color: 'var(--color-text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>EXPECTED OUTPUT</div>
                          <pre style={{ margin: 0, padding: '10px 14px', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12.5px', color: 'var(--success)', overflowX: 'auto', fontWeight: '700', borderLeft: '3px solid var(--success)' }}>
                            {tc.expected}
                          </pre>
                        </div>
                      )}

                      {/* YOUR OUTPUT — shown for sample cases always, and for failed secret cases */}
                      {showYourOutput && (
                        <div>
                          <div style={{ fontSize: '9.5px', fontWeight: '800', color: 'var(--color-text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>YOUR OUTPUT</div>
                          <pre style={{ margin: 0, padding: '10px 14px', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12.5px', color: isFailed ? 'var(--danger)' : 'var(--success)', overflowX: 'auto', fontWeight: '700', borderLeft: isFailed ? '3px solid var(--danger)' : '3px solid var(--success)' }}>
                            {tc.actual || '[No Output / Crash]'}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Display Stack Trace Logs if compile/runtime error */}
        {submission.errorDetails && (submission.status === 'Compile Error' || submission.status === 'Runtime Error') && (
          <div className="glass-card animate-fade-in" style={{ padding: '24px', animationDelay: '0.05s' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '16px' }}>
              <ShieldAlert size={16} />
              Error Diagnostic Logs
            </h2>
            <pre style={{ margin: 0, padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.15)', color: '#f87171', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12.5px', overflowX: 'auto', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
              {submission.errorDetails}
            </pre>
          </div>
        )}

        {/* Code Submitted Card */}
        <div className="glass-card animate-fade-in" style={{ padding: '24px', animationDelay: '0.1s' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '16px' }}>
            <Code size={16} color="var(--primary)" />
            Submitted Code Source
          </h2>
          
          <pre style={{
            margin: 0,
            padding: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-glass)',
            borderRadius: '12px',
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#e2e8f0',
            overflowX: 'auto',
            lineHeight: '1.5',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}>
            {submission.code}
          </pre>
        </div>

        {/* Bottom Navigation controls */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'flex-start', marginTop: '8px' }}>
          {submission.problem && (
            <Link to={contestId ? `/problems/${submission.problem.slug}?contestId=${contestId}` : `/problems/${submission.problem.slug}`} className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '14px', gap: '8px' }}>
              <Zap size={16} />
              {submission.status === 'Accepted' ? 'Try Again / Optimize' : 'Try Again'}
            </Link>
          )}
          <Link to={contestId ? `/contests?contestId=${contestId}` : '/dashboard'} className="btn btn-outline" style={{ padding: '12px 24px', fontSize: '14px' }}>
            {contestId ? 'Return to Contest' : 'Return to Dashboard'}
          </Link>
        </div>

      </div>

      <style>{`
        .problem-row-hover-profile:hover {
          background-color: rgba(255, 255, 255, 0.08) !important;
          color: var(--color-text-main) !important;
        }
        @media (max-width: 768px) {
          .responsive-tc-details {
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

export default SubmissionDetail;
