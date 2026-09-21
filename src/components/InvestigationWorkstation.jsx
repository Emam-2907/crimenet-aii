import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useCIRA } from '../context/CIRAContext.jsx';
import Dashboard          from './Dashboard.jsx';
import CasesList          from './CasesList.jsx';
import CaseWorkspace      from './CaseWorkspace.jsx';
import EvidenceLibrary    from './EvidenceLibrary.jsx';
import CytoscapeGraph     from './CytoscapeGraph.jsx';
import ForensicFaceLab    from './ForensicFaceLab.jsx';
import CrimeAIChat        from './CrimeAIChat.jsx';
import EntityResolution   from './EntityResolution.jsx';
import ExplainableLeads   from './ExplainableLeads.jsx';
import AnalyticsPanel     from './AnalyticsPanel.jsx';
import CreateCaseModal    from './CreateCaseModal.jsx';
import GlobalSearchModal  from './GlobalSearchModal.jsx';
import CR204InvestigationView from './CR204InvestigationView.jsx';
import CCTNSExportModal from './CCTNSExportModal.jsx';

// ── Icons ─────────────────────────────────────────────────────────────────────
const IC = {
  dashboard:  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
  cr204:      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
  cases:      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg>,
  evidence:   <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
  graph:      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>,
  chat:       <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  faceid:     <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  analytics:  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
  settings:   <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.280c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  resolution: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>,
  leads:      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.516 0c.85.493 1.508 1.333 1.508 2.316V18" /></svg>,
  search:     <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
  bell:       <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>,
  collapse:   <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" /></svg>,
  expand:     <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" /></svg>,
  logout:     <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
};

// ── Primary Navigation Hierarchy ──────────────────────
const PRIMARY_NAV = [
  { id: 'dashboard',  label: 'Dashboard',              icon: IC.dashboard },
  { id: 'cr204',      label: 'CCTV Tactical Map',      icon: IC.cr204, badge: 'DEMO' },
  { id: 'cases',      label: 'Cases',                  icon: IC.cases },
  { id: 'evidence',   label: 'Evidence',               icon: IC.evidence },
  { id: 'graph',      label: 'Graph Analysis',         icon: IC.graph },
  { id: 'chat',       label: 'CIRA',                   icon: IC.chat },
  { id: 'faceid',     label: 'Visual Similarity Demo', icon: IC.faceid },
  { id: 'analytics',  label: 'Analytics',              icon: IC.analytics },
  { id: 'settings',   label: 'Settings',               icon: IC.settings },
];

const SECONDARY_TOOLS = [
  { id: 'resolution', label: 'Entity Resolution', icon: IC.resolution },
  { id: 'leads',      label: 'Explainable Leads', icon: IC.leads },
];

const PAGE_TITLES = {
  dashboard:  'Operational Dashboard & Simulation Summary',
  cr204:      'CR-204 CCTV Tactical Facility Map (Simulation)',
  cases:      'Investigation Case Registry (Fictional Records)',
  workspace:  'Dedicated Case Workspace (Simulated)',
  evidence:   'Evidence Intelligence Repository (Simulated Assets)',
  graph:      'Criminal Relational Knowledge Graph (24 Entities · 28 Relations)',
  chat:       'CIRA — AI Investigation Assistant (Synthetic RAG)',
  faceid:     'Synthetic Visual Similarity Demo',
  analytics:  'Network Centrality & Link Analysis (NetworkX)',
  resolution: 'Multi-Source Entity Disambiguation (RapidFuzz)',
  leads:      'Intelligence Lead Extraction & Corroboration (Regex-NER)',
  settings:   'Simulation Settings & Configuration'
};


function LiveClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.68rem', color: 'var(--t-muted)' }}>
      {t.toUTCString().slice(17, 25)} UTC
    </span>
  );
}

// ── Settings Sub-panel ────────────────────────────────────────────────────────
function SettingsPanel({ currentUser }) {
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('crimenet_gemini_key') || '');
  const [saved, setSaved] = useState(false);
  const [settingsData, setSettingsData] = useState(null);
  const [settingsError, setSettingsError] = useState(null);

  const isInvestigator = currentUser?.role === 'INVESTIGATOR' || currentUser?.clearance === 'SECRET';

  useEffect(() => {
    let isMounted = true;
    api.getSettings()
      .then(data => {
        if (isMounted) {
          setSettingsData(data);
        }
      })
      .catch(err => {
        if (isMounted) {
          setSettingsError(err.message || 'Access restricted.');
        }
      });
    return () => { isMounted = false; };
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    if (geminiKey.trim()) {
      localStorage.setItem('crimenet_gemini_key', geminiKey.trim());
    } else {
      localStorage.removeItem('crimenet_gemini_key');
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (isInvestigator || settingsError) {
    return (
      <div style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '10px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.2rem', color: 'var(--red-light)' }}>⚠️</span>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--red-light)', margin: 0 }}>
              403 FORBIDDEN · ACCESS RESTRICTED
            </h3>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--t-secondary)', lineHeight: 1.5, margin: 0 }}>
            System configuration and administrative telemetry require <strong>CASE_SUPERVISOR</strong> or <strong>SYSTEM_ADMIN</strong> clearance.
          </p>
          <div style={{
            marginTop: '16px',
            padding: '10px 14px',
            background: 'var(--ink-2)',
            borderRadius: '6px',
            border: '1px solid var(--b-soft)',
            fontFamily: 'var(--f-mono)',
            fontSize: '0.74rem',
            color: 'var(--t-muted)'
          }}>
            USER: {currentUser?.email || currentUser?.user_id} · CLEARANCE: {currentUser?.clearance || 'SECRET'} · ROLE: {currentUser?.role || 'INVESTIGATOR'}
          </div>
        </div>
      </div>
    );
  }

  const backendHost = window.location.origin;

  return (
    <div style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: 'var(--ink-1)', border: '1px solid var(--b-faint)', borderRadius: '10px', padding: '22px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
          Station AI Configuration
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--t-muted)', marginBottom: '16px' }}>
          Configure live Google Gemini API inference for CIRA AI Copilot. A robust fallback brain handles operations if key is absent.
        </p>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontFamily: 'var(--f-mono)', color: 'var(--t-secondary)', marginBottom: '6px' }}>
              GOOGLE GEMINI API KEY (OPTIONAL)
            </label>
            <input
              type="text"
              autoComplete="off"
              value={geminiKey}
              onChange={e => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              style={{
                width: '100%', padding: '10px 12px', background: 'var(--ink-2)',
                border: '1px solid var(--b-soft)', borderRadius: '6px',
                color: '#fff', fontSize: '0.84rem', fontFamily: 'var(--f-mono)',
                WebkitTextSecurity: 'disc'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--green-light)', fontFamily: 'var(--f-mono)' }}>
              {saved && '✓ Settings saved securely to station memory'}
            </span>
            <button
              type="submit"
              style={{
                padding: '8px 18px', background: 'var(--green)',
                border: 'none', borderRadius: '6px',
                color: '#06090e', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer'
              }}
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>

      <div style={{ background: 'var(--ink-1)', border: '1px solid var(--b-faint)', borderRadius: '10px', padding: '20px' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
          Environment Telemetry & Security
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.76rem', color: 'var(--t-secondary)' }}>
          <div>Clearance Standard: <strong style={{ color: '#fff', fontFamily: 'var(--f-mono)' }}>{settingsData?.clearance_standard || 'TS//SCI-ORCON'}</strong></div>
          <div>Jurisdictional Authority: <strong style={{ color: '#fff' }}>{settingsData?.jurisdiction || 'Federal Inter-Agency Counter-Syndicate Taskforce'}</strong></div>
          <div>Station Node: <strong style={{ color: 'var(--green-light)', fontFamily: 'var(--f-mono)' }}>{settingsData?.station_node || 'ALPHA-01'}</strong></div>
          <div>Telemetry Status: <strong style={{ color: 'var(--blue-light)', fontFamily: 'var(--f-mono)' }}>Audit: {settingsData?.telemetry?.audit_logging || 'MANDATORY'} · Retention: {settingsData?.telemetry?.data_retention_days || 365}d</strong></div>
          <div>Active Host: <strong style={{ color: 'var(--t-dim)', fontFamily: 'var(--f-mono)' }}>{backendHost}</strong></div>
        </div>
      </div>
    </div>
  );
}

// ── Main Workstation ──────────────────────────────────────────────────────────
export default function InvestigationWorkstation({ currentUser, onLogout, onSwitchPersona }) {
  const {
    activePage,
    navigate,
    cases,
    activeCase,
    openCaseWorkspace,
    isSearchOpen,
    setIsSearchOpen,
    isCreateCaseOpen,
    setIsCreateCaseOpen
  } = useCIRA();

  const [collapsed, setCollapsed] = useState(false);
  const [showCaseDropdown, setShowCaseDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isCCTNSOpen, setIsCCTNSOpen] = useState(false);
  const [showPersonaModal, setShowPersonaModal] = useState(false);

  // Global Ctrl+K shortcut for Global Search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  const fullscreen = activePage === 'graph' || activePage === 'faceid' || activePage === 'cr204';

  const isInvestigator = currentUser?.role === 'INVESTIGATOR' || currentUser?.clearance === 'SECRET';
  const visiblePrimaryNav = PRIMARY_NAV.filter(item => {
    if (item.id === 'settings' && isInvestigator) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--ink)', fontFamily: 'var(--f-body)' }}>

      {/* ── Persistent Simulation Only Banner ── */}
      <div style={{
        backgroundColor: '#7f1d1d',
        color: '#fef2f2',
        fontSize: '0.68rem',
        fontWeight: 700,
        letterSpacing: '0.03em',
        textAlign: 'center',
        padding: '5px 12px',
        borderBottom: '1px solid #991b1b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        zIndex: 1000,
        fontFamily: 'var(--font-mono, monospace)',
        flexShrink: 0
      }}>
        <span style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '0.58rem', padding: '1px 6px', borderRadius: '3px', fontWeight: 800 }}>DEMO ENVIRONMENT</span>
        <span>SIMULATION ONLY — ALL PEOPLE, INCIDENTS, LOCATIONS, IDENTITIES, IMAGES, AND EVIDENCE ARE FICTIONAL. NO REAL INVESTIGATIVE OR LAW-ENFORCEMENT DATA IS USED.</span>
      </div>

      {/* ── Top System Telemetry & Status Bar ─────────────────────────────── */}
      <div className="classification-bar" style={{ height: '28px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600, letterSpacing: '0.04em' }}>
            CRIMENET AI · SIMULATOR
          </span>
          <span style={{ color: 'var(--border-default)' }}>|</span>
          <span style={{ color: 'var(--text-secondary)' }}>CRIMINAL NETWORK ANALYSIS DEMO ENVIRONMENT</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '4px', padding: '1px 8px', color: '#38bdf8', fontSize: '0.62rem', fontWeight: 700 }}>
            DEMO ENVIRONMENT
          </span>
          <span>MODE: <strong style={{ color: 'var(--success)' }}>SIMULATION (NETWORKX / RAPIDFUZZ)</strong></span>
          <LiveClock />
        </div>
      </div>

      {/* ── Main Workstation Layout ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Left Navigation Sidebar ────────────────────────────────────────── */}
        <aside style={{
          width: collapsed ? '68px' : '224px',
          flexShrink: 0, display: 'flex', flexDirection: 'column',
          background: 'var(--bg-surface)', borderRight: '1px solid var(--border-default)',
          transition: 'width 0.2s ease', zIndex: 100
        }}>

        {/* Agency Brand & Collapse Toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between',
          padding: '14px 16px', borderBottom: '1px solid var(--border-default)', height: '54px'
        }}>
          <div
            onClick={() => navigate('dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', overflow: 'hidden' }}
          >
            <div style={{
              width: '30px', height: '30px', borderRadius: '6px',
              background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#ffffff" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            {!collapsed && (
              <div style={{ whiteSpace: 'nowrap' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.96rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
                  CRIMENET
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
                  INVESTIGATION SUITE
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
              style={{
                background: 'none', border: 'none', color: 'var(--t-dim)',
                cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--t-dim)'}
            >
              {IC.collapse}
            </button>
          )}
        </div>

        {/* Collapsed expand button */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            style={{
              background: 'none', border: 'none', color: 'var(--t-dim)',
              cursor: 'pointer', padding: '8px 0', display: 'flex', justifyContent: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--t-dim)'}
          >
            {IC.expand}
          </button>
        )}

        {/* Primary Navigation List */}
        <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto' }}>
          {visiblePrimaryNav.map(item => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  width: '100%', padding: '9px 12px', borderRadius: '6px',
                  border: `1px solid ${isActive ? 'var(--border-default)' : 'transparent'}`,
                  background: isActive ? 'var(--bg-elevated)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer', textAlign: 'left',
                  fontSize: '0.82rem', fontWeight: isActive ? 600 : 500,
                  transition: 'var(--transition-fast)', fontFamily: 'var(--font-body)',
                  borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent'
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <span style={{
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  flexShrink: 0, display: 'flex'
                }}>
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.badge && (
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '0.58rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--accent-dim)',
                    color: 'var(--accent-hover)',
                    border: '1px solid var(--accent-border)',
                    letterSpacing: '0.04em'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Preserved Secondary Tools */}
          {!collapsed && (
            <div style={{
              fontSize: '0.64rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
              padding: '14px 12px 6px', letterSpacing: '0.06em', textTransform: 'uppercase'
            }}>
              Investigative Tools
            </div>
          )}
          {SECONDARY_TOOLS.map(item => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  width: '100%', padding: '8px 12px', borderRadius: '6px',
                  border: `1px solid ${isActive ? 'var(--border-default)' : 'transparent'}`,
                  background: isActive ? 'var(--bg-elevated)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer', textAlign: 'left',
                  fontSize: '0.78rem', fontWeight: isActive ? 600 : 500,
                  transition: 'var(--transition-fast)',
                  borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent'
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <span style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)', flexShrink: 0, display: 'flex' }}>
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--b-faint)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {!collapsed && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px',
              background: 'var(--ink-2)', borderRadius: '6px', border: '1px solid var(--b-faint)'
            }}>
              <div className="dot dot-green dot-pulse" />
              <span style={{ fontSize: '0.62rem', fontFamily: 'var(--f-mono)', color: 'var(--green-light)', fontWeight: 600 }}>
                SECURED TELEMETRY
              </span>
            </div>
          )}

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between',
            padding: '8px 10px', background: 'var(--ink-2)', borderRadius: '7px', border: '1px solid var(--b-faint)'
          }}>
            {!collapsed && (
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fff' }}>
                  {currentUser?.full_name?.split(' ').slice(-1)[0] || 'Agent Vance'}
                </div>
                <div style={{ fontSize: '0.6rem', color: 'var(--green-light)', fontFamily: 'var(--f-mono)' }}>
                  {currentUser?.clearance || 'TS/SCI-ORCON'}
                </div>
              </div>
            )}
            <button
              onClick={onLogout}
              title="Sign out of station"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--t-dim)', padding: '4px', borderRadius: '4px',
                display: 'flex', transition: 'var(--ease)'
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--red-light)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--t-dim)'}
            >
              {IC.logout}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Viewport Area ──────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top Header Bar */}
        <header style={{
          height: '54px', flexShrink: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 22px',
          background: 'var(--ink-1)', borderBottom: '1px solid var(--b-faint)',
          zIndex: 90
        }}>

          {/* Left: Page Title & Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontFamily: 'var(--f-display)', fontSize: '1.02rem', fontWeight: 700, color: '#fff' }}>
              {PAGE_TITLES[activePage] || activePage}
            </h1>
            <span style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.62rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              letterSpacing: '0.04em'
            }}>
              DEMO ENVIRONMENT
            </span>
            {activePage === 'workspace' && activeCase && (
              <span style={{
                fontFamily: 'var(--f-mono)', fontSize: '0.74rem',
                color: 'var(--blue-light)', fontWeight: 600
              }}>
                / {activeCase.id}
              </span>
            )}
          </div>

          {/* Center / Right: Global Search, Active Case Context, Notifications, User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            {/* CCTNS Gateway Interoperability Button */}
            <button
              onClick={() => setIsCCTNSOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '5px 11px', background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.35)', borderRadius: '6px',
                color: '#38bdf8', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer',
                transition: 'var(--ease)'
              }}
              title="Indian CCTNS / NATGRID Interoperability Docket Exchange"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span>CCTNS Gateway</span>
            </button>

            {/* Global Search Bar Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '5px 12px', background: 'var(--ink-2)',
                border: '1px solid var(--b-soft)', borderRadius: '6px',
                color: 'var(--t-muted)', fontSize: '0.76rem', cursor: 'pointer',
                transition: 'var(--ease)', width: '200px'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--b-medium)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--b-soft)'}
            >
              <span style={{ color: 'var(--t-dim)', display: 'flex' }}>{IC.search}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>Global Search...</span>
              <span style={{
                fontSize: '0.62rem', fontFamily: 'var(--f-mono)', padding: '1px 5px',
                background: 'rgba(255,255,255,0.06)', borderRadius: '3px', color: 'var(--t-dim)'
              }}>
                Ctrl+K
              </span>
            </button>

            {/* Current Active Case Context Dropdown */}
            {activeCase && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowCaseDropdown(!showCaseDropdown)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '5px 10px', background: 'var(--ink-2)',
                    border: '1px solid var(--b-soft)', borderRadius: '6px',
                    cursor: 'pointer', transition: 'var(--ease)'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--blue-light)' }} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.64rem', fontFamily: 'var(--f-mono)', color: 'var(--t-dim)' }}>
                      ACTIVE CASE
                    </div>
                    <div style={{ fontSize: '0.74rem', fontFamily: 'var(--f-mono)', color: 'var(--blue-light)', fontWeight: 700 }}>
                      {activeCase.id}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--t-dim)' }}>▼</span>
                </button>

                {/* Case Switcher Dropdown */}
                {showCaseDropdown && (
                  <div style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: '6px',
                    width: '300px', background: 'var(--ink-1)', border: '1px solid var(--b-soft)',
                    borderRadius: '8px', boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
                    padding: '8px', zIndex: 1000
                  }}>
                    <div style={{ fontSize: '0.66rem', fontFamily: 'var(--f-mono)', color: 'var(--t-dim)', padding: '4px 8px' }}>
                      SWITCH INVESTIGATION CONTEXT
                    </div>
                    {cases.map(c => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setShowCaseDropdown(false);
                          openCaseWorkspace(c);
                        }}
                        style={{
                          padding: '8px 10px', borderRadius: '6px', cursor: 'pointer',
                          background: c.id === activeCase.id ? 'rgba(255,255,255,0.05)' : 'transparent'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = c.id === activeCase.id ? 'rgba(255,255,255,0.05)' : 'transparent'}
                      >
                        <div style={{ fontSize: '0.78rem', color: '#fff', fontWeight: 600 }}>{c.id}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--t-muted)' }}>{c.title}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notifications Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                title="Operational Notifications"
                style={{
                  background: 'none', border: '1px solid var(--b-faint)', borderRadius: '6px',
                  padding: '6px', color: 'var(--t-secondary)', cursor: 'pointer', display: 'flex',
                  position: 'relative'
                }}
              >
                {IC.bell}
                <span style={{
                  position: 'absolute', top: '2px', right: '2px', width: '6px', height: '6px',
                  borderRadius: '50%', background: 'var(--red-light)'
                }} />
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: '6px',
                  width: '320px', background: 'var(--ink-1)', border: '1px solid var(--b-soft)',
                  borderRadius: '8px', boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
                  padding: '12px', zIndex: 1000
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>Operational Alerts</span>
                    <span className="dot dot-red dot-pulse" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.74rem' }}>
                    <div style={{ padding: '6px 8px', background: 'var(--ink-2)', borderRadius: '5px' }}>
                      <span style={{ color: 'var(--red-light)', fontWeight: 600 }}>Critical Biometric Match</span>
                      <p style={{ color: 'var(--t-muted)', margin: '2px 0 0' }}>Voronin detected at Terminal C (96.4%).</p>
                    </div>
                    <div style={{ padding: '6px 8px', background: 'var(--ink-2)', borderRadius: '5px' }}>
                      <span style={{ color: 'var(--amber-light)', fontWeight: 600 }}>ALPR Sensor Hit</span>
                      <p style={{ color: 'var(--t-muted)', margin: '2px 0 0' }}>Plate 8B9-CYP tagged on Hwy 101 North.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <LiveClock />

            {/* Active Investigator Profile & Quick Persona / Login Switcher */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '3px 10px 3px 6px',
              background: 'var(--ink-2)',
              border: '1px solid var(--b-med)',
              borderRadius: '20px'
            }}>
              <div style={{
                width: '26px', height: '26px', borderRadius: '50%',
                background: 'var(--accent)',
                color: '#ffffff', fontWeight: 700, fontSize: '0.72rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {currentUser?.full_name ? currentUser.full_name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'MV'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {currentUser?.full_name || 'Special Agent Marcus Vance'}
                </span>
                <span style={{ fontSize: '0.6rem', fontFamily: 'var(--f-mono)', color: 'var(--success)' }}>
                  {currentUser?.clearance || 'TS//SCI-ORCON'} · {currentUser?.station || 'Station 04'}
                </span>
              </div>
              <button
                onClick={() => setShowPersonaModal(true)}
                title="Switch persona or return to Login Portal"
                style={{
                  marginLeft: '4px',
                  padding: '3px 9px',
                  borderRadius: '12px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--accent-hover)',
                  fontSize: '0.64rem',
                  fontFamily: 'var(--f-mono)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.borderColor = 'var(--accent-hover)';
                  e.currentTarget.style.background = 'var(--accent-dim)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--accent-hover)';
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                  e.currentTarget.style.background = 'var(--bg-surface)';
                }}
              >
                Switch Persona ↩
              </button>
            </div>

          </div>
        </header>

        {/* Active Page Viewport Content */}
        <main style={{
          flex: 1, overflowY: 'auto',
          padding: fullscreen || activePage === 'chat' ? '0' : '22px 24px',
          background: 'var(--ink)'
        }}>
          {activePage === 'dashboard'  && <Dashboard currentUser={currentUser} onSwitchPersona={() => setShowPersonaModal(true)} />}
          {activePage === 'cr204'      && <CR204InvestigationView />}
          {activePage === 'cases'      && <CasesList />}
          {activePage === 'workspace'  && <CaseWorkspace />}
          {activePage === 'evidence'   && <EvidenceLibrary />}
          {activePage === 'graph'      && <div style={{ height: '100%', padding: '16px 20px' }}><CytoscapeGraph /></div>}
          {activePage === 'faceid'     && <div style={{ height: '100%', padding: '16px 20px' }}><ForensicFaceLab /></div>}
          {activePage === 'chat'       && <CrimeAIChat />}
          {activePage === 'analytics'  && <AnalyticsPanel />}
          {activePage === 'resolution' && <EntityResolution />}
          {activePage === 'leads'      && <ExplainableLeads />}
          {activePage === 'settings'   && <SettingsPanel currentUser={currentUser} />}
        </main>
      </div>
      </div>

      {/* Global Modals */}

      <CreateCaseModal
        isOpen={isCreateCaseOpen}
        onClose={() => setIsCreateCaseOpen(false)}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <CCTNSExportModal
        isOpen={isCCTNSOpen}
        onClose={() => setIsCCTNSOpen(false)}
      />

      <PersonaSwitchModal
        isOpen={showPersonaModal}
        onClose={() => setShowPersonaModal(false)}
        currentEmail={currentUser?.email}
        onSelectPersona={(email) => onSwitchPersona && onSwitchPersona(email)}
        onLogout={onLogout}
      />

    </div>
  );
}

const DEMO_PERSONAS = [
  {
    email: 'analyst.vance@crimenet.demo',
    name: 'Special Agent Marcus Vance',
    role: 'ANALYST',
    badge: 'CN-ALPHA-0941',
    clearance: 'TS/SCI-ORCON',
    station: 'Metro Tactical Counter-Syndicate Command'
  },
  {
    email: 'investigator.chen@crimenet.demo',
    name: 'Detective Sarah Chen',
    role: 'INVESTIGATOR',
    badge: 'CN-INV-5512',
    clearance: 'SECRET',
    station: 'Major Case Investigation Unit'
  },
  {
    email: 'supervisor.wright@crimenet.demo',
    name: 'Inspector Thomas Wright',
    role: 'SUPERVISOR',
    badge: 'CN-SUP-7719',
    clearance: 'TS//SCI',
    station: 'Regional Fusion Command'
  },
  {
    email: 'admin@crimenet.demo',
    name: 'Command Administrator',
    role: 'ADMIN',
    badge: 'CN-HQ-0001',
    clearance: 'TS//SCI-ORCON',
    station: 'Joint Intelligence Headquarters'
  }
];

function PersonaSwitchModal({ isOpen, onClose, currentEmail, onSelectPersona, onLogout }) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tactical Persona & Clearance Switcher"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 6, 12, 0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#0c111d',
          border: '1px solid #1e293b',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
          fontFamily: 'var(--font-sans, system-ui)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono, monospace)', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.06em' }}>
              SECURITY & ROLE IDENTITIES
            </div>
            <h3 style={{ margin: '4px 0 0', fontSize: '1.15rem', color: '#f8fafc', fontWeight: 700 }}>
              Switch Tactical Persona
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '1.1rem',
              padding: '4px 8px',
              borderRadius: '6px'
            }}
            title="Close modal"
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 16px', lineHeight: 1.45 }}>
          Select an active investigative profile below to instantaneously switch station roles, RBAC access levels, and case isolation rules:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {DEMO_PERSONAS.map((p) => {
            const isActive = currentEmail === p.email;
            return (
              <button
                key={p.email}
                type="button"
                onClick={() => {
                  onSelectPersona(p.email);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: isActive ? 'rgba(56, 189, 248, 0.08)' : '#111827',
                  border: `1px solid ${isActive ? '#38bdf8' : '#1f2937'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.borderColor = '#334155';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.borderColor = '#1f2937';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#f8fafc' }}>
                      {p.name}
                    </span>
                    <span style={{
                      fontSize: '0.62rem',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '3px',
                      backgroundColor: p.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                      color: p.role === 'ADMIN' ? '#f87171' : '#38bdf8',
                      border: `1px solid ${p.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`
                    }}>
                      {p.role}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '3px' }}>
                    {p.badge} · {p.clearance} · {p.station}
                  </div>
                </div>

                {isActive ? (
                  <span style={{
                    fontSize: '0.64rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    color: '#34d399',
                    fontWeight: 700,
                    backgroundColor: 'rgba(52, 211, 153, 0.1)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid rgba(52, 211, 153, 0.3)'
                  }}>
                    ACTIVE
                  </span>
                ) : (
                  <span style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 600 }}>
                    Switch →
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            style={{
              padding: '8px 14px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              color: '#f87171',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Sign Out to Login Portal
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
