import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { soundFx } from '../utils/audio.js';
import { Activity, Award, ShieldAlert, Users, Network, TrendingUp } from 'lucide-react';

const CENTRALITY_DATA = [
  { id: 'suspect-1', name: 'Viktor Voronin', role: 'Principal Network Coordinator', degree: 4, betweenness: 0.94, threat: 'CRITICAL', syndicate: 'Apex Cyber' },
  { id: 'suspect-2', name: 'Elena Rostov', role: 'Financial Escrow Broker', degree: 3, betweenness: 0.88, threat: 'HIGH', syndicate: 'GhostNet Logistics' },
  { id: 'suspect-3', name: 'Darius Vance', role: 'Logistics Coordinator', degree: 3, betweenness: 0.72, threat: 'HIGH', syndicate: 'Kowloon Port Cartel' },
  { id: 'suspect-4', name: 'Marcus Kane', role: 'Technical Operations', degree: 2, betweenness: 0.45, threat: 'MEDIUM', syndicate: 'Apex Cyber' },
  { id: 'loc-202', name: 'Warehouse 14B', role: 'Primary Logistics Site', degree: 3, betweenness: 0.65, threat: 'HIGH', syndicate: 'Apex Cyber' },
  { id: 'fin-440', name: 'Tether Escrow Wallet', role: 'High-Volume Escrow Address', degree: 2, betweenness: 0.58, threat: 'CRITICAL', syndicate: 'GhostNet Logistics' }
];

const SYNDICATE_THREAT_DATA = [
  { syndicate: 'Apex Cyber', threatScore: 94, assets: 18, operations: 12 },
  { syndicate: 'GhostNet Log', threatScore: 86, assets: 14, operations: 8 },
  { syndicate: 'Kowloon Cartel', threatScore: 78, assets: 22, operations: 15 },
  { syndicate: 'Black Sea Cell', threatScore: 62, assets: 9, operations: 5 },
  { syndicate: 'Meridian Group', threatScore: 45, assets: 6, operations: 3 }
];

const NETWORK_RADAR_DATA = [
  { subject: 'Degree Centrality', A: 95, fullMark: 100 },
  { subject: 'Bridge Bottleneck', A: 88, fullMark: 100 },
  { subject: 'Financial Flow', A: 92, fullMark: 100 },
  { subject: 'Signal Intercepts', A: 75, fullMark: 100 },
  { subject: 'Physical Evidence', A: 85, fullMark: 100 },
  { subject: 'Geographic Density', A: 70, fullMark: 100 }
];

export default function AnalyticsPanel() {
  const [selectedPlayer, setSelectedPlayer] = useState(CENTRALITY_DATA[0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Analytics Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        <div className="panel-card" style={{ padding: '16px', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>NETWORK DENSITY</span>
            <Network size={16} color="var(--accent)" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
            0.255
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            14 relational bridges across 11 nodes
          </div>
        </div>

        <div className="panel-card" style={{ padding: '16px', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>KEY NETWORK BROKER</span>
            <Award size={16} color="var(--danger)" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--danger)', fontFamily: 'var(--font-heading)' }}>
            Viktor Voronin
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Highest Betweenness Centrality (0.94)
          </div>
        </div>

        <div className="panel-card" style={{ padding: '16px', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>FINANCIAL ESCROW RISKS</span>
            <TrendingUp size={16} color="var(--success)" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--success)', fontFamily: 'var(--font-heading)' }}>
            $4.2M USDT
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Tracked across 36 tumbling addresses
          </div>
        </div>

        <div className="panel-card" style={{ padding: '16px', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ACTIVE CELLS</span>
            <Users size={16} color="var(--warning)" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--warning)', fontFamily: 'var(--font-heading)' }}>
            3 Syndicates
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Apex, GhostNet, Kowloon Port
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: '20px',
        alignItems: 'stretch'
      }}>
        {/* Left: Centrality Leaderboard & Syndicate Threats Bar Chart */}
        <div className="panel-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px', background: 'var(--bg-surface)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>GRAPH CENTRALITY RANKING</span>
                <h4 style={{ margin: '4px 0 0 0', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>
                  Key Player Identification (Betweenness vs Degree)
                </h4>
              </div>
              <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                BETWEENNESS & DEGREE SCORES
              </span>
            </div>

            {/* Centrality Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px 10px' }}>ENTITY</th>
                    <th style={{ padding: '8px 10px' }}>ROLE</th>
                    <th style={{ padding: '8px 10px' }}>DEGREE</th>
                    <th style={{ padding: '8px 10px' }}>BETWEENNESS</th>
                    <th style={{ padding: '8px 10px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {CENTRALITY_DATA.map((player) => (
                    <tr
                      key={player.id}
                      onClick={() => {
                        soundFx.playTacticalClick();
                        setSelectedPlayer(player);
                      }}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        background: selectedPlayer.id === player.id ? 'var(--accent-dim)' : 'transparent',
                        cursor: 'pointer'
                      }}
                    >
                      <td style={{ padding: '9px 10px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {player.name}
                      </td>
                      <td style={{ padding: '9px 10px', color: 'var(--text-secondary)' }}>
                        {player.role}
                      </td>
                      <td style={{ padding: '9px 10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-hover)' }}>
                        {player.degree} links
                      </td>
                      <td style={{ padding: '9px 10px', fontFamily: 'var(--font-mono)', color: player.betweenness > 0.8 ? 'var(--danger)' : 'var(--warning)' }}>
                        {player.betweenness}
                      </td>
                      <td style={{ padding: '9px 10px' }}>
                        <span className={`badge ${player.threat === 'CRITICAL' ? 'badge-critical' : 'badge-warning'}`} style={{ fontSize: '0.68rem' }}>
                          {player.threat}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recharts Bar Chart: Syndicate Threat Index */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '10px' }}>
              NETWORK THREAT INDEX // RELATIVE RISK SEVERITY
            </div>
            <div style={{ height: '200px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SYNDICATE_THREAT_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="syndicate" stroke="#8D98A5" fontSize={11} tickLine={false} />
                  <YAxis stroke="#8D98A5" fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '6px', fontSize: '0.78rem' }}
                    labelStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="threatScore" fill="#3F5F78" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right: Radar Chart & Focused Player Brief */}
        <div className="panel-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'var(--bg-surface)' }}>
          <div>
            <span className="badge badge-info" style={{ fontSize: '0.68rem', marginBottom: '8px' }}>
              NETWORK ATTRIBUTE ANALYSIS
            </span>
            <h4 style={{ margin: '0 0 14px 0', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>
              Network Centrality & Vulnerability Profile
            </h4>

            <div style={{ height: '240px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={NETWORK_RADAR_DATA}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="subject" stroke="#8D98A5" fontSize={10} />
                  <PolarRadiusAxis stroke="#2A333D" fontSize={9} />
                  <Radar name="Network" dataKey="A" stroke="#5B7C99" fill="#3F5F78" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Selected Player Dossier Snippet */}
            <div style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
              padding: '12px',
              marginTop: '12px'
            }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                SELECTED KEY ENTITY
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                {selectedPlayer.name}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Affiliation: <strong style={{ color: 'var(--accent-hover)' }}>{selectedPlayer.syndicate}</strong> • {selectedPlayer.role}
              </div>
            </div>
          </div>

          <button
            onClick={() => soundFx.playSuccessChime()}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '16px', fontSize: '0.78rem', padding: '9px 16px' }}
          >
            Export Network Analysis Report
          </button>
        </div>
      </div>
    </div>
  );
}
