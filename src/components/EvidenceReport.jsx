import React, { useState, useRef, useCallback } from 'react';

const EVIDENCE = [
  { id: 'EV-001', type: 'VIDEO',     desc: 'CCTV Frame 04:18 — Terminal C Harbor Gate',   case: 'OP-SOVEREIGN', date: 'Sep 18, 2026', status: 'VERIFIED',  size: '2.4 MB' },
  { id: 'EV-002', type: 'FINANCIAL', desc: 'Crypto Wallet Trace — 0x889...F1C Ledger',    case: 'OP-SOVEREIGN', date: 'Sep 18, 2026', status: 'VERIFIED',  size: '48 KB'  },
  { id: 'EV-003', type: 'INTERCEPT', desc: 'Encrypted Radio Comms — 868MHz Jammer Log',   case: 'OP-SOVEREIGN', date: 'Sep 17, 2026', status: 'PROCESSING', size: '1.1 MB' },
  { id: 'EV-004', type: 'VEHICLE',   desc: 'ALPR Hit — Plate 8B9-CYP on Hwy 101',         case: 'OP-SOVEREIGN', date: 'Sep 17, 2026', status: 'VERIFIED',  size: '220 KB' },
  { id: 'EV-005', type: 'BIOMETRIC', desc: 'ArcFace Match — Viktor Voronin (96.4%)',       case: 'OP-SOVEREIGN', date: 'Sep 17, 2026', status: 'VERIFIED',  size: '830 KB' },
  { id: 'EV-006', type: 'DOCUMENT',  desc: 'Forged Manifest — Container TXUS-2291',        case: 'OP-PHANTOM',   date: 'Sep 16, 2026', status: 'PENDING',   size: '540 KB' },
  { id: 'EV-007', type: 'IMAGE',     desc: 'Warehouse 14B Floor Plan — Recovered Drive',   case: 'OP-SOVEREIGN', date: 'Sep 16, 2026', status: 'VERIFIED',  size: '3.2 MB' },
  { id: 'EV-008', type: 'INTERCEPT', desc: 'Port Customs Microwave Tap — 03:15 UTC Log',   case: 'OP-SOVEREIGN', date: 'Sep 15, 2026', status: 'PROCESSING', size: '670 KB' },
];

const REPORTS = [
  { id: 'RPT-2026-091', title: 'OP-SOVEREIGN — Case Summary Brief',  type: 'Case Summary',     date: 'Sep 18, 2026', pages: 14, status: 'FINAL' },
  { id: 'RPT-2026-090', title: 'Warrant Application — Warehouse 14B', type: 'Legal Affidavit',  date: 'Sep 18, 2026', pages: 6,  status: 'DRAFT' },
  { id: 'RPT-2026-088', title: 'Voronin Financial Forensic Trace',    type: 'Forensic Report',  date: 'Sep 17, 2026', pages: 22, status: 'FINAL' },
  { id: 'RPT-2026-084', title: 'Phantom Rail Heist — Incident Log',   type: 'Incident Report',  date: 'Sep 16, 2026', pages: 9,  status: 'FINAL' },
];

const TYPE_COLORS = {
  VIDEO:     { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)',  border: 'rgba(167,139,250,0.25)' },
  FINANCIAL: { color: 'var(--green-light)', bg: 'var(--green-dim)', border: 'rgba(5,150,105,0.3)' },
  INTERCEPT: { color: 'var(--amber-light)', bg: 'var(--amber-dim)', border: 'rgba(217,119,6,0.3)' },
  VEHICLE:   { color: 'var(--blue-light)', bg: 'var(--blue-dim)', border: 'var(--blue-border)' },
  BIOMETRIC: { color: 'var(--red-light)',  bg: 'var(--red-dim)',  border: 'var(--red-border)' },
  DOCUMENT:  { color: 'var(--t-secondary)', bg: 'rgba(255,255,255,0.05)', border: 'var(--b-faint)' },
  IMAGE:     { color: '#f0abfc', bg: 'rgba(240,171,252,0.08)', border: 'rgba(240,171,252,0.2)' },
  PENDING:   {},
};

const STATUS_STYLE = {
  VERIFIED:   { color: 'var(--green-light)', bg: 'var(--green-dim)',  border: 'rgba(5,150,105,0.3)' },
  PROCESSING: { color: 'var(--amber-light)', bg: 'var(--amber-dim)',  border: 'rgba(217,119,6,0.3)' },
  PENDING:    { color: 'var(--t-muted)',      bg: 'rgba(255,255,255,0.04)', border: 'var(--b-faint)' },
  FINAL:      { color: 'var(--green-light)', bg: 'var(--green-dim)',  border: 'rgba(5,150,105,0.3)' },
  DRAFT:      { color: 'var(--amber-light)', bg: 'var(--amber-dim)',  border: 'rgba(217,119,6,0.3)' },
};

function TypeBadge({ type }) {
  const s = TYPE_COLORS[type] || TYPE_COLORS.DOCUMENT;
  return (
    <span style={{
      padding: '2px 8px', borderRadius: '4px', fontSize: '0.62rem',
      fontFamily: 'var(--f-mono)', fontWeight: 700, letterSpacing: '0.05em',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`
    }}>
      {type}
    </span>
  );
}
function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.PENDING;
  return (
    <span style={{
      padding: '2px 8px', borderRadius: '4px', fontSize: '0.62rem',
      fontFamily: 'var(--f-mono)', fontWeight: 700, letterSpacing: '0.05em',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`
    }}>
      {status}
    </span>
  );
}

function getTypeFromFile(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  if (['mp4','mov','avi','mkv'].includes(ext)) return 'VIDEO';
  if (['jpg','jpeg','png','bmp','webp','heic'].includes(ext)) return 'IMAGE';
  if (['pdf','doc','docx','txt','rtf'].includes(ext)) return 'DOCUMENT';
  if (['csv','xlsx','json','xml'].includes(ext)) return 'FINANCIAL';
  if (['wav','mp3','ogg','m4a'].includes(ext)) return 'INTERCEPT';
  return 'DOCUMENT';
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function EvidenceReport() {
  const [tab, setTab] = useState('evidence');
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [evidenceList, setEvidenceList] = useState(EVIDENCE);
  const [dragOver, setDragOver] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileRef = useRef(null);

  const handleFiles = useCallback((files) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const newItems = Array.from(files).map((file, i) => ({
      id: `EV-${String(evidenceList.length + i + 1).padStart(3, '0')}`,
      type: getTypeFromFile(file.name),
      desc: file.name,
      case: 'OP-SOVEREIGN',
      date: dateStr,
      status: 'PENDING',
      size: formatBytes(file.size),
    }));
    setEvidenceList(prev => [...newItems, ...prev]);
    setUploadSuccess(`${newItems.length} file${newItems.length > 1 ? 's' : ''} added to evidence log`);
    setTimeout(() => setUploadSuccess(''), 3500);
  }, [evidenceList.length]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const types = ['ALL', ...Array.from(new Set(evidenceList.map(e => e.type)))];
  const filtered = evidenceList
    .filter(e => filter === 'ALL' || e.type === filter)
    .filter(e => !search || e.desc.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

      {/* Header */}
      <div style={{ marginBottom: '22px' }}>
        <h2 style={{
          fontFamily: 'var(--f-display)', fontSize: '1.4rem',
          fontWeight: 700, color: '#fff', marginBottom: '3px'
        }}>
          Evidence & Reports
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--t-muted)' }}>
          Digital evidence chain of custody and case documentation
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '2px',
        background: 'var(--ink-2)', borderRadius: '8px',
        padding: '3px', marginBottom: '20px',
        width: 'fit-content', border: '1px solid var(--b-faint)'
      }}>
        {[
          { id: 'evidence', label: `Evidence Log (${evidenceList.length})` },
          { id: 'reports',  label: `Case Reports (${REPORTS.length})` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '7px 20px', borderRadius: '6px', border: 'none',
              cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600,
              transition: 'var(--ease)', fontFamily: 'var(--f-body)',
              background: tab === t.id ? 'var(--ink-4)' : 'transparent',
              color: tab === t.id ? '#fff' : 'var(--t-muted)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Evidence Tab ──────────────────────────────────────────────── */}
      {tab === 'evidence' && (
        <div>
          {/* Hidden file input */}
          <input
            ref={fileRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={e => handleFiles(e.target.files)}
          />

          {/* Drag-drop upload zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--blue-light)' : 'var(--b-soft)'}`,
              borderRadius: '10px', padding: '20px',
              textAlign: 'center', cursor: 'pointer',
              background: dragOver ? 'var(--blue-dim)' : 'transparent',
              marginBottom: '16px', transition: 'var(--ease)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke={dragOver ? 'var(--blue-light)' : 'var(--t-dim)'} strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span style={{ fontSize: '0.82rem', color: dragOver ? 'var(--blue-light)' : 'var(--t-muted)', fontWeight: 500 }}>
                {dragOver ? 'Drop files to add to evidence log' : 'Drop files here or click to upload evidence'}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--t-dim)' }}>
                Supports images, videos, PDFs, audio, spreadsheets
              </span>
            </div>
          </div>

          {/* Upload success toast */}
          {uploadSuccess && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 16px', marginBottom: '12px',
              background: 'var(--green-dim)', border: '1px solid rgba(5,150,105,0.3)',
              borderRadius: '8px', fontSize: '0.82rem', color: 'var(--green-light)'
            }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {uploadSuccess}
            </div>
          )}

          {/* Toolbar */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search evidence..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '240px', fontSize: '0.84rem' }}
            />
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {types.map(t => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  style={{
                    padding: '5px 12px', borderRadius: '6px',
                    border: '1px solid',
                    borderColor: filter === t ? 'var(--blue-border)' : 'var(--b-faint)',
                    background: filter === t ? 'var(--blue-dim)' : 'transparent',
                    color: filter === t ? 'var(--blue-light)' : 'var(--t-muted)',
                    fontSize: '0.75rem', fontFamily: 'var(--f-mono)',
                    cursor: 'pointer', transition: 'var(--ease)', fontWeight: 600
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span style={{
                fontSize: '0.72rem', color: 'var(--t-dim)',
                fontFamily: 'var(--f-mono)'
              }}>
                {filtered.length} items
              </span>
            </div>
          </div>

          {/* Table */}
          <div style={{
            background: 'var(--ink-1)', border: '1px solid var(--b-faint)',
            borderRadius: '10px', overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--b-faint)' }}>
                  {['ID', 'Type', 'Description', 'Case', 'Date', 'Size', 'Status', ''].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left',
                      fontSize: '0.68rem', fontFamily: 'var(--f-mono)',
                      color: 'var(--t-dim)', letterSpacing: '0.06em',
                      fontWeight: 600, textTransform: 'uppercase',
                      whiteSpace: 'nowrap'
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((ev, i) => (
                  <tr
                    key={ev.id}
                    style={{
                      borderBottom: i < filtered.length - 1 ? '1px solid var(--b-faint)' : 'none',
                      transition: 'var(--ease)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.72rem', color: 'var(--t-secondary)', fontWeight: 600 }}>
                        {ev.id}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <TypeBadge type={ev.type} />
                    </td>
                    <td style={{ padding: '12px 16px', maxWidth: '280px' }}>
                      <span style={{ fontSize: '0.83rem', color: 'var(--t-primary)' }}>
                        {ev.desc}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.72rem', color: 'var(--blue-light)' }}>
                        {ev.case}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--t-muted)' }}>{ev.date}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.72rem', color: 'var(--t-dim)' }}>{ev.size}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={ev.status} />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        className="btn-ghost"
                        style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Reports Tab ───────────────────────────────────────────────── */}
      {tab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Generate button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
            <button className="btn-primary" style={{ gap: '8px' }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Generate New Report
            </button>
          </div>

          {REPORTS.map(r => (
            <div
              key={r.id}
              style={{
                background: 'var(--ink-1)', border: '1px solid var(--b-faint)',
                borderRadius: '10px', padding: '18px 22px',
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', gap: '16px', transition: 'var(--ease)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--b-soft)';
                e.currentTarget.style.background = 'var(--ink-2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--b-faint)';
                e.currentTarget.style.background = 'var(--ink-1)';
              }}
            >
              {/* Icon + info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '9px',
                  background: 'var(--ink-3)', border: '1px solid var(--b-faint)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--t-muted)', flexShrink: 0
                }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>

                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', marginBottom: '3px' }}>
                    {r.title}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{
                      fontFamily: 'var(--f-mono)', fontSize: '0.68rem', color: 'var(--t-dim)'
                    }}>
                      {r.id}
                    </span>
                    <span style={{ color: 'var(--t-dim)', fontSize: '0.7rem' }}>·</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--t-muted)' }}>{r.type}</span>
                    <span style={{ color: 'var(--t-dim)', fontSize: '0.7rem' }}>·</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--t-muted)' }}>{r.pages} pages</span>
                    <span style={{ color: 'var(--t-dim)', fontSize: '0.7rem' }}>·</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--t-muted)' }}>{r.date}</span>
                  </div>
                </div>
              </div>

              {/* Status + actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <StatusBadge status={r.status} />
                <button className="btn-ghost" style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Export PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
