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
  const [activeCaseTab, setActiveCaseTab]     = useState('CCTV_MAP');

  // Load cases on mount
  const refreshCases = useCallback(async () => {
    try {
      const data = await api.getCases();
      setCases(data);
      if (!activeCase && data.length > 0) {
        setActiveCase(data[0]);
      }
    } catch (e) {
      console.warn('Failed to load cases', e);
    }
  }, [activeCase]);

  useEffect(() => {
    refreshCases();
  }, [refreshCases]);

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

  // Open dedicated Case Workspace (default to CCTV_MAP for CR-204)
  const openCaseWorkspace = useCallback(async (caseIdOrObj, defaultTab = null) => {
    let target = caseIdOrObj;
    if (typeof caseIdOrObj === 'string') {
      try {
        target = await api.getCase(caseIdOrObj);
      } catch (e) {
        target = cases.find(c => c.id === caseIdOrObj) || cases[0];
      }
    }
    setActiveCase(target);
    const tabToSet = defaultTab || (target?.id === 'CR-204' ? 'CCTV_MAP' : 'OVERVIEW');
    setActiveCaseTab(tabToSet);
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
      openCaseWorkspace,
      selectedEvidence,
      setSelectedEvidence,
      isSearchOpen,
      setIsSearchOpen,
      isCreateCaseOpen,
      setIsCreateCaseOpen
    }}>
      {children}
    </CIRAContext.Provider>
  );
}

export const useCIRA = () => {
  const ctx = useContext(CIRAContext);
  if (!ctx) throw new Error('useCIRA must be used inside CIRAProvider');
  return ctx;
};

