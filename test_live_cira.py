import sys
from backend.cira_service import CIRAService

cira = CIRAService()
case_id = "CASE #CR-2026-0142"

test_prompts = [
    "hi",
    "how are you",
    "what are you doing?",
    "ok",
    "thanks",
    "tell me a joke",
    "why did you say that",
    "what do you think?",
    "who is the prime suspect in this case?",
    "what should I do next?",
    "can you explain how money laundering works in this case?",
    "what if they are using another port?"
]

print("=" * 60)
print("TESTING LIVE CIRA PROCESS CHAT RESPONSES")
print("=" * 60)

conv_id = None
for p in test_prompts:
    res = cira.process_chat(
        case_id=case_id,
        message=p,
        conversation_id=conv_id,
        ai_provider="builtin"
    )
    conv_id = res["conversation_id"]
    msg = res["message"]
    first_two_lines = "\n".join(msg.strip().split("\n")[:2])
    print(f"\n[USER]: {p}")
    print(f"[CIRA]:\n{first_two_lines}")
    assert "Tip: If you'd like to switch to live Claude" not in msg, "Found forbidden prompt to switch to Claude/ChatGPT!"
    assert "I have evaluated your query against our active intelligence records" not in msg, "Found old repetitive boilerplate!"

print("\n" + "=" * 60)
print("ALL LIVE CIRA CONVERSATION TESTS PASSED PERFECTLY!")
print("=" * 60)
