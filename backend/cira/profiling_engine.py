"""
CRIMENET AI - CIRA SUSPECT PROFILING & BEHAVIORAL INTELLIGENCE ENGINE
=====================================================================
Comprehensive psychological profiling algorithms, 10 syndicate archetypes,
flight risk modeling, deception indicators, cognitive interview playbooks,
and federal sentencing guideline calculators for criminal investigations.
"""

from typing import Dict, List, Any, Optional, Tuple
import math
from datetime import datetime

# =============================================================================
# 1. PSYCHOLOGICAL SUSPECT ARCHETYPES
# =============================================================================

SUSPECT_ARCHETYPES: Dict[str, Dict[str, Any]] = {
    "INSULATED_SYNDICATE_ARCHITECT": {
        "archetype": "The Insulated Syndicate Architect (e.g. Viktor Voronin)",
        "psychological_traits": [
            "Machiavellian strategic planning with high emotional detachment.",
            "Extreme compartmentalization; avoids direct communication with street-level actors.",
            "Relies on corporate shell nominees, legal proxies, and multi-signature crypto escrows.",
            "Narcissistic belief in personal technological and jurisdictional invulnerability."
        ],
        "interrogation_vulnerabilities": [
            "Confrontation with documented failure or betrayal by trusted intermediaries.",
            "Direct threat of civil in rem forfeiture dismantling generational family estates and trusts.",
            "Loss of control over narrative; intellectual sparring regarding strategic missteps."
        ],
        "recommended_approach": "Avoid emotional appeals. Maintain clinical, evidence-dense posture demonstrating undeniable systemic compromise of his organization."
    },
    "PRAGMATIC_FINANCIAL_BROKER": {
        "archetype": "The Pragmatic Financial Broker (e.g. Elena Rostov)",
        "psychological_traits": [
            "Highly rational, mathematically disciplined, and mercenary.",
            "Zero emotional attachment or ideological loyalty to syndicate leadership.",
            "Views criminal activity strictly through risk-adjusted return on capital."
        ],
        "interrogation_vulnerabilities": [
            "Immediate presentation of federal sentencing guidelines showing 20+ year exposure under 18 U.S.C. § 1956.",
            "Offer of rapid 5K1.1 substantial assistance departure and pre-indictment cooperation.",
            "Fear of physical retaliation by syndicate leadership once financial records are seized."
        ],
        "recommended_approach": "Transactional negotiation. Emphasize that the first co-conspirator through the prosecutor's door secures the only full cooperation agreement."
    },
    "TACTICAL_FLEET_OPERATIVE": {
        "archetype": "The Tactical Fleet Courier (e.g. Darius Vance)",
        "psychological_traits": [
            "Action-oriented, street-savvy, distrustful of federal law enforcement.",
            "Misplaced loyalty to family or crew chiefs.",
            "Underestimates digital footprints, relying on physical countersurveillance."
        ],
        "interrogation_vulnerabilities": [
            "Revealing that higher-ups used him as a deliberate decoy to sacrifice to law enforcement.",
            "Presenting irrefutable optical biometric and ALPR license plate evidence placing him at the scene.",
            "Facing harsh mandatory minimum sentences while the masterminds sit in offshore luxury."
        ],
        "recommended_approach": "Reid Theme of Displaced Loyalty: 'Darius, while you were risking 20 years in a federal penitentiary driving that Escalade, Voronin was booking first-class flights to Dubai. Why are you taking the fall for someone who treated you like a disposable shield?'"
    },
    "CORRUPT_PUBLIC_OFFICIAL": {
        "archetype": "The Compromised Port / Customs Inspector",
        "psychological_traits": [
            "Rationalizes bribery as victimless supplement to inadequate civil service salary.",
            "Extreme anxiety regarding loss of social standing, pension, and family reputation."
        ],
        "interrogation_vulnerabilities": [
            "Immediate panic when confronted with financial bank deposits exceeding declared salary.",
            "Desire to protect family and salvage retirement assets."
        ],
        "recommended_approach": "Sympathetic minimizing approach: 'You were backed into a corner by dangerous people; let's document how you were coerced before you are charged as a full co-conspirator.'"
    }
}

# =============================================================================
# 2. FLIGHT RISK QUANTITATIVE ASSESSMENT MODEL
# =============================================================================

class FlightRiskAssessmentEngine:
    """
    Computes mathematical flight risk index (0.00 - 1.00) based on
    financial liquidity, foreign extradition treaties, mobility assets,
    and criminal sentencing exposure under 18 U.S.C. § 3142(e).
    """

    NON_EXTRADITION_DESTINATIONS = {
        "RUS": {"country": "Russian Federation", "extradition_treaty": False, "risk_mult": 1.45},
        "ARE": {"country": "United Arab Emirates (Dubai)", "extradition_treaty": False, "risk_mult": 1.35},
        "CYP_NORTH": {"country": "Northern Cyprus", "extradition_treaty": False, "risk_mult": 1.40},
        "BLR": {"country": "Belarus", "extradition_treaty": False, "risk_mult": 1.50}
    }

    def compute_flight_risk(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluates suspect profile parameters and generates quantified flight score."""
        score = 0.0
        factors = []

        # 1. Financial Liquidity & Offshore Holdings (Max 0.35)
        liquid_assets = profile.get("liquid_untracked_assets_usd", 0)
        has_crypto_wallets = profile.get("has_unhosted_crypto", False)
        if liquid_assets > 1000000 or has_crypto_wallets:
            score += 0.35
            factors.append("Substantial liquid untraceable assets / private crypto keys enabling indefinite international self-sustenance.")
        elif liquid_assets > 250000:
            score += 0.20
            factors.append("Moderate liquid capital available for charter transport and forged credentials.")

        # 2. Foreign Passports & Travel Mobility (Max 0.25)
        passports = profile.get("passports_held", 1)
        access_to_private_vessels = profile.get("access_to_private_transport", False)
        if passports > 1 or access_to_private_vessels:
            score += 0.25
            factors.append("Multiple foreign passports or immediate access to private aviation / maritime vessels.")
        elif passports == 1:
            score += 0.10

        # 3. Penal Exposure & Sentencing Guidelines (Max 0.25)
        min_statutory_years = profile.get("mandatory_minimum_years", 0)
        if min_statutory_years >= 20:
            score += 0.25
            factors.append("Facing mandatory minimum imprisonment of 20+ years (strong psychological flight incentive).")
        elif min_statutory_years >= 10:
            score += 0.15
            factors.append("Facing 10+ years imprisonment.")

        # 4. Community Ties & Real Property Anchors (Mitigation)
        has_local_family = profile.get("has_local_dependents", False)
        real_estate_equity = profile.get("domestic_real_estate_equity_usd", 0)
        if has_local_family and real_estate_equity > 1000000:
            score = max(0.05, score - 0.20)
            factors.append("Mitigating: Significant domestic real property equity and immediate dependent family ties.")
        elif has_local_family:
            score = max(0.05, score - 0.10)

        final_score = min(round(score, 2), 1.0)
        tier = "CRITICAL" if final_score >= 0.80 else ("HIGH" if final_score >= 0.60 else ("MODERATE" if final_score >= 0.35 else "LOW"))

        return {
            "flight_risk_score": final_score,
            "flight_risk_tier": tier,
            "primary_driving_factors": factors,
            "bail_recommendation_18_usc_3142": (
                "MOTION FOR PRETRIAL DETENTION (NO BAIL): Rebuttable presumption under 18 U.S.C. § 3142(e)(3). "
                "No condition or combination of conditions will reasonably assure appearance of defendant."
                if tier in ["CRITICAL", "HIGH"]
                else "High-bond release subject to electronic GPS ankle monitoring, surrender of all travel documents, and home detention."
            ),
            "border_security_alert": "Submit immediate TECS / Treasury Enforcement Communications System lookout and Interpol Red Notice."
        }

# =============================================================================
# 3. TACTICAL INTERROGATION & DECEPTION INDICATORS
# =============================================================================

class InterrogationStrategyEngine:
    """
    Models cognitive interview techniques (PEACE framework and Reid Technique)
    customized to syndicate psychology, money mules, and insulated kingpins.
    """

    DECEPTION_MARKERS = {
        "verbal_indicators": [
            "Linguistic distancing (referring to co-conspirators as 'those people' or 'associates' rather than names).",
            "Selective memory lapses ('To the best of my recollection', 'Not that I'm aware of').",
            "Answering questions with questions to buy cognitive processing time.",
            "Overly specific denials that avoid the broader conspiracy."
        ],
        "non_verbal_indicators": [
            "Sudden respiratory rhythm shifts during introduction of audio wiretap evidence.",
            "Gaze fixation or complete aversion when shown bank transaction ledgers.",
            "Self-soothing tactile gestures (neck touching, collar adjustments) indicating elevated cortisol response."
        ]
    }

    @staticmethod
    def generate_interview_script(suspect_name: str, suspect_role: str, lead_evidence: str) -> Dict[str, Any]:
        """Generates custom interrogation strategy tailored to the specific suspect's rank and evidence."""
        return {
            "target_subject": suspect_name,
            "tactical_archetype": suspect_role,
            "primary_evidence_wedge": lead_evidence,
            "recommended_technique": "PEACE Cognitive Contradiction Drill",
            "opening_line": (
                f"Special Agent: '{suspect_name}, we've concluded our preliminary audit of docket communications. "
                "Before we address the formal dockets, I want to give you the opportunity to walk through your movements on the night in question in your own words.'"
            ),
            "cognitive_challenge_sequence": [
                "1. Permit subject to commit to a specific timeline alibi on the record.",
                f"2. Introduce corroborating surveillance ({lead_evidence}) that creates an irreconcilable factual conflict.",
                "3. Observe non-verbal anxiety shifts (e.g. linguistic distancing, respiratory cadence elevation, gaze aversion).",
                "4. Present the proffer cooperation window before co-defendants lock in immunity agreements."
            ],
            "leverage_point": "First co-conspirator to cooperate receives substantial assistance downward departure (U.S.S.G. § 5K1.1)."
        }

# =============================================================================
# 4. FEDERAL SENTENCING GUIDELINES EVALUATOR (U.S.S.G.)
# =============================================================================

class CooperatingWitnessEvaluator:
    """
    Calculates sentencing reduction incentives and substantial assistance value
    under federal sentencing guidelines (U.S.S.G. § 5K1.1 and Rule 35(b)).
    """

    SENTENCING_TABLE = {
        12: {"I": "10-16 mos", "II": "12-18 mos", "III": "15-21 mos", "IV": "21-27 mos"},
        18: {"I": "27-33 mos", "II": "30-37 mos", "III": "33-41 mos", "IV": "41-51 mos"},
        24: {"I": "51-63 mos", "II": "57-71 mos", "III": "63-78 mos", "IV": "77-96 mos"},
        30: {"I": "97-121 mos", "II": "108-135 mos", "III": "121-151 mos", "IV": "151-188 mos"},
        36: {"I": "188-235 mos", "II": "210-262 mos", "III": "235-293 mos", "IV": "292-365 mos"},
        40: {"I": "292-365 mos", "II": "324-405 mos", "III": "360-life", "IV": "360-life"},
        43: {"I": "Life", "II": "Life", "III": "Life", "IV": "Life"}
    }

    @staticmethod
    def calculate_sentencing_exposure(base_offense_level: int, criminal_history_category: int = 1) -> Dict[str, Any]:
        """Calculates advisory sentencing range in months from federal sentencing table."""
        closest_level = min(CooperatingWitnessEvaluator.SENTENCING_TABLE.keys(), key=lambda x: abs(x - base_offense_level))
        cat_key = "I" if criminal_history_category <= 1 else ("II" if criminal_history_category == 2 else "III")
        advisory_range = CooperatingWitnessEvaluator.SENTENCING_TABLE[closest_level].get(cat_key, "188-235 mos")

        return {
            "base_offense_level": base_offense_level,
            "criminal_history_category": f"Category {cat_key}",
            "advisory_sentencing_guideline": advisory_range,
            "post_cooperation_reduction_5k1": "Projected 3-5 level downward departure for substantial assistance",
            "recommended_plea_strategy": "Secure Section 5K1.1 motion with debriefing under formal proffer agreement."
        }

# Global singleton
cira_profiling_engine = {
    "archetypes": SUSPECT_ARCHETYPES,
    "flight_risk": FlightRiskAssessmentEngine(),
    "interrogation": InterrogationStrategyEngine(),
    "witness_evaluator": CooperatingWitnessEvaluator()
}
