import React, { useState, useEffect } from 'react';
import { useInvestigation } from '../context/InvestigationContext.jsx';
import { ciraService } from '../services/ciraService.js';
import {
  Shield, Camera, User, Truck, MapPin, AlertTriangle, CheckCircle,
  Clock, FileText, Send, HelpCircle, Eye, EyeOff, Check, X,
  Layers, ChevronRight, Activity, ArrowRight, Table, GitFork
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

  // View mode toggles for accessibility (graph tree, map table)
  const [graphViewMode, setGraphViewMode] = useState('interactive'); // 'interactive' | 'accessible_tree'
  const [mapViewMode, setMapViewMode] = useState('visual'); // 'visual' | 'accessible_table'

  // CIRA Chat State
  const [ciraQuery, setCiraQuery] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      text: `### CR-204 INVESTIGATION BRIEFING
**Active Case**: ${activeCase.title}
**Status**: ${activeCase.status} · Synthetic Prototype Data Only.
All modules (Graph, Map, CCTV, Timeline, Evidence, and CIRA) are synchronized. Selecting any entity or timeline event updates all views.

Ask a question or select a prompt below to investigate.`,
      timestamp: '14:09 UTC'
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);

  // Human review verification state for FM-042
  const [faceVerificationStatus, setFaceVerificationStatus] = useState(
    selectedFaceMatch?.human_review_status || 'PENDING_VERIFICATION'
  );
  const [verificationNotice, setVerificationNotice] = useState('');

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

  const handleVerifyFace = () => {
    setFaceVerificationStatus('VERIFIED_BY_INVESTIGATOR');
    setVerificationNotice('FM-042 verified by Special Agent Marcus Vance. Audit record appended.');
  };

  const handleRejectFace = () => {
    setFaceVerificationStatus('REJECTED_DISPROVED');
    setVerificationNotice('FM-042 rejected. Visual inspection disproved match. Audit record appended.');
  };

  const samplePrompts = [
    "What happened around CCTV-04?",
    "Where was V-102 detected?",
    "Where did V-102 move?",
    "Why is P-017 connected to this case?",
    "Show cameras connected to this person",
    "What happened between 14:00 and 14:20?",
    "What evidence supports this lead?",
    "What information is missing?",
    "Are there conflicting records?",
    "Explain this graph relationship",
    "What does the 87% face score mean?"
  ];

  return (
    <main className="cr204-investigation-view min-h-screen" role="main" aria-label="CR-204 Investigation Matrix" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 20px', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>

      {/* Top Investigation Banner with Case Context & Synchronization Indicator */}
      <header role="banner" style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '8px',
        padding: '16px 20px',
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
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'var(--accent)',
              backgroundColor: 'var(--accent-dim)',
              padding: '3px 8px',
              borderRadius: '4px',
              border: '1px solid var(--accent-border)'
            }}>
              CASE #{activeCase.case_id}
            </span>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#F87171',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              SYNTHETIC DATA ONLY
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              CLASSIFICATION: {activeCase.classification}
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {activeCase.title}
          </h2>
        </div>

        {/* Global Synchronization Context Pill */}
        <nav aria-label="Investigation Synchronization Status" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          backgroundColor: 'var(--bg-elevated)',
          padding: '8px 14px',
          borderRadius: '6px',
          border: '1px solid var(--border-default)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>ACTIVE SELECTION: </span>
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
            <span>MODULES SYNCED</span>
          </div>
        </nav>
      </header>

      {/* Main Multi-Pane Layout: Responsive 2 Columns -> 1 Column */}
      <div className="cr204-grid-layout">

        {/* LEFT COLUMN: Graph, Map & CCTV, Timeline */}
        <section aria-label="Investigation Media and Relational Graphs" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Pane 1: Synchronized Knowledge Graph */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
            padding: '16px',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GitFork size={16} color="var(--accent)" />
                <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600 }}>
                  CR-204 RELATIONAL KNOWLEDGE GRAPH
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setGraphViewMode(graphViewMode === 'interactive' ? 'accessible_tree' : 'interactive')}
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-secondary)',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  aria-label="Toggle Accessible Tree View"
                >
                  <Table size={12} />
                  <span>{graphViewMode === 'interactive' ? 'Accessible Tree View' : 'Interactive Graph'}</span>
                </button>
              </div>
            </div>

            {graphViewMode === 'interactive' ? (
              /* Interactive Visual Nodes Container */
              <div style={{
                position: 'relative',
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
                      <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', opacity: 0.8 }}>
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
              /* Accessible Table / Tree Alternative */
              <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
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

          {/* Pane 2: Tactical Map (Observed vs Inferred) & CCTV DEMO FEED */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            {/* Tactical Map Corridor */}
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} color="#38bdf8" />
                  <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 600 }}>
                    V-102 MOVEMENT CORRIDOR
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setMapViewMode(mapViewMode === 'visual' ? 'accessible_table' : 'visual')}
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-secondary)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.68rem',
                    cursor: 'pointer'
                  }}
                  aria-label="Toggle Map Data Table"
                >
                  {mapViewMode === 'visual' ? 'Data Table' : 'Map View'}
                </button>
              </div>

              {mapViewMode === 'visual' ? (
                <div style={{
                  height: '180px',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '12px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  {/* Waypoint Flow */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                    {investigationData.map_corridors.observed_waypoints.map((wp, idx) => (
                      <div key={wp.id} style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => selectEntity(wp.entity_id, 'camera')}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: selectedEntityId === wp.entity_id ? 'var(--accent)' : 'var(--bg-surface)',
                            border: '2px solid var(--accent)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 4px auto',
                            cursor: 'pointer'
                          }}
                          title={`Click to inspect ${wp.name}`}
                        >
                          <Camera size={14} />
                        </button>
                        <div style={{ fontSize: '0.70rem', fontWeight: 600 }}>{wp.entity_id}</div>
                        <div style={{ fontSize: '0.64rem', color: '#FBBF24', fontFamily: 'var(--font-mono)' }}>{wp.time} UTC</div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--success)' }}>[OBSERVED]</div>
                      </div>
                    ))}
                  </div>

                  {/* Connecting Line: Dashed to denote INFERRED route */}
                  <div style={{
                    position: 'absolute',
                    top: '42px',
                    left: '40px',
                    right: '40px',
                    height: '2px',
                    borderTop: '2px dashed #94a3b8',
                    zIndex: 1
                  }} />

                  <div style={{ marginTop: '14px', fontSize: '0.66rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Solid = Direct Sensor Observation · Dashed = Inferred Transit (No continuous tracking)
                  </div>
                </div>
              ) : (
                /* Accessible Map Data Table */
                <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                        <th style={{ textAlign: 'left', padding: '4px' }}>Camera</th>
                        <th style={{ textAlign: 'left', padding: '4px' }}>Time</th>
                        <th style={{ textAlign: 'left', padding: '4px' }}>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investigationData.map_corridors.observed_waypoints.map(wp => (
                        <tr key={wp.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '4px', fontWeight: 600 }}>{wp.name}</td>
                          <td style={{ padding: '4px', fontFamily: 'var(--font-mono)' }}>{wp.time} UTC</td>
                          <td style={{ padding: '4px', color: 'var(--success)' }}>Direct Observation</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* CCTV Viewer with Persistent DEMO FEED Watermark */}
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Camera size={16} color="var(--accent)" />
                  <h4 style={{ margin: 0, fontSize: '0.84rem', fontWeight: 600 }}>
                    {selectedCamera?.name || 'CCTV-04: Port Gate 4'}
                  </h4>
                </div>
                <span style={{ fontSize: '0.66rem', color: '#FBBF24', fontFamily: 'var(--font-mono)' }}>
                  {activeTimestamp} UTC
                </span>
              </div>

              {/* Surveillance Frame with Unremovable Watermark */}
              <div style={{
                position: 'relative',
                height: '180px',
                borderRadius: '6px',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#000'
              }}>
                <img
                  src={selectedCamera?.frame_image || investigationData.entities["CCTV-04"].frame_image}
                  alt={`Surveillance frame from ${selectedCamera?.id || 'CCTV-04'}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                />

                {/* Persistent Watermark Label */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  border: '1px solid #F87171',
                  color: '#F87171',
                  fontSize: '0.65rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '3px',
                  letterSpacing: '0.05em'
                }}>
                  DEMO FEED · SYNTHETIC SURVEILLANCE
                </div>

                {/* Reticle for FM-042 if at 14:09 */}
                {selectedFaceMatch && (selectedCamera?.id === 'CCTV-04' || activeTimestamp === '14:09') && (
                  <div style={{
                    position: 'absolute',
                    top: '31%',
                    left: '42%',
                    width: '24%',
                    height: '32%',
                    border: '2px solid #38bdf8',
                    boxShadow: '0 0 8px rgba(56, 189, 248, 0.6)',
                    pointerEvents: 'none'
                  }}>
                    <span style={{
                      position: 'absolute',
                      top: '-18px',
                      left: '0',
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      color: '#38bdf8',
                      fontSize: '0.60rem',
                      fontFamily: 'var(--font-mono)',
                      padding: '1px 4px',
                      borderRadius: '2px'
                    }}>
                      FM-042 (87%)
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Pane 3: Chronological Investigation Timeline */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Clock size={16} color="#FBBF24" />
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600 }}>
                CHRONOLOGICAL INVESTIGATION TIMELINE
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {investigationData.timeline.map(evt => {
                const isSelected = selectedTimelineEventId === evt.id;
                return (
                  <button
                    key={evt.id}
                    type="button"
                    onClick={() => selectTimelineEvent(evt.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '10px 14px',
                      backgroundColor: isSelected ? 'var(--accent-dim)' : 'var(--bg-main)',
                      border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                    aria-pressed={isSelected}
                  >
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: isSelected ? 'var(--accent)' : '#FBBF24',
                      padding: '2px 6px',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '4px',
                      flexShrink: 0
                    }}>
                      {evt.time} UTC
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {evt.title}
                        </span>
                        <span style={{
                          fontSize: '0.62rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          backgroundColor: evt.claim_type === 'OBSERVATION' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                          color: evt.claim_type === 'OBSERVATION' ? 'var(--success)' : 'var(--accent)'
                        }}>
                          [{evt.claim_type}]
                        </span>
                      </div>
                      <p style={{ margin: '3px 0 0 0', fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                        {evt.summary}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </section>

        {/* RIGHT COLUMN: Truthfulness Biometric Card & CIRA Dynamic Chat */}
        <aside aria-label="Biometric Intelligence and CIRA Copilot" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Pane 4: Truthfulness Biometric Card (FM-042) */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={16} color="var(--accent)" />
                <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600 }}>
                  BIOMETRIC CANDIDATE DOSSIER: FM-042
                </h3>
              </div>
              <span style={{
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono)',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(251, 191, 36, 0.15)',
                color: '#FBBF24',
                border: '1px solid rgba(251, 191, 36, 0.3)'
              }}>
                POTENTIAL MATCH · 87%
              </span>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {/* Notice Banner */}
              <div style={{
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '0.74rem',
                color: '#38bdf8',
                lineHeight: 1.4
              }}>
                <strong>Truthfulness Statement:</strong> Potential match identified. Model similarity: 87%; human verification required before any tactical action.
              </div>

              {/* Detail Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.74rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Model Name / Version: </span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>ArcFace-ResNet50 v2.4</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Timestamp: </span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>14:09:12 UTC</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Source Camera: </span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>CCTV-04 (Gate 4)</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Candidate Identity: </span>
                  <strong>Elena Rostov (P-017)</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Source Evidence: </span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>EVID-CCTV-04</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Review Status: </span>
                  <strong style={{ color: faceVerificationStatus.includes('VERIFIED') ? 'var(--success)' : '#FBBF24' }}>
                    {faceVerificationStatus}
                  </strong>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>Capture Limitations: </span>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Single-frame off-axis capture (yaw -18.4 deg). Ambient infrared lighting variance 14.2%. Landmark confidence: 0.812.
                </p>
              </div>

              {/* Action Buttons for Human Verification Protocol */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={handleVerifyFace}
                  disabled={faceVerificationStatus === 'VERIFIED_BY_INVESTIGATOR'}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: 'var(--success)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Check size={14} />
                  <span>Verify Match</span>
                </button>
                <button
                  type="button"
                  onClick={handleRejectFace}
                  disabled={faceVerificationStatus === 'REJECTED_DISPROVED'}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    color: '#F87171',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <X size={14} />
                  <span>Reject Match</span>
                </button>
              </div>

              {verificationNotice && (
                <div style={{ fontSize: '0.70rem', color: 'var(--success)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
                  ✓ {verificationNotice}
                </div>
              )}
            </div>
          </div>

          {/* Pane 5: CIRA Dynamic Reasoning Assistant */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: '400px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Shield size={16} color="var(--accent)" />
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600 }}>
                CIRA — CR-204 DYNAMIC INVESTIGATION REASONING
              </h3>
            </div>

            {/* Quick Sample Query Prompts */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
              {samplePrompts.slice(0, 5).map((p, idx) => (
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

            {/* Chat Messages Container */}
            <div aria-live="polite" aria-atomic="false" style={{
              flex: 1,
              maxHeight: '340px',
              overflowY: 'auto',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
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
                  <div style={{ fontSize: '0.64rem', opacity: 0.7, marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
                    {msg.role === 'user' ? 'INVESTIGATOR' : 'CIRA INTEL CORE'} · {msg.timestamp}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isThinking && (
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  CIRA is traversing CR-204 knowledge graph & telemetry...
                </div>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleAskCira(); }}
              style={{ display: 'flex', gap: '8px', marginTop: '12px' }}
            >
              <input
                type="text"
                value={ciraQuery}
                onChange={(e) => setCiraQuery(e.target.value)}
                placeholder="Ask CIRA about CCTV-04, V-102 movement, P-017, gaps, or conflicts..."
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
                className="min-h-[44px]"
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

        </aside>

      </div>

    </main>
  );
}
