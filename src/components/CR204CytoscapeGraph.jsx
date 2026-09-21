import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { useInvestigation } from '../context/InvestigationContext.jsx';
import {
  ZoomIn, ZoomOut, Maximize2, RefreshCw, Layers, Shield,
  MapPin, Eye, User, Car, AlertTriangle, UserCheck, ExternalLink,
  GitFork, CheckCircle, Clock
} from 'lucide-react';

try {
  cytoscape.use(coseBilkent);
} catch (e) {
  // Already registered
}

export default function CR204CytoscapeGraph({ onFocusMap, height = '360px' }) {
  const {
    investigationData,
    selectedEntityId,
    selectedEntityType,
    selectEntity,
    setMapFlyToTarget
  } = useInvestigation();

  const containerRef = useRef(null);
  const cyRef = useRef(null);

  const [activeLayout, setActiveLayout] = useState('cose-bilkent'); // 'cose-bilkent' | 'concentric' | 'breadthfirst'
  const [selectedNodeData, setSelectedNodeData] = useState(null);

  // Convert investigationData entities & relations to Cytoscape elements
  const elements = useMemo(() => {
    const nodes = [];
    const edges = [];

    // Entity visual configuration
    const entityVisuals = {
      case: { shape: 'diamond', bg: '#1E3A5F', border: '#38BDF8', size: 54, label: 'CASE' },
      person: { shape: 'ellipse', bg: '#5C1D24', border: '#F87171', size: 50, label: 'PERSON' },
      face_match: { shape: 'diamond', bg: '#4D3800', border: '#FBBF24', size: 44, label: 'BIOMETRIC' },
      camera: { shape: 'round-rectangle', bg: '#132B20', border: '#34D399', size: 42, label: 'CCTV' },
      location: { shape: 'ellipse', bg: '#2A333D', border: '#94A3B8', size: 44, label: 'LOC' },
      vehicle: { shape: 'round-rectangle', bg: '#422006', border: '#FB923C', size: 46, label: 'VEHICLE' },
      incident: { shape: 'octagon', bg: '#4C0519', border: '#F43F5E', size: 50, label: 'INCIDENT' },
      financial: { shape: 'hexagon', bg: '#064E3B', border: '#34D399', size: 44, label: 'FINANCIAL' },
      evidence: { shape: 'tag', bg: '#0F172A', border: '#38BDF8', size: 44, label: 'EVIDENCE' },
      telemetry: { shape: 'round-rectangle', bg: '#1E1B4B', border: '#818CF8', size: 44, label: 'TELEMETRY' },
      organization: { shape: 'rectangle', bg: '#4A044E', border: '#F472B6', size: 50, label: 'ORGANIZATION' }
    };

    // Render all canonical investigation entities
    Object.values(investigationData.entities || {}).forEach(e => {
      const vis = entityVisuals[e.type] || { shape: 'round-rectangle', bg: '#171D24', border: '#2A333D', size: 40, label: 'ENT' };
      const isSelected = selectedEntityId === e.id;

      nodes.push({
        data: {
          id: e.id,
          label: e.name || e.id,
          sublabel: e.id,
          type: e.type,
          shape: vis.shape,
          bg: isSelected ? '#5B7C99' : vis.bg,
          border: isSelected ? '#E6E9ED' : vis.border,
          borderWidth: isSelected ? 3 : 1.5,
          size: isSelected ? vis.size + 8 : vis.size,
          color: '#E6E9ED',
          entity: e
        }
      });
    });

    // Build edges from relations
    const nodeIds = new Set(nodes.map(n => n.data.id));

    (investigationData.relations || []).forEach(rel => {
      if (nodeIds.has(rel.source) && nodeIds.has(rel.target)) {
        edges.push({
          data: {
            id: rel.id,
            source: rel.source,
            target: rel.target,
            label: rel.label || rel.type,
            type: rel.type
          }
        });
      }
    });

    return { nodes, edges };
  }, [investigationData, selectedEntityId]);

  // Layout runner
  const runLayout = useCallback((cy, name = activeLayout) => {
    if (!cy) return;

    let layoutOpts;
    if (name === 'concentric') {
      layoutOpts = {
        name: 'concentric',
        concentric: (node) => {
          const type = node.data('type');
          if (type === 'case') return 100;
          if (type === 'person' || type === 'organization' || type === 'incident') return 80;
          if (type === 'camera' || type === 'vehicle' || type === 'financial' || type === 'face_match') return 60;
          return 40;
        },
        levelWidth: () => 20,
        padding: 40,
        animate: true,
        animationDuration: 500
      };
    } else if (name === 'breadthfirst') {
      layoutOpts = {
        name: 'breadthfirst',
        directed: true,
        roots: ['CR-204'],
        padding: 40,
        spacingFactor: 1.2,
        animate: true,
        animationDuration: 500
      };
    } else {
      layoutOpts = {
        name: 'cose-bilkent',
        animate: true,
        animationDuration: 500,
        nodeRepulsion: 180000,
        idealEdgeLength: 120,
        gravity: 0.25,
        padding: 40
      };
    }

    cy.layout(layoutOpts).run();
  }, [activeLayout]);

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements: [...elements.nodes, ...elements.edges],
      style: [
        {
          selector: 'node',
          style: {
            'shape': 'data(shape)',
            'width': 'data(size)',
            'height': 'data(size)',
            'background-color': 'data(bg)',
            'border-width': 'data(borderWidth)',
            'border-color': 'data(border)',
            'label': 'data(sublabel)',
            'color': '#E6E9ED',
            'font-family': 'monospace',
            'font-size': '10px',
            'font-weight': 700,
            'text-valign': 'center',
            'text-halign': 'center',
            'text-outline-width': 2,
            'text-outline-color': '#080A0D',
            'transition-property': 'background-color, border-color, width, height',
            'transition-duration': '0.2s'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#3F5F78',
            'target-arrow-color': '#5B7C99',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '8px',
            'font-family': 'monospace',
            'color': '#8D98A5',
            'text-rotation': 'autorotate',
            'text-background-opacity': 0.8,
            'text-background-color': '#101419',
            'text-background-padding': '2px',
            'text-background-shape': 'roundrectangle',
            'opacity': 0.85
          }
        },
        {
          selector: ':selected',
          style: {
            'border-color': '#E6E9ED',
            'border-width': 3,
            'shadow-blur': 12,
            'shadow-color': '#5B7C99',
            'shadow-opacity': 0.6
          }
        }
      ],
      wheelSensitivity: 0.25,
      minZoom: 0.4,
      maxZoom: 3
    });

    // Node Tap Handler
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const d = node.data();
      setSelectedNodeData(d.entity || { id: d.id, name: d.label, type: d.type });
      selectEntity(d.id, d.type);
    });

    // Background Tap Handler
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNodeData(null);
      }
    });

    cyRef.current = cy;
    runLayout(cy, activeLayout);

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [elements, activeLayout, selectEntity, runLayout]);

  // Synchronize selection from outside
  useEffect(() => {
    if (!cyRef.current || !selectedEntityId) return;
    const cy = cyRef.current;
    const targetNode = cy.getElementById(selectedEntityId);
    if (targetNode.length > 0) {
      cy.nodes().unselect();
      targetNode.select();
      setSelectedNodeData(targetNode.data('entity') || { id: selectedEntityId, type: selectedEntityType });
    }
  }, [selectedEntityId, selectedEntityType]);

  // Handle Fly to Map
  const handleFlyToMap = (entity) => {
    if (!entity) return;
    const lat = entity.lat || entity.latitude;
    const lng = entity.lng || entity.longitude;

    if (lat !== undefined && lng !== undefined) {
      setMapFlyToTarget({ lat, lng, zoom: 16.5, entityId: entity.id });
      if (onFocusMap) onFocusMap(entity);
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height,
      backgroundColor: '#080A0D',
      border: '1px solid #2A333D',
      borderRadius: '8px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Controls Toolbar */}
      <div style={{
        padding: '8px 12px',
        backgroundColor: '#101419',
        borderBottom: '1px solid #2A333D',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        zIndex: 5
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '0.70rem',
            fontWeight: 700,
            color: '#5B7C99',
            fontFamily: 'var(--font-mono, monospace)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <GitFork size={13} />
            <span>CR-204 RELATIONAL GRAPH ANALYSIS</span>
          </span>
          <span style={{
            fontSize: '0.62rem',
            padding: '1px 6px',
            borderRadius: '3px',
            backgroundColor: '#171D24',
            border: '1px solid #2A333D',
            color: '#8D98A5',
            fontFamily: 'var(--font-mono, monospace)'
          }}>
            {elements.nodes.length} NODES · {elements.edges.length} EDGES
          </span>
        </div>

        {/* Layout Selectors & Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select
            value={activeLayout}
            onChange={(e) => {
              setActiveLayout(e.target.value);
              runLayout(cyRef.current, e.target.value);
            }}
            style={{
              backgroundColor: '#171D24',
              border: '1px solid #2A333D',
              borderRadius: '4px',
              color: '#E6E9ED',
              fontSize: '0.68rem',
              fontFamily: 'var(--font-mono, monospace)',
              padding: '3px 8px',
              cursor: 'pointer'
            }}
          >
            <option value="cose-bilkent">Layout: CoSE-Bilkent (Force)</option>
            <option value="concentric">Layout: Concentric Radial</option>
            <option value="breadthfirst">Layout: Breadthfirst Tree</option>
          </select>

          <button
            onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.2)}
            title="Zoom In"
            style={{ background: '#171D24', border: '1px solid #2A333D', borderRadius: '4px', color: '#8D98A5', padding: '4px', cursor: 'pointer' }}
          >
            <ZoomIn size={13} />
          </button>
          <button
            onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 0.8)}
            title="Zoom Out"
            style={{ background: '#171D24', border: '1px solid #2A333D', borderRadius: '4px', color: '#8D98A5', padding: '4px', cursor: 'pointer' }}
          >
            <ZoomOut size={13} />
          </button>
          <button
            onClick={() => cyRef.current?.fit(null, 30)}
            title="Fit Graph to Bounds"
            style={{ background: '#171D24', border: '1px solid #2A333D', borderRadius: '4px', color: '#8D98A5', padding: '4px', cursor: 'pointer' }}
          >
            <Maximize2 size={13} />
          </button>
          <button
            onClick={() => runLayout(cyRef.current, activeLayout)}
            title="Relayout Graph"
            style={{ background: '#171D24', border: '1px solid #2A333D', borderRadius: '4px', color: '#8D98A5', padding: '4px', cursor: 'pointer' }}
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Cytoscape Canvas Container */}
      <div ref={containerRef} style={{ width: '100%', flex: 1, minHeight: '260px', backgroundColor: '#080A0D' }} />

      {/* Bottom Floating Telemetry & Map Bridge Panel */}
      {selectedNodeData && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          right: '12px',
          backgroundColor: '#101419',
          border: '1px solid #2A333D',
          borderRadius: '6px',
          padding: '10px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              backgroundColor: '#171D24',
              border: '1px solid #3F5F78',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#5B7C99'
            }}>
              {selectedNodeData.type === 'camera' && <Eye size={15} />}
              {selectedNodeData.type === 'person' && <User size={15} />}
              {selectedNodeData.type === 'face_match' && <UserCheck size={15} />}
              {selectedNodeData.type === 'vehicle' && <Car size={15} />}
              {selectedNodeData.type === 'incident' && <AlertTriangle size={15} />}
              {selectedNodeData.type === 'location' && <MapPin size={15} />}
              {selectedNodeData.type === 'case' && <Shield size={15} />}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '0.80rem', color: '#E6E9ED', fontFamily: 'var(--font-mono, monospace)' }}>
                  {selectedNodeData.id}
                </strong>
                <span style={{ fontSize: '0.72rem', color: '#8D98A5' }}>
                  {selectedNodeData.name || selectedNodeData.title}
                </span>
              </div>
              <div style={{ fontSize: '0.66rem', color: '#8D98A5', fontFamily: 'var(--font-mono, monospace)' }}>
                Type: {selectedNodeData.type?.toUpperCase()} {selectedNodeData?.lat != null && selectedNodeData?.lng != null ? `· Coordinates: ${Number(selectedNodeData.lat).toFixed(4)}, ${Number(selectedNodeData.lng).toFixed(4)}` : ''}
              </div>
            </div>
          </div>

          {/* Quick Bridge Action to Real Map */}
          {(selectedNodeData.lat !== undefined || selectedNodeData.type === 'camera' || selectedNodeData.type === 'location' || selectedNodeData.type === 'vehicle' || selectedNodeData.type === 'incident') && (
            <button
              onClick={() => handleFlyToMap(selectedNodeData)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: '#3F5F78',
                border: '1px solid #5B7C99',
                borderRadius: '4px',
                color: '#E6E9ED',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <MapPin size={13} />
              <span>Fly to Location on Tactical Map</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
