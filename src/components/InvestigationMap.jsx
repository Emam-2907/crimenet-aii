import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useInvestigation } from '../context/InvestigationContext.jsx';
import {
  Camera, MapPin, AlertTriangle, Truck, User, Search, Filter,
  Maximize2, RotateCcw, Layers, Eye, EyeOff, CheckCircle, Clock,
  Shield, ChevronRight, X
} from 'lucide-react';

// Helper to create GeoJSON circle polygon for camera coverage
function createGeoJSONCircle(centerLng, centerLat, radiusInMeters, points = 36) {
  const coords = {
    latitude: centerLat,
    longitude: centerLng
  };
  const km = radiusInMeters / 1000;
  const ret = [];
  const distanceX = km / (111.320 * Math.cos((coords.latitude * Math.PI) / 180));
  const distanceY = km / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    ret.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]);

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [ret]
    },
    properties: {}
  };
}

// Helper to project geographic coordinates to SVG viewport
function projectCoords(lng, lat, width = 950, height = 600) {
  const minLng = -74.0115;
  const maxLng = -73.9960;
  const minLat = 40.7090;
  const maxLat = 40.7205;

  const padX = 70;
  const padY = 70;
  const usableW = width - padX * 2;
  const usableH = height - padY * 2;

  const normX = Math.max(0, Math.min(1, ((lng || -74.0045) - minLng) / (maxLng - minLng)));
  const normY = Math.max(0, Math.min(1, (maxLat - (lat || 40.7145)) / (maxLat - minLat)));

  return {
    x: padX + normX * usableW,
    y: padY + normY * usableH
  };
}

export default function InvestigationMap() {
  const {
    investigationData,
    allCameras,
    selectedEntityId,
    selectedCamera,
    selectedVehicle,
    selectedFaceMatch,
    selectedLocation,
    mapFilter,
    setMapFilter,
    showCoverage,
    setShowCoverage,
    mapFlyToTarget,
    selectEntity,
    selectCamera
  } = useInvestigation();

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [useVectorFallback, setUseVectorFallback] = useState(false);
  const [activeLayers, setActiveLayers] = useState({
    cameras: true,
    locations: true,
    incidents: true,
    vehicleRoute: true,
    coverage: true
  });

  // Filtered cameras based on mapFilter
  const filteredCameras = useMemo(() => {
    return allCameras.filter(cam => {
      if (mapFilter === 'ONLINE') return cam.status === 'ONLINE';
      if (mapFilter === 'OFFLINE') return cam.status === 'OFFLINE';
      if (mapFilter === 'WARNING') return cam.status === 'WARNING' || cam.status === 'MAINTENANCE';
      if (mapFilter === 'CURRENT_CASE') return cam.caseIds?.includes('CR-204');
      if (mapFilter === 'SELECTED_PERSON') return cam.relatedPersons?.includes('P-017');
      if (mapFilter === 'SELECTED_VEHICLE') return cam.relatedVehicles?.includes('V-102');
      if (mapFilter === 'FACE_EVENTS') return cam.relatedFaceMatches?.length > 0 || cam.events?.some(e => e.type === 'FACE_MATCH');
      return true; // 'ALL'
    });
  }, [allCameras, mapFilter]);

  // Search Results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return Object.values(investigationData.entities).filter(e => {
      return (
        e.id.toLowerCase().includes(q) ||
        (e.name && e.name.toLowerCase().includes(q)) ||
        (e.type && e.type.toLowerCase().includes(q)) ||
        (e.location_name && e.location_name.toLowerCase().includes(q))
      );
    });
  }, [investigationData, searchQuery]);

  // Initialize MapLibre GL Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    if (typeof maplibregl.supported === 'function' && !maplibregl.supported()) {
      console.warn('MapLibre GL WebGL not supported. Activating High-Precision Vector Canvas Mode.');
      setUseVectorFallback(true);
      return;
    }

    // Dark Tactical Tile Style (OpenStreetMap compatible via CartoDB Dark Matter)
    const darkStyle = {
      version: 8,
      sources: {
        'carto-dark': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
            'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
            'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
            'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors © CARTO'
        }
      },
      layers: [
        {
          id: 'carto-dark-layer',
          type: 'raster',
          source: 'carto-dark',
          minzoom: 0,
          maxzoom: 20
        }
      ]
    };

    let map;
    try {
      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: darkStyle,
        center: [-74.0045, 40.7145], // Sector 4 South Pier Logistics Corridor
        zoom: 15.2,
        pitch: 25,
        bearing: -15,
        attributionControl: false
      });
    } catch (err) {
      console.warn('MapLibre GL instantiation failed, switching to vector mode:', err);
      setUseVectorFallback(true);
      return;
    }

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    map.on('load', () => {
      // 1. Add Inferred Routes (GeoJSON Dashed Lines)
      const inferredRoutesGeoJSON = {
        type: 'FeatureCollection',
        features: investigationData.map_corridors.inferred_routes.map(r => ({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: r.coordinates
          },
          properties: {
            id: r.id,
            name: r.name,
            label: r.label
          }
        }))
      };

      map.addSource('inferred-routes', {
        type: 'geojson',
        data: inferredRoutesGeoJSON
      });

      // Subtle underlay for inferred route
      map.addLayer({
        id: 'inferred-routes-glow',
        type: 'line',
        source: 'inferred-routes',
        paint: {
          'line-color': '#3F5F78',
          'line-width': 5,
          'line-opacity': 0.35,
          'line-blur': 2
        }
      });

      // Dashed line layer for INFERRED ROUTE
      map.addLayer({
        id: 'inferred-routes-line',
        type: 'line',
        source: 'inferred-routes',
        paint: {
          'line-color': '#5B7C99',
          'line-width': 2,
          'line-dasharray': [3, 2],
          'line-opacity': 0.9
        }
      });

      // 2. Add Simulated Camera Coverage Layer
      map.addSource('camera-coverage', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'camera-coverage-fill',
        type: 'fill',
        source: 'camera-coverage',
        paint: {
          'fill-color': '#3F5F78',
          'fill-opacity': 0.14
        }
      });

      map.addLayer({
        id: 'camera-coverage-outline',
        type: 'line',
        source: 'camera-coverage',
        paint: {
          'line-color': '#5B7C99',
          'line-width': 1.5,
          'line-dasharray': [2, 2],
          'line-opacity': 0.65
        }
      });
    });

    mapRef.current = map;

    // Auto-resize observers and timers to guarantee WebGL canvas never initializes with 0px or collapses
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    const t1 = setTimeout(() => mapRef.current?.resize(), 80);
    const t2 = setTimeout(() => mapRef.current?.resize(), 250);
    const t3 = setTimeout(() => mapRef.current?.resize(), 600);
    const t4 = setTimeout(() => mapRef.current?.resize(), 1200);

    const onWinResize = () => mapRef.current?.resize();
    window.addEventListener('resize', onWinResize);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener('resize', onWinResize);
      markersRef.current.forEach(m => m.remove());
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch (e) {}
      }
      mapRef.current = null;
    };
  }, [investigationData]);

  // Update Camera Coverage Layer when selected camera or toggle changes
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (!map.isStyleLoaded() || !map.getSource('camera-coverage')) return;

    if (!showCoverage || !selectedCamera) {
      map.getSource('camera-coverage').setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    const radius = selectedCamera.coverageRadius || 85;
    const circleFeature = createGeoJSONCircle(
      selectedCamera.lng || selectedCamera.longitude,
      selectedCamera.lat || selectedCamera.latitude,
      radius
    );

    map.getSource('camera-coverage').setData({
      type: 'FeatureCollection',
      features: [circleFeature]
    });
  }, [selectedCamera, showCoverage]);

  // Handle mapFlyToTarget
  useEffect(() => {
    if (!mapRef.current || !mapFlyToTarget) return;
    mapRef.current.flyTo({
      center: [mapFlyToTarget.lng, mapFlyToTarget.lat],
      zoom: mapFlyToTarget.zoom || 16,
      duration: 1200,
      essential: true
    });
  }, [mapFlyToTarget]);

  // Render / Update DOM Markers on Map
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Remove existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Helper to add marker
    const addMarker = (el, lng, lat) => {
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([lng, lat])
        .addTo(map);
      markersRef.current.push(marker);
      return marker;
    };

    // 1. Render Camera Markers (CCTV-01 to CCTV-12)
    if (activeLayers.cameras) {
      filteredCameras.forEach(cam => {
        const isSelected = selectedEntityId === cam.id;
        const statusColors = {
          ONLINE: { bg: '#4F7A67', border: '#335043', text: '#649780', badge: 'rgba(79, 122, 103, 0.18)' },
          WARNING: { bg: '#B58A45', border: '#7A5B28', text: '#D1A256', badge: 'rgba(181, 138, 69, 0.18)' },
          MAINTENANCE: { bg: '#B58A45', border: '#7A5B28', text: '#D1A256', badge: 'rgba(181, 138, 69, 0.18)' },
          OFFLINE: { bg: '#8D98A5', border: '#2A333D', text: '#8D98A5', badge: 'rgba(141, 152, 165, 0.15)' }
        };
        const sc = statusColors[cam.status] || statusColors.ONLINE;

        const el = document.createElement('div');
        el.className = `cctv-marker-node ${isSelected ? 'selected-marker' : ''}`;
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        el.setAttribute('aria-label', `Camera ${cam.name}, status ${cam.status}`);
        el.style.cursor = 'pointer';
        el.style.position = 'relative';

        el.innerHTML = `
          <div style="
            width: ${isSelected ? '42px' : '34px'};
            height: ${isSelected ? '42px' : '34px'};
            border-radius: 8px;
            background: ${isSelected ? '#3F5F78' : '#171D24'};
            border: 2px solid ${isSelected ? '#5B7C99' : sc.border};
            box-shadow: ${isSelected ? '0 0 14px rgba(91, 124, 153, 0.45)' : '0 4px 12px rgba(0,0,0,0.5)'};
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            position: relative;
          ">
            <!-- CCTV Icon SVG -->
            <svg width="${isSelected ? '20' : '17'}" height="${isSelected ? '20' : '17'}" viewBox="0 0 24 24" fill="none" stroke="${isSelected ? '#E6E9ED' : sc.text}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>

            <!-- Status Dot Badge -->
            <span style="
              position: absolute;
              top: -3px;
              right: -3px;
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: ${sc.bg};
              border: 1.5px solid #101419;
              ${cam.status === 'ONLINE' ? 'box-shadow: 0 0 4px #4F7A67;' : ''}
            "></span>
          </div>

          <!-- Camera ID Label Tag -->
          <div style="
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            margin-top: 4px;
            background: #101419;
            border: 1px solid ${isSelected ? '#5B7C99' : '#2A333D'};
            color: ${isSelected ? '#E6E9ED' : '#8D98A5'};
            font-family: var(--font-mono, monospace);
            font-size: 0.65rem;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            white-space: nowrap;
            pointer-events: none;
            box-shadow: 0 2px 6px rgba(0,0,0,0.5);
          ">
            ${cam.cameraId}
          </div>
        `;

        // Interactive Popup Tooltip on Hover
        const popup = new maplibregl.Popup({
          offset: 25,
          closeButton: false,
          closeOnClick: false,
          className: 'tactical-map-popup'
        }).setHTML(`
          <div style="
            background: #171D24;
            border: 1px solid #2A333D;
            border-radius: 6px;
            padding: 10px 12px;
            color: #E6E9ED;
            font-family: var(--font-body, sans-serif);
            font-size: 0.75rem;
            min-width: 190px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.65);
          ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong style="color: #5B7C99; font-family: var(--font-mono, monospace);">${cam.cameraId}</strong>
              <span style="
                font-size: 0.60rem;
                font-family: var(--font-mono, monospace);
                padding: 1px 6px;
                border-radius: 3px;
                background: ${sc.badge};
                color: ${sc.text};
                border: 1px solid ${sc.border};
              ">${cam.status}</span>
            </div>
            <div style="font-size: 0.72rem; font-weight: 600; color: #E6E9ED; margin-bottom: 4px;">${cam.name}</div>
            <div style="font-size: 0.68rem; color: #8D98A5; margin-bottom: 6px;">Location: ${cam.location_name || cam.locationId}</div>
            <div style="font-size: 0.65rem; color: #B58A45; font-family: var(--font-mono, monospace);">
              Last Event: ${cam.events?.[cam.events.length - 1]?.time || '14:09'} UTC
            </div>
            <div style="margin-top: 6px; font-size: 0.62rem; color: #5B7C99; font-style: italic;">
              Click to inspect camera & coverage
            </div>
          </div>
        `);

        el.addEventListener('mouseenter', () => popup.addTo(map));
        el.addEventListener('mouseleave', () => popup.remove());

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          selectCamera(cam.id);
        });

        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectCamera(cam.id);
          }
        });

        addMarker(el, cam.lng || cam.longitude, cam.lat || cam.latitude);
      });
    }

    // 2. Render Location Markers (L-08, L-10, L-12)
    if (activeLayers.locations) {
      ['L-08', 'L-10', 'L-12'].forEach(locId => {
        const loc = investigationData.entities[locId];
        if (!loc || !loc.lat || !loc.lng) return;
        const isSelected = selectedEntityId === locId;

        const el = document.createElement('div');
        el.className = 'location-marker-node';
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        el.setAttribute('aria-label', `Location ${loc.name}`);
        el.style.cursor = 'pointer';

        el.innerHTML = `
          <div style="
            width: ${isSelected ? '32px' : '26px'};
            height: ${isSelected ? '32px' : '26px'};
            border-radius: 50%;
            background: ${isSelected ? '#3F5F78' : '#171D24'};
            border: 2px solid ${isSelected ? '#5B7C99' : '#2A333D'};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: ${isSelected ? '0 0 10px rgba(91, 124, 153, 0.45)' : '0 2px 6px rgba(0,0,0,0.5)'};
            transition: all 0.2s ease;
          ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E6E9ED" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          selectEntity(locId, 'location');
        });

        addMarker(el, loc.lng, loc.lat);
      });
    }

    // 3. Render Incident Marker (INC-204)
    if (activeLayers.incidents) {
      const inc = investigationData.entities['INC-204'];
      if (inc && inc.lat && inc.lng) {
        const isSelected = selectedEntityId === 'INC-204';

        const el = document.createElement('div');
        el.className = 'incident-marker-node';
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        el.setAttribute('aria-label', `Incident ${inc.name}`);
        el.style.cursor = 'pointer';

        el.innerHTML = `
          <div style="
            width: ${isSelected ? '36px' : '30px'};
            height: ${isSelected ? '36px' : '30px'};
            border-radius: 6px;
            background: ${isSelected ? '#C04A52' : '#9B3D45'};
            border: 2px solid ${isSelected ? '#C04A52' : '#2A333D'};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 12px rgba(192, 74, 82, 0.55);
            animation: pulse-danger 2s infinite;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E6E9ED" stroke-width="2.2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          selectEntity('INC-204', 'incident');
        });

        addMarker(el, inc.lng, inc.lat);
      }
    }

    // 4. Render Recorded Vehicle Detections (V-102 at CCTV-04, CCTV-07, CCTV-11)
    if (activeLayers.vehicleRoute) {
      investigationData.map_corridors.observed_waypoints.forEach(wp => {
        const el = document.createElement('div');
        el.className = 'vehicle-detection-marker';
        el.setAttribute('aria-label', `Recorded Vehicle Detection at ${wp.name}`);

        el.innerHTML = `
          <div style="
            background: #101419;
            border: 1px solid #B58A45;
            border-radius: 4px;
            padding: 2px 6px;
            display: flex;
            align-items: center;
            gap: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
            font-family: var(--font-mono, monospace);
            font-size: 0.62rem;
            color: #B58A45;
            transform: translate(-50%, -130%);
            pointer-events: none;
          ">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: #B58A45; display: inline-block;"></span>
            <span>V-102 ${wp.time} UTC</span>
            <span style="color: #4F7A67; font-size: 0.58rem;">[RECORDED]</span>
          </div>
        `;

        addMarker(el, wp.lng, wp.lat);
      });
    }

  }, [filteredCameras, activeLayers, selectedEntityId, selectCamera, selectEntity, investigationData]);

  // Reset View to bounds of all cameras
  const handleResetView = () => {
    if (!mapRef.current) return;
    const bounds = new maplibregl.LngLatBounds();
    allCameras.forEach(cam => {
      bounds.extend([cam.lng || cam.longitude, cam.lat || cam.latitude]);
    });
    mapRef.current.fitBounds(bounds, { padding: 80, duration: 1000 });
  };

  const handleSearchResultClick = (item) => {
    setShowSearchResults(false);
    setSearchQuery('');
    selectEntity(item.id, item.type);
  };

  return (
    <div className="investigation-map-container" style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      minHeight: '560px',
      backgroundColor: '#020617',
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid var(--border-default)',
      display: 'flex',
      flexDirection: 'column'
    }}>

      {/* MapLibre WebGL Canvas Container */}
      <div
        ref={mapContainerRef}
        data-testid="tactical-map"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '560px',
          flex: 1,
          display: useVectorFallback ? 'none' : 'block'
        }}
      />

      {/* High-Precision Tactical Vector Radar Grid Fallback */}
      {useVectorFallback && (
        <div
          data-testid="tactical-map-vector"
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '560px',
            backgroundColor: '#040711',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1
          }}
        >
          <svg
            viewBox="0 0 950 600"
            style={{ width: '100%', height: '100%', maxHeight: '620px' }}
          >
            <defs>
              <pattern id="tactical-grid-pat" width="36" height="36" patternUnits="userSpaceOnUse">
                <path d="M 36 0 L 0 0 0 36" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              </pattern>
            </defs>

            {/* Tactical Grid Background */}
            <rect width="950" height="600" fill="#030712" />
            <rect width="950" height="600" fill="url(#tactical-grid-pat)" />

            {/* Concentric Radar Rings */}
            <circle cx="475" cy="300" r="130" fill="none" stroke="rgba(91, 124, 153, 0.12)" strokeWidth="1" strokeDasharray="4,4" />
            <circle cx="475" cy="300" r="250" fill="none" stroke="rgba(91, 124, 153, 0.08)" strokeWidth="1" strokeDasharray="4,4" />

            {/* Tactical Sector Headers */}
            <text x="36" y="44" fill="#6B7280" fontFamily="monospace" fontSize="11" fontWeight="700">SECTOR 4 // SOUTH PIER LOGISTICS MATRIX</text>
            <text x="36" y="60" fill="#4B5563" fontFamily="monospace" fontSize="9">RADAR MODE: TACTICAL VECTOR PROJECTION</text>
            <text x="760" y="44" fill="#6B7280" fontFamily="monospace" fontSize="10">40°42'52"N  74°00'16"W</text>

            {/* Inferred Route Lines */}
            {activeLayers.vehicleRoute && (
              <g>
                <path
                  d="M 230 220 Q 380 260 480 300 T 700 320"
                  fill="none"
                  stroke="#3F5F78"
                  strokeWidth="5"
                  opacity="0.35"
                />
                <path
                  d="M 230 220 Q 380 260 480 300 T 700 320"
                  fill="none"
                  stroke="#5B7C99"
                  strokeWidth="2"
                  strokeDasharray="6,4"
                />
              </g>
            )}

            {/* Location Indicators (L-08, L-10, L-12) */}
            {activeLayers.locations && ['L-08', 'L-10', 'L-12'].map(locId => {
              const loc = investigationData.entities[locId];
              if (!loc) return null;
              const pos = projectCoords(loc.lng || loc.longitude, loc.lat || loc.latitude, 950, 600);
              return (
                <g key={locId} onClick={() => selectEntity(locId, 'location')} style={{ cursor: 'pointer' }}>
                  <rect x={pos.x - 8} y={pos.y - 8} width="16" height="16" fill="rgba(192, 132, 252, 0.15)" stroke="#C084FC" strokeWidth="1.5" transform={`rotate(45 ${pos.x} ${pos.y})`} />
                  <text x={pos.x} y={pos.y + 20} textAnchor="middle" fill="#C084FC" fontFamily="monospace" fontSize="8" fontWeight="600">
                    {locId}
                  </text>
                </g>
              );
            })}

            {/* Incident Marker (INC-204) */}
            {activeLayers.incidents && (() => {
              const inc = investigationData.entities['INC-204'];
              if (!inc) return null;
              const pos = projectCoords(inc.lng || inc.longitude, inc.lat || inc.latitude, 950, 600);
              return (
                <g key="INC-204" onClick={() => selectEntity('INC-204', 'incident')} style={{ cursor: 'pointer' }}>
                  <circle cx={pos.x} cy={pos.y} r="18" fill="rgba(239, 68, 68, 0.2)" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3,3" />
                  <circle cx={pos.x} cy={pos.y} r="6" fill="#EF4444" />
                  <text x={pos.x} y={pos.y - 12} textAnchor="middle" fill="#F87171" fontFamily="monospace" fontSize="8" fontWeight="700">
                    BREACH ALARM INC-204
                  </text>
                </g>
              );
            })()}

            {/* Vehicle Sighting Marker (V-102) */}
            {activeLayers.vehicleRoute && (() => {
              const veh = investigationData.entities['V-102'];
              if (!veh) return null;
              const pos = projectCoords(veh.lng || veh.longitude, veh.lat || veh.latitude, 950, 600);
              return (
                <g key="V-102" onClick={() => selectEntity('V-102', 'vehicle')} style={{ cursor: 'pointer' }}>
                  <circle cx={pos.x} cy={pos.y} r="12" fill="rgba(251, 191, 36, 0.25)" stroke="#FBBF24" strokeWidth="2" />
                  <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="#FBBF24" fontSize="9" fontWeight="bold">V</text>
                  <text x={pos.x} y={pos.y + 24} textAnchor="middle" fill="#FCD34D" fontFamily="monospace" fontSize="8" fontWeight="700">
                    V-102 (Escalade)
                  </text>
                </g>
              );
            })()}

            {/* Camera Nodes (CCTV-01 to CCTV-12) */}
            {activeLayers.cameras && filteredCameras.map(cam => {
              const pos = projectCoords(cam.lng || cam.longitude, cam.lat || cam.latitude, 950, 600);
              const isSelected = selectedEntityId === cam.id;
              const isOnline = cam.status === 'ONLINE';
              const isWarning = cam.status === 'WARNING' || cam.status === 'MAINTENANCE';
              const dotColor = isOnline ? '#34D399' : (isWarning ? '#FBBF24' : '#9CA3AF');

              return (
                <g
                  key={cam.id}
                  onClick={() => selectCamera(cam.id)}
                  style={{ cursor: 'pointer' }}
                  data-testid="cctv-node"
                  role="button"
                  tabIndex={0}
                >
                  {/* Selected Indicator Ring */}
                  {isSelected && (
                    <circle cx={pos.x} cy={pos.y} r="22" fill="rgba(91, 124, 153, 0.35)" stroke="#5B7C99" strokeWidth="2" />
                  )}

                  {/* Node Circle */}
                  <circle cx={pos.x} cy={pos.y} r="14" fill="#111827" stroke={isSelected ? '#5B7C99' : dotColor} strokeWidth="2" />
                  <circle cx={pos.x} cy={pos.y} r="4" fill={dotColor} />

                  {/* Camera ID Badge */}
                  <rect x={pos.x - 24} y={pos.y + 18} width="48" height="15" rx="3" fill="#0B0F17" stroke={isSelected ? '#5B7C99' : '#1F2937'} strokeWidth="1" />
                  <text x={pos.x} y={pos.y + 29} textAnchor="middle" fill={isSelected ? '#E6E9ED' : '#9CA3AF'} fontFamily="monospace" fontSize="8" fontWeight="700">
                    {cam.cameraId || cam.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Persistent Synthetic Data Disclaimer */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '14px',
        zIndex: 10,
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        borderRadius: '6px',
        padding: '6px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backdropFilter: 'blur(6px)',
        pointerEvents: 'none'
      }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', animation: 'pulse 1.5s infinite' }} />
        <span style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.68rem',
          fontWeight: 700,
          color: '#f87171',
          letterSpacing: '0.04em'
        }}>
          SYNTHETIC DATA — DEMO ENVIRONMENT
        </span>
      </div>

      {/* Top Floating Map Controls: Search & Layer Toggles */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '54px',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#101419',
            border: '1px solid var(--border-default)',
            borderRadius: '6px',
            padding: '5px 10px',
            gap: '6px',
            backdropFilter: 'blur(6px)'
          }}>
            <Search size={14} color="var(--accent)" />
            <input
              type="text"
              placeholder="Search CCTV, Person, Vehicle..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '0.74rem',
                outline: 'none',
                width: '100%'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {showSearchResults && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              backgroundColor: '#101419',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
              maxHeight: '220px',
              overflowY: 'auto',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              zIndex: 30
            }}>
              {searchResults.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSearchResultClick(item)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    textAlign: 'left',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--border-subtle)',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.72rem'
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {item.id}
                    </span>
                    <span style={{ marginLeft: '8px', color: 'var(--text-secondary)' }}>
                      {item.name || item.title}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {item.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset View Button */}
        <button
          type="button"
          onClick={handleResetView}
          style={{
            backgroundColor: '#101419',
            border: '1px solid var(--border-default)',
            borderRadius: '6px',
            padding: '6px 10px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.70rem',
            backdropFilter: 'blur(6px)'
          }}
          title="Reset map view to all cameras"
          aria-label="Reset Map View"
        >
          <RotateCcw size={12} />
          <span>Reset View</span>
        </button>

        {/* Coverage Area Toggle */}
        <button
          type="button"
          onClick={() => setShowCoverage(!showCoverage)}
          style={{
            backgroundColor: showCoverage ? 'var(--accent-dim)' : '#101419',
            border: showCoverage ? '1px solid var(--accent)' : '1px solid var(--border-default)',
            borderRadius: '6px',
            padding: '6px 10px',
            color: showCoverage ? 'var(--accent)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.70rem',
            backdropFilter: 'blur(6px)'
          }}
          title="Toggle Simulated Camera Coverage Polygon"
          aria-pressed={showCoverage}
        >
          <Eye size={12} />
          <span>Coverage Area</span>
        </button>
      </div>

      {/* Interactive Camera Quick-Select Ribbon */}
      <div style={{
        position: 'absolute',
        top: '56px',
        left: '14px',
        right: '14px',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        overflowX: 'auto',
        padding: '6px 10px',
        backgroundColor: '#101419',
        border: '1px solid var(--border-default)',
        borderRadius: '6px',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.6)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginRight: '6px', flexShrink: 0 }}>
          <Camera size={14} color="var(--accent)" />
          <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 700 }}>
            CAMERAS ({allCameras.length}):
          </span>
        </div>

        {allCameras.map(cam => {
          const isSelected = selectedEntityId === cam.id;
          const hasFaceMatch = cam.relatedFaceMatches?.length > 0 || cam.id === 'CCTV-04';
          const hasVehicle = cam.relatedVehicles?.length > 0;
          const hasIncident = cam.relatedIncidents?.length > 0;

          const dotColor = cam.status === 'ONLINE' ? '#4F7A67' :
                           cam.status === 'WARNING' ? '#B58A45' :
                           cam.status === 'MAINTENANCE' ? '#B58A45' : '#8D98A5';

          return (
            <button
              key={cam.id}
              type="button"
              onClick={() => {
                selectCamera(cam.id);
                if (mapRef.current) {
                  mapRef.current.flyTo({
                    center: [cam.lng || cam.longitude, cam.lat || cam.latitude],
                    zoom: 16.5,
                    duration: 1000
                  });
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: isSelected ? 700 : 500,
                border: isSelected ? '1.5px solid #5B7C99' : '1px solid var(--border-subtle)',
                backgroundColor: isSelected ? 'rgba(63, 95, 120, 0.4)' : '#171D24',
                color: isSelected ? '#E6E9ED' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 0 8px rgba(91, 124, 153, 0.4)' : 'none'
              }}
              title={`Inspect ${cam.name} (${cam.status})`}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: dotColor }} />
              <span>{cam.cameraId || cam.id}</span>
              {hasFaceMatch && (
                <span style={{ fontSize: '0.58rem', padding: '1px 4px', borderRadius: '2px', backgroundColor: 'rgba(91, 124, 153, 0.25)', color: '#5B7C99', fontWeight: 700 }}>
                  87% FACE
                </span>
              )}
              {hasVehicle && !hasFaceMatch && (
                <span style={{ fontSize: '0.58rem', padding: '1px 4px', borderRadius: '2px', backgroundColor: 'rgba(181, 138, 69, 0.25)', color: '#B58A45', fontWeight: 700 }}>
                  VEHICLE
                </span>
              )}
              {hasIncident && (
                <span style={{ fontSize: '0.58rem', padding: '1px 4px', borderRadius: '2px', backgroundColor: 'rgba(192, 74, 82, 0.25)', color: '#C04A52', fontWeight: 700 }}>
                  ALARM
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filter Bar Floating at Bottom */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '14px',
        right: '14px',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        overflowX: 'auto',
        padding: '6px 8px',
        backgroundColor: '#101419',
        border: '1px solid var(--border-default)',
        borderRadius: '6px',
        backdropFilter: 'blur(6px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '6px', flexShrink: 0 }}>
          <Filter size={12} color="var(--accent)" />
          <span style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 700 }}>
            FILTERS:
          </span>
        </div>

        {[
          { id: 'ALL', label: 'All Cameras' },
          { id: 'ONLINE', label: 'Online' },
          { id: 'OFFLINE', label: 'Offline' },
          { id: 'WARNING', label: 'Warning' },
          { id: 'CURRENT_CASE', label: 'CR-204 Cameras' },
          { id: 'SELECTED_PERSON', label: 'Person P-017' },
          { id: 'SELECTED_VEHICLE', label: 'Vehicle V-102' },
          { id: 'FACE_EVENTS', label: 'Face Events' }
        ].map(f => {
          const isActive = mapFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setMapFilter(f.id)}
              style={{
                padding: '4px 8px',
                fontSize: '0.68rem',
                borderRadius: '4px',
                border: isActive ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                backgroundColor: isActive ? 'var(--accent-dim)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: isActive ? 700 : 500
              }}
            >
              {f.label}
            </button>
          );
        })}

        {/* Legend Notice for Inferred Route */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, fontSize: '0.64rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '12px', height: '2px', borderTop: '2px solid #B58A45', display: 'inline-block' }} />
            <span>Recorded Sighting</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '14px', height: '2px', borderTop: '2px dashed #5B7C99', display: 'inline-block' }} />
            <span style={{ color: '#5B7C99' }}>Inferred Route</span>
          </div>
        </div>
      </div>

    </div>
  );
}
