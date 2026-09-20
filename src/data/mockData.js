// CrimeNet AI - Mock Data & Intelligence Feeds

export const INITIAL_INCIDENTS = [
  {
    id: "INC-8902",
    code: "CR-ALPHA-01",
    title: "Autonomous Ransomware Breach Detected",
    category: "Cyber Intrusion",
    severity: "CRITICAL",
    riskScore: 98,
    confidence: 99.4,
    location: "Sector Bravo (Metropolitan Banking Hub)",
    coordinates: "40.7128° N, 74.0060° W",
    timestamp: "Just now",
    timeAgo: "0m ago",
    cctvId: "CAM-NY-802B",
    status: "INTERCEPTING",
    suspect: {
      alias: "Cipher_Ghost",
      realName: "Viktor V. Chen (Probable)",
      threatLevel: "TIER 1 - INTERNATIONAL",
      priorOffenses: 14,
      dnaMatch: "99.1% Biometric Confidence",
      lastKnownVector: "Tor Gateway Node 185.220.101.4",
      associates: ["ZeroTrace", "Apex_Cell"],
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80"
    },
    description: "Multi-layered distributed breach initiated targeting Tier-1 automated treasury gateway. AI firewalls isolated ingress pipe; suspect routing payload via compromised municipal telemetry node.",
    actionRecommendation: "Deploy automated honeypot quarantine protocol; notify Cyber Defense Taskforce Unit 09."
  },
  {
    id: "INC-8901",
    code: "CR-DELTA-88",
    title: "Anomalous High-Speed Convoy Loitering",
    category: "Physical Security",
    severity: "HIGH",
    riskScore: 84,
    confidence: 96.8,
    location: "Sector Delta (Harbor Logistics Depot)",
    coordinates: "40.6892° N, 74.0445° W",
    timestamp: "2 mins ago",
    timeAgo: "2m ago",
    cctvId: "CAM-PORT-44C",
    status: "DISPATCHED",
    suspect: {
      alias: "The Vanguard Driver",
      realName: "Marek K. Rostov",
      threatLevel: "TIER 2 - HIGH RISK",
      priorOffenses: 7,
      dnaMatch: "94.8% Plate & Facial Match",
      lastKnownVector: "Black armored SUV - Plate: NY-889XQ",
      associates: ["K-Syndicate"],
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80"
    },
    description: "Thermal sensors flagged three unmarked reinforced vehicles entering restricted container yard after-hours. License plates match blacklisted contraband transit syndicate.",
    actionRecommendation: "Dispatch Sector Delta rapid response drones; activate harbor perimeter road spike grid."
  },
  {
    id: "INC-8900",
    code: "CR-ECHO-12",
    title: "Synthesized Biometric Identity Spoofing",
    category: "Identity Fraud",
    severity: "MODERATE",
    riskScore: 68,
    confidence: 94.2,
    location: "Sector Echo (International Terminal 4)",
    coordinates: "40.6413° N, 73.7781° W",
    timestamp: "7 mins ago",
    timeAgo: "7m ago",
    cctvId: "CAM-JFK-101A",
    status: "DETAINED",
    suspect: {
      alias: "Chameleon-9",
      realName: "Elena S. Thorne",
      threatLevel: "TIER 3 - MODERATE",
      priorOffenses: 3,
      dnaMatch: "89.4% Deepfake Artifact Match",
      lastKnownVector: "Automated e-Passport Gate 14",
      associates: ["ForgeNet"],
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80"
    },
    description: "3D neural depth scan at border e-gate flagged retinal micro-latency and generative facial texture distortion, preventing illegal entry with synthesized diplomat credentials.",
    actionRecommendation: "Biometric isolation confirmed; subject remanded to federal immigration enforcement."
  },
  {
    id: "INC-8899",
    code: "CR-BRAVO-45",
    title: "Illicit Crypto Wash Ring Activity",
    category: "Financial Crime",
    severity: "HIGH",
    riskScore: 89,
    confidence: 98.1,
    location: "Sector Charlie (Financial Core)",
    coordinates: "40.7061° N, 74.0092° W",
    timestamp: "12 mins ago",
    timeAgo: "12m ago",
    cctvId: "NET-NODE-FIN-88",
    status: "INVESTIGATING",
    suspect: {
      alias: "NebulaBroker",
      realName: "Anonymous Pool Syndicate",
      threatLevel: "TIER 2 - HIGH RISK",
      priorOffenses: 19,
      dnaMatch: "On-Chain Heuristic Cluster 99.8%",
      lastKnownVector: "Tornado Protocol Relay #412",
      associates: ["HydraMixer", "VortexPay"],
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80"
    },
    description: "Predictive graph neural network traced $4.2M equivalent of illicit mixer outputs flowing through decentralized flash-loan pool to purchase municipal bond futures.",
    actionRecommendation: "Issue FinCEN freezing injunction; trigger automated wallet blacklist across licensed exchanges."
  },
  {
    id: "INC-8898",
    code: "CR-ALPHA-09",
    title: "Suspicious Loitering Near Critical Substation",
    category: "Infrastructure Threat",
    severity: "LOW",
    riskScore: 35,
    confidence: 88.5,
    location: "Sector Alpha (Energy Grid Hub 3)",
    coordinates: "40.7589° N, 73.9851° W",
    timestamp: "18 mins ago",
    timeAgo: "18m ago",
    cctvId: "CAM-PWR-12A",
    status: "RESOLVED",
    suspect: {
      alias: "Unknown Subject",
      realName: "Civilian Maintenance Contractor (Verified)",
      threatLevel: "TIER 4 - CLEAR",
      priorOffenses: 0,
      dnaMatch: "RFID Badge Verified",
      lastKnownVector: "Grid Perimeter Fence Gate 2",
      associates: [],
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&auto=format&fit=crop&q=80"
    },
    description: "Thermal perimeter laser tripped by individual carrying metallic kit. Automated drone flyover cross-referenced municipal work order; verified as scheduled transformer inspection.",
    actionRecommendation: "False alarm logged. Work permit verified. Surveillance level returned to baseline."
  }
];

export const SYNTHETIC_INCOMING_STREAM = [
  {
    title: "Coordinated ATM Malware Injection",
    category: "Cyber Intrusion",
    severity: "CRITICAL",
    riskScore: 97,
    confidence: 99.2,
    location: "Sector Charlie (Financial Core)",
    coordinates: "40.7075° N, 74.0112° W",
    cctvId: "CAM-ATM-910B",
    status: "INTERCEPTING",
    suspect: {
      alias: "GhostByte",
      realName: "Unknown Threat Group",
      threatLevel: "TIER 1 - CRITICAL",
      priorOffenses: 22,
      dnaMatch: "Payload Signature Hit",
      lastKnownVector: "Physical USB Dongle Exploit",
      associates: ["DarkLoom", "PhantomWire"],
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80"
    },
    description: "Embedded telemetry on 14 downtown ATMs signaled unauthorized kernel payload inject attempt. Automated kill-switch executed, freezing cash dispensers and securing log journals.",
    actionRecommendation: "Dispatch tactical cyber forensics squad; flag CCTV face match from terminal cameras."
  },
  {
    title: "Covert Unregistered Drone in Flight Corridor",
    category: "Airspace Breach",
    severity: "HIGH",
    riskScore: 88,
    confidence: 95.7,
    location: "Sector Echo (Airport Buffer Zone)",
    coordinates: "40.6480° N, 73.7820° W",
    cctvId: "RADAR-AIR-04",
    status: "DISPATCHED",
    suspect: {
      alias: "AeroDrone-4",
      realName: "Operator Pending Triangulation",
      threatLevel: "TIER 2 - HIGH RISK",
      priorOffenses: 4,
      dnaMatch: "RF Signal Signature 98.4%",
      lastKnownVector: "2.4GHz Frequency Hop Stream",
      associates: ["SkyStash"],
      avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=240&auto=format&fit=crop&q=80"
    },
    description: "RF scanner triangulated unauthorized modified quadcopter with payload bracket flying at 450ft inside commercial approach funnel. Automated RF jammer activated.",
    actionRecommendation: "Deploy directed-energy RF scrambler; route ground interceptors to operator origin pings."
  },
  {
    title: "Suspicious Biometric Flag at Cargo Dock",
    category: "Narcotics Transit",
    severity: "HIGH",
    riskScore: 82,
    confidence: 93.9,
    location: "Sector Delta (Pier 9 Logistics)",
    coordinates: "40.6722° N, 74.0210° W",
    cctvId: "CAM-DOCK-88",
    status: "INVESTIGATING",
    suspect: {
      alias: "The Dockmaster",
      realName: "Arturo Ruiz",
      threatLevel: "TIER 2 - HIGH RISK",
      priorOffenses: 11,
      dnaMatch: "Facial Similarity 95.2%",
      lastKnownVector: "Forklift Operator Terminal #12",
      associates: ["Corsair Cartel"],
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=240&auto=format&fit=crop&q=80"
    },
    description: "Neural camera flagged flagged high-risk individual scanning unauthorized shipping container manifest. Discrepancy between manifest weight and radiographic density sensor.",
    actionRecommendation: "Lock down Sector Delta Pier Gate 4; order K9 & X-ray mobile scanner unit."
  }
];

export const SECTORS = [
  {
    id: "ALPHA",
    name: "Sector Alpha (Downtown & Gov Hub)",
    threatLevel: "MODERATE",
    riskIndex: 58,
    activeIncidents: 3,
    activeCameras: 842,
    patrolUnits: 14,
    aiHealth: "99.8%",
    color: "#5B7C99",
    x: "24%",
    y: "32%",
    description: "High density of administrative and municipal headquarters. Continuous biometric surveillance active."
  },
  {
    id: "BRAVO",
    name: "Sector Bravo (Metropolitan Banking Core)",
    threatLevel: "CRITICAL",
    riskIndex: 94,
    activeIncidents: 7,
    activeCameras: 1250,
    patrolUnits: 22,
    aiHealth: "98.9%",
    color: "#C04A52",
    x: "62%",
    y: "28%",
    description: "Critical financial infrastructure. Experiencing coordinated distributed cyber ingress and fraud attempts."
  },
  {
    id: "CHARLIE",
    name: "Sector Charlie (Transit & Rail Terminal)",
    threatLevel: "ELEVATED",
    riskIndex: 72,
    activeIncidents: 4,
    activeCameras: 610,
    patrolUnits: 9,
    aiHealth: "99.4%",
    color: "#B58A45",
    x: "45%",
    y: "55%",
    description: "High pedestrian throughput. Neural crowd anomaly detection and automated weapon detection active."
  },
  {
    id: "DELTA",
    name: "Sector Delta (Harbor & Logistics Yards)",
    threatLevel: "HIGH",
    riskIndex: 85,
    activeIncidents: 5,
    activeCameras: 430,
    patrolUnits: 11,
    aiHealth: "99.1%",
    color: "#9B3D45",
    x: "78%",
    y: "74%",
    description: "Maritime shipping container yard. Thermal night perimeter alarms and automated license plate recognition active."
  },
  {
    id: "ECHO",
    name: "Sector Echo (International Air Corridor)",
    threatLevel: "LOW",
    riskIndex: 32,
    activeIncidents: 1,
    activeCameras: 920,
    patrolUnits: 18,
    aiHealth: "100%",
    color: "#4F7A67",
    x: "18%",
    y: "78%",
    description: "Aviation perimeter. RF drone sensors and multi-spectral border biometric gate integrations nominal."
  }
];

export const NEXUS_GRAPH_DATA = {
  nodes: [
    { id: "S1", label: "Viktor Chen (Cipher_Ghost)", type: "suspect", tier: "Tier 1", radius: 26, color: "#ff2a5f", details: "Syndicate Kingpin • High Flight Risk • Cyber Weapons Specialist" },
    { id: "S2", label: "Marek Rostov", type: "suspect", tier: "Tier 2", radius: 22, color: "#ff5277", details: "Tactical Logistics Chief • Prior Smuggling Convictions" },
    { id: "S3", label: "Elena Thorne", type: "suspect", tier: "Tier 3", radius: 18, color: "#f59e0b", details: "Identity Forger • Synthetic Media Creator" },
    { id: "S4", label: "Apex_Cell Operative", type: "suspect", tier: "Tier 2", radius: 18, color: "#ff2a5f", details: "Field Interceptor • Linked to Substation Surveillance" },
    { id: "S5", label: "Viktor Voronin (The Architect)", type: "suspect", tier: "Tier 1", radius: 28, color: "#ff2a5f", details: "Executive Network Director • Transnational Extortion & Money Laundering" },
    { id: "S6", label: "Elena Rostov (Valkyrie)", type: "suspect", tier: "Tier 2", radius: 22, color: "#ff5277", details: "Darknet Escrow Broker • GhostNet Logistics Manager" },
    { id: "S7", label: "Darius Vance (Ironclad)", type: "suspect", tier: "Tier 2", radius: 22, color: "#ff5277", details: "Armed Escort & Warehouse Security Head • Kowloon Cartel" },
    { id: "S8", label: "Marcus Kane (Specter)", type: "suspect", tier: "Tier 3", radius: 18, color: "#f59e0b", details: "RF Tap & SCADA Saboteur • Railway Switching Override" },
    { id: "S9", label: "Tariq Al-Mansoor (The Alchemist)", type: "suspect", tier: "Tier 1", radius: 24, color: "#ff2a5f", details: "Cryptocurrency Mixer Operator • $14M Monitored Tumbler Volume" },
    { id: "S10", label: "Katya Orlova (Red Phantom)", type: "suspect", tier: "Tier 2", radius: 20, color: "#ff5277", details: "Industrial Control Systems Intruder • Critical Infrastructure Targeter" },
    { id: "S11", label: "Arturo Ruiz (El Silencio)", type: "suspect", tier: "Tier 2", radius: 20, color: "#ff5277", details: "Terminal C Harbor Logistics Insider • Contraband Berth Controller" },
    { id: "S12", label: "Jin Park (ZeroTrace)", type: "suspect", tier: "Tier 3", radius: 18, color: "#f59e0b", details: "Tor Gateway Provider • Encrypted Bulletproof Hosting Admin" },
    { id: "W1", label: "Crypto Wallet 0x8F9...41D", type: "asset", tier: "Asset", radius: 16, color: "#00f0ff", details: "Mixer Deposit Address • $4.2M Monitored Inflow" },
    { id: "W2", label: "Tether Wallet 0x889...F1C", type: "asset", tier: "Asset", radius: 16, color: "#00f0ff", details: "Offshore Escrow Wallet • Multi-Sig Authorization" },
    { id: "P1", label: "Burner IMSI #310-410", type: "device", tier: "Device", radius: 15, color: "#a855f7", details: "Encrypted Satellite Comms • Pinging Sector Bravo Cell Tower" },
    { id: "P2", label: "RF 868MHz Pulse Jammer", type: "device", tier: "Device", radius: 15, color: "#a855f7", details: "Customs Checkpoint Jammer • Triangulated at Pier 4" },
    { id: "V1", label: "Armored SUV NY-889XQ", type: "vehicle", tier: "Vehicle", radius: 17, color: "#38bdf8", details: "Black GMC Yukon • Stolen VIN Registered to Shell LLC" },
    { id: "V2", label: "Black Escalade (8B9-CYP)", type: "vehicle", tier: "Vehicle", radius: 17, color: "#38bdf8", details: "Getaway Transport • Captured on Toll Camera Exit 14" },
    { id: "H1", label: "Safehouse Node - Warehouse 14", type: "location", tier: "Location", radius: 20, color: "#00ff9d", details: "Suspected Server Rack & Hardware Storage Facility" },
    { id: "H2", label: "Terminal C Harbor Depot", type: "location", tier: "Location", radius: 20, color: "#00ff9d", details: "Sector 4 Customs Warehouse & Container Staging Yard" }
  ],
  links: [
    { source: "S5", target: "S1", relation: "Executive Contract", strength: 0.98 },
    { source: "S5", target: "S6", relation: "Directs Escrow", strength: 0.96 },
    { source: "S5", target: "S7", relation: "Commands Enforcers", strength: 0.95 },
    { source: "S1", target: "W1", relation: "Controls Fund Outflow", strength: 0.9 },
    { source: "S1", target: "P1", relation: "Encrypted P2P Voice", strength: 0.8 },
    { source: "S1", target: "S2", relation: "Direct Command", strength: 0.95 },
    { source: "S1", target: "S12", relation: "Tor Infrastructure", strength: 0.91 },
    { source: "S2", target: "V1", relation: "Primary Driver", strength: 0.85 },
    { source: "S2", target: "H1", relation: "Frequent Visits (3x weekly)", strength: 0.75 },
    { source: "S3", target: "S1", relation: "Supplies Synthesized Credentials", strength: 0.65 },
    { source: "S3", target: "S6", relation: "Forged Identity Pipeline", strength: 0.88 },
    { source: "S4", target: "P1", relation: "Cell Tower Geo-Coincidence", strength: 0.7 },
    { source: "S4", target: "H1", relation: "Guarding Perimeter", strength: 0.8 },
    { source: "S6", target: "W2", relation: "Manages Multi-Sig", strength: 0.97 },
    { source: "S7", target: "V2", relation: "Armed Escort Pilot", strength: 0.94 },
    { source: "S7", target: "H2", relation: "Perimeter Security", strength: 0.89 },
    { source: "S8", target: "P2", relation: "RF Jammer Operator", strength: 0.93 },
    { source: "S8", target: "S10", relation: "SCADA Sabotage Team", strength: 0.9 },
    { source: "S9", target: "W2", relation: "Mixer Tumbling Feed", strength: 0.96 },
    { source: "S11", target: "H2", relation: "Berth Manifest Clearance", strength: 0.95 },
    { source: "S11", target: "S7", relation: "Contraband Handoff", strength: 0.92 }
  ]
};

export const FORENSIC_CASES = [
  {
    id: "BIO-01",
    name: "Biometric Face Recognition",
    sampleImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    subjectType: "Facial Feature Vector Matching",
    confidence: "99.4%",
    hitMatch: "Cipher_Ghost (Viktor Chen)",
    latency: "34ms",
    keypoints: 128,
    metrics: [
      { label: "Inter-pupillary Distance", value: "64.2mm (Exact Match)" },
      { label: "Nose Bridge Curvature", value: "98.9% Vector Similarity" },
      { label: "Jawline Bone Profile", value: "99.1% Confidence" },
      { label: "Deepfake / Liveness Test", value: "PASSED (Real Human Biomass)" }
    ]
  },
  {
    id: "OCR-02",
    name: "Autonomous Vehicle License Plate OCR",
    sampleImage: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&auto=format&fit=crop&q=80",
    subjectType: "Neural Optical Character Recognition",
    confidence: "98.7%",
    hitMatch: "Plate: NY-889XQ (Blacklist Hit)",
    latency: "18ms",
    keypoints: 32,
    metrics: [
      { label: "Registration State", value: "New York (Department of Motor Vehicles)" },
      { label: "Vehicle Classification", value: "SUV - High Caliber Tinted" },
      { label: "Stolen Vehicle Database", value: "FLAGGED: Stolen 72h Ago" },
      { label: "Speed Telemetry", value: "84 mph in 45 mph Zone" }
    ]
  },
  {
    id: "DIGI-03",
    name: "Digital Cryptographic Trace Analysis",
    sampleImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&auto=format&fit=crop&q=80",
    subjectType: "On-Chain Heuristic Graph Walk",
    confidence: "97.5%",
    hitMatch: "Tornado Protocol Wash Ring #412",
    latency: "112ms",
    keypoints: 64,
    metrics: [
      { label: "Total Intercepted Value", value: "$4,219,800 USD Equivalent" },
      { label: "Hop Depth", value: "7 Layered Mixers / 43 Sub-wallets" },
      { label: "Exit Destination", value: "Decentralized OTC Liquidity Pool" },
      { label: "Automated Freeze Status", value: "Interdiction Injunction Sent" }
    ]
  }
];

export const TERMINAL_COMMANDS = [
  {
    cmd: "crimenet query --target 'Cipher_Ghost' --deep-scan",
    output: [
      "[INFO] Authenticating with Federal Quantum Key Distribution Mesh...",
      "[SUCCESS] Credentials verified: Level-5 National Security Clearance.",
      "[SCAN] Traversing 42,000,000 biometric records and 1,800 active CCTV relays...",
      "[HIT FOUND] Suspect 'Cipher_Ghost' (Viktor Chen) located.",
      " -> Current GPS Vector: 40.7128° N, 74.0060° W (Sector Bravo)",
      " -> Confidence Index: 99.4% (Facial, Gait, Cellular IMSI correlate)",
      " -> Threat Directive: Immediate autonomous interception authorized."
    ]
  },
  {
    cmd: "crimenet radar --sector Bravo --threat-index",
    output: [
      "[RADAR] Scanning Sector Bravo electromagnetic spectrum & thermal feeds...",
      " -> Threat Tier: DEFCON 1 (CRITICAL - 94/100 Risk Score)",
      " -> Active Intercepts: 7 Incidents in progress",
      " -> Automated Patrol Drones: 22 units deployed within 300m radius",
      " -> Status: Automated perimeter lock down protocol ready."
    ]
  },
  {
    cmd: "crimenet trace --crypto 0x8F9...41D",
    output: [
      "[CHAIN] Loading Graph Neural Network on-chain heuristics...",
      "[TRACE] De-anonymizing 43 mixer transactions across 6 blockchains...",
      " -> Origin Fund Source: Exploit of Municipal Treasury Gateway",
      " -> Target Liquidity: $4,219,800 USD in synthetic stablecoins",
      " -> Injunction Issued: Blacklist pushed to all compliant OTC desks."
    ]
  }
];

export const PRICING_TIERS = [
  {
    name: "Municipal Patrol",
    badge: "Local Police & City Security",
    monthlyPrice: 2490,
    annualPrice: 1990,
    features: [
      "Up to 250 connected AI CCTV cameras",
      "Real-time Automated Incident Triage",
      "License Plate OCR & Speed Telemetry",
      "Standard Web Dashboard & iOS/Android Tablet App",
      "Standard 99.2% Uptime SLA",
      "8-hour Dispatch Log Retries"
    ],
    cta: "Deploy City Grid",
    popular: false
  },
  {
    name: "State & Regional Command",
    badge: "Most Popular for State Police",
    monthlyPrice: 6990,
    annualPrice: 5590,
    features: [
      "Up to 2,500 connected multi-spectrum sensors",
      "Advanced Facial Biometric Recognition (99.4% precision)",
      "Predictive Spatio-Temporal Crime Heatmap",
      "Automated Syndicate Nexus Network Graph",
      "Direct CAD (Computer Aided Dispatch) Integration",
      "24/7 Dedicated Cyber Defense Escalation Team",
      "Full CJIS & FedRAMP Compliance Package"
    ],
    cta: "Start Agency Trial",
    popular: true
  },
  {
    name: "Federal Sovereign Cloud",
    badge: "National Defense & Intelligence",
    monthlyPrice: "Custom",
    annualPrice: "Custom",
    features: [
      "Unlimited nationwide camera & drone sensor feeds",
      "Quantum-Safe Zero-Knowledge Chain of Custody",
      "Air-Gapped Sovereign On-Premise Deployment",
      "Custom Graph Neural Network Model Fine-Tuning",
      "Inter-Agency Cross-Border Intelligence Sharing",
      "Sub-millisecond Edge Intercept Processing",
      "Top-Secret Facility Clearance Support"
    ],
    cta: "Contact Defense Team",
    popular: false
  }
];
