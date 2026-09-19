import React from 'react';

export default function Features() {
  const features = [
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polygon points="12 6 12 12 16 14" />
        </svg>
      ),
      tag: "SUB-SECOND EDGE INTERCEPT",
      title: "Autonomous Multi-Modal Threat Detection",
      desc: "Process thousands of simultaneous camera, acoustic gunshot, and thermal sensor streams at the edge with sub-15ms neural latency. Automatically isolate high-velocity anomalous patterns without human fatigue.",
      metrics: "12.4ms avg. neural inference speed"
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff2a5f" strokeWidth="2">
          <path d="M18 20V10" />
          <path d="M12 20V4" />
          <path d="M6 20v-6" />
        </svg>
      ),
      tag: "PREDICTIVE INTELLIGENCE",
      title: "Spatio-Temporal Crime Forecaster",
      desc: "Dynamic Graph Neural Networks ingest historical arrest records, weather parameters, pedestrian density, and socio-economic indicators to forecast crime hotspot probability windows with 94.8% accuracy.",
      metrics: "72-hour predictive risk probability curves"
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00ff9d" strokeWidth="2">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      ),
      tag: "INTER-AGENCY SYNDICATE MESH",
      title: "Federated Cross-Jurisdictional Intelligence",
      desc: "Connect municipal police departments, state troopers, and federal agencies seamlessly. Federated learning models share threat signatures and suspect vectors without exposing raw sovereign citizen databases.",
      metrics: "Zero raw PII exposure • Differential Privacy"
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      tag: "COURT-ADMISSIBLE INTEGRITY",
      title: "Quantum-Safe Cryptographic Evidence Vault",
      desc: "Every biometric hit, license plate reading, and dispatch order is cryptographically signed with NIST-approved post-quantum algorithms, creating an indisputable chain of custody for federal judicial prosecution.",
      metrics: "Immutable SHA-512 & Dilithium signature tree"
    }
  ];

  return (
    <section id="capabilities" style={{
      padding: '90px 0',
      background: 'rgba(7, 10, 18, 0.7)',
      borderTop: '1px solid rgba(0, 240, 255, 0.08)',
      borderBottom: '1px solid rgba(0, 240, 255, 0.08)'
    }}>
      <div className="container">
        {/* Section Heading */}
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 60px auto' }}>
          <div className="badge badge-cyan" style={{ marginBottom: '12px' }}>
            TACTICAL ARCHITECTURE & CAPABILITIES
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '16px' }}>
            Built for High-Stakes Public Safety & Cyber Defense
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Engineered specifically to solve the data fragmentation, cognitive overload, and latency bottlenecks of modern law enforcement command centers.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {features.map((f, i) => (
            <div
              key={i}
              className="glass-card corner-brackets"
              style={{
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'var(--trans-smooth)'
              }}
            >
              <div>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                }}>
                  {f.icon}
                </div>

                <div style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--cyan-primary)',
                  letterSpacing: '0.08em',
                  marginBottom: '8px'
                }}>
                  {f.tag}
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: '#fff' }}>
                  {f.title}
                </h3>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                  {f.desc}
                </p>
              </div>

              <div style={{
                paddingTop: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--emerald-safe)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span className="pulse-dot pulse-dot-emerald" style={{ width: '5px', height: '5px' }}></span>
                <span>{f.metrics}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
