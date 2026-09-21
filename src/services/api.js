/**
 * CRIMENET AI - Canonical API Client & Response Contract
 * Centralizes all HTTP communication, token management, timeout handling,
 * request cancellation, and normalized error propagation.
 * ZERO silent mock fallbacks: Backend denial, offline status, and validation
 * errors are communicated truthfully to callers.
 */

import { getApiBaseUrl, ENV_CONFIG } from '../config/env.js';

let inMemoryToken = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('crimenet_token')) || null;

export class ApiError extends Error {
  constructor(message, status = 0, detail = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
    this.isOffline = status === 0 || message.includes('Failed to fetch') || message.includes('NetworkError');
    this.isUnauthorized = status === 401;
    this.isForbidden = status === 403;
    this.isTimeout = status === 408 || message.includes('timed out');
  }
}

async function request(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  // Inject in-memory bearer token if present
  if (inMemoryToken) {
    headers['Authorization'] = `Bearer ${inMemoryToken}`;
  }

  // Handle json payload
  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  // Timeout handling via AbortController
  const timeoutMs = options.timeoutMs || ENV_CONFIG.defaultTimeoutMs;
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(new Error('Request timed out')), timeoutMs);

  // Link caller signal with timeout signal
  const signal = options.signal
    ? anySignal([options.signal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const res = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body,
      credentials: 'include',
      signal
    });

    clearTimeout(timeoutId);

    // Parse JSON or text
    const contentType = res.headers.get('content-type') || '';
    let data = null;
    if (contentType.includes('application/json')) {
      data = await res.json().catch(() => null);
    } else {
      data = await res.text().catch(() => null);
    }

    if (!res.ok) {
      const errorDetail = (data && data.detail) ? data.detail : res.statusText;
      throw new ApiError(errorDetail || `HTTP Error ${res.status}`, res.status, data);
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) {
      throw err;
    }
    if (err.name === 'AbortError' || err.message?.includes('abort')) {
      throw new ApiError('Request was cancelled or timed out.', 408);
    }
    throw new ApiError(err.message || 'Network request failed. Backend may be offline.', 0);
  }
}

// Helper to combine signals
function anySignal(signals) {
  const controller = new AbortController();
  for (const s of signals) {
    if (!s) continue;
    if (s.aborted) {
      controller.abort(s.reason);
      return s;
    }
    s.addEventListener('abort', () => controller.abort(s.reason), { once: true });
  }
  return controller.signal;
}

export const api = {
  // ── Token Management ───────────────────────────────────────────────────────
  setToken: (token) => {
    inMemoryToken = token;
    if (typeof sessionStorage !== 'undefined') {
      if (token) {
        sessionStorage.setItem('crimenet_token', token);
      } else {
        sessionStorage.removeItem('crimenet_token');
      }
    }
  },

  getToken: () => inMemoryToken,

  getHeaders: () => {
    const headers = { 'Content-Type': 'application/json' };
    if (inMemoryToken) {
      headers['Authorization'] = `Bearer ${inMemoryToken}`;
    }
    return headers;
  },

  // ── Authentication & Session ───────────────────────────────────────────────
  login: async (userIdOrEmail, password) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: { user_id: userIdOrEmail, email: userIdOrEmail, password }
    });
    if (data && data.access_token) {
      api.setToken(data.access_token);
    }
    return data;
  },

  demoLogin: async (email) => {
    const data = await request('/auth/demo-login', {
      method: 'POST',
      body: { email }
    });
    if (data && data.access_token) {
      api.setToken(data.access_token);
    }
    return data;
  },

  logout: async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      api.setToken(null);
    }
  },

  getProfile: async () => {
    return await request('/auth/me');
  },

  getDemoProfiles: async () => {
    return await request('/auth/demo-profiles');
  },

  getSettings: async () => {
    return await request('/settings');
  },

  getSystemConnectivity: async () => {
    try {
      const data = await request('/health', { timeoutMs: 4000 });
      return {
        ...data,
        api_online: true
      };
    } catch (err) {
      return {
        system_status: 'OFFLINE',
        api_online: false,
        environment: 'offline',
        timestamp: new Date().toISOString(),
        services: {
          api: { status: 'OFFLINE', error: err.message },
          database: { status: 'OFFLINE', connected: false },
          graph: { status: 'OFFLINE', connected: false },
          evidence_storage: { status: 'OFFLINE', connected: false },
          ai: { status: 'OFFLINE', live_inference: false }
        },
        disabled_functionality: [
          'CASE_MUTATIONS',
          'EVIDENCE_MUTATIONS',
          'GRAPH_MUTATION',
          'LIVE_AI_INFERENCE',
          'UNIT_DISPATCH'
        ]
      };
    }
  },

  // ── System & Security Settings (Restricted) ───────────────────────────────
  getSettings: async () => {
    return await request('/settings');
  },

  updateSettings: async (settings) => {
    return await request('/settings', {
      method: 'POST',
      body: settings
    });
  },

  // ── Case Management ────────────────────────────────────────────────────────
  getCases: async () => {
    const data = await request('/cases');
    return data.cases || [];
  },

  getCase: async (caseId) => {
    return await request(`/cases/${encodeURIComponent(caseId)}`);
  },

  createCase: async (caseData) => {
    return await request('/cases', {
      method: 'POST',
      body: caseData
    });
  },

  updateCase: async (caseId, updates) => {
    return await request(`/cases/${encodeURIComponent(caseId)}`, {
      method: 'PUT',
      body: updates
    });
  },

  getCaseEvidence: async (caseId) => {
    const data = await request(`/cases/${encodeURIComponent(caseId)}/evidence`);
    return data.evidence || [];
  },

  uploadCaseEvidence: async (caseId, evidenceData) => {
    return await request(`/cases/${encodeURIComponent(caseId)}/evidence/upload`, {
      method: 'POST',
      body: evidenceData
    });
  },

  uploadEvidence: async (caseId, evidenceData) => {
    return await api.uploadCaseEvidence(caseId, evidenceData);
  },

  getCaseEntities: async (caseId) => {
    const data = await request(`/cases/${encodeURIComponent(caseId)}/entities`);
    return data.entities || [];
  },

  getCaseRelationships: async (caseId) => {
    const data = await request(`/cases/${encodeURIComponent(caseId)}/relationships`);
    return data.relationships || [];
  },

  // ── Evidence Repository ────────────────────────────────────────────────────
  getEvidence: async (caseId = null, category = null, search = null) => {
    const params = new URLSearchParams();
    if (caseId && caseId !== 'ALL') params.append('case_id', caseId);
    if (category && category !== 'ALL') params.append('category', category);
    if (search && search.trim()) params.append('search', search.trim());
    const qs = params.toString() ? `?${params.toString()}` : '';
    const data = await request(`/evidence${qs}`);
    return data.evidence || [];
  },

  getEvidenceDetail: async (evidenceId) => {
    return await request(`/evidence/${encodeURIComponent(evidenceId)}`);
  },

  getEvidenceById: async (evidenceId) => {
    return await api.getEvidenceDetail(evidenceId);
  },

  processEvidence: async (evidenceId) => {
    const data = await request(`/evidence/${encodeURIComponent(evidenceId)}/process`, {
      method: 'POST'
    });
    return data.evidence;
  },

  // ── Global Intelligence Search ─────────────────────────────────────────────
  globalSearch: async (query, signal = null) => {
    if (!query || !query.trim()) {
      return { cases: [], evidence: [], entities: [], total_matches: 0 };
    }
    return await request(`/search?q=${encodeURIComponent(query.trim())}`, { signal });
  },

  // ── Knowledge Graph ────────────────────────────────────────────────────────
  getCaseGraph: async (caseId = 'CR-204', filters = {}, signal = null) => {
    const params = new URLSearchParams();
    if (filters.threatFilter && filters.threatFilter !== 'ALL') params.append('threat_filter', filters.threatFilter);
    if (filters.typeFilter && filters.typeFilter !== 'ALL') params.append('type_filter', filters.typeFilter);
    if (filters.relationFilter && filters.relationFilter !== 'ALL') params.append('relation_filter', filters.relationFilter);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await request(`/cases/${encodeURIComponent(caseId)}/graph${qs}`, { signal });
  },

  getGraphData: async (threatFilter = 'ALL', typeFilter = 'ALL') => {
    const params = new URLSearchParams();
    if (threatFilter && threatFilter !== 'ALL') params.append('threat_filter', threatFilter);
    if (typeFilter && typeFilter !== 'ALL') params.append('type_filter', typeFilter);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await request(`/graph/data${qs}`);
  },

  getShortestPath: async (sourceId, targetId, caseId = 'CR-204') => {
    return await request(`/graph/shortest-path?source_id=${encodeURIComponent(sourceId)}&target_id=${encodeURIComponent(targetId)}&case_id=${encodeURIComponent(caseId)}`);
  },

  findCasePath: async (caseId, sourceId, targetId, maxHops = 5) => {
    return await request(`/cases/${encodeURIComponent(caseId)}/graph/path`, {
      method: 'POST',
      body: { source_id: sourceId, target_id: targetId, max_hops: maxHops }
    });
  },

  getCaseAnalytics: async (caseId = 'CR-204') => {
    return await request(`/cases/${encodeURIComponent(caseId)}/graph/analytics`);
  },

  getGraphAnalytics: async (caseId = 'CR-204') => {
    return await api.getCaseAnalytics(caseId);
  },

  expandCaseNode: async (caseId, entityId) => {
    return await request(`/cases/${encodeURIComponent(caseId)}/graph/expand`, {
      method: 'POST',
      body: { entity_id: entityId }
    });
  },

  expandNode: async (nodeId, caseId = 'CR-204') => {
    return await api.expandCaseNode(caseId, nodeId);
  },

  getEntityDetail: async (entityId, caseId = null) => {
    const qs = caseId ? `?case_id=${encodeURIComponent(caseId)}` : '';
    return await request(`/entities/${encodeURIComponent(entityId)}${qs}`);
  },

  getRelationshipDetail: async (relId, caseId = null) => {
    const qs = caseId ? `?case_id=${encodeURIComponent(caseId)}` : '';
    return await request(`/relationships/${encodeURIComponent(relId)}${qs}`);
  },

  getNeo4jStatus: async () => {
    return await request('/graph/status');
  },

  // ── CIRA AI Assistant ──────────────────────────────────────────────────────
  sendChatMessage: async (messages, activeCaseId = 'CR-204') => {
    return await request('/chat/query', {
      method: 'POST',
      body: {
        messages,
        active_case_id: activeCaseId
      }
    });
  },

  sendCiraChatMessage: async (caseId, payload) => {
    return await request(`/cases/${encodeURIComponent(caseId)}/cira/chat`, {
      method: 'POST',
      body: payload
    });
  },

  ciraChat: async (caseId, message, conversationId = null, activeEntityId = null) => {
    return await request(`/cases/${encodeURIComponent(caseId)}/cira/chat`, {
      method: 'POST',
      body: {
        message,
        case_id: caseId,
        conversation_id: conversationId,
        active_entity_id: activeEntityId
      }
    });
  },

  getCiraStatus: async () => {
    return await request('/cira/status');
  },

  getCiraConfig: async () => {
    return await request('/cira/config');
  },

  saveCiraConfig: async (config) => {
    return await request('/cira/config', {
      method: 'POST',
      body: config
    });
  },

  testCiraConnection: async (payload) => {
    return await request('/cira/test-connection', {
      method: 'POST',
      body: payload
    });
  },

  getCiraCaseContext: async (caseId) => {
    return await request(`/cases/${encodeURIComponent(caseId)}/cira/context`);
  },

  getCaseContext: async (caseId) => {
    return await api.getCiraCaseContext(caseId);
  },

  getCiraConversations: async (caseId) => {
    return await request(`/cases/${encodeURIComponent(caseId)}/cira/conversations`);
  },

  getCaseConversations: async (caseId) => {
    const data = await api.getCiraConversations(caseId);
    return data.conversations || [];
  },

  createCiraConversation: async (caseId, title = null) => {
    return await request(`/cases/${encodeURIComponent(caseId)}/cira/conversations`, {
      method: 'POST',
      body: { title }
    });
  },

  createCaseConversation: async (caseId, title = null) => {
    return await api.createCiraConversation(caseId, title);
  },

  getCiraConversation: async (caseId, convId) => {
    return await request(`/cases/${encodeURIComponent(caseId)}/cira/conversations/${encodeURIComponent(convId)}`);
  },

  getConversationDetail: async (caseId, convId) => {
    return await api.getCiraConversation(caseId, convId);
  },

  renameConversation: async (caseId, convId, newTitle) => {
    return await request(`/cases/${encodeURIComponent(caseId)}/cira/conversations/${encodeURIComponent(convId)}`, {
      method: 'PATCH',
      body: { title: newTitle }
    });
  },

  deleteCiraConversation: async (caseId, convId) => {
    return await request(`/cases/${encodeURIComponent(caseId)}/cira/conversations/${encodeURIComponent(convId)}`, {
      method: 'DELETE'
    });
  },

  deleteConversation: async (caseId, convId) => {
    return await api.deleteCiraConversation(caseId, convId);
  },

  // ── Face Intelligence & Forensic Facial Matching ───────────────────────────
  analyzeFace: async (caseId, payload) => {
    const encCase = encodeURIComponent(caseId || 'CR-204');
    if (payload.file) {
      const formData = new FormData();
      formData.append('file', payload.file);
      formData.append('threshold', String(payload.threshold || 0.65));
      if (payload.notes) formData.append('notes', payload.notes);
      return await request(`/cases/${encCase}/face/analyze`, {
        method: 'POST',
        headers: {}, // Let browser set multipart boundary
        body: formData
      });
    }

    return await request(`/cases/${encCase}/face/analyze`, {
      method: 'POST',
      body: {
        filename: payload.filename || 'surveillance_capture.jpg',
        image_base64: payload.imageBase64 || payload.image_base64 || '',
        threshold: payload.threshold || 0.65,
        notes: payload.notes || ''
      }
    });
  },

  getFaceResults: async (caseId) => {
    return await request(`/cases/${encodeURIComponent(caseId || 'CR-204')}/face/results`);
  },

  getFaceStats: async (caseId) => {
    return await request(`/cases/${encodeURIComponent(caseId || 'CR-204')}/face/stats`);
  },

  getFaceMatch: async (caseId, matchId) => {
    return await request(`/cases/${encodeURIComponent(caseId || 'CR-204')}/face/matches/${encodeURIComponent(matchId)}`);
  },

  verifyFaceMatch: async (caseId, matchId, verifier, notes) => {
    return await request(`/cases/${encodeURIComponent(caseId || 'CR-204')}/face/matches/${encodeURIComponent(matchId)}/verify`, {
      method: 'POST',
      body: { verifier, notes }
    });
  },

  rejectFaceMatch: async (caseId, matchId, rejectedBy, reason) => {
    return await request(`/cases/${encodeURIComponent(caseId || 'CR-204')}/face/matches/${encodeURIComponent(matchId)}/reject`, {
      method: 'POST',
      body: { rejected_by: rejectedBy, reason }
    });
  },

  getPersonNetwork: async (personId, caseId = 'CR-204') => {
    return await request(`/persons/${encodeURIComponent(personId)}/network?case_id=${encodeURIComponent(caseId)}`);
  },

  getFaceGallery: async () => {
    return await request('/face/gallery');
  },

  // ── Forensics Fallback Compatibility ───────────────────────────────────────
  detectFace: async (evidenceId) => {
    return await request('/forensics/detect-face', {
      method: 'POST',
      body: { evidence_id: evidenceId }
    });
  },

  matchCandidates: async (evidenceId) => {
    return await request('/forensics/match-candidates', {
      method: 'POST',
      body: { evidence_id: evidenceId }
    });
  },

  linkEvidenceToGraph: async (evidenceId, suspectId, matchConfidence) => {
    return await request('/forensics/link-evidence-to-graph', {
      method: 'POST',
      body: { evidence_id: evidenceId, suspect_id: suspectId, match_confidence: matchConfidence }
    });
  },

  // ── NLP Explainable Leads ──────────────────────────────────────────────────
  extractEntities: async (text, caseName = 'Custom Intercept') => {
    if (!text || !text.trim() || text.trim().length < 5) {
      throw new ApiError('Input transcript must be at least 5 characters.', 422);
    }
    return await request('/leads/extract-entities', {
      method: 'POST',
      body: { text: text.trim(), case_name: caseName }
    });
  },

  generateLeads: async (text, caseName = 'Custom Intercept') => {
    if (!text || !text.trim() || text.trim().length < 5) {
      throw new ApiError('Input transcript must be at least 5 characters.', 422);
    }
    return await request('/leads/generate-leads', {
      method: 'POST',
      body: { text: text.trim(), case_name: caseName }
    });
  },

  getSampleTranscript: async () => {
    return await request('/leads/sample-transcript');
  },

  // ── Entity Resolution ──────────────────────────────────────────────────────
  getEntityResolutionCases: async () => {
    return await request('/entity-resolution/cases');
  },

  mergeEntity: async (caseId, primaryId, aliasName, matchScore) => {
    return await request('/entity-resolution/merge', {
      method: 'POST',
      body: { case_id: caseId, primary_id: primaryId, alias_name: aliasName, match_score: matchScore }
    });
  },

  // ── Tactical Incidents ─────────────────────────────────────────────────────
  listIncidents: async () => {
    return await request('/incidents');
  },

  dispatchIncident: async (incidentId, unitName) => {
    return await request(`/incidents/${encodeURIComponent(incidentId)}/dispatch`, {
      method: 'POST',
      body: { incident_id: incidentId, unit_name: unitName }
    });
  }
};
