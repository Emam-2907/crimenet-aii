"""
CRIMENET AI - CIRA (CRIMENET Intelligence & Reasoning Assistant)
================================================================
Comprehensive cognitive investigative architecture featuring legal knowledge bases,
cyber forensics, suspect profiling, tactical workflows, dialogue engines,
and case intelligence matrices.
"""

from .knowledge_base import (
    STATUTORY_DATABASE,
    FOURTH_AMENDMENT_PRECEDENTS,
    FEDERAL_RULES_OF_EVIDENCE,
    INTERNATIONAL_TREATY_FRAMEWORK,
    LegalAndInvestigativeEncyclopedia,
    cira_legal_encyclopedia
)

from .forensics_engine import (
    BlockchainForensicsAnalyzer,
    TelecommunicationsTriangulator,
    BiometricLandmarkForensics,
    AudioAcousticAnalyzer,
    CyberIntrusionForensics,
    MasterForensicsSuite,
    cira_forensics_suite
)

from .profiling_engine import (
    SUSPECT_ARCHETYPES,
    FlightRiskAssessmentEngine,
    InterrogationStrategyEngine,
    CooperatingWitnessEvaluator,
    cira_profiling_engine
)

from .tactical_reasoning import (
    SearchWarrantAffidavitGenerator,
    AssetSeizureCoordinator,
    TacticalRaidPlanner,
    cira_tactical_suite
)

from .dialogue_engine import (
    HISTORICAL_CASE_VAULT,
    INVESTIGATIVE_PRINCIPLES,
    DETECTIVE_HUMOR_REPOSITORY,
    OmniscientDialogueSynthesizer,
    cira_dialogue_engine
)

from .case_intelligence_matrix import (
    SYNDICATE_DOSSIERS,
    OPERATIVE_DOSSIERS,
    FORENSIC_EXHIBITS_INDEX,
    CASE_TIMELINES_MASTER,
    CaseIntelligenceMatrix,
    cira_case_matrix
)

from .universal_knowledge import (
    CiraMathEngine,
    CiraCodeGenerator,
    CiraUniversalKnowledge,
    cira_universal_knowledge
)

__all__ = [
    "STATUTORY_DATABASE",
    "FOURTH_AMENDMENT_PRECEDENTS",
    "FEDERAL_RULES_OF_EVIDENCE",
    "INTERNATIONAL_TREATY_FRAMEWORK",
    "LegalAndInvestigativeEncyclopedia",
    "cira_legal_encyclopedia",
    "BlockchainForensicsAnalyzer",
    "TelecommunicationsTriangulator",
    "BiometricLandmarkForensics",
    "AudioAcousticAnalyzer",
    "CyberIntrusionForensics",
    "MasterForensicsSuite",
    "cira_forensics_suite",
    "SUSPECT_ARCHETYPES",
    "FlightRiskAssessmentEngine",
    "InterrogationStrategyEngine",
    "CooperatingWitnessEvaluator",
    "cira_profiling_engine",
    "SearchWarrantAffidavitGenerator",
    "AssetSeizureCoordinator",
    "TacticalRaidPlanner",
    "cira_tactical_suite",
    "HISTORICAL_CASE_VAULT",
    "INVESTIGATIVE_PRINCIPLES",
    "DETECTIVE_HUMOR_REPOSITORY",
    "OmniscientDialogueSynthesizer",
    "cira_dialogue_engine",
    "SYNDICATE_DOSSIERS",
    "OPERATIVE_DOSSIERS",
    "FORENSIC_EXHIBITS_INDEX",
    "CASE_TIMELINES_MASTER",
    "CaseIntelligenceMatrix",
    "cira_case_matrix",
    "CiraMathEngine",
    "CiraCodeGenerator",
    "CiraUniversalKnowledge",
    "cira_universal_knowledge"
]
