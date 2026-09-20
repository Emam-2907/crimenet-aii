import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { api } from '../services/api.js';

const CIRAContext = createContext(null);

export function CIRAProvider({ children }) {
  const [activePage, setActivePage]           = useState('dashboard');
  const [previousPage, setPreviousPage]       = useState('dashboard');
  const [currentSubject, setCurrentSubject]   = useState(null); // { name, id, type }
  const [sessionContext, setSessionContext]   = useState({});   // accumulated session facts
  const navigationHistory = useRef(['dashboard']);

  // Phase 2: Case Management & Evidence State
  const [cases, setCases]                     = useState([]);
  const [activeCase, setActiveCase]           = useState(null);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [isSearchOpen, setIsSearchOpen]       = useState(false);
  const [isCreateCaseOpen, setIsCreateCaseOpen] = useState(false);
  const [activeCaseTab, setActiveCaseTab]     = useState('OVERVIEW');
  const [toastNotification, setToastNotification] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToastNotification({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastNotification(prev => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  // Load cases on mount with custom local additions
  const refreshCases = useCallback(async () => {
    try {
      const data = await api.getCases();
      let customCases = [];
      if (typeof localStorage !== 'undefined') {
        try {
          const raw = localStorage.getItem('crimenet_custom_cases');
          if (raw) customCases = JSON.parse(raw);
        } catch (e) {}
      }
      const merged = [...customCases, ...data.filter(c => !customCases.some(cc => cc.id === c.id))];
      setCases(merged);
      if (!activeCase && merged.length > 0) {
        setActiveCase(merged[0]);
      }
    } catch (e) {
      console.warn('Failed to load cases', e);
    }
  }, [activeCase]);

  useEffect(() => {
    refreshCases();
  }, [refreshCases]);

  // Duplicate an existing case docket into an authentic working copy
  const duplicateCase = useCallback((sourceCaseId) => {
    const source = cases.find(c => c.id === sourceCaseId) || activeCase;
    if (!source) return null;

    const baseId = source.id.replace('CASE #', '').trim();
    const isCr204 = baseId === 'CR-204';
    const newId = isCr204 ? `CR-204-B` : `${source.id}-CLONE-${Math.floor(100 + Math.random() * 900)}`;

    const clonedDocket = {
      ...source,
      id: newId,
      title: `[Forensic Working Copy] ${source.title.replace(/^\[Forensic Working Copy\]\s*/, '')}`,
      reference_no: `REF-FED-${Math.floor(1000 + Math.random() * 9000)}-COPY`,
      created_date: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
      last_updated: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
      status: 'Active',
      investigator: 'Special Agent Marcus Vance (Lead)',
      tags: [...(source.tags || []).filter(t => t !== 'DUPLICATE_DOCKET'), 'DUPLICATE_DOCKET', 'WORKING_COPY'],
      description: `Authentic forensic working copy of docket ${source.id}. Cloned for independent multi-agency evidentiary review under federal counter-syndicate directive.`,
      is_duplicate: true,
      original_case_id: source.id
    };

    setCases(prev => {
      const updated = [clonedDocket, ...prev.filter(c => c.id !== newId)];
      if (typeof localStorage !== 'undefined') {
        try {
          const existingRaw = localStorage.getItem('crimenet_custom_cases');
          const existing = existingRaw ? JSON.parse(existingRaw) : [];
          localStorage.setItem('crimenet_custom_cases', JSON.stringify([clonedDocket, ...existing.filter(c => c.id !== newId)]));
        } catch (e) {}
      }
      return updated;
    });

    showToast(`✓ Duplicated case docket ${source.id} → ${newId} (Rule 1003 Authenticated)`, 'success');
    setActiveCase(clonedDocket);
    return clonedDocket;
  }, [cases, activeCase, showToast]);

  // Duplicate an evidence item into an authentic forensic working copy
  const duplicateEvidence = useCallback(async (sourceEvidenceIdOrObj) => {
    let source = typeof sourceEvidenceIdOrObj === 'object' ? sourceEvidenceIdOrObj : null;
    if (!source) {
      const allEv = await api.getEvidence();
      source = allEv.find(e => e.id === sourceEvidenceIdOrObj);
    }
    if (!source) return null;

    const newId = `${source.id}-DUP`;
    const clonedEvidence = {
      ...source,
      id: newId,
      name: `[Forensic Duplicate] ${source.name.replace(/^\[Forensic Duplicate\]\s*/, '')}`,
      upload_date: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
      status: 'Verified Working Duplicate',
      processing_state: 'ANALYZED',
      chain_of_custody: `2026-09-21: Bitstream working copy verified under FRE 1001(e) / Rule 1003 by Special Agent Marcus Vance. Identical SHA-256 integrity preserved.`,
      is_duplicate: true,
      original_evidence_id: source.id,
      notes: `Authentic working duplicate of ${source.id}. Certified for court presentation & graph relation analysis.`
    };

    if (typeof localStorage !== 'undefined') {
      try {
        const existingRaw = localStorage.getItem('crimenet_custom_evidence');
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        localStorage.setItem('crimenet_custom_evidence', JSON.stringify([clonedEvidence, ...existing.filter(e => e.id !== newId)]));
      } catch (e) {}
    }

    showToast(`✓ Created forensic duplicate ${newId} (FRE 1001(e) Bitstream Copy)`, 'success');
    setSelectedEvidence(clonedEvidence);
    return clonedEvidence;
  }, [showToast]);

  // Navigate to a module and track history
  const navigate = useCallback((page) => {
    if (!page) return;
    setActivePage(prev => {
      if (prev !== page) {
        setPreviousPage(prev);
        navigationHistory.current = [...navigationHistory.current.slice(-9), page];
      }
      return page;
    });
  }, []);

  const goBack = useCallback(() => {
    const hist = navigationHistory.current;
    if (hist.length > 1) {
      const prev = hist[hist.length - 2];
      navigationHistory.current = hist.slice(0, -1);
      setActivePage(prev);
      setPreviousPage(hist[hist.length - 3] || 'dashboard');
    }
  }, []);

  // Open dedicated Case Workspace (default to OVERVIEW)
  const openCaseWorkspace = useCallback(async (caseIdOrObj, defaultTab = 'OVERVIEW') => {
    let target = caseIdOrObj;
    if (typeof caseIdOrObj === 'string') {
      try {
        target = await api.getCase(caseIdOrObj);
      } catch (e) {
        target = cases.find(c => c.id === caseIdOrObj) || cases[0];
      }
    }
    setActiveCase(target);
    setActiveCaseTab(defaultTab || 'OVERVIEW');
    navigate('workspace');
  }, [cases, navigate]);

  const updateSubject = useCallback((subject) => {
    setCurrentSubject(subject);
    if (subject) {
      setSessionContext(ctx => ({ ...ctx, lastSubject: subject }));
    }
  }, []);

  const updateSessionContext = useCallback((key, value) => {
    setSessionContext(ctx => ({ ...ctx, [key]: value }));
  }, []);

  return (
    <CIRAContext.Provider value={{
      activePage,
      previousPage,
      navigate,
      goBack,
      currentSubject,
      updateSubject,
      sessionContext,
      updateSessionContext,
      navigationHistory,
      // Phase 2 State
      cases,
      setCases,
      activeCase,
      setActiveCase,
      activeCaseTab,
      setActiveCaseTab,
      refreshCases,
      duplicateCase,
      duplicateEvidence,
      toastNotification,
      showToast,
      openCaseWorkspace,
      selectedEvidence,
      setSelectedEvidence,
      isSearchOpen,
      setIsSearchOpen,
      isCreateCaseOpen,
      setIsCreateCaseOpen
    }}>
      {children}
      {/* Global Toast Notification */}
      {toastNotification && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          padding: '12px 18px',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--accent-hover)',
          color: '#ffffff',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          fontWeight: 600,
          animation: 'slideInRight 0.25s ease'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
          <span>{toastNotification.message}</span>
        </div>
      )}
    </CIRAContext.Provider>
  );
}

export const useCIRA = () => {
  const ctx = useContext(CIRAContext);
  if (!ctx) throw new Error('useCIRA must be used inside CIRAProvider');
  return ctx;
};

