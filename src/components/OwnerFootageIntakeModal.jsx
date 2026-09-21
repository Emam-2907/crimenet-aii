import React, { useState, useEffect, useRef } from 'react';
import {
  Camera, Shield, User, CheckCircle, AlertTriangle, Play,
  Pause, RefreshCw, Send, Check, X, Eye, FileText, ArrowRight,
  Cpu, Lock, Download, Sparkles, MapPin, GitFork
} from 'lucide-react';

export default function OwnerFootageIntakeModal({ isOpen, onClose, onInjectIntoCase, defaultTarget = 'Viktor Voronin' }) {
  if (!isOpen) return null;

  // Step 1: 'DISPATCH_REQUEST' | Step 2: 'RECEIVING_FEED' | Step 3: 'BIOMETRIC_SCAN' | Step 4: 'VERIFIED_RESULT'
  const [currentStep, setCurrentStep] = useState('DISPATCH_REQUEST');
  const [dispatchStatus, setDispatchStatus] = useState('IDLE'); // 'IDLE' | 'TRANSMITTING' | 'ACCEPTED'
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [landmarksVisible, setLandmarksVisible] = useState(true);
  const [injected, setInjected] = useState(false);

  // Default Footage Preset (Private Warehouse exterior camera closing the 3-minute gap)
  const footageData = {
    cameraName: 'CCTV-PVT-01: South Arterial Logistics Pier 4 Gantry',
    cameraId: 'CCTV-PVT-01',
    owner: 'Mikhail Petrov (Apex Logistics & Cold Storage Facility)',
    location: '40.7138° N, -74.0048° W · South Arterial Corridor',
    lat: 40.7138,
    lng: -74.0048,
    timestamp: '2026-09-18 14:12:44 UTC',
    fileLabel: 'CAM-PVT-0412_1412UTC_SURVEILLANCE.mp4',
    frameImage: '/cctv/cam07_corridor.jpg',
    suspectMatch: {
      name: 'Viktor Voronin',
      alias: 'The Architect / Cypher-9',
      syndicate: 'Apex Cyber Syndicate',
      threat: 'CRITICAL',
      similarity: 96.4,
      model: 'ArcFace-ResNet50 v2.4 (512-D Cosine Metric)',
      landmarksConfidence: '0.984',
      yawAngle: '-4.2°',
      pitchAngle: '+2.1°',
      biometricHash: 'sha256:7f9a2b881c3e4492a838df2',
      box: { top: 22, left: 36, width: 28, height: 42 }
    }
  };

  // Simulate Request Dispatch to Owner
  const handleDispatchRequest = () => {
    setDispatchStatus('TRANSMITTING');
    setTimeout(() => {
      setDispatchStatus('ACCEPTED');
      setTimeout(() => {
        setCurrentStep('RECEIVING_FEED');
      }, 1000);
    }, 1400);
  };

  // Run Biometric Recognition Scan
  const handleStartBiometricScan = () => {
    setCurrentStep('BIOMETRIC_SCAN');
    setIsScanning(true);
    setScanProgress(10);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setCurrentStep('VERIFIED_RESULT');
          return 100;
        }
        return prev + 18;
      });
    }, 280);
  };

  // One-click Inject into Tactical Map and Relational Graph
  const handleInjectToCase = () => {
    setInjected(true);
    if (onInjectIntoCase) {
      onInjectIntoCase({
        camera: {
          id: footageData.cameraId,
          cameraId: footageData.cameraId,
          type: 'camera',
          name: footageData.cameraName,
          lat: footageData.lat,
          lng: footageData.lng,
          latitude: footageData.lat,
          longitude: footageData.lng,
          status: 'ONLINE',
          locationId: 'L-09',
          location_name: 'Location L-09: South Arterial Way',
          coverageRadius: 80,
          resolution: '4K H.265 Secured Stream',
          feed_label: 'SUBPOENA INTAKE FEED',
          frame_image: footageData.frameImage,
          events: [
            { time: '14:12', title: 'Suspect Viktor Voronin (96.4% biometric match) observed in convoy escort', type: 'FACE_MATCH' }
          ],
          relatedPersons: ['PERSON-001'],
          relatedVehicles: ['V-102'],
          relatedFaceMatches: ['FM-045'],
          caseIds: ['CR-204']
        },
        faceMatch: {
          id: 'FM-045',
          type: 'face_match',
          name: 'Biometric Candidate Match FM-045 (Viktor Voronin)',
          model_name: footageData.suspectMatch.model,
          similarity_score: 0.964,
          similarity_percentage: '96.4%',
          candidate_id: 'PERSON-001',
          candidate_name: 'Viktor Voronin',
          source_camera: footageData.cameraId,
          time: '14:12 UTC',
          status: 'VERIFIED_TACTICAL_MATCH'
        },
        timelineEvent: {
          id: 'EVT-1412-PVT',
          time: '14:12',
          title: 'Private Warehouse Exterior CCTV: Voronin Sighted in Transit',
          claim_type: 'BIOMETRIC_CORROBORATION',
          summary: 'Owner-provided CCTV-PVT-01 footage confirms Viktor Voronin at South Arterial Way, definitively closing the 3-minute blindspot between Gate 4 and Corridor East.',
          entity_ids: [footageData.cameraId, 'PERSON-001', 'V-102', 'FM-045']
        }
      });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="CIRA Secure Evidence Intake & Owner Transmission Terminal"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(8, 10, 13, 0.88)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: '920px',
        backgroundColor: '#101419',
        border: '1px solid #2A333D',
        borderRadius: '10px',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.85)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        maxHeight: '92vh'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '14px 20px',
          backgroundColor: '#171D24',
          borderBottom: '1px solid #2A333D',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: 'rgba(63, 95, 120, 0.25)',
              border: '1px solid #3F5F78',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#5B7C99'
            }}>
              <Camera size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#E6E9ED', fontFamily: 'var(--font-display, sans-serif)' }}>
                  CIRA SECURE EVIDENCE INTAKE · OWNER FOOTAGE PORTAL
                </span>
                <span style={{
                  fontSize: '0.62rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  backgroundColor: 'rgba(79, 122, 103, 0.2)',
                  color: '#4F7A67',
                  border: '1px solid rgba(79, 122, 103, 0.4)'
                }}>
                  CR-204 DOCKET
                </span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#8D98A5', fontFamily: 'var(--font-mono, monospace)' }}>
                Target Establishment: {footageData.owner}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#8D98A5',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#E6E9ED'}
            onMouseLeave={e => e.currentTarget.style.color = '#8D98A5'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Workflow Progression Stepper */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          borderBottom: '1px solid #2A333D',
          backgroundColor: '#080A0D'
        }}>
          {[
            { id: 'DISPATCH_REQUEST', label: '1. Dispatched Subpoena', icon: Send },
            { id: 'RECEIVING_FEED', label: '2. Ingest Stream', icon: Lock },
            { id: 'BIOMETRIC_SCAN', label: '3. ArcFace Scan', icon: Cpu },
            { id: 'VERIFIED_RESULT', label: '4. Case Integration', icon: CheckCircle }
          ].map((step, idx) => {
            const isCurrent = currentStep === step.id;
            const isCompleted =
              (currentStep === 'RECEIVING_FEED' && idx === 0) ||
              (currentStep === 'BIOMETRIC_SCAN' && idx <= 1) ||
              (currentStep === 'VERIFIED_RESULT' && idx <= 2);

            return (
              <div
                key={step.id}
                style={{
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRight: idx < 3 ? '1px solid #2A333D' : 'none',
                  backgroundColor: isCurrent ? 'rgba(63, 95, 120, 0.15)' : 'transparent',
                  borderBottom: isCurrent ? '2px solid #5B7C99' : '2px solid transparent'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  backgroundColor: isCompleted ? '#4F7A67' : isCurrent ? '#3F5F78' : '#171D24',
                  color: '#E6E9ED'
                }}>
                  {isCompleted ? <Check size={12} /> : idx + 1}
                </div>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? '#E6E9ED' : '#8D98A5',
                  fontFamily: 'var(--font-mono, monospace)'
                }}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Modal Main Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* ── STEP 1: DISPATCH REQUEST TO PROPERTY OWNER ──────────────── */}
          {currentStep === 'DISPATCH_REQUEST' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                backgroundColor: '#171D24',
                border: '1px solid #2A333D',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#5B7C99', fontFamily: 'var(--font-mono, monospace)' }}>
                    AUTOMATED CIRA SUBPOENA DISPATCH · 18 U.S.C. § 2703 (EXPEDITED PRESERVATION)
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#B58A45', fontFamily: 'var(--font-mono, monospace)' }}>
                    BLINDSPOT: 14:11 - 14:15 UTC (SOUTH ARTERIAL)
                  </span>
                </div>

                <div style={{
                  backgroundColor: '#101419',
                  border: '1px solid #2A333D',
                  borderRadius: '6px',
                  padding: '12px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.74rem',
                  lineHeight: '1.5',
                  color: '#E6E9ED'
                }}>
                  <div style={{ color: '#8D98A5', marginBottom: '6px' }}>
                    TO: <strong style={{ color: '#E6E9ED' }}>{footageData.owner}</strong><br/>
                    FACILITY: <strong style={{ color: '#E6E9ED' }}>South Arterial Logistics Facility Gate 2</strong><br/>
                    COORDINATES: <span style={{ color: '#5B7C99' }}>{footageData.location}</span><br/>
                    AUTHORIZATION HASH: <span style={{ color: '#4F7A67' }}>TOKEN-SEC4-REQ-88219-SHA256</span>
                  </div>
                  <p style={{ margin: '8px 0 0', color: '#8D98A5', fontSize: '0.72rem' }}>
                    Under Case Docket CR-204, CIRA has identified an unmonitored transit corridor between CCTV-04 and CCTV-07. Pursuant to emergency evidentiary preservation, CrimeNet requests immediate transmission of exterior gantry optical footage recorded between 14:10 UTC and 14:16 UTC.
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: dispatchStatus === 'ACCEPTED' ? '#4F7A67' : dispatchStatus === 'TRANSMITTING' ? '#B58A45' : '#8D98A5'
                    }} />
                    <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono, monospace)', color: '#8D98A5' }}>
                      {dispatchStatus === 'IDLE' && 'Awaiting Dispatch Authorization'}
                      {dispatchStatus === 'TRANSMITTING' && 'Transmitting Cryptographic Request to Mikhail Petrov...'}
                      {dispatchStatus === 'ACCEPTED' && 'Owner Confirmed Handshake · Ingesting Stream'}
                    </span>
                  </div>

                  <button
                    onClick={handleDispatchRequest}
                    disabled={dispatchStatus !== 'IDLE'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      backgroundColor: '#3F5F78',
                      border: '1px solid #5B7C99',
                      borderRadius: '6px',
                      color: '#E6E9ED',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: dispatchStatus === 'IDLE' ? 'pointer' : 'default',
                      opacity: dispatchStatus === 'IDLE' ? 1 : 0.7
                    }}
                  >
                    {dispatchStatus === 'TRANSMITTING' ? (
                      <RefreshCw size={14} className="spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    <span>{dispatchStatus === 'ACCEPTED' ? 'Transmission Authorized' : 'Transmit Request to Owner'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2, 3 & 4: STREAM INGESTION, ARC-FACE SCAN & VERIFIED RESULT ── */}
          {(currentStep === 'RECEIVING_FEED' || currentStep === 'BIOMETRIC_SCAN' || currentStep === 'VERIFIED_RESULT') && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '16px' }}>

              {/* Left Column: Surveillance Frame & Face Reticle HUD */}
              <div style={{
                position: 'relative',
                backgroundColor: '#080A0D',
                borderRadius: '8px',
                border: '1px solid #2A333D',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Tactical Camera HUD Overlay Header */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  padding: '8px 12px',
                  backgroundColor: 'rgba(8, 10, 13, 0.75)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  zIndex: 2,
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.68rem',
                  borderBottom: '1px solid rgba(42, 51, 61, 0.5)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#C04A52', animation: 'pulse 1.5s infinite' }} />
                    <strong style={{ color: '#E6E9ED' }}>{footageData.cameraId} [INTAKE STREAM]</strong>
                  </div>
                  <span style={{ color: '#B58A45' }}>{footageData.timestamp}</span>
                </div>

                {/* Video / Frame Viewport */}
                <div style={{ position: 'relative', width: '100%', height: '320px', backgroundColor: '#000', overflow: 'hidden' }}>
                  <img
                    src={footageData.frameImage}
                    alt="Incoming CCTV Feed"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'contrast(1.1) brightness(0.92)'
                    }}
                  />

                  {/* Progressive Scanning Line Animation */}
                  {isScanning && (
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: `${scanProgress}%`,
                      height: '3px',
                      backgroundColor: '#5B7C99',
                      boxShadow: '0 0 12px #5B7C99',
                      zIndex: 3,
                      transition: 'top 0.25s linear'
                    }} />
                  )}

                  {/* Face Detection Bounding Box Overlay */}
                  {(currentStep === 'BIOMETRIC_SCAN' || currentStep === 'VERIFIED_RESULT') && (
                    <div style={{
                      position: 'absolute',
                      top: `${footageData.suspectMatch.box.top}%`,
                      left: `${footageData.suspectMatch.box.left}%`,
                      width: `${footageData.suspectMatch.box.width}%`,
                      height: `${footageData.suspectMatch.box.height}%`,
                      border: currentStep === 'VERIFIED_RESULT' ? '2px solid #C04A52' : '2px dashed #5B7C99',
                      boxShadow: currentStep === 'VERIFIED_RESULT' ? '0 0 16px rgba(192, 74, 82, 0.6)' : '0 0 8px rgba(91, 124, 153, 0.4)',
                      zIndex: 4,
                      transition: 'all 0.3s ease'
                    }}>
                      {/* Corner Tactical Brackets */}
                      <span style={{ position: 'absolute', top: '-2px', left: '-2px', width: '6px', height: '6px', borderTop: '2px solid #E6E9ED', borderLeft: '2px solid #E6E9ED' }} />
                      <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '6px', height: '6px', borderTop: '2px solid #E6E9ED', borderRight: '2px solid #E6E9ED' }} />
                      <span style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '6px', height: '6px', borderBottom: '2px solid #E6E9ED', borderLeft: '2px solid #E6E9ED' }} />
                      <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '6px', height: '6px', borderBottom: '2px solid #E6E9ED', borderRight: '2px solid #E6E9ED' }} />

                      {/* Tag Label */}
                      <div style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '0',
                        marginBottom: '4px',
                        backgroundColor: currentStep === 'VERIFIED_RESULT' ? '#9B3D45' : '#3F5F78',
                        color: '#E6E9ED',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '3px',
                        whiteSpace: 'nowrap'
                      }}>
                        {currentStep === 'VERIFIED_RESULT' ? 'VIKTOR VORONIN · 96.4%' : 'ANALYZING LANDMARKS...'}
                      </div>
                    </div>
                  )}

                  {/* Biometric Landmark Mesh Overlay */}
                  {landmarksVisible && (currentStep === 'BIOMETRIC_SCAN' || currentStep === 'VERIFIED_RESULT') && (
                    <div style={{
                      position: 'absolute',
                      top: `${footageData.suspectMatch.box.top + 8}%`,
                      left: `${footageData.suspectMatch.box.left + 6}%`,
                      width: `${footageData.suspectMatch.box.width - 12}%`,
                      height: `${footageData.suspectMatch.box.height - 16}%`,
                      pointerEvents: 'none',
                      zIndex: 4,
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-around',
                      alignItems: 'center'
                    }}>
                      {[...Array(16)].map((_, i) => (
                        <span key={i} style={{
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          backgroundColor: currentStep === 'VERIFIED_RESULT' ? '#4F7A67' : '#5B7C99',
                          boxShadow: '0 0 4px #5B7C99'
                        }} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Footage Controls Bar */}
                <div style={{
                  padding: '8px 12px',
                  backgroundColor: '#171D24',
                  borderTop: '1px solid #2A333D',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      style={{ background: 'none', border: 'none', color: '#E6E9ED', cursor: 'pointer', padding: '4px' }}
                    >
                      {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono, monospace)', color: '#8D98A5' }}>
                      {footageData.fileLabel}
                    </span>
                  </div>

                  <button
                    onClick={() => setLandmarksVisible(!landmarksVisible)}
                    style={{
                      background: 'none',
                      border: '1px solid #2A333D',
                      borderRadius: '4px',
                      color: landmarksVisible ? '#5B7C99' : '#8D98A5',
                      padding: '3px 8px',
                      fontSize: '0.64rem',
                      fontFamily: 'var(--font-mono, monospace)',
                      cursor: 'pointer'
                    }}
                  >
                    {landmarksVisible ? 'Landmarks [ON]' : 'Landmarks [OFF]'}
                  </button>
                </div>
              </div>

              {/* Right Column: Biometric Telemetry & Integration Drawer */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* Status Box */}
                <div style={{
                  backgroundColor: '#171D24',
                  border: '1px solid #2A333D',
                  borderRadius: '6px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#5B7C99', fontFamily: 'var(--font-mono, monospace)' }}>
                      ARCFACE NEURAL INFERENCE ENGINE
                    </span>
                    <span style={{
                      fontSize: '0.62rem',
                      fontFamily: 'var(--font-mono, monospace)',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      backgroundColor: currentStep === 'VERIFIED_RESULT' ? 'rgba(192, 74, 82, 0.2)' : 'rgba(91, 124, 153, 0.2)',
                      color: currentStep === 'VERIFIED_RESULT' ? '#C04A52' : '#5B7C99'
                    }}>
                      {currentStep === 'RECEIVING_FEED' && 'FOOTAGE INGESTED'}
                      {currentStep === 'BIOMETRIC_SCAN' && `SCANNING (${scanProgress}%)`}
                      {currentStep === 'VERIFIED_RESULT' && 'MATCH POSITIVE 96.4%'}
                    </span>
                  </div>

                  {currentStep === 'RECEIVING_FEED' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '6px 0' }}>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: '#8D98A5', lineHeight: 1.4 }}>
                        Owner footage successfully received via secure tunnel. Video stream verified at 1080p 60fps. Ready to execute automated facial recognition against gallery targets.
                      </p>
                      <button
                        onClick={handleStartBiometricScan}
                        style={{
                          marginTop: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '8px',
                          backgroundColor: '#3F5F78',
                          border: '1px solid #5B7C99',
                          borderRadius: '6px',
                          color: '#E6E9ED',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <Cpu size={14} />
                        <span>Run Biometric Recognition Scan</span>
                      </button>
                    </div>
                  )}

                  {(currentStep === 'BIOMETRIC_SCAN' || currentStep === 'VERIFIED_RESULT') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {/* Biometric Stats Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '6px',
                        backgroundColor: '#101419',
                        padding: '8px',
                        borderRadius: '4px',
                        fontSize: '0.66rem',
                        fontFamily: 'var(--font-mono, monospace)'
                      }}>
                        <div>
                          <span style={{ color: '#8D98A5' }}>Model: </span>
                          <span style={{ color: '#E6E9ED' }}>ArcFace-ResNet50</span>
                        </div>
                        <div>
                          <span style={{ color: '#8D98A5' }}>Confidence: </span>
                          <span style={{ color: '#4F7A67', fontWeight: 700 }}>96.4% Match</span>
                        </div>
                        <div>
                          <span style={{ color: '#8D98A5' }}>Yaw/Pitch: </span>
                          <span style={{ color: '#E6E9ED' }}>-4.2° / +2.1°</span>
                        </div>
                        <div>
                          <span style={{ color: '#8D98A5' }}>Hash: </span>
                          <span style={{ color: '#5B7C99' }}>7f9a2b...df2</span>
                        </div>
                      </div>

                      {/* Suspect Identification Card */}
                      <div style={{
                        display: 'flex',
                        gap: '10px',
                        padding: '8px',
                        backgroundColor: '#101419',
                        borderRadius: '4px',
                        border: '1px solid rgba(192, 74, 82, 0.4)'
                      }}>
                        <img
                          src="/cctv/voronin_mugshot.jpg"
                          alt="Suspect Gallery Mugshot"
                          style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#E6E9ED' }}>
                            {footageData.suspectMatch.name}
                          </span>
                          <span style={{ fontSize: '0.66rem', color: '#8D98A5', fontFamily: 'var(--font-mono, monospace)' }}>
                            {footageData.suspectMatch.alias}
                          </span>
                          <span style={{ fontSize: '0.64rem', color: '#C04A52', fontWeight: 600 }}>
                            Apex Cyber Syndicate · Threat: CRITICAL
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 4 Integration Actions */}
                {currentStep === 'VERIFIED_RESULT' && (
                  <div style={{
                    backgroundColor: '#171D24',
                    border: '1px solid #2A333D',
                    borderRadius: '6px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#4F7A67', fontFamily: 'var(--font-mono, monospace)' }}>
                      TACTICAL DISCOVERY CONFIRMED
                    </span>
                    <p style={{ margin: 0, fontSize: '0.70rem', color: '#8D98A5', lineHeight: 1.4 }}>
                      Biometric identification of Viktor Voronin at South Arterial Way closes the 3-minute surveillance gap. Inject this discovery into the Tactical Map, Relational Knowledge Graph, and Timeline.
                    </p>

                    <button
                      onClick={handleInjectToCase}
                      disabled={injected}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '10px',
                        backgroundColor: injected ? '#4F7A67' : '#3F5F78',
                        border: '1px solid #5B7C99',
                        borderRadius: '6px',
                        color: '#E6E9ED',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: injected ? 'default' : 'pointer'
                      }}
                    >
                      {injected ? <Check size={16} /> : <Sparkles size={16} />}
                      <span>{injected ? '✓ Injected into Map & Graph' : 'Inject into Tactical Map & Knowledge Graph'}</span>
                    </button>

                    {injected && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        fontSize: '0.66rem',
                        fontFamily: 'var(--font-mono, monospace)',
                        color: '#4F7A67',
                        padding: '6px 8px',
                        backgroundColor: 'rgba(79, 122, 103, 0.1)',
                        borderRadius: '4px'
                      }}>
                        <span>✓ Camera CCTV-PVT-01 plotted on Map at 40.7138, -74.0048</span>
                        <span>✓ Biometric Match FM-045 linked to Voronin in Cytoscape Graph</span>
                        <span>✓ 14:12 UTC Corroboration recorded on Case Timeline</span>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '12px 20px',
          backgroundColor: '#171D24',
          borderTop: '1px solid #2A333D',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '0.68rem', color: '#8D98A5', fontFamily: 'var(--font-mono, monospace)' }}>
            EVIDENTIARY CHAIN-OF-CUSTODY LOGGED · SHA-256 INTEGRITY CHECK
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px 14px',
              backgroundColor: 'transparent',
              border: '1px solid #2A333D',
              borderRadius: '6px',
              color: '#E6E9ED',
              fontSize: '0.74rem',
              cursor: 'pointer'
            }}
          >
            Close Terminal
          </button>
        </div>

      </div>
    </div>
  );
}
