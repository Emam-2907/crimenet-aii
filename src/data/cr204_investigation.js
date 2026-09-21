/**
 * CRIMENET AI - Unified Typed Investigation Dataset (CR-204)
 * ONE INVESTIGATION -> ONE SHARED DATA MODEL -> EVERY MODULE UPDATES TOGETHER.
 *
 * Synthetic fixture:
 * CR-204 (Theft) -> P-017 -> FM-042 -> CCTV-04 -> L-08 -> V-102 -> CCTV-07 -> CCTV-11 -> INC-204 (at L-12).
 *
 * Truthfulness Principles:
 * - Direct observations are distinct from inferences.
 * - Biometric matches are probabilistic candidates requiring human review.
 * - Vehicle movement is directly observed only at camera points; connecting paths are inferred.
 * - CCTV is strictly labeled DEMO FEED.
 * - Information gaps and conflicting records are explicitly modeled.
 */

export const cr204InvestigationData = {
  case_id: "CR-204",
  title: "CR-204: JNPT Nhava Sheva Terminal Infiltration & Container Breach (FIR No. 204/2026)",
  classification: "RESTRICTED // SYNTHETIC CASE DEMO",
  case_type: "Organized Syndicate Cargo Theft",
  status: "ACTIVE_INVESTIGATION",
  priority: "High",
  lead_investigator: "Special Agent Marcus Vance",
  created_at: "2026-09-18T13:45:00Z",
  description: "Synthetic investigation into container breach and hardware extraction at JNPT Logistics Depot Gate 4 under FIR No. 204/2026 (IPC 379/420/120B, IT Act 66D). Valued at ₹42.5 Lakhs. Involves vehicle V-102 and person of interest P-017.",

  // 1. Entities Registry (including full CCTV-01..12 camera network)
  entities: {
    "CR-204": {
      id: "CR-204",
      type: "case",
      name: "Case CR-204: South Pier Cargo Theft",
      category: "Investigation",
      threat_level: "HIGH",
      status: "ACTIVE",
      details: "Central investigation dossier. Multi-agency task force case."
    },
    "P-017": {
      id: "P-017",
      type: "person",
      name: "Elena Rostov (Alias: Valkyrie)",
      category: "Person of Interest",
      threat_level: "HIGH",
      alias: "Valkyrie / CipherQueen",
      syndicate: "GhostNet Logistics",
      status: "SURVEILLANCE_LEAD",
      details: "Identified as a potential biometric match to CCTV-04 capture. Known financial broker and logistics operative.",
      mugshot_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      biometrics_hash: "c4d1982ab78912ef",
      related_cameras: ["CCTV-04"]
    },
    "FM-042": {
      id: "FM-042",
      type: "face_match",
      name: "Biometric Candidate Match FM-042",
      model_name: "ArcFace-ResNet50 v2.4",
      timestamp: "2026-09-18T14:09:12Z",
      time_formatted: "14:09 UTC",
      source_camera: "CCTV-04",
      source_evidence_id: "EVID-CCTV-04",
      similarity_score: 0.87,
      similarity_percentage: "87%",
      candidate_id: "P-017",
      candidate_name: "Elena Rostov",
      claim_status: "POTENTIAL_MATCH",
      verification_status: "UNDER_REVIEW",
      truthfulness_label: "Potential Match · 87% Model Similarity · Under Review · Human Verification Required",
      human_review_status: "PENDING_VERIFICATION",
      review_statement: "Potential match identified. Model similarity: 87%; human verification required before any tactical action. Never treat similarity as confirmed identity.",
      limitations: "Single-frame off-axis capture (yaw -18.4 deg). Ambient infrared lighting variance 14.2%. Landmark confidence: 0.812.",
      reticle: { x: 42, y: 31, w: 24, h: 32 }
    },

    // ── All 12 Synthetic Cameras ──────────────────────────────────────────
    "CCTV-01": {
      id: "CCTV-01",
      cameraId: "CCTV-01",
      type: "camera",
      name: "CCTV-01: Port North Gate Entry Gantry",
      latitude: 40.7165,
      longitude: -74.0080,
      lat: 40.7165,
      lng: -74.0080,
      status: "ONLINE",
      locationId: "L-01",
      location_id: "L-01",
      location_name: "L-01: Port North Gate",
      coverageRadius: 85,
      resolution: "1080p Optical",
      feed_label: "DEMO FEED",
      frame_image: "https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=600&q=80",
      events: [
        { time: "13:50", title: "Port security patrol checkpoint clear", type: "SECURITY" },
        { time: "14:05", title: "Commercial freight convoy ingress logged", type: "VEHICLE" }
      ],
      relatedPersons: [],
      relatedVehicles: ["V-088"],
      relatedFaceMatches: [],
      relatedIncidents: [],
      caseIds: ["CR-204"]
    },

    "CCTV-02": {
      id: "CCTV-02",
      cameraId: "CCTV-02",
      type: "camera",
      name: "CCTV-02: Container Yard Sector 1 Access",
      latitude: 40.7150,
      longitude: -74.0075,
      lat: 40.7150,
      lng: -74.0075,
      status: "ONLINE",
      locationId: "L-02",
      location_id: "L-02",
      location_name: "L-02: Container Yard 1",
      coverageRadius: 95,
      resolution: "4K Optical",
      feed_label: "DEMO FEED",
      frame_image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
      events: [
        { time: "13:55", title: "Automated container stacker movement logged", type: "LOGISTICS" },
        { time: "14:08", title: "Perimeter motion sensor check passed", type: "SYSTEM" }
      ],
      relatedPersons: [],
      relatedVehicles: [],
      relatedFaceMatches: [],
      relatedIncidents: [],
      caseIds: ["CR-204"]
    },

    "CCTV-03": {
      id: "CCTV-03",
      cameraId: "CCTV-03",
      type: "camera",
      name: "CCTV-03: West Perimeter Fence Relay",
      latitude: 40.7115,
      longitude: -74.0085,
      lat: 40.7115,
      lng: -74.0085,
      status: "WARNING",
      locationId: "L-03",
      location_id: "L-03",
      location_name: "L-03: West Perimeter",
      coverageRadius: 75,
      resolution: "1080p IR",
      feed_label: "DEMO FEED",
      frame_image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80",
      events: [
        { time: "13:42", title: "Signal jitter detected on microwave relay link", type: "WARNING" },
        { time: "14:01", title: "Infrared illuminator power fluctuating", type: "MAINTENANCE" }
      ],
      relatedPersons: [],
      relatedVehicles: [],
      relatedFaceMatches: [],
      relatedIncidents: [],
      caseIds: ["CR-204"]
    },

    "CCTV-04": {
      id: "CCTV-04",
      cameraId: "CCTV-04",
      type: "camera",
      name: "CCTV-04: Port Gate 4 South Relay",
      latitude: 40.7128,
      longitude: -74.0060,
      lat: 40.7128,
      lng: -74.0060,
      status: "ONLINE",
      locationId: "L-08",
      location_id: "L-08",
      location_name: "L-08: South Pier Depot - Gate 4",
      coverageRadius: 85,
      resolution: "1080p IR",
      feed_label: "DEMO FEED",
      frame_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
      events: [
        { time: "14:02", title: "Vehicle V-102 detected entering Gate 4", type: "VEHICLE", entityId: "V-102" },
        { time: "14:07", title: "Unidentified person detected at turnstile", type: "PERSON" },
        { time: "14:09", title: "Potential face match FM-042 identified (87%)", type: "FACE_MATCH", entityId: "FM-042" },
        { time: "14:11", title: "Vehicle V-102 departs coverage heading East", type: "VEHICLE", entityId: "V-102" }
      ],
      relatedPersons: ["P-017"],
      relatedVehicles: ["V-102"],
      relatedFaceMatches: ["FM-042"],
      relatedIncidents: ["INC-204"],
      caseIds: ["CR-204"],
      evidence_id: "EVID-CCTV-04"
    },

    "CCTV-05": {
      id: "CCTV-05",
      cameraId: "CCTV-05",
      type: "camera",
      name: "CCTV-05: Berth 3 Cargo Loading Crane",
      latitude: 40.7105,
      longitude: -74.0050,
      lat: 40.7105,
      lng: -74.0050,
      status: "MAINTENANCE",
      locationId: "L-05",
      location_id: "L-05",
      location_name: "L-05: Berth 3 Crane Dock",
      coverageRadius: 110,
      resolution: "4K Optical",
      feed_label: "DEMO FEED",
      frame_image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
      events: [
        { time: "12:30", title: "Scheduled lens calibration in progress", type: "MAINTENANCE" }
      ],
      relatedPersons: [],
      relatedVehicles: [],
      relatedFaceMatches: [],
      relatedIncidents: [],
      caseIds: ["CR-204"]
    },

    "CCTV-06": {
      id: "CCTV-06",
      cameraId: "CCTV-06",
      type: "camera",
      name: "CCTV-06: Customs Inspection Yard 4A",
      latitude: 40.7135,
      longitude: -74.0045,
      lat: 40.7135,
      lng: -74.0045,
      status: "ONLINE",
      locationId: "L-06",
      location_id: "L-06",
      location_name: "L-06: Customs Yard 4A",
      coverageRadius: 80,
      resolution: "1080p Optical",
      feed_label: "DEMO FEED",
      frame_image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80",
      events: [
        { time: "13:48", title: "Customs seal inspection scan cleared", type: "CUSTOMS" },
        { time: "14:10", title: "Yard lane 3 clear of obstruction", type: "STATUS" }
      ],
      relatedPersons: [],
      relatedVehicles: [],
      relatedFaceMatches: [],
      relatedIncidents: [],
      caseIds: ["CR-204"]
    },

    "CCTV-07": {
      id: "CCTV-07",
      cameraId: "CCTV-07",
      type: "camera",
      name: "CCTV-07: Pier Corridor East Fixed Relay",
      latitude: 40.7145,
      longitude: -74.0035,
      lat: 40.7145,
      lng: -74.0035,
      status: "ONLINE",
      locationId: "L-10",
      location_id: "L-10",
      location_name: "L-10: Pier Corridor East",
      coverageRadius: 95,
      resolution: "4K Optical",
      feed_label: "DEMO FEED",
      frame_image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80",
      events: [
        { time: "14:15", title: "Vehicle V-102 re-detected heading East", type: "VEHICLE", entityId: "V-102" }
      ],
      relatedPersons: [],
      relatedVehicles: ["V-102"],
      relatedFaceMatches: [],
      relatedIncidents: ["INC-204"],
      caseIds: ["CR-204"],
      evidence_id: "EVID-CCTV-07-1415"
    },

    "CCTV-08": {
      id: "CCTV-08",
      cameraId: "CCTV-08",
      type: "camera",
      name: "CCTV-08: South Gantry Rail Siding",
      latitude: 40.7110,
      longitude: -74.0020,
      lat: 40.7110,
      lng: -74.0020,
      status: "OFFLINE",
      locationId: "L-08B",
      location_id: "L-08B",
      location_name: "L-08B: South Rail Siding",
      coverageRadius: 70,
      resolution: "1080p IR",
      feed_label: "DEMO FEED",
      frame_image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
      events: [
        { time: "11:15", title: "Power feed interruption: zero telemetry", type: "OFFLINE" }
      ],
      relatedPersons: [],
      relatedVehicles: [],
      relatedFaceMatches: [],
      relatedIncidents: [],
      caseIds: ["CR-204"]
    },

    "CCTV-09": {
      id: "CCTV-09",
      cameraId: "CCTV-09",
      type: "camera",
      name: "CCTV-09: Terminal Fueling Depot Access",
      latitude: 40.7155,
      longitude: -74.0018,
      lat: 40.7155,
      lng: -74.0018,
      status: "ONLINE",
      locationId: "L-09",
      location_id: "L-09",
      location_name: "L-09: Fueling Depot",
      coverageRadius: 85,
      resolution: "1080p Optical",
      feed_label: "DEMO FEED",
      frame_image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
      events: [
        { time: "13:58", title: "Fuel transport tanker departed depot", type: "VEHICLE" },
        { time: "14:12", title: "Access barrier closed and locked", type: "STATUS" }
      ],
      relatedPersons: [],
      relatedVehicles: [],
      relatedFaceMatches: [],
      relatedIncidents: [],
      caseIds: ["CR-204"]
    },

    "CCTV-10": {
      id: "CCTV-10",
      cameraId: "CCTV-10",
      type: "camera",
      name: "CCTV-10: Central Rail Interchange Junction",
      latitude: 40.7170,
      longitude: -74.0030,
      lat: 40.7170,
      lng: -74.0030,
      status: "WARNING",
      locationId: "L-10B",
      location_id: "L-10B",
      location_name: "L-10B: Rail Interchange",
      coverageRadius: 100,
      resolution: "4K Optical",
      feed_label: "DEMO FEED",
      frame_image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=600&q=80",
      events: [
        { time: "14:14", title: "Track switcher sensor discrepancy reported", type: "WARNING" }
      ],
      relatedPersons: [],
      relatedVehicles: [],
      relatedFaceMatches: [],
      relatedIncidents: [],
      caseIds: ["CR-204"]
    },

    "CCTV-11": {
      id: "CCTV-11",
      cameraId: "CCTV-11",
      type: "camera",
      name: "CCTV-11: Industrial Access Spur North Relay",
      latitude: 40.7180,
      longitude: -74.0010,
      lat: 40.7180,
      lng: -74.0010,
      status: "ONLINE",
      locationId: "L-12",
      location_id: "L-12",
      location_name: "L-12: Warehouse 14B Spur",
      coverageRadius: 90,
      resolution: "1080p Optical",
      feed_label: "DEMO FEED",
      frame_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
      events: [
        { time: "14:18", title: "Monitoring Warehouse 14B perimeter breach alarm", type: "INCIDENT", entityId: "INC-204" }
      ],
      relatedPersons: [],
      relatedVehicles: ["V-102"],
      relatedFaceMatches: [],
      relatedIncidents: ["INC-204"],
      caseIds: ["CR-204"],
      evidence_id: "EVID-INC-204-ALARM"
    },

    "CCTV-12": {
      id: "CCTV-12",
      cameraId: "CCTV-12",
      type: "camera",
      name: "CCTV-12: Warehouse 14B Perimeter Gate",
      latitude: 40.7192,
      longitude: -73.9995,
      lat: 40.7192,
      lng: -73.9995,
      status: "ONLINE",
      locationId: "L-12B",
      location_id: "L-12B",
      location_name: "L-12B: Warehouse 14B Gate",
      coverageRadius: 85,
      resolution: "1080p Optical",
      feed_label: "DEMO FEED",
      frame_image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
      events: [
        { time: "14:19", title: "Automated perimeter security spotlight triggered", type: "ALARM" }
      ],
      relatedPersons: [],
      relatedVehicles: [],
      relatedFaceMatches: [],
      relatedIncidents: ["INC-204"],
      caseIds: ["CR-204"]
    },

    // ── Locations & Incidents ─────────────────────────────────────────────
    "L-08": {
      id: "L-08",
      type: "location",
      name: "Location L-08: South Pier Logistics Depot - Gate 4",
      address: "Gate 4, Sector 4 South Pier Terminal, Metro Port",
      lat: 40.7128,
      lng: -74.0060,
      latitude: 40.7128,
      longitude: -74.0060,
      zone_type: "Restricted Port Access Depot"
    },
    "L-10": {
      id: "L-10",
      type: "location",
      name: "Location L-10: Pier Corridor East Terminal Arterial",
      address: "Sector 4 Eastbound arterial road",
      lat: 40.7145,
      lng: -74.0035,
      latitude: 40.7145,
      longitude: -74.0035,
      zone_type: "High-Volume Freight Corridor"
    },
    "L-12": {
      id: "L-12",
      type: "location",
      name: "Location L-12: Warehouse 14B North Cargo Bay",
      address: "Warehouse 14B, Industrial Access Spur, Sector 4",
      lat: 40.7180,
      lng: -74.0010,
      latitude: 40.7180,
      longitude: -74.0010,
      zone_type: "Secure Bonded Cargo Facility"
    },
    "V-102": {
      id: "V-102",
      type: "vehicle",
      name: "Vehicle V-102: Black Full-Size SUV",
      make_model: "Cadillac Escalade (Black Matte)",
      plate: "NY-889XQ",
      vin_snippet: "*7829-K",
      category: "Transit Asset",
      status: "SIGHTED_IN_TRANSIT",
      details: "Observed at CCTV-04 (14:02) and CCTV-07 (14:15). Route between detections is inferred from corridor geography.",
      recorded_detections: [
        { cameraId: "CCTV-04", time: "14:02 UTC", lat: 40.7128, lng: -74.0060, type: "RECORDED_DETECTION" },
        { cameraId: "CCTV-07", time: "14:15 UTC", lat: 40.7145, lng: -74.0035, type: "RECORDED_DETECTION" },
        { cameraId: "CCTV-11", time: "14:18 UTC", lat: 40.7180, lng: -74.0010, type: "RECORDED_DETECTION" }
      ]
    },
    "INC-204": {
      id: "INC-204",
      type: "incident",
      name: "Incident INC-204: Warehouse 14B Breach & Manifest Alarm",
      category: "Tactical Alarm Event",
      timestamp: "2026-09-18T14:18:00Z",
      time_formatted: "14:18 UTC",
      location_id: "L-12",
      threat_level: "CRITICAL",
      details: "Forced entry sensor triggered at Warehouse 14B cargo bay door 3. Discrepancy logged on electronic manifest M-902.",
      lat: 40.7180,
      lng: -74.0010,
      latitude: 40.7180,
      longitude: -74.0010
    },
    "WALLET-SIM-889": {
      id: "WALLET-SIM-889",
      type: "financial",
      name: "Synthetic Escrow Node: WALLET-SIM-889",
      category: "Financial Ledger",
      threat_level: "HIGH",
      status: "FROZEN_RECORD",
      details: "Simulated escrow disbursement ledger node: WALLET-SIM-889. Linked to ₹42.5 Lakhs payoff trail under IT Act 66D.",
      amount: "₹42.5 Lakhs",
      currency: "INR"
    },
    "EVID-CCTV-04": {
      id: "EVID-CCTV-04",
      type: "evidence",
      name: "Synthetic Evidence: EVID-CCTV-04 (Frame Extraction)",
      category: "Visual Evidence",
      threat_level: "EVIDENCE",
      status: "LOGGED",
      details: "Surveillance visual frame extracted from CCTV-04 at 14:09:12 UTC. Reference asset for biometric candidate evaluation.",
      timestamp: "2026-09-18T14:09:12Z"
    },
    "TEL-017": {
      id: "TEL-017",
      type: "telemetry",
      name: "Synthetic Telemetry Relay: RF-SIM-921",
      category: "Telecom Intercept",
      threat_level: "MEDIUM",
      status: "LOGGED",
      details: "Simulated cellular tower handshake (+91-9820112233) logged at JNPT Sector 4 tower during transit window.",
      phone_number: "+91-9820112233"
    },
    "ORG-SIM-GHOST": {
      id: "ORG-SIM-GHOST",
      type: "organization",
      name: "Simulated Syndicate Group: GhostNet Logistics",
      category: "Syndicate Entity",
      threat_level: "CRITICAL",
      status: "UNDER_MONITORING",
      details: "Fictional logistics syndicate cluster coordinating unauthorized container breaches across western corridor."
    }
  },

  // 2. Relations (Graph Edges)
  relations: [
    {
      id: "rel-cr204-1",
      source: "CR-204",
      target: "P-017",
      label: "PRIMARY_SUSPECT",
      type: "association",
      confidence: 0.85,
      details: "Suspect in active investigation docket CR-204 under FIR No. 204/2026."
    },
    {
      id: "rel-cr204-2",
      source: "CR-204",
      target: "V-102",
      label: "FLAGGED_TRANSPORT",
      type: "vehicle",
      confidence: 0.92,
      details: "Vehicle V-102 tagged leaving Gate 4 perimeter with suspected extracted cargo."
    },
    {
      id: "rel-cr204-3",
      source: "CR-204",
      target: "INC-204",
      label: "PRIMARY_INCIDENT",
      type: "incident",
      confidence: 1.0,
      details: "Core physical breach triggering investigation docket FIR No. 204/2026."
    },
    {
      id: "rel-cr204-4",
      source: "CR-204",
      target: "EVID-CCTV-04",
      label: "DOCKET_EVIDENCE",
      type: "evidence",
      confidence: 1.0,
      details: "Primary surveillance visual extraction logged into evidence registry."
    },
    {
      id: "rel-cr204-5",
      source: "CR-204",
      target: "ORG-SIM-GHOST",
      label: "INVESTIGATED_SYNDICATE",
      type: "association",
      confidence: 0.88,
      details: "Syndicate cluster orchestrating high-value cargo breach across maritime corridor."
    },
    {
      id: "rel-cr204-6",
      source: "P-017",
      target: "FM-042",
      label: "BIOMETRIC_CANDIDATE",
      type: "biometric",
      confidence: 0.87,
      details: "Synthetic visual candidate match identified. Model similarity: 87%; human verification required."
    },
    {
      id: "rel-cr204-7",
      source: "P-017",
      target: "ORG-SIM-GHOST",
      label: "AFFILIATED_OPERATIVE",
      type: "association",
      confidence: 0.82,
      details: "Encrypted communication links connect operative to GhostNet coordination hub."
    },
    {
      id: "rel-cr204-8",
      source: "P-017",
      target: "WALLET-SIM-889",
      label: "ESCROW_COUNTERPARTY",
      type: "financial",
      confidence: 0.91,
      details: "Disbursement of ₹42.5 Lakhs escrow settlement traced to digital wallet WALLET-SIM-889."
    },
    {
      id: "rel-cr204-9",
      source: "P-017",
      target: "TEL-017",
      label: "TELEMETRY_HANDSHAKE",
      type: "telemetry",
      confidence: 0.79,
      details: "Radio frequency cell tower handshake recorded coincident with Gate 4 arrival."
    },
    {
      id: "rel-cr204-10",
      source: "FM-042",
      target: "CCTV-04",
      label: "CAPTURED_BY",
      type: "evidence",
      confidence: 0.95,
      details: "Biometric face frame extracted from CCTV-04 footage at 14:09 UTC."
    },
    {
      id: "rel-cr204-11",
      source: "FM-042",
      target: "EVID-CCTV-04",
      label: "EXTRACTION_SOURCE",
      type: "evidence",
      confidence: 0.98,
      details: "Source file reference for biometric candidate evaluation."
    },
    {
      id: "rel-cr204-12",
      source: "CCTV-04",
      target: "L-08",
      label: "LOCATED_AT",
      type: "location",
      confidence: 1.0,
      details: "Physical camera asset mounted on Gate 4 gantry post."
    },
    {
      id: "rel-cr204-13",
      source: "V-102",
      target: "CCTV-04",
      label: "RECORDED_BY",
      type: "vehicle",
      confidence: 0.96,
      details: "Direct optical observation of V-102 entering Gate 4 depot at 14:02 UTC."
    },
    {
      id: "rel-cr204-14",
      source: "L-08",
      target: "V-102",
      label: "TRANSIT_PASS",
      type: "transit",
      confidence: 0.94,
      details: "Vehicle passed security barrier at Gate 4 at 14:02 UTC."
    },
    {
      id: "rel-cr204-15",
      source: "V-102",
      target: "L-10",
      label: "INFERRED_CORRIDOR",
      type: "inferred",
      confidence: 0.84,
      details: "Transit along Pier Corridor East inferred based on timing and roadway topography."
    },
    {
      id: "rel-cr204-16",
      source: "L-10",
      target: "CCTV-07",
      label: "MONITORED_BY",
      type: "location",
      confidence: 1.0,
      details: "CCTV-07 covers the central eastbound lane of Pier Corridor East."
    },
    {
      id: "rel-cr204-17",
      source: "V-102",
      target: "CCTV-07",
      label: "RECORDED_BY",
      type: "vehicle",
      confidence: 0.94,
      details: "Direct optical observation of V-102 travelling eastbound at 14:15 UTC."
    },
    {
      id: "rel-cr204-18",
      source: "V-102",
      target: "CCTV-11",
      label: "INFERRED_TRAJECTORY",
      type: "inferred",
      confidence: 0.68,
      details: "V-102 was recorded at CCTV-04 and later at CCTV-07. The path to CCTV-11 is an inferred demo trajectory."
    },
    {
      id: "rel-cr204-19",
      source: "CCTV-11",
      target: "L-12",
      label: "PERIMETER_SURVEILLANCE",
      type: "location",
      confidence: 1.0,
      details: "CCTV-11 monitors the access spur leading directly into Warehouse 14B."
    },
    {
      id: "rel-cr204-20",
      source: "CCTV-11",
      target: "INC-204",
      label: "ALARM_PROXIMITY",
      type: "association",
      confidence: 0.88,
      details: "Camera CCTV-11 field of view covers the exterior door associated with breach alarm INC-204."
    },
    {
      id: "rel-cr204-21",
      source: "INC-204",
      target: "L-12",
      label: "OCCURRED_AT",
      type: "location",
      confidence: 1.0,
      details: "Perimeter breach alarm tripped at Warehouse 14B North Cargo Bay at 14:18 UTC."
    },
    {
      id: "rel-cr204-22",
      source: "CCTV-12",
      target: "L-12",
      label: "FACILITY_GATE_MONITOR",
      type: "location",
      confidence: 1.0,
      details: "Perimeter gate surveillance covering northern boundary of Warehouse 14B."
    },
    {
      id: "rel-cr204-23",
      source: "CCTV-01",
      target: "L-08",
      label: "NORTH_GATE_INGRESS",
      type: "location",
      confidence: 0.9,
      details: "Entry gantry monitor linking north perimeter traffic toward Sector 4 logistics depot."
    },
    {
      id: "rel-cr204-24",
      source: "CCTV-02",
      target: "L-08",
      label: "YARD_FEEDER_LINK",
      type: "location",
      confidence: 0.85,
      details: "Sector 1 container yard camera feeding traffic toward Gate 4."
    },
    {
      id: "rel-cr204-25",
      source: "CCTV-03",
      target: "L-08",
      label: "WEST_PERIMETER_LINK",
      type: "location",
      confidence: 0.8,
      details: "West fence line camera adjacent to Gate 4 logistics perimeter."
    },
    {
      id: "rel-cr204-26",
      source: "CCTV-06",
      target: "L-10",
      label: "CUSTOMS_YARD_FEEDER",
      type: "location",
      confidence: 0.86,
      details: "Customs inspection yard relay adjacent to Pier Corridor East arterial."
    },
    {
      id: "rel-cr204-27",
      source: "CCTV-09",
      target: "L-10",
      label: "FUELING_DEPOT_JUNCTION",
      type: "location",
      confidence: 0.84,
      details: "Fueling depot camera monitoring vehicles turning onto Pier Corridor East."
    },
    {
      id: "rel-cr204-28",
      source: "CCTV-10",
      target: "L-12",
      label: "RAIL_SPUR_INTERCHANGE",
      type: "location",
      confidence: 0.87,
      details: "Rail interchange camera monitoring cargo spur adjacent to Warehouse 14B."
    }
  ],

  // 3. Chronological Investigation Timeline
  timeline: [
    {
      id: "EVT-01",
      time: "14:02",
      iso_timestamp: "2026-09-18T14:02:00Z",
      title: "Vehicle V-102 Detected at Gate 4 Checkpoint",
      claim_type: "OBSERVATION",
      certainty: "DIRECT_OBSERVATION",
      entity_ids: ["V-102", "CCTV-04", "L-08"],
      location_id: "L-08",
      camera_id: "CCTV-04",
      summary: "Black SUV V-102 (plate NY-889XQ) entered Gate 4 checkpoint. Solid ALPR lock established.",
      evidence_id: "EVID-ALPR-1402",
      notes: "Direct sensor detection."
    },
    {
      id: "EVT-02",
      time: "14:07",
      iso_timestamp: "2026-09-18T14:07:00Z",
      title: "Unidentified Person Detected at Turnstile",
      claim_type: "OBSERVATION",
      certainty: "DIRECT_OBSERVATION",
      entity_ids: ["CCTV-04", "L-08"],
      location_id: "L-08",
      camera_id: "CCTV-04",
      summary: "Individual wearing dark jacket and tactical cap passed through Gate 4 pedestrian turnstile.",
      evidence_id: "EVID-CCTV-04-1407",
      notes: "Direct sensor detection. Subject looked toward camera gantry."
    },
    {
      id: "EVT-03",
      time: "14:09",
      iso_timestamp: "2026-09-18T14:09:12Z",
      title: "Potential Face Match FM-042 Identified (87% Similarity)",
      claim_type: "POTENTIAL_MATCH",
      certainty: "PROBABILISTIC_INFERENCE",
      entity_ids: ["FM-042", "P-017", "CCTV-04", "L-08"],
      location_id: "L-08",
      camera_id: "CCTV-04",
      summary: "Biometric model matched CCTV-04 frame against Elena Rostov (P-017) at 87% confidence. Human verification required.",
      evidence_id: "EVID-CCTV-04",
      notes: "Potential match identified. Model similarity: 87%; human verification required. Under Review."
    },
    {
      id: "EVT-04",
      time: "14:11",
      iso_timestamp: "2026-09-18T14:11:00Z",
      title: "Vehicle V-102 Leaves CCTV-04 Coverage",
      claim_type: "OBSERVATION",
      certainty: "DIRECT_OBSERVATION",
      entity_ids: ["V-102", "CCTV-04", "L-08"],
      location_id: "L-08",
      camera_id: "CCTV-04",
      summary: "V-102 departed Gate 4 perimeter heading East. Last direct line-of-sight frame logged at 14:11:08 UTC.",
      evidence_id: "EVID-CCTV-04-1411",
      notes: "Subsequent path is inferred."
    },
    {
      id: "EVT-05",
      time: "14:15",
      iso_timestamp: "2026-09-18T14:15:00Z",
      title: "Vehicle V-102 Re-detected at CCTV-07",
      claim_type: "OBSERVATION",
      certainty: "DIRECT_OBSERVATION",
      entity_ids: ["V-102", "CCTV-07"],
      location_id: "L-10",
      camera_id: "CCTV-07",
      summary: "V-102 detected at CCTV-07 eastbound corridor. Route between CCTV-04 and CCTV-07 is inferred.",
      evidence_id: "EVID-CCTV-07-1415",
      notes: "Direct detection at camera position only."
    },
    {
      id: "EVT-06",
      time: "14:18",
      iso_timestamp: "2026-09-18T14:18:00Z",
      title: "Related Incident INC-204: Warehouse 14B Breach",
      claim_type: "OBSERVATION",
      certainty: "CONFIRMED_FACT",
      entity_ids: ["INC-204", "L-12", "CCTV-11"],
      location_id: "L-12",
      camera_id: "CCTV-11",
      summary: "Automated alarm at Warehouse 14B (L-12) triggered. Discrepancy logged on electronic manifest M-902.",
      evidence_id: "EVID-INC-204-ALARM",
      notes: "Confirmed incident dispatch event."
    }
  ],

  // 4. Evidence Catalog
  evidence: [
    {
      id: "EVID-CCTV-04",
      name: "Gate 4 South High-Res CCTV Frame 14:09",
      type: "CCTV Footage (DEMO FEED)",
      category: "Images",
      case_id: "CR-204",
      timestamp: "2026-09-18T14:09:12Z",
      upload_date: "2026-09-18 14:12 UTC",
      file_size: "3.4 MB",
      source: "Port Authority CCTV Server (Sector 4)",
      related_entities: ["FM-042", "P-017", "CCTV-04", "L-08"],
      supporting_info: "Clear optical IR frame of subject entering turnstile with partial facial view.",
      conflicting_info: "Subject wore a visor cap creating partial nasal shadow (14.2% variance).",
      verification_status: "UNDER_REVIEW",
      truth_label: "Evidence item - Corroboration required. Not proof of guilt."
    },
    {
      id: "EVID-ALPR-1402",
      name: "Gate 4 Checkpoint ALPR Entry Log",
      type: "Automated License Plate Recognition",
      category: "Documents",
      case_id: "CR-204",
      timestamp: "2026-09-18T14:02:00Z",
      upload_date: "2026-09-18 14:03 UTC",
      file_size: "42 KB",
      source: "Terminal Access Control System",
      related_entities: ["V-102", "L-08"],
      supporting_info: "Plate NY-889XQ matched black SUV entering facility.",
      conflicting_info: "Witness W-03 claimed seeing a blue sedan at 14:05 (unverified).",
      verification_status: "VERIFIED_OBSERVATION",
      truth_label: "Direct sensor detection log."
    },
    {
      id: "EVID-CCTV-07-1415",
      name: "Corridor East Fixed Camera Frame 14:15",
      type: "CCTV Footage (DEMO FEED)",
      category: "Images",
      case_id: "CR-204",
      timestamp: "2026-09-18T14:15:00Z",
      upload_date: "2026-09-18 14:16 UTC",
      file_size: "4.1 MB",
      source: "East Corridor Traffic Relay",
      related_entities: ["V-102", "CCTV-07"],
      supporting_info: "Black SUV with matching silhouette and plate recorded eastbound.",
      conflicting_info: "No continuous tracking between 14:11 and 14:15.",
      verification_status: "VERIFIED_OBSERVATION",
      truth_label: "Direct point observation; path is inferred."
    },
    {
      id: "EVID-INC-204-ALARM",
      name: "Warehouse 14B SCADA Intrusion Alarm Telemetry",
      type: "Facility Alarm Log",
      category: "Documents",
      case_id: "CR-204",
      timestamp: "2026-09-18T14:18:00Z",
      upload_date: "2026-09-18 14:19 UTC",
      file_size: "18 KB",
      source: "Sector 4 Security Operations Center",
      related_entities: ["INC-204", "L-12", "CCTV-11"],
      supporting_info: "Magnetic contact sensor break on Cargo Bay Door 3 at 14:18:04 UTC.",
      conflicting_info: "Logistics Manifest #M-902 listed Warehouse 14B as inactive on 2026-09-18.",
      verification_status: "CONFIRMED_ALARM",
      truth_label: "Physical security sensor alarm."
    }
  ],

  // 5. Information Gaps & Conflicting Records
  information_gaps: [
    {
      id: "GAP-01",
      title: "3-Minute Surveillance Gap Along Industrial Access Road",
      time_window: "14:11 to 14:15 UTC",
      affected_entities: ["V-102", "CCTV-04", "CCTV-07"],
      description: "No camera coverage exists between CCTV-04 (14:11) and CCTV-07 (14:15). Continuous vehicle movement was not directly observed; path is inferred.",
      recommended_action: "Request private warehouse exterior footage along South Arterial Way."
    },
    {
      id: "GAP-02",
      title: "Unknown Driver Identity for V-102",
      time_window: "14:02 to 14:18 UTC",
      affected_entities: ["V-102"],
      description: "Heavy window tint on vehicle V-102 prevented optical identification of the driver or interior occupants from CCTV-04, CCTV-07, or CCTV-11.",
      recommended_action: "Subpoena toll plaza overhead optical flash records."
    }
  ],

  conflicting_records: [
    {
      id: "CONF-01",
      title: "Manifest Status vs. Physical Breach Alarm",
      record_a: "Logistics Manifest #M-902: Warehouse 14B designated 'INACTIVE / DORMANT' for 2026-09-18.",
      record_b: "Incident INC-204 Alarm: Door 3 magnetic sensor break and exhaust sensor spike at 14:18 UTC.",
      conflict_analysis: "Physical evidence shows active unauthorized intrusion into a facility administrative records claimed was closed.",
      status: "UNRESOLVED_DISCREPANCY"
    },
    {
      id: "CONF-02",
      title: "Witness W-03 Statement vs. ALPR Telemetry",
      record_a: "Witness statement W-03 reported seeing a 'blue foreign sedan' near Gate 4 at 14:05.",
      record_b: "ALPR Sensor Log EVID-ALPR-1402 only recorded black SUV V-102 entering Gate 4 at 14:02.",
      conflict_analysis: "Witness recollection conflicts with automated sensor telemetry. Witness report treated as uncorroborated lead.",
      status: "LOW_CONFIDENCE_WITNESS"
    }
  ],

  // 6. Map Corridors & Waypoints
  map_corridors: {
    observed_waypoints: [
      { id: "WP-01", name: "CCTV-04 Detection", lat: 40.7128, lng: -74.0060, time: "14:02", entity_id: "CCTV-04", style: "solid", label: "RECORDED DETECTION" },
      { id: "WP-02", name: "CCTV-07 Detection", lat: 40.7145, lng: -74.0035, time: "14:15", entity_id: "CCTV-07", style: "solid", label: "RECORDED DETECTION" },
      { id: "WP-03", name: "CCTV-11 / INC-204", lat: 40.7180, lng: -74.0010, time: "14:18", entity_id: "CCTV-11", style: "solid", label: "RECORDED DETECTION" }
    ],
    inferred_routes: [
      {
        id: "ROUTE-INFERRED-01",
        name: "Inferred Transit Path (CCTV-04 -> CCTV-07)",
        from_id: "CCTV-04",
        to_id: "CCTV-07",
        coordinates: [
          [-74.0060, 40.7128],
          [-74.0050, 40.7135],
          [-74.0035, 40.7145]
        ],
        style: "dashed",
        label: "INFERRED ROUTE",
        notice: "Inferred route based on street geometry. Continuous tracking was NOT observed."
      },
      {
        id: "ROUTE-INFERRED-02",
        name: "Inferred Transit Path (CCTV-07 -> CCTV-11)",
        from_id: "CCTV-07",
        to_id: "CCTV-11",
        coordinates: [
          [-74.0035, 40.7145],
          [-74.0022, 40.7160],
          [-74.0010, 40.7180]
        ],
        style: "dashed",
        label: "INFERRED ROUTE",
        notice: "Inferred route based on industrial access spur. Continuous tracking was NOT observed."
      }
    ]
  }
};
