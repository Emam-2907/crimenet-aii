import React, { useState } from 'react';
import { useCIRA } from '../context/CIRAContext.jsx';
import { api } from '../services/api.js';

const CASE_TYPES = [
  'Organized Syndicate',
  'Cyber Warfare',
  'Financial Fraud',
  'Narcotics Trafficking',
  'Avionics / Arms Smuggling',
  'Counter-Terrorism',
  'Public Corruption',
  'Identity Theft'
];

const PRIORITIES = [
  { value: 'Critical', label: 'CRITICAL — Immediate Dispatch' },
  { value: 'High',     label: 'HIGH — Accelerated Investigation' },
  { value: 'Medium',   label: 'MEDIUM — Standard Operations' },
  { value: 'Low',      label: 'LOW — Passive Monitoring' }
];

export default function CreateCaseModal({ isOpen, onClose }) {
  const { refreshCases, openCaseWorkspace } = useCIRA();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [caseType, setCaseType] = useState('Organized Syndicate');
  const [priority, setPriority] = useState('High');
  const [investigator, setInvestigator] = useState('Special Agent Marcus Vance');
  const [referenceNo, setReferenceNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tagsInput, setTagsInput] = useState('Port Security, Intercept, Cross-Border');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Case title is mandatory.');
      return;
    }
    if (!investigator.trim()) {
      setError('Assigned investigator is mandatory.');
      return;
    }

    setLoading(true);
    setError('');

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      case_type: caseType,
      priority,
      investigator: investigator.trim(),
      reference_no: referenceNo.trim() || `REF-FED-${Math.floor(1000 + Math.random() * 9000)}`,
      date: `${date} 08:00 UTC`,
      tags
    };

    try {
      const created = await api.createCase(payload);
      await refreshCases();
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      // Immediately open new case workspace
      openCaseWorkspace(created);
    } catch (err) {
      console.error('Failed to create case', err);
      setError('Backend error creating case docket. Please verify input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(3, 5, 8, 0.82)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        width: '100%', maxWidth: '640px',
        background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
        borderRadius: '8px', overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border-default)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--bg-elevated)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="status-indicator status-active" />
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Open New Investigation Docket
              </h3>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
              Initialize authenticated case file in accordance with Chain of Custody protocols.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              fontSize: '1.1rem', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '75vh', overflowY: 'auto' }}>
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: '6px',
              background: 'var(--danger-dim)', border: '1px solid var(--danger-border)',
              color: 'var(--danger)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span>⚠</span> {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              CASE TITLE <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Organized Network Infiltration (Harbor Gate 4)"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{
                width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)', borderRadius: '6px',
                color: 'var(--text-primary)', fontSize: '0.84rem', outline: 'none'
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
            />
          </div>

          {/* Type & Priority row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                INVESTIGATION TYPE <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <select
                value={caseType}
                onChange={e => setCaseType(e.target.value)}
                style={{
                  width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)', borderRadius: '6px',
                  color: 'var(--text-primary)', fontSize: '0.80rem', outline: 'none'
                }}
              >
                {CASE_TYPES.map(t => <option key={t} value={t} style={{ background: 'var(--bg-surface)' }}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                PRIORITY LEVEL <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                style={{
                  width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)', borderRadius: '6px',
                  color: 'var(--text-primary)', fontSize: '0.80rem', outline: 'none'
                }}
              >
                {PRIORITIES.map(p => <option key={p.value} value={p.value} style={{ background: 'var(--bg-surface)' }}>{p.label}</option>)}
              </select>
            </div>
          </div>

          {/* Investigator & Reference No */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                ASSIGNED INVESTIGATOR <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={investigator}
                onChange={e => setInvestigator(e.target.value)}
                style={{
                  width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)', borderRadius: '6px',
                  color: 'var(--text-primary)', fontSize: '0.80rem', outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                REFERENCE NUMBER / DOCKET ID
              </label>
              <input
                type="text"
                placeholder="e.g. DOJ-FED-8841-B"
                value={referenceNo}
                onChange={e => setReferenceNo(e.target.value)}
                style={{
                  width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)', borderRadius: '6px',
                  color: 'var(--text-primary)', fontSize: '0.80rem', outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Date & Tags */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                INCIDENT DATE <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{
                  width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)', borderRadius: '6px',
                  color: 'var(--text-primary)', fontSize: '0.80rem', outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                OPERATIONAL TAGS (COMMA-SEPARATED)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="Port Security, Intercept, Wiretap"
                style={{
                  width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)', borderRadius: '6px',
                  color: 'var(--text-primary)', fontSize: '0.80rem', outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              EXECUTIVE CASE SUMMARY & SCOPE
            </label>
            <textarea
              rows={3}
              placeholder="State initial intelligence indicators, suspected syndicates, target contraband, and authorized jurisdiction..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{
                width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)', borderRadius: '6px',
                color: 'var(--text-primary)', fontSize: '0.80rem', outline: 'none', resize: 'vertical'
              }}
            />
          </div>

          {/* Environmental Disclosure */}
          <div style={{
            padding: '8px 12px', background: 'var(--bg-elevated)',
            borderRadius: '4px', border: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              NOTICE: Use authorized investigation data only. All files staged in compliance with federal evidence logging standards.
            </span>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.78rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.78rem' }}
            >
              {loading ? 'Initializing Docket...' : '+ Create Case Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
