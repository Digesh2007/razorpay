import json
import random

# Load the synthetic data
with open("synthetic_transactions.json", "r") as f:
    transactions = json.load(f)

print(f"📊 Processing {len(transactions)} failed transactions with baseline logic...\n")

baseline_recovered = 0
baseline_actions = []
recovery_stats = {
    "total_attempted": 0,
    "total_recovered": 0,
    "by_reason": {}
}

for txn in transactions:
    txn_id = txn.get("txn_id", txn["transaction_id"])
    amount = txn["amount"]
    reason = txn["failure_reason"]
    attempts = txn["attempts_so_far"]
    
    # BASELINE LOGIC (Dumb Retry)
    if reason == "fraud_suspected":
        # Never retry fraud - this is a hard rule
        action = "block_and_flag"
        recovered = 0
        success = False
    elif attempts >= 3:
        # Stop after 3 attempts (basic stopping rule)
        action = "stop_no_more_retries"
        recovered = 0
        success = False
    else:
        # Blindly retry everything else
        action = "blind_retry"
        # Simulate success rates based on failure reason
        if reason == "gateway_timeout":
            success_rate = 0.80  # 80% chance of success on retry
        elif reason == "insufficient_funds":
            success_rate = 0.25  # 25% chance (user might add funds)
        elif reason == "upi_pin_incorrect":
            success_rate = 0.60  # 60% chance (user might retry correctly)
        elif reason == "expired_card":
            success_rate = 0.05  # 5% chance (unlikely to work)
        elif reason == "bank_decline":
            success_rate = 0.15  # 15% chance
        elif reason == "mandate_failure":
            success_rate = 0.30  # 30% chance
        else:
            success_rate = 0.20  # Default 20%
        
        recovered = amount if random.random() < success_rate else 0
        success = recovered > 0
    
    baseline_recovered += recovered
    baseline_actions.append({
        "txn_id": txn_id,
        "amount": amount,
        "reason": reason,
        "action_taken": action,
        "recovered": recovered,
        "success": success
    })
    
    # Track stats by reason
    if reason not in recovery_stats["by_reason"]:
        recovery_stats["by_reason"][reason] = {"attempted": 0, "recovered": 0, "count": 0}
    recovery_stats["by_reason"][reason]["attempted"] += amount
    recovery_stats["by_reason"][reason]["recovered"] += recovered
    recovery_stats["by_reason"][reason]["count"] += 1

# Save baseline results
with open("baseline_results.json", "w") as f:
    json.dump(baseline_actions, f, indent=2)

# Print summary
total_failed_amount = sum(txn["amount"] for txn in transactions)
print("=" * 60)
print(" BASELINE RECOVERY RESULTS")
print("=" * 60)
print(f"Total Failed Amount:        ₹{total_failed_amount:,.2f}")
print(f"Amount Recovered (Baseline): ₹{baseline_recovered:,.2f}")
print(f"Recovery Rate:              {(baseline_recovered/total_failed_amount*100):.2f}%")
print(f"Transactions Processed:     {len(transactions)}")
print("=" * 60)

print("\n Recovery by Failure Reason:")
for reason, stats in recovery_stats["by_reason"].items():
    rate = (stats["recovered"]/stats["attempted"]*100) if stats["attempted"] > 0 else 0
    print(f"  {reason:25} | Recovered: ₹{stats['recovered']:>10,.2f} / ₹{stats['attempted']:>10,.2f} ({rate:.1f}%)")

print("\n✅ Baseline results saved to: baseline_results.json")
print("\n💡 This is what your AI agent needs to beat!")
