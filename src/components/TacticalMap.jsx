import React, { useState } from 'react';
import { SECTORS } from '../data/mockData.js';
import { soundFx } from '../utils/audio.js';

export default function TacticalMap() {
  const [selectedSector, setSelectedSector] = useState(SECTORS[1]); // Default to Bravo (Critical)
  const [isRadarSweeping, setIsRadarSweeping] = useState(true);

  const handleSelectSector = (sector) => {
    soundFx.playRadarPing();
    setSelectedSector(sector);
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 340px',
      gap: '20px',
      alignItems: 'stretch'
    }}>
      {/* Radar Map Visualizer Container */}
      <div className="panel-card" style={{
        position: 'relative',
        minHeight: '480px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        background: 'var(--bg-surface)'
      }}>
        {/* Radar Sweep Effect */}
        {isRadarSweeping && (
          <div className="radar-sweep-animation" style={{
            width: '420px',
            height: '420px',
            opacity: 0.35
          }} />
        )}

        {/* Tactical Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="status-indicator status-active"></span>
              <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-primary)', fontWeight: 600 }}>
                GEOSPATIAL RISK GRID
              </h3>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', margin: 0 }}>
              METROPOLITAN SURVEILLANCE GRID 104-X
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                soundFx.playTacticalClick();
                setIsRadarSweeping(!isRadarSweeping);
              }}
              style={{
                background: isRadarSweeping ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                border: isRadarSweeping ? '1px solid var(--accent-border)' : '1px solid var(--border-default)',
                color: isRadarSweeping ? 'var(--accent-hover)' : 'var(--text-muted)',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.70rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)'
              }}
            >
              {isRadarSweeping ? 'RADAR: ACTIVE' : 'RADAR: PAUSED'}
            </button>
          </div>
        </div>

        {/* Concentric Radar Rings Graphic */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          border: '1px solid var(--border-default)',
          pointerEvents: 'none'
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            border: '1px dashed var(--border-subtle)'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            border: '1px solid var(--border-default)'
          }}></div>
          {/* Crosshairs */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '1px',
            background: 'var(--border-subtle)'
          }}></div>
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: '1px',
            background: 'var(--border-subtle)'
          }}></div>
        </div>

        {/* Interactive Sector Hotspot Nodes */}
        <div style={{ position: 'relative', width: '100%', height: '340px', zIndex: 2 }}>
          {SECTORS.map((sector) => {
            const isSelected = selectedSector.id === sector.id;

            return (
              <div
                key={sector.id}
                onClick={() => handleSelectSector(sector)}
                style={{
                  position: 'absolute',
                  left: sector.x,
                  top: sector.y,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'transform 0.15s ease',
                  zIndex: isSelected ? 10 : 3
                }}
              >
                {/* Ping Marker */}
                <div style={{
                  width: isSelected ? '40px' : '30px',
                  height: isSelected ? '40px' : '30px',
                  borderRadius: '50%',
                  background: isSelected 
                    ? `${sector.color}30`
                    : 'var(--bg-elevated)',
                  border: `2px solid ${sector.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 6px auto',
                  boxShadow: isSelected ? `0 0 10px ${sector.color}40` : 'none',
                  transition: 'all 0.15s ease'
                }}>
                  <span style={{
                    fontSize: '0.70rem',
                    fontWeight: 700,
                    color: '#fff',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {sector.id[0]}
                  </span>
                </div>

                <div style={{
                  background: 'var(--bg-elevated)',
                  border: `1px solid ${isSelected ? sector.color : 'var(--border-default)'}`,
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-mono)',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  whiteSpace: 'nowrap'
                }}>
                  {sector.id} • {sector.riskIndex}/100
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Sector Switcher */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-default)'
        }}>
          {SECTORS.map(sec => (
            <button
              key={sec.id}
              onClick={() => handleSelectSector(sec)}
              style={{
                background: selectedSector.id === sec.id ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                border: selectedSector.id === sec.id ? '1px solid var(--accent-border)' : '1px solid var(--border-default)',
                color: selectedSector.id === sec.id ? 'var(--accent-hover)' : 'var(--text-secondary)',
                borderRadius: '4px',
                padding: '5px 10px',
                fontSize: '0.72rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'nowrap'
              }}
            >
              {sec.name.split(' ')[0]} {sec.id} ({sec.riskIndex}%)
            </button>
          ))}
        </div>
      </div>

      {/* Sector Details Panel */}
      <div className="panel-card" style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'var(--bg-surface)',
        borderLeft: `3px solid ${selectedSector.color}`
      }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <span className="badge" style={{
                background: `${selectedSector.color}18`,
                color: selectedSector.color,
                border: `1px solid ${selectedSector.color}40`,
                marginBottom: '8px'
              }}>
                SECTOR {selectedSector.id} • {selectedSector.threatLevel}
              </span>
              <h4 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--text-primary)', fontWeight: 600 }}>
                {selectedSector.name}
              </h4>
            </div>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '18px' }}>
            {selectedSector.description}
          </p>

          {/* Risk Index Meter */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>THREAT RISK INDEX</span>
              <span style={{ color: selectedSector.color, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {selectedSector.riskIndex} / 100
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              background: 'var(--bg-elevated)',
              borderRadius: '3px',
              overflow: 'hidden',
              border: '1px solid var(--border-default)'
            }}>
              <div style={{
                width: `${selectedSector.riskIndex}%`,
                height: '100%',
                background: selectedSector.color,
                borderRadius: '3px'
              }}></div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginBottom: '18px'
          }}>
            <div style={{
              background: 'var(--bg-elevated)',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid var(--border-default)'
            }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                ACTIVE THREATS
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                {selectedSector.activeIncidents}
              </div>
            </div>

            <div style={{
              background: 'var(--bg-elevated)',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid var(--border-default)'
            }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                SURVEILLANCE CAMS
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-heading)' }}>
                {selectedSector.activeCameras}
              </div>
            </div>

            <div style={{
              background: 'var(--bg-elevated)',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid var(--border-default)'
            }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                PATROL UNITS
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)', fontFamily: 'var(--font-heading)' }}>
                {selectedSector.patrolUnits}
              </div>
            </div>

            <div style={{
              background: 'var(--bg-elevated)',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid var(--border-default)'
            }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                MESH HEALTH
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                {selectedSector.aiHealth}
              </div>
            </div>
          </div>
        </div>

        {/* Sector Action Button */}
        <button
          onClick={() => soundFx.playThreatAlert()}
          className="btn-secondary"
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.80rem', padding: '9px 16px' }}
        >
          <span>Reinforce Sector {selectedSector.id}</span>
        </button>
      </div>
    </div>
  );
}
