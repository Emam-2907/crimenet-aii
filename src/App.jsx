import React, { useState } from 'react';
import { CIRAProvider } from './context/CIRAContext.jsx';
import { InvestigationProvider } from './context/InvestigationContext.jsx';
import LoginPage from './components/LoginPage.jsx';
import InvestigationWorkstation from './components/InvestigationWorkstation.jsx';
import { api } from './services/api.js';

export default function App() {
  const [stage, setStage] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const explicitLogout = localStorage.getItem('crimenet_explicit_logout');
      if (explicitLogout === 'true') return 'login';
    }
    return 'workstation'; // Default directly to active workstation
  });

  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('crimenet_user');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      user_id: 'analyst.vance@crimenet.demo',
      full_name: 'Special Agent Marcus Vance',
      role: 'ANALYST',
      clearance: 'TS/SCI-ORCON',
      station: 'Station 04 (South Pier Tactical)',
      badge_id: 'CN-ALPHA-0941'
    };
  });

  const handleLoginSuccess = (user) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('crimenet_explicit_logout');
      localStorage.setItem('crimenet_user', JSON.stringify(user));
    }
    setCurrentUser(user);
    setStage('workstation');
  };

  const handleLogout = () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('crimenet_explicit_logout', 'true');
      localStorage.removeItem('crimenet_user');
    }
    api.logout();
    setCurrentUser(null);
    setStage('login');
  };

  if (stage === 'workstation') {
    return (
      <InvestigationProvider>
        <CIRAProvider>
          <InvestigationWorkstation currentUser={currentUser} onLogout={handleLogout} />
        </CIRAProvider>
      </InvestigationProvider>
    );
  }

  return <LoginPage onLoginSuccess={handleLoginSuccess} />;
}
