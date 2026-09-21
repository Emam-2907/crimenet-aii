import React, { useState } from 'react';
import { useInvestigation } from '../context/InvestigationContext.jsx';
import { ciraService } from '../services/ciraService.js';
import InvestigationMap from './InvestigationMap.jsx';
import CameraDetailsPanel from './CameraDetailsPanel.jsx';
import CR204CytoscapeGraph from './CR204CytoscapeGraph.jsx';
import OwnerFootageIntakeModal from './OwnerFootageIntakeModal.jsx';
import {
  Shield, Camera, User, Truck, MapPin, AlertTriangle, CheckCircle,
  Clock, FileText, Send, HelpCircle, Eye, EyeOff, Check, X,
  Layers, ChevronRight, Activity, ArrowRight, Table, GitFork, MessageSquare,
  Sparkles, Cpu, Zap, Radio, Maximize2, Split
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
    selectTimelineEvent,
    injectIngestedEvidence
  } = useInvestigation();

  // Bottom Workspace Tab: 'timeline' | 'graph' | 'cira'
  const [activeBottomTab, setActiveBottomTab] = useState('timeline');
  const [graphViewMode, setGraphViewMode] = useState('interactive'); // 'interactive' | 'accessible_tree'

  // Owner Footage Intake Modal State
  const [isFootageModalOpen, setIsFootageModalOpen] = useState(false);
  const [notificationBanner, setNotificationBanner] = useState(null);

  // CIRA Chat State
  const [ciraQuery, setCiraQuery] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      text: `### 🦇 CR-204 CIRA TACTICAL INTELLIGENCE CORE
**Active Case**: ${activeCase.title}
**Status**: ${activeCase.status} · Synthetic Prototype Data Only.
**Bat Bot Telemetry**: Active surveillance grid mapped across Sector 4 South Pier.

Tactical gap identified: 3-minute unobserved corridor between CCTV-04 (14:11) and CCTV-07 (14:15) along South Arterial Way.
Use the command bar below or type a query to command CIRA.`,
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

      // Trigger interactive modals or graph focus if prompted
      if (response.action === 'OPEN_OWNER_FOOTAGE_INTAKE') {
        setIsFootageModalOpen(true);
      } else if (response.action === 'FOCUS_GRAPH') {
        setActiveBottomTab('graph');
      }

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

  const handleInjectFromOwner = (data) => {
    if (injectIngestedEvidence) {
      injectIngestedEvidence(data);
      setNotificationBanner('✓ Evidence & Camera CCTV-PVT-01 successfully injected into Tactical Map, Relational Graph, and Timeline!');
      setTimeout(() => setNotificationBanner(null), 6000);
      setActiveBottomTab('graph');
    }
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
    <main className="cr204-investigation-view" role="main" aria-label="CR-204 Geographic CCTV Investigation Matrix" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '16px 20px',
      backgroundColor: 'var(--bg-main)',
      color: 'var(--text-primary)',
      width: '100%',
      minHeight: '100%'
    }}>

      {/* Persistent CCTV Demo Feed Watermark with Screen-Reader Live Region */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 14px',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        borderRadius: '6px',
        fontSize: '0.72rem',
        fontFamily: 'var(--font-mono)',
        color: '#f87171'
      }}>
        <span style={{ fontWeight: 700 }}>DEMO FEED // TACTICAL SIMULATION // SYNTHETIC GEOGRAPHIC CCTV GRID</span>
        <div aria-live="polite" aria-atomic="true">
          <span>ACTIVE TELEMETRY: </span>
          <strong style={{ color: '#fff' }}>{activeTimestamp || '14:15:00 UTC'}</strong>
        </div>
      </div>

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
              backgroundColor: 'var(--critical-dim)',
              color: 'var(--critical)',
              border: '1px solid var(--critical-border)'
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

        {/* Header Right Actions: Owner Footage Request & Workspace View Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Owner Footage Intake Button */}
          <button
            type="button"
            className="min-h-[44px] py-3"
            onClick={() => setIsFootageModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              minHeight: '44px',
              backgroundColor: '#3F5F78',
              border: '1px solid #5B7C99',
              borderRadius: '6px',
              color: '#E6E9ED',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(63, 95, 120, 0.35)'
            }}
          >
            <Zap size={14} style={{ color: '#E6E9ED' }} />
            <span>Request Owner Footage (Subpoena)</span>
          </button>

          {/* Fast Section Jump Shortcuts */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: '6px',
            border: '1px solid var(--border-default)',
            padding: '2px',
            gap: '4px'
          }}>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('cr204-map-container');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: 'var(--accent)',
                color: '#fff',
                fontSize: '0.70rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Eye size={13} />
              <span>Tactical Map</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveBottomTab('graph');
                const el = document.getElementById('cr204-bottom-tabs');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: activeBottomTab === 'graph' ? 'var(--accent-hover)' : 'transparent',
                color: activeBottomTab === 'graph' ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.70rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Jump to Synced Relational Knowledge Graph"
            >
              <GitFork size={13} />
              <span>Knowledge Graph</span>
            </button>
          </div>

          {/* Global Synchronization Context Pill */}
          <nav aria-label="Investigation Synchronization Status" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'var(--bg-elevated)',
            padding: '5px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-default)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.70rem'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>ACTIVE: </span>
              <strong style={{ color: 'var(--accent-hover)' }}>{selectedEntityId}</strong> ({selectedEntityType})
            </div>
            <div style={{ height: '12px', width: '1px', backgroundColor: 'var(--border-default)' }} />
            <div>
              <span style={{ color: 'var(--text-muted)' }}>TIME: </span>
              <strong style={{ color: 'var(--warning)' }}>{activeTimestamp} UTC</strong>
            </div>
            <div style={{ height: '12px', width: '1px', backgroundColor: 'var(--border-default)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--success)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
              <span>SYNCED</span>
            </div>
          </nav>
        </div>
      </header>

      {/* Optional Notification Banner */}
      {notificationBanner && (
        <div style={{
          backgroundColor: 'rgba(79, 122, 103, 0.15)',
          border: '1px solid var(--success)',
          borderRadius: '6px',
          padding: '10px 16px',
          color: 'var(--success)',
          fontSize: '0.78rem',
          fontFamily: 'var(--font-mono)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} />
            <span>{notificationBanner}</span>
          </div>
          <button
            onClick={() => setNotificationBanner(null)}
            style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Primary Real Geographic CCTV Surveillance Matrix ─────────────────── */}
      <section
        id="cr204-map-container"
        aria-label="Geographic CCTV Network and Camera Dossier"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 420px',
          gap: '16px',
          height: '620px',
          minHeight: '560px',
          alignItems: 'stretch',
          width: '100%'
        }}
      >
        {/* Dominant Real Geographic Map Container */}
        <div style={{ height: '620px', minHeight: '560px', position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
          <InvestigationMap />
        </div>

        {/* Dynamic Camera Details Panel */}
        <aside aria-label="Camera Details and Analysis" style={{ height: '620px', minHeight: '560px', position: 'relative' }}>
          <CameraDetailsPanel />
        </aside>
      </section>

      {/* ── Secondary Synchronized Section: Timeline, Graph, CIRA ─────── */}
      <section
        id="cr204-bottom-tabs"
        aria-label="Synchronized Investigation Telemetry and Relational Modules"
        style={{
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
                      border: isSelected ? '1.5px solid var(--accent-hover)' : '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? 'var(--shadow-sm)' : 'none'
                    }}
                    aria-pressed={isSelected}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: isSelected ? 'var(--accent-hover)' : 'var(--warning)',
                        backgroundColor: 'var(--bg-elevated)',
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
                        backgroundColor: evt.claim_type === 'OBSERVATION' ? 'var(--success-dim)' : 'var(--accent-dim)',
                        color: evt.claim_type === 'OBSERVATION' ? 'var(--success)' : 'var(--accent-hover)'
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
              <CR204CytoscapeGraph
                height="460px"
                onFocusMap={(ent) => selectEntity(ent.id, ent.type)}
              />
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

        {/* Tab 3: CIRA AI Copilot Reasoning & Bat Bot Command Core */}
        {activeBottomTab === 'cira' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 🦇 BAT BOT TACTICAL COMMAND BAR */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: '#101419',
              borderRadius: '6px',
              border: '1px solid #2A333D',
              flexWrap: 'wrap'
            }}>
              <span style={{
                fontSize: '0.66rem',
                fontFamily: 'var(--font-mono)',
                color: '#5B7C99',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Cpu size={12} />
                <span>BAT BOT COMMANDS:</span>
              </span>

              <button
                type="button"
                onClick={() => setIsFootageModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  backgroundColor: '#3F5F78',
                  border: '1px solid #5B7C99',
                  borderRadius: '4px',
                  color: '#E6E9ED',
                  fontSize: '0.66rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Zap size={11} />
                <span>/request-footage</span>
              </button>

              <button
                type="button"
                onClick={() => handleAskCira("Detect suspects by face recognition using ArcFace")}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  backgroundColor: '#171D24',
                  border: '1px solid #2A333D',
                  borderRadius: '4px',
                  color: '#C04A52',
                  fontSize: '0.66rem',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer'
                }}
              >
                <Eye size={11} />
                <span>/face-recon</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveBottomTab('graph'); handleAskCira("Explain this graph relationship"); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  backgroundColor: '#171D24',
                  border: '1px solid #2A333D',
                  borderRadius: '4px',
                  color: '#5B7C99',
                  fontSize: '0.66rem',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer'
                }}
              >
                <GitFork size={11} />
                <span>/graph-trace</span>
              </button>

              <button
                type="button"
                onClick={() => handleAskCira("What information is missing along the corridor?")}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  backgroundColor: '#171D24',
                  border: '1px solid #2A333D',
                  borderRadius: '4px',
                  color: '#B58A45',
                  fontSize: '0.66rem',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer'
                }}
              >
                <MapPin size={11} />
                <span>/map-blindspots</span>
              </button>

              <button
                type="button"
                onClick={() => handleAskCira("Calculate tactical cordon and escape vectors for Incident INC-204")}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  backgroundColor: '#171D24',
                  border: '1px solid #2A333D',
                  borderRadius: '4px',
                  color: '#4F7A67',
                  fontSize: '0.66rem',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer'
                }}
              >
                <Shield size={11} />
                <span>/cordon-plan</span>
              </button>
            </div>

            {/* Prompt suggestions */}
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

            {/* Chat Log Window */}
            <div style={{
              maxHeight: '320px',
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
                    {msg.role === 'user' ? 'INVESTIGATOR' : '🦇 CIRA BAT BOT INTEL CORE'} · {msg.timestamp}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </div>

                  {/* If assistant recommended owner footage, provide quick trigger button */}
                  {msg.role === 'assistant' && msg.text.includes('Mikhail Petrov') && (
                    <div style={{ marginTop: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setIsFootageModalOpen(true)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          backgroundColor: '#3F5F78',
                          border: '1px solid #5B7C99',
                          borderRadius: '4px',
                          color: '#E6E9ED',
                          fontSize: '0.70rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <Zap size={13} />
                        <span>Open Owner Footage & Biometric Intake Terminal</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {isThinking && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  🦇 CIRA Bat Bot analyzing telemetry, biometric embeddings, and tactical corridors...
                </div>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleAskCira(); }}
              style={{ display: 'flex', gap: '8px' }}
            >
              <input
                type="text"
                value={ciraQuery}
                onChange={(e) => setCiraQuery(e.target.value)}
                placeholder="Command CIRA Bat Bot: 'Ask owner for footage', 'Detect by face recognition', 'Trace graph', or '/cordon-plan'..."
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
                <span>Command</span>
                <Send size={14} />
              </button>
            </form>
          </div>
        )}

      </section>

      {/* ── Autonomous CIRA Owner Footage Intake & Biometric Scan Terminal Modal ── */}
      <OwnerFootageIntakeModal
        isOpen={isFootageModalOpen}
        onClose={() => setIsFootageModalOpen(false)}
        onInjectIntoCase={handleInjectFromOwner}
        defaultTarget="Viktor Voronin"
      />
    </main>
  );
}
