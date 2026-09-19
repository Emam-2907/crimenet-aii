import React from 'react';

export default function Compliance() {
  const securityBadges = [
    { name: "FBI CJIS Level 4", desc: "Full compliance with FBI Criminal Justice Information Services security policy" },
    { name: "SOC 2 Type II", desc: "Rigorous annual 3rd party audit of security, availability, and confidentiality" },
    { name: "FedRAMP High", desc: "Meets stringent federal security controls for government mission-critical clouds" },
    { name: "Constitutional Privacy Guard", desc: "Autonomous facial blurring of non-suspect bystanders and automated expungement" }
  ];

  return (
    <section style={{
      padding: '70px 0',
      background: 'rgba(5, 8, 15, 0.95)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px'
        }}>
          {securityBadges.map((badge, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{
                padding: '24px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                borderColor: 'rgba(255, 255, 255, 0.05)'
              }}
            >
              <div style={{
                color: 'var(--cyan-primary)',
                background: 'rgba(0, 240, 255, 0.1)',
                padding: '10px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '4px' }}>
                  {badge.name}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                  {badge.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
