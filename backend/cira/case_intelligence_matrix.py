"""
CRIMENET AI - CIRA CASE INTELLIGENCE MATRIX & SYNDICATE DOSSIERS
=====================================================================
Comprehensive criminal syndicate dossiers, operative profiles,
financial escrow conduits, cross-case linkages, and forensic evidence indexes
for the CIRA Intelligence & Reasoning Assistant.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime

# =============================================================================
# 1. TRANSNATIONAL SYNDICATE DOSSIERS (10 MAJOR NETWORKS)
# =============================================================================

SYNDICATE_DOSSIERS: Dict[str, Dict[str, Any]] = {
    "GHOST_SYNDICATE": {
        "codename": "GHOST SYNDICATE",
        "jurisdiction": "Transnational (Eastern Europe, Western Europe, North America)",
        "threat_level": "CRITICAL",
        "estimated_annual_proceeds": "$180,000,000 USD",
        "primary_enterprises": [
            "Critical Infrastructure Cyber-Extortion / Ransomware",
            "Maritime Cargo Container Rip-Off / Smuggling",
            "Multi-Signature Cryptocurrency Escrow Layering",
            "Public Corruption of Port Customs Authorities"
        ],
        "organizational_structure": {
            "architect": "Viktor Voronin ('Apex Ghost')",
            "financial_broker": "Elena Rostov ('Crypto Valkyrie')",
            "logistics_coordinator": "Darius Vance ('Ghost Driver')",
            "telecom_conduit": "Marcus Vance",
            "darknet_developer": "Ghost_0x"
        },
        "operating_doctrine": (
            "Maintains strict compartmentalization between cyber-extortion crews and physical port distribution. "
            "Financial proceeds from ransomware campaigns are locked into multi-signature smart contracts, then "
            "dispersed as capital investments into freight logistics hubs (Phoenix Logistics) to purchase legitimate "
            "commercial maritime transport assets."
        ),
        "active_dockets": ["CASE #CR-2026-0142", "CASE #CR-2026-0089", "CASE #CR-2025-0914"]
    },
    "PHOENIX_LOGISTICS_NETWORK": {
        "codename": "PHOENIX LOGISTICS & MARITIME HOLDINGS",
        "registration": "Delaware Shell Corporation (DE-LLC-782910)",
        "threat_level": "HIGH",
        "nature": "Commercial Front Company / Money Laundering Conduit",
        "physical_locations": [
            "Warehouse 14B, South Pier Industrial Basin, Terminal C",
            "Logistics Dispatch Suite 402, Rotterdam Port Authority District",
            "Holding Office, George Town, Grand Cayman"
        ],
        "documented_assets": [
            "Fleet of 14 Freightliner Cascadia semi-trucks",
            "Black Cadillac Escalade (License Plate: 8B9-CYP / VIN: 7829-K)",
            "Commercial Rail Freight Switch Lease at Sector 2 Exchange",
            "Tether USDt Multi-Sig Escrow Wallet (0x889...F1C)"
        ],
        "financial_mechanics": (
            "Operates as a high-volume freight forwarder, co-mingling illicit contraband escrow funds with legitimate "
            "shipping fees. Invoices are systematically inflated (trade-based money laundering) to justify large cross-border "
            "wire transfers into European banking conduits."
        )
    },
    "BALTIC_NARCOTICS_PIPELINE": {
        "codename": "BALTIC SHADOW RING",
        "jurisdiction": "Baltic Sea Maritime Route (Gdansk, Klaipeda, St. Petersburg)",
        "threat_level": "HIGH",
        "primary_enterprises": [
            "Clandestine maritime transshipment using modified refrigerated cargo containers",
            "Corrupting commercial ship captains and automated AIS vessel tracking spoofers"
        ],
        "ties_to_ghost_syndicate": "Purchases encrypted RF comms equipment and crypto escrow services from Elena Rostov."
    },
    "IRON_HORIZON_WEAPONS_CARTEL": {
        "codename": "IRON HORIZON LOGISTICS",
        "jurisdiction": "Balkans / Middle East / North Africa",
        "threat_level": "CRITICAL",
        "primary_enterprises": [
            "Trafficking in military-grade night vision optics, thermal imaging scopes, and encrypted UHF tactical radios",
            "Airborne charter flights using deactivated flight transponders"
        ],
        "ties_to_ghost_syndicate": "Utilizes Phoenix Logistics warehouses as temporary domestic staging depots before export."
    },
    "BLACK_SCEPTER_CYBER": {
        "codename": "BLACK SCEPTER MERCENARY APTS",
        "jurisdiction": "Non-Extradition Cyber Haven",
        "threat_level": "CRITICAL",
        "primary_enterprises": [
            "State-sponsored cyber-sabotage targeting maritime SCADA logistics software",
            "Authoring zero-day exploits targeting terminal container gate automated sensors"
        ],
        "operational_link": "Provides technical exploit binaries to Viktor Voronin in exchange for physical cargo delivery channels."
    },
    "CASPIAN_RING_OFFSHORE": {
        "codename": "CASPIAN ASSET ESCROW",
        "jurisdiction": "Cyprus / Belize / British Virgin Islands",
        "threat_level": "HIGH",
        "primary_enterprises": [
            "Nominee director corporate shielding",
            "Layering multi-million dollar wire transfers through shell corporate trust accounts"
        ]
    }
}

# =============================================================================
# 2. SUSPECT OPERATIVE PROFILES & BIOGRAPHICAL INTEL
# =============================================================================

OPERATIVE_DOSSIERS: Dict[str, Dict[str, Any]] = {
    "VIKTOR_VORONIN": {
        "id": "PERSON-001",
        "full_name": "Viktor Anatolyevich Voronin",
        "aliases": ["Apex Ghost", "Ghost_Prime", "V. Vane", "Victor V.", "Architect 01"],
        "dob": "1978-04-14",
        "nationality": "Dual Russian Federation / Republic of Cyprus",
        "interpol_notice": "RED NOTICE #A-4891/9-2024 (Warrant Issued: Southern District of New York)",
        "threat_tier": "CRITICAL",
        "role": "Syndicate Strategic Architect / Primary Target",
        "known_locations": ["Port Sovereign Customs Perimeter", "Limassol Marina, Cyprus", "Dubai International Financial Centre"],
        "physical_descriptors": {
            "height": "186 cm (6'1\")",
            "weight": "88 kg",
            "eyes": "Steel Grey",
            "distinguishing_marks": "3cm vertical surgical scar beneath left zygomatic arch; tattoo of eight-pointed star on right shoulder blade"
        },
        "technical_skills": "Advanced cryptographic key management, RF counter-surveillance, offshore corporate structuring.",
        "biometric_gallery_id": "BIO-GAL-VORONIN-001 (512-dim ArcFace Embedding Verified)",
        "criminal_history": [
            "2012: Indicted for wire fraud (Eastern District of Virginia) - Dismissed due to witness disappearance",
            "2018: Named as co-conspirator in darknet mixing operation (USDOJ Sanctions)",
            "2024: Formal arrest warrant issued for 18 U.S.C. § 1962 (RICO) and § 1956 (Money Laundering)"
        ],
        "interrogation_leverage": "Insulated from physical crimes; vulnerable to asset forfeiture on foreign family trusts and frozen UAE escrow accounts."
    },
    "ELENA_ROSTOV": {
        "id": "PERSON-002",
        "full_name": "Elena Mikhailovna Rostov",
        "aliases": ["Crypto Valkyrie", "E. R. Sterling", "Alena Volkova"],
        "dob": "1985-09-22",
        "nationality": "Estonia (EU Citizen) / Golden Visa UAE",
        "threat_tier": "HIGH",
        "role": "Financial Escrow Controller & Darknet Broker",
        "known_locations": ["Tallinn Fintech District", "Sector 2 Rail Intercept Hub", "Phoenix Logistics Executive Suite"],
        "technical_skills": "Ethereum Solidity smart contract development, automated liquidity pool routing, FinCEN regulatory evasion.",
        "operational_vulnerability": "High network centrality; directly controls the multi-sig keys linking Phoenix Logistics to Voronin's offshore accounts. Flipping her breaks the financial backbone of the entire syndicate."
    },
    "DARIUS_VANCE": {
        "id": "PERSON-003",
        "full_name": "Darius Cole Vance",
        "aliases": ["Ghost Driver", "D-Train", "Vancey"],
        "dob": "1991-11-03",
        "nationality": "United States",
        "threat_tier": "HIGH",
        "role": "Tactical Fleet Operative & Transport Courier",
        "known_locations": ["Terminal C Harbor Depot", "Warehouse 14B", "Interstate 95 Corridor"],
        "prior_convictions": [
            "2015: Interstate Transportation of Stolen Property (18 U.S.C. § 2314) - 36 months served",
            "2020: Falsification of Commercial Motor Carrier Logs (49 U.S.C. § 521)"
        ],
        "tactical_role": "Pilots the black Cadillac Escalade (8B9-CYP) used for decoy maneuvers; operates heavy freight trucks equipped with cellular jammer arrays.",
        "interrogation_leverage": "High mandatory minimum exposure (15-20 years under CCE/RICO conspiracy); strong candidate for 5K1.1 substantial assistance cooperation."
    },
    "MARCUS_VANCE": {
        "id": "PERSON-004",
        "full_name": "Marcus Vance",
        "aliases": ["The Switchboard", "Marky V"],
        "dob": "1988-02-17",
        "nationality": "United States",
        "threat_tier": "ELEVATED",
        "role": "Communications Intermediary & Burner Phone Distributor",
        "network_metric": "Highest Betweenness Centrality in CASE #CR-2026-0142 (Connects Voronin to ground drivers).",
        "tactical_role": "Procures pre-activated burner SIM cards, operates the 868 MHz ISM RF repeater station, and transmits encoded drop coordinates."
    },
    "GHOST_0X": {
        "id": "PERSON-005",
        "full_name": "Unidentified Cyber Operative ('Ghost_0x')",
        "aliases": ["Ghost_0x", "ZeroPoint", "NullByte_99"],
        "threat_tier": "CRITICAL",
        "role": "SCADA Exploit Author & Darknet Sysadmin",
        "pgp_key_fingerprint": "7A89 E14B C092 1198 4402 9182 3341 BB90 0192 E4F1",
        "tactical_role": "Authored the cellular modem payload deployed against Rail Switcher 14-B."
    }
}

# =============================================================================
# 3. FORENSIC EXHIBITS MASTER INDEX
# =============================================================================

FORENSIC_EXHIBITS_INDEX: List[Dict[str, Any]] = [
    {
        "id": "EV-0182",
        "name": "Call_Record_Microwave_Tap.csv",
        "case_id": "CASE #CR-2026-0142",
        "category": "COMMUNICATION_INTERCEPT",
        "source": "Customs Microwave Tap (Sector 4)",
        "chain_of_custody_officer": "Special Agent Vance",
        "seizure_date": "2026-09-14 04:12:00 UTC",
        "evidentiary_summary": (
            "Encrypted burst transmission intercepted on 868.45 MHz ISM band. Decrypted audio transcript reveals "
            "voice matching Viktor Voronin instructing Darius Vance: 'Escalade leaves South Pier at 04:30. Take the I-95 "
            "decoy route while the freight container clears Gate 4.'"
        ),
        "forensic_status": "AUTHENTICATED_AND_ADMISSIBLE",
        "statutory_relevance": "18 U.S.C. § 1962(d) (RICO Conspiracy Overt Act) & 18 U.S.C. § 2518 (Title III Wiretap Authorization)."
    },
    {
        "id": "EV-0184",
        "name": "CCTV_Terminal_C_Frame_0418.jpg",
        "case_id": "CASE #CR-2026-0142",
        "category": "OPTICAL_SURVEILLANCE",
        "source": "Port Authority CCTV Optical Feed 04",
        "chain_of_custody_officer": "Port Detective Miller",
        "seizure_date": "2026-09-14 04:18:22 UTC",
        "evidentiary_summary": (
            "High-resolution 4K optical frame showing subject exiting silver Mercedes Sprinter van at Terminal C customs gate. "
            "Neural facial biometric match (ArcFace) achieves 96.4% cosine similarity with Viktor Voronin Interpol gallery vector."
        ),
        "forensic_status": "HASH_VERIFIED_SHA256",
        "statutory_relevance": "Places target physically at the scene of the cargo diversion."
    },
    {
        "id": "EV-0185",
        "name": "Escrow_Wallet_Ledger_Dump.json",
        "case_id": "CASE #CR-2026-0142",
        "category": "BLOCKCHAIN_FINANCIAL_RECORD",
        "source": "FinCEN Blockchain Explorer Node / Chainalysis Node",
        "chain_of_custody_officer": "Senior Analyst Chen",
        "seizure_date": "2026-09-14 05:00:14 UTC",
        "evidentiary_summary": (
            "Blockchain transaction logs tracking transfer of 140,000 Tether (USDt) from Phoenix Logistics smart contract "
            "into an unhosted multi-signature wallet (0x889...F1C). Cryptographic signature matches private key hash linked to Elena Rostov."
        ),
        "forensic_status": "IMMUTABLE_BLOCKCHAIN_RECEIPT",
        "statutory_relevance": "18 U.S.C. § 1956(a)(1)(B)(i) (Concealment Money Laundering)."
    },
    {
        "id": "EV-0186",
        "name": "Drone_Recon_Sector2_Exchange.mp4",
        "case_id": "CASE #CR-2026-0089",
        "category": "AERIAL_TACTICAL_VIDEO",
        "source": "UAV Wing 09 Airborne Scan",
        "chain_of_custody_officer": "UAV Operator Harris",
        "seizure_date": "2026-09-14 04:25:00 UTC",
        "evidentiary_summary": (
            "Thermal infrared aerial footage capturing rendezvous between black Cadillac Escalade (8B9-CYP) and commercial "
            "freight locomotive at Sector 2 rail switch. Telemetry verifies cargo container swapped onto rail platform in under 4 minutes."
        ),
        "forensic_status": "FULL_METADATA_PRESERVED",
        "statutory_relevance": "Establishes criminal enterprise logistics coordination between maritime port and domestic rail network."
    },
    {
        "id": "EV-0187",
        "name": "Freight_SCADA_Telemetry_Log.txt",
        "case_id": "CASE #CR-2026-0089",
        "category": "INDUSTRIAL_CYBER_TELEMETRY",
        "source": "Rail Traffic Control System",
        "chain_of_custody_officer": "Cyber Special Agent Kowalski",
        "seizure_date": "2026-09-14 04:22:15 UTC",
        "evidentiary_summary": (
            "Audit log showing unauthorized remote cellular modem command transmitted to Rail Switcher 14-B at 04:22 UTC. "
            "Originating IP traced to VPN exit node leased under Phoenix Logistics subsidiary corporate credit card."
        ),
        "forensic_status": "FORENSICALLY_IMAGED_E01",
        "statutory_relevance": "18 U.S.C. § 1030(a)(5) (Intentional Damage to Critical Infrastructure)."
    }
]

# =============================================================================
# 4. CHRONOLOGICAL CASE TIMELINE MATRIX
# =============================================================================

CASE_TIMELINES_MASTER: Dict[str, List[Dict[str, Any]]] = {
    "CASE #CR-2026-0142": [
        {"time": "03:45 UTC", "event": "Black Cadillac Escalade (8B9-CYP) detected on ALPR toll camera heading toward Port Terminal C.", "author": "Port Police ALPR"},
        {"time": "04:12 UTC", "event": "Customs Microwave Tap (EV-0182) intercepts 868 MHz burst comms ordering vehicle decoy deployment.", "author": "Special Agent Vance"},
        {"time": "04:18 UTC", "event": "Optical CCTV (EV-0184) captures facial recognition landmark match for Viktor Voronin at Gate 4.", "author": "Port Detective Miller"},
        {"time": "04:30 UTC", "event": "Escalade observed departing port perimeters at high velocity, leading patrol units toward I-95.", "author": "Tactical Unit 4"},
        {"time": "05:00 UTC", "event": "FinCEN node detects 140,000 USDt escrow transfer from Phoenix Logistics contract (EV-0185).", "author": "FinCEN Analyst Chen"},
        {"time": "06:15 UTC", "event": "Emergency federal search warrant application prepared for Warehouse 14B under Rule 41.", "author": "Special Agent Vance"}
    ],
    "CASE #CR-2026-0089": [
        {"time": "04:00 UTC", "event": "Industrial freight train #819 departs port yard on scheduled westbound manifest.", "author": "Rail Dispatcher"},
        {"time": "04:22 UTC", "event": "SCADA rail switcher 14-B receives unauthorized remote cellular override command (EV-0187).", "author": "Cyber Agent Kowalski"},
        {"time": "04:25 UTC", "event": "Drone Wing 09 aerial thermal scan confirms cargo transfer from rail car to waiting convoy (EV-0186).", "author": "UAV Pilot Harris"}
    ]
}

# =============================================================================
# 5. CASE MATRIX QUERY ENGINE
# =============================================================================

class CaseIntelligenceMatrix:
    """
    Query interface providing CIRA with deep syndicate intelligence,
    operative biographies, forensic exhibit cross-correlation, and timelines.
    """

    def __init__(self):
        self.syndicates = SYNDICATE_DOSSIERS
        self.operatives = OPERATIVE_DOSSIERS
        self.exhibits = FORENSIC_EXHIBITS_INDEX
        self.timelines = CASE_TIMELINES_MASTER

    def get_operative_dossier(self, name_or_alias: str) -> Optional[Dict[str, Any]]:
        """Retrieves comprehensive biographical intel for a suspect."""
        q = name_or_alias.lower().strip()
        for key, op in self.operatives.items():
            if (q in op["full_name"].lower() or q in op["id"].lower() or
                any(q in a.lower() for a in op.get("aliases", []))):
                return op
        return None

    def get_syndicate_briefing(self, syndicate_name: str) -> Optional[Dict[str, Any]]:
        """Retrieves organizational breakdown for a criminal syndicate."""
        q = syndicate_name.lower().strip()
        for key, syn in self.syndicates.items():
            if q in syn["codename"].lower() or any(w in q for w in syn["codename"].lower().split()):
                return syn
        return None

    def get_case_exhibits(self, case_id: str) -> List[Dict[str, Any]]:
        """Returns all forensic exhibits indexed under a specific case docket."""
        norm = case_id.replace("CASE #", "").strip().upper()
        return [e for e in self.exhibits if norm in e.get("case_id", "").upper()]

    def get_case_timeline(self, case_id: str) -> List[Dict[str, Any]]:
        """Returns full chronological timeline for a case docket."""
        for k, v in self.timelines.items():
            if case_id.replace("CASE #", "").strip().upper() in k.upper():
                return v
        return []

# Global singleton
cira_case_matrix = CaseIntelligenceMatrix()
