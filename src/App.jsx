import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { CIRAProvider } from './context/CIRAContext.jsx';
import { InvestigationProvider } from './context/InvestigationContext.jsx';
import LoginPage from './components/LoginPage.jsx';
import InvestigationWorkstation from './components/InvestigationWorkstation.jsx';

function AppContent() {
  const { currentUser, isAuthenticated, isSessionLoading, logout, demoLogin } = useAuth();

  if (isSessionLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        background: '#04070c',
        color: '#94a3b8',
        fontFamily: 'monospace'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '2px solid rgba(56, 189, 248, 0.2)',
          borderTopColor: '#38bdf8',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '16px'
        }} />
        <span style={{ fontSize: '0.8rem', letterSpacing: '0.08em' }}>
          VERIFYING TACTICAL SESSION & CLEARANCE...
        </span>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (isAuthenticated && currentUser) {
    return (
      <InvestigationProvider>
        <CIRAProvider>
          <InvestigationWorkstation
            currentUser={currentUser}
            onLogout={logout}
            onSwitchPersona={demoLogin}
          />
        </CIRAProvider>
      </InvestigationProvider>
    );
  }

  return <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
