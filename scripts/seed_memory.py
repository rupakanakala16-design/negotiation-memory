"""
Seed standalone script to populate the Hindsight memory bank 'negotiation-memory'
with canonical historical negotiation experiences.
"""
import sys
import os
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

from app.hindsight_service import hindsight_service
from app.seed_data import SEED_NEGOTIATIONS
from app.config import settings

def main():
    print(f"============================================================")
    print(f" Seeding Hindsight Memory Bank: '{settings.hindsight_bank_id}'")
    print(f" Target Hindsight Server: {settings.hindsight_base_url}")
    print(f"============================================================")

    health = hindsight_service.check_health()
    print(f"Hindsight Server Health: {health.get('status')} ({health.get('mode')})")
    if health.get("status") != "connected":
        print(f"Note: {health.get('error', 'Server offline')}")
        print("Experiences will be stored in local resilient memory and synced to Hindsight server.")
    
    print(f"\nIngesting {len(SEED_NEGOTIATIONS)} canonical negotiation memories...")
    for idx, deal in enumerate(SEED_NEGOTIATIONS, 1):
        print(f"\n[{idx}/{len(SEED_NEGOTIATIONS)}] Retaining: {deal.supplier} ({deal.category})")
        print(f"   Conditions: {deal.market_conditions[:60]}...")
        print(f"   Outcome: {deal.final_outcome[:60]}...")
        res = hindsight_service.retain_negotiation(deal)
        print(f"   Retain Result: Synced to Hindsight: {res.get('hindsight_synced')}")

    print("\n[SUCCESS] Memory bank seeding completed successfully!")
    print(f"Total memories in bank: {len(hindsight_service.get_all_negotiations())}")

if __name__ == "__main__":
    main()
