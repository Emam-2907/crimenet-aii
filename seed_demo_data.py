"""
CRIMENET AI - Neo4j Synthetic Data Seeder CLI
Seeds or resets controlled synthetic criminal investigation networks in Neo4j.
All generated records are explicitly tagged as DEMO / SYNTHETIC DATA.
"""

import sys
import argparse
from backend.neo4j_service import neo4j_service

def main():
    parser = argparse.ArgumentParser(description="CRIMENET AI Neo4j Synthetic Data Seeder")
    parser.add_argument("--case", default="CASE #CR-2026-0142", help="Target Case Docket ID (default: 'CASE #CR-2026-0142')")
    parser.add_argument("--clear", action="store_true", help="Clear existing graph data for the case before seeding")
    parser.add_argument("--verify", action="store_true", help="Verify Neo4j connectivity and constraints only")
    args = parser.parse_args()

    print("=" * 68)
    print("[*] CRIMENET AI - NEO4J KNOWLEDGE GRAPH SEEDER")
    print("=" * 68)

    # 1. Connectivity Check
    print("[1/3] Verifying Neo4j database connectivity...")
    status = neo4j_service.get_status()
    print(f"      Status:      {'CONNECTED (LIVE)' if status['connected'] else 'DISCONNECTED / OFFLINE'}")
    print(f"      URI:         {status['uri']}")
    print(f"      Database:    {status['database']}")
    print(f"      User:        {status['user']}")
    if status['last_error']:
        print(f"      Last Error:  {status['last_error']}")

    if not status["connected"]:
        print("\n[WARNING] Neo4j is offline or unreachable.")
        print("Please ensure your local Neo4j instance is running or configure .env with valid credentials.")
        print("FastAPI will continue to operate with the local cache engine until Neo4j comes online.")
        sys.exit(1)

    if args.verify:
        print("\n[2/3] Checking schema constraints...")
        c_res = neo4j_service.init_schema_constraints()
        print(f"      Result: {c_res}")
        print("\n[SUCCESS] Neo4j connectivity and constraints verified.")
        return

    # 2. Schema Constraints
    print("\n[2/3] Initializing schema uniqueness constraints...")
    c_res = neo4j_service.init_schema_constraints()
    print(f"      Constraints applied: {c_res.get('constraints_verified', [])}")

    # 3. Seed Synthetic Data
    print(f"\n[3/3] Seeding synthetic data for case: {args.case} (Clear first: {args.clear})...")
    res = neo4j_service.seed_synthetic_case_data(case_id=args.case, clear_first=args.clear)
    print(f"      Result: {res.get('message')}")
    print("\n" + "=" * 68)
    print("[OK] DEMO / SYNTHETIC DATA SEEDING COMPLETE")
    print("=" * 68)

if __name__ == "__main__":
    main()

