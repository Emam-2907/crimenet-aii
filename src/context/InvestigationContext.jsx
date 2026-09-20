/**
 * CRIMENET AI - Central Investigation Context
 * ONE INVESTIGATION -> ONE SHARED DATA MODEL -> EVERY MODULE UPDATES TOGETHER.
 *
 * Context properties:
 * - activeCase
 * - selectedEntity
 * - selectedEntityType
 * - selectedPerson
 * - selectedFaceMatch
 * - selectedCamera
 * - selectedVehicle
 * - selectedLocation
 * - selectedTimelineEvent
 * - activeTimestamp
 * - activeFilters
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { cr204InvestigationData } from '../data/cr204_investigation.js';

const InvestigationContext = createContext(null);

export function InvestigationProvider({ children }) {
  // 1. Unified Dataset
  const [investigationData, setInvestigationData] = useState(cr204InvestigationData);
  const activeCase = investigationData;

  // 2. Coordinated Selection State
  const [selectedEntityId, setSelectedEntityId] = useState("FM-042");
  const [selectedEntityType, setSelectedEntityType] = useState("face_match");
  const [selectedTimelineEventId, setSelectedTimelineEventId] = useState("EVT-03"); // 14:09 potential face match
  const [activeTimestamp, setActiveTimestamp] = useState("14:09");
  const [activeFilters, setActiveFilters] = useState({ threat: "ALL", certainty: "ALL", module: "ALL" });

  // 3. Derived active entities from single source of truth
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

    // Auto-synchronize timeline timestamp based on entity relevance
    if (entityId === "FM-042" || entityId === "P-017") {
      setActiveTimestamp("14:09");
      setSelectedTimelineEventId("EVT-03");
    } else if (entityId === "V-102") {
      // Default to first sighting at CCTV-04
      setActiveTimestamp("14:02");
      setSelectedTimelineEventId("EVT-01");
    } else if (entityId === "CCTV-04" || entityId === "L-08") {
      setActiveTimestamp("14:09");
      setSelectedTimelineEventId("EVT-03");
    } else if (entityId === "CCTV-07") {
      setActiveTimestamp("14:15");
      setSelectedTimelineEventId("EVT-05");
    } else if (entityId === "CCTV-11" || entityId === "INC-204" || entityId === "L-12") {
      setActiveTimestamp("14:18");
      setSelectedTimelineEventId("EVT-06");
    }
  }, [investigationData]);

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
    }
  }, [investigationData]);

  const updateFilters = useCallback((newFilters) => {
    setActiveFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetSelection = useCallback(() => {
    setSelectedEntityId("FM-042");
    setSelectedEntityType("face_match");
    setSelectedTimelineEventId("EVT-03");
    setActiveTimestamp("14:09");
  }, []);

  return (
    <InvestigationContext.Provider value={{
      activeCase,
      investigationData,
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
      activeFilters,
      selectEntity,
      selectTimelineEvent,
      updateFilters,
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
