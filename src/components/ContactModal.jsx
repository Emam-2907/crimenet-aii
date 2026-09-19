import React, { useState } from 'react';
import { soundFx } from '../utils/audio.js';

export default function ContactModal({ tierName, onClose }) {
  const [formData, setFormData] = useState({
    agencyName: '',
    contactName: '',
    badgeNumber: '',
    email: '',
    sensorCount: '250-1000 sensors',
    jurisdiction: 'Municipal Police Department'
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    soundFx.playSuccessChime();
    setSubmitted(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="panel-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '100%',
          padding: '28px',
          position: 'relative',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <button
          onClick={() => {
            soundFx.playTacticalClick();
            onClose();
          }}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-muted)',
            width: '30px',
            height: '30px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ✕
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 10px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'var(--success-dim)',
              border: '1px solid var(--success-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 600 }}>
              Briefing Request Authenticated
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '20px' }}>
              Your clearance request has been routed to our Federal Public Safety Taskforce. A dedicated technical director will reach out within 2 business hours via secure channels.
            </p>
            <button onClick={onClose} className="btn-primary" style={{ margin: '0 auto', fontSize: '0.80rem', padding: '8px 20px' }}>
              Return to Console
            </button>
          </div>
        ) : (
          <div>
            <div className="badge badge-info" style={{ marginBottom: '8px' }}>
              RESTRICTED PUBLIC SAFETY INTAKE
            </div>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '4px', fontWeight: 600 }}>
              Request Agency Briefing
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '20px' }}>
              Selected Deployment: <strong style={{ color: 'var(--accent-hover)' }}>{tierName || "Custom Sovereign Cloud"}</strong>
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  AGENCY OR ENTERPRISE NAME
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Metro Police Department / Port Authority"
                  value={formData.agencyName}
                  onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '6px',
                    padding: '9px 12px',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    AUTHORIZED OFFICER
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Commander / Director"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '6px',
                      padding: '9px 12px',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    GOV / ENTERPRISE EMAIL
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="name@agency.gov"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '6px',
                      padding: '9px 12px',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  ESTIMATED CAMERA / SENSOR FEEDS
                </label>
                <select
                  value={formData.sensorCount}
                  onChange={(e) => setFormData({ ...formData, sensorCount: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '6px',
                    padding: '9px 12px',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                >
                  <option>Under 100 sensors (Pilot Grid)</option>
                  <option>100 - 500 sensors (Municipal Patrol)</option>
                  <option>500 - 2,500 sensors (Regional Matrix)</option>
                  <option>2,500+ sensors (State / Federal Command)</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '8px', fontSize: '0.80rem', padding: '9px 16px' }}
              >
                Submit Encrypted Briefing Request
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
