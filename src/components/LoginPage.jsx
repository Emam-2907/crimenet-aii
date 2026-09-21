import React, { useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Shield, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    name: 'Agent Vance',
    role: 'Analyst',
    email: 'analyst.vance@crimenet.demo',
    password: 'Crimenet2026!'
  },
  {
    name: 'Det. Chen',
    role: 'Investigator',
    email: 'investigator.chen@crimenet.demo',
    password: 'Investigator2026!'
  },
  {
    name: 'Insp. Wright',
    role: 'Supervisor',
    email: 'supervisor.wright@crimenet.demo',
    password: 'Supervisor2026!'
  },
  {
    name: 'Admin',
    role: 'Admin',
    email: 'admin@crimenet.demo',
    password: 'Admin2026!'
  }
];

export default function LoginPage({ onLoginSuccess }) {
  const auth = useAuth ? useAuth() : null;

  const [email, setEmail] = useState(DEMO_ACCOUNTS[0].email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS[0].password);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelectDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!cleanPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      let loggedUser;
      if (auth && auth.login) {
        loggedUser = await auth.login(cleanEmail, cleanPassword);
      } else {
        const res = await api.login(cleanEmail, cleanPassword);
        loggedUser = res.user;
      }

      if (onLoginSuccess && loggedUser) {
        onLoginSuccess(loggedUser);
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Incorrect email or password. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#090d16',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: '#f1f5f9',
      position: 'relative'
    }}>
      {/* Simulation Notice Ribbon */}
      <div style={{
        backgroundColor: '#1e293b',
        color: '#94a3b8',
        fontSize: '0.74rem',
        textAlign: 'center',
        padding: '8px 16px',
        borderBottom: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        <span style={{
          backgroundColor: '#3b82f6',
          color: '#fff',
          fontSize: '0.62rem',
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: '4px',
          letterSpacing: '0.04em'
        }}>
          DEMO
        </span>
        <span>
          Simulation Environment — All people, cases, and data shown are fictional.
        </span>
      </div>

      {/* Main Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px'
        }}>
          {/* Brand Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#1d4ed8',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              marginBottom: '14px',
              boxShadow: '0 4px 12px rgba(29, 78, 216, 0.35)'
            }}>
              <Shield size={24} strokeWidth={2.2} />
            </div>
            <h1 style={{
              fontSize: '1.45rem',
              fontWeight: 700,
              color: '#f8fafc',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em'
            }}>
              Sign in to CrimeNet
            </h1>
            <p style={{
              fontSize: '0.86rem',
              color: '#94a3b8',
              margin: 0
            }}>
              Enter your email and password to access your account
            </p>
          </div>

          {/* Login Card */}
          <div style={{
            backgroundColor: '#111827',
            border: '1px solid #1f2937',
            borderRadius: '12px',
            padding: '28px 24px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Quick Demo Sign-in Pills */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#64748b',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Demo accounts
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '6px'
              }}>
                {DEMO_ACCOUNTS.map((acc) => {
                  const isSelected = email === acc.email;
                  return (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleSelectDemo(acc)}
                      disabled={isLoading}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: isSelected ? '#1e293b' : '#0f172a',
                        border: `1px solid ${isSelected ? '#3b82f6' : '#1e293b'}`,
                        borderRadius: '6px',
                        color: isSelected ? '#38bdf8' : '#94a3b8',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ fontWeight: 600, color: isSelected ? '#f8fafc' : '#cbd5e1' }}>
                        {acc.name}
                      </div>
                      <div style={{ fontSize: '0.66rem', color: '#64748b' }}>
                        {acc.role}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div role="alert" style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#f87171',
                padding: '10px 12px',
                borderRadius: '6px',
                fontSize: '0.80rem',
                marginBottom: '16px'
              }}>
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="login-email"
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    color: '#e2e8f0',
                    marginBottom: '6px'
                  }}
                >
                  Email address
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@crimenet.demo"
                  autoComplete="email"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    backgroundColor: '#0b0f19',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    fontSize: '0.88rem',
                    color: '#f8fafc',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#334155'}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px'
                }}>
                  <label
                    htmlFor="login-password"
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 500,
                      color: '#e2e8f0'
                    }}
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const acc = DEMO_ACCOUNTS.find(a => a.email === email) || DEMO_ACCOUNTS[0];
                      setPassword(acc.password);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#38bdf8',
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Reset to default
                  </button>
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      backgroundColor: '#0b0f19',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '10px 38px 10px 12px',
                      fontSize: '0.88rem',
                      color: '#f8fafc',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#334155'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '22px'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.80rem',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>Remember this device</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                id="authenticate-workstation-btn"
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.90rem',
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) e.currentTarget.style.backgroundColor = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) e.currentTarget.style.backgroundColor = '#2563eb';
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '16px',
        color: '#64748b',
        fontSize: '0.74rem'
      }}>
        © 2026 CrimeNet AI · Prototype Demo · Fictional Benchmark Evaluation
      </footer>
    </div>
  );
}
