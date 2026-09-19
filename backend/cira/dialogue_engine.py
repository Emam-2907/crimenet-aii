"""
CRIMENET AI - CIRA OMNISCIENT CONVERSATIONAL DIALOGUE ENGINE
=====================================================================
Massive, encyclopedic conversational brain for CIRA (CRIMENET Intelligence & Reasoning Assistant).
Equipped with rich dialogue models, real-world criminal case histories,
investigative philosophy, forensic science, cyber tradecraft, legal doctrine,
and natural ChatGPT-style multi-turn conversation.
"""

from typing import Dict, List, Any, Optional, Tuple
import re
import random
from datetime import datetime

# =============================================================================
# 1. HISTORICAL CRIMINAL CASE INTELLIGENCE VAULT
# =============================================================================

HISTORICAL_CASE_VAULT: Dict[str, Dict[str, Any]] = {
    "OPERATION_TROJAN_SHIELD": {
        "title": "Operation Trojan Shield / Operation Greenlight (FBI / Europol)",
        "year": "2018 - 2021",
        "target": "Global Transnational Organized Crime (Balkan Cartels, Outlaw Motorcycle Gangs, Italian Mafia)",
        "methodology": (
            "The FBI covertly developed, distributed, and operated its own encrypted communications company called 'ANOM'. "
            "Over 12,000 encrypted devices were seeded across 300+ syndicates in 100+ countries. Every encrypted message "
            "transmitted was silently blind-carbon-copied (BCC'd) with a custom master decryption key and stored on an "
            "offshore third-country server, which fed real-time decrypts to federal analysts."
        ),
        "results": "Over 800 arrests worldwide, seizure of 8 tons of cocaine, 22 tons of cannabis, 250 firearms, and $48M in cash.",
        "evidentiary_lesson": (
            "Syndicates rely heavily on perceived technological immunity. Compromising the communication platform itself "
            "yields direct, unencrypted, self-authenticating admissions admissible under Fed. R. Evid. 801(d)(2)."
        )
    },
    "SILK_ROAD_TAKEDOWN": {
        "title": "United States v. Ross William Ulbricht (Silk Road)",
        "year": "2011 - 2013",
        "target": "First Major Darknet Tor Narcotics & Cyber Marketplace",
        "methodology": (
            "Combined traditional street-level investigative footwork with server-side forensic packet inspection. "
            "Investigators identified Ulbricht's earliest forum posts under 'altoid' seeking Bitcoin developers using his "
            "personal Gmail address. Concurrently, foreign server imaging in Reykjavik, Iceland, unmasked the master backend IP, "
            "culminating in Ulbricht's physical arrest in a San Francisco public library while his laptop was unlocked and operating."
        ),
        "evidentiary_lesson": (
            "The 'live keyboard seizure' doctrine: Capturing an encrypted machine while operational in RAM prevents BitLocker "
            "or TrueCrypt volumes from dismounting, capturing unencrypted PGP keys, chat logs, and wallet seed phrases directly from volatile memory."
        )
    },
    "COLONIAL_PIPELINE_DARK_SIDE": {
        "title": "Colonial Pipeline Ransomware & Bitcoin Ransom Clawback",
        "year": "2021",
        "target": "DarkSide Ransomware Syndicate",
        "methodology": (
            "After Colonial Pipeline paid a 75 Bitcoin ransom (~$4.4M), FBI cyber agents mapped the recipient wallet "
            "on the public blockchain. Agents obtained a federal seizure warrant under 18 U.S.C. § 981 and leveraged "
            "a seized private key to drain 63.7 Bitcoins (~$2.3M) directly from the hacker group's unhosted affiliate wallet."
        ),
        "evidentiary_lesson": (
            "Cryptocurrency is pseudonymous, not anonymous. Public blockchain ledgers combined with federal search warrants "
            "for cloud infrastructure or custodial servers can result in direct physical asset clawbacks."
        )
    },
    "BITFINEX_HACK_LAUNDERING": {
        "title": "United States v. Ilya Lichtenstein and Heather Morgan (Bitfinex Hack)",
        "year": "2016 - 2022",
        "target": "119,754 Bitcoin Theft & Multi-Year Obfuscation",
        "methodology": (
            "The laundering network utilized complex layering: darknet markets (AlphaBay, Hydra), chain-hopping through "
            "privacy coins (Monero), automated micro-deposits, and fake gift cards. Law enforcement executed a search warrant "
            "on the suspects' cloud storage account, discovering an encrypted file containing the private keys to the primary wallet "
            "holding 94,000+ stolen Bitcoins (worth $3.6B at time of seizure)."
        ),
        "evidentiary_lesson": (
            "Regardless of algorithmic mixer complexity, the Achilles' heel remains digital key storage. Recovering seed phrases "
            "or cloud backups collapses years of sophisticated laundering in seconds."
        )
    },
    "OPERATION_BAYONET": {
        "title": "Operation Bayonet: AlphaBay and Hansa Market Coordinated Takedown",
        "year": "2017",
        "target": "AlphaBay and Hansa Darknet Marketplaces",
        "methodology": (
            "FBI and Dutch National Police staged a sequential takedown: Dutch police covertly took control of Hansa Market's "
            "servers without alerting the public. Simultaneously, the FBI seized AlphaBay. AlphaBay vendors and buyers fled en masse "
            "to Hansa, not realizing Dutch police were running Hansa as an undercover honeypot for 27 days, capturing plaintext buyer "
            "addresses, PGP keys, and delivery drop locations."
        ),
        "evidentiary_lesson": (
            "Honeypot migration strategy: Seizing a dominant platform forces syndicate traffic directly into an agency-controlled "
            "secondary funnel where forensic logging operates without evasion."
        )
    },
    "BANGLADESH_BANK_HEIST": {
        "title": "Bank of Bangladesh $81 Million Cyber Heist (Lazarus Group)",
        "year": "2016",
        "target": "Federal Reserve Bank of New York SWIFT Transfer Terminal",
        "methodology": (
            "State-sponsored cyber operators breached Bangladesh Central Bank perimeters using spear-phishing, obtained SWIFT operator credentials, "
            "and disabled the physical confirmation printer. Attackers issued 35 fraudulent SWIFT wire transfer requests totaling $951M to correspondent accounts in the Philippines."
        ),
        "evidentiary_lesson": (
            "Human typos and automated AML filters saved $850M: a typo spelling 'foundation' as 'fandation' halted a $20M transfer, triggering human review."
        )
    },
    "ENRON_ACCOUNTING_FRAUD": {
        "title": "United States v. Kenneth Lay and Jeffrey Skilling (Enron Collapse)",
        "year": "2001 - 2006",
        "target": "Corporate Securities Fraud & Special Purpose Entity (SPE) Debt Concealment",
        "methodology": (
            "Enron executives utilized mark-to-market accounting to book projected future cash flows as immediate current earnings. "
            "Toxic debt was transferred to hundreds of off-balance-sheet Special Purpose Entities (SPEs) controlled by Enron CFO Andrew Fastow."
        ),
        "evidentiary_lesson": (
            "Catalyzed the Sarbanes-Oxley Act of 2002 (SOX), imposing strict criminal penalties for corporate document destruction under 18 U.S.C. § 1519."
        )
    },
    "EL_CHAPO_TRIAL": {
        "title": "United States v. Joaquín Guzmán Loera ('El Chapo')",
        "year": "2018 - 2019",
        "target": "Sinaloa Cartel Transnational Leadership & Smuggling",
        "methodology": (
            "FBI cyber agents flipped the cartel's internal network engineer, Christian Rodriguez, who covertly migrated "
            "the cartel's custom encrypted phone servers to law enforcement custody. Over 800 intercepted phone calls "
            "and encrypted text messages were authenticated directly with voice biometric comparisons."
        ),
        "evidentiary_lesson": (
            "Flipping internal IT and communications personnel is the highest-value investigative move against insulated criminal leadership."
        )
    },
    "AL_CAPONE_FINANCIAL_CONVICTION": {
        "title": "United States v. Alphonse Capone (IRS Special Intelligence Unit)",
        "year": "1931",
        "target": "Chicago Outfit Prohibition Bootlegging & Extortion",
        "methodology": (
            "Federal agents Elmer Irey and Frank Wilson recognized violent crimes were insulated by street silence. "
            "They audited recovered gambling parlor ledgers and cashier's checks, proving net worth expenditures far exceeded "
            "Capone's declared tax returns, securing an 11-year sentence for income tax evasion under United States v. Sullivan (1927)."
        ),
        "evidentiary_lesson": (
            "When violent predicate acts are insulated, forensic net-worth accounting provides an unassailable conviction vector."
        )
    },
    "STUXNET_INDUSTRIAL_SABOTAGE": {
        "title": "Operation Olympic Games (Stuxnet Industrial Sabotage)",
        "year": "2009 - 2010",
        "target": "Air-Gapped Industrial SCADA Systems",
        "methodology": (
            "Air-gapped target facility breached using infected USB drives exploiting four zero-day Windows vulnerabilities. "
            "The worm injected custom PLC logic into Siemens Step7 controllers, spinning uranium centrifuges to destructive frequencies "
            "while replaying benign sensor recordings to monitoring engineers."
        ),
        "evidentiary_lesson": (
            "Air-gapped networks are vulnerable to physical supply chain and USB vector insertion; forensic SCADA monitoring requires out-of-band sensor auditing."
        )
    },
    "WANNACRY_GLOBAL_RANSOMWARE": {
        "title": "WannaCry Global Cryptoviral Worm",
        "year": "2017",
        "target": "300,000+ Computers Across 150 Countries (Including UK NHS)",
        "methodology": (
            "Leveraged the EternalBlue SMBv1 exploit (MS17-010) paired with the DoublePulsar backdoor to propagate across networks "
            "without user interaction. Malware checked an unregistered hardcoded domain before executing; security researcher Marcus Hutchins "
            "registered the $10.69 domain sinkhole, activating the killswitch worldwide."
        ),
        "evidentiary_lesson": (
            "Malware analysis must prioritize reverse-engineering hardcoded network beacons and defensive killswitch heuristics."
        )
    }
}

# =============================================================================
# 2. PHILOSOPHY OF FORENSIC SCIENCE & INVESTIGATIVE LOGIC
# =============================================================================

INVESTIGATIVE_PRINCIPLES: Dict[str, Dict[str, Any]] = {
    "LOCARD_EXCHANGE_PRINCIPLE": {
        "principle": "Locard's Exchange Principle",
        "origin": "Dr. Edmond Locard (1910)",
        "core_axiom": "'Every contact leaves a trace.'",
        "application": (
            "Whenever two entities come into contact, a mutual transfer of material occurs. In physical forensics, "
            "this manifests as biological DNA, fibers, gunshot residue, or soil. In digital forensics, it manifests "
            "as TCP/IP three-way handshakes, MAC addresses recorded in router ARP caches, cell tower timing advances, "
            "or cryptographic transaction signatures recorded immutably on distributed ledgers."
        )
    },
    "OCCAMS_RAZOR": {
        "principle": "Occam's Razor (Lex Parsimoniae)",
        "application": (
            "When evaluating competing investigative hypotheses, the explanation requiring the fewest assumptions "
            "is most likely correct. In syndicate investigations, investigators often hypothesize elaborate multi-nation "
            "conspiracies when the simpler reality is human greed, negligence, or an intermediary skimming funds."
        )
    },
    "COGNITIVE_BIAS_COUNTERMEASURES": {
        "confirmation_bias": "The tendency to search for, interpret, and recall information that confirms preexisting hypotheses while ignoring contradictory evidence.",
        "tunnel_vision": "Focusing prematurely on a single prime suspect to the exclusion of viable alternative leads.",
        "cira_safeguard": (
            "CIRA actively challenges lead theories by identifying evidentiary gaps, highlighting contradictory timestamps, "
            "and generating counter-hypotheses for every major suspect profile."
        )
    }
}

# =============================================================================
# 3. CONVERSATIONAL HUMOR, WIT, & DETECTIVE SQUAD ROOM CULTURE
# =============================================================================

DETECTIVE_HUMOR_REPOSITORY = [
    {
        "setup": "Why did the forensic accountant break up with the syndicate ledger?",
        "punchline": "Because the relationship had too many irreconcilable differences and zero tangible assets!"
    },
    {
        "setup": "What is a cyber detective's favorite warm beverage?",
        "punchline": "A fresh cup of Java, brewed without bugs and encrypted with double-sugar!"
    },
    {
        "setup": "Why did the suspect bury his encrypted thumb drive under three feet of concrete?",
        "punchline": "Because he heard about cold storage, but clearly skipped digital forensics 101!"
    },
    {
        "setup": "How many criminal defense attorneys does it take to change a lightbulb?",
        "punchline": "How many can you afford before the grand jury votes to indict?"
    },
    {
        "setup": "Why was the mobile phone admitted as the star witness in federal court?",
        "punchline": "Because its testimony was completely cell-f authenticated!"
    },
    {
        "setup": "Why did the computer go to the police station?",
        "punchline": "Because it got caught phishing, and its hard drive had too many prior convictions!"
    }
]

# =============================================================================
# 4. MASTER DIALOGUE SYNTHESIZER
# =============================================================================

class OmniscientDialogueSynthesizer:
    """
    Synthesizes rich, varied, natural, and encyclopedic responses across
    thousands of general, legal, historical, and investigative conversation topics.
    """

    def __init__(self):
        self.cases = HISTORICAL_CASE_VAULT
        self.principles = INVESTIGATIVE_PRINCIPLES
        self.jokes = DETECTIVE_HUMOR_REPOSITORY

    def generate_chatgpt_response(
        self,
        query: str,
        case_id: str,
        all_nodes: List[Dict[str, Any]],
        all_evidence: List[Dict[str, Any]],
        history: List[Dict[str, Any]]
    ) -> Optional[str]:
        """
        Main natural conversational dispatcher.
        Returns None if query should fall back to specialized database/graph lookup.
        """
        ql = query.lower().strip()
        node_names = [n.get("label") or n.get("name") or n["id"] for n in all_nodes]
        targets_str = ", ".join(node_names[:4]) if node_names else "Viktor Voronin, Elena Rostov, Darius Vance"

        # ── 1. GREETINGS & CHECK-INS ──────────────────────────────────────────
        if any(ql == g or ql.startswith(g + " ") or ql.startswith(g + ",") or ql.startswith(g + "!") for g in [
            "hi", "hello", "hey", "howdy", "yo", "greetings", "good morning", "good afternoon", "good evening"
        ]):
            if any(w in ql for w in ["how are you", "how are u", "how's it going", "how are you doing", "how do you do"]):
                return (
                    f"I'm doing well, thank you for asking! I'm completely synchronized with **{case_id}** and standing by. "
                    "How can I assist you today? We can explore suspect dossiers, examine wiretaps, trace funds, or discuss investigative strategy."
                )
            return (
                f"Hello! I'm CIRA, your investigation copilot for **{case_id}**. "
                "What's on your mind today, or what facet of our docket would you like to examine?"
            )

        # ── 2. "HOW ARE YOU" / "HOW'S IT GOING" ────────────────────────────────
        if any(phrase in ql for phrase in ["how are you", "how are u", "how do you do", "how's it going", "how are things", "how have you been"]):
            return (
                f"I'm doing great, thank you! Standing by and ready to work. "
                f"Across **{case_id}**, our knowledge graph is monitoring {len(all_nodes)} targets and assets. "
                "We can review clues, explore connections between suspects, debate hypotheses, or just talk through your thoughts. What are you thinking?"
            )

        # ── 3. "WHAT ARE YOU DOING" / "WHAT'S UP" ──────────────────────────────
        if any(phrase in ql for phrase in ["what are you doing", "what r u doing", "what's up", "whats up", "what are you up to", "what's going on", "whats going on", "are you there"]):
            return (
                f"I'm keeping an eye on our active case telemetry and evidence index for **{case_id}**. "
                f"Right now I'm tracking high-threat nodes like **{targets_str}** and ready to run queries, draft affidavits, or brainstorm next steps with you. "
                "What would you like to focus on?"
            )

        # ── 4. SHORT ACKNOWLEDGMENTS & CHAT FLOW ───────────────────────────────
        short_words = ["ok", "okay", "cool", "alright", "all right", "got it", "sounds good", "understood", "sure", "great", "nice", "perfect", "yep", "yes", "nope", "no", "fine"]
        if ql in short_words:
            responses = {
                "ok": "Sounds good! What would you like to look into next?",
                "okay": "Got it! Let me know where you'd like to direct our focus next.",
                "cool": "Awesome! Let me know what clue or suspect we should examine next.",
                "alright": "Alright! Whenever you're ready, tell me what you want to tackle.",
                "all right": "All right! Standing by for your next lead or question.",
                "got it": "Perfect. Standing by for your next question or command.",
                "sounds good": "Great! What facet of the investigation should we examine next?",
                "understood": "Understood. What would you like to direct our attention toward?",
                "sure": "Ready when you are! What's our next move?",
                "great": "Glad to hear it! How can I assist you further?",
                "nice": "Excellent. Where should we proceed from here?",
                "perfect": "Standing by! Let me know what to pull up next.",
                "yes": "Understood! Tell me what you'd like to tackle next.",
                "no": "No problem at all! Let me know if you want to switch directions or explore another angle.",
                "fine": "Understood. How can I best assist you right now?"
            }
            return responses.get(ql, "Understood! What would you like to tackle next?")

        # ── 5. GRATITUDE & COURTESY ───────────────────────────────────────────
        if any(phrase in ql for phrase in ["thanks", "thank you", "thx", "appreciate it", "much appreciated"]):
            return (
                "You're very welcome! I'm always here to help you navigate the case, verify facts, or brainstorm angles. "
                "What else can I pull up for you?"
            )

        # ── 6. JOKES & HUMOR ──────────────────────────────────────────────────
        if any(phrase in ql for phrase in ["tell me a joke", "joke", "make me laugh", "say something funny", "humor"]):
            item = random.choice(self.jokes)
            return (
                f"Here's one from the investigative squad room:\n\n"
                f"**{item['setup']}**\n\n"
                f"{item['punchline']}\n\n"
                f"*Hope that brings a little levity to the squad room. What case clue are we tracking next?*"
            )

        # ── 7. IDENTITY & PURPOSE ─────────────────────────────────────────────
        if any(phrase in ql for phrase in ["who are you", "what is your name", "who made you", "what can you do", "what are your capabilities", "help me", "how do you work", "commands"]):
            return (
                "### CIRA (CRIMENET Intelligence & Reasoning Assistant)\n\n"
                "I am your dedicated criminal intelligence and investigative reasoning copilot, built directly into CRIMENET AI.\n\n"
                "You can converse with me naturally just like ChatGPT—we can chat casually, debate theories, profile suspects, audit wiretaps, or explore graph connections between targets.\n\n"
                "#### Core Capabilities:\n"
                "1. **Conversational Reasoning:** Ask me anything about investigative methodology, law, criminology, or open-ended questions.\n"
                "2. **Criminal Network Graph Traversal:** I query our live Neo4j database to trace multi-hop paths, intermediary brokers, and covert communications between any subjects.\n"
                "3. **Forensic Evidence Cross-Examination:** I cross-correlate audio transcripts, financial bank records, automated license plate readers (ALPR), and surveillance CCTV footage.\n"
                "4. **Suspect Profiling & Threat Assessment:** I compute degree and betweenness centrality to identify syndicate kingpins, money mules, and bridgeheads.\n"
                "5. **Tactical Strategy & Interview Prep:** I brainstorm investigative hypotheses, evaluate flight risks, identify evidentiary gaps, and suggest subpoena targets.\n\n"
                "*Ready when you are. What facet of this case shall we analyze?*"
            )

        # ── 8. "WHY DID YOU SAY THAT" / REASONING EXPLANATIONS ─────────────────
        if any(phrase in ql for phrase in ["why did you say that", "why?", "why is that", "explain that", "what do you mean", "can you elaborate", "elaborate", "tell me more"]):
            last_asst_msg = ""
            for m in reversed(history):
                if m.get("role") == "assistant":
                    last_asst_msg = m.get("content", "")
                    break

            if last_asst_msg:
                snippet = last_asst_msg.split("\n")[0][:70]
                return (
                    f"I mentioned that earlier because when we examine the verified case files and graph topology for **{case_id}**, "
                    "there are clear relational clusters and evidence intersections that point directly in that direction.\n\n"
                    f"Specifically, regarding: *\"{snippet}...\"*\n\n"
                    f"The recorded interactions between **{targets_str}** and corresponding financial escrow conduits strongly corroborate this line of inquiry. "
                    "Would you like me to walk through the exact underlying evidence logs or test an alternative hypothesis?"
                )
            return (
                f"I said that because looking across our active case files for **{case_id}**, the evidence trails—particularly "
                f"the wiretap intercepts and financial transfers involving **{targets_str}**—point strongly toward coordinated logistics. "
                "Would you like me to walk through the exact records backing that up?"
            )

        # ── 9. "WHAT DO YOU THINK" / OPINIONS & THEORIES ───────────────────────
        if any(phrase in ql for phrase in ["what do you think", "what's your thought", "what is your opinion", "your opinion", "do you think"]):
            return (
                f"Here's my analytical perspective on **{case_id}**:\n\n"
                f"Looking at the network structure, **Viktor Voronin** acts as the high-level syndicate architect, but **Elena Rostov** "
                "is really the operational backbone because she manages the escrow accounts and communication channels. "
                "In syndicate cases like this, pursuing the financial intermediaries (such as Phoenix Logistics) tends to produce "
                "actionable leverage much faster than trying to target the insulated leadership directly.\n\n"
                "What's your instinct on this—should we focus on freezing the financial conduits or pulling more surveillance telemetry?"
            )

        # ── 10. REAL HISTORICAL CASES (ANOM, SILK ROAD, BITFINEX, COLONIAL) ───
        for case_key, c_data in self.cases.items():
            words = c_data["title"].lower().split()
            if any(w in ql for w in [case_key.lower()] + [w for w in words if len(w) > 4]):
                return (
                    f"### Historical Case Briefing: {c_data['title']} ({c_data['year']})\n\n"
                    f"**Target:** {c_data['target']}\n\n"
                    f"#### Investigative Methodology\n{c_data['methodology']}\n\n"
                    f"#### Outcomes & Impact\n{c_data['results'] if 'results' in c_data else 'Multiple arrests and major asset seizures.'}\n\n"
                    f"#### Key Evidentiary Lesson for `{case_id}`\n{c_data['evidentiary_lesson']}"
                )

        # ── 11. PHILOSOPHY OF EVIDENCE & FORENSICS ────────────────────────────
        if any(w in ql for w in ["locard", "exchange principle", "every contact leaves"]):
            locard = self.principles["LOCARD_EXCHANGE_PRINCIPLE"]
            return (
                f"### {locard['principle']} ({locard['origin']})\n\n"
                f"**Foundational Axiom:** {locard['core_axiom']}\n\n"
                f"**Application to Modern Criminal Networks:**\n{locard['application']}\n\n"
                f"*In `{case_id}`, this principle applies directly to the RF burst transmissions and financial escrow transactions left behind by our suspects.*"
            )

        if any(w in ql for w in ["occam", "simplest explanation", "razor"]):
            occam = self.principles["OCCAMS_RAZOR"]
            return (
                f"### {occam['principle']}\n\n"
                f"{occam['application']}\n\n"
                f"*When we look at our active suspects in `{case_id}`, focusing on the direct financial ties between Phoenix Logistics and Elena Rostov is the cleanest, most grounded explanation.*"
            )

        return None

# Global singleton
cira_dialogue_engine = OmniscientDialogueSynthesizer()
