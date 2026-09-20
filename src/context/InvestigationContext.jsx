/**
 * CRIMENET AI - Central Investigation Context
 * ONE INVESTIGATION -> ONE SHARED DATA MODEL -> EVERY MODULE UPDATES TOGETHER.
 *
 * Context properties:
 * - activeCase
 * - investigationData
 * - allCameras (CCTV-01 to CCTV-12)
 * - selectedEntity, selectedEntityId, selectedEntityType
 * - selectedPerson (P-017)
 * - selectedFaceMatch (FM-042)
 * - selectedCamera (CCTV-04 or clicked camera)
 * - selectedVehicle (V-102)
 * - selectedLocation (L-08, L-10, L-12, etc.)
 * - selectedTimelineEvent
 * - activeTimestamp
 * - mapFilter, setMapFilter
 * - showCoverage, setShowCoverage
 * - mapFlyToTarget
 * - selectEntity, selectCamera, selectTimelineEvent, resetSelection
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { cr204InvestigationData } from '../data/cr204_investigation.js';

const InvestigationContext = createContext(null);

export function InvestigationProvider({ children }) {
  // 1. Unified Dataset
  const [investigationData, setInvestigationData] = useState(cr204InvestigationData);
  const activeCase = investigationData;

  // 2. Coordinated Selection State
  const [selectedEntityId, setSelectedEntityId] = useState("CCTV-04");
  const [selectedEntityType, setSelectedEntityType] = useState("camera");
  const [selectedTimelineEventId, setSelectedTimelineEventId] = useState("EVT-03"); // 14:09 potential face match
  const [activeTimestamp, setActiveTimestamp] = useState("14:09");

  // Map Controls State
  const [mapFilter, setMapFilter] = useState("ALL"); // ALL, ONLINE, OFFLINE, WARNING, CURRENT_CASE, SELECTED_PERSON, SELECTED_VEHICLE, FACE_EVENTS, INCIDENTS, COVERAGE
  const [showCoverage, setShowCoverage] = useState(true);
  const [mapFlyToTarget, setMapFlyToTarget] = useState(null); // { lng, lat, zoom }

  // 3. Derived active entities from single source of truth
  const allCameras = useMemo(() => {
    return Object.values(investigationData.entities).filter(e => e.type === "camera");
  }, [investigationData]);

  const selectedEntity = useMemo(() => {
    return investigationData.entities[selectedEntityId] || null;
  }, [investigationData, selectedEntityId]);

  const selectedPerson = useMemo(() => {
    if (selectedEntityType === "person") return selectedEntity;
    if (selectedEntityType === "face_match") {
      const candId = selectedEntity?.candidate_id || "P-017";
      return investigationData.entities[candId] || null;
    }
    return investigationData.entities["P-017"] || null;
  }, [selectedEntityType, selectedEntity, investigationData]);

  const selectedFaceMatch = useMemo(() => {
    if (selectedEntityType === "face_match") return selectedEntity;
    return investigationData.entities["FM-042"] || null;
  }, [selectedEntityType, selectedEntity, investigationData]);

  const selectedCamera = useMemo(() => {
    if (selectedEntityType === "camera") return selectedEntity;
    if (selectedEntityType === "face_match") {
      const camId = selectedEntity?.source_camera || "CCTV-04";
      return investigationData.entities[camId] || null;
    }
    if (selectedTimelineEventId === "EVT-05") return investigationData.entities["CCTV-07"] || null;
    if (selectedTimelineEventId === "EVT-06") return investigationData.entities["CCTV-11"] || null;
    return investigationData.entities["CCTV-04"] || null;
  }, [selectedEntityType, selectedEntity, selectedTimelineEventId, investigationData]);

  const selectedVehicle = useMemo(() => {
    if (selectedEntityType === "vehicle") return selectedEntity;
    return investigationData.entities["V-102"] || null;
  }, [selectedEntityType, selectedEntity, investigationData]);

  const selectedLocation = useMemo(() => {
    if (selectedEntityType === "location") return selectedEntity;
    if (selectedCamera?.location_id) {
      return investigationData.entities[selectedCamera.location_id] || null;
    }
    return investigationData.entities["L-08"] || null;
  }, [selectedEntityType, selectedEntity, selectedCamera, investigationData]);

  const selectedTimelineEvent = useMemo(() => {
    return investigationData.timeline.find(e => e.id === selectedTimelineEventId) || investigationData.timeline[2];
  }, [investigationData, selectedTimelineEventId]);

  // 4. Synchronized Selection Handlers
  const selectEntity = useCallback((entityId, entityTypeHint = null) => {
    if (!entityId) return;
    const targetEntity = investigationData.entities[entityId];
    const type = entityTypeHint || targetEntity?.type || "entity";

    setSelectedEntityId(entityId);
    setSelectedEntityType(type);

    // If target has coordinates, trigger map flyTo
    if (targetEntity?.lat !== undefined && targetEntity?.lng !== undefined) {
      setMapFlyToTarget({
        lng: targetEntity.lng || targetEntity.longitude,
        lat: targetEntity.lat || targetEntity.latitude,
        zoom: 16.5,
        entityId
      });
    }

    // Auto-synchronize timeline timestamp based on entity relevance
    if (entityId === "FM-042" || entityId === "P-017") {
      setActiveTimestamp("14:09");
      setSelectedTimelineEventId("EVT-03");
      const cam = investigationData.entities["CCTV-04"];
      if (cam) setMapFlyToTarget({ lng: cam.lng, lat: cam.lat, zoom: 16.5, entityId: "CCTV-04" });
    } else if (entityId === "V-102") {
      // Default to first sighting at CCTV-04
      setActiveTimestamp("14:02");
      setSelectedTimelineEventId("EVT-01");
      const cam = investigationData.entities["CCTV-04"];
      if (cam) setMapFlyToTarget({ lng: cam.lng, lat: cam.lat, zoom: 15.5, entityId: "V-102" });
    } else if (entityId === "CCTV-04" || entityId === "L-08") {
      setActiveTimestamp("14:09");
      setSelectedTimelineEventId("EVT-03");
    } else if (entityId === "CCTV-07" || entityId === "L-10") {
      setActiveTimestamp("14:15");
      setSelectedTimelineEventId("EVT-05");
    } else if (entityId === "CCTV-11" || entityId === "INC-204" || entityId === "L-12") {
      setActiveTimestamp("14:18");
      setSelectedTimelineEventId("EVT-06");
    }
  }, [investigationData]);

  const selectCamera = useCallback((cameraId) => {
    selectEntity(cameraId, "camera");
  }, [selectEntity]);

  const selectTimelineEvent = useCallback((eventId) => {
    const event = investigationData.timeline.find(e => e.id === eventId);
    if (!event) return;

    setSelectedTimelineEventId(eventId);
    setActiveTimestamp(event.time);

    // Automatically set primary entity to synchronize Graph, Map, CCTV, Evidence, CIRA
    if (event.entity_ids && event.entity_ids.length > 0) {
      const primaryId = event.entity_ids[0];
      const targetEntity = investigationData.entities[primaryId];
      setSelectedEntityId(primaryId);
      setSelectedEntityType(targetEntity?.type || "entity");

      if (event.camera_id && investigationData.entities[event.camera_id]) {
        const cam = investigationData.entities[event.camera_id];
        setMapFlyToTarget({ lng: cam.lng, lat: cam.lat, zoom: 16.5, entityId: cam.id });
      }
    }
  }, [investigationData]);

  // Inject newly ingested evidence (e.g. from Owner Footage Intake or CIRA)
  const injectIngestedEvidence = useCallback(({ camera, faceMatch, timelineEvent }) => {
    setInvestigationData(prev => {
      const newEntities = { ...prev.entities };
      const newRelations = [...(prev.relations || [])];
      const newTimeline = [...(prev.timeline || [])];

      if (camera && camera.id) {
        newEntities[camera.id] = camera;
      }
      if (faceMatch && faceMatch.id) {
        newEntities[faceMatch.id] = faceMatch;
      }
      if (timelineEvent && timelineEvent.id) {
        newTimeline.push(timelineEvent);
      }

      // Add relational links
      if (camera && faceMatch) {
        newRelations.push({
          id: `REL-${camera.id}-${faceMatch.id}`,
          type: 'CAPTURED_BY',
          source: faceMatch.id,
          target: camera.id,
          label: 'Captured Frame 14:12',
          certainty: 'OBSERVATION'
        });
      }

      return {
        ...prev,
        entities: newEntities,
        relations: newRelations,
        timeline: newTimeline
      };
    });

    if (camera) {
      setSelectedEntityId(camera.id);
      setSelectedEntityType('camera');
      setMapFlyToTarget({
        lng: camera.lng,
        lat: camera.lat,
        zoom: 16.5,
        entityId: camera.id
      });
    }
  }, []);

  const resetSelection = useCallback(() => {
    setSelectedEntityId("CCTV-04");
    setSelectedEntityType("camera");
    setSelectedTimelineEventId("EVT-03");
    setActiveTimestamp("14:09");
    const cam = investigationData.entities["CCTV-04"];
    if (cam) setMapFlyToTarget({ lng: cam.lng, lat: cam.lat, zoom: 15.2, entityId: "CCTV-04" });
  }, [investigationData]);

  return (
    <InvestigationContext.Provider value={{
      activeCase,
      investigationData,
      setInvestigationData,
      injectIngestedEvidence,
      allCameras,
      selectedEntity,
      selectedEntityId,
      selectedEntityType,
      selectedPerson,
      selectedFaceMatch,
      selectedCamera,
      selectedVehicle,
      selectedLocation,
      selectedTimelineEvent,
      selectedTimelineEventId,
      activeTimestamp,
      mapFilter,
      setMapFilter,
      showCoverage,
      setShowCoverage,
      mapFlyToTarget,
      setMapFlyToTarget,
      selectEntity,
      selectCamera,
      selectTimelineEvent,
      resetSelection
    }}>
      {children}
    </InvestigationContext.Provider>
  );
}

export const useInvestigation = () => {
  const ctx = useContext(InvestigationContext);
  if (!ctx) {
    throw new Error("useInvestigation must be used within an InvestigationProvider");
  }
  return ctx;
};
