import React, { useState, useEffect, useRef } from 'react';
import { useCIRA } from '../context/CIRAContext.jsx';
import { api } from '../services/api.js';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const { openCaseWorkspace, setSelectedEvidence, updateSubject, navigate } = useCIRA();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ cases: [], evidence: [], entities: [], total_matches: 0 });
  const [loading, setLoading] = useState(false);
  const [searchState, setSearchState] = useState('idle'); // 'idle' | 'loading' | 'success' | 'empty' | 'offline' | 'unauthorized' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef(null);
  const seqIdRef = useRef(0);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setQuery('');
      setResults({ cases: [], evidence: [], entities: [], total_matches: 0 });
      setSearchState('idle');
      setErrorMessage('');
    }
  }, [isOpen]);

  // Handle search query with race cancellation & sequence ID
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setResults({ cases: [], evidence: [], entities: [], total_matches: 0 });
      setLoading(false);
      setSearchState('idle');
      setErrorMessage('');
      return;
    }

    const currentSeq = ++seqIdRef.current;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setSearchState('loading');
    setErrorMessage('');

    const timer = setTimeout(async () => {
      try {
        const data = await api.globalSearch(trimmed, { signal: controller.signal });
        if (currentSeq !== seqIdRef.current) return;
        setResults(data);
        if (data.total_matches === 0) {
          setSearchState('empty');
        } else {
          setSearchState('success');
        }
      } catch (e) {
        if (e.name === 'AbortError' || currentSeq !== seqIdRef.current) return;
        console.warn('Search query error', e);
        if (e.status === 401 || e.status === 403) {
          setSearchState('unauthorized');
          setErrorMessage(e.message || 'Access denied. Clearance insufficient or session expired.');
        } else if (e.isOffline || !navigator.onLine || e.message?.toLowerCase().includes('failed to fetch')) {
          setSearchState('offline');
          setErrorMessage('Intelligence registry offline or backend unreachable.');
        } else {
          setSearchState('error');
          setErrorMessage(e.message || 'Error executing search query.');
        }
      } finally {
        if (currentSeq === seqIdRef.current) {
          setLoading(false);
        }
      }
    }, 180);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Global keydown listener for Esc
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectCase = (caseId) => {
    onClose();
    openCaseWorkspace(caseId);
  };

  const handleSelectEvidence = async (evidenceId) => {
    onClose();
    try {
      const ev = await api.getEvidenceDetail(evidenceId);
      setSelectedEvidence(ev);
    } catch (e) {
      console.warn('Failed to open evidence detail', e);
    }
  };

  const handleSelectEntity = (entity) => {
    onClose();
    updateSubject({ name: entity.title, id: entity.id, type: entity.subtitle });
    navigate('graph');
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(3, 5, 8, 0.82)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '80px', paddingLeft: '16px', paddingRight: '16px'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '640px', background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)', borderRadius: '8px',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Search Input Bar */}
        <div style={{
          padding: '14px 18px', borderBottom: '1px solid var(--border-default)',
          display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-elevated)'
        }}>
          <span style={{ color: 'var(--accent)', display: 'flex' }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search Cases, Evidence files, Suspects, Vehicles, Phones, Tags..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1, background: 'transparent', border: 'none',
              color: 'var(--text-primary)', fontSize: '0.92rem', outline: 'none', fontFamily: 'var(--font-sans)'
            }}
          />
          {loading && (
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-hover)' }}>
              Searching...
            </span>
          )}
          <span style={{
            fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
            padding: '2px 6px', background: 'var(--bg-hover)', borderRadius: '4px', border: '1px solid var(--border-subtle)'
          }}>
            ESC TO EXIT
          </span>
        </div>

        {/* Results Container */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '12px' }}>
          {!query.trim() ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.80rem' }}>
              Type a suspect name (e.g. <em>Voronin</em>), plate number (<em>8B9-CYP</em>), case ID (<em>CR-2026-0142</em>), or evidence file.
            </div>
          ) : searchState === 'offline' ? (
            <div style={{ padding: '28px', textAlign: 'center', color: 'var(--critical)', fontSize: '0.82rem' }}>
              <div style={{ marginBottom: '6px', fontWeight: 600 }}>📡 REGISTRY UNREACHABLE (OFFLINE)</div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>{errorMessage}</span>
            </div>
          ) : searchState === 'unauthorized' ? (
            <div style={{ padding: '28px', textAlign: 'center', color: '#f59e0b', fontSize: '0.82rem' }}>
              <div style={{ marginBottom: '6px', fontWeight: 600 }}>🔒 ACCESS RESTRICTED</div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>{errorMessage}</span>
            </div>
          ) : searchState === 'error' ? (
            <div style={{ padding: '28px', textAlign: 'center', color: 'var(--critical)', fontSize: '0.82rem' }}>
              <div style={{ marginBottom: '6px', fontWeight: 600 }}>⚠️ QUERY ERROR</div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>{errorMessage}</span>
            </div>
          ) : results.total_matches === 0 && !loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              No intelligence records matching <strong style={{ color: 'var(--text-primary)' }}>"{query}"</strong>.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Case Results */}
              {results.cases.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', padding: '4px 8px', letterSpacing: '0.05em' }}>
                    INVESTIGATION CASES ({results.cases.length})
                  </div>
                  {results.cases.map(c => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCase(c.id)}
                      style={{
                        padding: '10px 12px', borderRadius: '6px', cursor: 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            padding: '1px 6px', borderRadius: '3px', fontSize: '0.62rem',
                            fontFamily: 'var(--font-mono)', fontWeight: 700,
                            background: 'var(--accent-dim)', color: 'var(--accent-hover)'
                          }}>
                            CASE
                          </span>
                          <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>{c.title}</strong>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {c.id} · {c.subtitle}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-hover)', fontFamily: 'var(--font-mono)' }}>
                        Open Workspace →
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Evidence Results */}
              {results.evidence.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', padding: '4px 8px', letterSpacing: '0.05em' }}>
                    EVIDENCE ARTIFACTS ({results.evidence.length})
                  </div>
                  {results.evidence.map(ev => (
                    <div
                      key={ev.id}
                      onClick={() => handleSelectEvidence(ev.id)}
                      style={{
                        padding: '10px 12px', borderRadius: '6px', cursor: 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            padding: '1px 6px', borderRadius: '3px', fontSize: '0.62rem',
                            fontFamily: 'var(--font-mono)', fontWeight: 700,
                            background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc'
                          }}>
                            EVIDENCE
                          </span>
                          <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>{ev.title}</strong>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {ev.id} · {ev.subtitle}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-hover)', fontFamily: 'var(--font-mono)' }}>
                        Inspect →
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Entity Results */}
              {results.entities.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', padding: '4px 8px', letterSpacing: '0.05em' }}>
                    RESOLVED ENTITIES ({results.entities.length})
                  </div>
                  {results.entities.map(ent => (
                    <div
                      key={ent.id}
                      onClick={() => handleSelectEntity(ent)}
                      style={{
                        padding: '10px 12px', borderRadius: '6px', cursor: 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            padding: '1px 6px', borderRadius: '3px', fontSize: '0.62rem',
                            fontFamily: 'var(--font-mono)', fontWeight: 700,
                            background: 'var(--success-dim)', color: 'var(--success)'
                          }}>
                            ENTITY
                          </span>
                          <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>{ent.title}</strong>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {ent.subtitle}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-hover)', fontFamily: 'var(--font-mono)' }}>
                        Graph View →
                      </span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 18px', borderTop: '1px solid var(--border-default)',
          background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)'
        }}>
          <span>Press <strong>Enter</strong> to select · <strong>Esc</strong> to dismiss</span>
          <span>CRIMENET AI Global Registry</span>
        </div>
      </div>
    </div>
  );
}
