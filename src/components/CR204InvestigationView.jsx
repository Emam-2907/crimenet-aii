import React, { useState } from 'react';
import { useInvestigation } from '../context/InvestigationContext.jsx';
import { ciraService } from '../services/ciraService.js';
import InvestigationMap from './InvestigationMap.jsx';
import CameraDetailsPanel from './CameraDetailsPanel.jsx';
import {
  Shield, Camera, User, Truck, MapPin, AlertTriangle, CheckCircle,
  Clock, FileText, Send, HelpCircle, Eye, EyeOff, Check, X,
  Layers, ChevronRight, Activity, ArrowRight, Table, GitFork, MessageSquare
} from 'lucide-react';

export default function CR204InvestigationView() {
  const {
    activeCase,
    investigationData,
    selectedEntity,
    selectedEntityId,
    selectedEntityType,
    selectedPerson,
    selectedFaceMatch,
    selectedCamera,
    selectedVehicle,
    selectedLocation,
    selectedTimelineEvent,
    selectedTimelineEventId,
    activeTimestamp,
    selectEntity,
    selectTimelineEvent
  } = useInvestigation();

  // Bottom Workspace Tab: 'timeline' | 'graph' | 'cira'
  const [activeBottomTab, setActiveBottomTab] = useState('timeline');
  const [graphViewMode, setGraphViewMode] = useState('interactive'); // 'interactive' | 'accessible_tree'

  // CIRA Chat State
  const [ciraQuery, setCiraQuery] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      text: `### CR-204 GEOGRAPHIC CAMERA NETWORK BRIEFING
**Active Case**: ${activeCase.title}
**Status**: ${activeCase.status} · Synthetic Prototype Data Only.
The map represents the primary CCTV workspace for Sector 4 South Pier. Selecting any camera (CCTV-01 to CCTV-12) displays its coverage, recent detections, and related entities across Graph, Timeline, and CIRA.

Ask a question or select a prompt below to investigate.`,
      timestamp: '14:09 UTC'
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);

  const handleAskCira = (questionText) => {
    const text = (questionText || ciraQuery).trim();
    if (!text) return;

    const userMsg = { role: 'user', text, timestamp: new Date().toLocaleTimeString().slice(0, 5) + ' UTC' };
    setChatMessages(prev => [...prev, userMsg]);
    setCiraQuery('');
    setIsThinking(true);

    setTimeout(() => {
      const response = ciraService(
        investigationData,
        { selectedEntity, selectedTimelineEvent, activeTimestamp },
        text
      );

      // Auto-select linked entities in context to synchronize other views
      if (response.linked_entities && response.linked_entities.length > 0) {
        selectEntity(response.linked_entities[0]);
      }

      const aiMsg = {
        role: 'assistant',
        text: response.answer_markdown,
        timestamp: new Date().toLocaleTimeString().slice(0, 5) + ' UTC'
      };

      setChatMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
    }, 300);
  };

  const samplePrompts = [
    "What happened around CCTV-04?",
    "Show me the cameras connected to this vehicle.",
    "Where was V-102 detected?",
    "Where did V-102 move?",
    "Why is P-017 connected to this case?",
    "Show cameras connected to this person",
    "What happened between 14:00 and 14:20?",
    "What information is missing?",
    "Are there conflicting records?",
    "Explain this graph relationship",
    "What does the 87% face score mean?"
  ];

  return (
    <main className="cr204-investigation-view min-h-screen" role="main" aria-label="CR-204 Geographic CCTV Investigation Matrix" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      padding: '16px 20px',
      backgroundColor: 'var(--bg-main)',
      color: 'var(--text-primary)'
    }}>

      {/* ── Top Investigation Header ────────────────────────────────────── */}
      <header role="banner" style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '8px',
        padding: '14px 18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.80rem',
              fontWeight: 700,
              color: 'var(--accent)',
              backgroundColor: 'var(--accent-dim)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid var(--accent-border)'
            }}>
              CASE #{activeCase.case_id}
            </span>
            <span style={{
              fontSize: '0.70rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#F87171',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              SYNTHETIC DATA ONLY
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              CLASSIFICATION: {activeCase.classification}
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.20rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {activeCase.title}
          </h2>
        </div>

        {/* Global Synchronization Context Pill */}
        <nav aria-label="Investigation Synchronization Status" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'var(--bg-elevated)',
          padding: '6px 14px',
          borderRadius: '6px',
          border: '1px solid var(--border-default)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.74rem'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>ACTIVE: </span>
            <strong style={{ color: 'var(--accent)' }}>{selectedEntityId}</strong> ({selectedEntityType})
          </div>
          <div style={{ height: '14px', width: '1px', backgroundColor: 'var(--border-default)' }} />
          <div>
            <span style={{ color: 'var(--text-muted)' }}>TIMELINE: </span>
            <strong style={{ color: '#FBBF24' }}>{activeTimestamp} UTC</strong>
          </div>
          <div style={{ height: '14px', width: '1px', backgroundColor: 'var(--border-default)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
            <span>ALL MODULES SYNCED</span>
          </div>
        </nav>
      </header>

      {/* ── Primary Investigation Workspace: Map + Camera Details ──────── */}
      <section aria-label="Geographic CCTV Network and Camera Dossier" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 380px',
        gap: '14px',
        minHeight: '520px',
        alignItems: 'stretch'
      }}>
        {/* Dominant Real Geographic Map */}
        <div style={{ minHeight: '520px', height: '100%' }}>
          <InvestigationMap />
        </div>

        {/* Dynamic Camera Details Panel */}
        <div style={{ height: '100%', minHeight: '520px' }}>
          <CameraDetailsPanel />
        </div>
      </section>

      {/* ── Secondary Synchronized Section: Timeline, Graph, CIRA ─────── */}
      <section aria-label="Synchronized Investigation Telemetry and Relational Modules" style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>

        {/* Tab Navigation Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-default)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveBottomTab('timeline')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: activeBottomTab === 'timeline' ? '1px solid var(--accent)' : '1px solid transparent',
                backgroundColor: activeBottomTab === 'timeline' ? 'var(--accent-dim)' : 'transparent',
                color: activeBottomTab === 'timeline' ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <Clock size={14} />
              <span>Investigation Timeline</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveBottomTab('graph')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: activeBottomTab === 'graph' ? '1px solid var(--accent)' : '1px solid transparent',
                backgroundColor: activeBottomTab === 'graph' ? 'var(--accent-dim)' : 'transparent',
                color: activeBottomTab === 'graph' ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <GitFork size={14} />
              <span>Relational Knowledge Graph</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveBottomTab('cira')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: activeBottomTab === 'cira' ? '1px solid var(--accent)' : '1px solid transparent',
                backgroundColor: activeBottomTab === 'cira' ? 'var(--accent-dim)' : 'transparent',
                color: activeBottomTab === 'cira' ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <Shield size={14} />
              <span>CIRA Copilot Reasoning</span>
            </button>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            ONE INVESTIGATION → ONE SHARED DATA MODEL
          </div>
        </div>

        {/* Tab 1: Chronological Investigation Timeline */}
        {activeBottomTab === 'timeline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Click any event below to synchronize the map view, camera selection, and graph nodes:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '10px' }}>
              {investigationData.timeline.map(evt => {
                const isSelected = selectedTimelineEventId === evt.id;
                return (
                  <button
                    key={evt.id}
                    type="button"
                    onClick={() => selectTimelineEvent(evt.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      padding: '12px 14px',
                      backgroundColor: isSelected ? 'var(--accent-dim)' : 'var(--bg-main)',
                      border: isSelected ? '1.5px solid var(--accent)' : '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 0 12px rgba(56, 189, 248, 0.25)' : 'none'
                    }}
                    aria-pressed={isSelected}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: isSelected ? 'var(--accent)' : '#FBBF24',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {evt.time} UTC
                      </span>

                      <span style={{
                        fontSize: '0.62rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        backgroundColor: evt.claim_type === 'OBSERVATION' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                        color: evt.claim_type === 'OBSERVATION' ? 'var(--success)' : 'var(--accent)'
                      }}>
                        [{evt.claim_type}]
                      </span>
                    </div>

                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {evt.title}
                    </div>

                    <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                      {evt.summary}
                    </p>

                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      {evt.entity_ids?.map(eid => (
                        <span key={eid} style={{
                          fontSize: '0.62rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-muted)',
                          background: 'var(--bg-elevated)',
                          padding: '1px 5px',
                          borderRadius: '3px'
                        }}>
                          {eid}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Relational Knowledge Graph */}
        {activeBottomTab === 'graph' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Investigation Chain: CR-204 → P-017 → FM-042 → CCTV-04 → L-08 → V-102 → CCTV-07 → CCTV-11 → INC-204
              </span>

              <button
                type="button"
                onClick={() => setGraphViewMode(graphViewMode === 'interactive' ? 'accessible_tree' : 'interactive')}
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-secondary)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.68rem',
                  cursor: 'pointer'
                }}
              >
                {graphViewMode === 'interactive' ? 'Accessible Tree View' : 'Visual Graph'}
              </button>
            </div>

            {graphViewMode === 'interactive' ? (
              <div style={{
                minHeight: '260px',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '14px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {Object.values(investigationData.entities).map(entity => {
                  const isSelected = selectedEntityId === entity.id;
                  return (
                    <button
                      key={entity.id}
                      type="button"
                      onClick={() => selectEntity(entity.id, entity.type)}
                      style={{
                        backgroundColor: isSelected ? 'var(--accent)' : 'var(--bg-surface)',
                        color: isSelected ? '#fff' : 'var(--text-primary)',
                        border: isSelected ? '2px solid var(--accent-hover)' : '1px solid var(--border-default)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        boxShadow: isSelected ? '0 0 10px rgba(56, 189, 248, 0.4)' : 'none',
                        transition: 'all 0.15s ease',
                        minWidth: '130px'
                      }}
                      aria-pressed={isSelected}
                    >
                      <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', opacity: 0.8 }}>
                        {entity.type.toUpperCase()}
                      </div>
                      <div style={{ fontSize: '0.80rem', fontWeight: 600 }}>
                        {entity.id}
                      </div>
                      <div style={{ fontSize: '0.70rem', opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                        {entity.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                      <th style={{ textAlign: 'left', padding: '6px 8px' }}>Entity ID</th>
                      <th style={{ textAlign: 'left', padding: '6px 8px' }}>Type</th>
                      <th style={{ textAlign: 'left', padding: '6px 8px' }}>Name</th>
                      <th style={{ textAlign: 'left', padding: '6px 8px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(investigationData.entities).map(entity => (
                      <tr
                        key={entity.id}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          backgroundColor: selectedEntityId === entity.id ? 'var(--accent-dim)' : 'transparent'
                        }}
                      >
                        <td style={{ padding: '6px 8px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{entity.id}</td>
                        <td style={{ padding: '6px 8px' }}>{entity.type}</td>
                        <td style={{ padding: '6px 8px' }}>{entity.name}</td>
                        <td style={{ padding: '6px 8px' }}>
                          <button
                            type="button"
                            onClick={() => selectEntity(entity.id, entity.type)}
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: 'var(--bg-elevated)',
                              border: '1px solid var(--border-default)',
                              color: 'var(--accent)',
                              cursor: 'pointer'
                            }}
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: CIRA AI Copilot Reasoning */}
        {activeBottomTab === 'cira' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAskCira(p)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.68rem',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '4px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            <div style={{
              maxHeight: '280px',
              overflowY: 'auto',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '92%',
                    backgroundColor: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-surface)',
                    color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    lineHeight: 1.45,
                    border: msg.role === 'user' ? 'none' : '1px solid var(--border-default)'
                  }}
                >
                  <div style={{ fontSize: '0.62rem', opacity: 0.7, marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
                    {msg.role === 'user' ? 'INVESTIGATOR' : 'CIRA INTEL CORE'} · {msg.timestamp}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isThinking && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  CIRA is querying CR-204 telemetry and camera network...
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); handleAskCira(); }}
              style={{ display: 'flex', gap: '8px' }}
            >
              <input
                type="text"
                value={ciraQuery}
                onChange={(e) => setCiraQuery(e.target.value)}
                placeholder="Ask CIRA: 'Show me the cameras connected to this vehicle' or 'What happened around CCTV-04?'..."
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.80rem'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '9px 16px',
                  backgroundColor: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                  fontSize: '0.80rem'
                }}
              >
                <span>Ask</span>
                <Send size={14} />
              </button>
            </form>
          </div>
        )}

      </section>

    </main>
  );
}
