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
      const savedUser = localStorage.getItem('crimenet_user');
      if (savedUser && explicitLogout !== 'true') return 'workstation';
    }
    return 'login'; // Show Login Page by default
  });

  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('crimenet_user');
        const explicitLogout = localStorage.getItem('crimenet_explicit_logout');
        if (saved && explicitLogout !== 'true') return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
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

  if (stage === 'workstation' && currentUser) {
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
