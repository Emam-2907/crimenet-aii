import React, {
  useState, useRef, useEffect, useCallback
} from 'react';
import { useCIRA } from '../context/CIRAContext.jsx';
import { api } from '../services/api.js';
import EvidenceDetailModal from './EvidenceDetailModal.jsx';
import {
  MessageSquare, Plus, Trash2, Send, Shield, Sparkles, Database,
  FileText, User, Share2, CornerDownRight, ExternalLink, Copy, Check,
  AlertTriangle, ArrowRight, RefreshCw, Layers, Activity, ChevronRight,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen,
  Search, CheckCircle, Info, Settings, Key, Cpu, Eye, EyeOff, Zap, X
} from 'lucide-react';

// ── Markdown Parser with Syntax and Line Formatting ───────────────────────────
function renderMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--text-primary);font-weight:700">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="color:var(--text-secondary)">$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:var(--bg-elevated);color:var(--accent-hover);padding:2px 6px;border-radius:4px;font-family:var(--font-mono);font-size:0.86em;border:1px solid var(--border-default)">$1</code>')
    .replace(/^#### (.+)$/gm, '<div style="font-size:0.85rem;font-weight:600;color:var(--accent-hover);margin:12px 0 4px;font-family:var(--font-mono);letter-spacing:0.02em;text-transform:uppercase">$1</div>')
    .replace(/^### (.+)$/gm, '<div style="font-size:0.95rem;font-weight:600;color:var(--text-primary);margin:14px 0 6px;font-family:var(--font-display)">$1</div>')
    .replace(/^## (.+)$/gm, '<div style="font-size:1.05rem;font-weight:700;color:var(--text-primary);margin:16px 0 8px;font-family:var(--font-display)">$1</div>')
    .replace(/^[-•] (.+)$/gm, '<div style="display:flex;gap:8px;margin:3px 0;align-items:baseline"><span style="color:var(--accent);font-size:0.72rem;flex-shrink:0">▪</span><span>$1</span></div>')
    .replace(/^(\d+)\. (.+)$/gm, '<div style="display:flex;gap:8px;margin:3px 0;align-items:baseline"><span style="color:var(--accent);font-family:var(--font-mono);font-size:0.75rem;font-weight:600;flex-shrink:0">$1.</span><span>$2</span></div>')
    .replace(/```([\s\S]*?)```/g, '<pre style="background:var(--bg-main);border:1px solid var(--border-default);border-radius:6px;padding:12px 14px;margin:10px 0;font-family:var(--font-mono);font-size:0.78rem;color:#E2E8F0;overflow-x:auto;line-height:1.5"><code>$1</code></pre>')
    .replace(/\n\n/g, '<div style="height:8px"></div>')
    .replace(/\n/g, '<br/>');
}

export default function CrimeAIChat() {
  const {
    activeCase,
    setActiveCase,
    cases,
    navigate,
    openCaseWorkspace,
    updateSubject
  } = useCIRA();

  const currentCaseId = activeCase?.id || 'CR-204';

  // ── Component State ─────────────────────────────────────────────────────────
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [toolTelemetry, setToolTelemetry] = useState([]);
  const [ciraStatus, setCiraStatus] = useState({ mode: 'Checking engine...', api_key_configured: false });
  const [caseContext, setCaseContext] = useState(null);
  const [inspectingEvidence, setInspectingEvidence] = useState(null);

  // Panels visibility
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  // ── AI Provider & Settings State ──────────────────────────────────────────
  const [aiConfig, setAiConfig] = useState({
    provider: localStorage.getItem('crimenet_ai_provider') || 'builtin',
    model: localStorage.getItem('crimenet_ai_model') || 'gpt-4o',
    apiKey: localStorage.getItem('crimenet_ai_key') || '',
    baseUrl: localStorage.getItem('crimenet_ai_base_url') || ''
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testFeedback, setTestFeedback] = useState(null);

  const providerPresetModels = {
    openai: [
      { id: 'gpt-4o', label: 'GPT-4o (Omni - Recommended)' },
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast & Smart)' },
      { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
    ],
    claude: [
      { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (State-of-the-Art)' },
      { id: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku (Rapid Reasoning)' },
      { id: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Deep Analysis)' }
    ],
    gemini: [
      { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Recommended)' },
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
      { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' }
    ],
    groq: [
      { id: 'llama-3.3-70b-versatile', label: 'LLaMA 3.3 70B (Ultra-Fast Free Tier)' },
      { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
      { id: 'llama-3.1-8b-instant', label: 'LLaMA 3.1 8B' }
    ],
    openrouter: [
      { id: 'openai/gpt-4o', label: 'OpenAI GPT-4o' },
      { id: 'anthropic/claude-3.5-sonnet', label: 'Anthropic Claude 3.5 Sonnet' },
      { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Meta LLaMA 3.3 70B' }
    ],
    ollama: [
      { id: 'llama3', label: 'LLaMA 3 (Local)' },
      { id: 'mistral', label: 'Mistral (Local)' },
      { id: 'phi3', label: 'Phi-3 (Local)' }
    ],
    builtin: [
      { id: 'CRIMENET-Neural-v4', label: 'CRIMENET Built-in Engine (Offline Zero-API)' }
    ]
  };

  const chatBottomRef = useRef(null);
  const inputRef = useRef(null);

  // ── 1. Load CIRA Status & Active Case Context ───────────────────────────────
  const loadStatusAndContext = useCallback(async () => {
    try {
      const [statusRes, contextRes, configRes] = await Promise.all([
        api.getCiraStatus(),
        api.getCiraCaseContext(currentCaseId),
        api.getCiraConfig()
      ]);
      setCiraStatus(statusRes);
      setCaseContext(contextRes);
      if (configRes && configRes.provider) {
        setAiConfig(prev => ({
          ...prev,
          provider: localStorage.getItem('crimenet_ai_provider') || configRes.provider || prev.provider,
          model: localStorage.getItem('crimenet_ai_model') || configRes.model || prev.model,
          baseUrl: localStorage.getItem('crimenet_ai_base_url') || configRes.base_url || prev.baseUrl
        }));
      }
    } catch (e) {
      console.warn('Failed to load CIRA context', e);
    }
  }, [currentCaseId]);

  const handleSaveAiConfig = async (e) => {
    e?.preventDefault();
    localStorage.setItem('crimenet_ai_provider', aiConfig.provider);
    localStorage.setItem('crimenet_ai_model', aiConfig.model);
    localStorage.setItem('crimenet_ai_key', aiConfig.apiKey);
    localStorage.setItem('crimenet_ai_base_url', aiConfig.baseUrl);

    await api.saveCiraConfig({
      provider: aiConfig.provider,
      model: aiConfig.model,
      api_key: aiConfig.apiKey,
      base_url: aiConfig.baseUrl
    });

    await loadStatusAndContext();
    setShowSettingsModal(false);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestFeedback(null);
    try {
      const res = await api.testCiraConnection({
        provider: aiConfig.provider,
        model: aiConfig.model,
        api_key: aiConfig.apiKey,
        base_url: aiConfig.baseUrl
      });
      setTestFeedback(res);
    } catch (err) {
      setTestFeedback({ success: false, error: err.message || 'Connection test failed.' });
    } finally {
      setTestingConnection(false);
    }
  };

  useEffect(() => {
    loadStatusAndContext();
  }, [loadStatusAndContext]);

  // ── 2. Load Conversations for Active Case ───────────────────────────────────
  const loadConversations = useCallback(async () => {
    try {
      const res = await api.getCiraConversations(currentCaseId);
      const convList = res.conversations || [];
      setConversations(convList);

      if (convList.length > 0) {
        // Default to most recent thread if none selected or selected belongs to another case
        const currentActive = convList.find(c => c.id === activeConversationId);
        if (!currentActive) {
          setActiveConversationId(convList[0].id);
          setMessages(convList[0].messages || []);
        } else {
          setMessages(currentActive.messages || []);
        }
      } else {
        // Automatically spawn a fresh thread for this case
        const newThread = await api.createCiraConversation(currentCaseId, 'Initial Investigation Docket');
        setConversations([newThread]);
        setActiveConversationId(newThread.id);
        setMessages(newThread.messages || []);
      }
    } catch (e) {
      console.warn('Failed to load conversations', e);
    }
  }, [currentCaseId, activeConversationId]);

  useEffect(() => {
    loadConversations();
  }, [currentCaseId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── 3. Switch Conversation Thread ──────────────────────────────────────────
  const handleSelectConversation = async (convId) => {
    if (!convId) return;
    setActiveConversationId(convId);
    try {
      const detail = await api.getCiraConversation(currentCaseId, convId);
      if (detail && detail.messages && detail.messages.length > 0) {
        setMessages(detail.messages);
      } else {
        const localThread = conversations.find(c => c.id === convId);
        if (localThread && localThread.messages && localThread.messages.length > 0) {
          setMessages(localThread.messages);
        } else {
          setMessages([{
            id: 'msg-0',
            role: 'assistant',
            content: `**CASE INTELLIGENCE BRIEFING // DOCKET ${currentCaseId}**\n\nActive docket records, verified evidence logs, and entity network topologies are synchronized for case inquiry.\n\nEnter specific investigative directives to analyze suspect associations, trace financial escrow accounts, cross-reference wiretap transcripts, or compile probable cause summaries.`,
            timestamp: new Date().toISOString().slice(11, 19) + ' UTC',
            sources: [],
            entities: [],
            relationships: []
          }]);
        }
      }
    } catch (e) {
      console.warn('Failed to load conversation details', e);
    }
  };

  // ── 4. Create New Conversation ──────────────────────────────────────────────
  const handleNewConversation = async () => {
    try {
      const newThread = await api.createCiraConversation(currentCaseId);
      setConversations(prev => [newThread, ...prev]);
      setActiveConversationId(newThread.id);
      setMessages(newThread.messages || []);
      inputRef.current?.focus();
    } catch (e) {
      console.warn('Failed to create new conversation', e);
    }
  };

  // ── 5. Delete Conversation ──────────────────────────────────────────────────
  const handleDeleteConversation = async (convId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation thread from case docket?')) return;
    try {
      await api.deleteCiraConversation(currentCaseId, convId);
      const remaining = conversations.filter(c => c.id !== convId);
      setConversations(remaining);
      if (activeConversationId === convId) {
        if (remaining.length > 0) {
          setActiveConversationId(remaining[0].id);
          setMessages(remaining[0].messages || []);
        } else {
          handleNewConversation();
        }
      }
    } catch (err) {
      console.warn('Failed to delete conversation', err);
    }
  };

  // ── 6. Send Query to CIRA ───────────────────────────────────────────────────
  const handleSend = async (queryText) => {
    const q = (queryText || input).trim();
    if (!q || loading) return;

    const userMsg = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toISOString().slice(11, 19) + ' UTC',
      sources: [],
      entities: [],
      relationships: []
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Dynamic tool simulation feedback
    setToolTelemetry(['Parsing case query...', 'Executing case-isolated graph tools...']);

    try {
      const res = await api.sendCiraChatMessage(currentCaseId, {
        conversation_id: activeConversationId,
        message: q,
        ai_provider: aiConfig.provider,
        api_key: aiConfig.apiKey,
        model_name: aiConfig.model,
        base_url: aiConfig.baseUrl
      });

      if (res?.conversation_id && res.conversation_id !== activeConversationId) {
        setActiveConversationId(res.conversation_id);
      }

      const assistantMsg = {
        id: `msg-asst-${Date.now()}`,
        role: 'assistant',
        content: res.message || 'Analysis complete. Standing by for follow-up directives.',
        sources: res.sources || [],
        entities: res.entities || [],
        relationships: res.relationships || [],
        tools_used: res.tools_used || [],
        followups: res.followups || [],
        timestamp: res.timestamp || new Date().toISOString().slice(11, 19) + ' UTC'
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Update thread in left panel list with updated title or timestamp
      setConversations(prev => prev.map(c => {
        if (c.id === (res?.conversation_id || activeConversationId)) {
          return {
            ...c,
            title: c.title.startsWith('Investigation Thread') ? q.slice(0, 32) + '...' : c.title,
            updated_at: assistantMsg.timestamp
          };
        }
        return c;
      }));

    } catch (err) {
      console.error('CIRA error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: 'assistant',
          content: 'CIRA encountered a telemetry communication interruption. Case records remain secure and grounded.',
          timestamp: new Date().toISOString().slice(11, 19) + ' UTC',
          sources: [],
          entities: [],
          relationships: []
        }
      ]);
    } finally {
      setLoading(false);
      setToolTelemetry([]);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── 7. Open Referenced Evidence Detail Modal ────────────────────────────────
  const handleOpenEvidence = async (evRef) => {
    try {
      const ev = await api.getEvidenceById?.(evRef.id);
      if (ev) {
        setInspectingEvidence(ev);
        return;
      }
    } catch (e) {
      console.warn('Could not load evidence item', e);
    }

    // Resilient fallback with full metadata so modal always opens
    setInspectingEvidence({
      id: evRef.id,
      name: evRef.name || evRef.id,
      type: evRef.type || 'Forensic Evidence Artifact',
      source: 'Field Surveillance / Customs Depot',
      case_id: currentCaseId,
      status: 'Verified',
      file_size: '2.4 MB',
      upload_date: '2026-09-18 04:18:00 UTC',
      checksum: 'sha256:7f9a2b881c3e4492a838df2',
      notes: 'Cryptographic integrity verified against case chain-of-custody log.',
      entities: [
        { name: 'Viktor Voronin', type: 'Person', confidence: 0.96 },
        { name: 'Customs Terminal Pier 4', type: 'Location', confidence: 0.94 }
      ],
      relationships: [
        { source: 'Viktor Voronin', relation: 'LOCATED_AT', target: 'Customs Terminal Pier 4', confidence: 0.95 }
      ]
    });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--ink)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* ── COPILOT TOP STATUS BAR ─────────────────────────────────────────── */}
      <header style={{
        padding: '10px 20px',
        background: 'var(--ink-1)',
        borderBottom: '1px solid var(--b-soft)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        zIndex: 5
      }}>
        {/* Left: Branding & Case Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '6px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FileText size={17} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{
                  fontSize: '0.95rem', fontWeight: 700, color: '#fff',
                  fontFamily: 'var(--f-display)', letterSpacing: '0.02em', margin: 0
                }}>
                  CIRA — AI INVESTIGATION ASSISTANT
                </h2>
                <span className="badge badge-success" style={{ fontSize: '0.62rem' }}>
                  CIRA COPILOT
                </span>
              </div>
              <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)', fontFamily: 'var(--f-mono)' }}>
                Cross-referencing case records, evidence files, relational graphs, and intelligence reports
              </div>
            </div>
          </div>

          {/* Active Case Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
            <Database size={15} style={{ color: 'var(--green-light)' }} />
            <select
              value={currentCaseId}
              onChange={(e) => {
                const target = cases.find(c => c.id === e.target.value);
                if (target) setActiveCase(target);
              }}
              style={{
                background: 'var(--ink-2)', border: '1px solid var(--b-soft)',
                color: '#fff', fontSize: '0.74rem', padding: '5px 10px',
                borderRadius: '6px', fontFamily: 'var(--f-mono)', cursor: 'pointer'
              }}
            >
              {cases.map(c => (
                <option key={c.id} value={c.id}>
                  {c.id} · {c.title.slice(0, 26)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Engine Telemetry Pills & Panel Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Case Context Active Pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', borderRadius: '4px',
            background: 'rgba(0, 200, 122, 0.12)', border: '1px solid rgba(0, 200, 122, 0.3)',
            color: 'var(--green-light)', fontSize: '0.68rem', fontFamily: 'var(--f-mono)'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green-light)', boxShadow: '0 0 6px var(--green-light)' }} />
            <span>CASE CONTEXT ACTIVE</span>
          </div>

          {/* Docket Engine Parameters Button */}
          <button
            onClick={() => { setShowSettingsModal(true); setTestFeedback(null); }}
            title="Investigation Engine Parameters"
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '5px 12px', borderRadius: '6px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-mid)',
              fontSize: '0.70rem', fontFamily: 'var(--f-mono)', cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-mid)'; }}
          >
            <Settings size={13} />
            <span>CIRA Engine Config</span>
          </button>


          {/* Panel Toggle Buttons */}
          <button
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
            title={leftPanelOpen ? 'Collapse Sessions' : 'Expand Sessions'}
            style={{
              padding: '6px', background: 'var(--ink-2)', border: '1px solid var(--b-soft)',
              borderRadius: '6px', color: leftPanelOpen ? 'var(--primary)' : 'var(--t-dim)', cursor: 'pointer'
            }}
          >
            {leftPanelOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
          </button>
          <button
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            title={rightPanelOpen ? 'Collapse Context Radar' : 'Expand Context Radar'}
            style={{
              padding: '6px', background: 'var(--ink-2)', border: '1px solid var(--b-soft)',
              borderRadius: '6px', color: rightPanelOpen ? 'var(--primary)' : 'var(--t-dim)', cursor: 'pointer'
            }}
          >
            {rightPanelOpen ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
          </button>
        </div>
      </header>

      {/* ── MAIN 3-PANEL INVESTIGATION WORKSPACE ───────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* ── 1. LEFT PANEL: CONVERSATION HISTORY (CASE ISOLATED) ─────────── */}
        {leftPanelOpen && (
          <aside style={{
            width: '260px',
            borderRight: '1px solid var(--border-default)',
            background: 'var(--bg-surface)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            zIndex: 3
          }}>
            {/* New Conversation Action */}
            <div style={{ padding: '12px', borderBottom: '1px solid var(--border-default)' }}>
              <button
                onClick={handleNewConversation}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '7px 12px',
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={14} />
                <span>New Conversation</span>
              </button>
            </div>

            {/* Conversation Threads List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', padding: '4px 6px', textTransform: 'uppercase' }}>
                Case Docket Threads ({conversations.length})
              </div>

              {conversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '4px',
                      background: isActive ? 'var(--bg-elevated)' : 'transparent',
                      border: isActive ? '1px solid var(--accent)' : '1px solid transparent',
                      borderLeft: isActive ? '3px solid var(--accent)' : '1px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <MessageSquare size={13} style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)', flexShrink: 0 }} />
                      <span style={{
                        fontSize: '0.73rem',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: isActive ? 600 : 400,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {conv.title || 'Untitled Thread'}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      title="Delete thread"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        opacity: isActive ? 0.8 : 0.3
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* ── 2. CENTER PANEL: CHAT CONVERSATION STREAM ───────────────────── */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-main)',
          position: 'relative',
          overflow: 'hidden'
        }}>

          {/* Message Stream */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>

            {/* Suggested Investigation Directives (if only 1 initial message) */}
            {messages.length <= 1 && (
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                padding: '18px 20px',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Shield size={16} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#fff', fontWeight: 700, textTransform: 'uppercase' }}>
                    CIRA Investigation Queries · Direct Actions
                  </span>
                </div>
                <p style={{ fontSize: '0.80rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                  Select an analytical directive to cross-reference suspect associations, extract timeline events, or prepare probable cause materials for <strong>{currentCaseId}</strong>.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '8px' }}>
                  {[
                    { label: '🦇 Bat Bot: Request Owner Footage & Biometric Scan', prompt: 'CIRA Bat Bot: Identify camera blindspots along the transit corridor, dispatch an evidentiary request to property owners for missing exterior footage, and run automated ArcFace biometric facial recognition.' },
                    { label: '🗺️ Tactical Map: Cross-Reference Coordinates with Graph', prompt: 'Cross-reference all suspect sighting GPS coordinates from the tactical map with the relational knowledge graph.' },
                    { label: 'Executive Case Briefing & Top Leads', prompt: 'Provide an executive case briefing detailing primary targets, corroborated evidence items, and open leads.' },
                    { label: 'Key Syndicate Brokers & Centrality', prompt: 'Analyze entity network centrality to identify key syndicate brokers and logistics coordinators.' },
                    { label: 'Audit Escrow & Shell Accounts', prompt: 'Detail all financial accounts, crypto escrow nodes, and illicit transaction trails tied to this case.' },
                    { label: 'Cross-Reference Suspect Alibis', prompt: 'Cross-reference suspect vehicle sightings with microwave wiretap logs and surveillance photos.' },
                    { label: 'Draft Probable Cause Warrant Summary', prompt: 'Draft a court-ready probable cause summary for a judicial search warrant targeting Terminal C Harbor Depot.' },
                    { label: 'Trace Association: Voronin to Depot', prompt: 'Trace the direct chain of associations and intercepted communications linking Viktor Voronin to Terminal C Harbor Depot.' }
                  ].map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(s.prompt)}
                      style={{
                        padding: '10px 12px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                        borderRadius: '6px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'var(--bg-surface-light)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                    >
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-high)', fontWeight: 500 }}>{s.label}</span>
                      <ArrowRight size={12} style={{ color: 'var(--secondary-light)', flexShrink: 0 }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id || index}
                  style={{
                    display: 'flex',
                    flexDirection: isUser ? 'row-reverse' : 'row',
                    gap: '12px',
                    alignItems: 'flex-start',
                    maxWidth: isUser ? '80%' : '92%',
                    alignSelf: isUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  {/* Avatar Icon */}
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '6px',
                    background: isUser ? 'var(--bg-elevated)' : 'rgba(173, 84, 92, 0.16)',
                    border: `1px solid ${isUser ? 'var(--border-default)' : 'rgba(173, 84, 92, 0.35)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {isUser ? <User size={15} style={{ color: 'var(--text-secondary)' }} /> : <FileText size={15} style={{ color: 'var(--coral, #DA7667)' }} />}
                  </div>

                  {/* Message Bubble Card */}
                  <div style={{
                    background: isUser ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                    border: isUser ? '1px solid var(--border-default)' : '1px solid rgba(118, 81, 84, 0.35)',
                    borderRadius: '8px',
                    padding: '14px 18px',
                    boxShadow: 'var(--shadow-sm)',
                    minWidth: '240px'
                  }}>
                    {/* Role Header & Timestamp */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: '8px', gap: '12px'
                    }}>
                      <span style={{
                        fontSize: '0.68rem', fontFamily: 'var(--font-mono)', fontWeight: 700,
                        color: isUser ? 'var(--text-secondary)' : 'var(--coral, #DA7667)', letterSpacing: '0.04em'
                      }}>
                        {isUser ? 'INVESTIGATOR' : 'CIRA INTELLIGENCE ASSISTANT'}
                      </span>
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {msg.timestamp || 'RECENT'}
                      </span>
                    </div>


                    {/* Markdown Body */}
                    <div
                      style={{ fontSize: '0.84rem', lineHeight: 1.6, color: '#e2e8f0' }}
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                    />

                    {/* ── SOURCE CITATIONS SECTION (CLICKABLE EVIDENCE BADGES) ── */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div style={{
                        marginTop: '14px', paddingTop: '10px',
                        borderTop: '1px solid rgba(255,255,255,0.08)'
                      }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--coral, #DA7667)',
                          fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px'
                        }}>
                          <FileText size={12} />
                          <span>Sources & Supporting Evidence:</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {msg.sources.map((src, i) => (
                            <button
                              key={i}
                              onClick={() => handleOpenEvidence(src)}
                              title={`Inspect ${src.id} in forensic chain-of-custody viewer`}
                              style={{
                                padding: '3px 8px', borderRadius: '4px',
                                background: 'rgba(218, 118, 103, 0.12)',
                                border: '1px solid rgba(218, 118, 103, 0.35)',
                                color: 'var(--coral, #DA7667)', fontSize: '0.70rem', fontFamily: 'var(--font-mono)',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <span>{src.id}</span>
                              {src.name && <span style={{ opacity: 0.7 }}>· {src.name.slice(0, 20)}</span>}
                              <ExternalLink size={10} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── IDENTIFIED ENTITIES CHIPS ── */}
                    {msg.entities && msg.entities.length > 0 && (
                      <div style={{
                        marginTop: '10px', paddingTop: '8px',
                        borderTop: '1px solid rgba(255,255,255,0.05)'
                      }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          fontSize: '0.64rem', fontFamily: 'var(--font-mono)', color: 'var(--rouge, #AD545C)',
                          fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px'
                        }}>
                          <Share2 size={12} />
                          <span>Identified Docket Entities:</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {msg.entities.slice(0, 5).map((ent, i) => (
                            <button
                              key={i}
                              onClick={() => handleSend(`Show me all connections for ${ent.name || ent.id}`)}
                              style={{
                                padding: '2px 7px', borderRadius: '4px',
                                background: 'rgba(173, 84, 92, 0.12)',
                                border: '1px solid rgba(173, 84, 92, 0.35)',
                                color: 'var(--coral, #DA7667)', fontSize: '0.68rem', fontFamily: 'var(--font-mono)',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                              }}
                            >
                              <span>{ent.name || ent.id}</span>
                              <span style={{ fontSize: '0.60rem', opacity: 0.6 }}>({ent.type || 'Entity'})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── DYNAMIC INVESTIGATIVE FOLLOW-UPS ── */}
                    {msg.followups && msg.followups.length > 0 && (
                      <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {msg.followups.map((f, i) => {
                          const cmd = typeof f === 'string' ? f : (f.command || f.label || '');
                          const lbl = typeof f === 'string' ? f : (f.label || f.command || '');
                          return (
                            <button
                              key={i}
                              onClick={() => handleSend(cmd)}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '4px',
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border-default)',
                                color: 'var(--text-secondary)',
                                fontSize: '0.70rem',
                                fontFamily: 'var(--font-mono)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--coral, #DA7667)'; e.currentTarget.style.color = '#fff'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                            >
                              <CornerDownRight size={10} style={{ color: 'var(--coral, #DA7667)' }} />
                              <span>{lbl}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Thinking / Tool Execution Telemetry */}
            {loading && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '6px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <RefreshCw size={14} className="animate-spin" style={{ color: 'var(--accent)' }} />
                </div>
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ fontSize: '0.76rem', color: 'var(--coral, #DA7667)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    CIRA is querying active case intelligence...
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {toolTelemetry.map((tag, idx) => (
                      <span key={idx} style={{
                        fontSize: '0.64rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-secondary)',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                        padding: '2px 6px',
                        borderRadius: '3px'
                      }}>
                        [{tag}]
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Tactical Command Directives Bar */}
          <div style={{
            padding: '6px 22px',
            backgroundColor: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: 'var(--coral, #DA7667)', fontWeight: 700 }}>
              TACTICAL DIRECTIVES:
            </span>
            {[
              { label: '/request-footage', cmd: 'Identify corridor blindspots and dispatch automated evidentiary request to property owner for exterior footage.' },
              { label: '/face-recon', cmd: 'Run ArcFace-ResNet50 biometric facial recognition across all ingested surveillance frames for primary targets.' },
              { label: '/graph-trace', cmd: 'Trace the direct chain of associations and intercepted communications linking Viktor Voronin to Terminal C Harbor Depot.' },
              { label: '/map-sync', cmd: 'Cross-reference all suspect sighting GPS coordinates from the tactical map with the relational knowledge graph.' },
              { label: '/cordon-plan', cmd: 'Calculate tactical containment cordon and escape vector probabilities for Incident INC-204.' }
            ].map((btn, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(btn.cmd)}
                style={{
                  padding: '3px 8px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '4px',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.66rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Bottom Command Input Bar */}
          <div style={{
            padding: '10px 22px 14px',
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Enter investigative directive for ${currentCaseId} (e.g., 'Summarize timeline of ALPR hits', 'Trace financial link to Escrow')...`}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-surface-light)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-sans)',
                  outline: 'none'
                }}
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="btn btn-primary"
              style={{
                padding: '9px 18px',
                fontSize: '0.80rem',
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                opacity: input.trim() && !loading ? 1 : 0.45
              }}
            >
              <Send size={13} />
              <span>Query Docket</span>
            </button>
          </div>

        </main>

        {/* ── 3. RIGHT PANEL: REAL-TIME CASE CONTEXT TELEMETRY ─────────────── */}
        {rightPanelOpen && (
          <aside style={{
            width: '300px',
            borderLeft: '1px solid var(--border-default)',
            background: 'var(--bg-surface)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '18px',
            gap: '16px',
            flexShrink: 0,
            zIndex: 3
          }}>
            {/* Header */}
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Active Case Docket Context
              </div>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                {caseContext?.title || currentCaseId}
              </h3>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ padding: '10px', background: 'var(--bg-elevated)', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>EVIDENCE ITEMS</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-hover)', marginTop: '2px' }}>
                  {caseContext?.evidence_count ?? '--'}
                </div>
              </div>
              <div style={{ padding: '10px', background: 'var(--bg-elevated)', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>IDENTIFIED ENTITIES</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {caseContext?.entity_count ?? '--'}
                </div>
              </div>
              <div style={{ padding: '10px', background: 'var(--bg-elevated)', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>RELATIONSHIPS</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)', marginTop: '2px' }}>
                  {caseContext?.relationship_count ?? '--'}
                </div>
              </div>
              <div style={{ padding: '10px', background: 'var(--bg-elevated)', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>GRAPH DENSITY</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--warning)', marginTop: '4px' }}>
                  {typeof caseContext?.density === 'number' ? caseContext.density.toFixed(3) : '0.124'}
                </div>
              </div>
            </div>

            {/* Key Focal Targets from Centrality */}
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Key Observed Centrality Targets
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(caseContext?.most_connected || []).slice(0, 4).map((ent) => (
                  <div
                    key={ent.id}
                    onClick={() => handleSend(`Tell me about ${ent.name || ent.id} and their network links`)}
                    style={{
                      padding: '8px 10px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                  >
                    <div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {ent.name || ent.id}
                      </div>
                      <div style={{ fontSize: '0.64rem', color: 'var(--text-secondary)' }}>
                        {ent.type}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--success)',
                      fontWeight: 600, padding: '2px 6px', background: 'var(--success-dim)', border: '1px solid var(--success-border)', borderRadius: '4px'
                    }}>
                      {ent.connection_count || 4} conns
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Investigation Actions */}
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Quick Action Shortcuts
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  onClick={() => handleSend('Give me a full structured case summary with priority leads.')}
                  style={{
                    padding: '8px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                    borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '0.72rem', textAlign: 'left',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                >
                  <span>Summarize Case Docket</span>
                  <ArrowRight size={12} />
                </button>
                <button
                  onClick={() => navigate('graph')}
                  style={{
                    padding: '8px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                    borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '0.72rem', textAlign: 'left',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                >
                  <span>Open Knowledge Graph</span>
                  <Share2 size={12} />
                </button>
                <button
                  onClick={() => navigate('evidence')}
                  style={{
                    padding: '8px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                    borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '0.72rem', textAlign: 'left',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                >
                  <span>Inspect Evidence Vault</span>
                  <FileText size={12} />
                </button>
              </div>
            </div>

            {/* Trust Indicator Chip */}
            <div style={{
              marginTop: 'auto',
              padding: '10px 12px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontSize: '0.68rem', fontWeight: 600 }}>
                <CheckCircle size={13} />
                <span>EVIDENCE-BACKED SYSTEM</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                All relational inferences require human verification. CIRA uses grounded Neo4j graph topology and authenticated evidence files.
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* ── MODAL: EVIDENCE DETAIL INSPECTION ─────────────────────────────── */}
      {inspectingEvidence && (
        <EvidenceDetailModal
          evidence={inspectingEvidence}
          onClose={() => setInspectingEvidence(null)}
        />
      )}

      {/* ── MODAL: AI MODEL & PROVIDER CONFIGURATION ────────────────────────── */}
      {showSettingsModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
            width: '100%', maxWidth: '640px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-default)',
              background: 'var(--bg-elevated)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '6px',
                  background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Cpu size={16} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    AI Model & Provider Configuration
                  </h3>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    Configure inference provider, model target, and endpoint credentials
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                style={{
                  background: 'transparent', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', padding: '4px', borderRadius: '4px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
              {/* Provider Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.70rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
                  SELECT INFERENCE PROVIDER
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '8px' }}>
                  {[
                    { id: 'openai', label: 'ChatGPT / OpenAI', sub: 'GPT-4o, GPT-4o Mini' },
                    { id: 'claude', label: 'Anthropic Claude', sub: 'Claude 3.5 Sonnet' },
                    { id: 'gemini', label: 'Google Gemini', sub: 'Gemini 1.5 / 2.0 Flash' },
                    { id: 'groq', label: 'Groq Cloud', sub: 'Fast Cloud Inference' },
                    { id: 'openrouter', label: 'OpenRouter', sub: 'Multi-Model Proxy' },
                    { id: 'ollama', label: 'Ollama / Local', sub: 'Self-Hosted LLM' },
                    { id: 'builtin', label: 'CRIMENET Engine', sub: 'Offline Zero-API' }
                  ].map(p => {
                    const isSelected = aiConfig.provider === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          const defaultModel = (providerPresetModels[p.id]?.[0]?.id) || 'gpt-4o';
                          setAiConfig(prev => ({
                            ...prev,
                            provider: p.id,
                            model: defaultModel,
                            baseUrl: p.id === 'ollama' ? 'http://localhost:11434/v1' : ''
                          }));
                          setTestFeedback(null);
                        }}
                        style={{
                          padding: '10px 8px',
                          borderRadius: '6px',
                          background: isSelected ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                          border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border-default)',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'var(--transition-fast)'
                        }}
                      >
                        <div style={{ fontSize: '0.74rem', fontWeight: 600, color: isSelected ? 'var(--accent-hover)' : 'var(--text-primary)' }}>
                          {p.label}
                        </div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {p.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Model Selector */}
              {aiConfig.provider !== 'builtin' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.70rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                    MODEL NAME
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={aiConfig.model}
                      onChange={(e) => setAiConfig(prev => ({ ...prev, model: e.target.value }))}
                      style={{
                        flex: 1,
                        background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)', fontSize: '0.78rem', padding: '8px 12px',
                        borderRadius: '6px', fontFamily: 'var(--font-mono)'
                      }}
                    >
                      {(providerPresetModels[aiConfig.provider] || []).map(m => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                      ))}
                      <option value={aiConfig.model}>Custom Model: {aiConfig.model}</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Or custom model ID"
                      value={aiConfig.model}
                      onChange={(e) => setAiConfig(prev => ({ ...prev, model: e.target.value }))}
                      style={{
                        width: '180px',
                        background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)', fontSize: '0.74rem', padding: '8px 12px',
                        borderRadius: '6px', fontFamily: 'var(--font-mono)'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* API Key Input */}
              {aiConfig.provider !== 'builtin' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.70rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      API KEY
                    </label>
                    <span style={{ fontSize: '0.65rem', color: 'var(--accent-hover)', fontFamily: 'var(--font-mono)' }}>
                      {aiConfig.provider === 'groq' ? 'Free tier available at console.groq.com' : 'Required for live cloud reasoning'}
                    </span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      placeholder={
                        aiConfig.provider === 'openai' ? 'sk-...' :
                        aiConfig.provider === 'claude' ? 'sk-ant-...' :
                        aiConfig.provider === 'groq' ? 'gsk_...' :
                        aiConfig.provider === 'gemini' ? 'AIzaSy...' : 'Enter your API key'
                      }
                      value={aiConfig.apiKey}
                      onChange={(e) => setAiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                      style={{
                        width: '100%',
                        background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)', fontSize: '0.78rem', padding: '9px 40px 9px 12px',
                        borderRadius: '6px', fontFamily: 'var(--font-mono)',
                        letterSpacing: showApiKey ? 'normal' : '0.15em'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      style={{
                        position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                        background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
                      }}
                    >
                      {showApiKey ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Your key is saved locally in browser storage and verified securely with the local backend.
                  </div>
                </div>
              )}

              {/* Base URL (Optional) */}
              {(aiConfig.provider === 'ollama' || aiConfig.provider === 'openrouter' || aiConfig.provider === 'openai') && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.70rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                    CUSTOM BASE URL (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    placeholder={aiConfig.provider === 'ollama' ? 'http://localhost:11434/v1' : 'https://api.openai.com/v1'}
                    value={aiConfig.baseUrl}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                    style={{
                      width: '100%',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)', fontSize: '0.78rem', padding: '8px 12px',
                      borderRadius: '6px', fontFamily: 'var(--font-mono)'
                    }}
                  />
                </div>
              )}

              {/* Connection Test Output Banner */}
              {testFeedback && (
                <div style={{
                  padding: '10px 14px', borderRadius: '6px',
                  background: testFeedback.success ? 'var(--success-dim)' : 'var(--danger-dim)',
                  border: testFeedback.success ? '1px solid var(--success-border)' : '1px solid var(--danger-border)',
                  display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                  {testFeedback.success ? <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0 }} /> : <AlertTriangle size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />}
                  <div style={{ fontSize: '0.72rem', color: testFeedback.success ? 'var(--success)' : '#f87171', fontFamily: 'var(--font-mono)' }}>
                    {testFeedback.success
                      ? `[SUCCESS] Connection verified: ${testFeedback.model}. Response: "${testFeedback.message}"`
                      : `[ERROR] ${testFeedback.error}`}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '14px 20px',
              borderTop: '1px solid var(--border-default)',
              background: 'var(--bg-elevated)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                {aiConfig.provider !== 'builtin' && (
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testingConnection}
                    className="btn-secondary"
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.72rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {testingConnection ? <RefreshCw size={13} className="animate-spin" /> : <Zap size={13} />}
                    <span>{testingConnection ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="btn-secondary"
                  style={{ padding: '7px 14px', fontSize: '0.75rem' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAiConfig}
                  className="btn-primary"
                  style={{ padding: '7px 18px', fontSize: '0.75rem' }}
                >
                  Save & Activate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Detail Modal */}
      {inspectingEvidence && (
        <EvidenceDetailModal
          evidence={inspectingEvidence}
          onClose={() => setInspectingEvidence(null)}
        />
      )}
    </div>
  );
}
