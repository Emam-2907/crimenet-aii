import React, { useState } from 'react';
import { api } from '../services/api.js';
import { soundFx } from '../utils/audio.js';
import {
  Brain, FileText, Cpu, AlertTriangle, ShieldCheck,
  Zap, ArrowRight, CheckCircle, Clock, Sparkles
} from 'lucide-react';

const DEFAULT_SAMPLE_TRANSCRIPT = `INTERCEPT AUDIO WIRE - TRANSCRIPT #8821
RECORDED: 2026-09-18 03:15:22 UTC
SOURCE: Port Customs Microwave Tap (Sector 4)

SPEAKER 1: (Audio matches voiceprint of Viktor Voronin):
"Listen closely. The container with the cryptographic hardware is passing through Gate 4 at 04:30 sharp. Have Darius bring the black Escalade with plate 8B9-CYP. If Metro Tactical shows up, Elena has already routed 140 Tether to the offshore escrow wallet 0x889...F1C to clear the harbormaster. Meet at Warehouse 14B near the South Pier."

SPEAKER 2:
"Understood. Kane is already setting up the 868MHz signal jammers so their drones can't get an aerial lock. The cash drop is locked in."`;

export default function ExplainableLeads() {
  const [transcriptText, setTranscriptText] = useState(DEFAULT_SAMPLE_TRANSCRIPT);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [leadsData, setLeadsData] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [apiError, setApiError] = useState('');

  const handleRunNLP = async () => {
    const text = transcriptText?.trim();
    if (!text || text.length < 5) {
      setValidationError('Please provide a valid intercept transcript or evidentiary note (minimum 5 characters) for NLP extraction.');
      if (soundFx.playAlertBeep) soundFx.playAlertBeep();
      return;
    }
    setValidationError('');
    setApiError('');
    setIsExtracting(true);
    soundFx.playScanSweep();

    try {
      const res = await api.extractEntities(text, 'Custom Intercept');
      if (res && res.entities) {
        setExtractedData(res);
        soundFx.playSuccessChime();
      } else {
        setApiError('NLP engine did not extract any entities from the provided transcript.');
        if (soundFx.playAlertBeep) soundFx.playAlertBeep();
      }
    } catch (err) {
      console.error('NLP entity extraction failed:', err);
      setApiError(err.message || 'Entity extraction failed. Check backend connection and clearance.');
      if (soundFx.playAlertBeep) soundFx.playAlertBeep();
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSynthesizeLeads = async () => {
    const text = transcriptText?.trim();
    if (!text || text.length < 5) {
      setValidationError('Please provide a valid intercept transcript or evidentiary note (minimum 5 characters) for lead generation.');
      if (soundFx.playAlertBeep) soundFx.playAlertBeep();
      return;
    }
    setValidationError('');
    setApiError('');
    setIsSynthesizing(true);
    soundFx.playScanSweep();

    try {
      const res = await api.generateLeads(text, 'Custom Intercept');
      if (res && res.leads && res.leads.length > 0) {
        setLeadsData(res.leads);
        soundFx.playSuccessChime();
      } else {
        setApiError('Lead generation engine returned no corroborated hypotheses for this input.');
        if (soundFx.playAlertBeep) soundFx.playAlertBeep();
      }
    } catch (err) {
      console.error('Lead synthesis failed:', err);
      setApiError(err.message || 'Failed to generate corroborated leads from backend.');
      if (soundFx.playAlertBeep) soundFx.playAlertBeep();
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div className="panel-card" style={{
        padding: '18px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        borderLeft: '4px solid var(--accent)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-active">EVIDENCE INTELLIGENCE SYNTHESIS</span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              CORROBORATED INVESTIGATIVE LEADS
            </span>
          </div>
          <h3 style={{ margin: '6px 0 2px 0', fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            Unstructured Intercept Analysis & Evidentiary Leads
          </h3>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Parse transcripts, audio wiretaps, and field notes into verified entities with transparent, cross-referenced investigative leads.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setTranscriptText(DEFAULT_SAMPLE_TRANSCRIPT)}
            className="btn-secondary"
            style={{ fontSize: '0.78rem' }}
          >
            <FileText size={14} /> Load Intercept Wiretap
          </button>
        </div>
      </div>

      {/* Ingestion & Extraction Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        alignItems: 'stretch'
      }}>
        {/* Left: Raw Transcript Ingestion Area */}
        <div className="panel-card" style={{
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'var(--bg-surface)'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                RAW INPUT: INTERCEPT WIRE / POLICE WITNESS TRANSCRIPT
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--cyan-primary)', fontFamily: 'var(--font-mono)' }}>
                {transcriptText.length} CHARS
              </span>
            </div>

            <textarea
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              rows={12}
              style={{
                width: '100%',
                background: '#040711',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#e2e8f0',
                padding: '12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                lineHeight: 1.5,
                resize: 'vertical'
              }}
              placeholder="Paste raw interrogation notes, telephone wiretap transcripts, or undercover surveillance logs here..."
            />

            {validationError && (
              <div role="alert" style={{
                marginTop: '8px',
                padding: '8px 12px',
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '6px',
                color: '#fbbf24',
                fontSize: '0.76rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                <span>{validationError}</span>
              </div>
            )}

            {apiError && (
              <div role="alert" style={{
                marginTop: '8px',
                padding: '8px 12px',
                background: 'var(--critical-dim)',
                border: '1px solid var(--critical-border)',
                color: 'var(--critical)',
                fontSize: '0.76rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                <span>{apiError}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
            <button
              onClick={handleRunNLP}
              disabled={isExtracting}
              className="btn-ghost"
              style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem' }}
            >
              <Cpu size={15} />
              {isExtracting ? 'Extracting Entities...' : 'Run NLP Extraction'}
            </button>
            <button
              onClick={handleSynthesizeLeads}
              disabled={isSynthesizing}
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem' }}
            >
              <Brain size={15} />
              {isSynthesizing ? 'Synthesizing Leads...' : 'Generate Explainable Leads'}
            </button>
          </div>
        </div>

        {/* Right: Extracted Entities Breakdown */}
        <div className="panel-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'var(--bg-surface)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                CORROBORATED ENTITIES & ATTRIBUTES
              </span>
              {extractedData && (
                <span className="badge badge-active">
                  CONFIDENCE: {Math.round(extractedData.confidence * 100)}%
                </span>
              )}
            </div>

            {extractedData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Suspects */}
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                    PERSONS OF INTEREST IDENTIFIED:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {extractedData.entities.suspects.map((s, idx) => (
                      <span key={idx} className="badge badge-critical" style={{ fontSize: '0.75rem' }}>
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Locations */}
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                    LOCATIONS & ASSETS:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {extractedData.entities.locations.map((l, idx) => (
                      <span key={idx} className="badge badge-warning" style={{ fontSize: '0.75rem' }}>
                        {l.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Vehicles */}
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                    TRANSIT VEHICLES & PLATES:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {extractedData.entities.vehicles.map((v, idx) => (
                      <span key={idx} className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', fontSize: '0.75rem' }}>
                        {v.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Financial */}
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                    FINANCIAL ESCROW & ARTIFACTS:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {extractedData.entities.financial.map((f, idx) => (
                      <span key={idx} className="badge badge-active" style={{ fontSize: '0.75rem' }}>
                        {f.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Technical */}
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                    RF & TECHNICAL TELEMETRY:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {extractedData.entities.technical_signatures.map((t, idx) => (
                      <span key={idx} className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--accent-hover)', border: '1px solid var(--border-default)', fontSize: '0.75rem' }}>
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--text-secondary)',
                fontSize: '0.84rem'
              }}>
                Click <strong>"Run NLP Extraction"</strong> to parse persons, license plates, locations, and escrow tokens from the wiretap.
              </div>
            )}
          </div>

          <div style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-default)'
          }}>
            NATURAL LANGUAGE ENTITY RESOLUTION // NER Pipeline
          </div>
        </div>
      </div>

      {/* Synthesized Explainable Leads Section */}
      {leadsData && (
        <div className="panel-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={18} color="var(--accent)" />
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                Corroborated Actionable Leads & Evidentiary Rationale
              </h3>
            </div>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {leadsData.length} PRIORITIZED THREAT HYPOTHESES
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
            {leadsData.map((lead) => (
              <div
                key={lead.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: lead.threat_severity === 'CRITICAL' ? '1px solid var(--danger-border)' : '1px solid var(--border-default)',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className={`badge ${lead.threat_severity === 'CRITICAL' ? 'badge-critical' : 'badge-warning'}`}>
                      {lead.threat_severity} • {lead.urgency}
                    </span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-hover)', fontFamily: 'var(--font-mono)' }}>
                      CONF: {Math.round(lead.confidence * 100)}%
                    </span>
                  </div>

                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.98rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {lead.title}
                  </h4>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginBottom: '10px' }}>
                    TARGET: {lead.primary_subject}
                  </div>

                  {/* Hypothesis */}
                  <div style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    fontSize: '0.80rem',
                    color: 'var(--text-primary)',
                    marginBottom: '10px',
                    lineHeight: 1.45
                  }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Hypothesis:</strong> {lead.hypothesis}
                  </div>

                  {/* Explainable Rationale */}
                  <div style={{
                    background: 'var(--accent-subtle)',
                    border: '1px solid var(--accent-border)',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '12px',
                    lineHeight: 1.45
                  }}>
                    <strong style={{ color: 'var(--accent-hover)' }}>Investigative Rationale:</strong> {lead.rationale}
                  </div>

                  {/* Actions */}
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                      RECOMMENDED TACTICAL ACTIONS:
                    </div>
                    <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {lead.suggested_actions.map((act, aIdx) => (
                        <li key={aIdx} style={{ marginBottom: '4px' }}>{act}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid var(--border-default)' }}>
                  <button
                    onClick={() => soundFx.playSuccessChime()}
                    className="btn-primary"
                    style={{ fontSize: '0.76rem', padding: '6px 14px' }}
                  >
                    Dispatch Directives to Field Units
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
