import sys
from backend.cira_service import cira_service
from backend.database import db

case_id = "CASE #CR-2026-0142"

queries = [
    "hello there, how are you?",
    "who are you and what can you do?",
    "who is the prime suspect in this case?",
    "what should I do first to solve this investigation?",
    "Find a path between Marcus Vance and Elena Rostova",
    "what if Elena flees the country?"
]

print("--- TESTING CIRA CONVERSATIONAL REASONING ---")
for q in queries:
    res = cira_service.process_chat(case_id=case_id, message=q)
    print("=" * 60)
    print(f"USER: {q}")
    print(f"CIRA ({len(res['message'])} chars):\n")
    print(res['message'][:280] + "...")
    print(f"Followups: {[f['label'] for f in res.get('followups', [])]}")
print("=" * 60)
print("ALL CONVERSATIONAL QUERIES EVALUATED SUCCESSFULLY!")
