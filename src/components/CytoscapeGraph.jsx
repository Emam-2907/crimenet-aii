import React, { useEffect, useRef, useState, useCallback } from 'react';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { useCIRA } from '../context/CIRAContext.jsx';
import { api } from '../services/api.js';
import { soundFx } from '../utils/audio.js';
import EvidenceDetailModal from './EvidenceDetailModal.jsx';
import WorldIntelligenceMap from './WorldIntelligenceMap.jsx';
import {
  Share2, ZoomIn, ZoomOut, Maximize2, Minimize2, RefreshCw, Route,
  Filter, Shield, AlertTriangle, Eye, Layers, UserCheck, Search,
  Database, ArrowRight, ExternalLink, MessageSquare, Plus, Info,
  CheckCircle, FileText, ChevronRight, X, Phone, Car, CreditCard,
  MapPin, Building, User, Hash, Clock, Globe, Columns
} from 'lucide-react';

try {
  cytoscape.use(coseBilkent);
} catch (e) {
  // Already registered
}

// 7 Standard Geometric Entity Visuals (Sleek Intelligence Standard)
const ENTITY_CONFIG = {
  Person: { shape: 'ellipse', color: '#9B3D45', label: 'Person', icon: User, code: 'P' },
  Phone: { shape: 'round-rectangle', color: '#5B7C99', label: 'Phone / Comm', icon: Phone, code: 'TEL' },
  Vehicle: { shape: 'round-rectangle', color: '#B58A45', label: 'Vehicle', icon: Car, code: 'VEH' },
  'Financial Account': { shape: 'round-rectangle', color: '#4F7A67', label: 'Financial / Escrow', icon: CreditCard, code: 'ESC' },
  FinancialAccount: { shape: 'round-rectangle', color: '#4F7A67', label: 'Financial / Escrow', icon: CreditCard, code: 'ESC' },
  financial: { shape: 'round-rectangle', color: '#4F7A67', label: 'Financial / Escrow', icon: CreditCard, code: 'ESC' },
  Location: { shape: 'ellipse', color: '#3F5F78', label: 'Location', icon: MapPin, code: 'LOC' },
  Organization: { shape: 'round-rectangle', color: '#8D98A5', label: 'Organization', icon: Building, code: 'ORG' },
  Evidence: { shape: 'round-rectangle', color: '#5B7C99', label: 'Evidence Asset', icon: FileText, code: 'EV' },
  Camera: { shape: 'round-rectangle', color: '#4F7A67', label: 'CCTV Camera', icon: Eye, code: 'CAM' },
  'Face Match': { shape: 'diamond', color: '#9B3D45', label: 'Biometric Candidate (87%)', icon: UserCheck, code: 'FM' },
  Biometric: { shape: 'diamond', color: '#9B3D45', label: 'Biometric Candidate (87%)', icon: UserCheck, code: 'FM' },
  Incident: { shape: 'octagon', color: '#C04A52', label: 'Incident Breach', icon: AlertTriangle, code: 'INC' },
  Case: { shape: 'diamond', color: '#3F5F78', label: 'Case Docket', icon: Shield, code: 'CASE' }
};

// Distinguishable Relationship Styles (Clean Link Analysis)
const RELATION_CONFIG = {
  calls: { style: 'dashed', color: '#5B7C99', label: 'Communication / Calls' },
  financial: { style: 'solid', color: '#4F7A67', label: 'Financial / Escrow', width: 2 },
  ownership: { style: 'solid', color: '#B58A45', label: 'Ownership / Vehicle' },
  vehicle: { style: 'solid', color: '#B58A45', label: 'Ownership / Vehicle' },
  location: { style: 'dashed', color: '#3F5F78', label: 'Geographic / Location' },
  evidence_backed: { style: 'solid', color: '#5B7C99', label: 'Evidence-Backed' },
  organization: { style: 'solid', color: '#8D98A5', label: 'Syndicate / Org' },
  association: { style: 'solid', color: '#5B7C99', label: 'Association / Other' }
};

// Tuned Human-Engineered Layout Configurations
const getLayoutConfig = (name) => {
  switch (name) {
    case 'concentric':
      return {
        name: 'concentric',
        concentric: (node) => {
          const d = node.data();
          const threat = d.threat;
          const type = d.type;
          const conn = node.degree();
          if (threat === 'CRITICAL' || d.id === 'ent-person-voronin' || d.id === 'PERSON-001') return 120;
          if (threat === 'HIGH') return 90;
          if (type === 'Person') return 70 + conn * 2;
          if (type === 'Phone' || type === 'Financial Account' || type === 'financial') return 45 + conn;
          if (type === 'Vehicle' || type === 'Location') return 25 + conn;
          return 10 + conn;
        },
        levelWidth: () => 25,
        minNodeSpacing: 55,
        padding: 50,
        animate: true,
        animationDuration: 600,
        fit: true
      };
    case 'breadthfirst':
      return {
        name: 'breadthfirst',
        directed: true,
        roots: ['ent-person-voronin', 'PERSON-001'],
        padding: 50,
        spacingFactor: 1.3,
        animate: true,
        animationDuration: 600,
        fit: true
      };
    case 'circle':
      return {
        name: 'circle',
        padding: 50,
        animate: true,
        animationDuration: 600,
        fit: true
      };
    case 'grid':
      return {
        name: 'grid',
        padding: 50,
        animate: true,
        animationDuration: 600,
        fit: true
      };
    case 'cose-bilkent':
    default:
      return {
        name: 'cose-bilkent',
        animate: true,
        animationDuration: 600,
        fit: true,
        padding: 50,
        nodeRepulsion: 150000,
        idealEdgeLength: 130,
        edgeElasticity: 0.1,
        nestingFactor: 0.8,
        gravity: 0.25,
        numIter: 2500,
        tile: true
      };
  }
};

export default function CytoscapeGraph() {
  const {
    activeCase,
    setActiveCase,
    cases,
    navigate,
    updateSubject,
    setActiveCaseTab
  } = useCIRA();

  const containerRef = useRef(null);
  const cyRef = useRef(null);

  // Active Case Context
  const currentCaseId = activeCase?.id || 'CR-204';

  // State Management
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [neo4jStatus, setNeo4jStatus] = useState({ connected: false, mode: 'CHECKING...' });
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [inspectingEvidence, setInspectingEvidence] = useState(null);

  // Primary View Mode: 'GRAPH' (Network Diagram) | 'WORLD_MAP' (Global Tactical Map) | 'SPLIT' (Side-by-Side)
  const [viewMode, setViewMode] = useState('GRAPH');

  // Tooling State (Default to Concentric Target Radial for command center clarity)
  const [layoutName, setLayoutName] = useState('concentric');
  const [threatFilter, setThreatFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [relationFilter, setRelationFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSideDrawer, setActiveSideDrawer] = useState('INSPECTOR'); // 'INSPECTOR' | 'ANALYTICS' | 'LEGEND' | 'PATHFINDER'

  // Pathfinding State
  const [pathSource, setPathSource] = useState('');
  const [pathTarget, setPathTarget] = useState('');
  const [pathResult, setPathResult] = useState(null);
  const [pathSearching, setPathSearching] = useState(false);

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [expandingNodeId, setExpandingNodeId] = useState(null);

  // Responsive Cytoscape Canvas Resizing on View Mode Transition
  useEffect(() => {
    if (cyRef.current) {
      const timer = setTimeout(() => {
        cyRef.current?.resize();
        if (viewMode === 'GRAPH') {
          cyRef.current?.fit(undefined, 35);
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [viewMode]);

  // 1. Check Neo4j Connectivity Status
  const checkStatus = useCallback(async () => {
    try {
      const stat = await api.getNeo4jStatus();
      setNeo4jStatus(stat);
    } catch (e) {
      setNeo4jStatus({ connected: false, mode: 'LOCAL_GRAPH_CACHE_FALLBACK', last_error: 'Offline' });
    }
  }, []);

  // 2. Fetch Graph Data from Backend (Neo4j / API)
  const loadGraph = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getCaseGraph(currentCaseId, {
        threatFilter,
        typeFilter,
        relationFilter
      });
      setGraphData(data);
      if (data.nodes && data.nodes.length > 0) {
        setSelectedNode(prev => {
          if (prev && data.nodes.some(n => n.data.id === prev.id)) return prev;
          return data.nodes[0].data;
        });
        setPathSource(prev => {
          if (prev && data.nodes.some(n => n.data.id === prev)) return prev;
          return data.nodes[0].data.id;
        });
        setPathTarget(prev => {
          if (prev && data.nodes.some(n => n.data.id === prev)) return prev;
          return data.nodes.length > 1 ? data.nodes[1].data.id : data.nodes[0].data.id;
        });
      } else {
        setSelectedNode(null);
      }
    } catch (err) {
      console.warn('Failed to load case graph', err);
    } finally {
      setLoading(false);
    }
  }, [currentCaseId, threatFilter, typeFilter, relationFilter]);

  // 3. Fetch Case Analytics
  const loadAnalytics = useCallback(async () => {
    try {
      const data = await api.getCaseAnalytics(currentCaseId);
      setAnalyticsData(data);
    } catch (err) {
      console.warn('Failed to load analytics', err);
    }
  }, [currentCaseId]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  useEffect(() => {
    loadGraph();
    loadAnalytics();
  }, [loadGraph, loadAnalytics]);

  // 4. Initialize & Render Cytoscape Instance
  useEffect(() => {
    if (!containerRef.current || loading) return;

    if (graphData.nodes.length === 0) {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
      return;
    }

    try {
      if (cyRef.current) {
        cyRef.current.destroy();
      }

      // Safe elements: ensure every edge has valid source and target to prevent Cytoscape errors
      const nodeIds = new Set(graphData.nodes.map(n => n.data.id));
      const safeEdges = (graphData.edges || []).filter(
        e => nodeIds.has(e.data.source) && nodeIds.has(e.data.target)
      );

      const cy = cytoscape({
        container: containerRef.current,
        elements: {
          nodes: graphData.nodes,
          edges: safeEdges
        },
        style: [
          // Base Node Style - Refined Intelligence Card
          {
            selector: 'node',
            style: {
              'background-color': '#171D24',
              'label': 'data(label)',
              'color': '#E6E9ED',
              'font-family': 'Inter, system-ui, sans-serif',
              'font-size': '11px',
              'font-weight': 600,
              'text-valign': 'bottom',
              'text-margin-y': 7,
              'text-background-opacity': 0.92,
              'text-background-color': '#101419',
              'text-background-padding': '3px 6px',
              'text-background-shape': 'roundrectangle',
              'text-border-width': 1,
              'text-border-color': '#2A333D',
              'text-border-opacity': 0.8,
              'width': (ele) => {
                const s = ele.data('size');
                const t = ele.data('type');
                if (t === 'Person') return 48;
                if (t === 'Vehicle' || t === 'Organization') return 52;
                return s || 44;
              },
              'height': (ele) => {
                const s = ele.data('size');
                const t = ele.data('type');
                if (t === 'Person') return 48;
                if (t === 'Vehicle' || t === 'Organization') return 36;
                return s || 44;
              },
              'border-width': 2,
              'border-color': (ele) => {
                const t = ele.data('type') || '';
                return ele.data('color') || ENTITY_CONFIG[t]?.color || '#5B7C99';
              },
              'border-opacity': 1.0,
              'shape': (ele) => {
                const t = ele.data('type') || '';
                return ele.data('shape') || ENTITY_CONFIG[t]?.shape || 'ellipse';
              },
              'shadow-blur': 10,
              'shadow-color': 'rgba(0, 0, 0, 0.65)',
              'shadow-opacity': 0.7,
              'shadow-offset-y': 2,
              'transition-property': 'background-color, border-color, border-width, shadow-blur, opacity',
              'transition-duration': '0.2s'
            }
          },
          // Critical Threat Nodes - Authoritative Crimson Accents
          {
            selector: 'node[threat = "CRITICAL"]',
            style: {
              'background-color': '#201517',
              'border-color': '#C04A52',
              'border-width': 3,
              'width': 56,
              'height': 56,
              'shadow-blur': 12,
              'shadow-color': 'rgba(192, 74, 82, 0.35)',
              'shadow-opacity': 0.8
            }
          },
          // High Threat Nodes - Amber Accents
          {
            selector: 'node[threat = "HIGH"]',
            style: {
              'background-color': '#1F1A14',
              'border-color': '#B58A45',
              'border-width': 2.5,
              'width': 50,
              'height': 50
            }
          },
          // Node Selection - Crisp Steel Blue Focus Ring
          {
            selector: 'node:selected',
            style: {
              'border-width': 3,
              'border-color': '#5B7C99',
              'background-color': '#17222B',
              'shadow-blur': 14,
              'shadow-color': 'rgba(91, 124, 153, 0.45)',
              'shadow-opacity': 1.0
            }
          },
          // Node Search / Path Highlight - Tactical Amber Focus Ring
          {
            selector: 'node.highlighted',
            style: {
              'border-width': 3,
              'border-color': '#B58A45',
              'background-color': '#221E14',
              'shadow-blur': 14,
              'shadow-color': 'rgba(181, 138, 69, 0.35)',
              'shadow-opacity': 1.0,
              'opacity': 1.0
            }
          },
          // Dimmed elements during pathfinding or search isolation
          {
            selector: 'node.dimmed',
            style: {
              'opacity': 0.18,
              'shadow-opacity': 0.05
            }
          },
          // Base Edge Style - Sleek Analytical Link
          {
            selector: 'edge',
            style: {
              'width': (ele) => {
                const rt = ele.data('relation_type') || 'association';
                return rt === 'financial' ? 2 : 1.5;
              },
              'line-color': (ele) => {
                const rt = ele.data('relation_type') || 'association';
                return RELATION_CONFIG[rt]?.color || 'rgba(141, 152, 165, 0.65)';
              },
              'line-style': (ele) => {
                const rt = ele.data('relation_type') || 'association';
                return RELATION_CONFIG[rt]?.style || 'solid';
              },
              'target-arrow-color': (ele) => {
                const rt = ele.data('relation_type') || 'association';
                return RELATION_CONFIG[rt]?.color || 'rgba(141, 152, 165, 0.85)';
              },
              'target-arrow-shape': 'triangle',
              'arrow-scale': 1.05,
              'curve-style': 'bezier',
              'label': 'data(relation)',
              'font-size': '9px',
              'font-family': 'JetBrains Mono, monospace',
              'font-weight': 500,
              'color': '#8D98A5',
              'text-rotation': 'autorotate',
              'text-background-opacity': 0.85,
              'text-background-color': '#101419',
              'text-background-padding': '2px 4px',
              'text-background-shape': 'roundrectangle',
              'text-border-width': 0,
              'opacity': 0.85,
              'transition-property': 'line-color, width, opacity',
              'transition-duration': '0.2s'
            }
          },
          // Edge Selection
          {
            selector: 'edge:selected',
            style: {
              'width': 3,
              'line-color': '#5B7C99',
              'target-arrow-color': '#5B7C99',
              'opacity': 1.0
            }
          },
          // Highlighted Path Edge
          {
            selector: 'edge.highlighted',
            style: {
              'width': 3,
              'line-color': '#B58A45',
              'target-arrow-color': '#B58A45',
              'opacity': 1.0
            }
          },
          {
            selector: 'edge.dimmed',
            style: {
              'opacity': 0.12
            }
          }
        ],
        layout: getLayoutConfig(layoutName)
      });

      // Events: Node Click
      cy.on('tap', 'node', (evt) => {
        const node = evt.target;
        cy.elements().removeClass('highlighted');
        node.addClass('highlighted');
        node.connectedEdges().addClass('highlighted');
        setSelectedNode(node.data());
        setSelectedEdge(null);
        setActiveSideDrawer('INSPECTOR');
        soundFx.click();
      });

      // Events: Edge Click
      cy.on('tap', 'edge', (evt) => {
        const edge = evt.target;
        cy.elements().removeClass('highlighted');
        edge.addClass('highlighted');
        edge.source().addClass('highlighted');
        edge.target().addClass('highlighted');
        setSelectedEdge(edge.data());
        setSelectedNode(null);
        setActiveSideDrawer('INSPECTOR');
        soundFx.click();
      });

      // Events: Background Click
      cy.on('tap', (evt) => {
        if (evt.target === cy) {
          setSelectedEdge(null);
        }
      });

      cyRef.current = cy;
    } catch (e) {
      console.error('Cytoscape initialization error:', e);
    }
  }, [graphData, layoutName, loading]);

  // Search & Focus on Node
  const handleSearchNode = (e) => {
    e.preventDefault();
    if (!cyRef.current || !searchQuery.trim()) return;

    const q = searchQuery.trim().toLowerCase();
    const cy = cyRef.current;
    cy.elements().removeClass('highlighted dimmed');

    const matched = cy.nodes().filter((node) => {
      const d = node.data();
      return (
        d.id.toLowerCase().includes(q) ||
        (d.label && d.label.toLowerCase().includes(q)) ||
        (d.details && d.details.toLowerCase().includes(q)) ||
        (d.properties?.registration && d.properties.registration.toLowerCase().includes(q)) ||
        (d.properties?.number && d.properties.number.toLowerCase().includes(q))
      );
    });

    if (matched.length > 0) {
      matched.addClass('highlighted');
      cy.nodes().difference(matched).addClass('dimmed');
      cy.edges().addClass('dimmed');

      const target = matched.first();
      cy.animate({
        center: { eles: target },
        zoom: 1.6,
        duration: 500
      });
      setSelectedNode(target.data());
      setSelectedEdge(null);
      setActiveSideDrawer('INSPECTOR');
      soundFx.beep();
    } else {
      soundFx.error();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (cyRef.current) {
      cyRef.current.elements().removeClass('highlighted dimmed');
      cyRef.current.fit(undefined, 35);
    }
  };

  // Find Connection / Shortest Path
  const handleFindPath = async (e) => {
    e?.preventDefault();
    if (!pathSource || !pathTarget || pathSource === pathTarget) return;

    setPathSearching(true);
    try {
      const res = await api.findCasePath(currentCaseId, pathSource, pathTarget);
      setPathResult(res);

      if (cyRef.current && res.found) {
        const cy = cyRef.current;
        cy.elements().removeClass('highlighted dimmed');
        cy.elements().addClass('dimmed');

        // Highlight path nodes and edges
        res.path_node_ids.forEach((id) => {
          cy.getElementById(id).removeClass('dimmed').addClass('highlighted');
        });
        (res.path_edge_ids || []).forEach((eId) => {
          cy.getElementById(eId).removeClass('dimmed').addClass('highlighted');
        });

        // Also highlight edges between sequential nodes if edge IDs differ
        for (let i = 0; i < res.path_node_ids.length - 1; i++) {
          const u = res.path_node_ids[i];
          const v = res.path_node_ids[i + 1];
          cy.edges().forEach((edge) => {
            if ((edge.source().id() === u && edge.target().id() === v) || (edge.source().id() === v && edge.target().id() === u)) {
              edge.removeClass('dimmed').addClass('highlighted');
            }
          });
        }

        soundFx.lock();
      } else {
        soundFx.error();
      }
    } catch (err) {
      console.warn('Path finding failed', err);
    } finally {
      setPathSearching(false);
    }
  };

  const handleClearPath = () => {
    setPathResult(null);
    if (cyRef.current) {
      cyRef.current.elements().removeClass('highlighted dimmed');
      cyRef.current.fit(undefined, 35);
    }
  };

  // 1-Hop Discovery Expansion
  const handleExpandNode = async (entityId) => {
    setExpandingNodeId(entityId);
    try {
      const res = await api.expandCaseNode(currentCaseId, entityId);
      if (res.expanded && res.new_nodes && res.new_nodes.length > 0 && cyRef.current) {
        const cy = cyRef.current;
        res.new_nodes.forEach((n) => {
          if (cy.getElementById(n.data.id).length === 0) {
            cy.add(n);
          }
        });
        res.new_edges.forEach((e) => {
          if (cy.getElementById(e.data.id).length === 0) {
            cy.add(e);
          }
        });
        cy.layout(getLayoutConfig(layoutName)).run();
        soundFx.beep();
      }
    } catch (e) {
      console.warn('Expansion failed', e);
    } finally {
      setExpandingNodeId(null);
    }
  };

  // Open Evidence Detail Modal
  const handleInspectEvidence = async (evidenceId) => {
    if (!evidenceId) return;
    try {
      const ev = await api.getEvidenceDetail(evidenceId);
      setInspectingEvidence(ev);
    } catch (e) {
      setInspectingEvidence({
        id: evidenceId,
        name: `${evidenceId} Investigation Record`,
        type: 'Documents',
        case_id: currentCaseId,
        processing_state: 'ANALYZED',
        source: 'Investigation File Record'
      });
    }
  };

  // Ask CIRA About Entity
  const handleAskCira = (entity) => {
    if (entity) {
      updateSubject({
        name: entity.label || entity.name || entity.id,
        id: entity.id,
        type: entity.type || 'Person'
      });
    }
    navigate('chat');
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: isFullscreen ? '100vh' : 'calc(100vh - 130px)',
      position: isFullscreen ? 'fixed' : 'relative',
      inset: isFullscreen ? 0 : 'auto',
      zIndex: isFullscreen ? 99999 : 1,
      background: 'var(--ink-0)',
      border: isFullscreen ? 'none' : '1px solid var(--b-soft)',
      borderRadius: isFullscreen ? 0 : '12px',
      overflow: 'hidden'
    }}>

      {/* ── TOP HEADER / CONTROLS ─────────────────────────────────────────── */}
      <div style={{
        padding: '12px 18px', background: 'var(--ink-1)', borderBottom: '1px solid var(--b-faint)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'
      }}>
        {/* Left: Case Selector & Telemetry Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={17} style={{ color: 'var(--green-light)' }} />
            <select
              value={currentCaseId}
              onChange={(e) => {
                const target = cases.find(c => c.id === e.target.value);
                if (target) setActiveCase(target);
              }}
              style={{
                background: 'var(--ink-2)', border: '1px solid var(--b-soft)',
                color: '#fff', fontSize: '0.78rem', padding: '6px 12px',
                borderRadius: '6px', fontFamily: 'var(--f-mono)', cursor: 'pointer'
              }}
            >
              {cases.map(c => (
                <option key={c.id} value={c.id}>
                  {c.id} · {c.title.slice(0, 28)}
                </option>
              ))}
            </select>
          </div>

          {/* Neo4j Database Status Pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px',
            borderRadius: '20px', fontSize: '0.68rem', fontFamily: 'var(--f-mono)',
            background: neo4jStatus.connected ? 'rgba(0, 200, 122, 0.12)' : 'rgba(217, 119, 6, 0.12)',
            color: neo4jStatus.connected ? 'var(--green-light)' : 'var(--amber-light)',
            border: `1px solid ${neo4jStatus.connected ? 'rgba(0, 200, 122, 0.3)' : 'rgba(217, 119, 6, 0.3)'}`
          }}
          title={neo4jStatus.connected ? `Connected to ${neo4jStatus.uri}` : neo4jStatus.last_error}
          >
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: neo4jStatus.connected ? 'var(--green-light)' : 'var(--amber-light)'
            }} />
            {neo4jStatus.connected ? 'Neo4j: Live Cypher Engine' : 'Neo4j: Local Cache Mode'}
          </div>

          <span style={{ fontSize: '0.72rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)' }}>
            {graphData.nodes?.length || 0} Entities · {graphData.edges?.length || 0} Relations
          </span>
        </div>

        {/* Center/Right: Primary View Mode Switcher & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* View Switcher Segmented Control */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--ink-2)',
            border: '1px solid var(--b-soft)',
            borderRadius: '7px',
            padding: '2px',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)'
          }}>
            <button
              onClick={() => setViewMode('GRAPH')}
              style={{
                padding: '5px 11px',
                background: viewMode === 'GRAPH' ? 'var(--blue)' : 'transparent',
                border: 'none',
                borderRadius: '5px',
                color: viewMode === 'GRAPH' ? '#fff' : 'var(--t-muted)',
                fontSize: '0.72rem',
                fontWeight: viewMode === 'GRAPH' ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
              title="Inspect relational node-and-edge network diagram"
            >
              <Share2 size={13} />
              <span>Network Graph</span>
            </button>

            <button
              onClick={() => setViewMode('WORLD_MAP')}
              style={{
                padding: '5px 11px',
                background: viewMode === 'WORLD_MAP' ? 'var(--blue)' : 'transparent',
                border: 'none',
                borderRadius: '5px',
                color: viewMode === 'WORLD_MAP' ? '#fff' : 'var(--t-muted)',
                fontSize: '0.72rem',
                fontWeight: viewMode === 'WORLD_MAP' ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
              title="Inspect global syndicate locations, corridors & Interpol notices on authentic world map"
            >
              <Globe size={13} />
              <span>Original World Map 🌍</span>
            </button>

            <button
              onClick={() => setViewMode('SPLIT')}
              style={{
                padding: '5px 11px',
                background: viewMode === 'SPLIT' ? 'var(--blue)' : 'transparent',
                border: 'none',
                borderRadius: '5px',
                color: viewMode === 'SPLIT' ? '#fff' : 'var(--t-muted)',
                fontSize: '0.72rem',
                fontWeight: viewMode === 'SPLIT' ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
              title="Side-by-side synchronized view of relational graph and world map"
            >
              <Columns size={13} />
              <span>Split Screen</span>
            </button>
          </div>

          {/* Cytoscape Layout Switcher (Visible in Graph & Split modes) */}
          {viewMode !== 'WORLD_MAP' && (
            <select
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
              style={{
                background: 'var(--ink-2)', border: '1px solid var(--b-soft)',
                color: 'var(--t-muted)', fontSize: '0.72rem', padding: '5px 10px',
                borderRadius: '6px', fontFamily: 'var(--f-mono)', cursor: 'pointer'
              }}
            >
              <option value="concentric">Layout: Concentric Radial (Command Center)</option>
              <option value="cose-bilkent">Layout: Force-Directed (Physics)</option>
              <option value="breadthfirst">Layout: Operational Hierarchy</option>
              <option value="circle">Layout: Perimeter Circle</option>
              <option value="grid">Layout: Matrix Grid</option>
            </select>
          )}

          <button
            onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.25)}
            title="Zoom In"
            style={{ padding: '6px', background: 'var(--ink-2)', border: '1px solid var(--b-soft)', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}
          >
            <ZoomIn size={15} />
          </button>
          <button
            onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 0.8)}
            title="Zoom Out"
            style={{ padding: '6px', background: 'var(--ink-2)', border: '1px solid var(--b-soft)', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}
          >
            <ZoomOut size={15} />
          </button>
          <button
            onClick={() => cyRef.current?.fit(undefined, 35)}
            title="Fit View"
            style={{ padding: '6px', background: 'var(--ink-2)', border: '1px solid var(--b-soft)', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}
          >
            <Maximize2 size={15} />
          </button>
          <button
            onClick={() => loadGraph()}
            title="Reload Network"
            style={{ padding: '6px', background: 'var(--ink-2)', border: '1px solid var(--b-soft)', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}
          >
            <RefreshCw size={15} />
          </button>

          {/* Drawer Toggles */}
          <div style={{ display: 'flex', background: 'var(--ink-2)', border: '1px solid var(--b-soft)', borderRadius: '6px', padding: '2px' }}>
            <button
              onClick={() => setActiveSideDrawer('INSPECTOR')}
              style={{
                padding: '4px 8px', background: activeSideDrawer === 'INSPECTOR' ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: 'none', borderRadius: '4px', color: '#fff', fontSize: '0.68rem', cursor: 'pointer'
              }}
            >
              Inspector
            </button>
            <button
              onClick={() => setActiveSideDrawer('ENTITIES')}
              style={{
                padding: '4px 8px', background: activeSideDrawer === 'ENTITIES' ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: 'none', borderRadius: '4px', color: '#fff', fontSize: '0.68rem', cursor: 'pointer'
              }}
            >
              Entities ({graphData.nodes?.length || 0})
            </button>
            <button
              onClick={() => setActiveSideDrawer('RELATIONS')}
              style={{
                padding: '4px 8px', background: activeSideDrawer === 'RELATIONS' ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: 'none', borderRadius: '4px', color: '#fff', fontSize: '0.68rem', cursor: 'pointer'
              }}
            >
              Relations ({graphData.edges?.length || 0})
            </button>
            <button
              onClick={() => setActiveSideDrawer('PATHFINDER')}
              style={{
                padding: '4px 8px', background: activeSideDrawer === 'PATHFINDER' ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: 'none', borderRadius: '4px', color: '#fff', fontSize: '0.68rem', cursor: 'pointer'
              }}
            >
              Pathfinder
            </button>
            <button
              onClick={() => setActiveSideDrawer('ANALYTICS')}
              style={{
                padding: '4px 8px', background: activeSideDrawer === 'ANALYTICS' ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: 'none', borderRadius: '4px', color: '#fff', fontSize: '0.68rem', cursor: 'pointer'
              }}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveSideDrawer('LEGEND')}
              style={{
                padding: '4px 8px', background: activeSideDrawer === 'LEGEND' ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: 'none', borderRadius: '4px', color: '#fff', fontSize: '0.68rem', cursor: 'pointer'
              }}
            >
              Legend
            </button>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Investigation'}
            style={{
              padding: '6px 10px', background: isFullscreen ? 'var(--blue)' : 'var(--ink-2)',
              border: '1px solid var(--b-soft)', borderRadius: '6px', color: '#fff', fontSize: '0.72rem',
              display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer'
            }}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            <span>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* ── FILTER & SEARCH STRIP ─────────────────────────────────────────── */}
      <div style={{
        padding: '8px 18px', background: 'var(--ink-2)', borderBottom: '1px solid var(--b-faint)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px'
      }}>
        {/* Search Input */}
        <form onSubmit={handleSearchNode} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--t-dim)' }} />
            <input
              type="text"
              placeholder="Search entity, ID, phone, VIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '240px', padding: '6px 10px 6px 30px', background: 'var(--ink-1)',
                border: '1px solid var(--b-soft)', borderRadius: '6px', color: '#fff',
                fontSize: '0.74rem', fontFamily: 'var(--f-mono)', outline: 'none'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{ position: 'absolute', right: '6px', top: '7px', background: 'none', border: 'none', color: 'var(--t-dim)', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            type="submit"
            style={{
              padding: '6px 12px', background: 'var(--green)', border: 'none',
              borderRadius: '6px', color: '#06090e', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer'
            }}
          >
            Focus
          </button>
        </form>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Entity Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)' }}>TYPE:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                background: 'var(--ink-1)', border: '1px solid var(--b-soft)',
                color: '#fff', fontSize: '0.70rem', padding: '4px 8px', borderRadius: '4px'
              }}
            >
              <option value="ALL">All Entities</option>
              <option value="Person">Person</option>
              <option value="Phone">Phone</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Financial Account">Financial</option>
              <option value="Location">Location</option>
              <option value="Organization">Organization</option>
              <option value="Evidence">Evidence</option>
            </select>
          </div>

          {/* Relation Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)' }}>RELATION:</span>
            <select
              value={relationFilter}
              onChange={(e) => setRelationFilter(e.target.value)}
              style={{
                background: 'var(--ink-1)', border: '1px solid var(--b-soft)',
                color: '#fff', fontSize: '0.70rem', padding: '4px 8px', borderRadius: '4px'
              }}
            >
              <option value="ALL">All Relations</option>
              <option value="calls">Calls / Messages</option>
              <option value="financial">Financial / Escrow</option>
              <option value="ownership">Ownership / Vehicles</option>
              <option value="location">Location / Staging</option>
              <option value="evidence_backed">Evidence-Backed</option>
              <option value="organization">Syndicate Hierarchy</option>
              <option value="association">Tactical Associations</option>
            </select>
          </div>

          {/* Threat Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)' }}>THREAT:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((tf) => (
              <button
                key={tf}
                onClick={() => setThreatFilter(tf)}
                style={{
                  padding: '3px 7px', borderRadius: '4px', fontSize: '0.64rem',
                  fontFamily: 'var(--f-mono)', cursor: 'pointer',
                  border: threatFilter === tf ? '1px solid var(--green)' : '1px solid var(--b-soft)',
                  background: threatFilter === tf ? 'rgba(0, 200, 122, 0.14)' : 'var(--ink-1)',
                  color: threatFilter === tf ? 'var(--green-light)' : 'var(--t-muted)'
                }}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Reset Filters when any filter is active */}
          {(typeFilter !== 'ALL' || relationFilter !== 'ALL' || threatFilter !== 'ALL') && (
            <button
              onClick={() => {
                setTypeFilter('ALL');
                setRelationFilter('ALL');
                setThreatFilter('ALL');
              }}
              style={{
                padding: '3px 8px', borderRadius: '4px', fontSize: '0.64rem',
                fontFamily: 'var(--f-mono)', background: 'rgba(255, 42, 95, 0.15)',
                border: '1px solid rgba(255, 42, 95, 0.3)', color: 'var(--red-light)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
              }}
            >
              <X size={12} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* ── MAIN WORKSPACE: GRAPH CANVAS / WORLD MAP + SIDE DRAWERS ───────────────────── */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>

        {/* VIEW 1: CYTOSCAPE CANVAS (Visible in 'GRAPH' and 'SPLIT') */}
        <div
          className="graph-viewport-container graph-container"
          style={{
            flex: viewMode === 'WORLD_MAP' ? 'none' : 1,
            display: viewMode === 'WORLD_MAP' ? 'none' : 'block',
            width: viewMode === 'SPLIT' ? '50%' : '100%',
            position: 'relative',
            overflow: 'hidden',
            borderRight: viewMode === 'SPLIT' ? '1px solid var(--b-soft)' : 'none'
          }}
        >
          {/* Glowing HUD Reticle Corners */}
          <div className="hud-corner hud-tl" />
          <div className="hud-corner hud-tr" />
          <div className="hud-corner hud-bl" />
          <div className="hud-corner hud-br" />

          {/* Tactical Matrix Docket Badge */}
          <div style={{
            position: 'absolute', top: '16px', left: '16px', zIndex: 4,
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '5px 12px', background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)', borderRadius: '4px',
            boxShadow: 'var(--shadow-sm)', backdropFilter: 'blur(8px)',
            pointerEvents: 'none'
          }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: 'var(--primary)'
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 600,
              color: 'var(--text-high)', letterSpacing: '0.04em', textTransform: 'uppercase'
            }}>
              RELATIONAL NETWORK GRAPH · {currentCaseId}
            </span>
          </div>

          {loading && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 10,
              background: 'rgba(4, 7, 17, 0.75)', backdropFilter: 'blur(4px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px'
            }}>
              <RefreshCw size={28} className="spin" style={{ color: 'var(--green-light)' }} />
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: '0.82rem', color: 'var(--t-dim)' }}>
                Querying Neo4j Criminal Network Topology...
              </div>
            </div>
          )}

          {/* Empty Case State */}
          {!loading && graphData.nodes?.length === 0 && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '24px', textAlign: 'center'
            }}>
              <Shield size={44} style={{ color: 'var(--t-dim)', marginBottom: '14px', opacity: 0.5 }} />
              <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 600 }}>
                No Network Data Available
              </h4>
              <p style={{ color: 'var(--t-muted)', fontSize: '0.82rem', maxWidth: '420px', marginTop: '6px', lineHeight: 1.5 }}>
                No entities or relationships have been mapped for <strong>{currentCaseId}</strong> yet.
                Upload and process evidence to construct this case's graph.
              </p>
              <button
                onClick={() => {
                  setActiveCaseTab('EVIDENCE');
                  navigate('workspace');
                }}
                style={{
                  marginTop: '16px', padding: '8px 18px', background: 'var(--green)',
                  border: 'none', borderRadius: '6px', color: '#06090e', fontWeight: 700,
                  fontSize: '0.80rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <span>Go to Evidence</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Cytoscape Container Element */}
          <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        </div>

        {/* VIEW 2: ORIGINAL WORLD MAP (Visible in 'WORLD_MAP' and 'SPLIT') */}
        {(viewMode === 'WORLD_MAP' || viewMode === 'SPLIT') && (
          <div style={{
            flex: 1,
            width: viewMode === 'SPLIT' ? '50%' : '100%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <WorldIntelligenceMap
              externalNodes={graphData.nodes}
              selectedEntity={selectedNode}
              onSelectEntity={(node) => {
                setSelectedNode(node);
                if (cyRef.current) {
                  const ele = cyRef.current.getElementById(node.id);
                  if (ele.length > 0) {
                    cyRef.current.elements().removeClass('highlighted dimmed');
                    ele.addClass('highlighted');
                    ele.neighborhood().addClass('highlighted');
                    cyRef.current.elements().not(ele).not(ele.neighborhood()).addClass('dimmed');
                  }
                }
              }}
              onInspectInGraph={(node) => {
                setViewMode('GRAPH');
                setTimeout(() => {
                  if (cyRef.current) {
                    const ele = cyRef.current.getElementById(node.id);
                    if (ele.length > 0) {
                      cyRef.current.animate({ center: { eles: ele }, zoom: 1.6, duration: 400 });
                    }
                  }
                }, 150);
              }}
              onAskCira={handleAskCira}
              height="100%"
            />
          </div>
        )}

        {/* ── RIGHT SLIDE-OUT PANEL ────────────────────────────────────────── */}
        <div style={{
          width: '380px', borderLeft: '1px solid var(--b-soft)',
          background: 'var(--ink-1)', display: 'flex', flexDirection: 'column',
          overflowY: 'auto', zIndex: 5
        }}>

          {/* PANEL 1: ENTITY / EDGE INSPECTOR */}
          {activeSideDrawer === 'INSPECTOR' && (
            <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Edge Selected State */}
              {selectedEdge ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)' }}>
                      RELATIONSHIP INSPECTOR
                    </span>
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '0.64rem',
                      fontFamily: 'var(--f-mono)', background: 'rgba(56, 189, 248, 0.12)', color: 'var(--blue-light)'
                    }}>
                      {selectedEdge.relation}
                    </span>
                  </div>

                  <h3 style={{ color: '#fff', fontSize: '0.98rem', fontWeight: 700, marginBottom: '6px' }}>
                    {selectedEdge.relation}
                  </h3>

                  <div style={{
                    padding: '12px', background: 'var(--ink-2)', borderRadius: '8px',
                    border: '1px solid var(--b-faint)', display: 'flex', flexDirection: 'column', gap: '8px',
                    marginTop: '10px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                      <span style={{ color: 'var(--t-dim)' }}>Source:</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{selectedEdge.source}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                      <span style={{ color: 'var(--t-dim)' }}>Target:</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{selectedEdge.target}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                      <span style={{ color: 'var(--t-dim)' }}>Confidence:</span>
                      <span style={{ color: 'var(--green-light)', fontFamily: 'var(--f-mono)', fontWeight: 700 }}>
                        {Math.round((selectedEdge.confidence || 0.95) * 100)}%
                      </span>
                    </div>
                    {selectedEdge.timestamp && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                        <span style={{ color: 'var(--t-dim)' }}>Timestamp:</span>
                        <span style={{ color: 'var(--t-muted)', fontFamily: 'var(--f-mono)' }}>{selectedEdge.timestamp}</span>
                      </div>
                    )}
                  </div>

                  {/* Explainability Block */}
                  <div style={{ marginTop: '14px' }}>
                    <div style={{ fontSize: '0.70rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Forensic Rationale / Explainability
                    </div>
                    <div style={{
                      padding: '12px', background: 'var(--ink-2)', border: '1px solid var(--b-faint)',
                      borderRadius: '8px', fontSize: '0.78rem', color: 'var(--t-muted)', lineHeight: 1.5
                    }}>
                      {selectedEdge.explainability || 'Direct semantic relationship identified in active case evidence.'}
                    </div>
                  </div>

                  {/* Supporting Evidence Asset */}
                  {selectedEdge.supporting_evidence_id && (
                    <div style={{ marginTop: '14px' }}>
                      <div style={{ fontSize: '0.70rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Supporting Evidence File
                      </div>
                      <div style={{
                        padding: '10px 12px', background: 'var(--ink-2)', border: '1px solid var(--b-soft)',
                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.80rem', fontWeight: 600, color: '#fff' }}>
                            {selectedEdge.supporting_evidence_name || selectedEdge.supporting_evidence_id}
                          </div>
                          <div style={{ fontSize: '0.64rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)' }}>
                            ID: {selectedEdge.supporting_evidence_id}
                          </div>
                        </div>
                        <button
                          onClick={() => handleInspectEvidence(selectedEdge.supporting_evidence_id)}
                          style={{
                            padding: '5px 10px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)',
                            borderRadius: '5px', color: 'var(--blue-light)', fontSize: '0.70rem', cursor: 'pointer'
                          }}
                        >
                          View Evidence →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : selectedNode ? (
                /* Node Selected State */
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '0.64rem',
                      fontFamily: 'var(--f-mono)', fontWeight: 700,
                      background: 'rgba(255,255,255,0.08)', color: selectedNode.color || 'var(--blue-light)'
                    }}>
                      {selectedNode.type?.toUpperCase()}
                    </span>

                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '0.64rem',
                      fontFamily: 'var(--f-mono)', fontWeight: 700,
                      background: selectedNode.threat === 'CRITICAL' ? 'rgba(255,42,95,0.15)' : 'rgba(217,119,6,0.15)',
                      color: selectedNode.threat === 'CRITICAL' ? 'var(--red-light)' : 'var(--amber-light)',
                      border: `1px solid ${selectedNode.threat === 'CRITICAL' ? 'rgba(255,42,95,0.3)' : 'rgba(217,119,6,0.3)'}`
                    }}>
                      {selectedNode.threat || 'HIGH'}
                    </span>
                  </div>

                  <h3 style={{ color: '#fff', fontSize: '1.08rem', fontWeight: 700 }}>
                    {selectedNode.label || selectedNode.id}
                  </h3>
                  <div style={{ fontSize: '0.68rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)', marginTop: '2px' }}>
                    STABLE ID: {selectedNode.id}
                  </div>

                  {/* Details summary */}
                  <div style={{
                    padding: '12px', background: 'var(--ink-2)', border: '1px solid var(--b-faint)',
                    borderRadius: '8px', fontSize: '0.78rem', color: 'var(--t-muted)', lineHeight: 1.5,
                    marginTop: '12px'
                  }}>
                    {selectedNode.details || 'Identified entity mapped in active investigation docket.'}
                  </div>

                  {/* Property Attributes */}
                  {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
                    <div style={{ marginTop: '14px' }}>
                      <div style={{ fontSize: '0.70rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Properties & Identifiers
                      </div>
                      <div style={{
                        padding: '10px 12px', background: 'var(--ink-2)', borderRadius: '8px',
                        border: '1px solid var(--b-faint)', display: 'flex', flexDirection: 'column', gap: '6px'
                      }}>
                        {Object.entries(selectedNode.properties)
                          .filter(([k]) => !['details', 'label', 'dataset'].includes(k))
                          .slice(0, 6)
                          .map(([k, v]) => (
                            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                              <span style={{ color: 'var(--t-dim)', textTransform: 'capitalize' }}>{k.replace('_', ' ')}:</span>
                              <span style={{ color: '#fff', fontFamily: 'var(--f-mono)' }}>{String(v)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '18px' }}>
                    <button
                      onClick={() => handleAskCira(selectedNode)}
                      style={{
                        padding: '9px 14px', background: 'var(--green)', border: 'none',
                        borderRadius: '6px', color: '#06090e', fontWeight: 700, fontSize: '0.76rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}
                    >
                      <MessageSquare size={14} />
                      <span>Ask CIRA About Subject</span>
                    </button>

                    <button
                      onClick={() => handleExpandNode(selectedNode.id)}
                      disabled={expandingNodeId === selectedNode.id}
                      style={{
                        padding: '9px 14px', background: 'var(--ink-2)', border: '1px solid var(--b-soft)',
                        borderRadius: '6px', color: '#fff', fontSize: '0.76rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}
                    >
                      <Plus size={14} />
                      <span>{expandingNodeId === selectedNode.id ? 'Expanding...' : 'Expand 1-Hop Discovery'}</span>
                    </button>

                    <button
                      onClick={() => setViewMode('WORLD_MAP')}
                      style={{
                        padding: '9px 14px', background: 'rgba(63, 95, 120, 0.25)', border: '1px solid var(--accent)',
                        borderRadius: '6px', color: 'var(--accent-hover)', fontSize: '0.76rem', fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}
                      title="Inspect this entity on the global transnational intelligence world map"
                    >
                      <Globe size={14} />
                      <span>View on Original World Map 🌍 →</span>
                    </button>

                    <button
                      onClick={() => navigate('cr204')}
                      style={{
                        padding: '9px 14px', background: 'var(--bg-surface)', border: '1px solid var(--accent)',
                        borderRadius: '6px', color: 'var(--accent-hover)', fontSize: '0.76rem', fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}
                      title="Inspect this entity on the real geographic CCTV surveillance map"
                    >
                      <MapPin size={14} />
                      <span>Inspect on CCTV Tactical Map →</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ textAlign: 'center', padding: '24px 10px 14px', color: 'var(--t-dim)' }}>
                    <Eye size={28} style={{ opacity: 0.4, marginBottom: '8px' }} />
                    <div style={{ fontSize: '0.78rem', color: '#fff', fontWeight: 600 }}>Forensic Node Inspector</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--t-muted)', marginTop: '4px' }}>
                      Click any entity on the canvas or select from the docket below:
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '0.66rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)', textTransform: 'uppercase' }}>
                      Docket Entities ({graphData.nodes?.length || 0})
                    </div>
                    {(graphData.nodes || []).slice(0, 8).map(n => (
                      <div
                        key={n.data.id}
                        onClick={() => {
                          const cy = cyRef.current;
                          if (cy) {
                            const ele = cy.getElementById(n.data.id);
                            if (ele.length > 0) {
                              cy.animate({ center: { eles: ele }, zoom: 1.6, duration: 400 });
                            }
                          }
                          setSelectedNode(n.data);
                          setSelectedEdge(null);
                          soundFx.click();
                        }}
                        style={{
                          padding: '8px 10px', background: 'var(--ink-2)', borderRadius: '6px',
                          border: '1px solid var(--b-faint)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            width: '10px', height: '10px', borderRadius: n.data.shape === 'ellipse' ? '50%' : '2px',
                            background: n.data.color || '#38bdf8'
                          }} />
                          <span style={{ fontSize: '0.74rem', color: '#fff', fontWeight: 600 }}>
                            {n.data.label || n.data.id}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '0.62rem', fontFamily: 'var(--f-mono)', padding: '2px 6px',
                          borderRadius: '3px', background: 'rgba(255,255,255,0.06)',
                          color: n.data.threat === 'CRITICAL' ? 'var(--red-light)' : 'var(--amber-light)'
                        }}>
                          {n.data.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PANEL: DOCKET ENTITY ROSTER */}
          {activeSideDrawer === 'ENTITIES' && (
            <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)' }}>
                  CASE ENTITY ROSTER ({graphData.nodes?.length || 0})
                </div>
                <span style={{ fontSize: '0.66rem', color: 'var(--green-light)', fontFamily: 'var(--f-mono)' }}>
                  {currentCaseId}
                </span>
              </div>

              <p style={{ fontSize: '0.74rem', color: 'var(--t-muted)', lineHeight: 1.4 }}>
                All mapped forensic nodes currently active under selected filters. Click any entity to center and inspect.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
                {(graphData.nodes || []).map((n) => {
                  const d = n.data;
                  const isSelected = selectedNode?.id === d.id;
                  return (
                    <div
                      key={d.id}
                      onClick={() => {
                        const cy = cyRef.current;
                        if (cy) {
                          const ele = cy.getElementById(d.id);
                          if (ele.length > 0) {
                            cy.animate({ center: { eles: ele }, zoom: 1.6, duration: 400 });
                          }
                        }
                        setSelectedNode(d);
                        setSelectedEdge(null);
                        setActiveSideDrawer('INSPECTOR');
                        soundFx.click();
                      }}
                      style={{
                        padding: '10px 12px',
                        background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'var(--ink-2)',
                        border: isSelected ? '1px solid var(--blue)' : '1px solid var(--b-faint)',
                        borderRadius: '6px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          width: '12px', height: '12px',
                          borderRadius: d.shape === 'ellipse' ? '50%' : '3px',
                          background: d.color || '#38bdf8',
                          boxShadow: `0 0 6px ${d.color || '#38bdf8'}`
                        }} />
                        <div>
                          <div style={{ fontSize: '0.76rem', color: '#fff', fontWeight: 600 }}>
                            {d.label || d.id}
                          </div>
                          <div style={{ fontSize: '0.64rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)' }}>
                            {d.id}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                        <span style={{
                          fontSize: '0.62rem', fontFamily: 'var(--f-mono)', padding: '2px 6px',
                          borderRadius: '3px', background: 'rgba(255,255,255,0.06)', color: 'var(--blue-light)'
                        }}>
                          {d.type}
                        </span>
                        <span style={{
                          fontSize: '0.58rem', fontFamily: 'var(--f-mono)', fontWeight: 700,
                          color: d.threat === 'CRITICAL' ? 'var(--red-light)' : d.threat === 'HIGH' ? 'var(--amber-light)' : 'var(--green-light)'
                        }}>
                          {d.threat || 'MEDIUM'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PANEL: DOCKET RELATIONSHIP ROSTER */}
          {activeSideDrawer === 'RELATIONS' && (
            <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)' }}>
                  RELATIONSHIPS ROSTER ({graphData.edges?.length || 0})
                </div>
                <span style={{ fontSize: '0.66rem', color: 'var(--green-light)', fontFamily: 'var(--f-mono)' }}>
                  {currentCaseId}
                </span>
              </div>

              <p style={{ fontSize: '0.74rem', color: 'var(--t-muted)', lineHeight: 1.4 }}>
                Active semantic links between suspects, comms, vehicles, and accounts. Click any relation to highlight and inspect.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
                {(graphData.edges || []).map((e) => {
                  const ed = e.data;
                  const isSelected = selectedEdge?.id === ed.id;
                  const srcLabel = graphData.nodes?.find(n => n.data.id === ed.source)?.data.label || ed.source;
                  const tgtLabel = graphData.nodes?.find(n => n.data.id === ed.target)?.data.label || ed.target;
                  const cfg = RELATION_CONFIG[ed.relation_type] || RELATION_CONFIG.association;

                  return (
                    <div
                      key={ed.id}
                      onClick={() => {
                        const cy = cyRef.current;
                        if (cy) {
                          const eEle = cy.getElementById(ed.id);
                          if (eEle.length > 0) {
                            cy.animate({ center: { eles: eEle }, zoom: 1.5, duration: 400 });
                            cy.elements().removeClass('highlighted');
                            eEle.addClass('highlighted');
                            eEle.source().addClass('highlighted');
                            eEle.target().addClass('highlighted');
                          }
                        }
                        setSelectedEdge(ed);
                        setSelectedNode(null);
                        setActiveSideDrawer('INSPECTOR');
                        soundFx.click();
                      }}
                      style={{
                        padding: '10px 12px',
                        background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'var(--ink-2)',
                        border: isSelected ? '1px solid var(--blue)' : '1px solid var(--b-faint)',
                        borderRadius: '6px', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', gap: '6px',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{
                          padding: '2px 6px', borderRadius: '4px', fontSize: '0.62rem',
                          fontFamily: 'var(--f-mono)', fontWeight: 700,
                          background: 'rgba(255,255,255,0.06)', color: cfg.color
                        }}>
                          {ed.relation}
                        </span>
                        <span style={{ fontSize: '0.62rem', fontFamily: 'var(--f-mono)', color: 'var(--green-light)', fontWeight: 700 }}>
                          {Math.round((ed.confidence || 0.95) * 100)}%
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem' }}>
                        <span style={{ color: '#fff', fontWeight: 600 }}>{srcLabel}</span>
                        <span style={{ color: cfg.color }}>→</span>
                        <span style={{ color: '#fff', fontWeight: 600 }}>{tgtLabel}</span>
                      </div>

                      {ed.explainability && (
                        <div style={{ fontSize: '0.68rem', color: 'var(--t-muted)', lineHeight: 1.3 }}>
                          {ed.explainability}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PANEL 2: PATHFINDER ("FIND CONNECTION") */}
          {activeSideDrawer === 'PATHFINDER' && (
            <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)' }}>
                NEO4J SHORTEST PATHFINDER
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--t-muted)', lineHeight: 1.4 }}>
                Find shortest chain of relationships and evidence connections between two suspects or entities in <strong>{currentCaseId}</strong>.
              </p>

              <form onSubmit={handleFindPath} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.70rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)', display: 'block', marginBottom: '4px' }}>
                    SOURCE ENTITY
                  </label>
                  <select
                    value={pathSource}
                    onChange={(e) => setPathSource(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', background: 'var(--ink-2)', border: '1px solid var(--b-soft)', color: '#fff', borderRadius: '6px', fontSize: '0.76rem' }}
                  >
                    {graphData.nodes?.map((n) => (
                      <option key={n.data.id} value={n.data.id}>
                        {n.data.label} ({n.data.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.70rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)', display: 'block', marginBottom: '4px' }}>
                    TARGET ENTITY
                  </label>
                  <select
                    value={pathTarget}
                    onChange={(e) => setPathTarget(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', background: 'var(--ink-2)', border: '1px solid var(--b-soft)', color: '#fff', borderRadius: '6px', fontSize: '0.76rem' }}
                  >
                    {graphData.nodes?.map((n) => (
                      <option key={n.data.id} value={n.data.id}>
                        {n.data.label} ({n.data.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <button
                    type="submit"
                    disabled={pathSearching || !pathSource || !pathTarget}
                    style={{
                      flex: 1, padding: '9px 14px', background: 'var(--green)', border: 'none',
                      borderRadius: '6px', color: '#06090e', fontWeight: 700, fontSize: '0.78rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}
                  >
                    <Route size={14} />
                    <span>{pathSearching ? 'Computing...' : 'Find Connection'}</span>
                  </button>
                  {pathResult && (
                    <button
                      type="button"
                      onClick={handleClearPath}
                      style={{
                        padding: '9px 12px', background: 'var(--ink-2)', border: '1px solid var(--b-soft)',
                        borderRadius: '6px', color: 'var(--t-muted)', fontSize: '0.74rem', cursor: 'pointer'
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>

              {/* Path Result Display */}
              {pathResult && (
                <div style={{
                  marginTop: '12px', padding: '14px', background: 'var(--ink-2)',
                  border: `1px solid ${pathResult.found ? 'rgba(0, 200, 122, 0.3)' : 'rgba(255, 42, 95, 0.3)'}`,
                  borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: pathResult.found ? 'var(--green-light)' : 'var(--red-light)' }}>
                      {pathResult.found ? `Path Discovered (${pathResult.hops} Hops)` : 'No Connection Found'}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)' }}>
                      Cypher Result
                    </span>
                  </div>

                  {pathResult.found ? (
                    <div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {pathResult.path_node_ids.map((nId, idx) => (
                          <div key={nId} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem' }}>
                            <span style={{
                              width: '18px', height: '18px', borderRadius: '50%', background: '#fbbf24',
                              color: '#06090e', fontSize: '0.62rem', fontWeight: 800, display: 'flex',
                              alignItems: 'center', justifyContent: 'center'
                            }}>
                              {idx + 1}
                            </span>
                            <span style={{ color: '#fff', fontWeight: 600 }}>{nId}</span>
                          </div>
                        ))}
                      </div>

                      {pathResult.supporting_evidence && pathResult.supporting_evidence.length > 0 && (
                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--b-faint)' }}>
                          <span style={{ fontSize: '0.66rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)', display: 'block', marginBottom: '4px' }}>
                            CHAIN OF EVIDENCE
                          </span>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {pathResult.supporting_evidence.map(evId => (
                              <button
                                key={evId}
                                onClick={() => handleInspectEvidence(evId)}
                                style={{
                                  padding: '2px 8px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)',
                                  borderRadius: '4px', fontSize: '0.66rem', color: 'var(--blue-light)', cursor: 'pointer'
                                }}
                              >
                                {evId} ↗
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.74rem', color: 'var(--t-muted)' }}>
                      No direct or intermediate path connects these entities within the current docket.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PANEL 3: NETWORK ANALYTICS (NEUTRAL / UNBIASED) */}
          {activeSideDrawer === 'ANALYTICS' && (
            <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)' }}>
                NETWORK CENTRALITY & ANALYTICS
              </div>

              {analyticsData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Top Summary Metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div style={{ padding: '10px', background: 'var(--ink-2)', borderRadius: '6px', border: '1px solid var(--b-faint)' }}>
                      <div style={{ fontSize: '0.64rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)' }}>ENTITIES</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                        {analyticsData.total_entities}
                      </div>
                    </div>
                    <div style={{ padding: '10px', background: 'var(--ink-2)', borderRadius: '6px', border: '1px solid var(--b-faint)' }}>
                      <div style={{ fontSize: '0.64rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)' }}>RELATIONSHIPS</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--green-light)', marginTop: '2px' }}>
                        {analyticsData.total_relationships}
                      </div>
                    </div>
                  </div>

                  {/* Entity Breakdown */}
                  <div>
                    <div style={{ fontSize: '0.70rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Entity Breakdown by Category
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {Object.entries(analyticsData.entity_breakdown || {}).map(([type, count]) => (
                        <div key={type} style={{
                          padding: '6px 10px', background: 'var(--ink-2)', borderRadius: '4px',
                          display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem'
                        }}>
                          <span style={{ color: '#fff' }}>{type}</span>
                          <span style={{ fontFamily: 'var(--f-mono)', color: 'var(--t-dim)', fontWeight: 700 }}>{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Most Connected Entities (Neutral Terminology) */}
                  <div>
                    <div style={{ fontSize: '0.70rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Most Connected Entities (Degree Centrality)
                    </div>
                    <div style={{
                      background: 'var(--ink-2)', borderRadius: '6px', border: '1px solid var(--b-faint)',
                      overflow: 'hidden'
                    }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--b-faint)', background: 'rgba(0,0,0,0.2)' }}>
                            <th style={{ padding: '7px 10px', fontSize: '0.64rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)' }}>ENTITY</th>
                            <th style={{ padding: '7px 10px', fontSize: '0.64rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)' }}>TYPE</th>
                            <th style={{ padding: '7px 10px', fontSize: '0.64rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)' }}>CONNS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(analyticsData.most_connected_entities || []).slice(0, 6).map((item) => (
                            <tr
                              key={item.id}
                              onClick={() => {
                                const cy = cyRef.current;
                                if (cy) {
                                  const ele = cy.getElementById(item.id);
                                  if (ele.length > 0) {
                                    cy.animate({ center: { eles: ele }, zoom: 1.6, duration: 400 });
                                    setSelectedNode(ele.data());
                                    setActiveSideDrawer('INSPECTOR');
                                  }
                                }
                              }}
                              style={{ borderBottom: '1px solid var(--b-faint)', cursor: 'pointer' }}
                            >
                              <td style={{ padding: '7px 10px', fontSize: '0.72rem', color: '#fff', fontWeight: 600 }}>
                                {item.name || item.id}
                              </td>
                              <td style={{ padding: '7px 10px', fontSize: '0.66rem', color: 'var(--t-muted)' }}>
                                {item.type}
                              </td>
                              <td style={{ padding: '7px 10px', fontSize: '0.72rem', color: 'var(--green-light)', fontFamily: 'var(--f-mono)', fontWeight: 700 }}>
                                {item.connection_count}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--t-dim)', fontSize: '0.76rem' }}>Calculating case metrics...</div>
              )}
            </div>
          )}

          {/* PANEL 4: VISUAL LEGEND */}
          {activeSideDrawer === 'LEGEND' && (
            <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)' }}>
                GRAPH VISUAL ENCODING LEGEND
              </div>

              {/* 7 Standard Shapes */}
              <div>
                <div style={{ fontSize: '0.70rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Entity Geometric Shapes (7 Types)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { type: 'Person', shape: 'ellipse', color: '#f87171', label: 'Person' },
                    { type: 'Phone', shape: 'round-rectangle', color: '#38bdf8', label: 'Phone / Comm' },
                    { type: 'Vehicle', shape: 'diamond', color: '#fbbf24', label: 'Vehicle' },
                    { type: 'Financial Account', shape: 'hexagon', color: '#34d399', label: 'Financial Account' },
                    { type: 'Location', shape: 'octagon', color: '#c084fc', label: 'Location' },
                    { type: 'Organization', shape: 'rectangle', color: '#f472b6', label: 'Organization' },
                    { type: 'Evidence', shape: 'tag', color: '#38bdf8', label: 'Evidence Asset' }
                  ].map((cfg) => (
                    <div key={cfg.type} style={{
                      padding: '6px 10px', background: 'var(--ink-2)', borderRadius: '6px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      borderLeft: `3px solid ${cfg.color}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          width: '14px', height: '14px', borderRadius: cfg.shape === 'ellipse' ? '50%' : '3px',
                          background: cfg.color, display: 'inline-block',
                          boxShadow: `0 0 8px ${cfg.color}`
                        }} />
                        <span style={{ fontSize: '0.74rem', color: '#fff' }}>{cfg.label}</span>
                      </div>
                      <span style={{ fontSize: '0.64rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)', textTransform: 'uppercase' }}>
                        {cfg.shape}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Relationships */}
              <div>
                <div style={{ fontSize: '0.70rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Relationship Line Encodings
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {Object.entries(RELATION_CONFIG).map(([rel, cfg]) => (
                    <div key={rel} style={{
                      padding: '6px 10px', background: 'var(--ink-2)', borderRadius: '6px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          width: '24px', height: '2px', background: cfg.color, display: 'inline-block',
                          borderTop: cfg.style === 'dashed' ? `2px dashed ${cfg.color}` : 'none'
                        }} />
                        <span style={{ fontSize: '0.74rem', color: '#fff' }}>{cfg.label}</span>
                      </div>
                      <span style={{ fontSize: '0.64rem', color: 'var(--t-dim)', fontFamily: 'var(--f-mono)' }}>
                        {cfg.style}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── EVIDENCE DETAIL MODAL BRIDGE ─────────────────────────────────── */}
      {inspectingEvidence && (
        <EvidenceDetailModal
          evidence={inspectingEvidence}
          onClose={() => setInspectingEvidence(null)}
        />
      )}
    </div>
  );
}
