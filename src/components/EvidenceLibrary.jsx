import React, { useState, useEffect, useMemo } from 'react';
import { useCIRA } from '../context/CIRAContext.jsx';
import { api } from '../services/api.js';
import EvidenceDetailModal from './EvidenceDetailModal.jsx';

const CATEGORIES = [
  'ALL',
  'Documents',
  'Images',
  'Videos',
  'Call Records',
  'Financial Records',
  'Location Data'
];

const TYPE_COLORS = {
  Documents:         { color: 'var(--blue-light)',   bg: 'var(--blue-dim)',  border: 'var(--blue-border)' },
  Images:            { color: '#f0abfc',             bg: 'rgba(240,171,252,0.1)', border: 'rgba(240,171,252,0.25)' },
  Videos:            { color: '#a78bfa',             bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)' },
  'Call Records':     { color: 'var(--amber-light)',  bg: 'var(--amber-dim)', border: 'rgba(217,119,6,0.3)' },
  'Financial Records':{ color: 'var(--green-light)',  bg: 'var(--green-dim)', border: 'rgba(0,200,122,0.3)' },
  'Location Data':   { color: '#38bdf8',             bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.25)' }
};

export default function EvidenceLibrary() {
  const { cases, activeCase, openCaseWorkspace, selectedEvidence, setSelectedEvidence, duplicateEvidence } = useCIRA();

  const [evidenceList, setEvidenceList] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState(activeCase?.id || 'CR-204');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch evidence from backend
  const loadEvidence = async () => {
    setLoading(true);
    try {
      const data = await api.getEvidence();
      setEvidenceList(data);
    } catch (e) {
      console.warn('Failed to fetch evidence list', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvidence();
  }, []);

  // Filtered evidence items
  const filteredEvidence = useMemo(() => {
    return evidenceList.filter(item => {
      const normSelected = selectedCaseId.toLowerCase().replace('case #', '').trim();
      const normItem = (item.case_id || '').toLowerCase().replace('case #', '').trim();
      const matchesCase = selectedCaseId === 'ALL' || normSelected === normItem || normItem.includes(normSelected);
      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory || item.type === selectedCategory;
      const matchesSearch = !search.trim() || (
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.source?.toLowerCase().includes(search.toLowerCase()) ||
        item.case_id?.toLowerCase().includes(search.toLowerCase())
      );
      return matchesCase && matchesCategory && matchesSearch;
    });
  }, [evidenceList, selectedCaseId, selectedCategory, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
              Evidence Intelligence Repository
            </h2>
            <span className="badge badge-info" style={{ fontSize: '0.64rem', fontFamily: 'var(--f-mono)' }}>
              {filteredEvidence.length} OF {evidenceList.length} ARTIFACTS
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--t-muted)', marginTop: '2px' }}>
            Central repository of ingested telecommunications, surveillance visuals, forensic documents, and financial records.
          </p>
        </div>

        <button
          onClick={loadEvidence}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px', background: 'var(--ink-2)',
            border: '1px solid var(--b-soft)', borderRadius: '6px',
            color: 'var(--t-secondary)', fontSize: '0.78rem', cursor: 'pointer'
          }}
        >
          ↻ Refresh Repository
        </button>
      </div>

      {/* Filters Bar */}
      <div style={{
        padding: '12px 16px', background: 'var(--ink-1)', border: '1px solid var(--b-faint)',
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
            placeholder="Search by Evidence ID, Filename, Source..."
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

        {/* Case Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={selectedCaseId}
            onChange={e => setSelectedCaseId(e.target.value)}
            style={{
              padding: '6px 10px', background: 'var(--ink-2)', border: '1px solid var(--b-soft)',
              borderRadius: '6px', color: 'var(--t-secondary)', fontSize: '0.76rem', outline: 'none'
            }}
          >
            <option value="ALL">All Associated Cases</option>
            {cases.map(c => (
              <option key={c.id} value={c.id}>
                {c.id} — {c.title.slice(0, 30)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        {CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 12px', borderRadius: '6px', fontSize: '0.74rem',
                border: `1px solid ${isSelected ? 'var(--green-light)' : 'var(--b-faint)'}`,
                background: isSelected ? 'var(--green-dim)' : 'var(--ink-1)',
                color: isSelected ? 'var(--green-light)' : 'var(--t-secondary)',
                fontWeight: isSelected ? 600 : 500, cursor: 'pointer',
                transition: 'var(--ease)', whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Evidence Table */}
      {filteredEvidence.length === 0 ? (
        <div style={{
          padding: '60px 24px', background: 'var(--ink-1)', border: '1px dashed var(--b-soft)',
          borderRadius: '10px', textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>No Evidence Items Found</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--t-muted)', marginTop: '4px' }}>
            No evidence artifacts match the selected filters or search terms.
          </p>
        </div>
      ) : (
        <div style={{
          background: 'var(--ink-1)', border: '1px solid var(--b-faint)',
          borderRadius: '10px', overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--b-faint)', background: 'var(--ink-2)' }}>
                {['Evidence ID', 'Artifact Filename', 'Category', 'Case Docket', 'Upload Date', 'Source Agency', 'Processing', 'Entities', 'Details'].map(h => (
                  <th key={h} style={{
                    padding: '11px 16px', fontSize: '0.68rem', fontFamily: 'var(--f-mono)',
                    color: 'var(--t-dim)', letterSpacing: '0.06em', textTransform: 'uppercase',
                    textAlign: h === 'Entities' ? 'center' : 'left'
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEvidence.map((ev, idx) => {
                const tc = TYPE_COLORS[ev.type] || TYPE_COLORS.Documents;
                return (
                  <tr
                    key={ev.id}
                    onClick={() => setSelectedEvidence(ev)}
                    style={{
                      borderBottom: idx < filteredEvidence.length - 1 ? '1px solid var(--b-faint)' : 'none',
                      cursor: 'pointer', transition: 'var(--ease)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Evidence ID */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontFamily: 'var(--f-mono)', fontSize: '0.76rem',
                        fontWeight: 700, color: 'var(--blue-light)'
                      }}>
                        {ev.id}
                      </span>
                    </td>

                    {/* Filename */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#fff' }}>
                        {ev.name}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--t-muted)', fontFamily: 'var(--f-mono)' }}>
                        {ev.file_size}
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '0.66rem',
                        fontFamily: 'var(--f-mono)', fontWeight: 600,
                        background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`
                      }}>
                        {ev.type}
                      </span>
                    </td>

                    {/* Case Docket */}
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          openCaseWorkspace(ev.case_id);
                        }}
                        style={{
                          fontSize: '0.76rem', fontFamily: 'var(--f-mono)',
                          color: 'var(--green-light)', cursor: 'pointer', textDecoration: 'underline'
                        }}
                      >
                        {ev.case_id}
                      </span>
                    </td>

                    {/* Upload Date */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '0.76rem', color: 'var(--t-muted)' }}>
                        {ev.upload_date}
                      </span>
                    </td>

                    {/* Source */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--t-secondary)' }}>
                        {ev.source || 'Investigator Console'}
                      </span>
                    </td>

                    {/* Processing State */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '2px 7px', borderRadius: '4px', fontSize: '0.64rem',
                        fontFamily: 'var(--f-mono)', fontWeight: 700,
                        background: 'rgba(0, 200, 122, 0.12)', color: 'var(--green-light)',
                        border: '1px solid rgba(0, 200, 122, 0.3)'
                      }}>
                        {ev.processing_state || 'ANALYZED'}
                      </span>
                    </td>

                    {/* Entities */}
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        fontFamily: 'var(--f-mono)', fontSize: '0.8rem',
                        fontWeight: 700, color: 'var(--blue-light)'
                      }}>
                        {ev.extracted_entities_count || ev.entities?.length || 0}
                      </span>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await duplicateEvidence(ev);
                            loadEvidence();
                          }}
                          style={{
                            padding: '4px 10px', background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-default)', borderRadius: '4px',
                            color: 'var(--accent-hover)', fontSize: '0.72rem', cursor: 'pointer'
                          }}
                          title="Create an authentic forensic duplicate under FRE 1001(e) / Rule 1003"
                        >
                          📋 Duplicate
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvidence(ev);
                          }}
                          style={{
                            padding: '4px 10px', background: 'rgba(255,255,255,0.06)',
                            border: '1px solid var(--b-soft)', borderRadius: '4px',
                            color: '#fff', fontSize: '0.72rem', cursor: 'pointer'
                          }}
                        >
                          Inspect →
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Selected Evidence Detail Modal */}
      {selectedEvidence && (
        <EvidenceDetailModal
          evidence={selectedEvidence}
          onClose={() => setSelectedEvidence(null)}
        />
      )}

    </div>
  );
}
