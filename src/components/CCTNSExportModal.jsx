import React, { useState } from 'react';
import { Download, Upload, FileText, CheckCircle, X, Shield, AlertTriangle } from 'lucide-react';
import { cr204InvestigationData } from '../data/cr204_investigation.js';

export default function CCTNSExportModal({ isOpen, onClose }) {
  const [importedStatus, setImportedStatus] = useState(null);

  if (!isOpen) return null;

  const handleDownloadJSON = () => {
    const cctnsPayload = {
      standard: "CCTNS-INTEROP-v3.4-SYNTHETIC",
      compliance: "SIMULATED_MOCK_FORMAT",
      disclaimer: "SYNTHETIC DEMO DATA ONLY. NOT CONNECTED TO CCTNS, NATGRID, OR ANY POLICE SYSTEM.",
      fir_docket: {
        fir_number: "FIR No. 204/2026",
        police_station: "Nhava Sheva Coastal PS / Navi Mumbai Police",
        district: "Raigad / Navi Mumbai",
        state: "Maharashtra",
        date_of_registration: "2026-09-18T13:45:00Z",
        acts_and_sections: [
          "IPC Section 379 (Theft)",
          "IPC Section 420 (Cheating and Dishonestly Inducing Delivery)",
          "IPC Section 120B (Criminal Conspiracy)",
          "Information Technology Act Section 66D (Cheating by Personation by Using Computer Resource)"
        ],
        property_stolen_inr: 4250000,
        property_stolen_formatted: "₹42.5 Lakhs",
        investigation_status: "ACTIVE_SIMULATION",
        lead_investigator: "Insp. Rajesh Sharma (Maharashtra CID Unit)"
      },
      entities_count: Object.keys(cr204InvestigationData.entities || {}).length,
      relationships_count: (cr204InvestigationData.relations || []).length,
      entities: cr204InvestigationData.entities,
      relations: cr204InvestigationData.relations,
      timeline: cr204InvestigationData.timeline
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cctnsPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "CCTNS_FIR_204_2026_Docket.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadCSV = () => {
    const headers = ["Entity_ID", "Type", "Name_Label", "Threat_Status", "Jurisdiction_Notes"];
    const rows = Object.values(cr204InvestigationData.entities || {}).map(e => [
      e.id,
      e.type,
      `"${(e.name || e.label || '').replace(/"/g, '""')}"`,
      e.threat_level || e.threat || "OBSERVATION",
      `"${(e.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "CCTNS_FIR_204_Entities.csv");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        setImportedStatus({
          name: file.name,
          entities: parsed.entities_count || (parsed.entities ? Object.keys(parsed.entities).length : 24),
          fir: parsed.fir_docket?.fir_number || "FIR No. 204/2026",
          status: "SUCCESS"
        });
      } catch (err) {
        setImportedStatus({
          name: file.name,
          error: "Invalid JSON format",
          status: "ERROR"
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#0d1117',
        border: '1px solid #30363d',
        borderRadius: '10px',
        width: '100%',
        maxWidth: '560px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #21262d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#161b22'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={18} color="#38bdf8" />
            <div>
              <h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700, color: '#f0f6fc' }}>
                CCTNS / NATGRID Interoperability Gateway
              </h3>
              <p style={{ margin: 0, fontSize: '0.68rem', color: '#8b949e', fontFamily: 'var(--font-mono, monospace)' }}>
                Indian Law Enforcement Schema & Case Docket Exchange (Simulation)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#8b949e',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Simulation Disclaimer Alert */}
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertTriangle size={18} color="#f87171" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.72rem', color: '#fca5a5', lineHeight: 1.4 }}>
              <strong>SYNTHETIC COMPLIANCE FORMAT:</strong> Standardized according to Indian CCTNS (Crime & Criminal Tracking Network) docket exchange specifications for evaluation demonstrations.
            </div>
          </div>

          {/* FIR Summary Details */}
          <div style={{
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '6px',
            padding: '12px 14px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono, monospace)'
          }}>
            <div>
              <span style={{ color: '#8b949e' }}>FIR Number:</span>{' '}
              <span style={{ color: '#58a6ff', fontWeight: 700 }}>FIR No. 204/2026</span>
            </div>
            <div>
              <span style={{ color: '#8b949e' }}>Jurisdiction:</span>{' '}
              <span style={{ color: '#f0f6fc' }}>Nhava Sheva / JNPT</span>
            </div>
            <div>
              <span style={{ color: '#8b949e' }}>Statutory Sections:</span>{' '}
              <span style={{ color: '#f0f6fc' }}>IPC 379/420/120B, IT 66D</span>
            </div>
            <div>
              <span style={{ color: '#8b949e' }}>Stolen Property:</span>{' '}
              <span style={{ color: '#34d399', fontWeight: 700 }}>₹42.5 Lakhs</span>
            </div>
            <div>
              <span style={{ color: '#8b949e' }}>Total Entities:</span>{' '}
              <span style={{ color: '#f0f6fc' }}>24 Canonical Nodes</span>
            </div>
            <div>
              <span style={{ color: '#8b949e' }}>Total Edges:</span>{' '}
              <span style={{ color: '#f0f6fc' }}>28 Unified Relations</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={handleDownloadJSON}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#238636',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '9px 12px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                <Download size={14} />
                <span>Export CCTNS Docket (.json)</span>
              </button>

              <button
                onClick={handleDownloadCSV}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#21262d',
                  color: '#f0f6fc',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  padding: '9px 12px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <FileText size={14} />
                <span>Export Entities Table (.csv)</span>
              </button>
            </div>

            {/* Import Option */}
            <div style={{
              marginTop: '6px',
              padding: '12px',
              border: '1px dashed #30363d',
              borderRadius: '6px',
              textAlign: 'center',
              backgroundColor: '#0d1117'
            }}>
              <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <Upload size={16} color="#8b949e" />
                <span style={{ fontSize: '0.72rem', color: '#58a6ff', fontWeight: 600 }}>
                  Import External CCTNS/FIR Dataset (.json)
                </span>
                <span style={{ fontSize: '0.64rem', color: '#8b949e' }}>
                  Validate synthetic schema compliance and cross-docket matching
                </span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  style={{ display: 'none' }}
                />
              </label>

              {importedStatus && (
                <div style={{
                  marginTop: '8px',
                  padding: '6px 10px',
                  backgroundColor: importedStatus.status === 'SUCCESS' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '4px',
                  fontSize: '0.68rem',
                  color: importedStatus.status === 'SUCCESS' ? '#34d399' : '#f87171',
                  fontFamily: 'var(--font-mono, monospace)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}>
                  {importedStatus.status === 'SUCCESS' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                  <span>
                    {importedStatus.status === 'SUCCESS'
                      ? `Imported ${importedStatus.name}: ${importedStatus.entities} entities validated under ${importedStatus.fir}`
                      : `Import failed: ${importedStatus.error}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #21262d',
          display: 'flex',
          justifyContent: 'flex-end',
          backgroundColor: '#161b22'
        }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#30363d',
              color: '#c9d1d9',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 16px',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
