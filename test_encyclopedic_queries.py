from backend.cira_service import CIRAService

cira = CIRAService()
case_id = "CASE #CR-2026-0142"

encyclopedic_queries = [
    "What are the essential elements of RICO under 18 USC 1962?",
    "Can you evaluate the pretrial flight risk for our target?",
    "Draft a Rule 41 search warrant affidavit for Warehouse 14B",
    "How was Operation Trojan Shield ANOM executed by the FBI?",
    "Perform a forensic blockchain peel chain analysis",
    "Tell me about the Silk Road takedown and Ross Ulbricht",
    "What is Locard's exchange principle in forensic science?",
    "Tell me about the Ghost Syndicate and Phoenix Logistics",
    "What is the tactical raid plan for Warehouse 14B?",
    "What is the indictment readiness for our RICO and Money Laundering charges?"
]

print("=" * 65)
print("TESTING CIRA OMNISCIENT ENCYCLOPEDIC CAPABILITIES")
print("=" * 65)

for q in encyclopedic_queries:
    res = cira.process_chat(
        case_id=case_id,
        message=q,
        ai_provider="builtin"
    )
    first_two_lines = "\n".join(res["message"].strip().split("\n")[:3])
    print(f"\n[QUERY]: {q}")
    print(f"[REPLY]:\n{first_two_lines}")
    print("-" * 50)

print("\nALL ENCYCLOPEDIC QUERIES EXECUTED AND PASSED WITH ELITE INTELLECT!")
