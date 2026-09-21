import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { CIRAProvider } from './context/CIRAContext.jsx';
import { InvestigationProvider } from './context/InvestigationContext.jsx';
import LoginPage from './components/LoginPage.jsx';
import InvestigationWorkstation from './components/InvestigationWorkstation.jsx';

class WorkstationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Workstation Runtime Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          width: '100vw',
          backgroundColor: '#04070c',
          color: '#f87171',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '24px 32px',
            maxWidth: '560px'
          }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '12px', color: '#ef4444' }}>
              CRIMENET TELEMETRY EXCEPTION
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.5 }}>
              {this.state.error?.message || 'A graphical rendering anomaly occurred.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                backgroundColor: '#38bdf8',
                color: '#04070c',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '4px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              Reset Session & Reload Workstation
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { currentUser, isAuthenticated, isSessionLoading, logout, demoLogin, checkSession } = useAuth();

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
      <WorkstationErrorBoundary>
        <InvestigationProvider>
          <CIRAProvider>
            <InvestigationWorkstation
              currentUser={currentUser}
              onLogout={logout}
              onSwitchPersona={demoLogin}
            />
          </CIRAProvider>
        </InvestigationProvider>
      </WorkstationErrorBoundary>
    );
  }

  return <LoginPage onLoginSuccess={() => checkSession()} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
