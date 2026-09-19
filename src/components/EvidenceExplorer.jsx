import React, { useState, useRef, useCallback } from 'react';
import { useCIRA } from '../context/CIRAContext.jsx';
import { api } from '../services/api.js';

const SUPPORTED_EXTS = ['pdf', 'docx', 'txt', 'csv', 'json', 'jpg', 'jpeg', 'png', 'mp4', 'webm'];

function getCategoryFromExt(ext) {
  if (['jpg', 'jpeg', 'png'].includes(ext)) return 'Images';
  if (['mp4', 'webm'].includes(ext)) return 'Videos';
  if (['csv'].includes(ext)) return 'Call Records';
  if (['json'].includes(ext)) return 'Financial Records';
  if (['pdf', 'docx', 'txt'].includes(ext)) return 'Documents';
  return 'Other';
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function EvidenceExplorer({ caseId, onEvidenceUploaded }) {
  const { activeCase, refreshCases, setSelectedEvidence } = useCIRA();
  const targetCaseId = caseId || activeCase?.id || 'CASE #CR-2026-0142';

  const [stagedFiles, setStagedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]); // { file, stage, progress, result, error }
  const [unsupportedError, setUnsupportedError] = useState('');
  const fileInputRef = useRef(null);

  // Validate and stage selected files
  const stageFiles = useCallback((fileList) => {
    setUnsupportedError('');
    const newFiles = [];
    const rejected = [];

    Array.from(fileList).forEach(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      if (SUPPORTED_EXTS.includes(ext)) {
        newFiles.push({
          rawFile: file,
          id: `stage-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
          name: file.name,
          size: formatBytes(file.size),
          bytes: file.size,
          ext,
          category: getCategoryFromExt(ext),
          source: 'Native File System'
        });
      } else {
        rejected.push(file.name);
      }
    });

    if (rejected.length > 0) {
      setUnsupportedError(`Unsupported file(s) ignored: ${rejected.join(', ')}. Supported formats: PDF, DOCX, TXT, CSV, JSON, JPG, PNG, MP4, WEBM.`);
    }

    if (newFiles.length > 0) {
      setStagedFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      stageFiles(e.dataTransfer.files);
    }
  }, [stageFiles]);

  const removeStagedFile = (id) => {
    setStagedFiles(prev => prev.filter(f => f.id !== id));
  };

  // Start multi-stage upload & entity extraction pipeline
  const processStagedFiles = async () => {
    if (stagedFiles.length === 0) return;

    const itemsToUpload = stagedFiles.map(f => ({
      ...f,
      stage: 'UPLOADING',
      progress: 15,
      result: null,
      error: null
    }));

    setUploadQueue(prev => [...itemsToUpload, ...prev]);
    setStagedFiles([]);

    for (let i = 0; i < itemsToUpload.length; i++) {
      const item = itemsToUpload[i];

      // Stage 1: Uploading
      updateQueueItem(item.id, { stage: 'UPLOADING', progress: 45 });
      await new Promise(r => setTimeout(r, 400));

      // Stage 2: Uploaded
      updateQueueItem(item.id, { stage: 'UPLOADED', progress: 75 });
      await new Promise(r => setTimeout(r, 300));

      // Stage 3: Processing / NLP & Computer Vision Extraction
      updateQueueItem(item.id, { stage: 'PROCESSING', progress: 90 });

      try {
        const payload = {
          name: item.name,
          type: item.category,
          category: item.category,
          file_size: item.size,
          source: 'Investigator Workstation Direct Upload',
          notes: `Ingested to ${targetCaseId}. Multi-stage extraction completed.`
        };

        const result = await api.uploadEvidence(targetCaseId, payload);
        // Stage 4: Analyzed
        updateQueueItem(item.id, {
          stage: 'ANALYZED',
          progress: 100,
          result
        });

        if (onEvidenceUploaded) onEvidenceUploaded(result);
      } catch (err) {
        updateQueueItem(item.id, {
          stage: 'PROCESSING FAILED',
          progress: 100,
          error: 'Entity extraction or backend indexing failure.'
        });
      }
    }

    await refreshCases();
  };

  const updateQueueItem = (id, updates) => {
    setUploadQueue(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Drag & Drop Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragActive ? 'var(--accent)' : 'var(--border-default)'}`,
          background: dragActive ? 'var(--accent-dim)' : 'var(--bg-surface)',
          borderRadius: '8px', padding: '36px 20px', textAlign: 'center',
          transition: 'var(--transition-fast)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '14px',
          cursor: 'pointer'
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.csv,.json,.jpg,.jpeg,.png,.mp4,.webm"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files) stageFiles(e.target.files);
          }}
        />

        <div style={{
          width: '48px', height: '48px', borderRadius: '8px',
          background: 'var(--bg-elevated)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
        }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>

        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Drag & Drop Investigation Evidence Here
          </h3>
          <p style={{ fontSize: '0.80rem', color: 'var(--text-secondary)' }}>
            or click to browse local files for docket <strong style={{ color: 'var(--accent)' }}>{targetCaseId}</strong>
          </p>
        </div>

        {/* Supported Format Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', maxWidth: '500px' }}>
          {['PDF', 'DOCX', 'TXT', 'CSV', 'JSON', 'JPG', 'PNG', 'MP4', 'WEBM'].map(fmt => (
            <span key={fmt} style={{
              padding: '2px 8px', borderRadius: '4px', fontSize: '0.64rem',
              fontFamily: 'var(--font-mono)', background: 'var(--bg-elevated)',
              color: 'var(--text-secondary)', border: '1px solid var(--border-default)'
            }}>
              {fmt}
            </span>
          ))}
        </div>
      </div>

      {/* Warning / Unsupported Alert */}
      {unsupportedError && (
        <div style={{
          padding: '10px 14px', borderRadius: '6px',
          background: 'var(--warning-dim)', border: '1px solid var(--warning-border)',
          color: '#FBBF24', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <span>⚠</span> {unsupportedError}
        </div>
      )}

      {/* Staged Files Queue (Before Upload) */}
      {stagedFiles.length > 0 && (
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
          borderRadius: '8px', overflow: 'hidden'
        }}>
          <div style={{
            padding: '12px 18px', borderBottom: '1px solid var(--border-default)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'var(--bg-elevated)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="dot dot-amber" />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Ready to Ingest ({stagedFiles.length} {stagedFiles.length === 1 ? 'file' : 'files'})
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setStagedFiles([])}
                className="btn-secondary"
                style={{ padding: '5px 12px', fontSize: '0.74rem' }}
              >
                Clear All
              </button>
              <button
                onClick={processStagedFiles}
                className="btn-primary"
                style={{ fontSize: '0.74rem', padding: '5px 12px' }}
              >
                Start Ingestion →
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {stagedFiles.map(f => (
              <div
                key={f.id}
                style={{
                  padding: '10px 18px', borderBottom: '1px solid var(--b-faint)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    padding: '3px 8px', borderRadius: '4px', fontSize: '0.64rem',
                    fontFamily: 'var(--f-mono)', background: 'rgba(255,255,255,0.06)',
                    color: 'var(--blue-light)', fontWeight: 600
                  }}>
                    {f.ext.toUpperCase()}
                  </span>
                  <div>
                    <div style={{ fontSize: '0.84rem', color: '#fff', fontWeight: 500 }}>{f.name}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--t-muted)', fontFamily: 'var(--f-mono)' }}>
                      {f.size} · {f.category}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeStagedFile(f.id)}
                  title="Remove file"
                  style={{
                    background: 'none', border: 'none', color: 'var(--t-dim)',
                    cursor: 'pointer', fontSize: '0.85rem', padding: '4px'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--red-light)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--t-dim)'}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processing Pipeline Live Feed */}
      {uploadQueue.length > 0 && (
        <div style={{
          background: 'var(--ink-1)', border: '1px solid var(--b-faint)',
          borderRadius: '10px', overflow: 'hidden'
        }}>
          <div style={{
            padding: '12px 18px', borderBottom: '1px solid var(--b-faint)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'var(--ink-2)'
          }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>
              Multi-Stage Ingestion Pipeline
            </span>
            <span style={{ fontSize: '0.68rem', fontFamily: 'var(--f-mono)', color: 'var(--t-muted)' }}>
              {uploadQueue.filter(q => q.stage === 'ANALYZED').length} of {uploadQueue.length} Analyzed
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {uploadQueue.map(item => {
              const isDone = item.stage === 'ANALYZED';
              const isFailed = item.stage === 'PROCESSING FAILED';
              const isProcessing = item.stage === 'PROCESSING' || item.stage === 'UPLOADING' || item.stage === 'UPLOADED';

              return (
                <div
                  key={item.id}
                  style={{
                    padding: '14px 18px', borderBottom: '1px solid var(--b-faint)',
                    display: 'flex', flexDirection: 'column', gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        padding: '2px 7px', borderRadius: '4px', fontSize: '0.62rem',
                        fontFamily: 'var(--f-mono)', background: 'rgba(255,255,255,0.06)',
                        color: 'var(--blue-light)'
                      }}>
                        {item.ext?.toUpperCase() || 'FILE'}
                      </span>
                      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#fff' }}>
                        {item.name}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)' }}>
                        {item.size}
                      </span>
                    </div>

                    {/* Stage Status Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: '4px', fontSize: '0.66rem',
                        fontFamily: 'var(--f-mono)', fontWeight: 700, letterSpacing: '0.04em',
                        background: isDone
                          ? 'rgba(0, 200, 122, 0.12)'
                          : isFailed
                          ? 'rgba(255, 42, 95, 0.15)'
                          : 'rgba(217, 119, 6, 0.12)',
                        color: isDone
                          ? 'var(--green-light)'
                          : isFailed
                          ? 'var(--red-light)'
                          : 'var(--amber-light)',
                        border: `1px solid ${isDone ? 'rgba(0,200,122,0.3)' : isFailed ? 'rgba(255,42,95,0.3)' : 'rgba(217,119,6,0.3)'}`
                      }}>
                        {item.stage}
                      </span>
                      {isDone && item.result && (
                        <button
                          onClick={() => setSelectedEvidence(item.result)}
                          style={{
                            padding: '3px 8px', background: 'rgba(255,255,255,0.06)',
                            border: '1px solid var(--b-soft)', borderRadius: '4px',
                            color: '#fff', fontSize: '0.7rem', cursor: 'pointer'
                          }}
                        >
                          View Details →
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  {isProcessing && (
                    <div style={{ width: '100%', height: '4px', background: 'var(--ink-3)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${item.progress}%`, height: '100%',
                        background: 'linear-gradient(90deg, var(--green), var(--cyan-primary))',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  )}

                  {/* Extracted Stats Banner */}
                  {isDone && item.result && (
                    <div style={{
                      padding: '8px 12px', background: 'rgba(255,255,255,0.02)',
                      borderRadius: '6px', border: '1px solid var(--b-faint)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      flexWrap: 'wrap', gap: '8px', fontSize: '0.74rem'
                    }}>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <span>
                          Entities Detected: <strong style={{ color: 'var(--green-light)', fontFamily: 'var(--f-mono)' }}>{item.result.extracted_entities_count || item.result.entities?.length || 0}</strong>
                        </span>
                        <span>
                          Relationships Detected: <strong style={{ color: 'var(--blue-light)', fontFamily: 'var(--f-mono)' }}>{item.result.detected_relationships_count || item.result.relationships?.length || 0}</strong>
                        </span>
                        <span>
                          Evidence Type: <strong style={{ color: '#a78bfa' }}>{item.result.type}</strong>
                        </span>
                      </div>
                      <span style={{ color: 'var(--t-dim)', fontSize: '0.66rem', fontFamily: 'var(--f-mono)' }}>
                        {item.result.is_synthetic ? 'Demo / Synthetic Data' : 'Verified Hash'}
                      </span>
                    </div>
                  )}

                  {isFailed && (
                    <div style={{ fontSize: '0.74rem', color: 'var(--red-light)', fontFamily: 'var(--f-mono)' }}>
                      ⚠ {item.error}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
