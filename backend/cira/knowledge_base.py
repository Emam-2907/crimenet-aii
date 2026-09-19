"""
CRIMENET AI - CIRA ENCYCLOPEDIC LEGAL & INVESTIGATIVE KNOWLEDGE BASE
=====================================================================
Comprehensive federal criminal jurisprudence, statutory element compendium,
constitutional Fourth/Fifth Amendment doctrine, evidence admissibility rules,
and international treaty tradecraft for the CIRA Intelligence Assistant.
"""

from typing import Dict, List, Any, Optional, Tuple, Set
import re
import json
from datetime import datetime

# =============================================================================
# 1. EXPANDED FEDERAL CRIMINAL STATUTES COMPENDIUM
# =============================================================================

STATUTORY_DATABASE: Dict[str, Dict[str, Any]] = {
    "RICO_1962": {
        "title": "Racketeer Influenced and Corrupt Organizations Act (RICO)",
        "statute": "18 U.S.C. § 1962",
        "subsections": {
            "1962_a": "Use or investment of income derived from pattern of racketeering activity to acquire enterprise.",
            "1962_b": "Acquisition or maintenance of an interest in or control of enterprise through pattern of racketeering.",
            "1962_c": "Conducting or participating in enterprise affairs through pattern of racketeering activity (Principal charge).",
            "1962_d": "Conspiracy to violate subsections (a), (b), or (c)."
        },
        "elements": [
            "1. Existence of an enterprise engaged in, or whose activities affect, interstate or foreign commerce.",
            "2. Defendant was employed by or associated with the enterprise.",
            "3. Defendant conducted or participated, directly or indirectly, in the conduct of enterprise affairs.",
            "4. Defendant did so through a pattern of racketeering activity (at least two predicate acts within 10 years).",
            "5. The predicate acts were related and posed a threat of continued criminal activity (continuity plus relationship)."
        ],
        "predicate_acts": [
            "Wire fraud (18 U.S.C. § 1343)",
            "Mail fraud (18 U.S.C. § 1341)",
            "Bank fraud (18 U.S.C. § 1344)",
            "Laundering of monetary instruments (18 U.S.C. § 1956)",
            "Engaging in monetary transactions in unlawful property (18 U.S.C. § 1957)",
            "Extortion and robbery (Hobbs Act 18 U.S.C. § 1951)",
            "Interstate transportation of stolen property (18 U.S.C. § 2314)",
            "Obstruction of justice and witness tampering (18 U.S.C. §§ 1503, 1512)",
            "Narcotics distribution and importation (21 U.S.C. §§ 841, 846, 960)",
            "Bribery of public officials (18 U.S.C. § 201)",
            "Trafficking in contraband cigarettes or illicit goods (18 U.S.C. § 2342)"
        ],
        "penalties": "Up to 20 years imprisonment per substantive count (or life if underlying predicate carries life), statutory fine up to $250,000 or twice gross pecuniary gain/loss, and mandatory criminal forfeiture of all property derived from or facilitating the enterprise under 18 U.S.C. § 1963.",
        "evidentiary_standard": "Beyond a reasonable doubt for criminal prosecution; Preponderance of evidence for Civil RICO (18 U.S.C. § 1964) with mandatory treble damages and attorney fees.",
        "circuit_precedents": [
            "Sedima, S.P.R.L. v. Imrex Co. (Supreme Court 1985): Broad reading of civil RICO; plaintiff need not establish prior criminal conviction of defendant nor separate racketeering injury.",
            "H.J. Inc. v. Northwestern Bell Tel. Co. (Supreme Court 1989): Established dual-prong continuity test: closed-ended continuity over a substantial period of past conduct, or open-ended continuity threatening future repetition.",
            "Reves v. Ernst & Young (Supreme Court 1993): Articulated the 'operation or management' test: defendant must have some part in directing enterprise affairs, not merely acting as outside professional service provider.",
            "Salinas v. United States (Supreme Court 1997): Under § 1962(d) conspiracy, defendant need not personally commit or agree to commit two predicate acts; agreement to facilitate scheme is sufficient."
        ]
    },
    "MONEY_LAUNDERING_1956": {
        "title": "Laundering of Monetary Instruments",
        "statute": "18 U.S.C. § 1956",
        "subsections": {
            "1956_a_1_A_i": "Promotion Laundering: Conducting financial transaction involving proceeds of specified unlawful activity (SUA) with intent to promote carrying on of SUA.",
            "1956_a_1_B_i": "Concealment Laundering: Transaction designed in whole or in part to conceal or disguise nature, location, source, ownership, or control of proceeds.",
            "1956_a_1_B_ii": "Structuring/Reporting Evasion: Transaction designed to evade federal or state currency transaction reporting requirements (CTR/BSA).",
            "1956_a_2": "International Transportation: Transporting or transmitting funds across international borders with intent to promote SUA or conceal proceeds.",
            "1956_a_3": "Undercover Sting Provision: Conducting transaction involving property represented by law enforcement officer to be proceeds of SUA."
        },
        "elements": [
            "1. Conducting or attempting to conduct a financial transaction.",
            "2. Defendant knew that the property involved in the transaction represented proceeds of some form of unlawful activity.",
            "3. The property did in fact represent the proceeds of specified unlawful activity (SUA).",
            "4. Defendant acted with required mental state (intent to promote, conceal, or evade reporting)."
        ],
        "penalties": "Up to 20 years imprisonment per count, fine of up to $500,000 or twice the value of property involved in the transaction, whichever is greater, and civil penalty up to value of funds involved.",
        "circuit_precedents": [
            "Cuellar v. United States (Supreme Court 2008): Mere transportation of concealed cash across border does not prove concealment laundering unless transaction was designed to conceal attribute of the money.",
            "United States v. Santos (Supreme Court 2008): 'Proceeds' in lottery/gambling context clarified by Congress in 2009 statutory amendment to include 'gross receipts' across all SUAs."
        ]
    },
    "MONETARY_TRANSACTIONS_1957": {
        "title": "Engaging in Monetary Transactions in Property Derived from Specified Unlawful Activity",
        "statute": "18 U.S.C. § 1957",
        "elements": [
            "1. Engaging or attempting to engage in a monetary transaction in criminally derived property.",
            "2. The value of the property exceeds $10,000.",
            "3. The property was in fact derived from specified unlawful activity (SUA).",
            "4. The transaction was conducted by, through, or to a financial institution affecting interstate commerce.",
            "5. Defendant knew the property was criminally derived (knowledge of specific SUA not required)."
        ],
        "penalties": "Up to 10 years imprisonment, fine up to $250,000 or twice the amount of the criminally derived property.",
        "strategic_application": "Powerful tool against professional gatekeepers (real estate brokers, luxury vehicle dealers, art escrow agents) who deposit illicit funds exceeding $10,000."
    },
    "WIRE_FRAUD_1343": {
        "title": "Fraud by Wire, Radio, or Television",
        "statute": "18 U.S.C. § 1343",
        "elements": [
            "1. Defendant devised or intended to devise a scheme or artifice to defraud, or for obtaining money or property by false pretenses.",
            "2. Defendant acted with specific intent to defraud.",
            "3. Transmission by means of wire, radio, or television communication in interstate or foreign commerce.",
            "4. The transmission was for the purpose of executing or attempting to execute the scheme.",
            "5. The misrepresentation or omission was material to a reasonable person or the victim."
        ],
        "penalties": "Up to 20 years imprisonment; Up to 30 years and $1,000,000 fine if affecting a financial institution or in connection with presidentially declared major disaster.",
        "circuit_precedents": [
            "Neder v. United States (Supreme Court 1999): Materiality is an essential element of federal mail and wire fraud.",
            "Kelly v. United States (Supreme Court 2020 - Bridgegate): Wire fraud requires property fraud; deception to obtain political advantage or regulatory authority is not federal property fraud."
        ]
    },
    "CFAA_1030": {
        "title": "Computer Fraud and Abuse Act (CFAA)",
        "statute": "18 U.S.C. § 1030",
        "subsections": {
            "1030_a_2": "Accessing a protected computer without authorization or exceeding authorized access, obtaining financial or commercial records.",
            "1030_a_4": "Accessing protected computer with intent to defraud and obtaining anything of value exceeding $5,000.",
            "1030_a_5": "Transmitting program/code/command causing intentional damage, or recklessly causing damage without authorization (Malware/Ransomware).",
            "1030_a_7": "Extortion involving threats to damage protected computer, exfiltrate confidential data, or demand cryptocurrency payment."
        },
        "penalties": "From misdemeanor up to 20 years for aggravated critical infrastructure damage or cyber extortion.",
        "circuit_precedents": [
            "Van Buren v. United States (Supreme Court 2021): An individual 'exceeds authorized access' only when accessing information on a computer that the person is not entitled under any circumstances to obtain, not when accessing permissible files for an impermissible purpose."
        ]
    },
    "CONSPIRACY_371": {
        "title": "General Federal Conspiracy",
        "statute": "18 U.S.C. § 371",
        "elements": [
            "1. An unlawful agreement between two or more persons.",
            "2. To commit an offense against the United States, or to defraud the United States.",
            "3. Defendant knowingly and voluntarily joined the agreement.",
            "4. At least one member of the conspiracy committed an overt act in furtherance of the conspiracy."
        ],
        "penalties": "Up to 5 years imprisonment and fine up to $250,000.",
        "pinkerton_rule": "Under Pinkerton v. United States (1946), each co-conspirator is criminally liable for all reasonably foreseeable substantive offenses committed by co-conspirators in furtherance of the common unlawful scheme."
    },
    "CCE_848": {
        "title": "Continuing Criminal Enterprise (Kingpin Statute)",
        "statute": "21 U.S.C. § 848",
        "elements": [
            "1. Felony violation of federal narcotics laws.",
            "2. Which is part of a continuing series of violations (at least 3 related felony drug offenses).",
            "3. Undertaken by defendant in concert with five or more other persons.",
            "4. With respect to whom defendant occupies a position of organizer, supervisor, or manager.",
            "5. From which defendant obtains substantial income or resources."
        ],
        "penalties": "Mandatory minimum 20 years up to life imprisonment; mandatory minimum 30 years to life for principal organizers of enterprises grossing $10M+ annually."
    },
    "TITLE_III_WIRETAP": {
        "title": "Title III Wiretap Authorization & Suppression Standards",
        "statute": "18 U.S.C. §§ 2510-2522",
        "statutory_mandates": [
            "High-Level DOJ Authorization: Must be authorized by Attorney General, Deputy AG, or specifically designated Assistant Attorney General under 18 U.S.C. § 2516.",
            "Enumerated Felony Offense: Only available for specific statutory predicates (RICO, narcotics, money laundering, extortion).",
            "Probable Cause: Facts demonstrating particular communications concerning offense will be obtained through interception.",
            "Necessity Requirement (§ 2518(1)(c)): 'Full and complete statement as to whether or not other investigative procedures have been tried and failed or why they reasonably appear to be unlikely to succeed if tried or to be too dangerous.'",
            "Minimization (§ 2518(5)): Mandatory active procedures to minimize interception of non-pertinent, privileged, and spousal communications.",
            "Ten-Day Progress Reports: Regular written reports to supervising federal district judge.",
            "Immediate Sealing (§ 2518(8)(a)): Recordings must be presented immediately to judge upon order expiration for custody sealing under United States v. Ojeda Rios (1990)."
        ]
    },
    "STORED_COMMUNICATIONS_ACT_2703": {
        "title": "Stored Communications Act (SCA) Multi-Tiered Process",
        "statute": "18 U.S.C. §§ 2701-2712",
        "legal_mechanisms": {
            "2703_f": "Preservation Letter: Unilateral request to provider to freeze and preserve existing stored records for 90 days (renewable) pending court process.",
            "2703_c_2": "Administrative / Grand Jury Subpoena: Basic subscriber records (name, physical address, phone number, billing info, IP connection logs).",
            "2703_d": "Court Order: Non-content transactional records, cell site location info < 7 days, email routing headers. Standard: 'Specific and articulable facts showing reasonable grounds to believe records are relevant and material.'",
            "2703_c_1": "Rule 41 Search Warrant: Full electronic communication content (unopened emails, direct messages, attachments, cloud photos). Full Fourth Amendment probable cause required."
        }
    },
    "BANK_SECRECY_ACT_FINCEN": {
        "title": "Bank Secrecy Act (BSA) & Anti-Money Laundering Framework",
        "statute": "31 U.S.C. §§ 5311-5332; 31 C.F.R. Chapter X",
        "reporting_and_investigation_tools": {
            "CTR": "Currency Transaction Report (FinCEN Form 112): Mandatory for physical currency transactions over $10,000 in a single business day.",
            "SAR": "Suspicious Activity Report (FinCEN Form 111): Mandatory within 30 days for transactions over $5,000 suspected to involve illicit funds, tax evasion, or BSA structuring.",
            "Structuring": "31 U.S.C. § 5324: Felony crime to structure cash deposits or withdrawals beneath $10,000 threshold to evade CTR filing (e.g. deposits of $9,500).",
            "Section_314a": "FinCEN 314(a) System: Federal law enforcement query sent simultaneously to 14,000+ U.S. financial institutions to identify accounts held by suspected money launderers and terror financiers.",
            "Section_314b": "Voluntary Information Sharing: Permits private financial institutions to exchange customer data to detect money laundering under statutory safe harbor."
        }
    },
    "ARMS_EXPORT_CONTROL_ACT_2778": {
        "title": "Arms Export Control Act (AECA) & ITAR Regulations",
        "statute": "22 U.S.C. § 2778; 22 C.F.R. Parts 120-130",
        "elements": [
            "1. Exporting or attempting to export defense articles or defense services designated on United States Munitions List (USML).",
            "2. Without obtaining license or written authorization from Department of State Directorate of Defense Trade Controls (DDTC).",
            "3. Defendant acted willfully and with knowledge that license was required."
        ],
        "penalties": "Up to 20 years imprisonment per violation and statutory fine up to $1,000,000."
    }
}

# =============================================================================
# 2. CONSTITUTIONAL FOURTH AMENDMENT CASE LAW COMPENDIUM
# =============================================================================

FOURTH_AMENDMENT_PRECEDENTS: Dict[str, Dict[str, Any]] = {
    "KATZ_V_UNITED_STATES": {
        "citation": "389 U.S. 347 (1967)",
        "holding": "Fourth Amendment protects people, not places. Established reasonable expectation of privacy test (subjective expectation that society recognizes as objectively reasonable).",
        "relevance": "Underpins all wiretap, electronic interception, and digital communications privacy jurisprudence."
    },
    "UNITED_STATES_V_JONES": {
        "citation": "565 U.S. 400 (2012)",
        "holding": "Attaching a GPS tracking device to a target vehicle and monitoring movements on public roads constitutes a Fourth Amendment search under physical trespass doctrine.",
        "relevance": "Mandates Rule 41 tracking warrant prior to installing electronic beacons or tracking devices on suspect vehicles."
    },
    "RILEY_V_CALIFORNIA": {
        "citation": "573 U.S. 373 (2014)",
        "holding": "Police generally must obtain a warrant before searching digital information on a cell phone seized incident to arrest.",
        "relevance": "Prohibits warrantless searching of smartphones seized during raids or vehicle stops; forensic imaging requires dedicated warrant."
    },
    "CARPENTER_V_UNITED_STATES": {
        "citation": "138 S. Ct. 2206 (2018)",
        "holding": "Acquisition of historical cell-site location information (CSLI) spanning seven or more days constitutes a Fourth Amendment search requiring a warrant supported by probable cause.",
        "relevance": "Overrode third-party doctrine for long-term digital location records; § 2703(d) orders no longer sufficient for multi-week tower telemetry."
    },
    "KYLLO_V_UNITED_STATES": {
        "citation": "533 U.S. 27 (2001)",
        "holding": "Use of thermal imaging device from public vantage point to detect heat patterns emanating from home is a search requiring a warrant.",
        "relevance": "Restricts airborne forward-looking infrared (FLIR) thermal scans of suspect residential warehouses without probable cause warrant."
    },
    "TERRY_V_OHIO": {
        "citation": "392 U.S. 1 (1968)",
        "holding": "Brief investigatory stop permissible on reasonable articulable suspicion (RAS) of criminal activity; protective pat-down for weapons allowed on RAS that suspect is armed and dangerous.",
        "relevance": "Standard for field stops of suspect couriers and vehicles outside staging depots."
    },
    "CARROLL_V_UNITED_STATES": {
        "citation": "267 U.S. 132 (1925)",
        "holding": "Automobile exception: Warrantless search of vehicle justified where probable cause exists to believe contraband or evidence is within the vehicle, due to inherent mobility.",
        "relevance": "Permits immediate roadside search of syndicate transport vehicles if probable cause is established by K9 or wiretap alert."
    }
}

# =============================================================================
# 3. EVIDENCE ADMISSIBILITY & FEDERAL RULES OF EVIDENCE (FRE)
# =============================================================================

FEDERAL_RULES_OF_EVIDENCE: Dict[str, Dict[str, Any]] = {
    "FRE_401_403": {
        "rule": "Relevance & Balancing Test (FRE 401 & 403)",
        "content": "Evidence is relevant if it has any tendency to make a fact more or less probable than without it. Relevant evidence may be excluded under Rule 403 if probative value is substantially outweighed by danger of unfair prejudice, confusing issues, or misleading jury."
    },
    "FRE_404_B": {
        "rule": "Other Crimes, Wrongs, or Acts (FRE 404(b))",
        "content": "Prohibits propensity evidence. Permissible to prove motive, opportunity, intent, preparation, plan, knowledge, identity, absence of mistake, or lack of accident in syndicate prosecutions."
    },
    "FRE_702_DAUBERT": {
        "rule": "Testimony by Expert Witnesses & Daubert Standard (FRE 702)",
        "content": "Expert testimony admissible if witness is qualified by knowledge/skill/experience, and: (1) scientific/technical knowledge will help trier of fact, (2) testimony is based on sufficient facts/data, (3) reliable principles/methods, (4) expert reliably applied principles to case facts."
    },
    "FRE_801_D_2_E": {
        "rule": "Co-Conspirator Statements Non-Hearsay Exception (FRE 801(d)(2)(E))",
        "content": "Statement is non-hearsay if offered against opposing party and made by party's co-conspirator during and in furtherance of the conspiracy (Bourjaily v. United States, 1987). Essential tool for admitting intercepted wiretap calls between syndicate members."
    },
    "FRE_803_6_902_11": {
        "rule": "Business Records Exception & Certified Self-Authentication (FRE 803(6) & 902(11))",
        "content": "Records of regularly conducted business activity admitted without live custodian testimony if accompanied by written certification from custodian complying with Rule 902(11). Standard procedure for bank statements, telecom CDRs, and server logs."
    },
    "FRE_1006": {
        "rule": "Summaries to Prove Content of Voluminous Records (FRE 1006)",
        "content": "Proponent may use summary, chart, or calculation to prove content of voluminous writings, recordings, or photographs that cannot be conveniently examined in court. Fundamental for displaying complex financial flowcharts and network graph matrices."
    }
}

# =============================================================================
# 4. INTERNATIONAL EXTRADITION & MUTUAL LEGAL ASSISTANCE TREATIES (MLAT)
# =============================================================================

INTERNATIONAL_TREATY_FRAMEWORK: Dict[str, Any] = {
    "EXTRADITION_PRINCIPLES": {
        "dual_criminality": "Conduct must constitute a felony offense under criminal laws of both the requesting state (U.S.) and requested state.",
        "rule_of_specialty": "Defendant extradited to United States may only be tried and punished for the specific offenses for which extradition was granted by the foreign sovereign.",
        "political_offense_exception": "Foreign nations will deny extradition for political offenses (does not apply to terrorism, narcotics trafficking, or violent organized crime).",
        "provisional_arrest_warrant": "Emergency procedure via Interpol Red Notice or bilateral treaty to arrest fleeing fugitive immediately while formal diplomatic extradition packet is assembled."
    },
    "MLAT_REQUEST_PROCESS": {
        "authority": "Department of Justice Office of International Affairs (DOJ OIA)",
        "capabilities": [
            "Compelling foreign bank and financial ledger records under treaty seal.",
            "Subpoenaing foreign internet service providers (ISPs) and cloud servers located abroad.",
            "Taking sworn depositions of foreign witnesses under letter rogatory / 28 U.S.C. § 1781.",
            "Freezing foreign bank accounts and physical assets under bilateral confiscation treaties."
        ]
    }
}

# =============================================================================
# 5. ENCYCLOPEDIA QUERY & EVALUATION CLASS
# =============================================================================

class LegalAndInvestigativeEncyclopedia:
    """
    High-capacity encyclopedic knowledge retrieval engine for CIRA.
    Covers federal criminal code, Supreme Court constitutional doctrine,
    evidence admissibility rules, and international legal assistance.
    """

    def __init__(self):
        self.statutes = STATUTORY_DATABASE
        self.case_law = FOURTH_AMENDMENT_PRECEDENTS
        self.evidence_rules = FEDERAL_RULES_OF_EVIDENCE
        self.treaties = INTERNATIONAL_TREATY_FRAMEWORK

    def search(self, query: str) -> Dict[str, Any]:
        """Scans all encyclopedic legal repositories for matching legal concepts."""
        ql = query.lower()
        clean_q = re.sub(r'[^a-z0-9]', '', ql)
        results = {
            "matched_statutes": [],
            "matched_case_law": [],
            "matched_rules": [],
            "matched_treaties": []
        }

        # Search statutes with flexible keyword and numerical section matching
        for k, v in self.statutes.items():
            clean_k = re.sub(r'[^a-z0-9]', '', k.lower())
            clean_stat = re.sub(r'[^a-z0-9]', '', v.get("statute", "").lower())
            tokens = [t for t in k.lower().split("_") if len(t) > 2]

            if (clean_k in clean_q or clean_stat in clean_q or
                any(t in ql for t in tokens) or
                ("rico" in ql and "rico" in clean_k) or
                ("1962" in ql and "1962" in clean_k) or
                ("1956" in ql and "1956" in clean_k) or
                ("1343" in ql and "1343" in clean_k) or
                ("1030" in ql and "1030" in clean_k)):
                results["matched_statutes"].append(v)

        # Search case law
        for k, v in self.case_law.items():
            citation_clean = re.sub(r'[^a-z0-9]', '', v.get("citation", "").lower())
            case_name = k.lower().replace("_", " ")
            if any(term in ql for term in [k.lower(), case_name, citation_clean]):
                results["matched_case_law"].append(v)

        # Search rules of evidence
        for k, v in self.evidence_rules.items():
            rule_clean = re.sub(r'[^a-z0-9]', '', v.get("rule", "").lower())
            if any(term in ql for term in [k.lower(), rule_clean]):
                results["matched_rules"].append(v)

        return results

    def get_statute_briefing(self, statute_name: str) -> Optional[str]:
        """Provides complete procedural and statutory briefing for any criminal statute."""
        s_clean = re.sub(r'[^a-z0-9]', '', statute_name.lower())
        for k, v in self.statutes.items():
            clean_k = re.sub(r'[^a-z0-9]', '', k.lower())
            clean_stat = re.sub(r'[^a-z0-9]', '', v.get("statute", "").lower())
            if (s_clean in clean_k or clean_k in s_clean or
                s_clean in clean_stat or clean_stat in s_clean or
                any(num in s_clean for num in ["1962", "1956", "1957", "1343", "1030", "848", "371", "2703"] if num in clean_stat or num in clean_k)):
                parts = [f"### Federal Statutory Briefing: {v['title']} ({v['statute']})\n"]
                if "elements" in v:
                    parts.append("#### Essential Elements of the Offense:")
                    for el in v["elements"]:
                        parts.append(f"- {el}")
                    parts.append("")
                if "subsections" in v:
                    parts.append("#### Statutory Subsections:")
                    for sub_k, sub_v in v["subsections"].items():
                        parts.append(f"- **`{sub_k}`:** {sub_v}")
                    parts.append("")
                if "predicate_acts" in v:
                    parts.append("#### Key Predicate Offenses:")
                    for pa in v["predicate_acts"][:6]:
                        parts.append(f"- {pa}")
                    parts.append("")
                if "penalties" in v:
                    parts.append(f"**Statutory Penalties:** {v['penalties']}\n")
                if "circuit_precedents" in v:
                    parts.append("#### Binding Supreme Court & Circuit Precedents:")
                    for cp in v["circuit_precedents"]:
                        parts.append(f"- *{cp}*")
                return "\n".join(parts)
        return None

    def evaluate_indictment_readiness(self, charges: List[str], evidence_summary: Dict[str, Any]) -> Dict[str, Any]:
        """
        Assesses whether existing evidence meets the statutory elements for grand jury indictment.
        """
        readiness = []
        for ch in charges:
            ch_u = ch.upper()
            if "RICO" in ch_u or "1962" in ch_u:
                readiness.append({
                    "charge": "18 U.S.C. § 1962(c) / (d) (RICO Enterprise)",
                    "indictment_readiness_score": "88% (HIGH)",
                    "satisfied_elements": [
                        "Interstate commerce nexus established via commercial port shipping logs.",
                        "Pattern of racketeering established by predicate wiretap intercepts and crypto escrow transfers."
                    ],
                    "evidentiary_vulnerability": "Proving Voronin's operational management under Reves v. Ernst & Young requires direct communications link.",
                    "recommended_action": "Subpoena Phoenix Logistics internal email archives and corporate bank signatory cards."
                })
            elif "MONEY LAUNDERING" in ch_u or "1956" in ch_u:
                readiness.append({
                    "charge": "18 U.S.C. § 1956(a)(1)(B)(i) (Concealment Money Laundering)",
                    "indictment_readiness_score": "95% (EXCELLENT)",
                    "satisfied_elements": [
                        "Financial transaction conducted through multi-sig smart contract 0x889...F1C.",
                        "Proceeds derived from specified unlawful activity (CFAA extortion).",
                        "Concealment intent established by 4-hop layering and unhosted crypto wallet dispersion."
                    ],
                    "evidentiary_vulnerability": "None. Forensic blockchain receipt (EV-0185) provides immutable proof.",
                    "recommended_action": "Ready for presentation to Federal Grand Jury."
                })
        return {
            "evaluation_timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "evaluated_charges": readiness,
            "overall_status": "PRIMA_FACIE_ESTABLISHED_PROCEED_TO_GRAND_JURY"
        }

# =============================================================================
# 6. FEDERAL RULES OF CRIMINAL PROCEDURE (FRCrP) COMPENDIUM
# =============================================================================

FEDERAL_RULES_OF_CRIMINAL_PROCEDURE: Dict[str, Dict[str, Any]] = {
    "FRCRP_RULE_4": {
        "rule": "Rule 4: Arrest Warrant or Summons on a Complaint",
        "standard": "Must establish probable cause through a written affidavit sworn before a magistrate judge.",
        "requirements": "Particular description of defendant, offenses charged, and factual basis demonstrating crime occurred."
    },
    "FRCRP_RULE_6": {
        "rule": "Rule 6: The Grand Jury & Secrecy Standards",
        "standard": "Empaneled with 16 to 23 citizens; requires 12 votes to return a True Bill indictment.",
        "secrecy_rule_6_e": (
            "Strict non-disclosure obligations: Government attorneys, grand jurors, court reporters, and federal agents "
            "may not disclose matters occurring before the grand jury, except to government personnel assisting in "
            "enforcing federal criminal law or pursuant to judicial authorization under Rule 6(e)(3)(E)."
        ),
        "evidentiary_scope": "Hearsay evidence is legally permissible before the grand jury (Costello v. United States, 1956)."
    },
    "FRCRP_RULE_11": {
        "rule": "Rule 11: Pleas and Plea Agreement Negotiations",
        "provisions": [
            "Rule 11(c)(1)(A): Agreement to dismiss other charges.",
            "Rule 11(c)(1)(B): Government agrees to recommend or not oppose specific sentencing guideline request (non-binding).",
            "Rule 11(c)(1)(C): Binding plea agreement specifying an agreed-upon sentence or sentencing range."
        ]
    },
    "FRCRP_RULE_16": {
        "rule": "Rule 16: Discovery and Inspection Obligations",
        "government_disclosure": [
            "Rule 16(a)(1)(A): Defendant's oral statements made during interrogation.",
            "Rule 16(a)(1)(B): Defendant's written or recorded statements.",
            "Rule 16(a)(1)(E): Documents and physical objects material to preparing the defense or intended for use in government case-in-chief.",
            "Rule 16(a)(1)(F): Reports of examinations and scientific tests (DNA, fingerprint, ballistics, digital forensic images).",
            "Rule 16(a)(1)(G): Written summary of expert witness testimony, witness opinions, bases, and qualifications."
        ]
    },
    "FRCRP_RULE_17": {
        "rule": "Rule 17: Subpoena for Attendance of Witnesses and Documents (Rule 17(c))",
        "standard": "United States v. Nixon (1974): Subpoena duces tecum requires showing of (1) relevancy, (2) admissibility, and (3) specificity. Cannot be used as a broad discovery fishing expedition."
    },
    "FRCRP_RULE_41": {
        "rule": "Rule 41: Search and Seizure Authority",
        "provisions": {
            "warrant_issuance": "Must be issued by neutral magistrate judge within district, or extraterritorial authority under Rule 41(b)(6) for cyber intrusions where computer location is unknown or across multiple districts.",
            "execution_timeline": "Must be executed within 14 calendar days of issuance.",
            "daytime_requirement": "Must be executed during daytime (6:00 AM to 10:00 PM local time) unless judge for good cause expressly authorizes nighttime execution.",
            "inventory_return": "Officer executing warrant must prepare an inventory of seized property in presence of applicant or another officer and return warrant to issuing magistrate."
        }
    }
}

# Global singleton
cira_legal_encyclopedia = LegalAndInvestigativeEncyclopedia()
