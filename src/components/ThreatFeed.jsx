import React, { useState, useEffect } from 'react';
import { soundFx } from '../utils/audio.js';
import { SYNTHETIC_INCOMING_STREAM } from '../data/mockData.js';

export default function ThreatFeed({ incidents, setIncidents, onSelectIncident }) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [streamIndex, setStreamIndex] = useState(0);

  // Real-time simulated incident streaming
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      if (SYNTHETIC_INCOMING_STREAM.length > 0) {
        const nextTemplate = SYNTHETIC_INCOMING_STREAM[streamIndex % SYNTHETIC_INCOMING_STREAM.length];
        const newIncident = {
          ...nextTemplate,
          id: `INC-${Math.floor(8903 + Math.random() * 900)}`,
          code: `CR-STREAM-${Math.floor(Math.random() * 99)}`,
          timestamp: 'Just now',
          timeAgo: '0m ago'
        };

        setIncidents(prev => [newIncident, ...prev.slice(0, 14)]);
        setStreamIndex(prev => prev + 1);
        soundFx.playThreatAlert();
      }
    }, 12000); // New incident every 12 seconds when streaming

    return () => clearInterval(interval);
  }, [isLiveStreaming, streamIndex, setIncidents]);

  const filteredIncidents = incidents.filter(item => {
    const matchesSeverity = filterSeverity === 'ALL' || item.severity === filterSeverity;
    const matchesQuery = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesQuery;
  });

  const handleDispatch = (e, incId) => {
    e.stopPropagation();
    soundFx.playRadarPing();
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incId) {
        return { ...inc, status: 'DISPATCHED' };
      }
      return inc;
    }));
  };

  return (
    <div>
      {/* Controls Bar */}
      <div className="panel-card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '16px',
        padding: '12px 18px',
        background: 'var(--bg-surface)'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '380px' }}>
          <input
            type="text"
            placeholder="Filter by threat, location, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 14px 8px 36px'
            }}
          />
          <svg style={{ position: 'absolute', left: '12px', top: '10px' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {/* Severity Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map(sev => (
            <button
              key={sev}
              onClick={() => {
                soundFx.playTacticalClick();
                setFilterSeverity(sev);
              }}
              style={{
                background: filterSeverity === sev ? 'var(--accent)' : 'var(--bg-elevated)',
                border: filterSeverity === sev ? '1px solid var(--accent)' : '1px solid var(--border-default)',
                color: filterSeverity === sev ? '#ffffff' : 'var(--text-secondary)',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)'
              }}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Live Telemetry Feed Toggle */}
        <button
          onClick={() => {
            soundFx.playTacticalClick();
            setIsLiveStreaming(!isLiveStreaming);
          }}
          style={{
            background: isLiveStreaming ? 'var(--success-dim)' : 'var(--danger-dim)',
            border: isLiveStreaming ? '1px solid var(--success-border)' : '1px solid var(--danger-border)',
            color: isLiveStreaming ? 'var(--success)' : 'var(--danger)',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: isLiveStreaming ? 'var(--success)' : 'var(--danger)'
          }} />
          <span>{isLiveStreaming ? "DISPATCH TELEMETRY: LIVE" : "DISPATCH TELEMETRY: PAUSED"}</span>
        </button>
      </div>

      {/* Incidents List Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredIncidents.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: 'var(--bg-surface)',
            borderRadius: '8px',
            border: '1px dashed var(--border-default)'
          }}>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>No threat incidents match the current criteria.</p>
          </div>
        ) : (
          filteredIncidents.map(inc => {
            const isCritical = inc.severity === 'CRITICAL';
            const isHigh = inc.severity === 'HIGH';

            return (
              <div
                key={inc.id}
                onClick={() => {
                  soundFx.playScanSweep();
                  onSelectIncident(inc);
                }}
                className="panel-card"
                style={{
                  padding: '14px 18px',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  gap: '16px',
                  alignItems: 'center',
                  background: 'var(--bg-surface)',
                  cursor: 'pointer',
                  borderLeft: `3px solid ${
                    isCritical ? 'var(--danger)' : isHigh ? 'var(--warning)' : 'var(--accent)'
                  }`
                }}
              >
                {/* Threat Icon & ID */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
                  <span className={`badge ${isCritical ? 'badge-critical' : isHigh ? 'badge-warning' : 'badge-active'}`} style={{ fontSize: '0.65rem', marginBottom: '4px' }}>
                    {inc.severity}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {inc.id}
                  </span>
                </div>

                {/* Incident Summary */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {inc.title}
                    </h3>
                    <span style={{
                      fontSize: '0.70rem',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      color: 'var(--text-secondary)'
                    }}>
                      {inc.category}
                    </span>
                    <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      • {inc.timestamp}
                    </span>
                  </div>

                  <p style={{
                    fontSize: '0.80rem',
                    color: 'var(--text-secondary)',
                    margin: '0 0 8px 0',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {inc.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{inc.location}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.70rem' }}>
                        CORROBORATION INDEX:
                      </span>
                      <div style={{
                        width: '60px',
                        height: '5px',
                        background: 'var(--bg-elevated)',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${inc.confidence}%`,
                          height: '100%',
                          background: inc.confidence > 95 ? 'var(--success)' : 'var(--accent)'
                        }}></div>
                      </div>
                      <span style={{ color: 'var(--accent-hover)', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.72rem' }}>
                        {inc.confidence}%
                      </span>
                    </div>

                    <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.70rem' }}>
                      FEED: {inc.cctvId}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                  <button
                    onClick={(e) => handleDispatch(e, inc.id)}
                    style={{
                      background: inc.status === 'DISPATCHED' ? 'var(--success-dim)' : 'var(--bg-elevated)',
                      border: inc.status === 'DISPATCHED' ? '1px solid var(--success-border)' : '1px solid var(--border-default)',
                      color: inc.status === 'DISPATCHED' ? 'var(--success)' : 'var(--text-primary)',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      fontSize: '0.70rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    {inc.status === 'DISPATCHED' ? '✓ DISPATCHED' : 'DISPATCH UNIT'}
                  </button>

                  <span style={{ fontSize: '0.70rem', color: 'var(--accent-hover)', cursor: 'pointer' }}>
                    Inspect Dossier &rarr;
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
