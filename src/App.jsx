import React, { useState } from 'react';
import { CIRAProvider } from './context/CIRAContext.jsx';
import LoginPage from './components/LoginPage.jsx';
import InvestigationWorkstation from './components/InvestigationWorkstation.jsx';
import { api } from './services/api.js';

export default function App() {
  const [stage, setStage] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setStage('workstation');
  };

  const handleLogout = () => {
    api.setToken(null);
    setCurrentUser(null);
    setStage('login');
  };

  if (stage === 'workstation') {
    return (
      <CIRAProvider>
        <InvestigationWorkstation currentUser={currentUser} onLogout={handleLogout} />
      </CIRAProvider>
    );
  }

  return <LoginPage onLoginSuccess={handleLoginSuccess} />;
}
