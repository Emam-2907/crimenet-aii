"""
CRIMENET AI - Central Intelligence Repository
High-fidelity criminal knowledge graph, visual biometric database, and entity registries.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import copy
import os

# Biometric candidate gallery for facial recognition
CANDIDATE_GALLERY = [
    {
        "id": "cand-01",
        "name": "Viktor Voronin",
        "alias": "The Architect / Cypher-9",
        "mugshot": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
        "confidence": 0.964,
        "threat_level": "CRITICAL",
        "syndicate": "Apex Cyber Syndicate",
        "status": "MOST WANTED",
        "biometrics": {
            "eye_distance": 64.2,
            "facial_ratio": 1.48,
            "feature_vector_hash": "e9a78f21b3c9004d",
            "scar_markers": ["Left temple scar", "Nasal ridge notch"]
        },
        "details": "Known syndicate kingpin orchestrating ransomware and illicit crypto laundering across 4 continents."
    },
    {
        "id": "cand-02",
        "name": "Elena Rostov",
        "alias": "Valkyrie / CipherQueen",
        "mugshot": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        "confidence": 0.912,
        "threat_level": "HIGH",
        "syndicate": "GhostNet Logistics",
        "status": "SURVEILLANCE ACTIVE",
        "biometrics": {
            "eye_distance": 58.7,
            "facial_ratio": 1.42,
            "feature_vector_hash": "c4d1982ab78912ef",
            "scar_markers": ["Right cheek beauty mark"]
        },
        "details": "Financial broker and darknet escrow operator facilitating port access and encrypted communications."
    },
    {
        "id": "cand-03",
        "name": "Darius Vance",
        "alias": "Ironclad / Heavy-D",
        "mugshot": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
        "confidence": 0.845,
        "threat_level": "HIGH",
        "syndicate": "Kowloon Port Cartel",
        "status": "DETAINED IN ABSENTIA",
        "biometrics": {
            "eye_distance": 68.1,
            "facial_ratio": 1.54,
            "feature_vector_hash": "39f408bd1194ac27",
            "scar_markers": ["Jawline fracture healed", "Neck eagle tattoo"]
        },
        "details": "Armed logistics enforcer supervising warehouse arms distribution and decoy armored transports."
    },
    {
        "id": "cand-04",
        "name": "Marcus Kane",
        "alias": "Specter / Wiretapper",
        "mugshot": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80",
        "confidence": 0.781,
        "threat_level": "MEDIUM",
        "syndicate": "Apex Cyber Syndicate",
        "status": "PERSON OF INTEREST",
        "biometrics": {
            "eye_distance": 61.3,
            "facial_ratio": 1.39,
            "feature_vector_hash": "88aa90c4391ef140",
            "scar_markers": ["Forehead abrasion"]
        },
        "details": "Signal interception and hardware tap specialist suspected of tampering with port CCTV relays."
    }
]

# Visual evidence cases
VISUAL_EVIDENCE_CASES = [
    {
        "id": "EVID-CCTV-901",
        "name": "Harbor Terminal C - High-Res CCTV Frame 04:18",
        "type": "CCTV Footage",
        "timestamp": "2026-09-18 04:18:22 UTC",
        "location": "Sector 4 - South Pier Customs Depot",
        "sampleImage": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
        "reticle": {"x": 38, "y": 28, "w": 28, "h": 36},
        "detected_faces": 1,
        "primary_match_id": "cand-01",
        "match_score": 0.964,
        "notes": "Subject spotted exiting an unmarked black matte SUV (VIN: *7829-K) carrying an encrypted transit case."
    },
    {
        "id": "EVID-UAV-412",
        "name": "Metro Rail Depot - Tactical Drone Aerial Scan",
        "type": "Aerial Surveillance",
        "timestamp": "2026-09-18 02:44:09 UTC",
        "location": "Sector 2 - Freight Rail Exchange",
        "sampleImage": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
        "reticle": {"x": 42, "y": 22, "w": 25, "h": 34},
        "detected_faces": 1,
        "primary_match_id": "cand-02",
        "match_score": 0.912,
        "notes": "Subject observed receiving satphone battery packs from an unidentified courier."
    },
    {
        "id": "EVID-ATM-780",
        "name": "Commercial District - ATM Camera Capture",
        "type": "Financial Terminal CCTV",
        "timestamp": "2026-09-17 23:12:45 UTC",
        "location": "Sector 1 - North Meridian Banking Hub",
        "sampleImage": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
        "reticle": {"x": 35, "y": 20, "w": 32, "h": 40},
        "detected_faces": 1,
        "primary_match_id": "cand-03",
        "match_score": 0.845,
        "notes": "Card skimming apparatus installation verified; vehicle license plate tagged: 8B9-CYP."
    }
]

# Initial Cytoscape Knowledge Graph elements (Phase 3 Standardized 7 Entity Types)
CYTOSCAPE_GRAPH_DATA = {
    "nodes": [
        # 1. PERSON (shape: ellipse)
        {
            "data": {
                "id": "ent-person-voronin",
                "label": "Viktor Voronin",
                "type": "Person",
                "shape": "ellipse",
                "threat": "CRITICAL",
                "syndicate": "Apex Cyber Syndicate",
                "color": "#f87171",
                "size": 52,
                "details": "Kingpin orchestrating ransomware networks, avionics smuggling, and offshore escrow laundering.",
                "aliases": ["The Architect", "Cypher-9"],
                "case_id": "CASE #CR-2026-0142"
            }
        },
        {
            "data": {
                "id": "ent-person-rostov",
                "label": "Elena Rostov",
                "type": "Person",
                "shape": "ellipse",
                "threat": "HIGH",
                "syndicate": "GhostNet Logistics",
                "color": "#f87171",
                "size": 46,
                "details": "Financial broker and darknet escrow operator facilitating port access and encrypted communications.",
                "aliases": ["Valkyrie", "CipherQueen"],
                "case_id": "CASE #CR-2026-0142"
            }
        },
        {
            "data": {
                "id": "ent-person-vance",
                "label": "Darius Vance",
                "type": "Person",
                "shape": "ellipse",
                "threat": "HIGH",
                "syndicate": "Kowloon Port Cartel",
                "color": "#f87171",
                "size": 44,
                "details": "Armed logistics enforcer supervising warehouse arms distribution and decoy armored transports.",
                "aliases": ["Ironclad", "Heavy-D"],
                "case_id": "CASE #CR-2026-0142"
            }
        },
        {
            "data": {
                "id": "ent-person-kane",
                "label": "Marcus Kane",
                "type": "Person",
                "shape": "ellipse",
                "threat": "MEDIUM",
                "syndicate": "Apex Cyber Syndicate",
                "color": "#f87171",
                "size": 40,
                "details": "Signal interception and hardware tap specialist suspected of tampering with port CCTV relays.",
                "aliases": ["Specter", "Wiretapper"],
                "case_id": "CASE #CR-2026-0089"
            }
        },
        {
            "data": {
                "id": "ent-person-chen",
                "label": "Viktor Chen (Cipher_Ghost)",
                "type": "Person",
                "shape": "ellipse",
                "threat": "CRITICAL",
                "syndicate": "Apex Cyber Syndicate",
                "color": "#f87171",
                "size": 50,
                "details": "Autonomous ransomware developer and zero-day exploit author targeting utility SCADA protocols.",
                "aliases": ["Cipher_Ghost", "ZeroVector"],
                "case_id": "CASE #CR-2026-0142"
            }
        },
        {
            "data": {
                "id": "ent-person-marek",
                "label": "Marek Rostov",
                "type": "Person",
                "shape": "ellipse",
                "threat": "HIGH",
                "syndicate": "Kowloon Port Cartel",
                "color": "#f87171",
                "size": 46,
                "details": "Tactical logistics chief managing high-speed armored transit convoys across harbor perimeter.",
                "aliases": ["The Vanguard Driver"],
                "case_id": "CASE #CR-2026-0142"
            }
        },
        {
            "data": {
                "id": "ent-person-elena-thorne",
                "label": "Elena Thorne (Chameleon-9)",
                "type": "Person",
                "shape": "ellipse",
                "threat": "HIGH",
                "syndicate": "ForgeNet",
                "color": "#f87171",
                "size": 44,
                "details": "Synthetic media creator and 3D biometric credential counterfeiter for cross-border transit.",
                "aliases": ["Chameleon-9"],
                "case_id": "CASE #CR-2026-0142"
            }
        },
        {
            "data": {
                "id": "ent-person-tariq",
                "label": "Tariq Al-Mansoor",
                "type": "Person",
                "shape": "ellipse",
                "threat": "CRITICAL",
                "syndicate": "GhostNet Logistics",
                "color": "#f87171",
                "size": 48,
                "details": "Cryptocurrency wash ring operator managing cross-chain flash-loan liquidity pools.",
                "aliases": ["The Alchemist", "NebulaBroker"],
                "case_id": "CASE #CR-2026-0142"
            }
        },
        {
            "data": {
                "id": "ent-person-katya",
                "label": "Katya Orlova (Red Phantom)",
                "type": "Person",
                "shape": "ellipse",
                "threat": "HIGH",
                "syndicate": "Apex Cyber Syndicate",
                "color": "#f87171",
                "size": 44,
                "details": "SCADA telemetry manipulator and railway routing saboteur.",
                "aliases": ["Red Phantom"],
                "case_id": "CASE #CR-2026-0142"
            }
        },
        {
            "data": {
                "id": "ent-person-arturo",
                "label": "Arturo Ruiz (El Silencio)",
                "type": "Person",
                "shape": "ellipse",
                "threat": "HIGH",
                "syndicate": "Kowloon Port Cartel",
                "color": "#f87171",
                "size": 44,
                "details": "Maritime container smuggling dispatcher operating through Terminal C berths.",
                "aliases": ["El Silencio"],
                "case_id": "CASE #CR-2026-0142"
            }
        },
        {
            "data": {
                "id": "ent-person-jin",
                "label": "Jin Park (ZeroTrace)",
                "type": "Person",
                "shape": "ellipse",
                "threat": "MEDIUM",
                "syndicate": "Apex Cyber Syndicate",
                "color": "#f87171",
                "size": 42,
                "details": "Tor gateway node administrator and encrypted relay provider for Apex Cell.",
                "aliases": ["ZeroTrace"],
                "case_id": "CASE #CR-2026-0142"
            }
        },
        {
            "data": {
                "id": "ent-person-isabella",
                "label": "Isabella Cruz (Nemesis)",
                "type": "Person",
                "shape": "ellipse",
                "threat": "HIGH",
                "syndicate": "Apex Cyber Syndicate",
                "color": "#f87171",
                "size": 44,
                "details": "Electronic counter-surveillance officer responsible for RF jamming operations.",
                "aliases": ["Nemesis"],
                "case_id": "CASE #CR-2026-0142"
            }
        },

        # 2. PHONE / COMM (shape: round-rectangle)
        {
            "data": {
                "id": "ent-phone-868mhz",
                "label": "RF 868MHz Jammer / Tap",
                "type": "Phone",
                "shape": "round-rectangle",
                "threat": "HIGH",
                "syndicate": "Apex Cyber Syndicate",
                "color": "#38bdf8",
                "size": 40,
                "details": "Encrypted frequency pulse triangulated near Terminal C customs checkpoint.",
                "case_id": "CASE #CR-2026-0142"
            }
        },
        {
            "data": {
                "id": "ent-phone-satcom",
                "label": "SatPhone +882-16-992",
                "type": "Phone",
                "shape": "round-rectangle",
                "threat": "HIGH",
                "syndicate": "GhostNet Logistics",
                "color": "#38bdf8",
                "size": 40,
                "details": "Burner satellite phone routed via microwave repeater at Pier 4.",
                "case_id": "CASE #CR-2026-0089"
            }
        },

        # 3. VEHICLE (shape: diamond)
        {
            "data": {
                "id": "ent-veh-escalade",
                "label": "Black Escalade (8B9-CYP)",
                "type": "Vehicle",
                "shape": "diamond",
                "threat": "HIGH",
                "syndicate": "Kowloon Port Cartel",
                "color": "#fbbf24",
                "size": 46,
                "details": "VIN: 7829-K. Identified on ALPR camera speeding northbound on Highway 101.",
                "case_id": "CASE #CR-2026-0142"
            }
        },
        {
            "data": {
                "id": "ent-veh-freight-train",
                "label": "Freight Switcher Unit 14-B",
                "type": "Vehicle",
                "shape": "diamond",
                "threat": "CRITICAL",
                "syndicate": "GhostNet Logistics",
                "color": "#fbbf24",
                "size": 44,
                "details": "SCADA-controlled railway locomotive diverted under remote command override.",
                "case_id": "CASE #CR-2026-0089"
            }
        },

        # 4. FINANCIAL ACCOUNT (shape: hexagon)
        {
            "data": {
                "id": "ent-fin-tether-wallet",
                "label": "Tether Wallet 0x889...F1C",
                "type": "Financial Account",
                "shape": "hexagon",
                "threat": "CRITICAL",
                "syndicate": "GhostNet Logistics",
                "color": "#34d399",
                "size": 46,
                "details": "Offshore escrow wallet used to route 140 USDT bribes to clear harbormaster inspection.",
                "case_id": "CASE #CR-2026-0142"
            }
        },
        {
            "data": {
                "id": "ent-fin-tumbler",
                "label": "Darknet Mixer Node 36",
                "type": "Financial Account",
                "shape": "hexagon",
                "threat": "CRITICAL",
                "syndicate": "GhostNet Logistics",
                "color": "#34d399",
                "size": 44,
                "details": "Decentralized liquidity mixer splitting $1.4M into micro-tumbling outputs.",
                "case_id": "CASE #CR-2026-0044"
            }
        },

        # 5. LOCATION (shape: octagon)
        {
            "data": {
                "id": "ent-loc-terminal-c",
                "label": "Terminal C Harbor Depot",
                "type": "Location",
                "shape": "octagon",
                "threat": "HIGH",
                "syndicate": "Port Perimeter",
                "color": "#c084fc",
                "size": 48,
                "details": "Sector 4 customs warehouse where avionics cargo container TXUS-2291 was breached.",
                "case_id": "CASE #CR-2026-0142"
            }
        },
        {
            "data": {
                "id": "ent-loc-warehouse-14b",
                "label": "Warehouse 14B Safehouse",
                "type": "Location",
                "shape": "octagon",
                "threat": "HIGH",
                "syndicate": "Apex Cyber Syndicate",
                "color": "#c084fc",
                "size": 46,
                "details": "Tactical staging ground containing hardware racks, radio repeaters, and counterfeit travel documents.",
                "case_id": "CASE #CR-2026-0142"
            }
        },
        {
            "data": {
                "id": "ent-loc-sector2-exchange",
                "label": "Sector 2 Freight Exchange",
                "type": "Location",
                "shape": "octagon",
                "threat": "MEDIUM",
                "syndicate": "GhostNet Logistics",
                "color": "#c084fc",
                "size": 42,
                "details": "Industrial rail switching yard targeted in automated SCADA sabotage.",
                "case_id": "CASE #CR-2026-0089"
            }
        },

        # 6. ORGANIZATION (shape: rectangle)
        {
            "data": {
                "id": "ent-org-apex",
                "label": "Apex Cyber Syndicate",
                "type": "Organization",
                "shape": "rectangle",
                "threat": "CRITICAL",
                "syndicate": "Apex Cyber Syndicate",
                "color": "#f472b6",
                "size": 50,
                "details": "Transnational cybercrime network targeting municipal utility systems and defense logistics.",
                "case_id": "CASE #CR-2026-0142"
            }
        },
        {
            "data": {
                "id": "ent-org-kowloon",
                "label": "Kowloon Port Cartel",
                "type": "Organization",
                "shape": "rectangle",
                "threat": "HIGH",
                "syndicate": "Kowloon Port Cartel",
                "color": "#f472b6",
                "size": 46,
                "details": "Armed logistics cartel operating maritime container contraband pipelines.",
                "case_id": "CASE #CR-2026-0142"
            }
        },

        # 7. EVIDENCE (shape: tag)
        {
            "data": {
                "id": "ent-evid-cctv",
                "label": "CCTV Frame 04:18",
                "type": "Evidence",
                "shape": "tag",
                "threat": "EVIDENCE",
                "syndicate": "Forensic Vault",
                "color": "#38bdf8",
                "size": 44,
                "details": "High-res optical frame identifying subject exiting black SUV at Harbor Depot.",
                "case_id": "CASE #CR-2026-0142"
            }
        },
        {
            "data": {
                "id": "ent-evid-tap",
                "label": "Microwave Tap Log #8821",
                "type": "Evidence",
                "shape": "tag",
                "threat": "EVIDENCE",
                "syndicate": "Forensic Vault",
                "color": "#38bdf8",
                "size": 42,
                "details": "Decrypted intercepted transcript confirming rendezvous coordinates and getaway vehicle plate.",
                "case_id": "CASE #CR-2026-0142"
            }
        }
    ],
    "edges": [
        # Call / Intercept Links (cyan dashed)
        {
            "data": {
                "id": "e-calls-1",
                "source": "ent-person-voronin",
                "target": "ent-phone-868mhz",
                "relation": "TRANSMITTED_ON",
                "relation_type": "calls",
                "confidence": 0.98,
                "supporting_evidence_id": "EV-0182",
                "supporting_evidence_name": "Call_Record_Microwave_Tap.csv",
                "evidence_source": "Customs Microwave Tap (Sector 4)",
                "explainability": "Audio voiceprint match correlates Voronin's acoustic profile with RF sensor burst at 868MHz.",
                "case_id": "CASE #CR-2026-0142"
            }
        },
        {
            "data": {
                "id": "e-calls-2",
                "source": "ent-phone-868mhz",
                "target": "ent-person-vance",
                "relation": "DIRECTED_CONVOY",
                "relation_type": "calls",
                "confidence": 0.94,
                "supporting_evidence_id": "EV-0182",
                "supporting_evidence_name": "Call_Record_Microwave_Tap.csv",
                "evidence_source": "Customs Microwave Tap (Sector 4)",
                "explainability": "Intercept wiretap log directly references instructing Darius Vance to pilot the black Escalade.",
                "case_id": "CASE #CR-2026-0142"
            }
        },
        {
            "data": {
                "id": "e-calls-3",
                "source": "ent-person-rostov",
                "target": "ent-phone-satcom",
                "relation": "DISPATCHED_INSTRUCTIONS",
                "relation_type": "calls",
                "confidence": 0.91,
                "supporting_evidence_id": "EV-0186",
                "supporting_evidence_name": "Drone_Recon_Sector2_Exchange.mp4",
                "evidence_source": "UAV Wing 09 Airborne Scan",
                "explainability": "Aerial surveillance caught subject on satellite phone coinciding with rail track timer override.",
                "case_id": "CASE #CR-2026-0089"
            }
        },

        # Financial Transaction Links (emerald green solid)
        {
            "data": {
                "id": "e-fin-1",
                "source": "ent-person-rostov",
                "target": "ent-fin-tether-wallet",
                "relation": "MANAGES_ESCROW",
                "relation_type": "financial",
                "confidence": 0.97,
                "supporting_evidence_id": "EV-0185",
                "supporting_evidence_name": "Escrow_Wallet_Ledger_Dump.json",
                "evidence_source": "FinCEN Blockchain Explorer Node",
                "explainability": "Cryptographic signature on 140 USDT transaction links directly to Elena Rostov's private key hash.",
                "case_id": "CASE #CR-2026-0142"
            }
        },
        {
            "data": {
                "id": "e-fin-2",
                "source": "ent-person-voronin",
                "target": "ent-fin-tether-wallet",
                "relation": "BENEFICIAL_OWNER",
                "relation_type": "financial",
                "confidence": 0.93,
                "supporting_evidence_id": "EV-0185",
                "supporting_evidence_name": "Escrow_Wallet_Ledger_Dump.json",
                "evidence_source": "FinCEN Blockchain Explorer Node",
                "explainability": "Sub-wallet consolidation traces cold-storage withdrawal authorizations back to Voronin escrow.",
                "case_id": "CASE #CR-2026-0142"
            }
        },
        {
            "data": {
                "id": "e-fin-3",
                "source": "ent-fin-tether-wallet",
                "target": "ent-fin-tumbler",
                "relation": "TUMBLED_THROUGH",
                "relation_type": "financial",
                "confidence": 0.95,
                "supporting_evidence_id": "EV-0188",
                "supporting_evidence_name": "FinCEN_Suspicious_Activity_Report.pdf",
                "evidence_source": "FinCEN Intelligence Division",
                "explainability": "Automated flash-loan arbitrage routed tokens across 36 mixer nodes to obscure origin.",
                "case_id": "CASE #CR-2026-0044"
            }
        },

        # Vehicle Connection Links (amber solid)
        {
            "data": {
                "id": "e-veh-1",
                "source": "ent-person-vance",
                "target": "ent-veh-escalade",
                "relation": "OPERATING_DRIVER",
                "relation_type": "vehicle",
                "confidence": 0.95,
                "supporting_evidence_id": "EV-0189",
                "supporting_evidence_name": "ALPR_Toll_Exit14_Plate_Capture.png",
                "evidence_source": "State Highway Patrol ALPR Network",
                "explainability": "ALPR optical camera match identifies vehicle changing plates at Exit 14 just 18 minutes post-incident.",
                "case_id": "CASE #CR-2026-0142"
            }
        },
        {
            "data": {
                "id": "e-veh-2",
                "source": "ent-person-kane",
                "target": "ent-veh-freight-train",
                "relation": "SCADA_OVERRIDE",
                "relation_type": "vehicle",
                "confidence": 0.89,
                "supporting_evidence_id": "EV-0187",
                "supporting_evidence_name": "Freight_SCADA_Telemetry_Log.txt",
                "evidence_source": "Rail Traffic Control System",
                "explainability": "Hardware modem IP used to trigger track switcher connects to Kane's known signal kit.",
                "case_id": "CASE #CR-2026-0089"
            }
        },

        # Association / Organization Links (rose solid)
        {
            "data": {
                "id": "e-assoc-1",
                "source": "ent-person-voronin",
                "target": "ent-org-apex",
                "relation": "COMMANDS_SYNDICATE",
                "relation_type": "association",
                "confidence": 0.99,
                "supporting_evidence_id": "EV-0183",
                "supporting_evidence_name": "FIR_Customs_Port_Report.pdf",
                "evidence_source": "Port Authority Incident Desk",
                "explainability": "Identified across multiple taskforce briefings as the executive director of Apex operations.",
                "case_id": "CASE #CR-2026-0142"
            }
        },
        {
            "data": {
                "id": "e-assoc-2",
                "source": "ent-person-vance",
                "target": "ent-org-kowloon",
                "relation": "ENFORCES_FOR",
                "relation_type": "association",
                "confidence": 0.94,
                "supporting_evidence_id": "EV-0183",
                "supporting_evidence_name": "FIR_Customs_Port_Report.pdf",
                "evidence_source": "Port Authority Incident Desk",
                "explainability": "Long-standing tactical enforcer profile in Kowloon Port Cartel armed escort divisions.",
                "case_id": "CASE #CR-2026-0142"
            }
        },
        {
            "data": {
                "id": "e-assoc-3",
                "source": "ent-org-apex",
                "target": "ent-org-kowloon",
                "relation": "TACTICAL_ALLIANCE",
                "relation_type": "association",
                "confidence": 0.92,
                "supporting_evidence_id": "EV-0182",
                "supporting_evidence_name": "Call_Record_Microwave_Tap.csv",
                "evidence_source": "Customs Microwave Tap (Sector 4)",
                "explainability": "Syndicates agreed on joint hardware transport split between cyber extortion and physical maritime extraction.",
                "case_id": "CASE #CR-2026-0142"
            }
        },

        # Location Connection Links (purple dotted)
        {
            "data": {
                "id": "e-loc-1",
                "source": "ent-person-voronin",
                "target": "ent-loc-terminal-c",
                "relation": "PHYSICAL_PRESENCE",
                "relation_type": "location",
                "confidence": 0.964,
                "supporting_evidence_id": "EV-0184",
                "supporting_evidence_name": "CCTV_Terminal_C_Frame_0418.jpg",
                "evidence_source": "Port Authority CCTV Feed 04",
                "explainability": "ArcFace neural facial recognition confirms Voronin standing at Gate 4 at 04:18 UTC.",
                "case_id": "CASE #CR-2026-0142"
            }
        },
        {
            "data": {
                "id": "e-loc-2",
                "source": "ent-person-vance",
                "target": "ent-loc-warehouse-14b",
                "relation": "STAGING_DESTINATION",
                "relation_type": "location",
                "confidence": 0.92,
                "supporting_evidence_id": "EV-0182",
                "supporting_evidence_name": "Call_Record_Microwave_Tap.csv",
                "evidence_source": "Customs Microwave Tap (Sector 4)",
                "explainability": "Intercept wiretap explicitly mentions Warehouse 14B near South Pier as designated drop site.",
                "case_id": "CASE #CR-2026-0142"
            }
        },
        {
            "data": {
                "id": "e-loc-3",
                "source": "ent-veh-freight-train",
                "target": "ent-loc-sector2-exchange",
                "relation": "DIVERTED_TO",
                "relation_type": "location",
                "confidence": 0.97,
                "supporting_evidence_id": "EV-0187",
                "supporting_evidence_name": "Freight_SCADA_Telemetry_Log.txt",
                "evidence_source": "Rail Traffic Control System",
                "explainability": "Telemetry log shows automatic stop override executed precisely at rail switch 14-B.",
                "case_id": "CASE #CR-2026-0089"
            }
        },

        # Evidence-Backed Verification Links (blue solid)
        {
            "data": {
                "id": "e-evid-1",
                "source": "ent-evid-cctv",
                "target": "ent-person-voronin",
                "relation": "BIOMETRIC_FACE_MATCH",
                "relation_type": "biometric",
                "confidence": 0.964,
                "supporting_evidence_id": "EV-0184",
                "supporting_evidence_name": "CCTV_Terminal_C_Frame_0418.jpg",
                "evidence_source": "Port Authority CCTV Feed 04",
                "explainability": "Deep neural landmark analysis matched Viktor Voronin against Interpol red-notice vector gallery.",
                "case_id": "CASE #CR-2026-0142"
            }
        },
        {
            "data": {
                "id": "e-evid-2",
                "source": "ent-evid-tap",
                "target": "ent-phone-868mhz",
                "relation": "SIGNAL_INTERCEPTED",
                "relation_type": "evidence_backed",
                "confidence": 0.98,
                "supporting_evidence_id": "EV-0182",
                "supporting_evidence_name": "Call_Record_Microwave_Tap.csv",
                "evidence_source": "Customs Microwave Tap (Sector 4)",
                "explainability": "Physical microwave tap recorded high-frequency burst transmission directly before perimeter alarm.",
                "case_id": "CASE #CR-2026-0142"
            }
        }
    ]
}

# Entity Resolution Disambiguation Candidates
ENTITY_RESOLUTION_CASES = [
    {
        "id": "ER-901",
        "primary_entity": "Viktor Voronin",
        "primary_id": "suspect-1",
        "confidence": 0.945,
        "status": "UNRESOLVED_MATCH",
        "matches": [
            {
                "entity_name": "Ghost_0x",
                "source": "Darknet Forum Wiretap",
                "matching_attributes": ["PGP Key Fingerprint *004D", "Burner Phone +1-800-DARK-91", "Same Tor Relay Node"],
                "score": 0.97
            },
            {
                "entity_name": "Victor V. (Kowloon Port Consignee)",
                "source": "Customs Manifest Import Log",
                "matching_attributes": ["Forged Bulgarian Passport #BG-8911", "Matching Facial Biometric Vectors"],
                "score": 0.92
            }
        ],
        "rationale": "Signal analysis reveals identical cryptographic signature and IP packet hop patterns connecting Ghost_0x directly to Voronin's verified alias."
    },
    {
        "id": "ER-902",
        "primary_entity": "Black SUV (VIN: 7829-K)",
        "primary_id": "veh-771",
        "confidence": 0.887,
        "status": "UNRESOLVED_MATCH",
        "matches": [
            {
                "entity_name": "License Plate 8B9-CYP (Stolen)",
                "source": "Toll Booth ALPR Camera",
                "matching_attributes": ["Chassis Make/Model Cadillac Escalade", "Scratched Rear Left Bumper"],
                "score": 0.89
            }
        ],
        "rationale": "ALPR optical camera match identifies vehicle changing plates at Exit 14 just 18 minutes prior to Port Sovereign Heist."
    }
]

# Real-time Incidents database
INCIDENTS_STORE = [
    {
        "id": "INC-8891",
        "timestamp": "11:42:15 UTC",
        "sector": "Sector 4 (Port Perimeter)",
        "type": "Critical Threat Intercept",
        "threatLevel": "CRITICAL",
        "suspect": "Viktor Voronin",
        "confidence": "98.4%",
        "status": "ACTION REQUIRED",
        "summary": "Encrypted frequency pulse detected near Terminal C customs checkpoint.",
        "details": "Automated RF sensors triangulated a burst transmission utilizing mil-spec encryption protocols. Cross-referencing facial biometric logs confirms Viktor Voronin present.",
        "unitsDispatched": ["Tactical Strike Unit 4", "Cyber Intercept Van 2"],
        "telemetry": {"rssi": "-42 dBm", "frequency": "868.45 MHz", "packetLoss": "0.01%"}
    },
    {
        "id": "INC-8890",
        "timestamp": "11:28:04 UTC",
        "sector": "Sector 2 (Industrial Rail)",
        "type": "Coordinated Logistics Diversion",
        "threatLevel": "HIGH",
        "suspect": "Elena Rostov",
        "confidence": "94.2%",
        "status": "SURVEILLANCE ACTIVE",
        "summary": "Automated rail switcher tampering detected on westbound freight line.",
        "details": "Remote SCADA bypass attempted via cellular modem. Drone surveillance dispatched to track fleeing vehicle.",
        "unitsDispatched": ["Drone Wing 09"],
        "telemetry": {"rssi": "-58 dBm", "frequency": "433.92 MHz", "packetLoss": "0.14%"}
    },
    {
        "id": "INC-8889",
        "timestamp": "10:55:40 UTC",
        "sector": "Sector 1 (Financial Core)",
        "type": "Cryptographic Ledger Skimming",
        "threatLevel": "ELEVATED",
        "suspect": "Darius Vance",
        "confidence": "89.7%",
        "status": "ANALYZING",
        "summary": "High-velocity micro-transactions draining liquidity from escrow vault.",
        "details": "Neural network flagged irregular flash-loan arbitrage draining $1.4M into offshore tumbler addresses.",
        "unitsDispatched": ["FinCEN Rapid Response Cell"],
        "telemetry": {"rssi": "-71 dBm", "frequency": "915.00 MHz", "packetLoss": "0.00%"}
    }
]

# Pre-seeded Case Management Database (Phase 2)
CASES_STORE = [
    {
        "id": "CASE #CR-2026-0142",
        "title": "Organized Network Infiltration (Port Sovereign)",
        "primary_suspect": "Viktor Voronin (The Architect / Cypher-9)",
        "suspects": [
            "Viktor Voronin (The Architect)", "Elena Rostov (Valkyrie)", "Darius Vance (Ironclad)",
            "Marcus Kane (Specter)", "Viktor Chen (Cipher_Ghost)", "Marek Rostov (The Vanguard)",
            "Elena Thorne (Chameleon-9)", "Tariq Al-Mansoor (The Alchemist)", "Katya Orlova (Red Phantom)",
            "Arturo Ruiz (El Silencio)", "Jin Park (ZeroTrace)", "Isabella Cruz (Nemesis)"
        ],
        "case_type": "Organized Syndicate",
        "status": "Active",
        "priority": "Critical",
        "created_date": "2026-09-14 08:30 UTC",
        "last_updated": "2026-09-18 11:42 UTC",
        "investigator": "Special Agent Marcus Vance",
        "reference_no": "DOJ-FED-8841-B",
        "tags": ["Port Security", "Crypto Laundering", "Apex Syndicate", "Avionics Smuggling", "SCADA Sabotage"],
        "description": "Cross-border taskforce investigation into the synchronized heist of avionics hardware at Harbor Terminal C, darknet escrow channels, and perimeter surveillance disruption.",
        "evidence_count": 8,
        "entity_count": 29,
        "investigation_status": "Active Surveillance / Multi-Node Wiretap Active",
        "is_synthetic": True
    },
    {
        "id": "CASE #CR-2026-0089",
        "title": "Phantom Rail Logistics & Cyber Diversion",
        "primary_suspect": "Marcus Kane (Specter) & Katya Orlova",
        "suspects": ["Marcus Kane (Specter)", "Katya Orlova (Red Phantom)", "Elena Rostov (Valkyrie)"],
        "case_type": "Cyber Warfare",
        "status": "Critical",
        "priority": "Critical",
        "created_date": "2026-09-10 14:15 UTC",
        "last_updated": "2026-09-18 09:20 UTC",
        "investigator": "Special Agent Sarah Reyes",
        "reference_no": "DOT-FRAUD-9912-X",
        "tags": ["SCADA Bypass", "Freight Rail", "GhostNet", "Interception"],
        "description": "Technical probe into automated SCADA track switcher manipulation along Sector 2 industrial rail corridor.",
        "evidence_count": 3,
        "entity_count": 8,
        "investigation_status": "Forensic Extraction Ongoing",
        "is_synthetic": True
    },
    {
        "id": "CASE #CR-2026-0044",
        "title": "Nightfall Escrow Laundering & Syndicate Mesh",
        "primary_suspect": "Tariq Al-Mansoor (The Alchemist)",
        "suspects": ["Tariq Al-Mansoor (The Alchemist)", "Elena Rostov (Valkyrie)", "Viktor Chen (Cipher_Ghost)"],
        "case_type": "Financial Fraud",
        "status": "Under Review",
        "priority": "High",
        "created_date": "2026-09-02 11:00 UTC",
        "last_updated": "2026-09-17 18:40 UTC",
        "investigator": "Special Agent David Torres",
        "reference_no": "FINCEN-SAR-3310-F",
        "tags": ["FinCEN", "Tether", "Tumbler", "Darknet", "Flash Loans"],
        "description": "Multi-jurisdictional financial tracking of offshore liquidity drained via flash-loan exploits into decentralized tumbler addresses.",
        "evidence_count": 3,
        "entity_count": 7,
        "investigation_status": "Asset Freeze Pending",
        "is_synthetic": True
    }
]

# Evidence Intelligence Store (Phase 2)
EVIDENCE_STORE = [
    {
        "id": "EV-0182",
        "name": "Call_Record_Microwave_Tap.csv",
        "type": "Call Records",
        "category": "Call Records",
        "case_id": "CASE #CR-2026-0142",
        "case_name": "Organized Network Infiltration (Port Sovereign)",
        "upload_date": "2026-09-18 03:22 UTC",
        "file_size": "248 KB",
        "mime_type": "text/csv",
        "source": "Customs Microwave Tap (Sector 4)",
        "status": "Verified",
        "processing_state": "ANALYZED",
        "checksum": "sha256:7f9a2b881c3e449910d5c8fa",
        "extracted_entities_count": 14,
        "detected_relationships_count": 27,
        "entities": [
            {"id": "ent-1", "name": "Viktor Voronin", "type": "Person", "confidence": 0.98, "threat": "CRITICAL"},
            {"id": "ent-2", "name": "Darius Vance", "type": "Person", "confidence": 0.94, "threat": "HIGH"},
            {"id": "ent-3", "name": "868MHz Jammer Frequency", "type": "Technical", "confidence": 0.96, "threat": "MEDIUM"},
            {"id": "ent-4", "name": "Warehouse 14B", "type": "Location", "confidence": 0.92, "threat": "HIGH"},
            {"id": "ent-5", "name": "Black Escalade", "type": "Vehicle", "confidence": 0.95, "threat": "HIGH"},
            {"id": "ent-6", "name": "Plate 8B9-CYP", "type": "Vehicle", "confidence": 0.97, "threat": "HIGH"},
            {"id": "ent-7", "name": "Gate 4 Customs", "type": "Location", "confidence": 0.91, "threat": "MEDIUM"},
            {"id": "ent-8", "name": "0x889...F1C Wallet", "type": "Bank Account", "confidence": 0.93, "threat": "CRITICAL"}
        ],
        "relationships": [
            {"source": "Viktor Voronin", "relation": "ORDERED_CONVOY_TO", "target": "Darius Vance", "confidence": 0.96},
            {"source": "Darius Vance", "relation": "OPERATING_VEHICLE", "target": "Black Escalade", "confidence": 0.94},
            {"source": "Black Escalade", "relation": "REGISTERED_PLATE", "target": "Plate 8B9-CYP", "confidence": 0.98},
            {"source": "Viktor Voronin", "relation": "RENDEZVOUS_AT", "target": "Warehouse 14B", "confidence": 0.92}
        ],
        "used_by_graph": True,
        "related_cases": ["CASE #CR-2026-0142", "CASE #CR-2026-0089"],
        "notes": "Intercept transcript contains direct tactical rendezvous coordinates and jammer frequency telemetry.",
        "is_synthetic": True
    },
    {
        "id": "EV-0183",
        "name": "FIR_Customs_Port_Report.pdf",
        "type": "Documents",
        "category": "Documents",
        "case_id": "CASE #CR-2026-0142",
        "case_name": "Organized Network Infiltration (Port Sovereign)",
        "upload_date": "2026-09-18 04:45 UTC",
        "file_size": "1.8 MB",
        "mime_type": "application/pdf",
        "source": "Port Authority Incident Desk",
        "status": "Verified",
        "processing_state": "ANALYZED",
        "checksum": "sha256:3d8e901a55cc48bb109aef82",
        "extracted_entities_count": 18,
        "detected_relationships_count": 31,
        "entities": [
            {"id": "ent-9", "name": "Terminal C Harbor Depot", "type": "Location", "confidence": 0.99, "threat": "HIGH"},
            {"id": "ent-10", "name": "Container TXUS-2291", "type": "Evidence", "confidence": 0.95, "threat": "CRITICAL"},
            {"id": "ent-11", "name": "Elena Rostov", "type": "Person", "confidence": 0.89, "threat": "HIGH"},
            {"id": "ent-12", "name": "Kowloon Port Cartel", "type": "Organization", "confidence": 0.94, "threat": "CRITICAL"}
        ],
        "relationships": [
            {"source": "Container TXUS-2291", "relation": "SEIZED_AT", "target": "Terminal C Harbor Depot", "confidence": 0.98},
            {"source": "Elena Rostov", "relation": "FORGED_MANIFEST_FOR", "target": "Container TXUS-2291", "confidence": 0.91}
        ],
        "used_by_graph": True,
        "related_cases": ["CASE #CR-2026-0142"],
        "notes": "First Information Report documenting physical seal breach on avionics crate.",
        "is_synthetic": True
    },
    {
        "id": "EV-0184",
        "name": "CCTV_Terminal_C_Frame_0418.jpg",
        "type": "Images",
        "category": "Images",
        "case_id": "CASE #CR-2026-0142",
        "case_name": "Organized Network Infiltration (Port Sovereign)",
        "upload_date": "2026-09-18 05:10 UTC",
        "file_size": "3.4 MB",
        "mime_type": "image/jpeg",
        "source": "Port Authority CCTV Feed 04",
        "status": "Verified",
        "processing_state": "ANALYZED",
        "checksum": "sha256:aa914f6b2123c5e88801ddee",
        "preview_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
        "extracted_entities_count": 3,
        "detected_relationships_count": 5,
        "entities": [
            {"id": "ent-1", "name": "Viktor Voronin", "type": "Person", "confidence": 0.964, "threat": "CRITICAL"},
            {"id": "ent-5", "name": "Black SUV (VIN: 7829-K)", "type": "Vehicle", "confidence": 0.91, "threat": "HIGH"},
            {"id": "ent-9", "name": "Terminal C Harbor Depot", "type": "Location", "confidence": 0.98, "threat": "HIGH"}
        ],
        "relationships": [
            {"source": "Viktor Voronin", "relation": "CAPTURED_BY_OPTICAL", "target": "Terminal C Harbor Depot", "confidence": 0.964},
            {"source": "Viktor Voronin", "relation": "DISEMBARKED_FROM", "target": "Black SUV (VIN: 7829-K)", "confidence": 0.92}
        ],
        "used_by_graph": True,
        "related_cases": ["CASE #CR-2026-0142"],
        "notes": "Facial biometric match confirmed at 96.4% confidence by ArcFace neural engine.",
        "is_synthetic": True
    },
    {
        "id": "EV-0185",
        "name": "Escrow_Wallet_Ledger_Dump.json",
        "type": "Financial Records",
        "category": "Financial Records",
        "case_id": "CASE #CR-2026-0142",
        "case_name": "Organized Network Infiltration (Port Sovereign)",
        "upload_date": "2026-09-18 06:15 UTC",
        "file_size": "512 KB",
        "mime_type": "application/json",
        "source": "FinCEN Blockchain Explorer Node",
        "status": "Verified",
        "processing_state": "ANALYZED",
        "checksum": "sha256:5502bc1149eef30a1122aa74",
        "extracted_entities_count": 7,
        "detected_relationships_count": 12,
        "entities": [
            {"id": "ent-8", "name": "Tether Wallet 0x889...F1C", "type": "Bank Account", "confidence": 0.97, "threat": "CRITICAL"},
            {"id": "ent-11", "name": "Elena Rostov", "type": "Person", "confidence": 0.93, "threat": "HIGH"},
            {"id": "ent-13", "name": "140 USDT Payoff", "type": "Transaction", "confidence": 0.95, "threat": "CRITICAL"}
        ],
        "relationships": [
            {"source": "Elena Rostov", "relation": "CONTROLLED_TRANSFER", "target": "140 USDT Payoff", "confidence": 0.95},
            {"source": "140 USDT Payoff", "relation": "SETTLED_TO", "target": "Tether Wallet 0x889...F1C", "confidence": 0.99}
        ],
        "used_by_graph": True,
        "related_cases": ["CASE #CR-2026-0142", "CASE #CR-2026-0044"],
        "notes": "Decrypted payload links escrow disbursement directly to harbormaster shift rotation.",
        "is_synthetic": True
    },
    {
        "id": "EV-0186",
        "name": "Drone_Recon_Sector2_Exchange.mp4",
        "type": "Videos",
        "category": "Videos",
        "case_id": "CASE #CR-2026-0089",
        "case_name": "Phantom Rail Logistics & Cyber Diversion",
        "upload_date": "2026-09-18 07:30 UTC",
        "file_size": "42.5 MB",
        "mime_type": "video/mp4",
        "source": "UAV Wing 09 Airborne Scan",
        "status": "Verified",
        "processing_state": "ANALYZED",
        "checksum": "sha256:bb11002244ff99883377aa55",
        "extracted_entities_count": 2,
        "detected_relationships_count": 3,
        "entities": [
            {"id": "ent-14", "name": "Sector 2 Freight Exchange", "type": "Location", "confidence": 0.97, "threat": "HIGH"},
            {"id": "ent-11", "name": "Elena Rostov", "type": "Person", "confidence": 0.912, "threat": "HIGH"}
        ],
        "relationships": [
            {"source": "Elena Rostov", "relation": "SURVEILLED_AT", "target": "Sector 2 Freight Exchange", "confidence": 0.912}
        ],
        "used_by_graph": True,
        "related_cases": ["CASE #CR-2026-0089"],
        "notes": "Aerial thermal track showing subject receiving encrypted hardware token near rail switcher.",
        "is_synthetic": True
    },
    {
        "id": "EV-0187",
        "name": "Freight_SCADA_Telemetry_Log.txt",
        "type": "Documents",
        "category": "Documents",
        "case_id": "CASE #CR-2026-0089",
        "case_name": "Phantom Rail Logistics & Cyber Diversion",
        "upload_date": "2026-09-18 08:12 UTC",
        "file_size": "78 KB",
        "mime_type": "text/plain",
        "source": "Rail Traffic Control System",
        "status": "Under Review",
        "processing_state": "ANALYZED",
        "checksum": "sha256:ee44990022bb88cc661133aa",
        "extracted_entities_count": 5,
        "detected_relationships_count": 8,
        "entities": [
            {"id": "ent-15", "name": "Switch 14-B", "type": "Location", "confidence": 0.98, "threat": "HIGH"},
            {"id": "ent-16", "name": "Cellular Modem IP 198.51.100.44", "type": "Technical", "confidence": 0.96, "threat": "HIGH"},
            {"id": "ent-17", "name": "Marcus Kane", "type": "Person", "confidence": 0.85, "threat": "MEDIUM"}
        ],
        "relationships": [
            {"source": "Marcus Kane", "relation": "CONFIGURED_MODEM", "target": "Cellular Modem IP 198.51.100.44", "confidence": 0.85}
        ],
        "used_by_graph": False,
        "related_cases": ["CASE #CR-2026-0089"],
        "notes": "SCADA event log confirming timing override command initiated outside authorized operations grid.",
        "is_synthetic": True
    },
    {
        "id": "EV-0188",
        "name": "FinCEN_Suspicious_Activity_Report.pdf",
        "type": "Financial Records",
        "category": "Financial Records",
        "case_id": "CASE #CR-2026-0044",
        "case_name": "Nightfall Escrow Laundering & Syndicate Mesh",
        "upload_date": "2026-09-17 14:05 UTC",
        "file_size": "1.2 MB",
        "mime_type": "application/pdf",
        "source": "FinCEN Intelligence Division",
        "status": "Verified",
        "processing_state": "ANALYZED",
        "checksum": "sha256:119933aa55cc77bb44dd2288",
        "extracted_entities_count": 6,
        "detected_relationships_count": 9,
        "entities": [
            {"id": "ent-18", "name": "FinCEN Rapid Response Cell", "type": "Organization", "confidence": 0.99, "threat": "LOW"},
            {"id": "ent-2", "name": "Darius Vance", "type": "Person", "confidence": 0.897, "threat": "HIGH"},
            {"id": "ent-19", "name": "Darknet Tumbler Node 36", "type": "Bank Account", "confidence": 0.92, "threat": "CRITICAL"}
        ],
        "relationships": [
            {"source": "Darius Vance", "relation": "LINKED_TO_TUMBLER", "target": "Darknet Tumbler Node 36", "confidence": 0.897}
        ],
        "used_by_graph": True,
        "related_cases": ["CASE #CR-2026-0044"],
        "notes": "SAR detailing rapid multi-hop conversion from USDT into Monero via decentralized swap contracts.",
        "is_synthetic": True
    },
    {
        "id": "EV-0189",
        "name": "ALPR_Toll_Exit14_Plate_Capture.png",
        "type": "Location Data",
        "category": "Location Data",
        "case_id": "CASE #CR-2026-0142",
        "case_name": "Organized Network Infiltration (Port Sovereign)",
        "upload_date": "2026-09-18 09:50 UTC",
        "file_size": "2.1 MB",
        "mime_type": "image/png",
        "source": "State Highway Patrol ALPR Network",
        "status": "Verified",
        "processing_state": "ANALYZED",
        "checksum": "sha256:8877cc3311ff002244bb55ee",
        "preview_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
        "extracted_entities_count": 4,
        "detected_relationships_count": 6,
        "entities": [
            {"id": "ent-6", "name": "Plate 8B9-CYP", "type": "Vehicle", "confidence": 0.99, "threat": "HIGH"},
            {"id": "ent-20", "name": "Highway 101 Exit 14", "type": "Location", "confidence": 0.98, "threat": "MEDIUM"},
            {"id": "ent-5", "name": "Black SUV", "type": "Vehicle", "confidence": 0.94, "threat": "HIGH"}
        ],
        "relationships": [
            {"source": "Black SUV", "relation": "DETECTED_AT", "target": "Highway 101 Exit 14", "confidence": 0.99}
        ],
        "used_by_graph": True,
        "related_cases": ["CASE #CR-2026-0142"],
        "notes": "Automated license plate recognition camera captured vehicle fleeing northbound at high speed.",
        "is_synthetic": True
    }
]

# Real-time Case Activity Log (Phase 2)
CASE_TIMELINES = {
    "CASE #CR-2026-0142": [
        {"date": "2026-09-14 08:30 UTC", "event": "Case opened: Organized Network Infiltration (Port Sovereign)", "author": "S/A Vance", "type": "case_created"},
        {"date": "2026-09-15 11:20 UTC", "event": "Microwave tap deployed on Port Customs communication array", "author": "Technical Cell", "type": "intel_action"},
        {"date": "2026-09-18 03:22 UTC", "event": "Call_Record_Microwave_Tap.csv ingested & processed", "author": "System NLP", "type": "evidence_processed"},
        {"date": "2026-09-18 04:45 UTC", "event": "FIR_Customs_Port_Report.pdf uploaded by Port Authority Incident Desk", "author": "Officer H. Zhang", "type": "evidence_uploaded"},
        {"date": "2026-09-18 05:10 UTC", "event": "CCTV Frame 04:18 analyzed: Biometric match Viktor Voronin (96.4%)", "author": "Forensic Face Lab", "type": "biometric_match"},
        {"date": "2026-09-18 06:15 UTC", "event": "Tether wallet 0x889...F1C linked to Elena Rostov escrow ledger", "author": "FinCEN Analyst", "type": "entity_linked"},
        {"date": "2026-09-18 09:50 UTC", "event": "ALPR camera hit: Plate 8B9-CYP detected at Highway 101 Exit 14", "author": "Highway Patrol ALPR", "type": "sensor_hit"},
        {"date": "2026-09-18 11:42 UTC", "event": "Tactical units dispatched to Warehouse 14B staging perimeter", "author": "S/A Vance", "type": "command_dispatch"}
    ],
    "CASE #CR-2026-0089": [
        {"date": "2026-09-10 14:15 UTC", "event": "Case opened: Phantom Rail Logistics & Cyber Diversion", "author": "S/A Reyes", "type": "case_created"},
        {"date": "2026-09-18 07:30 UTC", "event": "Drone_Recon_Sector2_Exchange.mp4 uploaded & analyzed", "author": "UAV Wing 09", "type": "evidence_uploaded"},
        {"date": "2026-09-18 08:12 UTC", "event": "SCADA telemetry log ingested: Switch 14-B timing anomaly flagged", "author": "System SCADA", "type": "evidence_processed"}
    ],
    "CASE #CR-2026-0044": [
        {"date": "2026-09-02 11:00 UTC", "event": "Case opened: Nightfall Escrow Laundering & Syndicate Mesh", "author": "S/A Torres", "type": "case_created"},
        {"date": "2026-09-17 14:05 UTC", "event": "FinCEN_Suspicious_Activity_Report.pdf verified and indexed", "author": "FinCEN Cell", "type": "evidence_uploaded"}
    ]
}

# Global state instances
class IntelligenceDB:
    def __init__(self):
        self.graph = copy.deepcopy(CYTOSCAPE_GRAPH_DATA)
        self.candidates = copy.deepcopy(CANDIDATE_GALLERY)
        self.evidence_cases = copy.deepcopy(VISUAL_EVIDENCE_CASES)
        self.resolution_cases = copy.deepcopy(ENTITY_RESOLUTION_CASES)
        self.incidents = copy.deepcopy(INCIDENTS_STORE)
        self.cases = copy.deepcopy(CASES_STORE)
        self.evidence_store = copy.deepcopy(EVIDENCE_STORE)
        self.timelines = copy.deepcopy(CASE_TIMELINES)
        self.conversations: Dict[str, Dict[str, Any]] = {}
        self.ai_config: Dict[str, Any] = {
            "provider": os.getenv("AI_PROVIDER", "builtin"),
            "model": os.getenv("AI_MODEL", "gpt-4o"),
            "api_key": os.getenv("AI_API_KEY") or os.getenv("OPENAI_API_KEY") or os.getenv("GEMINI_API_KEY", ""),
            "base_url": os.getenv("OPENAI_BASE_URL", "")
        }

    def get_graph(self):
        return self.graph

    def get_case_graph(self, case_id: Optional[str] = None):
        """
        Returns graph filtered by case_id, or merges evidence-extracted nodes/edges for dynamic cases.
        """
        all_nodes = self.graph.get("nodes", [])
        all_edges = self.graph.get("edges", [])

        if not case_id or case_id.upper() == "ALL":
            return {
                "nodes": all_nodes,
                "edges": all_edges,
                "total_nodes": len(all_nodes),
                "total_edges": len(all_edges)
            }

        norm_target_id = case_id.replace("CASE #", "").strip().upper()

        # Find nodes belonging to this case
        case_nodes = []
        node_id_set = set()
        node_label_map = {}

        for n in all_nodes:
            nd = n["data"]
            c_id = nd.get("case_id", "").replace("CASE #", "").strip().upper()
            if c_id == norm_target_id:
                case_nodes.append(n)
                node_id_set.add(nd["id"])
                node_label_map[nd.get("label", "").lower()] = nd["id"]

        # Also pull extracted entities from evidence_store for this case
        case_evidence = [e for e in self.evidence_store if e.get("case_id", "").replace("CASE #", "").strip().upper() == norm_target_id]
        
        type_shape_map = {
            "person": ("ellipse", "#f87171"),
            "phone": ("round-rectangle", "#38bdf8"),
            "vehicle": ("diamond", "#fbbf24"),
            "financial": ("hexagon", "#34d399"),
            "bank account": ("hexagon", "#34d399"),
            "financial account": ("hexagon", "#34d399"),
            "location": ("octagon", "#c084fc"),
            "organization": ("rectangle", "#f472b6"),
            "evidence": ("tag", "#38bdf8")
        }

        for ev in case_evidence:
            ev_node_id = f"ent-evid-{ev['id'].lower()}"
            if ev_node_id not in node_id_set:
                ev_node = {
                    "data": {
                        "id": ev_node_id,
                        "label": ev["name"][:24],
                        "type": "Evidence",
                        "shape": "tag",
                        "threat": "EVIDENCE",
                        "syndicate": "Forensic Vault",
                        "color": "#38bdf8",
                        "size": 42,
                        "details": f"Evidence {ev['id']} ({ev['type']}) uploaded into case docket.",
                        "case_id": ev.get("case_id", case_id)
                    }
                }
                case_nodes.append(ev_node)
                node_id_set.add(ev_node_id)

            for ent in ev.get("entities", []):
                ent_name = ent.get("name", "")
                ent_key = ent_name.lower()
                ent_type = ent.get("type", "Person")
                shape, color = type_shape_map.get(ent_type.lower(), ("ellipse", "#f87171"))
                ent_id = ent.get("id") or f"dyn-ent-{abs(hash(ent_name)) % 100000}"

                if ent_id not in node_id_set and ent_key not in node_label_map:
                    dynamic_node = {
                        "data": {
                            "id": ent_id,
                            "label": ent_name,
                            "type": ent_type,
                            "shape": shape,
                            "threat": ent.get("threat", "HIGH"),
                            "syndicate": "Investigated Entity",
                            "color": color,
                            "size": 42,
                            "details": f"Extracted from evidence {ev['id']} ({ev['name']}) with {int(ent.get('confidence', 0.9)*100)}% confidence.",
                            "case_id": case_id
                        }
                    }
                    case_nodes.append(dynamic_node)
                    node_id_set.add(ent_id)
                    node_label_map[ent_key] = ent_id

        # Edges for this case
        case_edges = []
        edge_id_set = set()

        for e in all_edges:
            ed = e["data"]
            c_id = ed.get("case_id", "").replace("CASE #", "").strip().upper()
            if c_id == norm_target_id or (ed["source"] in node_id_set and ed["target"] in node_id_set):
                case_edges.append(e)
                edge_id_set.add(ed["id"])

        # Create dynamic edges for extracted relationships from evidence
        for ev in case_evidence:
            ev_node_id = f"ent-evid-{ev['id'].lower()}"
            for rel in ev.get("relationships", []):
                src_name = rel.get("source", "").lower()
                tgt_name = rel.get("target", "").lower()
                src_id = node_label_map.get(src_name)
                tgt_id = node_label_map.get(tgt_name)

                if src_id and tgt_id:
                    dynamic_edge_id = f"dyn-edge-{src_id}-{tgt_id}"
                    if dynamic_edge_id not in edge_id_set:
                        edge_id_set.add(dynamic_edge_id)
                        case_edges.append({
                            "data": {
                                "id": dynamic_edge_id,
                                "source": src_id,
                                "target": tgt_id,
                                "relation": rel.get("relation", "CONNECTED_TO"),
                                "relation_type": "evidence_backed",
                                "confidence": rel.get("confidence", 0.92),
                                "supporting_evidence_id": ev["id"],
                                "supporting_evidence_name": ev["name"],
                                "evidence_source": ev.get("source", "Forensic Extraction"),
                                "explainability": f"Extracted via automated multi-entity relation extraction pipeline from {ev['name']}.",
                                "case_id": case_id
                            }
                        })

                # Also connect evidence node to primary source
                if src_id:
                    ev_link_id = f"dyn-evlink-{ev_node_id}-{src_id}"
                    if ev_link_id not in edge_id_set:
                        edge_id_set.add(ev_link_id)
                        case_edges.append({
                            "data": {
                                "id": ev_link_id,
                                "source": ev_node_id,
                                "target": src_id,
                                "relation": "DOCUMENTED_IN",
                                "relation_type": "evidence_backed",
                                "confidence": 0.95,
                                "supporting_evidence_id": ev["id"],
                                "supporting_evidence_name": ev["name"],
                                "evidence_source": ev.get("source", "Evidence Registry"),
                                "explainability": f"Entity identified directly within evidence asset {ev['id']}.",
                                "case_id": case_id
                            }
                        })

        return {
            "nodes": case_nodes if case_nodes else all_nodes,
            "edges": case_edges if case_nodes else all_edges,
            "total_nodes": len(case_nodes) if case_nodes else len(all_nodes),
            "total_edges": len(case_edges) if case_nodes else len(all_edges)
        }

    def get_edge_detail(self, edge_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves deep explainability and supporting evidence metadata for an edge.
        """
        for e in self.graph.get("edges", []):
            if e["data"]["id"] == edge_id:
                return e["data"]
        # Check if it was in evidence stores
        for ev in self.evidence_store:
            for rel in ev.get("relationships", []):
                return {
                    "id": edge_id,
                    "relation": rel.get("relation", "ASSOCIATED"),
                    "relation_type": "evidence_backed",
                    "confidence": rel.get("confidence", 0.90),
                    "supporting_evidence_id": ev["id"],
                    "supporting_evidence_name": ev["name"],
                    "evidence_source": ev.get("source", "Forensic Analysis"),
                    "explainability": f"Extracted from forensic artifact {ev['name']}.",
                    "case_id": ev.get("case_id", "CASE #CR-2026-0142")
                }
        return None


    # Case Management Methods (Phase 2)
    def get_cases(self) -> List[Dict[str, Any]]:
        for c in self.cases:
            c_evidence = [e for e in self.evidence_store if e.get("case_id") == c["id"]]
            c["evidence_count"] = len(c_evidence)
            entity_names = set()
            for e in c_evidence:
                for ent in e.get("entities", []):
                    entity_names.add(ent["name"])
            if entity_names:
                c["entity_count"] = len(entity_names)
        return self.cases

    def get_case(self, case_id: str) -> Optional[Dict[str, Any]]:
        for c in self.get_cases():
            if c["id"] == case_id or c["id"].replace("CASE #", "").strip() == case_id.replace("CASE #", "").strip():
                case_evidence = [e for e in self.evidence_store if e.get("case_id") == c["id"]]
                timeline = self.timelines.get(c["id"], [])
                entities = []
                seen_entities = set()
                for e in case_evidence:
                    for ent in e.get("entities", []):
                        if ent["name"] not in seen_entities:
                            seen_entities.add(ent["name"])
                            entities.append(ent)
                relationships = []
                for e in case_evidence:
                    for rel in e.get("relationships", []):
                        relationships.append(rel)

                return {
                    **c,
                    "evidence": case_evidence,
                    "entities": entities,
                    "relationships": relationships,
                    "timeline": timeline
                }
        return None

    def create_case(self, data: Dict[str, Any]) -> Dict[str, Any]:
        case_id = data.get("id")
        if not case_id:
            num = len(self.cases) + 143
            case_id = f"CASE #CR-2026-{str(num).zfill(4)}"

        new_case = {
            "id": case_id,
            "title": data.get("title", "Untitled Investigation"),
            "case_type": data.get("case_type", "Organized Syndicate"),
            "status": data.get("status", "Active"),
            "priority": data.get("priority", "Medium"),
            "created_date": data.get("created_date", "2026-09-18 19:48 UTC"),
            "last_updated": "2026-09-18 19:48 UTC",
            "investigator": data.get("investigator", "Special Agent Marcus Vance"),
            "reference_no": data.get("reference_no", f"REF-FED-{len(self.cases)+100}"),
            "tags": data.get("tags", []),
            "description": data.get("description", ""),
            "evidence_count": 0,
            "entity_count": 0,
            "investigation_status": "Initialized / Active Docket",
            "is_synthetic": True,
            "classification": "RESTRICTED-LEO"
        }
        self.cases.insert(0, new_case)
        self.timelines[case_id] = [
            {
                "date": new_case["created_date"],
                "event": f"Case docket initialized: {new_case['title']}",
                "author": new_case["investigator"],
                "type": "case_created"
            }
        ]
        return new_case

    def update_case(self, case_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for i, c in enumerate(self.cases):
            if c["id"] == case_id:
                for k, v in updates.items():
                    if k not in ["id", "created_date"]:
                        c[k] = v
                c["last_updated"] = "2026-09-18 19:50 UTC"
                self.cases[i] = c
                return c
        return None

    # Evidence Intelligence Methods (Phase 2)
    def get_evidence(self, case_id: Optional[str] = None, category: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        results = self.evidence_store
        if case_id:
            results = [e for e in results if e.get("case_id") == case_id]
        if category and category != "ALL":
            results = [e for e in results if e.get("category", "").lower() == category.lower() or e.get("type", "").lower() == category.lower()]
        if search:
            q = search.lower()
            results = [
                e for e in results
                if q in e.get("name", "").lower()
                or q in e.get("id", "").lower()
                or q in e.get("source", "").lower()
                or q in e.get("case_id", "").lower()
                or any(q in ent.get("name", "").lower() for ent in e.get("entities", []))
            ]
        return results

    def get_evidence_by_id(self, evidence_id: str) -> Optional[Dict[str, Any]]:
        for e in self.evidence_store:
            if e["id"] == evidence_id:
                return e
        return None

    def add_evidence(self, evidence_data: Dict[str, Any]) -> Dict[str, Any]:
        ev_id = evidence_data.get("id") or f"EV-{str(len(self.evidence_store) + 182).zfill(4)}"
        case_id = evidence_data.get("case_id", "CASE #CR-2026-0142")

        case_obj = next((c for c in self.cases if c["id"] == case_id), None)
        case_name = case_obj["title"] if case_obj else "Active Investigation"

        new_ev = {
            "id": ev_id,
            "name": evidence_data.get("name", "Unnamed_File.dat"),
            "type": evidence_data.get("type", "Documents"),
            "category": evidence_data.get("category", evidence_data.get("type", "Documents")),
            "case_id": case_id,
            "case_name": case_name,
            "upload_date": "2026-09-18 19:50 UTC",
            "file_size": evidence_data.get("file_size", "1.2 MB"),
            "mime_type": evidence_data.get("mime_type", "application/octet-stream"),
            "source": evidence_data.get("source", "Field Investigator Upload"),
            "status": "Verified",
            "processing_state": evidence_data.get("processing_state", "ANALYZED"),
            "checksum": f"sha256:{hex(abs(hash(ev_id + evidence_data.get('name', ''))))[2:]}",
            "preview_url": evidence_data.get("preview_url", ""),
            "extracted_entities_count": len(evidence_data.get("entities", [])),
            "detected_relationships_count": len(evidence_data.get("relationships", [])),
            "entities": evidence_data.get("entities", []),
            "relationships": evidence_data.get("relationships", []),
            "used_by_graph": True,
            "related_cases": [case_id],
            "notes": evidence_data.get("notes", "Evidence ingested into chain of custody."),
            "is_synthetic": True
        }
        self.evidence_store.insert(0, new_ev)

        if case_id not in self.timelines:
            self.timelines[case_id] = []
        self.timelines[case_id].append({
            "date": "2026-09-18 19:50 UTC",
            "event": f"Evidence ingested: {new_ev['name']} ({new_ev['id']})",
            "author": "Investigator Console",
            "type": "evidence_uploaded"
        })

        return new_ev

    def process_evidence(self, evidence_id: str, raw_content: Optional[str] = None) -> Optional[Dict[str, Any]]:
        evidence = self.get_evidence_by_id(evidence_id)
        if not evidence:
            return None

        name = evidence["name"].lower()
        extracted_entities = []
        extracted_relationships = []

        if "csv" in name or "call" in name or "transcript" in name or "report" in name or "pdf" in name:
            extracted_entities = [
                {"id": f"ent-{evidence_id}-1", "name": "Viktor Voronin", "type": "Person", "confidence": 0.98, "threat": "CRITICAL"},
                {"id": f"ent-{evidence_id}-2", "name": "Darius Vance", "type": "Person", "confidence": 0.94, "threat": "HIGH"},
                {"id": f"ent-{evidence_id}-3", "name": "Black Escalade (8B9-CYP)", "type": "Vehicle", "confidence": 0.96, "threat": "HIGH"},
                {"id": f"ent-{evidence_id}-4", "name": "Terminal C Harbor Depot", "type": "Location", "confidence": 0.92, "threat": "HIGH"},
                {"id": f"ent-{evidence_id}-5", "name": "0x889...F1C Escrow", "type": "Bank Account", "confidence": 0.95, "threat": "CRITICAL"}
            ]
            extracted_relationships = [
                {"source": "Viktor Voronin", "relation": "COMMUNICATED_WITH", "target": "Darius Vance", "confidence": 0.94},
                {"source": "Darius Vance", "relation": "OPERATED", "target": "Black Escalade (8B9-CYP)", "confidence": 0.96},
                {"source": "Viktor Voronin", "relation": "CONTROLS_ESCROW", "target": "0x889...F1C Escrow", "confidence": 0.95}
            ]
            evidence["processing_state"] = "ANALYZED"
        elif any(ext in name for ext in [".jpg", ".jpeg", ".png"]):
            extracted_entities = [
                {"id": f"ent-{evidence_id}-1", "name": "Viktor Voronin", "type": "Person", "confidence": 0.964, "threat": "CRITICAL"}
            ]
            extracted_relationships = [
                {"source": "Viktor Voronin", "relation": "CAPTURED_BY_OPTICAL", "target": "Terminal C", "confidence": 0.964}
            ]
            evidence["processing_state"] = "ANALYZED"
        elif any(ext in name for ext in [".mp4", ".webm"]):
            extracted_entities = [
                {"id": f"ent-{evidence_id}-1", "name": "Elena Rostov", "type": "Person", "confidence": 0.912, "threat": "HIGH"}
            ]
            evidence["processing_state"] = "ANALYZED"
        else:
            evidence["processing_state"] = "ANALYZED"
            evidence["notes"] = "Entity extraction unavailable for this file type."

        evidence["entities"] = extracted_entities
        evidence["relationships"] = extracted_relationships
        evidence["extracted_entities_count"] = len(extracted_entities)
        evidence["detected_relationships_count"] = len(extracted_relationships)

        return evidence

    def search_all(self, query: str) -> Dict[str, Any]:
        q = query.strip().lower()
        if not q:
            return {"cases": [], "evidence": [], "entities": [], "total_matches": 0}

        matched_cases = []
        for c in self.get_cases():
            if (q in c["id"].lower() or q in c["title"].lower() or
                q in c["case_type"].lower() or q in c["investigator"].lower() or
                any(q in t.lower() for t in c.get("tags", []))):
                matched_cases.append({
                    "id": c["id"],
                    "title": c["title"],
                    "subtitle": f"{c['case_type']} · {c['priority']} Priority",
                    "status": c["status"],
                    "category": "CASE"
                })

        matched_evidence = []
        for e in self.evidence_store:
            if (q in e["id"].lower() or q in e["name"].lower() or
                q in e["type"].lower() or q in e.get("source", "").lower() or
                q in e.get("case_id", "").lower()):
                matched_evidence.append({
                    "id": e["id"],
                    "title": e["name"],
                    "subtitle": f"{e['type']} · {e['case_id']}",
                    "status": e.get("processing_state", "ANALYZED"),
                    "category": "EVIDENCE"
                })

        matched_entities = []
        seen_entity_names = set()
        for node in self.graph["nodes"]:
            nd = node["data"]
            name = nd.get("label", "")
            if (q in name.lower() or q in nd.get("type", "").lower() or
                q in nd.get("details", "").lower() or q in nd.get("syndicate", "").lower()):
                if name not in seen_entity_names:
                    seen_entity_names.add(name)
                    matched_entities.append({
                        "id": nd.get("id"),
                        "title": name,
                        "subtitle": f"{nd.get('type', 'Entity').upper()} · {nd.get('syndicate', 'Syndicate')}",
                        "status": nd.get("threat", "HIGH"),
                        "category": "ENTITY"
                    })

        for e in self.evidence_store:
            for ent in e.get("entities", []):
                ent_name = ent.get("name", "")
                if q in ent_name.lower() or q in ent.get("type", "").lower():
                    if ent_name not in seen_entity_names:
                        seen_entity_names.add(ent_name)
                        matched_entities.append({
                            "id": ent.get("id", ent_name),
                            "title": ent_name,
                            "subtitle": f"{ent.get('type', 'Entity')} in {e['id']}",
                            "status": ent.get("threat", "IDENTIFIED"),
                            "category": "ENTITY"
                        })

        return {
            "cases": matched_cases,
            "evidence": matched_evidence,
            "entities": matched_entities,
            "total_matches": len(matched_cases) + len(matched_evidence) + len(matched_entities)
        }

    def add_evidence_link(self, evidence_id: str, suspect_id: str, match_confidence: float):
        # Create a new edge linking the visual evidence to the suspect
        edge_id = f"e-evid-match-{evidence_id}-{suspect_id}"
        new_edge = {
            "data": {
                "id": edge_id,
                "source": evidence_id,
                "target": suspect_id,
                "relation": "BIOMETRIC_FACE_MATCH",
                "confidence": match_confidence,
                "weight": 3
            }
        }
        # Check if already present
        for e in self.graph["edges"]:
            if e["data"]["id"] == edge_id:
                return e
        self.graph["edges"].append(new_edge)
        return new_edge

    def merge_entities(self, primary_id: str, alias_name: str, score: float):
        # Add alias attribute to primary node in graph
        for node in self.graph["nodes"]:
            if node["data"]["id"] == primary_id:
                existing_aliases = node["data"].get("aliases", [])
                if alias_name not in existing_aliases:
                    existing_aliases.append(alias_name)
                    node["data"]["aliases"] = existing_aliases
                    node["data"]["details"] += f" [RESOLVED ALIAS: {alias_name} (Conf: {int(score*100)}%)]"
                return node
        return None

    # =========================================================================
    # CIRA AI Assistant Conversation Management (Phase 4)
    # =========================================================================
    def normalize_case_id(self, case_id: str) -> str:
        if not case_id:
            return "CASE #CR-2026-0142"
        return case_id.strip()

    def get_conversations(self, case_id: str) -> List[Dict[str, Any]]:
        norm_id = self.normalize_case_id(case_id)
        convs = [c for c in self.conversations.values() if c.get("case_id") == norm_id]
        convs.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
        return convs

    def get_conversation(self, case_id: str, conversation_id: str) -> Optional[Dict[str, Any]]:
        norm_id = self.normalize_case_id(case_id)
        conv = self.conversations.get(conversation_id)
        if conv and conv.get("case_id") == norm_id:
            return conv
        return None

    def create_conversation(self, case_id: str, title: Optional[str] = None, user_id: Optional[str] = "agent.vance@crimenet.gov") -> Dict[str, Any]:
        norm_id = self.normalize_case_id(case_id)
        conv_id = f"cira-thread-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{abs(hash(title or norm_id)) % 10000}"
        now_iso = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        
        initial_message = {
            "id": "msg-0",
            "role": "assistant",
            "content": f"**CASE INTELLIGENCE BRIEFING // DOCKET {norm_id}**\n\nActive docket records, verified evidence logs, and entity network topologies are synchronized for case inquiry.\n\nEnter specific investigative directives to analyze suspect associations, trace financial escrow accounts, cross-reference wiretap transcripts, or compile probable cause summaries.",
            "timestamp": now_iso,
            "sources": [],
            "entities": [],
            "relationships": []
        }

        
        new_conv = {
            "id": conv_id,
            "case_id": norm_id,
            "title": title or f"Investigation Thread #{len(self.get_conversations(norm_id)) + 1}",
            "user_id": user_id,
            "created_at": now_iso,
            "updated_at": now_iso,
            "messages": [initial_message]
        }
        self.conversations[conv_id] = new_conv
        return new_conv

    def add_message(
        self,
        case_id: str,
        conversation_id: str,
        role: str,
        content: str,
        sources: Optional[List[Any]] = None,
        entities: Optional[List[Any]] = None,
        relationships: Optional[List[Any]] = None,
        tools_used: Optional[List[str]] = None
    ) -> Optional[Dict[str, Any]]:
        conv = self.get_conversation(case_id, conversation_id)
        if not conv:
            conv = self.create_conversation(case_id)
            conversation_id = conv["id"]
        
        now_iso = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        msg_id = f"msg-{len(conv['messages'])}"
        msg = {
            "id": msg_id,
            "role": role,
            "content": content,
            "timestamp": now_iso,
            "sources": sources or [],
            "entities": entities or [],
            "relationships": relationships or [],
            "tools_used": tools_used or []
        }
        conv["messages"].append(msg)
        conv["updated_at"] = now_iso
        
        # Auto-update conversation title from first user query if still generic
        if role == "user":
            user_msgs = [m for m in conv["messages"] if m["role"] == "user"]
            if len(user_msgs) == 1:
                clean_title = content.strip().split("\n")[0][:36]
                if clean_title:
                    conv["title"] = clean_title + ("..." if len(content) > 36 else "")
                
        return msg

    def rename_conversation(self, case_id: str, conversation_id: str, new_title: str) -> Optional[Dict[str, Any]]:
        conv = self.get_conversation(case_id, conversation_id)
        if conv and new_title.strip():
            conv["title"] = new_title.strip()
            conv["updated_at"] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
            return conv
        return None

    def delete_conversation(self, case_id: str, conversation_id: str) -> bool:
        conv = self.get_conversation(case_id, conversation_id)
        if conv:
            del self.conversations[conversation_id]
            return True
        return False

    def get_ai_config(self) -> Dict[str, Any]:
        return copy.deepcopy(self.ai_config)

    def set_ai_config(self, config: Dict[str, Any]) -> Dict[str, Any]:
        for k in ["provider", "model", "api_key", "base_url"]:
            if k in config and config[k] is not None:
                self.ai_config[k] = config[k]
        return self.get_ai_config()


db = IntelligenceDB()
