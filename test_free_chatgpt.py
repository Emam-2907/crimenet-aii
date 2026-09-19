import httpx
import json

def call_free_chatgpt(messages, system_prompt, case_context):
    url = "https://text.pollinations.ai/openai"
    
    formatted_messages = [
        {"role": "system", "content": f"{system_prompt}\n\n=== ACTIVE CASE GROUND TRUTH CONTEXT ===\n{case_context}"}
    ]
    for m in messages:
        formatted_messages.append({"role": m["role"], "content": m["content"]})
        
    payload = {
        "messages": formatted_messages,
        "model": "openai",
        "temperature": 0.7
    }
    
    with httpx.Client(timeout=15.0) as client:
        resp = client.post(url, json=payload)
        if resp.status_code == 200:
            data = resp.json()
            return data["choices"][0]["message"]["content"]
        return None

sys_prompt = "You are CIRA, an AI assistant for CRIMENET AI. Converse naturally like ChatGPT or Claude for all normal conversations, chit chat, detective analysis, and general questions."
ctx = "CASE: CR-2026-0142. Suspects: Viktor Voronin, Elena Rostov, Darius Vance. Syndicate: Apex Cyber Syndicate. Evidence: EV-0182 (Call Records), EV-0185 (CCTV)."

test_queries = [
    "hello",
    "how are you today?",
    "tell me a joke",
    "who is the prime suspect?",
    "why did you say that?"
]

messages = []
for q in test_queries:
    messages.append({"role": "user", "content": q})
    reply = call_free_chatgpt(messages, sys_prompt, ctx)
    messages.append({"role": "assistant", "content": reply})
    print(f"USER: {q}")
    print(f"CIRA: {reply[:150]}...")
    print("-" * 50)
