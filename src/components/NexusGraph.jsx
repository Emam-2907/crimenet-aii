import React, { useEffect, useRef, useState } from 'react';
import { NEXUS_GRAPH_DATA } from '../data/mockData.js';
import { soundFx } from '../utils/audio.js';

export default function NexusGraph() {
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(NEXUS_GRAPH_DATA.nodes[0]);
  const [hoveredNode, setHoveredNode] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const width = (canvas.width = canvas.parentElement.offsetWidth || 800);
    const height = (canvas.height = 480);

    // Node positioning with radial layout
    const nodes = NEXUS_GRAPH_DATA.nodes.map((node, i) => {
      const angle = (i / NEXUS_GRAPH_DATA.nodes.length) * Math.PI * 2;
      const dist = i === 0 ? 0 : 160 + (i % 2) * 50;
      return {
        ...node,
        x: width / 2 + Math.cos(angle) * dist,
        y: height / 2 + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        baseDist: dist,
        baseAngle: angle
      };
    });

    let isDragging = false;
    let draggedNode = null;
    let mouseX = 0;
    let mouseY = 0;

    const getMousePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseDown = (e) => {
      const pos = getMousePos(e);
      const clicked = nodes.find(n => Math.hypot(n.x - pos.x, n.y - pos.y) <= n.radius + 4);
      if (clicked) {
        isDragging = true;
        draggedNode = clicked;
        setSelectedNode(clicked);
        soundFx.playScanSweep();
      }
    };

    const handleMouseMove = (e) => {
      const pos = getMousePos(e);
      mouseX = pos.x;
      mouseY = pos.y;

      if (isDragging && draggedNode) {
        draggedNode.x = pos.x;
        draggedNode.y = pos.y;
      } else {
        const hover = nodes.find(n => Math.hypot(n.x - pos.x, n.y - pos.y) <= n.radius + 4);
        setHoveredNode(hover || null);
        canvas.style.cursor = hover ? 'pointer' : 'default';
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
      draggedNode = null;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Draw graph grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Links
      NEXUS_GRAPH_DATA.links.forEach(link => {
        const src = nodes.find(n => n.id === link.source);
        const tgt = nodes.find(n => n.id === link.target);
        if (!src || !tgt) return;

        const isRelated = selectedNode && (selectedNode.id === src.id || selectedNode.id === tgt.id);

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);

        if (isRelated) {
          ctx.strokeStyle = '#3B82F6';
          ctx.lineWidth = 2.5;
          ctx.shadowBlur = 6;
          ctx.shadowColor = 'rgba(59, 130, 246, 0.4)';
        } else {
          ctx.strokeStyle = 'rgba(100, 116, 139, 0.35)';
          ctx.lineWidth = 1.2;
          ctx.shadowBlur = 0;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;

        // Subtle indicator along link for active node
        if (isRelated) {
          const t = (Math.sin(time * 3) + 1) / 2;
          const px = src.x + (tgt.x - src.x) * t;
          const py = src.y + (tgt.y - src.y) * t;
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#60A5FA';
          ctx.fill();
        }
      });

      // Draw Nodes
      nodes.forEach(node => {
        // Floating motion if not dragged
        if (node !== draggedNode) {
          node.x += Math.sin(time + node.radius) * 0.25;
          node.y += Math.cos(time + node.radius) * 0.25;
        }

        const isSelected = selectedNode && selectedNode.id === node.id;
        const isHovered = hoveredNode && hoveredNode.id === node.id;

        // Outer selection circle
        if (isSelected || isHovered) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 8, 0, Math.PI * 2);
          ctx.fillStyle = `${node.color}22`;
          ctx.fill();
          ctx.strokeStyle = node.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Inner Core Node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowBlur = isSelected ? 12 : 4;
        ctx.shadowColor = node.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Border ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#252D38';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillStyle = isSelected ? '#60A5FA' : '#94A3B8';
        ctx.textAlign = 'center';
        ctx.fillText(node.label.split(' ')[0], node.x, node.y + node.radius + 16);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selectedNode]);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 340px',
      gap: '20px',
      alignItems: 'stretch'
    }}>
      {/* Interactive Network Graph */}
      <div className="panel-card" style={{
        position: 'relative',
        minHeight: '480px',
        padding: '20px',
        background: 'var(--bg-surface)',
        overflow: 'hidden'
      }}>
        {/* Graph Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          zIndex: 2,
          pointerEvents: 'none'
        }}>
          <div>
            <span className="badge badge-info" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
              RELATIONAL TOPOLOGY
            </span>
            <h4 style={{ margin: '6px 0 0 0', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>
              Syndicate Nexus & Relationship Map
            </h4>
          </div>
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '0.70rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)'
          }}>
            CLICK & DRAG NODES TO INSPECT
          </div>
        </div>

        <canvas ref={canvasRef} style={{ width: '100%', height: '480px' }} />
      </div>

      {/* Node Inspector Dossier */}
      <div className="panel-card" style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'var(--bg-surface)',
        borderTop: `3px solid ${selectedNode ? selectedNode.color : 'var(--accent)'}`
      }}>
        <div>
          <div style={{ marginBottom: '16px' }}>
            <span className="badge" style={{
              background: `${selectedNode.color}18`,
              color: selectedNode.color,
              border: `1px solid ${selectedNode.color}40`,
              marginBottom: '8px'
            }}>
              {selectedNode.tier} • {selectedNode.type.toUpperCase()}
            </span>
            <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--text-primary)', fontWeight: 600 }}>
              {selectedNode.label}
            </h3>
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              NODE ID: {selectedNode.id}
            </span>
          </div>

          <div style={{
            background: 'var(--bg-elevated)',
            padding: '14px',
            borderRadius: '6px',
            border: '1px solid var(--border-default)',
            marginBottom: '18px'
          }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginBottom: '6px', fontWeight: 600 }}>
              INTELLIGENCE DOSSIER BRIEF
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              {selectedNode.details}
            </p>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
              CORRELATED ADJACENCIES
            </div>

            {NEXUS_GRAPH_DATA.links
              .filter(l => l.source === selectedNode.id || l.target === selectedNode.id)
              .map((link, idx) => {
                const otherId = link.source === selectedNode.id ? link.target : link.source;
                const otherNode = NEXUS_GRAPH_DATA.nodes.find(n => n.id === otherId);

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (otherNode) {
                        soundFx.playTacticalClick();
                        setSelectedNode(otherNode);
                      }
                    }}
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: '5px',
                      padding: '8px 12px',
                      marginBottom: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.76rem',
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{link.relation} &rarr; </span>
                      <strong style={{ color: 'var(--text-primary)' }}>{otherNode ? otherNode.label.split(' ')[0] : otherId}</strong>
                    </div>
                    <span style={{ color: 'var(--accent-hover)', fontFamily: 'var(--font-mono)', fontSize: '0.70rem' }}>
                      {Math.round(link.strength * 100)}% Match
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        <button
          onClick={() => soundFx.playSuccessChime()}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.80rem', padding: '9px 16px' }}
        >
          Export Node Dossier (PDF/JSON)
        </button>
      </div>
    </div>
  );
}
