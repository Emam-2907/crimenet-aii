import React, { useState } from 'react';
import { PRICING_TIERS } from '../data/mockData.js';
import { soundFx } from '../utils/audio.js';

export default function Pricing({ onOpenContact }) {
  const [isAnnual, setIsAnnual] = useState(true);

  const handleToggleBilling = () => {
    soundFx.playTacticalClick();
    setIsAnnual(!isAnnual);
  };

  return (
    <section id="pricing" style={{ padding: '90px 0', position: 'relative' }}>
      <div className="container">
        {/* Section Heading */}
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 48px auto' }}>
          <div className="badge badge-cyan" style={{ marginBottom: '12px' }}>
            AGENCY DEPLOYMENT OPTIONS
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '16px' }}>
            Predictable Tiers for Municipal to Sovereign Missions
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
            Transparent procurement models compliant with public safety budgetary cycles and federal grant programs (BJA / Byrne JAG / COPS).
          </p>

          {/* Billing Toggle Switch */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '6px 16px',
            borderRadius: '30px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginTop: '24px'
          }}>
            <span style={{
              fontSize: '0.82rem',
              color: !isAnnual ? '#fff' : 'var(--text-muted)',
              fontWeight: !isAnnual ? 700 : 400,
              cursor: 'pointer'
            }} onClick={() => setIsAnnual(false)}>
              Monthly Billing
            </span>

            <button
              onClick={handleToggleBilling}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '12px',
                background: 'rgba(0, 240, 255, 0.2)',
                border: '1px solid var(--cyan-primary)',
                position: 'relative',
                cursor: 'pointer',
                padding: '2px'
              }}
            >
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'var(--cyan-primary)',
                transform: isAnnual ? 'translateX(20px)' : 'translateX(0)',
                transition: 'transform 0.2s ease',
                boxShadow: '0 0 8px var(--cyan-glow)'
              }} />
            </button>

            <span style={{
              fontSize: '0.82rem',
              color: isAnnual ? '#fff' : 'var(--text-muted)',
              fontWeight: isAnnual ? 700 : 400,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }} onClick={() => setIsAnnual(true)}>
              <span>Annual Contract</span>
              <span className="badge badge-safe" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>SAVE 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          alignItems: 'stretch'
        }}>
          {PRICING_TIERS.map((tier, i) => {
            const price = typeof tier.monthlyPrice === 'number'
              ? (isAnnual ? tier.annualPrice : tier.monthlyPrice)
              : tier.monthlyPrice;

            return (
              <div
                key={i}
                className={`glass-card ${tier.popular ? 'corner-brackets' : ''}`}
                style={{
                  padding: '36px 30px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  border: tier.popular ? '2px solid var(--cyan-primary)' : '1px solid var(--border-glass)',
                  boxShadow: tier.popular ? '0 0 30px rgba(0, 240, 255, 0.2)' : 'none',
                  background: tier.popular ? 'rgba(15, 26, 48, 0.85)' : 'var(--bg-card)'
                }}
              >
                {tier.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #00f0ff, #0099ff)',
                    color: '#000',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 14px',
                    borderRadius: '20px',
                    fontFamily: 'var(--font-mono)',
                    boxShadow: '0 0 12px var(--cyan-glow)'
                  }}>
                    MOST DEPLOYED BY STATE POLICE
                  </div>
                )}

                <div>
                  <div style={{
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--cyan-primary)',
                    marginBottom: '8px'
                  }}>
                    {tier.badge}
                  </div>

                  <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '14px' }}>
                    {tier.name}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '24px' }}>
                    {typeof price === 'number' ? (
                      <>
                        <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>
                          ${price.toLocaleString()}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/ month</span>
                      </>
                    ) : (
                      <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>
                        {price}
                      </span>
                    )}
                  </div>

                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '0 0 32px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {tier.features.map((feat, fIdx) => (
                      <li key={fIdx} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        fontSize: '0.86rem',
                        color: 'var(--text-secondary)'
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00ff9d" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px' }}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    soundFx.playSuccessChime();
                    if (onOpenContact) onOpenContact(tier.name);
                  }}
                  className={tier.popular ? "btn-primary" : "btn-secondary"}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <span>{tier.cta}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
