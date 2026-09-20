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

    // Entity configuration
    const entityVisuals = {
      case: { shape: 'diamond', bg: '#3F5F78', border: '#5B7C99', size: 54, label: 'CASE' },
      person: { shape: 'ellipse', bg: '#9B3D45', border: '#C04A52', size: 50, label: 'PERSON' },
      face_match: { shape: 'diamond', bg: '#B58A45', border: '#D1A256', size: 44, label: 'BIOMETRIC' },
      camera: { shape: 'round-rectangle', bg: '#171D24', border: '#5B7C99', size: 42, label: 'CCTV' },
      location: { shape: 'ellipse', bg: '#2A333D', border: '#5B7C99', size: 44, label: 'LOC' },
      vehicle: { shape: 'round-rectangle', bg: '#B58A45', border: '#D1A256', size: 46, label: 'VEHICLE' },
      incident: { shape: 'octagon', bg: '#C04A52', border: '#E6E9ED', size: 50, label: 'INCIDENT' }
    };

    // Filter to primary investigation entities to maintain high signal
    const relevantEntityIds = new Set([
      'CR-204', 'P-017', 'FM-042', 'CCTV-04', 'CCTV-07', 'CCTV-11',
      'L-08', 'L-10', 'L-12', 'V-102', 'INC-204', 'PERSON-001',
      'CCTV-PVT-01', 'FM-045'
    ]);

    // Also include any active selected entity if not present
    if (selectedEntityId) relevantEntityIds.add(selectedEntityId);

    // Build nodes
    Object.values(investigationData.entities).forEach(e => {
      if (!relevantEntityIds.has(e.id) && e.type === 'camera' && !['CCTV-01', 'CCTV-02', 'CCTV-04', 'CCTV-07', 'CCTV-11', 'CCTV-PVT-01'].includes(e.id)) {
        return; // Keep graph clean and focused on crime corridor
      }

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

    // Connect CCTV-PVT-01 if injected
    if (nodeIds.has('CCTV-PVT-01')) {
      if (nodeIds.has('FM-045')) {
        edges.push({ data: { id: 'REL-PVT-FM45', source: 'CCTV-PVT-01', target: 'FM-045', label: 'Captured Frame 14:12' } });
      }
      if (nodeIds.has('PERSON-001') && nodeIds.has('FM-045')) {
        edges.push({ data: { id: 'REL-FM45-P001', source: 'FM-045', target: 'PERSON-001', label: 'Biometric 96.4% Match' } });
      }
      if (nodeIds.has('V-102')) {
        edges.push({ data: { id: 'REL-PVT-V102', source: 'CCTV-PVT-01', target: 'V-102', label: 'Escort Sighting 14:12' } });
      }
    }

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
          if (type === 'person' || type === 'incident') return 80;
          if (type === 'camera' || type === 'vehicle') return 60;
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
                Type: {selectedNodeData.type?.toUpperCase()} {selectedNodeData.lat ? `· Coordinates: ${selectedNodeData.lat.toFixed(4)}, ${selectedNodeData.lng.toFixed(4)}` : ''}
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
