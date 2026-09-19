import React, { useEffect, useRef } from 'react';
import { soundFx } from '../utils/audio.js';

export default function Hero({ onExploreDashboard, onExploreForensics }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes
    const particleCount = 45;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.85 ? '#ff2a5f' : '#00f0ff'
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle tactical grid
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update & draw particles
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw connections
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const alpha = (1 - dist / 110) * 0.18;
            ctx.strokeStyle = p.color === '#ff2a5f' || p2.color === '#ff2a5f' 
              ? `rgba(255, 42, 95, ${alpha * 1.5})` 
              : `rgba(0, 240, 255, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section style={{
      position: 'relative',
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      padding: '70px 0 40px 0'
    }}>
      {/* Background Canvas */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        {/* Top Tag */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <div className="badge badge-critical" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
            <span className="pulse-dot pulse-dot-crimson"></span>
            <span>NEXT-GEN COGNITIVE THREAT INTERCEPTION</span>
          </div>
          <div className="badge badge-cyan" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
            <span>CJIS & FEDRAMP READY</span>
          </div>
        </div>

        {/* Main Headline */}
        <h1 style={{
          fontSize: 'clamp(2.4rem, 5.5vw, 4.5rem)',
          lineHeight: 1.12,
          fontWeight: 900,
          maxWidth: '1000px',
          margin: '0 auto 24px auto',
          letterSpacing: '-0.03em'
        }}>
          Autonomous AI Crime Detection & <br />
          <span style={{
            background: 'linear-gradient(135deg, #00f0ff 20%, #ff2a5f 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 40px rgba(0, 240, 255, 0.3)'
          }}>
            Real-Time Threat Matrix
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: 'var(--text-secondary)',
          maxWidth: '780px',
          margin: '0 auto 36px auto',
          lineHeight: 1.6
        }}>
          Harness graph neural networks, multi-spectral computer vision, and predictive spatio-temporal modeling to detect illicit activities, neutralize cyber intrusions, and dispatch rapid tactical response before crimes escalate.
        </p>

        {/* CTA Button Group */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '18px',
          flexWrap: 'wrap',
          marginBottom: '56px'
        }}>
          <button
            onClick={() => {
              soundFx.playThreatAlert();
              if (onExploreDashboard) onExploreDashboard();
              const el = document.getElementById('dashboard');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-primary"
            style={{ fontSize: '1rem', padding: '14px 32px' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>Launch Live Intelligence Console</span>
          </button>

          <button
            onClick={() => {
              soundFx.playScanSweep();
              if (onExploreForensics) onExploreForensics();
              const el = document.getElementById('forensic-lab');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-secondary"
            style={{ fontSize: '1rem', padding: '14px 28px' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Run Forensic Biometric Demo</span>
          </button>
        </div>

        {/* Live Ticker Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          maxWidth: '1100px',
          margin: '0 auto'
        }}>
          {[
            {
              label: 'INCIDENTS INTERCEPTED',
              val: '142,890',
              change: '+314 today',
              color: 'var(--cyan-primary)',
              border: 'rgba(0, 240, 255, 0.25)'
            },
            {
              label: 'AI PREDICTION ACCURACY',
              val: '99.4%',
              change: 'Sub-pixel vector match',
              color: 'var(--emerald-safe)',
              border: 'rgba(0, 255, 157, 0.25)'
            },
            {
              label: 'TELEMETRY DISPATCH TIME',
              val: '1.18s',
              change: 'Automated CAD routing',
              color: 'var(--amber-warning)',
              border: 'rgba(245, 158, 11, 0.25)'
            },
            {
              label: 'CONNECTED AGENCIES',
              val: '850+',
              change: 'Federal & Municipal grids',
              color: 'var(--purple-intel)',
              border: 'rgba(168, 85, 247, 0.25)'
            }
          ].map((stat, i) => (
            <div
              key={i}
              className="glass-card corner-brackets"
              style={{
                padding: '20px 24px',
                textAlign: 'left',
                borderColor: stat.border
              }}
            >
              <div style={{
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                marginBottom: '6px'
              }}>
                {stat.label}
              </div>
              <div style={{
                fontSize: '1.9rem',
                fontWeight: 800,
                color: stat.color,
                fontFamily: 'var(--font-heading)',
                lineHeight: 1.1,
                marginBottom: '4px'
              }}>
                {stat.val}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)'
              }}>
                {stat.change}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
