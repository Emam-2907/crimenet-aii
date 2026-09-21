import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Globe, Compass, ZoomIn, ZoomOut, Maximize2, RefreshCw, Filter,
  Shield, AlertTriangle, Eye, Layers, MapPin, Building, CreditCard,
  Phone, User, ExternalLink, MessageSquare, CheckCircle, Search,
  X, Radio, Navigation, Anchor, DollarSign, Crosshair
} from 'lucide-react';

// High-Resolution Geospatial Tile Definitions (Zero API Key Required / Unwatermarked)
const MAP_STYLES = {
  satellite: {
    id: 'satellite',
    name: 'Satellite Reconnaissance (Esri Orthophoto)',
    version: 8,
    sources: {
      'esri-satellite': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        ],
        tileSize: 256,
        maxzoom: 19,
        attribution: '© Esri, Maxar'
      },
      'esri-transport': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}'
        ],
        tileSize: 256,
        maxzoom: 19,
        attribution: ''
      }
    },
    layers: [
      {
        id: 'esri-sat-layer',
        type: 'raster',
        source: 'esri-satellite',
        minzoom: 0,
        maxzoom: 19
      },
      {
        id: 'esri-trans-layer',
        type: 'raster',
        source: 'esri-transport',
        minzoom: 0,
        maxzoom: 19
      }
    ]
  },
  osmStandard: {
    id: 'osmStandard',
    name: 'OpenStreetMap Global (Standard)',
    version: 8,
    sources: {
      'osm-tiles': {
        type: 'raster',
        tiles: [
          'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        ],
        tileSize: 256,
        maxzoom: 19,
        attribution: '© OpenStreetMap contributors'
      }
    },
    layers: [
      {
        id: 'osm-layer',
        type: 'raster',
        source: 'osm-tiles',
        minzoom: 0,
        maxzoom: 19
      }
    ]
  },
  esriStreet: {
    id: 'esriStreet',
    name: 'Esri World Street Map (Maritime & Logistics)',
    version: 8,
    sources: {
      'esri-street': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
        ],
        tileSize: 256,
        maxzoom: 19,
        attribution: '© Esri'
      }
    },
    layers: [
      {
        id: 'esri-street-layer',
        type: 'raster',
        source: 'esri-street',
        minzoom: 0,
        maxzoom: 19
      }
    ]
  }
};

// Global Transnational Syndicate & Tactical Hub Locations
export const DEFAULT_GLOBAL_NODES = [
  {
    id: 'PERSON-001',
    label: 'Viktor Voronin',
    role: 'Transnational Kingpin / Architect',
    type: 'Person',
    threat: 'CRITICAL',
    country: 'Switzerland / USA',
    city: 'Geneva / New York',
    lat: 40.7128,
    lng: -74.0060,
    interpol: 'RED_NOTICE_A-4891',
    details: 'Orchestrates ransomware extortion, avionics smuggling vectors, and multi-tier offshore escrow laundering networks. Subject of FBI/Interpol Red Notice.',
    mugshot: '/cctv/voronin_mugshot.jpg',
    color: '#9B3D45'
  },
  {
    id: 'PERSON-002',
    label: 'Elena Rostov',
    role: 'Darknet Escrow Operator / Valkyrie',
    type: 'Person',
    threat: 'HIGH',
    country: 'Switzerland',
    city: 'Zurich Financial Hub',
    lat: 47.3769,
    lng: 8.5417,
    interpol: 'WARRANT_FIN_918',
    details: 'Primary liquidity tumbler operator and cryptocurrency broker. Controls numbered Swiss escrow deposits and encrypted satellite keys.',
    mugshot: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
    color: '#9B3D45'
  },
  {
    id: 'PERSON-003',
    label: 'Darius Vance',
    role: 'Tactical Logistics Enforcer',
    type: 'Person',
    threat: 'HIGH',
    country: 'United States',
    city: 'Port of New York / New Jersey',
    lat: 40.6892,
    lng: -74.0445,
    interpol: 'ACTIVE_FEDERAL_WARRANT',
    details: 'Armed perimeter supervisor coordinating container release bribes, decoy convoys, and port terminal escort security.',
    mugshot: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
    color: '#9B3D45'
  },
  {
    id: 'PERSON-004',
    label: 'Marcus Kane',
    role: 'Hardware Tap & Signals Specialist',
    type: 'Person',
    threat: 'MEDIUM',
    country: 'Belgium',
    city: 'Antwerp Port Corridor',
    lat: 51.2194,
    lng: 4.4025,
    interpol: 'EUROPOL_MONITOR_77',
    details: 'Specialist in CCTV microwave taps, frequency hopping beacons, and automated SCADA locomotive override spoofing.',
    mugshot: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=240&q=80',
    color: '#9B3D45'
  },
  {
    id: 'PERSON-005',
    label: 'Viktor Chen (Cipher_Ghost)',
    role: 'Autonomous Exploit Architect',
    type: 'Person',
    threat: 'CRITICAL',
    country: 'Taiwan',
    city: 'Taipei Cyber Corridor',
    lat: 25.0330,
    lng: 121.5654,
    interpol: 'RED_NOTICE_CYBER-09',
    details: 'Developer of custom polymorphic ransomware strains and zero-day SCADA industrial control exploits.',
    color: '#9B3D45'
  },
  {
    id: 'PERSON-008',
    label: 'Tariq Al-Mansoor',
    role: 'Crypto Wash Ring Operator',
    type: 'Person',
    threat: 'CRITICAL',
    country: 'United Arab Emirates',
    city: 'Dubai International Financial Centre',
    lat: 25.2048,
    lng: 55.2708,
    interpol: 'FATF_WATCHLIST_AE',
    details: 'Oversees high-volume liquidity pools and over-the-counter (OTC) physical bullion swap nodes across the Middle East.',
    color: '#9B3D45'
  },
  {
    id: 'PERSON-010',
    label: 'Arturo Ruiz (El Silencio)',
    role: 'Maritime Container Dispatcher',
    type: 'Person',
    threat: 'HIGH',
    country: 'Colombia',
    city: 'Port of Cartagena',
    lat: 10.3997,
    lng: -75.5144,
    interpol: 'INTERPOL_MARITIME_ALERT',
    details: 'Coordinates maritime container seal tampering and inter-continental refrigerated cargo smuggling conduits.',
    color: '#9B3D45'
  },
  {
    id: 'ORG-001',
    label: 'Apex Cyber Syndicate',
    role: 'Global Threat Group',
    type: 'Organization',
    threat: 'CRITICAL',
    country: 'Germany / International',
    city: 'Frankfurt (DE-CIX Gateway)',
    lat: 50.1109,
    lng: 8.6821,
    details: 'Decentralized advanced persistent threat group targeting critical transport logistics and municipal grid infrastructure.',
    color: '#8D98A5'
  },
  {
    id: 'ORG-002',
    label: 'Kowloon Port Cartel',
    role: 'Maritime Cargo & Smuggling Syndicate',
    type: 'Organization',
    threat: 'HIGH',
    country: 'Hong Kong SAR',
    city: 'Victoria Harbour',
    lat: 22.2871,
    lng: 114.1917,
    details: 'Controls container shipping concessions, falsified customs manifests, and transpacific bulk contraband routes.',
    color: '#8D98A5'
  },
  {
    id: 'ORG-003',
    label: 'GhostNet Logistics',
    role: 'Transpacific Shell Forwarding Firm',
    type: 'Organization',
    threat: 'HIGH',
    country: 'Panama',
    city: 'Panama City / Colon Free Zone',
    lat: 8.9824,
    lng: -79.5199,
    details: 'Registered shell logistics intermediary providing freight routing deception and offshore freight forwarder accounts.',
    color: '#8D98A5'
  },
  {
    id: 'FIN-001',
    label: 'Tether Cold Vault 0x889...F1C',
    role: 'Offshore Escrow Repository',
    type: 'Financial Account',
    threat: 'CRITICAL',
    country: 'Cayman Islands',
    city: 'George Town Financial District',
    lat: 19.3133,
    lng: -81.2546,
    details: 'Multi-signature cryptocurrency cold vault holding $14.2M monitored volume, directly linked to Voronin signature keys.',
    color: '#4F7A67'
  },
  {
    id: 'FIN-002',
    label: 'Darknet Mixer Node 36',
    role: 'Automated Coin Tumbler Server',
    type: 'Financial Account',
    threat: 'CRITICAL',
    country: 'Netherlands',
    city: 'Rotterdam Data Center',
    lat: 51.9244,
    lng: 4.4777,
    details: 'High-speed automated micro-transaction tumbler breaking on-chain tracing for ransomware payouts.',
    color: '#4F7A67'
  },
  {
    id: 'LOC-001',
    label: 'Terminal C Harbor Depot',
    role: 'Sector 4 Customs Warehouse',
    type: 'Location',
    threat: 'HIGH',
    country: 'United States',
    city: 'Port of New York / New Jersey',
    lat: 40.7145,
    lng: -74.0045,
    details: 'Ground zero for CR-204 avionics container breach. Under active round-the-clock federal CCTV surveillance.',
    color: '#3F5F78'
  },
  {
    id: 'LOC-002',
    label: 'Warehouse 14B Safehouse',
    role: 'Tactical Staging & Command Node',
    type: 'Location',
    threat: 'HIGH',
    country: 'United States',
    city: 'Brooklyn Navy Yard, NY',
    lat: 40.7020,
    lng: -73.9710,
    details: 'Secure retreat containing microwave radio repeaters, vehicle switch bays, and counterfeit biometric passport stamps.',
    color: '#3F5F78'
  },
  {
    id: 'PHONE-003',
    label: 'Tor Gateway Node 185.220',
    role: 'High-Bandwidth Ingress Relay',
    type: 'Phone',
    threat: 'CRITICAL',
    country: 'Iceland',
    city: 'Reykjavik Bulletproof Data Facility',
    lat: 64.1466,
    lng: -21.9426,
    details: 'Hardened offshore relay node routing encrypted command & control traffic to avoid Western five-eyes detection.',
    color: '#5B7C99'
  }
];

// Transnational Smuggling & Cyber Attack Corridors (Geodesic Flight Lines)
export const GLOBAL_CORRIDORS = [
  {
    id: 'CORR-MARITIME-01',
    name: 'Transpacific Cargo Smuggling Conduit',
    category: 'Maritime Cargo',
    color: '#3F5F78',
    dashArray: [4, 3],
    coordinates: [
      [114.1917, 22.2871], // Hong Kong
      [103.8519, 1.2902],  // Singapore
      [-79.5199, 8.9824],  // Panama
      [-74.0045, 40.7145]  // Port of NY/NJ
    ],
    intel: '40-ft refrigerated shipping containers concealed behind legitimate perishable fruit shipments, routed via Colon Free Zone.'
  },
  {
    id: 'CORR-FIN-02',
    name: 'Transatlantic Crypto Escrow Tumbler Route',
    category: 'Financial Laundering',
    color: '#4F7A67',
    dashArray: [2, 2],
    coordinates: [
      [-74.0060, 40.7128], // New York
      [-81.2546, 19.3133], // Cayman Islands
      [8.5417, 47.3769],   // Zurich
      [55.2708, 25.2048]   // Dubai
    ],
    intel: 'Multi-hop USDT flash loans and offshore bearer shares used to wash ransom payments into Dubai real estate.'
  },
  {
    id: 'CORR-CYBER-03',
    name: 'DE-CIX SCADA Exploitation Vector',
    category: 'Cyber Command',
    color: '#9B3D45',
    dashArray: [5, 4],
    coordinates: [
      [121.5654, 25.0330], // Taipei
      [-21.9426, 64.1466], // Reykjavik Tor Node
      [8.6821, 50.1109],   // Frankfurt DE-CIX
      [-74.0045, 40.7145]  // Port of NY SCADA Relay
    ],
    intel: 'Low-latency BGP hijacking pulses targeting Port Authority locomotive switching telemetry.'
  },
  {
    id: 'CORR-CONTAINER-04',
    name: 'Caribbean Feeder Maritime Conduit',
    category: 'Maritime Cargo',
    color: '#5B7C99',
    dashArray: [3, 3],
    coordinates: [
      [-75.5144, 10.3997], // Cartagena
      [-79.5199, 8.9824],  // Panama
      [-74.0045, 40.7145]  // Terminal C Berth
    ],
    intel: 'Fast coastal container feeders transferring contraband outside 12-mile territorial waters.'
  }
];

// Quick Focus Locations
const REGION_PRESETS = [
  { id: 'GLOBAL', label: '🌐 Global Overview', center: [15, 25], zoom: 2.1, pitch: 15 },
  { id: 'NAM', label: '🇺🇸 North America (NY Harbor)', center: [-74.0045, 40.7145], zoom: 11, pitch: 35 },
  { id: 'EUR', label: '🇪🇺 Europe (Zurich / Rotterdam)', center: [8.5417, 50.1109], zoom: 4.8, pitch: 20 },
  { id: 'ME', label: '🇦🇪 Middle East (Dubai Escrow)', center: [55.2708, 25.2048], zoom: 6.2, pitch: 25 },
  { id: 'APAC', label: '🌏 Asia-Pacific (HK / Taipei)', center: [118.0, 23.5], zoom: 4.8, pitch: 20 },
  { id: 'PAN', label: '🇵🇦 Panama Canal Hub', center: [-79.5199, 8.9824], zoom: 7.5, pitch: 30 }
];

export default function WorldIntelligenceMap({
  externalNodes = [],
  selectedEntity = null,
  onSelectEntity = () => {},
  onInspectInGraph = () => {},
  onAskCira = () => {},
  height = '100%'
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const [activeStyle, setActiveStyle] = useState('satellite');
  const [activeRegion, setActiveRegion] = useState('GLOBAL');
  const [activeInspectNode, setActiveInspectNode] = useState(() => {
    if (selectedEntity && selectedEntity.lat != null && selectedEntity.lng != null) {
      return selectedEntity;
    }
    return DEFAULT_GLOBAL_NODES[0];
  });
  const [cursorCoords, setCursorCoords] = useState({ lat: '25.0000', lng: '15.0000' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [layerFilters, setLayerFilters] = useState({
    suspects: true,
    organizations: true,
    financial: true,
    locations: true,
    corridors: true,
    interpolOnly: false
  });

  // Merge external graph nodes that carry lat/lng with default transnational nodes
  const allNodes = useMemo(() => {
    const map = new Map();
    DEFAULT_GLOBAL_NODES.forEach(n => map.set(n.id, n));

    externalNodes.forEach(en => {
      const data = en.data || en;
      if (data.lat && data.lng) {
        map.set(data.id, {
          id: data.id,
          label: data.label || data.name || data.id,
          role: data.role || data.details?.slice(0, 40) || 'Investigation Entity',
          type: data.type || 'Person',
          threat: data.threat || 'HIGH',
          country: data.country || 'Monitored Jurisdiction',
          city: data.city || 'Transnational Station',
          lat: Number(data.lat),
          lng: Number(data.lng),
          interpol: data.interpol || (data.threat === 'CRITICAL' ? 'INTERPOL_FLAGGED' : null),
          details: data.details || 'Identified in case relational evidence graph.',
          color: data.color || '#9B3D45'
        });
      }
    });

    return Array.from(map.values());
  }, [externalNodes]);

  // Sync activeInspectNode when selectedEntity changes
  useEffect(() => {
    if (selectedEntity) {
      if (selectedEntity.lat != null && selectedEntity.lng != null) {
        setActiveInspectNode(selectedEntity);
      } else {
        const found = allNodes.find(n => n.id === selectedEntity.id);
        if (found && found.lat != null) {
          setActiveInspectNode(found);
        } else {
          setActiveInspectNode(prev => ({
            ...prev,
            ...selectedEntity,
            lat: selectedEntity.lat != null ? Number(selectedEntity.lat) : (prev?.lat || 40.7128),
            lng: selectedEntity.lng != null ? Number(selectedEntity.lng) : (prev?.lng || -74.0060),
            city: selectedEntity.city || prev?.city || 'Monitored Station',
            country: selectedEntity.country || prev?.country || 'Jurisdiction',
            details: selectedEntity.details || prev?.details || 'Investigation entity'
          }));
        }
      }
    }
  }, [selectedEntity, allNodes]);

  // Filter nodes based on user filter toggles
  const filteredNodes = useMemo(() => {
    return allNodes.filter(n => {
      if (layerFilters.interpolOnly && !n.interpol) return false;
      if (n.type === 'Person' && !layerFilters.suspects) return false;
      if (n.type === 'Organization' && !layerFilters.organizations) return false;
      if ((n.type === 'Financial Account' || n.type === 'Financial') && !layerFilters.financial) return false;
      if (n.type === 'Location' && !layerFilters.locations) return false;
      return true;
    });
  }, [allNodes, layerFilters]);

  // Search Results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return allNodes.filter(n => (
      n.id.toLowerCase().includes(q) ||
      n.label.toLowerCase().includes(q) ||
      (n.city && n.city.toLowerCase().includes(q)) ||
      (n.country && n.country.toLowerCase().includes(q)) ||
      (n.interpol && n.interpol.toLowerCase().includes(q))
    ));
  }, [allNodes, searchQuery]);

  // Initialize MapLibre GL Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLES[activeStyle],
      center: [15, 25],
      zoom: 2.1,
      pitch: 15,
      bearing: 0,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    map.on('mousemove', (e) => {
      if (e?.lngLat?.lat != null && e?.lngLat?.lng != null) {
        setCursorCoords({
          lat: Number(e.lngLat.lat).toFixed(4),
          lng: Number(e.lngLat.lng).toFixed(4)
        });
      }
    });

    map.on('load', () => {
      // 1. Add Transnational Corridors GeoJSON
      const corridorsGeoJSON = {
        type: 'FeatureCollection',
        features: GLOBAL_CORRIDORS.map(c => ({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: c.coordinates
          },
          properties: {
            id: c.id,
            name: c.name,
            category: c.category,
            color: c.color
          }
        }))
      };

      map.addSource('transnational-corridors', {
        type: 'geojson',
        data: corridorsGeoJSON
      });

      // Subtle underglow layer
      map.addLayer({
        id: 'corridors-glow',
        type: 'line',
        source: 'transnational-corridors',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 4,
          'line-opacity': 0.35,
          'line-blur': 3
        }
      });

      // Primary tactical dashed line
      map.addLayer({
        id: 'corridors-line',
        type: 'line',
        source: 'transnational-corridors',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2,
          'line-opacity': 0.85,
          'line-dasharray': [3, 2]
        }
      });
    });

    mapRef.current = map;

    const ro = new ResizeObserver(() => {
      map.resize();
    });
    if (mapContainerRef.current) {
      ro.observe(mapContainerRef.current);
    }

    return () => {
      ro.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update map style when activeStyle changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setStyle(MAP_STYLES[activeStyle]);
  }, [activeStyle]);

  // Update Corridors visibility when layerFilters.corridors changes
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;
    const visibility = layerFilters.corridors ? 'visible' : 'none';
    if (mapRef.current.getLayer('corridors-line')) {
      mapRef.current.setLayoutProperty('corridors-line', 'visibility', visibility);
    }
    if (mapRef.current.getLayer('corridors-glow')) {
      mapRef.current.setLayoutProperty('corridors-glow', 'visibility', visibility);
    }
  }, [layerFilters.corridors]);

  // Render HTML Tactical Markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    filteredNodes.forEach(node => {
      const el = document.createElement('div');
      el.className = 'world-intel-marker';
      el.style.width = '34px';
      el.style.height = '34px';
      el.style.cursor = 'pointer';
      el.style.position = 'relative';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';

      const isSelected = activeInspectNode?.id === node.id;
      const isCritical = node.threat === 'CRITICAL';
      const isInterpol = Boolean(node.interpol);

      // Color selection matching system palette
      const primaryColor = isCritical ? '#C04A52' : node.threat === 'HIGH' ? '#9B3D45' : node.color || '#3F5F78';

      el.innerHTML = `
        <div style="
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1.5px solid ${primaryColor};
          opacity: ${isSelected ? '1' : '0.45'};
          animation: ${isCritical ? 'pulse-danger 2s infinite' : 'none'};
          pointer-events: none;
        "></div>
        <div style="
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #101419;
          border: 2px solid ${isSelected ? '#E6E9ED' : primaryColor};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.8);
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          color: #E6E9ED;
        ">
          ${node.type === 'Person' ? '👤' : node.type === 'Organization' ? '🏢' : node.type === 'Location' ? '📍' : '💳'}
        </div>
        ${isInterpol ? `
          <div style="
            position: absolute;
            top: -2px;
            right: -2px;
            width: 9px;
            height: 9px;
            border-radius: 50%;
            background: #C04A52;
            border: 1.5px solid #080A0D;
          " title="Interpol Red Notice"></div>
        ` : ''}
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setActiveInspectNode(node);
        onSelectEntity(node);
        mapRef.current?.flyTo({
          center: [node.lng, node.lat],
          zoom: Math.max(mapRef.current.getZoom(), 5.5),
          pitch: 25,
          speed: 1.2
        });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([node.lng, node.lat])
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });
  }, [filteredNodes, activeInspectNode, onSelectEntity]);

  // Synchronize when selectedEntity is passed externally from Cytoscape graph
  useEffect(() => {
    if (!selectedEntity) return;
    const match = allNodes.find(n => n.id === (selectedEntity.id || selectedEntity.data?.id));
    if (match) {
      setActiveInspectNode(match);
      mapRef.current?.flyTo({
        center: [match.lng, match.lat],
        zoom: Math.max(mapRef.current?.getZoom() || 3, 5),
        speed: 1.2
      });
    }
  }, [selectedEntity, allNodes]);

  // Handle preset fly-to
  const handleFlyToRegion = (preset) => {
    setActiveRegion(preset.id);
    mapRef.current?.flyTo({
      center: preset.center,
      zoom: preset.zoom,
      pitch: preset.pitch,
      bearing: 0,
      speed: 1.1
    });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: height,
      width: '100%',
      background: 'var(--ink-0)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* ── TOP CONTROL STRIP ────────────────────────────────────────────── */}
      <div style={{
        padding: '10px 16px',
        background: 'var(--ink-1)',
        borderBottom: '1px solid var(--b-faint)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        zIndex: 10
      }}>
        {/* Left: Region Flight Shortcuts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--blue-light)',
            fontSize: '0.74rem',
            fontFamily: 'var(--f-mono)',
            fontWeight: 700,
            marginRight: '6px'
          }}>
            <Globe size={15} />
            <span>GLOBAL THEATERS:</span>
          </div>
          {REGION_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => handleFlyToRegion(preset)}
              style={{
                padding: '4px 9px',
                borderRadius: '5px',
                fontSize: '0.68rem',
                fontFamily: 'var(--f-mono)',
                cursor: 'pointer',
                background: activeRegion === preset.id ? 'var(--blue)' : 'var(--ink-2)',
                color: activeRegion === preset.id ? '#fff' : 'var(--t-muted)',
                border: `1px solid ${activeRegion === preset.id ? 'var(--blue-light)' : 'var(--b-soft)'}`,
                transition: 'all 0.15s ease'
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Right: Basemap Selector & Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Basemap Engine Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Layers size={13} style={{ color: 'var(--t-dim)' }} />
            <select
              value={activeStyle}
              onChange={(e) => setActiveStyle(e.target.value)}
              style={{
                background: 'var(--ink-2)',
                border: '1px solid var(--b-soft)',
                color: 'var(--t-muted)',
                fontSize: '0.70rem',
                padding: '4px 8px',
                borderRadius: '5px',
                fontFamily: 'var(--f-mono)',
                cursor: 'pointer'
              }}
            >
              <option value="satellite">Satellite Recon (Esri Aerial)</option>
              <option value="osmStandard">OpenStreetMap Global (Free)</option>
              <option value="esriStreet">Esri Maritime & Logistics</option>
            </select>
          </div>

          {/* Quick Filter: Corridors Toggle */}
          <button
            onClick={() => setLayerFilters(p => ({ ...p, corridors: !p.corridors }))}
            style={{
              padding: '4px 8px',
              borderRadius: '5px',
              fontSize: '0.68rem',
              fontFamily: 'var(--f-mono)',
              cursor: 'pointer',
              background: layerFilters.corridors ? 'rgba(63, 95, 120, 0.25)' : 'var(--ink-2)',
              color: layerFilters.corridors ? 'var(--blue-light)' : 'var(--t-dim)',
              border: `1px solid ${layerFilters.corridors ? 'var(--blue)' : 'var(--b-soft)'}`
            }}
          >
            {layerFilters.corridors ? '✓ Corridors Active' : 'Corridors Hidden'}
          </button>

          {/* Quick Filter: Interpol Only */}
          <button
            onClick={() => setLayerFilters(p => ({ ...p, interpolOnly: !p.interpolOnly }))}
            style={{
              padding: '4px 8px',
              borderRadius: '5px',
              fontSize: '0.68rem',
              fontFamily: 'var(--f-mono)',
              cursor: 'pointer',
              background: layerFilters.interpolOnly ? 'rgba(192, 74, 82, 0.25)' : 'var(--ink-2)',
              color: layerFilters.interpolOnly ? '#E6E9ED' : 'var(--t-dim)',
              border: `1px solid ${layerFilters.interpolOnly ? 'var(--critical)' : 'var(--b-soft)'}`
            }}
          >
            {layerFilters.interpolOnly ? '🚨 Interpol Flagged Only' : 'All Threat Levels'}
          </button>
        </div>
      </div>

      {/* ── MAP CONTAINER ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* HUD Overlay: Live Cursor Telemetry */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(8, 10, 13, 0.88)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--b-soft)',
          borderRadius: '6px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          fontSize: '0.66rem',
          fontFamily: 'var(--f-mono)',
          color: 'var(--t-muted)',
          zIndex: 5,
          pointerEvents: 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Crosshair size={12} style={{ color: 'var(--blue-light)' }} />
            <span>LAT: <strong style={{ color: '#E6E9ED' }}>{cursorCoords.lat}°</strong></span>
            <span>LNG: <strong style={{ color: '#E6E9ED' }}>{cursorCoords.lng}°</strong></span>
          </div>
          <div style={{ color: 'var(--b-soft)' }}>|</div>
          <div>GLOBAL HUBS: <strong style={{ color: 'var(--blue-light)' }}>{filteredNodes.length}</strong></div>
          <div>CORRIDORS: <strong style={{ color: 'var(--accent)' }}>{GLOBAL_CORRIDORS.length} ACTIVE</strong></div>
          <div style={{ color: 'var(--b-soft)' }}>|</div>
          <div style={{ color: 'var(--green-light)' }}>● LIVE GLOBAL GEO-INTEL & SATELLITE MATRIX</div>
        </div>

        {/* Global Search Bar Floating on Map */}
        <div style={{
          position: 'absolute',
          top: '14px',
          left: '14px',
          zIndex: 8,
          width: '280px'
        }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--t-dim)' }} />
            <input
              type="text"
              placeholder="Search global syndicate node, city, or ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              style={{
                width: '100%',
                padding: '7px 28px 7px 30px',
                background: 'rgba(16, 20, 25, 0.92)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--b-soft)',
                borderRadius: '6px',
                color: '#E6E9ED',
                fontSize: '0.72rem',
                fontFamily: 'var(--f-mono)',
                outline: 'none',
                boxShadow: '0 4px 16px rgba(0,0,0,0.6)'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '8px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--t-dim)',
                  cursor: 'pointer'
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div style={{
              marginTop: '4px',
              background: '#101419',
              border: '1px solid var(--b-soft)',
              borderRadius: '6px',
              maxHeight: '220px',
              overflowY: 'auto',
              boxShadow: '0 8px 24px rgba(0,0,0,0.8)'
            }}>
              {searchResults.map(n => (
                <div
                  key={n.id}
                  onClick={() => {
                    setActiveInspectNode(n);
                    onSelectEntity(n);
                    setShowSearchResults(false);
                    mapRef.current?.flyTo({
                      center: [n.lng, n.lat],
                      zoom: 6.5,
                      pitch: 25,
                      speed: 1.2
                    });
                  }}
                  style={{
                    padding: '8px 10px',
                    borderBottom: '1px solid var(--b-faint)',
                    cursor: 'pointer',
                    fontSize: '0.70rem',
                    transition: 'background 0.1s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--ink-2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, color: '#E6E9ED' }}>{n.label}</span>
                    <span style={{
                      fontSize: '0.60rem',
                      fontFamily: 'var(--f-mono)',
                      color: n.threat === 'CRITICAL' ? 'var(--critical)' : 'var(--t-muted)'
                    }}>
                      {n.threat}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.64rem', color: 'var(--t-muted)', marginTop: '2px' }}>
                    📍 {n.city}, {n.country}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── SELECTED NODE INSPECTION CARD (Bottom Right) ──────────────── */}
        {activeInspectNode && (
          <div style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            width: '360px',
            background: 'rgba(23, 29, 36, 0.94)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--b-soft)',
            borderRadius: '10px',
            padding: '16px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.85)',
            zIndex: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {activeInspectNode.mugshot ? (
                  <img
                    src={activeInspectNode.mugshot}
                    alt={activeInspectNode.label}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '6px',
                      objectFit: 'cover',
                      border: `1.5px solid ${activeInspectNode.threat === 'CRITICAL' ? 'var(--critical)' : 'var(--blue)'}`
                    }}
                  />
                ) : (
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '6px',
                    background: 'var(--ink-1)',
                    border: '1px solid var(--b-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>
                    {activeInspectNode.type === 'Organization' ? '🏢' : activeInspectNode.type === 'Location' ? '📍' : '💳'}
                  </div>
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#E6E9ED' }}>
                      {activeInspectNode.label}
                    </h4>
                    <span style={{
                      fontSize: '0.60rem',
                      fontFamily: 'var(--f-mono)',
                      padding: '2px 5px',
                      borderRadius: '3px',
                      background: activeInspectNode.threat === 'CRITICAL' ? 'rgba(192, 74, 82, 0.2)' : 'rgba(63, 95, 120, 0.25)',
                      color: activeInspectNode.threat === 'CRITICAL' ? 'var(--critical)' : 'var(--blue-light)',
                      border: `1px solid ${activeInspectNode.threat === 'CRITICAL' ? 'var(--critical)' : 'var(--blue)'}`
                    }}>
                      {activeInspectNode.threat}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--t-muted)', marginTop: '2px' }}>
                    {activeInspectNode.role}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveInspectNode(null)}
                style={{ background: 'none', border: 'none', color: 'var(--t-dim)', cursor: 'pointer', padding: '2px' }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Interpol Notice Banner if present */}
            {activeInspectNode.interpol && (
              <div style={{
                background: 'rgba(192, 74, 82, 0.15)',
                border: '1px solid rgba(192, 74, 82, 0.35)',
                borderRadius: '5px',
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.68rem',
                fontFamily: 'var(--f-mono)',
                color: '#E6E9ED'
              }}>
                <AlertTriangle size={14} style={{ color: 'var(--critical)' }} />
                <span>INTERPOL: <strong>{activeInspectNode.interpol}</strong></span>
              </div>
            )}

            {/* Geographic Coordinates & Location Details */}
            <div style={{
              background: 'var(--ink-1)',
              border: '1px solid var(--b-faint)',
              borderRadius: '6px',
              padding: '8px 10px',
              fontSize: '0.70rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--t-muted)' }}>
                <span>Jurisdiction:</span>
                <strong style={{ color: '#E6E9ED' }}>{activeInspectNode?.city || 'Monitored Station'}, {activeInspectNode?.country || 'Jurisdiction'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--t-muted)', fontFamily: 'var(--f-mono)' }}>
                <span>Coordinates:</span>
                <span style={{ color: 'var(--blue-light)' }}>
                  {activeInspectNode?.lat != null && activeInspectNode?.lng != null
                    ? `${Number(activeInspectNode.lat).toFixed(4)}° N, ${Number(activeInspectNode.lng).toFixed(4)}° W`
                    : 'Coordinates: Lat/Lng pending triangulation'}
                </span>
              </div>
            </div>

            {/* Intel Details */}
            <p style={{
              margin: 0,
              fontSize: '0.72rem',
              color: 'var(--t-secondary)',
              lineHeight: 1.45,
              maxHeight: '60px',
              overflowY: 'auto'
            }}>
              {activeInspectNode.details}
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
              <button
                onClick={() => onInspectInGraph(activeInspectNode)}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  background: 'var(--blue)',
                  border: '1px solid var(--blue-light)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.70rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Crosshair size={13} />
                <span>Inspect in Graph 🕸️</span>
              </button>

              <button
                onClick={() => onAskCira(activeInspectNode)}
                style={{
                  padding: '7px 12px',
                  background: 'var(--ink-2)',
                  border: '1px solid var(--b-soft)',
                  borderRadius: '6px',
                  color: 'var(--t-muted)',
                  fontSize: '0.70rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <MessageSquare size={13} />
                <span>CIRA</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
