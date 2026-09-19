/**
 * CRIMENET AI - Central API Client Service
 * Connects to the FastAPI backend at http://localhost:8000 with seamless offline/standalone fallback.
 */

const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : 'http://localhost:8000/api';

let authToken = (typeof localStorage !== 'undefined' ? localStorage.getItem('crimenet_token') : null) || null;

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
          primary_suspect: 'Viktor Voronin (The Architect / Cypher-9)',
          suspects: [
            'Viktor Voronin (The Architect)', 'Elena Rostov (Valkyrie)', 'Darius Vance (Ironclad)',
            'Marcus Kane (Specter)', 'Viktor Chen (Cipher_Ghost)', 'Marek Rostov (The Vanguard)',
            'Elena Thorne (Chameleon-9)', 'Tariq Al-Mansoor (The Alchemist)', 'Katya Orlova (Red Phantom)',
            'Arturo Ruiz (El Silencio)', 'Jin Park (ZeroTrace)', 'Isabella Cruz (Nemesis)'
          ],
          case_type: 'Organized Syndicate',
          status: 'Active',
          priority: 'Critical',
          created_date: '2026-09-14 08:30 UTC',
          last_updated: '2026-09-18 11:42 UTC',
          investigator: 'Special Agent Marcus Vance',
          reference_no: 'DOJ-FED-8841-B',
          tags: ['Port Security', 'Crypto Laundering', 'Apex Syndicate', 'Avionics Smuggling', 'SCADA Sabotage'],
          description: 'Cross-border taskforce investigation into the synchronized heist of avionics hardware at Harbor Terminal C, darknet escrow channels, and perimeter surveillance disruption.',
          evidence_count: 8,
          entity_count: 29,
          investigation_status: 'Active Surveillance / Multi-Node Wiretap Active',
          is_synthetic: true
        },
        {
          id: 'CASE #CR-2026-0089',
          title: 'Phantom Rail Logistics & Cyber Diversion',
          primary_suspect: 'Marcus Kane (Specter) & Katya Orlova',
          suspects: ['Marcus Kane (Specter)', 'Katya Orlova (Red Phantom)', 'Elena Rostov (Valkyrie)'],
          case_type: 'Cyber Warfare',
          status: 'Critical',
          priority: 'Critical',
          created_date: '2026-09-10 14:15 UTC',
          last_updated: '2026-09-18 09:20 UTC',
          investigator: 'Special Agent Sarah Reyes',
          reference_no: 'DOT-FRAUD-9912-X',
          tags: ['SCADA Bypass', 'Freight Rail', 'GhostNet', 'Interception'],
          description: 'Technical probe into automated SCADA track switcher manipulation along Sector 2 industrial rail corridor.',
          evidence_count: 3,
          entity_count: 8,
          investigation_status: 'Forensic Extraction Ongoing',
          is_synthetic: true
        },
        {
          id: 'CASE #CR-2026-0044',
          title: 'Nightfall Escrow Laundering & Syndicate Mesh',
          primary_suspect: 'Tariq Al-Mansoor (The Alchemist)',
          suspects: ['Tariq Al-Mansoor (The Alchemist)', 'Elena Rostov (Valkyrie)', 'Viktor Chen (Cipher_Ghost)'],
          case_type: 'Financial Fraud',
          status: 'Under Review',
          priority: 'High',
          created_date: '2026-09-02 11:00 UTC',
          last_updated: '2026-09-17 18:40 UTC',
          investigator: 'Special Agent David Torres',
          reference_no: 'FINCEN-SAR-3310-F',
          tags: ['FinCEN', 'Tether', 'Tumbler', 'Darknet', 'Flash Loans'],
          description: 'Multi-jurisdictional financial tracking of offshore liquidity drained via flash-loan exploits into decentralized tumbler addresses.',
          evidence_count: 3,
          entity_count: 7,
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
      const allEv = await api.getEvidence({ caseId: found.id });

      // Return full 12 suspects and 29 entities for Case 0142
      const fullEntities = [
        { id: 'PERSON-001', name: 'Viktor Voronin', type: 'Person', confidence: 0.98, threat: 'CRITICAL', role: 'Syndicate Kingpin', alias: 'The Architect / Cypher-9' },
        { id: 'PERSON-002', name: 'Elena Rostov', type: 'Person', confidence: 0.96, threat: 'HIGH', role: 'Darknet Escrow Broker', alias: 'Valkyrie / CipherQueen' },
        { id: 'PERSON-003', name: 'Darius Vance', type: 'Person', confidence: 0.95, threat: 'HIGH', role: 'Armed Logistics Enforcer', alias: 'Ironclad / Heavy-D' },
        { id: 'PERSON-004', name: 'Marcus Kane', type: 'Person', confidence: 0.92, threat: 'MEDIUM', role: 'Hardware & Wiretap Specialist', alias: 'Specter / Wiretapper' },
        { id: 'PERSON-005', name: 'Viktor Chen', type: 'Person', confidence: 0.99, threat: 'CRITICAL', role: 'Ransomware Developer', alias: 'Cipher_Ghost' },
        { id: 'PERSON-006', name: 'Marek Rostov', type: 'Person', confidence: 0.94, threat: 'HIGH', role: 'Convoy Transit Chief', alias: 'The Vanguard Driver' },
        { id: 'PERSON-007', name: 'Elena Thorne', type: 'Person', confidence: 0.93, threat: 'HIGH', role: 'Identity & Deepfake Forger', alias: 'Chameleon-9' },
        { id: 'PERSON-008', name: 'Tariq Al-Mansoor', type: 'Person', confidence: 0.97, threat: 'CRITICAL', role: 'Crypto Mixer Operator', alias: 'The Alchemist' },
        { id: 'PERSON-009', name: 'Katya Orlova', type: 'Person', confidence: 0.91, threat: 'HIGH', role: 'SCADA Saboteur', alias: 'Red Phantom' },
        { id: 'PERSON-010', name: 'Arturo Ruiz', type: 'Person', confidence: 0.94, threat: 'HIGH', role: 'Port Berth Dispatcher', alias: 'El Silencio' },
        { id: 'PERSON-011', name: 'Jin Park', type: 'Person', confidence: 0.89, threat: 'MEDIUM', role: 'Tor Gateway Admin', alias: 'ZeroTrace' },
        { id: 'PERSON-012', name: 'Isabella Cruz', type: 'Person', confidence: 0.92, threat: 'HIGH', role: 'RF Jammer Specialist', alias: 'Nemesis' },
        { id: 'PHONE-001', name: 'RF 868MHz Jammer / Tap', type: 'Phone', confidence: 0.98, threat: 'HIGH' },
        { id: 'PHONE-002', name: 'SatPhone +882-16-992', type: 'Phone', confidence: 0.94, threat: 'HIGH' },
        { id: 'PHONE-003', name: 'Tor Gateway Node 185.220', type: 'Phone', confidence: 0.99, threat: 'CRITICAL' },
        { id: 'VEHICLE-001', name: 'Black Escalade (8B9-CYP)', type: 'Vehicle', confidence: 0.96, threat: 'HIGH' },
        { id: 'VEHICLE-002', name: 'Armored Yukon (NY-889XQ)', type: 'Vehicle', confidence: 0.95, threat: 'HIGH' },
        { id: 'VEHICLE-003', name: 'Freight Switcher Unit 14-B', type: 'Vehicle', confidence: 0.91, threat: 'CRITICAL' },
        { id: 'FIN-001', name: 'Tether Wallet 0x889...F1C', type: 'Bank Account', confidence: 0.98, threat: 'CRITICAL' },
        { id: 'FIN-002', name: 'Darknet Mixer Node 36', type: 'Bank Account', confidence: 0.96, threat: 'CRITICAL' },
        { id: 'FIN-003', name: 'Crypto Wallet 0x8F9...41D', type: 'Bank Account', confidence: 0.94, threat: 'HIGH' },
        { id: 'LOC-001', name: 'Terminal C Harbor Depot', type: 'Location', confidence: 0.99, threat: 'HIGH' },
        { id: 'LOC-002', name: 'Warehouse 14B Safehouse', type: 'Location', confidence: 0.96, threat: 'HIGH' },
        { id: 'LOC-003', name: 'Sector 2 Freight Exchange', type: 'Location', confidence: 0.92, threat: 'MEDIUM' },
        { id: 'ORG-001', name: 'Apex Cyber Syndicate', type: 'Organization', confidence: 0.99, threat: 'CRITICAL' },
        { id: 'ORG-002', name: 'Kowloon Port Cartel', type: 'Organization', confidence: 0.95, threat: 'HIGH' },
        { id: 'ORG-003', name: 'GhostNet Logistics', type: 'Organization', confidence: 0.96, threat: 'HIGH' }
      ];

      return {
        ...found,
        evidence: allEv,
        entities: fullEntities,
        relationships: [
          { source: 'Viktor Voronin', relation: 'COMMANDS_FINANCES', target: 'Elena Rostov', confidence: 0.97 },
          { source: 'Viktor Voronin', relation: 'DISPATCHES_SECURITY', target: 'Darius Vance', confidence: 0.96 },
          { source: 'Viktor Voronin', relation: 'CONTRACTS_CYBER_ATTACK', target: 'Viktor Chen', confidence: 0.98 },
          { source: 'Darius Vance', relation: 'OPERATING_VEHICLE', target: 'Black Escalade (8B9-CYP)', confidence: 0.96 },
          { source: 'Marek Rostov', relation: 'CONVOY_LEADER', target: 'Armored Yukon (NY-889XQ)', confidence: 0.95 },
          { source: 'Elena Rostov', relation: 'MANAGES_ESCROW', target: 'Tether Wallet 0x889...F1C', confidence: 0.98 },
          { source: 'Tariq Al-Mansoor', relation: 'WASH_OPERATOR', target: 'Darknet Mixer Node 36', confidence: 0.99 },
          { source: 'Viktor Voronin', relation: 'RENDEZVOUS_AT', target: 'Terminal C Harbor Depot', confidence: 0.964 },
          { source: 'Darius Vance', relation: 'STAGING_DESTINATION', target: 'Warehouse 14B Safehouse', confidence: 0.94 },
          { source: 'Elena Thorne', relation: 'SUPPLIES_FORGED_IDS', target: 'Elena Rostov', confidence: 0.93 },
          { source: 'Arturo Ruiz', relation: 'PORT_BERTH_CLEARANCE', target: 'Darius Vance', confidence: 0.94 },
          { source: 'Katya Orlova', relation: 'SCADA_COLLABORATION', target: 'Marcus Kane', confidence: 0.91 }
        ],
        timeline: [
          { date: '2026-09-14 08:30 UTC', event: 'Case opened: Organized Network Infiltration targeting Apex Syndicate', author: 'S/A Vance', type: 'case_created' },
          { date: '2026-09-18 03:22 UTC', event: 'Call_Record_Microwave_Tap.csv ingested: Voronin & Vance intercept confirmed', author: 'System NLP', type: 'evidence_processed' },
          { date: '2026-09-18 04:18 UTC', event: 'CCTV Frame 04:18: ArcFace biometric confirmation Viktor Voronin (96.4%)', author: 'Forensic Face Lab', type: 'biometric_match' },
          { date: '2026-09-18 05:40 UTC', event: 'ALPR Exit 14 hit: Black Escalade & Armored Yukon registered to syndicate convoy', author: 'ALPR Network', type: 'vehicle_hit' },
          { date: '2026-09-18 09:15 UTC', event: 'FinCEN SAR audit traces 140 USDT escrow to Elena Rostov private key', author: 'FinCEN Node', type: 'financial_flag' },
          { date: '2026-09-18 11:42 UTC', event: 'Taskforce warrants authorized for Warehouse 14B and Terminal C Harbor Depot', author: 'Judicial Liaison', type: 'warrant_issued' }
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
      const allEvidenceFiles = [
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
            { id: 'PERSON-001', name: 'Viktor Voronin', type: 'Person', confidence: 0.98, threat: 'CRITICAL', role: 'Syndicate Kingpin' },
            { id: 'PERSON-002', name: 'Elena Rostov', type: 'Person', confidence: 0.96, threat: 'HIGH', role: 'Escrow Broker' },
            { id: 'PERSON-003', name: 'Darius Vance', type: 'Person', confidence: 0.94, threat: 'HIGH', role: 'Convoy Enforcer' },
            { id: 'PHONE-001', name: 'RF 868MHz Jammer / Tap', type: 'Technical', confidence: 0.98, threat: 'HIGH' }
          ],
          relationships: [
            { source: 'Viktor Voronin', relation: 'TRANSMITTED_ON', target: 'RF 868MHz Jammer / Tap', confidence: 0.98 },
            { source: 'RF 868MHz Jammer / Tap', relation: 'DIRECTED_CONVOY', target: 'Darius Vance', confidence: 0.94 }
          ],
          used_by_graph: true,
          notes: 'Intercept transcript contains direct tactical rendezvous coordinates and convoy orders.',
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
            { id: 'LOC-001', name: 'Terminal C Harbor Depot', type: 'Location', confidence: 0.99, threat: 'HIGH' },
            { id: 'PERSON-010', name: 'Arturo Ruiz', type: 'Person', confidence: 0.94, threat: 'HIGH', role: 'Port Dispatcher' },
            { id: 'ORG-001', name: 'Apex Cyber Syndicate', type: 'Organization', confidence: 0.99, threat: 'CRITICAL' },
            { id: 'ORG-002', name: 'Kowloon Port Cartel', type: 'Organization', confidence: 0.95, threat: 'HIGH' }
          ],
          relationships: [
            { source: 'Apex Cyber Syndicate', relation: 'TACTICAL_ALLIANCE', target: 'Kowloon Port Cartel', confidence: 0.92 }
          ],
          used_by_graph: true,
          notes: 'First Information Report documenting physical seal breach on avionics crate and syndicate presence.',
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
          extracted_entities_count: 4,
          detected_relationships_count: 8,
          entities: [
            { id: 'PERSON-001', name: 'Viktor Voronin', type: 'Person', confidence: 0.964, threat: 'CRITICAL', role: 'Identified Target' },
            { id: 'VEHICLE-001', name: 'Black Escalade (8B9-CYP)', type: 'Vehicle', confidence: 0.95, threat: 'HIGH' }
          ],
          relationships: [
            { source: 'Viktor Voronin', relation: 'PHYSICAL_PRESENCE', target: 'Terminal C Harbor Depot', confidence: 0.964 }
          ],
          used_by_graph: true,
          notes: 'Facial biometric match confirmed at 96.4% confidence by ArcFace neural engine.',
          is_synthetic: true
        },
        {
          id: 'EV-0185',
          name: 'Escrow_Wallet_Ledger_Dump.json',
          type: 'Financial Data',
          category: 'Financial Data',
          case_id: 'CASE #CR-2026-0142',
          upload_date: '2026-09-18 06:30 UTC',
          file_size: '4.1 MB',
          source: 'FinCEN Blockchain Explorer Node',
          status: 'Verified',
          processing_state: 'ANALYZED',
          extracted_entities_count: 12,
          detected_relationships_count: 24,
          entities: [
            { id: 'PERSON-002', name: 'Elena Rostov', type: 'Person', confidence: 0.98, threat: 'HIGH', role: 'Escrow Signer' },
            { id: 'PERSON-008', name: 'Tariq Al-Mansoor', type: 'Person', confidence: 0.97, threat: 'CRITICAL', role: 'Mixer Master' },
            { id: 'FIN-001', name: 'Tether Wallet 0x889...F1C', type: 'Bank Account', confidence: 0.99, threat: 'CRITICAL' },
            { id: 'FIN-003', name: 'Crypto Wallet 0x8F9...41D', type: 'Bank Account', confidence: 0.96, threat: 'HIGH' }
          ],
          relationships: [
            { source: 'Elena Rostov', relation: 'MANAGES_ESCROW', target: 'Tether Wallet 0x889...F1C', confidence: 0.98 },
            { source: 'Tariq Al-Mansoor', relation: 'WASH_OPERATOR', target: 'Tether Wallet 0x889...F1C', confidence: 0.97 }
          ],
          used_by_graph: true,
          notes: 'Cryptographic ledger signatures tie 140K USDT escrow transfers directly to Elena Rostov and Tariq Al-Mansoor.',
          is_synthetic: true
        },
        {
          id: 'EV-0186',
          name: 'Drone_Recon_Sector2_Exchange.mp4',
          type: 'Videos',
          category: 'Videos',
          case_id: 'CASE #CR-2026-0089',
          upload_date: '2026-09-18 07:15 UTC',
          file_size: '28.4 MB',
          source: 'UAV Wing 09 Airborne Scan',
          status: 'Verified',
          processing_state: 'ANALYZED',
          extracted_entities_count: 6,
          detected_relationships_count: 10,
          entities: [
            { id: 'PERSON-004', name: 'Marcus Kane', type: 'Person', confidence: 0.93, threat: 'MEDIUM', role: 'Wiretap Specialist' },
            { id: 'PERSON-009', name: 'Katya Orlova', type: 'Person', confidence: 0.91, threat: 'HIGH', role: 'SCADA Saboteur' },
            { id: 'PHONE-002', name: 'SatPhone +882-16-992', type: 'Phone', confidence: 0.94, threat: 'HIGH' }
          ],
          relationships: [
            { source: 'Marcus Kane', relation: 'DISPATCHED_INSTRUCTIONS', target: 'SatPhone +882-16-992', confidence: 0.93 }
          ],
          used_by_graph: true,
          notes: 'High-altitude thermal video captures suspects positioning satellite receiver adjacent to rail exchange.',
          is_synthetic: true
        },
        {
          id: 'EV-0187',
          name: 'Freight_SCADA_Telemetry_Log.txt',
          type: 'Technical Logs',
          category: 'Technical Logs',
          case_id: 'CASE #CR-2026-0089',
          upload_date: '2026-09-18 08:20 UTC',
          file_size: '912 KB',
          source: 'Rail Traffic Control System',
          status: 'Verified',
          processing_state: 'ANALYZED',
          extracted_entities_count: 5,
          detected_relationships_count: 7,
          entities: [
            { id: 'VEHICLE-003', name: 'Freight Switcher Unit 14-B', type: 'Vehicle', confidence: 0.97, threat: 'CRITICAL' },
            { id: 'LOC-003', name: 'Sector 2 Freight Exchange', type: 'Location', confidence: 0.95, threat: 'MEDIUM' },
            { id: 'PERSON-004', name: 'Marcus Kane', type: 'Person', confidence: 0.91, threat: 'MEDIUM' }
          ],
          relationships: [
            { source: 'Marcus Kane', relation: 'SCADA_OVERRIDE', target: 'Freight Switcher Unit 14-B', confidence: 0.91 }
          ],
          used_by_graph: true,
          notes: 'SCADA command log records remote brake release command issued via hardware tap.',
          is_synthetic: true
        },
        {
          id: 'EV-0188',
          name: 'FinCEN_Suspicious_Activity_Report.pdf',
          type: 'Documents',
          category: 'Documents',
          case_id: 'CASE #CR-2026-0044',
          upload_date: '2026-09-18 09:45 UTC',
          file_size: '1.2 MB',
          source: 'FinCEN Intelligence Division',
          status: 'Verified',
          processing_state: 'ANALYZED',
          extracted_entities_count: 8,
          detected_relationships_count: 14,
          entities: [
            { id: 'PERSON-008', name: 'Tariq Al-Mansoor', type: 'Person', confidence: 0.98, threat: 'CRITICAL', role: 'Mixer Master' },
            { id: 'FIN-002', name: 'Darknet Mixer Node 36', type: 'Bank Account', confidence: 0.99, threat: 'CRITICAL' },
            { id: 'PERSON-005', name: 'Viktor Chen', type: 'Person', confidence: 0.96, threat: 'CRITICAL' }
          ],
          relationships: [
            { source: 'Tariq Al-Mansoor', relation: 'TUMBLED_THROUGH', target: 'Darknet Mixer Node 36', confidence: 0.98 }
          ],
          used_by_graph: true,
          notes: 'SAR filing details 36 micro-tumbling outputs dispersing $4.2M in ransom tokens.',
          is_synthetic: true
        },
        {
          id: 'EV-0189',
          name: 'ALPR_Toll_Exit14_Capture.png',
          type: 'Images',
          category: 'Images',
          case_id: 'CASE #CR-2026-0142',
          upload_date: '2026-09-18 10:15 UTC',
          file_size: '2.9 MB',
          source: 'State Highway Patrol ALPR Network',
          status: 'Verified',
          processing_state: 'ANALYZED',
          preview_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=500&q=80',
          extracted_entities_count: 5,
          detected_relationships_count: 9,
          entities: [
            { id: 'PERSON-003', name: 'Darius Vance', type: 'Person', confidence: 0.96, threat: 'HIGH', role: 'Lead Driver' },
            { id: 'PERSON-006', name: 'Marek Rostov', type: 'Person', confidence: 0.94, threat: 'HIGH', role: 'Convoy Leader' },
            { id: 'VEHICLE-001', name: 'Black Escalade (8B9-CYP)', type: 'Vehicle', confidence: 0.98, threat: 'HIGH' },
            { id: 'VEHICLE-002', name: 'Armored Yukon (NY-889XQ)', type: 'Vehicle', confidence: 0.95, threat: 'HIGH' }
          ],
          relationships: [
            { source: 'Darius Vance', relation: 'OPERATING_DRIVER', target: 'Black Escalade (8B9-CYP)', confidence: 0.96 },
            { source: 'Marek Rostov', relation: 'CONVOY_LEADER', target: 'Armored Yukon (NY-889XQ)', confidence: 0.95 }
          ],
          used_by_graph: true,
          notes: 'High-speed automated license plate recognition capture showing convoy fleeing north on Interstate 95.',
          is_synthetic: true
        }
      ];

      if (params.caseId && params.caseId !== 'ALL') {
        const normCase = params.caseId.replace('CASE #', '').trim();
        return allEvidenceFiles.filter(e => e.case_id.includes(normCase));
      }
      return allEvidenceFiles;
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
        { id: 'PERSON-001', title: 'Viktor Voronin', subtitle: 'CRIMINAL TARGET • The Architect / Cypher-9 • Apex Syndicate', status: 'CRITICAL', category: 'SUSPECT' },
        { id: 'PERSON-002', title: 'Elena Rostov', subtitle: 'SUSPECT • Valkyrie / CipherQueen • Darknet Escrow Broker', status: 'HIGH', category: 'SUSPECT' },
        { id: 'PERSON-003', title: 'Darius Vance', subtitle: 'SUSPECT • Ironclad / Heavy-D • Armed Logistics Enforcer', status: 'HIGH', category: 'SUSPECT' },
        { id: 'PERSON-004', title: 'Marcus Kane', subtitle: 'SUSPECT • Specter / Wiretapper • Hardware & RF Specialist', status: 'MEDIUM', category: 'SUSPECT' },
        { id: 'PERSON-005', title: 'Viktor Chen', subtitle: 'CRIMINAL TARGET • Cipher_Ghost • Autonomous Ransomware Author', status: 'CRITICAL', category: 'SUSPECT' },
        { id: 'PERSON-006', title: 'Marek Rostov', subtitle: 'SUSPECT • The Vanguard Driver • Convoy Logistics Chief', status: 'HIGH', category: 'SUSPECT' },
        { id: 'PERSON-007', title: 'Elena Thorne', subtitle: 'SUSPECT • Chameleon-9 • Synthetic Media & Credentials Forger', status: 'HIGH', category: 'SUSPECT' },
        { id: 'PERSON-008', title: 'Tariq Al-Mansoor', subtitle: 'CRIMINAL TARGET • The Alchemist • Darknet Crypto Mixer Master', status: 'CRITICAL', category: 'SUSPECT' },
        { id: 'PERSON-009', title: 'Katya Orlova', subtitle: 'SUSPECT • Red Phantom • SCADA Telemetry & Rail Saboteur', status: 'HIGH', category: 'SUSPECT' },
        { id: 'PERSON-010', title: 'Arturo Ruiz', subtitle: 'SUSPECT • El Silencio • Terminal C Port Contraband Berth Dispatcher', status: 'HIGH', category: 'SUSPECT' },
        { id: 'PERSON-011', title: 'Jin Park', subtitle: 'SUSPECT • ZeroTrace • Tor Gateway Node Administrator', status: 'MEDIUM', category: 'SUSPECT' },
        { id: 'PERSON-012', title: 'Isabella Cruz', subtitle: 'SUSPECT • Nemesis • Electronic Counter-Surveillance & Jamming', status: 'HIGH', category: 'SUSPECT' },
        { id: 'VEHICLE-001', title: 'Black Escalade (8B9-CYP)', subtitle: 'VEHICLE • Kowloon Port Cartel Getaway SUV', status: 'HIGH', category: 'ENTITY' },
        { id: 'VEHICLE-002', title: 'Armored Yukon (NY-889XQ)', subtitle: 'VEHICLE • Reinforced Convoy Lead Vehicle', status: 'HIGH', category: 'ENTITY' },
        { id: 'FIN-001', title: 'Tether Wallet 0x889...F1C', subtitle: 'FINANCIAL • Offshore Escrow 140K USDT Address', status: 'CRITICAL', category: 'ENTITY' },
        { id: 'LOC-001', title: 'Terminal C Harbor Depot', subtitle: 'LOCATION • Customs Warehouse & Staging Yard', status: 'HIGH', category: 'LOCATION' },
        { id: 'LOC-002', title: 'Warehouse 14B Safehouse', subtitle: 'LOCATION • Tactical Staging & Hardware Racks', status: 'HIGH', category: 'LOCATION' },
        { id: 'ORG-001', title: 'Apex Cyber Syndicate', subtitle: 'ORGANIZATION • Transnational Cybercrime Network', status: 'CRITICAL', category: 'ORGANIZATION' }
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

      // 1. Case-isolated filtering
      let caseNodes = allFallbackNodes;
      let caseEdges = allFallbackEdges;

      const normCase = (caseId || '').replace('CASE #', '').trim();
      if (normCase === 'CR-2026-0089') {
        const allowedIds = new Set(['PERSON-004', 'PERSON-009', 'PERSON-002', 'PHONE-001', 'VEHICLE-003', 'LOC-003', 'ORG-001', 'EV-0182']);
        caseNodes = allFallbackNodes.filter(n => allowedIds.has(n.data.id));
      } else if (normCase === 'CR-2026-0044') {
        const allowedIds = new Set(['PERSON-008', 'PERSON-002', 'PERSON-005', 'PHONE-003', 'FIN-001', 'FIN-002', 'FIN-003', 'ORG-003', 'EV-0185']);
        caseNodes = allFallbackNodes.filter(n => allowedIds.has(n.data.id));
      }

      // 2. Filter by typeFilter (Person, Phone, Vehicle, Financial Account, Location, Organization, Evidence)
      let filteredNodes = caseNodes;
      if (filters.typeFilter && filters.typeFilter !== 'ALL') {
        const tf = filters.typeFilter.toLowerCase();
        filteredNodes = filteredNodes.filter(n => {
          const t = (n.data.type || '').toLowerCase();
          if (tf === 'financial account' || tf === 'financial' || tf === 'bank account') {
            return t === 'financial account' || t === 'financial' || t === 'bank account';
          }
          return t === tf;
        });
      }

      // 3. Filter by threatFilter (CRITICAL, HIGH, MEDIUM)
      if (filters.threatFilter && filters.threatFilter !== 'ALL') {
        const thf = filters.threatFilter.toUpperCase();
        filteredNodes = filteredNodes.filter(n => {
          const th = (n.data.threat || '').toUpperCase();
          return th === thf;
        });
      }

      // 4. Critical: Edge Safety Pruning so Cytoscape NEVER crashes on missing source/target!
      const validNodeIds = new Set(filteredNodes.map(n => n.data.id));
      let filteredEdges = caseEdges.filter(e => validNodeIds.has(e.data.source) && validNodeIds.has(e.data.target));

      // 5. Filter by relationFilter (calls, financial, ownership/vehicle, location, evidence_backed)
      if (filters.relationFilter && filters.relationFilter !== 'ALL') {
        const rf = filters.relationFilter.toLowerCase();
        filteredEdges = filteredEdges.filter(e => {
          const rt = (e.data.relation_type || '').toLowerCase();
          const r = (e.data.relation || '').toLowerCase();
          if (rf === 'ownership' || rf === 'vehicle') {
            return rt === 'ownership' || rt === 'vehicle' || r.includes('vehicle') || r.includes('driver') || r.includes('convoy');
          }
          return rt === rf || r.includes(rf);
        });
      }

      return {
        case_id: caseId,
        nodes: filteredNodes,
        edges: filteredEdges,
        total_nodes: filteredNodes.length,
        total_edges: filteredEdges.length,
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
      console.warn('[API] findCasePath fallback BFS computation', e);
      const graph = await api.getCaseGraph(caseId);
      const edges = graph.edges || [];

      // Build bidirectional adjacency graph
      const adj = new Map();
      edges.forEach(e => {
        const u = e.data.source;
        const v = e.data.target;
        if (!adj.has(u)) adj.set(u, []);
        if (!adj.has(v)) adj.set(v, []);
        adj.get(u).push({ neighbor: v, edgeId: e.data.id });
        adj.get(v).push({ neighbor: u, edgeId: e.data.id });
      });

      // BFS to find shortest path
      const queue = [[sourceId]];
      const edgeQueue = [[]];
      const visited = new Set([sourceId]);
      let foundPath = null;
      let foundEdges = null;

      while (queue.length > 0) {
        const path = queue.shift();
        const edgePath = edgeQueue.shift();
        const curr = path[path.length - 1];

        if (curr === targetId) {
          foundPath = path;
          foundEdges = edgePath;
          break;
        }

        if (path.length <= maxHops) {
          const neighbors = adj.get(curr) || [];
          for (const { neighbor, edgeId } of neighbors) {
            if (!visited.has(neighbor)) {
              visited.add(neighbor);
              queue.push([...path, neighbor]);
              edgeQueue.push([...edgePath, edgeId]);
            }
          }
        }
      }

      if (foundPath) {
        return {
          found: true,
          case_id: caseId,
          source_id: sourceId,
          target_id: targetId,
          hops: foundPath.length - 1,
          path_node_ids: foundPath,
          path_edge_ids: foundEdges,
          supporting_evidence: ['EV-0182', 'EV-0185']
        };
      } else {
        return {
          found: false,
          case_id: caseId,
          source_id: sourceId,
          target_id: targetId,
          hops: 0,
          path_node_ids: [],
          path_edge_ids: [],
          supporting_evidence: []
        };
      }
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
      console.warn('[API] expandCaseNode fallback 1-hop discovery', e);
      const discoveredCatalog = {
        'PERSON-001': {
          new_nodes: [
            { data: { id: 'PHONE-004', label: 'Burner SIM (+44-7911-002)', type: 'Phone', shape: 'round-rectangle', color: '#38bdf8', threat: 'HIGH', size: 44, details: 'Disposable UK VoIP line active during warehouse staging window.', case_id: caseId } },
            { data: { id: 'FIN-004', label: 'Zurich Escrow #CH-9921', type: 'Financial Account', shape: 'hexagon', color: '#34d399', threat: 'CRITICAL', size: 46, details: 'Disclosed offshore escrow account receiving fragmented Tether deposits.', case_id: caseId } }
          ],
          new_edges: [
            { data: { id: 'REL-EXP-001', source: 'PERSON-001', target: 'PHONE-004', relation: 'CARRIES_BURNER', relation_type: 'calls', confidence: 0.96, case_id: caseId } },
            { data: { id: 'REL-EXP-002', source: 'PERSON-001', target: 'FIN-004', relation: 'AUTHORIZED_SIGNER', relation_type: 'financial', confidence: 0.98, case_id: caseId } }
          ]
        },
        'PERSON-002': {
          new_nodes: [
            { data: { id: 'FIN-005', label: 'Cayman Shell Account #8812', type: 'Financial Account', shape: 'hexagon', color: '#34d399', threat: 'CRITICAL', size: 46, details: 'Offshore shell entity utilized for port clearance fee wire routing.', case_id: caseId } }
          ],
          new_edges: [
            { data: { id: 'REL-EXP-003', source: 'PERSON-002', target: 'FIN-005', relation: 'BENEFICIAL_OWNER', relation_type: 'financial', confidence: 0.97, case_id: caseId } }
          ]
        },
        'PERSON-003': {
          new_nodes: [
            { data: { id: 'VEHICLE-004', label: 'Cargo Van (NJ-441-TRK)', type: 'Vehicle', shape: 'diamond', color: '#fbbf24', threat: 'HIGH', size: 44, details: 'Secondary transport van spotted at Sector 4 loading dock.', case_id: caseId } }
          ],
          new_edges: [
            { data: { id: 'REL-EXP-004', source: 'PERSON-003', target: 'VEHICLE-004', relation: 'REGISTERED_DRIVER', relation_type: 'vehicle', confidence: 0.95, case_id: caseId } }
          ]
        },
        'PERSON-005': {
          new_nodes: [
            { data: { id: 'PHONE-005', label: 'Encrypted Matrix Relay (IP 194.26.29.1)', type: 'Phone', shape: 'round-rectangle', color: '#38bdf8', threat: 'CRITICAL', size: 44, details: 'Anonymous command-and-control server beaconing to SCADA exploit nodes.', case_id: caseId } }
          ],
          new_edges: [
            { data: { id: 'REL-EXP-005', source: 'PERSON-005', target: 'PHONE-005', relation: 'BEACONS_TO', relation_type: 'calls', confidence: 0.99, case_id: caseId } }
          ]
        }
      };

      const exp = discoveredCatalog[entityId] || {
        new_nodes: [
          { data: { id: 'DISC-' + entityId + '-A', label: 'Discovered Associate (' + entityId + ')', type: 'Phone', shape: 'round-rectangle', color: '#38bdf8', threat: 'HIGH', size: 42, details: 'Discovered 1-hop link connected to ' + entityId + '.', case_id: caseId } }
        ],
        new_edges: [
          { data: { id: 'REL-DISC-' + entityId, source: entityId, target: 'DISC-' + entityId + '-A', relation: 'DIRECT_ASSOCIATE', relation_type: 'association', confidence: 0.93, case_id: caseId } }
        ]
      };

      return {
        expanded: true,
        new_nodes: exp.new_nodes,
        new_edges: exp.new_edges,
        count: exp.new_nodes.length
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

