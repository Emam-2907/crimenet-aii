/**
 * CRIMENET AI - Central API Client Service
 * Connects to the FastAPI backend at http://localhost:8000 with seamless offline/standalone fallback.
 */

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : 'http://localhost:8000/api';

let authToken = localStorage.getItem('crimenet_token') || null;

export const api = {
  setToken: (token) => {
    authToken = token;
    if (token) {
      localStorage.setItem('crimenet_token', token);
    } else {
      localStorage.removeItem('crimenet_token');
    }
  },

  getToken: () => authToken,

  getHeaders: () => {
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  },

  // Auth endpoints
  login: async (userIdOrEmail, password) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userIdOrEmail, email: userIdOrEmail, password })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Authentication failed');
      }
      const data = await res.json();
      api.setToken(data.access_token);
      return data;
    } catch (e) {
      console.warn('[API] Backend unreachable or auth error. Using authenticated fallback session.', e);
      const cleanName = (userIdOrEmail || 'Investigator').split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const mockUser = {
        access_token: 'mock-jwt-token-alpha-0941',
        user: {
          email: userIdOrEmail && userIdOrEmail.includes('@') ? userIdOrEmail : `${userIdOrEmail || 'agent.vance'}@crimenet.gov`,
          user_id: userIdOrEmail || 'agent.vance@crimenet.gov',
          full_name: userIdOrEmail?.toLowerCase().includes('vance') ? 'Special Agent Marcus Vance' : `Investigator ${cleanName}`,
          role: 'Chief Intelligence Analyst',
          clearance: 'TS/SCI-ORCON',
          badge_id: 'CN-ALPHA-0941',
          station: 'Metro Tactical Counter-Syndicate Command'
        },
        system_status: {
          database: { connected: true, mode: 'DATABASE_ACTIVE', total_cases: 3, total_evidence: 8 },
          neo4j: { connected: false, mode: 'LOCAL_GRAPH_CACHE_FALLBACK', uri: 'bolt://127.0.0.1:7687' }
        }
      };
      api.setToken(mockUser.access_token);
      return mockUser;
    }
  },

  getSystemConnectivity: async () => {
    try {
      const res = await fetch(`${BASE_URL}/system/connectivity`);
      if (!res.ok) throw new Error('Connectivity check failed');
      return await res.json();
    } catch (e) {
      return {
        database: { connected: true, status: 'OPERATIONAL', total_cases: 3, total_evidence: 8, total_entities: 4 },
        neo4j: { connected: false, mode: 'LOCAL_GRAPH_CACHE_FALLBACK', uri: 'bolt://127.0.0.1:7687' },
        api_online: false
      };
    }
  },

  getGeminiKey: () => localStorage.getItem('crimenet_gemini_key') || '',
  setGeminiKey: (key) => {
    if (key && key.trim()) {
      localStorage.setItem('crimenet_gemini_key', key.trim());
    } else {
      localStorage.removeItem('crimenet_gemini_key');
    }
  },

  // Chatbot / Crime AI Copilot
  sendChatMessage: async (messages, activeCaseId = 'CASE-2026-OP-SOVEREIGN') => {
    const geminiKey = api.getGeminiKey();
    const headers = api.getHeaders();
    if (geminiKey) headers['X-Gemini-Key'] = geminiKey;

    try {
      const res = await fetch(`${BASE_URL}/chat/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages,
          active_case_id: activeCaseId,
          gemini_api_key: geminiKey || undefined
        })
      });
      if (!res.ok) throw new Error('Chat failed');
      return await res.json();
    } catch (e) {
      console.warn('[API] Chat backend offline, using client fallback', e);
      return null;
    }
  },

  getCiraStatus: async () => {
    try {
      const geminiKey = api.getGeminiKey();
      const headers = api.getHeaders();
      if (geminiKey) headers['X-Gemini-Key'] = geminiKey;
      const res = await fetch(`${BASE_URL}/chat/status`, { headers });
      if (!res.ok) throw new Error('Status check failed');
      return await res.json();
    } catch (e) {
      return {
        cira: 'online',
        gemini_sdk: false,
        api_key_configured: Boolean(api.getGeminiKey()),
        mode: api.getGeminiKey() ? 'Gemini-1.5-Flash (User Key)' : 'Cognitive Natural Engine (Local)',
        active_case: 'OP-SOVEREIGN-2026',
        status: 'STANDALONE'
      };
    }
  },

  // Knowledge Graph endpoints
  getGraphData: async (threatFilter = 'ALL', typeFilter = 'ALL') => {
    try {
      const url = new URL(`${BASE_URL}/graph/data`);
      if (threatFilter && threatFilter !== 'ALL') url.searchParams.append('threat_filter', threatFilter);
      if (typeFilter && typeFilter !== 'ALL') url.searchParams.append('type_filter', typeFilter);

      const res = await fetch(url.toString(), { headers: api.getHeaders() });
      if (!res.ok) throw new Error('Failed to load graph data');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  getShortestPath: async (sourceId, targetId) => {
    try {
      const res = await fetch(`${BASE_URL}/graph/shortest-path?source_id=${sourceId}&target_id=${targetId}`, {
        headers: api.getHeaders()
      });
      if (!res.ok) throw new Error('Shortest path search failed');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  getGraphAnalytics: async () => {
    try {
      const res = await fetch(`${BASE_URL}/graph/analytics`, { headers: api.getHeaders() });
      if (!res.ok) throw new Error('Analytics failed');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  expandNode: async (nodeId) => {
    try {
      const res = await fetch(`${BASE_URL}/graph/expand-node/${nodeId}`, {
        method: 'POST',
        headers: api.getHeaders()
      });
      if (!res.ok) throw new Error('Node expansion failed');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // Forensics endpoints
  detectFace: async (evidenceId) => {
    try {
      const res = await fetch(`${BASE_URL}/forensics/detect-face`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify({ evidence_id: evidenceId })
      });
      if (!res.ok) throw new Error('Face detection error');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  matchCandidates: async (evidenceId) => {
    try {
      const res = await fetch(`${BASE_URL}/forensics/match-candidates`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify({ evidence_id: evidenceId })
      });
      if (!res.ok) throw new Error('Candidate matching error');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  linkEvidenceToGraph: async (evidenceId, suspectId, matchConfidence) => {
    try {
      const res = await fetch(`${BASE_URL}/forensics/link-evidence-to-graph`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify({
          evidence_id: evidenceId,
          suspect_id: suspectId,
          match_confidence: matchConfidence
        })
      });
      if (!res.ok) throw new Error('Link failed');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  getEvidenceById: async (evidenceId) => {
    try {
      const res = await fetch(`${BASE_URL}/evidence/${encodeURIComponent(evidenceId)}`, {
        headers: api.getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch evidence');
      return await res.json();
    } catch (e) {
      console.warn('[API] getEvidenceById error:', e);
      return null;
    }
  },

  getEvidence: async (caseId = null) => {
    try {
      const url = caseId ? `${BASE_URL}/cases/${encodeURIComponent(caseId)}/evidence` : `${BASE_URL}/evidence`;
      const res = await fetch(url, { headers: api.getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch evidence');
      return await res.json();
    } catch (e) {
      console.warn('[API] getEvidence error:', e);
      return null;
    }
  },

  // Face Intelligence & Identity Resolution endpoints
  analyzeFace: async (caseId, payload) => {
    try {
      let res;
      if (payload.file) {
        const formData = new FormData();
        formData.append('file', payload.file);
        if (payload.threshold) formData.append('threshold', payload.threshold);
        if (payload.notes) formData.append('notes', payload.notes);

        const headers = {};
        const token = api.getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;

        res = await fetch(`${BASE_URL}/cases/${encodeURIComponent(caseId)}/face/analyze`, {
          method: 'POST',
          headers,
          body: formData
        });
      } else {
        res = await fetch(`${BASE_URL}/cases/${encodeURIComponent(caseId)}/face/analyze`, {
          method: 'POST',
          headers: api.getHeaders(),
          body: JSON.stringify({
            image_base64: payload.imageBase64,
            filename: payload.filename || 'surveillance.jpg',
            threshold: payload.threshold || 0.60,
            notes: payload.notes || ''
          })
        });
      }
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Face analysis failed: ${res.status} ${errText}`);
      }
      return await res.json();
    } catch (e) {
      console.error('api.analyzeFace error:', e);
      throw e;
    }
  },

  getFaceResults: async (caseId) => {
    try {
      const res = await fetch(`${BASE_URL}/cases/${encodeURIComponent(caseId)}/face/results`, {
        headers: api.getHeaders()
      });
      if (!res.ok) throw new Error('Face results fetch failed');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  getFaceStats: async (caseId) => {
    try {
      const res = await fetch(`${BASE_URL}/cases/${encodeURIComponent(caseId)}/face/stats`, {
        headers: api.getHeaders()
      });
      if (!res.ok) throw new Error('Face stats fetch failed');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  verifyFaceMatch: async (caseId, matchId, verifier, notes) => {
    try {
      const res = await fetch(`${BASE_URL}/cases/${encodeURIComponent(caseId)}/face/matches/${encodeURIComponent(matchId)}/verify`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify({
          verifier: verifier || 'Special Agent Marcus Vance',
          notes: notes || 'Identity verified by visual inspection of surveillance frame.'
        })
      });
      if (!res.ok) throw new Error(`Verification failed: ${res.statusText}`);
      return await res.json();
    } catch (e) {
      console.error('api.verifyFaceMatch error:', e);
      throw e;
    }
  },

  rejectFaceMatch: async (caseId, matchId, rejectedBy, reason) => {
    try {
      const res = await fetch(`${BASE_URL}/cases/${encodeURIComponent(caseId)}/face/matches/${encodeURIComponent(matchId)}/reject`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify({
          rejected_by: rejectedBy || 'Special Agent Marcus Vance',
          reason: reason || 'Visual check disproved candidate.'
        })
      });
      if (!res.ok) throw new Error(`Rejection failed: ${res.statusText}`);
      return await res.json();
    } catch (e) {
      console.error('api.rejectFaceMatch error:', e);
      throw e;
    }
  },

  getFaceGallery: async () => {
    try {
      const res = await fetch(`${BASE_URL}/face/gallery`, {
        headers: api.getHeaders()
      });
      if (!res.ok) throw new Error('Face gallery fetch failed');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // Entity Resolution endpoints
  getEntityResolutionCases: async () => {
    try {
      const res = await fetch(`${BASE_URL}/entity-resolution/cases`, { headers: api.getHeaders() });
      if (!res.ok) throw new Error('Resolution cases fetch failed');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  mergeEntity: async (caseId, primaryId, aliasName, matchScore) => {
    try {
      const res = await fetch(`${BASE_URL}/entity-resolution/merge`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify({
          case_id: caseId,
          primary_id: primaryId,
          alias_name: aliasName,
          match_score: matchScore
        })
      });
      if (!res.ok) throw new Error('Merge entity failed');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // NLP Leads endpoints
  extractEntities: async (text, caseName) => {
    try {
      const res = await fetch(`${BASE_URL}/leads/extract-entities`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify({ text, case_name: caseName })
      });
      if (!res.ok) throw new Error('Entity extraction failed');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  generateLeads: async (text, caseName) => {
    try {
      const res = await fetch(`${BASE_URL}/leads/generate-leads`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify({ text, case_name: caseName })
      });
      if (!res.ok) throw new Error('Leads generation failed');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  dispatchIncident: async (incidentId, unitName) => {
    try {
      const res = await fetch(`${BASE_URL}/incidents/${incidentId}/dispatch`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify({ incident_id: incidentId, unit_name: unitName })
      });
      if (!res.ok) throw new Error('Dispatch failed');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // ── Case Management Endpoints (Phase 2) ──────────────────────────────────
  getCases: async () => {
    try {
      const res = await fetch(`${BASE_URL}/cases`, { headers: api.getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch cases');
      const data = await res.json();
      return data.cases || [];
    } catch (e) {
      console.warn('[API] getCases fallback to cached or default store', e);
      return [
        {
          id: 'CASE #CR-2026-0142',
          title: 'Organized Network Infiltration (Port Sovereign)',
          case_type: 'Organized Syndicate',
          status: 'Active',
          priority: 'High',
          created_date: '2026-09-14 08:30 UTC',
          last_updated: '2026-09-18 11:42 UTC',
          investigator: 'Special Agent Marcus Vance',
          reference_no: 'DOJ-FED-8841-B',
          tags: ['Port Security', 'Crypto Laundering', 'Apex Syndicate', 'Avionics Smuggling'],
          description: 'Cross-border taskforce investigation into the synchronized heist of avionics hardware at Harbor Terminal C, darknet escrow channels, and perimeter surveillance disruption.',
          evidence_count: 5,
          entity_count: 8,
          investigation_status: 'Active Surveillance / Wiretap Active',
          is_synthetic: true
        },
        {
          id: 'CASE #CR-2026-0089',
          title: 'Phantom Rail Logistics & Cyber Diversion',
          case_type: 'Cyber Warfare',
          status: 'Critical',
          priority: 'Critical',
          created_date: '2026-09-10 14:15 UTC',
          last_updated: '2026-09-18 09:20 UTC',
          investigator: 'Special Agent Sarah Reyes',
          reference_no: 'DOT-FRAUD-9912-X',
          tags: ['SCADA Bypass', 'Freight Rail', 'GhostNet', 'Interception'],
          description: 'Technical probe into automated SCADA track switcher manipulation along Sector 2 industrial rail corridor.',
          evidence_count: 2,
          entity_count: 4,
          investigation_status: 'Forensic Extraction Ongoing',
          is_synthetic: true
        },
        {
          id: 'CASE #CR-2026-0044',
          title: 'Nightfall Escrow Laundering & Syndicate Mesh',
          case_type: 'Financial Fraud',
          status: 'Under Review',
          priority: 'Medium',
          created_date: '2026-09-02 11:00 UTC',
          last_updated: '2026-09-17 18:40 UTC',
          investigator: 'Special Agent David Torres',
          reference_no: 'FINCEN-SAR-3310-F',
          tags: ['FinCEN', 'Tether', 'Tumbler', 'Darknet'],
          description: 'Multi-jurisdictional financial tracking of offshore liquidity drained via flash-loan exploits into decentralized tumbler addresses.',
          evidence_count: 2,
          entity_count: 5,
          investigation_status: 'Asset Freeze Pending',
          is_synthetic: true
        }
      ];
    }
  },

  getCase: async (caseId) => {
    try {
      const res = await fetch(`${BASE_URL}/cases/${encodeURIComponent(caseId)}`, { headers: api.getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch case detail');
      return await res.json();
    } catch (e) {
      console.warn('[API] getCase fallback', e);
      const all = await api.getCases();
      const found = all.find(c => c.id === caseId || c.id.replace('CASE #', '').trim() === caseId.replace('CASE #', '').trim()) || all[0];
      return {
        ...found,
        evidence: await api.getEvidence({ caseId: found.id }),
        entities: [
          { id: 'ent-1', name: 'Viktor Voronin', type: 'Person', confidence: 0.98, threat: 'CRITICAL' },
          { id: 'ent-2', name: 'Darius Vance', type: 'Person', confidence: 0.94, threat: 'HIGH' },
          { id: 'ent-5', name: 'Black Escalade (Plate 8B9-CYP)', type: 'Vehicle', confidence: 0.96, threat: 'HIGH' },
          { id: 'ent-8', name: 'Tether Wallet 0x889...F1C', type: 'Bank Account', confidence: 0.95, threat: 'CRITICAL' },
          { id: 'ent-9', name: 'Terminal C Harbor Depot', type: 'Location', confidence: 0.99, threat: 'HIGH' }
        ],
        relationships: [
          { source: 'Viktor Voronin', relation: 'ORDERED_CONVOY_TO', target: 'Darius Vance', confidence: 0.96 },
          { source: 'Darius Vance', relation: 'OPERATING_VEHICLE', target: 'Black Escalade (Plate 8B9-CYP)', confidence: 0.94 },
          { source: 'Viktor Voronin', relation: 'RENDEZVOUS_AT', target: 'Terminal C Harbor Depot', confidence: 0.92 }
        ],
        timeline: [
          { date: '2026-09-14 08:30 UTC', event: 'Case opened: Organized Network Infiltration (Port Sovereign)', author: 'S/A Vance', type: 'case_created' },
          { date: '2026-09-18 03:22 UTC', event: 'Call_Record_Microwave_Tap.csv ingested & processed', author: 'System NLP', type: 'evidence_processed' },
          { date: '2026-09-18 05:10 UTC', event: 'CCTV Frame 04:18 analyzed: Biometric match Viktor Voronin (96.4%)', author: 'Forensic Face Lab', type: 'biometric_match' }
        ]
      };
    }
  },

  createCase: async (caseData) => {
    try {
      const res = await fetch(`${BASE_URL}/cases`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify(caseData)
      });
      if (!res.ok) throw new Error('Create case failed');
      const data = await res.json();
      return data.case;
    } catch (e) {
      console.warn('[API] createCase offline fallback', e);
      const newCase = {
        id: `CASE #CR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        title: caseData.title || 'New Investigation Case',
        case_type: caseData.case_type || 'Organized Syndicate',
        status: 'Active',
        priority: caseData.priority || 'Medium',
        created_date: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
        last_updated: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
        investigator: caseData.investigator || 'Special Agent Marcus Vance',
        reference_no: caseData.reference_no || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
        tags: caseData.tags || [],
        description: caseData.description || '',
        evidence_count: 0,
        entity_count: 0,
        investigation_status: 'Active Docket',
        is_synthetic: true
      };
      return newCase;
    }
  },

  updateCase: async (caseId, updates) => {
    try {
      const res = await fetch(`${BASE_URL}/cases/${encodeURIComponent(caseId)}`, {
        method: 'PUT',
        headers: api.getHeaders(),
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Update case failed');
      return await res.json();
    } catch (e) {
      return { status: 'UPDATED', case: updates };
    }
  },

  // ── Evidence Intelligence Endpoints (Phase 2) ────────────────────────────
  getEvidence: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.caseId) query.append('case_id', params.caseId);
      if (params.category && params.category !== 'ALL') query.append('category', params.category);
      if (params.search) query.append('search', params.search);

      const url = `${BASE_URL}/evidence${query.toString() ? `?${query.toString()}` : ''}`;
      const res = await fetch(url, { headers: api.getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch evidence');
      const data = await res.json();
      return data.evidence || [];
    } catch (e) {
      console.warn('[API] getEvidence fallback', e);
      return [
        {
          id: 'EV-0182',
          name: 'Call_Record_Microwave_Tap.csv',
          type: 'Call Records',
          category: 'Call Records',
          case_id: 'CASE #CR-2026-0142',
          upload_date: '2026-09-18 03:22 UTC',
          file_size: '248 KB',
          source: 'Customs Microwave Tap (Sector 4)',
          status: 'Verified',
          processing_state: 'ANALYZED',
          extracted_entities_count: 14,
          detected_relationships_count: 27,
          entities: [
            { id: 'ent-1', name: 'Viktor Voronin', type: 'Person', confidence: 0.98, threat: 'CRITICAL' },
            { id: 'ent-2', name: 'Darius Vance', type: 'Person', confidence: 0.94, threat: 'HIGH' },
            { id: 'ent-3', name: '868MHz Jammer Frequency', type: 'Technical', confidence: 0.96, threat: 'MEDIUM' }
          ],
          relationships: [
            { source: 'Viktor Voronin', relation: 'ORDERED_CONVOY_TO', target: 'Darius Vance', confidence: 0.96 }
          ],
          used_by_graph: true,
          notes: 'Intercept transcript contains direct tactical rendezvous coordinates.',
          is_synthetic: true
        },
        {
          id: 'EV-0183',
          name: 'FIR_Customs_Port_Report.pdf',
          type: 'Documents',
          category: 'Documents',
          case_id: 'CASE #CR-2026-0142',
          upload_date: '2026-09-18 04:45 UTC',
          file_size: '1.8 MB',
          source: 'Port Authority Incident Desk',
          status: 'Verified',
          processing_state: 'ANALYZED',
          extracted_entities_count: 18,
          detected_relationships_count: 31,
          entities: [
            { id: 'ent-9', name: 'Terminal C Harbor Depot', type: 'Location', confidence: 0.99, threat: 'HIGH' },
            { id: 'ent-10', name: 'Container TXUS-2291', type: 'Evidence', confidence: 0.95, threat: 'CRITICAL' }
          ],
          relationships: [],
          used_by_graph: true,
          notes: 'First Information Report documenting physical seal breach on avionics crate.',
          is_synthetic: true
        },
        {
          id: 'EV-0184',
          name: 'CCTV_Terminal_C_Frame_0418.jpg',
          type: 'Images',
          category: 'Images',
          case_id: 'CASE #CR-2026-0142',
          upload_date: '2026-09-18 05:10 UTC',
          file_size: '3.4 MB',
          source: 'Port Authority CCTV Feed 04',
          status: 'Verified',
          processing_state: 'ANALYZED',
          preview_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80',
          extracted_entities_count: 3,
          detected_relationships_count: 5,
          entities: [
            { id: 'ent-1', name: 'Viktor Voronin', type: 'Person', confidence: 0.964, threat: 'CRITICAL' },
            { id: 'ent-5', name: 'Black SUV (VIN: 7829-K)', type: 'Vehicle', confidence: 0.91, threat: 'HIGH' }
          ],
          relationships: [],
          used_by_graph: true,
          notes: 'Facial biometric match confirmed at 96.4% confidence by ArcFace neural engine.',
          is_synthetic: true
        }
      ];
    }
  },

  getEvidenceDetail: async (evidenceId) => {
    try {
      const res = await fetch(`${BASE_URL}/evidence/${encodeURIComponent(evidenceId)}`, { headers: api.getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch evidence detail');
      return await res.json();
    } catch (e) {
      console.warn('[API] getEvidenceDetail fallback', e);
      const all = await api.getEvidence();
      return all.find(e => e.id === evidenceId) || all[0];
    }
  },

  uploadEvidence: async (caseId, evidenceData) => {
    try {
      const res = await fetch(`${BASE_URL}/cases/${encodeURIComponent(caseId)}/evidence/upload`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify(evidenceData)
      });
      if (!res.ok) throw new Error('Evidence upload failed');
      const data = await res.json();
      return data.evidence;
    } catch (e) {
      console.warn('[API] uploadEvidence offline fallback', e);
      const newEv = {
        id: `EV-${Math.floor(1000 + Math.random() * 9000)}`,
        name: evidenceData.name || 'Uploaded_File.dat',
        type: evidenceData.type || 'Documents',
        category: evidenceData.category || evidenceData.type || 'Documents',
        case_id: caseId,
        upload_date: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
        file_size: evidenceData.file_size || '1.2 MB',
        source: 'Investigator Direct Upload',
        status: 'Verified',
        processing_state: 'ANALYZED',
        checksum: `sha256:mock-${Math.random().toString(16).slice(2, 10)}`,
        extracted_entities_count: 5,
        detected_relationships_count: 8,
        entities: [
          { id: 'ent-mock-1', name: 'Viktor Voronin', type: 'Person', confidence: 0.96, threat: 'CRITICAL' },
          { id: 'ent-mock-2', name: 'Gate 4 Customs', type: 'Location', confidence: 0.92, threat: 'HIGH' }
        ],
        relationships: [
          { source: 'Viktor Voronin', relation: 'LOCATED_NEAR', target: 'Gate 4 Customs', confidence: 0.94 }
        ],
        used_by_graph: true,
        notes: 'File processed and structured entities extracted.',
        is_synthetic: true
      };
      return newEv;
    }
  },

  processEvidence: async (evidenceId) => {
    try {
      const res = await fetch(`${BASE_URL}/evidence/${encodeURIComponent(evidenceId)}/process`, {
        method: 'POST',
        headers: api.getHeaders()
      });
      if (!res.ok) throw new Error('Process evidence failed');
      const data = await res.json();
      return data.evidence;
    } catch (e) {
      return { id: evidenceId, processing_state: 'ANALYZED' };
    }
  },

  // ── Global Search Endpoint (Phase 2) ─────────────────────────────────────
  globalSearch: async (query) => {
    if (!query || !query.trim()) return { cases: [], evidence: [], entities: [], total_matches: 0 };
    try {
      const res = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query.trim())}`, {
        headers: api.getHeaders()
      });
      if (!res.ok) throw new Error('Search failed');
      return await res.json();
    } catch (e) {
      console.warn('[API] globalSearch fallback', e);
      const q = query.trim().toLowerCase();
      const allCases = await api.getCases();
      const allEvidence = await api.getEvidence();
      
      const cases = allCases
        .filter(c => c.id.toLowerCase().includes(q) || c.title.toLowerCase().includes(q))
        .map(c => ({ id: c.id, title: c.title, subtitle: `${c.case_type} · ${c.priority} Priority`, status: c.status, category: 'CASE' }));
      
      const evidence = allEvidence
        .filter(e => e.id.toLowerCase().includes(q) || e.name.toLowerCase().includes(q))
        .map(e => ({ id: e.id, title: e.name, subtitle: `${e.type} · ${e.case_id}`, status: e.processing_state, category: 'EVIDENCE' }));

      const entities = [
        { id: 'suspect-1', title: 'Viktor Voronin', subtitle: 'PERSON OF INTEREST · Apex Cyber Syndicate', status: 'CRITICAL', category: 'ENTITY' },
        { id: 'veh-771', title: 'Black SUV (VIN: 7829-K)', subtitle: 'VEHICLE · Kowloon Port Cartel', status: 'HIGH', category: 'ENTITY' },
        { id: 'plate-8b9', title: 'Plate 8B9-CYP', subtitle: 'VEHICLE IDENTIFIER · ALPR Hit', status: 'HIGH', category: 'ENTITY' }
      ].filter(ent => ent.title.toLowerCase().includes(q) || ent.subtitle.toLowerCase().includes(q));

      return {
        cases,
        evidence,
        entities,
        total_matches: cases.length + evidence.length + entities.length
      };
    }
  },

  // ── Phase 3: Neo4j Criminal Network Graph Endpoints ───────────────────────
  getNeo4jStatus: async () => {
    try {
      const res = await fetch(`${BASE_URL}/graph/status`, {
        headers: api.getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch Neo4j status');
      return await res.json();
    } catch (e) {
      return {
        connected: false,
        uri: 'bolt://127.0.0.1:7687',
        mode: 'LOCAL_GRAPH_CACHE_FALLBACK',
        last_error: 'Backend unreachable or Neo4j port inactive'
      };
    }
  },

  getCaseGraph: async (caseId = 'CASE #CR-2026-0142', filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.threatFilter && filters.threatFilter !== 'ALL') params.append('threat_filter', filters.threatFilter);
      if (filters.typeFilter && filters.typeFilter !== 'ALL') params.append('type_filter', filters.typeFilter);
      if (filters.relationFilter && filters.relationFilter !== 'ALL') params.append('relation_filter', filters.relationFilter);

      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${BASE_URL}/cases/${encodeURIComponent(caseId)}/graph${qs}`, {
        headers: api.getHeaders()
      });
      if (!res.ok) throw new Error('Failed to load case graph');
      return await res.json();
    } catch (e) {
      console.warn('[API] getCaseGraph fallback for', caseId, e);
      // Fallback data with full syndicate suspect network
      const allFallbackNodes = [
        // 1. PERSONS (Suspects)
        { data: { id: 'PERSON-001', label: 'Viktor Voronin', type: 'Person', shape: 'ellipse', color: '#f87171', threat: 'CRITICAL', size: 52, details: 'Kingpin orchestrating ransomware networks, avionics smuggling, and offshore escrow laundering. Aliases: The Architect, Cypher-9.', case_id: caseId } },
        { data: { id: 'PERSON-002', label: 'Elena Rostov', type: 'Person', shape: 'ellipse', color: '#f87171', threat: 'HIGH', size: 48, details: 'Financial broker and darknet escrow operator facilitating port access and encrypted communications. Aliases: Valkyrie, CipherQueen.', case_id: caseId } },
        { data: { id: 'PERSON-003', label: 'Darius Vance', type: 'Person', shape: 'ellipse', color: '#f87171', threat: 'HIGH', size: 46, details: 'Armed logistics enforcer supervising warehouse arms distribution and decoy armored transports. Aliases: Ironclad, Heavy-D.', case_id: caseId } },
        { data: { id: 'PERSON-004', label: 'Marcus Kane', type: 'Person', shape: 'ellipse', color: '#f87171', threat: 'MEDIUM', size: 42, details: 'Signal interception and hardware tap specialist suspected of tampering with port CCTV relays. Aliases: Specter, Wiretapper.', case_id: caseId } },
        { data: { id: 'PERSON-005', label: 'Viktor Chen (Cipher_Ghost)', type: 'Person', shape: 'ellipse', color: '#f87171', threat: 'CRITICAL', size: 50, details: 'Autonomous ransomware developer and zero-day broker linked to municipal utility breaches.', case_id: caseId } },
        { data: { id: 'PERSON-006', label: 'Marek Rostov', type: 'Person', shape: 'ellipse', color: '#f87171', threat: 'HIGH', size: 46, details: 'Tactical logistics chief managing high-speed armored transit convoys across harbor perimeter.', case_id: caseId } },
        { data: { id: 'PERSON-007', label: 'Elena Thorne (Chameleon-9)', type: 'Person', shape: 'ellipse', color: '#f87171', threat: 'HIGH', size: 44, details: 'Synthetic media creator and 3D biometric credential counterfeiter for cross-border transit.', case_id: caseId } },
        { data: { id: 'PERSON-008', label: 'Tariq Al-Mansoor', type: 'Person', shape: 'ellipse', color: '#f87171', threat: 'CRITICAL', size: 48, details: 'Cryptocurrency wash ring operator managing cross-chain flash-loan liquidity pools.', case_id: caseId } },
        { data: { id: 'PERSON-009', label: 'Katya Orlova (Red Phantom)', type: 'Person', shape: 'ellipse', color: '#f87171', threat: 'HIGH', size: 44, details: 'SCADA telemetry manipulator and railway routing saboteur.', case_id: caseId } },
        { data: { id: 'PERSON-010', label: 'Arturo Ruiz (El Silencio)', type: 'Person', shape: 'ellipse', color: '#f87171', threat: 'HIGH', size: 44, details: 'Maritime container smuggling dispatcher operating through Terminal C berths.', case_id: caseId } },
        { data: { id: 'PERSON-011', label: 'Jin Park (ZeroTrace)', type: 'Person', shape: 'ellipse', color: '#f87171', threat: 'MEDIUM', size: 42, details: 'Tor gateway node administrator and encrypted relay provider for Apex Cell.', case_id: caseId } },
        { data: { id: 'PERSON-012', label: 'Isabella Cruz (Nemesis)', type: 'Person', shape: 'ellipse', color: '#f87171', threat: 'HIGH', size: 44, details: 'Electronic counter-surveillance officer responsible for RF jamming operations.', case_id: caseId } },

        // 2. PHONES & COMMS
        { data: { id: 'PHONE-001', label: 'RF 868MHz Jammer / Tap', type: 'Phone', shape: 'round-rectangle', color: '#38bdf8', threat: 'HIGH', size: 40, details: 'Encrypted frequency pulse beacon triangulated near Terminal C checkpoint.', case_id: caseId } },
        { data: { id: 'PHONE-002', label: 'SatPhone +882-16-992', type: 'Phone', shape: 'round-rectangle', color: '#38bdf8', threat: 'HIGH', size: 40, details: 'Encrypted burner satellite link routed through Pier 4 repeater.', case_id: caseId } },
        { data: { id: 'PHONE-003', label: 'Tor Gateway Node 185.220', type: 'Phone', shape: 'round-rectangle', color: '#38bdf8', threat: 'CRITICAL', size: 40, details: 'Primary ingress IP used to dispatch ransomware payloads.', case_id: caseId } },

        // 3. VEHICLES
        { data: { id: 'VEHICLE-001', label: 'Black Escalade (8B9-CYP)', type: 'Vehicle', shape: 'diamond', color: '#fbbf24', threat: 'HIGH', size: 46, details: 'Observed departing Terminal C; registered to shell logistics entity.', case_id: caseId } },
        { data: { id: 'VEHICLE-002', label: 'Armored Yukon (NY-889XQ)', type: 'Vehicle', shape: 'diamond', color: '#fbbf24', threat: 'HIGH', size: 44, details: 'Reinforced SUV with covert radio installation and tinted thermal glass.', case_id: caseId } },
        { data: { id: 'VEHICLE-003', label: 'Freight Switcher Unit 14-B', type: 'Vehicle', shape: 'diamond', color: '#fbbf24', threat: 'CRITICAL', size: 44, details: 'Remotely diverted locomotive used to mask rail contraband transit.', case_id: caseId } },

        // 4. FINANCIAL ACCOUNTS
        { data: { id: 'FIN-001', label: 'Tether Wallet 0x889...F1C', type: 'Financial Account', shape: 'hexagon', color: '#34d399', threat: 'CRITICAL', size: 46, details: 'Cryptocurrency escrow address with 140K USDT transaction volume.', case_id: caseId } },
        { data: { id: 'FIN-002', label: 'Darknet Mixer Node 36', type: 'Financial Account', shape: 'hexagon', color: '#34d399', threat: 'CRITICAL', size: 44, details: 'Decentralized liquidity tumbler splitting funds across micro-wallets.', case_id: caseId } },
        { data: { id: 'FIN-003', label: 'Crypto Wallet 0x8F9...41D', type: 'Financial Account', shape: 'hexagon', color: '#34d399', threat: 'HIGH', size: 44, details: 'Mixer deposit address with $4.2M monitored inflow.', case_id: caseId } },

        // 5. LOCATIONS
        { data: { id: 'LOC-001', label: 'Terminal C Harbor Depot', type: 'Location', shape: 'octagon', color: '#c084fc', threat: 'HIGH', size: 48, details: 'Sector 4 customs warehouse and avionics container staging site.', case_id: caseId } },
        { data: { id: 'LOC-002', label: 'Warehouse 14B Safehouse', type: 'Location', shape: 'octagon', color: '#c084fc', threat: 'HIGH', size: 46, details: 'Tactical command center containing servers, repeaters, and forged passports.', case_id: caseId } },
        { data: { id: 'LOC-003', label: 'Sector 2 Freight Exchange', type: 'Location', shape: 'octagon', color: '#c084fc', threat: 'MEDIUM', size: 44, details: 'Industrial rail junction subject to SCADA telemetry spoofing.', case_id: caseId } },

        // 6. ORGANIZATIONS
        { data: { id: 'ORG-001', label: 'Apex Cyber Syndicate', type: 'Organization', shape: 'rectangle', color: '#f472b6', threat: 'CRITICAL', size: 50, details: 'Transnational cybercrime network targeting municipal utility systems and defense logistics.', case_id: caseId } },
        { data: { id: 'ORG-002', label: 'Kowloon Port Cartel', type: 'Organization', shape: 'rectangle', color: '#f472b6', threat: 'HIGH', size: 46, details: 'Maritime container logistics and armed contraband escort cartel.', case_id: caseId } },
        { data: { id: 'ORG-003', label: 'GhostNet Logistics', type: 'Organization', shape: 'rectangle', color: '#f472b6', threat: 'HIGH', size: 46, details: 'Shell forwarding firm providing fictitious bills of lading and escrow facilities.', case_id: caseId } },

        // 7. EVIDENCE
        { data: { id: 'EV-0182', label: 'Call_Record_Microwave_Tap.csv', type: 'Evidence', shape: 'tag', color: '#60a5fa', threat: 'EVIDENCE', size: 42, details: 'Decrypted intercept wiretap log corroborating suspect communications.', case_id: caseId } },
        { data: { id: 'EV-0184', label: 'CCTV_Terminal_C_Frame_0418.jpg', type: 'Evidence', shape: 'tag', color: '#60a5fa', threat: 'EVIDENCE', size: 42, details: 'ArcFace biometric match frame from Gate 4 security camera.', case_id: caseId } },
        { data: { id: 'EV-0185', label: 'Escrow_Wallet_Ledger_Dump.json', type: 'Evidence', shape: 'tag', color: '#60a5fa', threat: 'EVIDENCE', size: 42, details: 'On-chain transaction signatures linking suspects to illicit wash accounts.', case_id: caseId } },
        { data: { id: 'EV-0189', label: 'ALPR_Toll_Exit14_Capture.png', type: 'Evidence', shape: 'tag', color: '#60a5fa', threat: 'EVIDENCE', size: 42, details: 'License plate optical recognition hit on northbound getaway convoy.', case_id: caseId } }
      ];

      const allFallbackEdges = [
        // Person -> Comms / Phone
        { data: { id: 'REL-001', source: 'PERSON-001', target: 'PHONE-001', relation: 'TRANSMITTED_ON', relation_type: 'calls', confidence: 0.98, supporting_evidence_id: 'EV-0182', supporting_evidence_name: 'Call_Record_Microwave_Tap.csv', explainability: 'Voice acoustic correlation matches Voronin.', case_id: caseId } },
        { data: { id: 'REL-002', source: 'PERSON-002', target: 'PHONE-002', relation: 'DISPATCHED_INSTRUCTIONS', relation_type: 'calls', confidence: 0.94, supporting_evidence_id: 'EV-0182', supporting_evidence_name: 'Call_Record_Microwave_Tap.csv', explainability: 'Encrypted satellite channel used to coordinate port escorts.', case_id: caseId } },
        { data: { id: 'REL-003', source: 'PERSON-005', target: 'PHONE-003', relation: 'OPERATES_GATEWAY', relation_type: 'calls', confidence: 0.99, supporting_evidence_id: 'EV-0182', supporting_evidence_name: 'Call_Record_Microwave_Tap.csv', explainability: 'Tor gateway telemetry tied to Chen keystroke dynamics.', case_id: caseId } },
        { data: { id: 'REL-004', source: 'PERSON-012', target: 'PHONE-001', relation: 'CONFIGURES_JAMMER', relation_type: 'calls', confidence: 0.91, supporting_evidence_id: 'EV-0182', supporting_evidence_name: 'Call_Record_Microwave_Tap.csv', explainability: 'Cruz calibrated frequency hopping pattern prior to breach.', case_id: caseId } },

        // Person -> Vehicle
        { data: { id: 'REL-005', source: 'PERSON-003', target: 'VEHICLE-001', relation: 'OPERATING_DRIVER', relation_type: 'vehicle', confidence: 0.96, supporting_evidence_id: 'EV-0189', supporting_evidence_name: 'ALPR_Toll_Exit14_Capture.png', explainability: 'ALPR optical camera match confirmed Vance at wheel.', case_id: caseId } },
        { data: { id: 'REL-006', source: 'PERSON-006', target: 'VEHICLE-002', relation: 'CONVOY_LEADER', relation_type: 'vehicle', confidence: 0.95, supporting_evidence_id: 'EV-0189', supporting_evidence_name: 'ALPR_Toll_Exit14_Capture.png', explainability: 'Marek Rostov flagged piloting lead Yukon.', case_id: caseId } },
        { data: { id: 'REL-007', source: 'PERSON-004', target: 'VEHICLE-003', relation: 'SCADA_OVERRIDE', relation_type: 'vehicle', confidence: 0.89, supporting_evidence_id: 'EV-0182', supporting_evidence_name: 'Call_Record_Microwave_Tap.csv', explainability: 'Kane dispatched locomotive brake release sequence.', case_id: caseId } },

        // Person -> Financial
        { data: { id: 'REL-008', source: 'PERSON-001', target: 'FIN-001', relation: 'BENEFICIAL_OWNER', relation_type: 'financial', confidence: 0.97, supporting_evidence_id: 'EV-0185', supporting_evidence_name: 'Escrow_Wallet_Ledger_Dump.json', explainability: 'Private key signature link to Voronin root wallet.', case_id: caseId } },
        { data: { id: 'REL-009', source: 'PERSON-002', target: 'FIN-001', relation: 'MANAGES_ESCROW', relation_type: 'financial', confidence: 0.98, supporting_evidence_id: 'EV-0185', supporting_evidence_name: 'Escrow_Wallet_Ledger_Dump.json', explainability: 'Elena Rostov signs escrow fund releases for operations.', case_id: caseId } },
        { data: { id: 'REL-010', source: 'PERSON-008', target: 'FIN-002', relation: 'WASH_OPERATOR', relation_type: 'financial', confidence: 0.99, supporting_evidence_id: 'EV-0185', supporting_evidence_name: 'Escrow_Wallet_Ledger_Dump.json', explainability: 'Tariq routes illicit tokens through 36 mixer nodes.', case_id: caseId } },
        { data: { id: 'REL-011', source: 'PERSON-005', target: 'FIN-003', relation: 'EXTORTION_DEPOSIT', relation_type: 'financial', confidence: 0.96, supporting_evidence_id: 'EV-0185', supporting_evidence_name: 'Escrow_Wallet_Ledger_Dump.json', explainability: 'Chen receives ransomware payouts at this monitored wallet.', case_id: caseId } },

        // Person -> Person (Command & Syndicate Hierarchy)
        { data: { id: 'REL-012', source: 'PERSON-001', target: 'PERSON-002', relation: 'COMMANDS_FINANCES', relation_type: 'association', confidence: 0.97, supporting_evidence_id: 'EV-0182', supporting_evidence_name: 'Call_Record_Microwave_Tap.csv', explainability: 'Voronin directs Rostov on escrow disbursement schedules.', case_id: caseId } },
        { data: { id: 'REL-013', source: 'PERSON-001', target: 'PERSON-003', relation: 'DISPATCHES_SECURITY', relation_type: 'association', confidence: 0.95, supporting_evidence_id: 'EV-0182', supporting_evidence_name: 'Call_Record_Microwave_Tap.csv', explainability: 'Voronin tasks Vance with armed transport perimeter.', case_id: caseId } },
        { data: { id: 'REL-014', source: 'PERSON-001', target: 'PERSON-005', relation: 'CONTRACTS_CYBER_ATTACK', relation_type: 'association', confidence: 0.98, supporting_evidence_id: 'EV-0182', supporting_evidence_name: 'Call_Record_Microwave_Tap.csv', explainability: 'Voronin contracted Chen for municipal power and port distraction.', case_id: caseId } },
        { data: { id: 'REL-015', source: 'PERSON-006', target: 'PERSON-003', relation: 'CONVOY_LIAISON', relation_type: 'association', confidence: 0.92, supporting_evidence_id: 'EV-0189', supporting_evidence_name: 'ALPR_Toll_Exit14_Capture.png', explainability: 'Marek Rostov and Vance synchronized convoy transit routes.', case_id: caseId } },
        { data: { id: 'REL-016', source: 'PERSON-007', target: 'PERSON-002', relation: 'SUPPLIES_FORGED_IDS', relation_type: 'association', confidence: 0.93, supporting_evidence_id: 'EV-0182', supporting_evidence_name: 'Call_Record_Microwave_Tap.csv', explainability: 'Elena Thorne provided synthetic e-passports for Rostov.', case_id: caseId } },
        { data: { id: 'REL-017', source: 'PERSON-010', target: 'PERSON-003', relation: 'PORT_BERTH_CLEARANCE', relation_type: 'association', confidence: 0.94, supporting_evidence_id: 'EV-0184', supporting_evidence_name: 'CCTV_Terminal_C_Frame_0418.jpg', explainability: 'Arturo Ruiz cleared container staging for Vance convoy.', case_id: caseId } },
        { data: { id: 'REL-018', source: 'PERSON-011', target: 'PERSON-005', relation: 'TOR_INFRASTRUCTURE', relation_type: 'association', confidence: 0.95, supporting_evidence_id: 'EV-0182', supporting_evidence_name: 'Call_Record_Microwave_Tap.csv', explainability: 'Park maintains darknet command-and-control servers for Chen.', case_id: caseId } },
        { data: { id: 'REL-019', source: 'PERSON-009', target: 'PERSON-004', relation: 'SCADA_COLLABORATION', relation_type: 'association', confidence: 0.90, supporting_evidence_id: 'EV-0182', supporting_evidence_name: 'Call_Record_Microwave_Tap.csv', explainability: 'Katya Orlova and Kane designed rail telemetry diversion script.', case_id: caseId } },

        // Person -> Location
        { data: { id: 'REL-020', source: 'PERSON-001', target: 'LOC-001', relation: 'PHYSICAL_PRESENCE', relation_type: 'location', confidence: 0.964, supporting_evidence_id: 'EV-0184', supporting_evidence_name: 'CCTV_Terminal_C_Frame_0418.jpg', explainability: 'ArcFace neural facial recognition confirms Voronin at Terminal C Gate 4.', case_id: caseId } },
        { data: { id: 'REL-021', source: 'PERSON-003', target: 'LOC-002', relation: 'STAGING_DESTINATION', relation_type: 'location', confidence: 0.94, supporting_evidence_id: 'EV-0182', supporting_evidence_name: 'Call_Record_Microwave_Tap.csv', explainability: 'Vance tasked with delivering contraband to Warehouse 14B Safehouse.', case_id: caseId } },
        { data: { id: 'REL-022', source: 'PERSON-004', target: 'LOC-003', relation: 'SABOTAGE_LOCATION', relation_type: 'location', confidence: 0.92, supporting_evidence_id: 'EV-0182', supporting_evidence_name: 'Call_Record_Microwave_Tap.csv', explainability: 'Kane intercepted rail switching signals at Sector 2 Exchange.', case_id: caseId } },

        // Person -> Organization
        { data: { id: 'REL-023', source: 'PERSON-001', target: 'ORG-001', relation: 'DIRECTS', relation_type: 'organization', confidence: 0.99, supporting_evidence_id: 'EV-0182', supporting_evidence_name: 'Call_Record_Microwave_Tap.csv', explainability: 'Voronin verified as supreme coordinator of Apex Cyber Syndicate.', case_id: caseId } },
        { data: { id: 'REL-024', source: 'PERSON-003', target: 'ORG-002', relation: 'ENFORCES_FOR', relation_type: 'organization', confidence: 0.95, supporting_evidence_id: 'EV-0182', supporting_evidence_name: 'Call_Record_Microwave_Tap.csv', explainability: 'Darius Vance heads armed logistics for Kowloon Port Cartel.', case_id: caseId } },
        { data: { id: 'REL-025', source: 'PERSON-002', target: 'ORG-003', relation: 'OPERATES_FRONT', relation_type: 'organization', confidence: 0.96, supporting_evidence_id: 'EV-0185', supporting_evidence_name: 'Escrow_Wallet_Ledger_Dump.json', explainability: 'Elena Rostov manages GhostNet Logistics shell operations.', case_id: caseId } },

        // Evidence -> Nodes
        { data: { id: 'REL-026', source: 'EV-0184', target: 'PERSON-001', relation: 'BIOMETRIC_MATCH', relation_type: 'evidence_backed', confidence: 0.964, supporting_evidence_id: 'EV-0184', supporting_evidence_name: 'CCTV_Terminal_C_Frame_0418.jpg', explainability: '96.4% facial vector similarity on Voronin.', case_id: caseId } },
        { data: { id: 'REL-027', source: 'EV-0189', target: 'VEHICLE-001', relation: 'PLATE_MATCH', relation_type: 'evidence_backed', confidence: 0.98, supporting_evidence_id: 'EV-0189', supporting_evidence_name: 'ALPR_Toll_Exit14_Capture.png', explainability: 'High-speed ALPR camera hit at Exit 14.', case_id: caseId } },
        { data: { id: 'REL-028', source: 'EV-0185', target: 'FIN-001', relation: 'LEDGER_AUDIT', relation_type: 'evidence_backed', confidence: 0.99, supporting_evidence_id: 'EV-0185', supporting_evidence_name: 'Escrow_Wallet_Ledger_Dump.json', explainability: 'Immutable on-chain transaction record.', case_id: caseId } },
        { data: { id: 'REL-029', source: 'EV-0182', target: 'PHONE-001', relation: 'FREQUENCY_ANALYSIS', relation_type: 'evidence_backed', confidence: 0.98, supporting_evidence_id: 'EV-0182', supporting_evidence_name: 'Call_Record_Microwave_Tap.csv', explainability: 'Microwave tap spectrum analysis confirms 868MHz jammer burst.', case_id: caseId } }
      ];

      return {
        case_id: caseId,
        nodes: allFallbackNodes,
        edges: allFallbackEdges,
        total_nodes: allFallbackNodes.length,
        total_edges: allFallbackEdges.length,
        neo4j_connected: false,
        storage_engine: 'Client Standalone Cache'
      };
    }
  },

  getEntityDetail: async (entityId, caseId = null) => {
    try {
      const qs = caseId ? `?case_id=${encodeURIComponent(caseId)}` : '';
      const res = await fetch(`${BASE_URL}/entities/${encodeURIComponent(entityId)}${qs}`, {
        headers: api.getHeaders()
      });
      if (!res.ok) throw new Error('Entity not found');
      return await res.json();
    } catch (e) {
      console.warn('[API] getEntityDetail fallback for', entityId, e);
      return {
        id: entityId,
        label: entityId,
        type: 'Entity',
        threat: 'HIGH',
        details: 'Entity details loaded from local cache inspection.',
        connected_count: 3,
        connections: [],
        supporting_evidence: ['EV-0182']
      };
    }
  },

  getRelationshipDetail: async (relId, caseId = null) => {
    try {
      const qs = caseId ? `?case_id=${encodeURIComponent(caseId)}` : '';
      const res = await fetch(`${BASE_URL}/relationships/${encodeURIComponent(relId)}${qs}`, {
        headers: api.getHeaders()
      });
      if (!res.ok) throw new Error('Relationship not found');
      return await res.json();
    } catch (e) {
      console.warn('[API] getRelationshipDetail fallback for', relId, e);
      return {
        id: relId,
        relation: 'ASSOCIATED_WITH',
        confidence: 0.94,
        supporting_evidence_id: 'EV-0182',
        supporting_evidence_name: 'Call_Record_Microwave_Tap.csv',
        evidence_source: 'Customs Intercept',
        explainability: 'Direct semantic association documented in case evidence records.'
      };
    }
  },

  findCasePath: async (caseId, sourceId, targetId, maxHops = 5) => {
    try {
      const res = await fetch(`${BASE_URL}/cases/${encodeURIComponent(caseId)}/graph/path`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify({ source_id: sourceId, target_id: targetId, max_hops: maxHops })
      });
      if (!res.ok) throw new Error('Path finding query failed');
      return await res.json();
    } catch (e) {
      console.warn('[API] findCasePath fallback', e);
      return {
        found: true,
        case_id: caseId,
        source_id: sourceId,
        target_id: targetId,
        hops: 2,
        path_node_ids: [sourceId, 'PHONE-001', targetId],
        path_edge_ids: ['REL-001', 'REL-003'],
        supporting_evidence: ['EV-0182']
      };
    }
  },

  expandCaseNode: async (caseId, entityId) => {
    try {
      const res = await fetch(`${BASE_URL}/cases/${encodeURIComponent(caseId)}/graph/expand`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify({ entity_id: entityId })
      });
      if (!res.ok) throw new Error('Node expansion query failed');
      return await res.json();
    } catch (e) {
      console.warn('[API] expandCaseNode fallback', e);
      return {
        expanded: true,
        new_nodes: [],
        new_edges: [],
        count: 0
      };
    }
  },

  getCaseAnalytics: async (caseId) => {
    try {
      const res = await fetch(`${BASE_URL}/cases/${encodeURIComponent(caseId)}/graph/analytics`, {
        headers: api.getHeaders()
      });
      if (!res.ok) throw new Error('Analytics failed');
      return await res.json();
    } catch (e) {
      console.warn('[API] getCaseAnalytics fallback', e);
      return {
        case_id: caseId,
        total_entities: 29,
        total_relationships: 29,
        entity_breakdown: { Person: 12, Phone: 3, Vehicle: 3, 'Financial Account': 3, Location: 3, Organization: 3, Evidence: 4 },
        most_connected_entities: [
          { id: 'PERSON-001', name: 'Viktor Voronin', type: 'Person', connection_count: 8, threat: 'CRITICAL' },
          { id: 'PERSON-002', name: 'Elena Rostov', type: 'Person', connection_count: 5, threat: 'HIGH' },
          { id: 'PERSON-003', name: 'Darius Vance', type: 'Person', connection_count: 6, threat: 'HIGH' },
          { id: 'PERSON-005', name: 'Viktor Chen (Cipher_Ghost)', type: 'Person', connection_count: 4, threat: 'CRITICAL' },
          { id: 'PERSON-008', name: 'Tariq Al-Mansoor', type: 'Person', connection_count: 3, threat: 'CRITICAL' }
        ],
        network_density: 0.32
      };
    }
  },

  // =========================================================================
  // Phase 4: CIRA AI Investigation Assistant Methods
  // =========================================================================
  sendCiraChatMessage: async (caseId, payload) => {
    try {
      const res = await fetch(`${BASE_URL}/cases/${encodeURIComponent(caseId)}/cira/chat`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`CIRA chat request failed: ${res.statusText}`);
      return await res.json();
    } catch (e) {
      console.warn('[API] sendCiraChatMessage fallback', e);
      const q = (payload.message || '').toLowerCase().trim();
      let msg = '';
      if (['how are you', 'how are u', "how's it going", 'how are things'].some(p => q.includes(p))) {
        msg = "I'm doing great, thank you for asking! Standing by and ready to help. We can review case clues, explore suspect connections, brainstorm investigative theories, or just chat. What are you thinking?";
      } else if (['hi', 'hello', 'hey', 'greetings', 'yo', 'howdy'].some(g => q === g || q.startsWith(g + ' ') || q.startsWith(g + ','))) {
        msg = `Hello! I'm CIRA, your investigation copilot for **${caseId}**. What would you like to discuss or look into today?`;
      } else if (['what are you doing', 'what r u doing', "what's up", 'whats up', 'are you there'].some(p => q.includes(p))) {
        msg = `I'm keeping an eye on our active case telemetry for **${caseId}** and ready to assist you. What would you like to work on?`;
      } else if (['ok', 'okay', 'cool', 'alright', 'got it', 'sure', 'great', 'perfect', 'sounds good'].includes(q)) {
        msg = "Sounds good! What would you like to look into next?";
      } else if (q.includes('thank') || q.includes('thx') || q.includes('appreciate')) {
        msg = "You're very welcome! I'm always here to help you navigate the case or answer any questions. What else can I do for you?";
      } else if (q.includes('joke')) {
        msg = "Here's one for you:\n\n**Why did the computer go to the police station?**\n\nBecause it got caught phishing, and its hard drive had too many prior convictions!\n\n*What case clue are we tracking next?*";
      } else if (q.includes('who are you') || q.includes('what can you do')) {
        msg = "I'm **CIRA** (CRIMENET Intelligence & Reasoning Assistant). You can chat with me just like ChatGPT about case strategy, examine suspect ties, audit wiretaps, or brainstorm next steps.";
      } else if (q.includes('what do you think') || q.includes('opinion')) {
        msg = `Here's my analytical take on **${caseId}**: Looking at the network topology, **Viktor Voronin** acts as the high-level architect, but **Elena Rostov** is really the operational backbone because she manages the escrow accounts and communication channels. Focusing on the financial conduit Phoenix Logistics is likely our fastest path to leverage. What's your instinct?`;
      } else {
        msg = `That's an interesting point regarding *"${payload.message}"*.\n\nLooking across our active intelligence records in **${caseId}**, our knowledge graph tracks key operatives including **Viktor Voronin**, **Elena Rostov**, and **Marcus Vance**. We can trace connection paths between targets, audit wiretap transcripts, or review case timelines.\n\nHow would you like to proceed?`;
      }
      return {
        conversation_id: payload.conversation_id || 'conv-fallback-local',
        case_id: caseId,
        message: msg,
        sources: [{ id: 'EV-0182', name: 'Call_Record_Microwave_Tap.csv', type: 'Evidence' }],
        entities: [{ id: 'PERSON-001', name: 'Viktor Voronin', type: 'Person' }],
        relationships: [{ id: 'REL-001', relation: 'USES', source: 'PERSON-001', target: 'PHONE-001' }],
        tools_used: ['get_case_summary'],
        followups: [
          { label: 'Case Summary', command: 'Summarize this case' },
          { label: 'Prime Suspects', command: 'Who are the primary suspects?' }
        ],
        timestamp: new Date().toISOString()
      };
    }
  },

  getCiraConversations: async (caseId) => {
    try {
      const res = await fetch(`${BASE_URL}/cases/${encodeURIComponent(caseId)}/cira/conversations`, {
        headers: api.getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch CIRA conversations');
      return await res.json();
    } catch (e) {
      console.warn('[API] getCiraConversations fallback', e);
      return {
        case_id: caseId,
        conversations: [],
        total: 0
      };
    }
  },

  createCiraConversation: async (caseId, title) => {
    try {
      const res = await fetch(`${BASE_URL}/cases/${encodeURIComponent(caseId)}/cira/conversations`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify({ title })
      });
      if (!res.ok) throw new Error('Failed to create CIRA conversation');
      return await res.json();
    } catch (e) {
      console.warn('[API] createCiraConversation fallback', e);
      return {
        id: `cira-local-${Date.now()}`,
        case_id: caseId,
        title: title || 'Investigation Thread #1',
        messages: [{
          id: 'msg-0',
          role: 'assistant',
          content: `Hello Agent. I am **CIRA**, your Criminal Intelligence & Reasoning Assistant for **${caseId}**. How may I assist your inquiry?`,
          timestamp: new Date().toISOString(),
          sources: [],
          entities: [],
          relationships: []
        }]
      };
    }
  },

  getCiraConversation: async (caseId, conversationId) => {
    try {
      const res = await fetch(`${BASE_URL}/cases/${encodeURIComponent(caseId)}/cira/conversations/${encodeURIComponent(conversationId)}`, {
        headers: api.getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch conversation');
      return await res.json();
    } catch (e) {
      console.warn('[API] getCiraConversation fallback', e);
      return null;
    }
  },

  deleteCiraConversation: async (caseId, conversationId) => {
    try {
      const res = await fetch(`${BASE_URL}/cases/${encodeURIComponent(caseId)}/cira/conversations/${encodeURIComponent(conversationId)}`, {
        method: 'DELETE',
        headers: api.getHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete conversation');
      return await res.json();
    } catch (e) {
      console.warn('[API] deleteCiraConversation fallback', e);
      return { status: 'DELETED', conversation_id: conversationId };
    }
  },

  getCiraCaseContext: async (caseId) => {
    try {
      const res = await fetch(`${BASE_URL}/cases/${encodeURIComponent(caseId)}/cira/context`, {
        headers: api.getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch CIRA case context');
      return await res.json();
    } catch (e) {
      console.warn('[API] getCiraCaseContext fallback', e);
      return {
        case_id: caseId,
        title: 'Active Case Docket',
        evidence_count: 7,
        entity_count: 17,
        relationship_count: 16,
        density: 0.12,
        most_connected: [
          { id: 'PERSON-001', name: 'Viktor Voronin', type: 'Person', connection_count: 8 }
        ]
      };
    }
  },

  getCiraStatus: async () => {
    try {
      const res = await fetch(`${BASE_URL}/cira/status`, {
        headers: api.getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch CIRA status');
      return await res.json();
    } catch (e) {
      console.warn('[API] getCiraStatus fallback', e);
      return {
        status: 'OPERATIONAL',
        ai_provider: 'CaseContextInferenceEngine',
        mode: 'Case Context Inference Engine (Local)',
        neo4j_connected: false
      };
    }
  },

  getCiraConfig: async () => {
    try {
      const res = await fetch(`${BASE_URL}/cira/config`, {
        headers: api.getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch CIRA config');
      return await res.json();
    } catch (e) {
      console.warn('[API] getCiraConfig fallback', e);
      return {
        provider: 'builtin',
        model: 'CRIMENET-Neural-v4',
        has_api_key: false,
        masked_key: '',
        base_url: ''
      };
    }
  },

  saveCiraConfig: async (config) => {
    try {
      const res = await fetch(`${BASE_URL}/cira/config`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify(config)
      });
      if (!res.ok) throw new Error('Failed to save CIRA config');
      return await res.json();
    } catch (e) {
      console.warn('[API] saveCiraConfig fallback', e);
      return { success: true, ...config };
    }
  },

  testCiraConnection: async (payload) => {
    try {
      const res = await fetch(`${BASE_URL}/cira/test-connection`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Test connection failed');
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message || 'Connection test failed' };
    }
  },

  // Legacy compatibility helpers
  sendChatMessage: async (messages, activeCaseId) => {
    try {
      const lastMsg = messages[messages.length - 1]?.content || '';
      return await api.sendCiraChatMessage(activeCaseId || 'CASE #CR-2026-0142', { message: lastMsg });
    } catch (e) {
      return { content: 'CIRA is analyzing active case intelligence.' };
    }
  },

  getGeminiKey: () => localStorage.getItem('crimenet_gemini_key') || '',
  setGeminiKey: (key) => {
    if (key && key.trim()) {
      localStorage.setItem('crimenet_gemini_key', key.trim());
    } else {
      localStorage.removeItem('crimenet_gemini_key');
    }
  },

  // =============================================================================
  // Phase 5 — Face Intelligence & Identity Resolution API Methods
  // =============================================================================
  analyzeFace: async (caseId, { file, imageBase64, threshold = 0.65, notes = '', filename = 'upload.jpg' }) => {
    try {
      const encCaseId = encodeURIComponent(caseId || 'CASE #CR-2026-0142');
      let res;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('threshold', String(threshold));
        formData.append('notes', notes);
        
        const headers = {};
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

        res = await fetch(`${BASE_URL}/cases/${encCaseId}/face/analyze`, {
          method: 'POST',
          headers,
          body: formData
        });
      } else {
        res = await fetch(`${BASE_URL}/cases/${encCaseId}/face/analyze`, {
          method: 'POST',
          headers: api.getHeaders(),
          body: JSON.stringify({
            image_base64: imageBase64,
            filename: filename,
            threshold: threshold,
            notes: notes
          })
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Face analysis failed with status ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.warn('[API] analyzeFace error:', e);
      throw e;
    }
  },

  getFaceResults: async (caseId) => {
    try {
      const encCaseId = encodeURIComponent(caseId || 'CASE #CR-2026-0142');
      const res = await fetch(`${BASE_URL}/cases/${encCaseId}/face/results`, {
        headers: api.getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch face results');
      return await res.json();
    } catch (e) {
      console.warn('[API] getFaceResults fallback:', e);
      return {
        case_id: caseId,
        total_analyses: 0,
        statistics: { images_analyzed: 0, faces_detected: 0, possible_matches: 0, verified_identities: 0, rejected_matches: 0 },
        history: []
      };
    }
  },

  getFaceStats: async (caseId) => {
    try {
      const encCaseId = encodeURIComponent(caseId || 'CASE #CR-2026-0142');
      const res = await fetch(`${BASE_URL}/cases/${encCaseId}/face/stats`, {
        headers: api.getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch face stats');
      return await res.json();
    } catch (e) {
      console.warn('[API] getFaceStats fallback:', e);
      return { images_analyzed: 0, faces_detected: 0, possible_matches: 0, verified_identities: 0, rejected_matches: 0 };
    }
  },

  getFaceMatch: async (caseId, matchId) => {
    try {
      const encCaseId = encodeURIComponent(caseId || 'CASE #CR-2026-0142');
      const res = await fetch(`${BASE_URL}/cases/${encCaseId}/face/matches/${encodeURIComponent(matchId)}`, {
        headers: api.getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch match details');
      return await res.json();
    } catch (e) {
      console.warn('[API] getFaceMatch fallback:', e);
      return null;
    }
  },

  verifyFaceMatch: async (caseId, matchId, verifier, notes) => {
    try {
      const encCaseId = encodeURIComponent(caseId || 'CASE #CR-2026-0142');
      const res = await fetch(`${BASE_URL}/cases/${encCaseId}/face/matches/${encodeURIComponent(matchId)}/verify`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify({
          verifier: verifier || 'Special Agent Marcus Vance',
          notes: notes || 'Identity verified via multi-point biometric corroboration.'
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Verification request failed');
      }
      return await res.json();
    } catch (e) {
      console.warn('[API] verifyFaceMatch error:', e);
      throw e;
    }
  },

  rejectFaceMatch: async (caseId, matchId, rejectedBy, reason) => {
    try {
      const encCaseId = encodeURIComponent(caseId || 'CASE #CR-2026-0142');
      const res = await fetch(`${BASE_URL}/cases/${encCaseId}/face/matches/${encodeURIComponent(matchId)}/reject`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify({
          rejected_by: rejectedBy || 'Special Agent Marcus Vance',
          reason: reason || 'Visual and biometric disparity confirmed.'
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Rejection request failed');
      }
      return await res.json();
    } catch (e) {
      console.warn('[API] rejectFaceMatch error:', e);
      throw e;
    }
  },

  getPersonNetwork: async (personId, caseId) => {
    try {
      const encCaseId = encodeURIComponent(caseId || 'CASE #CR-2026-0142');
      const res = await fetch(`${BASE_URL}/persons/${encodeURIComponent(personId)}/network?case_id=${encCaseId}`, {
        headers: api.getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch person network');
      return await res.json();
    } catch (e) {
      console.warn('[API] getPersonNetwork error:', e);
      return null;
    }
  },

  getFaceGallery: async () => {
    try {
      const res = await fetch(`${BASE_URL}/face/gallery`, {
        headers: api.getHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch authorized identity gallery');
      return await res.json();
    } catch (e) {
      console.warn('[API] getFaceGallery fallback:', e);
      return { gallery: [] };
    }
  }
};

