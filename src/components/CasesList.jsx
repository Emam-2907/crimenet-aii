import React, { useState, useMemo } from 'react';
import { useCIRA } from '../context/CIRAContext.jsx';

const STATUS_CONFIG = {
  Active:         { bg: 'var(--success-dim)', color: 'var(--success)', border: 'var(--success-border)' },
  Critical:       { bg: 'var(--coral-dim)',  color: 'var(--coral)', border: 'var(--coral-border)' },
  'Under Review': { bg: 'var(--warning-dim)', color: 'var(--warning)', border: 'var(--warning-border)' },
  Closed:         { bg: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: 'var(--border-default)' }
};

const PRIORITY_CONFIG = {
  Critical: { color: 'var(--coral)', border: 'var(--coral-border)' },
  High:     { color: 'var(--warning)', border: 'var(--warning-border)' },
  Medium:   { color: 'var(--accent-hover)', border: 'var(--accent-border)' },
  Low:      { color: 'var(--text-muted)', border: 'var(--border-default)' }
};

export default function CasesList() {
  const { cases, openCaseWorkspace, setIsCreateCaseOpen, navigate, duplicateCase } = useCIRA();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Extract unique types for filter
  const caseTypes = useMemo(() => {
    const s = new Set(cases.map(c => c.case_type).filter(Boolean));
    return Array.from(s);
  }, [cases]);

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesSearch = !search.trim() || (
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.investigator?.toLowerCase().includes(search.toLowerCase()) ||
        (c.tags && c.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
      );
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;
      const matchesType = typeFilter === 'ALL' || c.case_type === typeFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesType;
    });
  }, [cases, search, statusFilter, priorityFilter, typeFilter]);

  // Operational metrics
  const totalCases = cases.length;
  const activeCount = cases.filter(c => c.status === 'Active' || c.status === 'Critical').length;
  const criticalCount = cases.filter(c => c.priority === 'Critical').length;
  const totalEvidence = cases.reduce((acc, c) => acc + (c.evidence_count || 0), 0);
  const totalEntities = cases.reduce((acc, c) => acc + (c.entity_count || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Investigation Case Management
            </h2>
            <span className="badge badge-rouge" style={{ fontSize: '0.66rem' }}>
              {filteredCases.length} OF {totalCases} DOCKETS
            </span>
          </div>
          <p style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Authenticated registry connecting cases, chain of custody evidence, and extracted network entities.
          </p>
        </div>

        <button
          onClick={() => setIsCreateCaseOpen(true)}
          className="btn-primary"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          + Create Case
        </button>
      </div>

      {/* Metrics Bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px'
      }}>
        <div style={{ padding: '14px 18px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.70rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>ACTIVE DOCKETS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginTop: '4px' }}>
            {activeCount} <span style={{ fontSize: '0.74rem', color: 'var(--success)', fontWeight: 500 }}>/ {totalCases} Total</span>
          </div>
        </div>
        <div style={{ padding: '14px 18px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.70rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>CRITICAL PRIORITY</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--coral)', fontFamily: 'var(--font-display)', marginTop: '4px' }}>
            {criticalCount} <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 500 }}>High Urgency</span>
          </div>
        </div>
        <div style={{ padding: '14px 18px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.70rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>INGESTED EVIDENCE</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-hover)', fontFamily: 'var(--font-display)', marginTop: '4px' }}>
            {totalEvidence} <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 500 }}>Files Tracked</span>
          </div>
        </div>
        <div style={{ padding: '14px 18px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.70rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>IDENTIFIED ENTITIES</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginTop: '4px' }}>
            {totalEntities} <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 500 }}>Nodes Resolved</span>
          </div>
        </div>
      </div>

      {/* Control Filters Bar */}
      <div style={{
        padding: '12px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px'
      }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px', maxWidth: '380px' }}>
          <span style={{ color: 'var(--t-dim)', display: 'flex' }}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by Case ID, Title, Lead Agent, Tags..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', background: 'transparent', border: 'none',
              color: '#fff', fontSize: '0.82rem', outline: 'none'
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', color: 'var(--t-dim)', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Status */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              padding: '6px 10px', background: 'var(--ink-2)', border: '1px solid var(--b-soft)',
              borderRadius: '6px', color: 'var(--t-secondary)', fontSize: '0.76rem', outline: 'none'
            }}
          >
            <option value="ALL">Status: All</option>
            <option value="Active">Active</option>
            <option value="Critical">Critical</option>
            <option value="Under Review">Under Review</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            style={{
              padding: '6px 10px', background: 'var(--ink-2)', border: '1px solid var(--b-soft)',
              borderRadius: '6px', color: 'var(--t-secondary)', fontSize: '0.76rem', outline: 'none'
            }}
          >
            <option value="ALL">Priority: All</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Type */}
          {caseTypes.length > 0 && (
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              style={{
                padding: '6px 10px', background: 'var(--ink-2)', border: '1px solid var(--b-soft)',
                borderRadius: '6px', color: 'var(--t-secondary)', fontSize: '0.76rem', outline: 'none'
              }}
            >
              <option value="ALL">Type: All</option>
              {caseTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          )}

          {/* View toggle */}
          <div style={{ display: 'flex', border: '1px solid var(--b-soft)', borderRadius: '6px', overflow: 'hidden' }}>
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              style={{
                padding: '6px 10px', border: 'none', cursor: 'pointer',
                background: viewMode === 'table' ? 'rgba(255,255,255,0.08)' : 'var(--ink-2)',
                color: viewMode === 'table' ? '#fff' : 'var(--t-dim)', display: 'flex'
              }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              title="Card Grid"
              style={{
                padding: '6px 10px', border: 'none', cursor: 'pointer',
                background: viewMode === 'cards' ? 'rgba(255,255,255,0.08)' : 'var(--ink-2)',
                color: viewMode === 'cards' ? '#fff' : 'var(--t-dim)', display: 'flex'
              }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Cases Content */}
      {filteredCases.length === 0 ? (
        /* Empty state */
        <div style={{
          padding: '60px 24px', background: 'var(--bg-surface)', border: '1px dashed var(--border-default)',
          borderRadius: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '14px'
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%', background: 'var(--bg-elevated)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'
          }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>No Cases Found</h3>
            <p style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '4px auto 0' }}>
              {search || statusFilter !== 'ALL'
                ? 'No investigation dockets match the selected filter criteria. Try clearing search filters.'
                : 'Create your first investigation case to begin connecting evidence and entities.'}
            </p>
          </div>
          <button
            onClick={() => {
              if (search || statusFilter !== 'ALL') {
                setSearch('');
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
              } else {
                setIsCreateCaseOpen(true);
              }
            }}
            className="btn-secondary"
          >
            {search || statusFilter !== 'ALL' ? 'Clear Filters' : '+ Create Case'}
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
          borderRadius: '8px', overflow: 'hidden'
        }}>
          <table className="data-table">
            <thead>
              <tr>
                {['Case ID', 'Case Title & Docket', 'Type', 'Status', 'Priority', 'Assigned Lead', 'Evidence', 'Entities', 'Action'].map((h) => (
                  <th key={h} style={{
                    textAlign: ['Evidence', 'Entities', 'Action'].includes(h) ? 'center' : 'left'
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c) => {
                const sc = STATUS_CONFIG[c.status] || STATUS_CONFIG.Closed;
                const pc = PRIORITY_CONFIG[c.priority] || PRIORITY_CONFIG.Medium;

                return (
                  <tr
                    key={c.id}
                    onClick={() => openCaseWorkspace(c)}
                    style={{ cursor: 'pointer', transition: 'var(--transition-fast)' }}
                  >
                    {/* Case ID */}
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.74rem',
                        fontWeight: 600, color: 'var(--accent)', display: 'block'
                      }}>
                        {c.id}
                      </span>
                      <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {c.reference_no}
                      </span>
                    </td>

                    {/* Case Title & Primary Criminal */}
                    <td style={{ maxWidth: '320px' }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                        {c.title}
                      </div>
                      {c.primary_suspect && (
                        <div style={{ fontSize: '0.70rem', color: '#F87171', fontFamily: 'var(--font-mono)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: '#F87171', fontWeight: 700 }}>🎯 TARGET:</span>
                          <span style={{ color: '#fca5a5', fontWeight: 600 }}>{c.primary_suspect}</span>
                        </div>
                      )}
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Updated: {c.last_updated}
                      </div>
                    </td>

                    {/* Type */}
                    <td>
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '0.68rem',
                        background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-mono)', border: '1px solid var(--border-default)'
                      }}>
                        {c.case_type}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '0.66rem',
                        fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '0.04em',
                        background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`
                      }}>
                        {c.status}
                      </span>
                    </td>

                    {/* Priority */}
                    <td>
                      <span style={{
                        fontSize: '0.74rem', fontWeight: 600, color: pc.color,
                        fontFamily: 'var(--font-mono)'
                      }}>
                        ● {c.priority}
                      </span>
                    </td>

                    {/* Investigator */}
                    <td>
                      <span style={{ fontSize: '0.80rem', color: 'var(--text-secondary)' }}>
                        {c.investigator}
                      </span>
                    </td>

                    {/* Evidence count */}
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.80rem',
                        fontWeight: 600, color: 'var(--accent)'
                      }}>
                        {c.evidence_count || 0}
                      </span>
                    </td>

                    {/* Entity count */}
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.80rem',
                        fontWeight: 600, color: 'var(--accent-hover)'
                      }}>
                        {c.entity_count || 0}
                      </span>
                    </td>

                    {/* Action */}
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        {c.id === 'CR-204' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('cr204');
                            }}
                            className="btn-primary"
                            style={{ padding: '3px 8px', fontSize: '0.68rem' }}
                            title="Open CR-204 CCTV Surveillance Map"
                          >
                            🗺️ CCTV Map
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateCase(c.id);
                          }}
                          className="btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '0.68rem', borderColor: 'var(--border-default)' }}
                          title="Duplicate Case Docket (Rule 1003 Working Copy)"
                        >
                          📋 Duplicate
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openCaseWorkspace(c);
                          }}
                          className="btn-secondary"
                          style={{ padding: '3px 10px', fontSize: '0.70rem' }}
                        >
                          Workspace →
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Card Grid View */
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px'
        }}>
          {filteredCases.map(c => {
            const sc = STATUS_CONFIG[c.status] || STATUS_CONFIG.Closed;
            const pc = PRIORITY_CONFIG[c.priority] || PRIORITY_CONFIG.Medium;

            return (
              <div
                key={c.id}
                onClick={() => openCaseWorkspace(c)}
                style={{
                  background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                  borderRadius: '8px', padding: '16px 18px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: '12px',
                  transition: 'var(--transition-fast)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--border-strong)';
                  e.currentTarget.style.background = 'var(--bg-elevated)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                  e.currentTarget.style.background = 'var(--bg-surface)';
                }}
              >
                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.76rem',
                      fontWeight: 600, color: 'var(--accent)'
                    }}>
                      {c.id}
                    </span>
                    <span style={{ fontSize: '0.66rem', color: 'var(--t-dim)', display: 'block', fontFamily: 'var(--f-mono)' }}>
                      Ref: {c.reference_no}
                    </span>
                  </div>
                  <span style={{
                    padding: '2px 8px', borderRadius: '4px', fontSize: '0.64rem',
                    fontFamily: 'var(--f-mono)', fontWeight: 700,
                    background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`
                  }}>
                    {c.status}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: '4px' }}>
                    {c.title}
                  </h4>
                  {c.primary_suspect && (
                    <div style={{ fontSize: '0.72rem', color: '#9B3D45', fontFamily: 'var(--font-mono)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: '#9B3D45', fontWeight: 700 }}>🎯 TARGET:</span>
                      <span style={{ color: '#C04A52', fontWeight: 600 }}>{c.primary_suspect}</span>
                    </div>
                  )}
                  <p style={{
                    fontSize: '0.78rem', color: 'var(--t-muted)', lineHeight: 1.45,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {c.description || 'No detailed scope summary logged yet.'}
                  </p>
                </div>

                {/* Meta stats */}
                <div style={{
                  padding: '10px 12px', background: 'var(--ink-2)', borderRadius: '6px',
                  border: '1px solid var(--b-faint)', display: 'flex', justifyContent: 'space-around',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.64rem', fontFamily: 'var(--f-mono)', color: 'var(--t-dim)' }}>EVIDENCE</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--f-mono)' }}>
                      {c.evidence_count || 0}
                    </div>
                  </div>
                  <div style={{ width: '1px', background: 'var(--b-faint)' }} />
                  <div>
                    <div style={{ fontSize: '0.64rem', fontFamily: 'var(--f-mono)', color: 'var(--t-dim)' }}>ENTITIES</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-hover)', fontFamily: 'var(--f-mono)' }}>
                      {c.entity_count || 0}
                    </div>
                  </div>
                  <div style={{ width: '1px', background: 'var(--b-faint)' }} />
                  <div>
                    <div style={{ fontSize: '0.64rem', fontFamily: 'var(--f-mono)', color: 'var(--t-dim)' }}>PRIORITY</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: pc.color, marginTop: '2px' }}>
                      {c.priority}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontSize: '0.74rem', color: 'var(--t-muted)', paddingTop: '6px', borderTop: '1px solid var(--b-faint)'
                }}>
                  <span>Lead: <strong style={{ color: 'var(--t-secondary)' }}>{c.investigator?.split(' ').slice(-1)[0]}</strong></span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {c.id === 'CR-204' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('cr204');
                        }}
                        style={{
                          padding: '2px 8px', borderRadius: '4px', background: 'var(--accent-dim)',
                          color: 'var(--accent-hover)', border: '1px solid var(--accent-border)', fontSize: '0.68rem',
                          fontFamily: 'var(--font-mono)', fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        🗺️ CCTV Map
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateCase(c.id);
                      }}
                      style={{
                        padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-elevated)',
                        color: 'var(--text-secondary)', border: '1px solid var(--border-default)', fontSize: '0.68rem',
                        cursor: 'pointer'
                      }}
                      title="Duplicate Case Docket"
                    >
                      📋 Duplicate
                    </button>
                    <span style={{ color: 'var(--accent-hover)', fontWeight: 600, fontSize: '0.72rem' }}>
                      Workspace →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
