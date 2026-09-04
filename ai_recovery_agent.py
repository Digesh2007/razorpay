import json
import random
import os
from datetime import datetime
import google.generativeai as genai

# Initialize Google Gemini client
# Make sure you have set your API key in your environment variables!
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Load the synthetic data and baseline results
with open("synthetic_transactions.json", "r") as f:
    transactions = json.load(f)

with open("baseline_results.json", "r") as f:
    baseline_results = json.load(f)

print(f"🤖 Processing {len(transactions)} failed transactions with Gemini AI agent...\n")

ai_recovered = 0
ai_audit_trail = []
ai_decisions_count = {}
total_amount_processed = sum(txn["amount"] for txn in transactions)

# Define allowed actions (bounded action space for safety)
ALLOWED_ACTIONS = {
    "immediate_retry": "Retry the payment immediately (for transient failures)",
    "schedule_retry_24h": "Schedule retry in 24 hours (for insufficient funds)",
    "send_payment_link": "Send a new payment link via email/SMS",
    "offer_split_payment": "Offer to split payment into 2-3 parts",
    "suggest_alternate_method": "Suggest switching to UPI/Card/NetBanking",
    "send_reminder_gentle": "Send a polite reminder (B2B)",
    "send_reminder_urgent": "Send an urgent reminder (B2B, >7 days overdue)",
    "escalate_to_human": "Escalate to human agent for review",
    "block_and_flag": "Block transaction and flag for fraud review",
    "stop_no_action": "Stop recovery attempts (max attempts reached)"
}

# Initialize the Gemini model with JSON enforcement
model = genai.GenerativeModel(
    model_name="models/gemini-1.5-flash",
    generation_config={
        "response_mime_type": "application/json",
        "temperature": 0.2
    }
)


def get_ai_decision(txn):
    """Use Gemini to make a bounded, explainable recovery decision."""
    txn_id = txn.get("txn_id", txn["transaction_id"])
    prompt = f"""You are RecoverAI, an intelligent payment recovery agent. Your goal is to maximize revenue recovery while maintaining customer trust and following strict compliance rules.

TRANSACTION DETAILS:
- Transaction ID: {txn_id}
- Amount: ₹{txn['amount']}
- Payment Method: {txn['payment_method']}
- Failure Reason: {txn['failure_reason']}
- Attempts So Far: {txn['attempts_so_far']}
- Is B2B: {txn['is_b2b']}
- Days Overdue: {txn['days_overdue']}

STRICT RULES (MUST FOLLOW):
1. If attempts_so_far >= 3, you MUST choose "stop_no_action" or "escalate_to_human"
2. If failure_reason is "fraud_suspected", you MUST choose "block_and_flag"
3. If failure_reason is "expired_card", do NOT retry - choose "send_payment_link" or "suggest_alternate_method"
4. If failure_reason is "gateway_timeout", choose "immediate_retry" (high success rate)
5. If failure_reason is "insufficient_funds" and amount > ₹5000, consider "offer_split_payment"
6. If is_b2b is True and days_overdue > 7, use "send_reminder_urgent"
7. If is_b2b is True and days_overdue <= 7, use "send_reminder_gentle"
8. For "upi_pin_incorrect", use "send_payment_link"
9. For "mandate_failure", use "send_payment_link" or "escalate_to_human"

AVAILABLE ACTIONS (Choose EXACTLY ONE):
{json.dumps(list(ALLOWED_ACTIONS.keys()))}

Respond in this EXACT JSON format:
{{
    "action": "string (must be one of the available actions above)",
    "reasoning": "string (brief explanation, max 100 chars)",
    "estimated_success_prob": float (0.0 to 1.0),
    "priority": "string (high, medium, or low)"
}}"""

    try:
        response = model.generate_content(prompt)
        decision = json.loads(response.text)

        # Guardrail: Validate the decision
        if decision.get("action") not in ALLOWED_ACTIONS:
            print(f"⚠️  WARNING: Invalid action '{decision.get('action')}' for txn {txn_id}. Defaulting to 'escalate_to_human'")
            decision["action"] = "escalate_to_human"
            decision["reasoning"] = "Invalid action corrected by guardrail"

        return decision

    except Exception as e:
        print(f"❌ Error calling Gemini for txn {txn_id}: {str(e)}")
        return {
            "action": "escalate_to_human",
            "reasoning": f"LLM error: {str(e)[:50]}",
            "estimated_success_prob": 0.0,
            "priority": "high"
        }


def simulate_action_outcome(txn, action, estimated_prob):
    """Simulate whether the recovery action succeeds based on realistic rates."""
    action_success_rates = {
        "immediate_retry": 0.75,
        "schedule_retry_24h": 0.35,
        "send_payment_link": 0.45,
        "offer_split_payment": 0.50,
        "suggest_alternate_method": 0.40,
        "send_reminder_gentle": 0.25,
        "send_reminder_urgent": 0.35,
        "escalate_to_human": 0.60,
        "block_and_flag": 0.0,
        "stop_no_action": 0.0
    }

    base_rate = action_success_rates.get(action, 0.20)
    adjusted_rate = (base_rate + estimated_prob) / 2

    # Special deterministic cases
    if txn["failure_reason"] == "gateway_timeout" and action == "immediate_retry":
        adjusted_rate = 0.85
    elif txn["failure_reason"] == "expired_card" and action == "immediate_retry":
        adjusted_rate = 0.0

    return txn["amount"] if random.random() < adjusted_rate else 0


# Process each transaction
for i, txn in enumerate(transactions):
    if (i + 1) % 200 == 0:
        print(f"  Processed {i + 1}/{len(transactions)} transactions...")

    # Get AI decision
    ai_decision = get_ai_decision(txn)

    # Simulate the outcome
    recovered = simulate_action_outcome(txn, ai_decision["action"], ai_decision["estimated_success_prob"])

    ai_recovered += recovered

    # Build audit trail entry
    audit_entry = {
        "txn_id": txn.get("txn_id", txn["transaction_id"]),
        "amount": txn["amount"],
        "failure_reason": txn["failure_reason"],
        "attempts_so_far": txn["attempts_so_far"],
        "ai_decision": ai_decision,
        "recovered": recovered,
        "success": recovered > 0,
        "timestamp": datetime.now().isoformat()
    }

    ai_audit_trail.append(audit_entry)

    # Count decisions
    action = ai_decision["action"]
    ai_decisions_count[action] = ai_decisions_count.get(action, 0) + 1

# Save audit trail and stats
with open("ai_audit_trail.json", "w") as f:
    json.dump(ai_audit_trail, f, indent=2)

decision_stats = {
    "total_transactions": len(transactions),
    "total_amount": total_amount_processed,
    "total_recovered": ai_recovered,
    "recovery_rate": (ai_recovered / total_amount_processed * 100) if total_amount_processed > 0 else 0,
    "decisions_made": ai_decisions_count
}

with open("ai_decision_stats.json", "w") as f:
    json.dump(decision_stats, f, indent=2)

# Calculate baseline recovery for comparison
baseline_recovered = sum(txn["recovered"] for txn in baseline_results)

# Print comprehensive results
print("\n" + "=" * 70)
print("  RECOVERAI - GEMINI AI AGENT RESULTS")
print("=" * 70)
print(f"Total Failed Amount:           ₹{total_amount_processed:,.2f}")
print(f"Amount Recovered (AI Agent):   ₹{ai_recovered:,.2f}")
print(f"AI Recovery Rate:              {decision_stats['recovery_rate']:.2f}%")
print("-" * 70)
print(f"Amount Recovered (Baseline):   ₹{baseline_recovered:,.2f}")
print(f"Baseline Recovery Rate:        {(baseline_recovered/total_amount_processed*100):.2f}%")
print("-" * 70)
improvement = ai_recovered - baseline_recovered
improvement_pct = ((ai_recovered - baseline_recovered) / baseline_recovered * 100) if baseline_recovered > 0 else 0
print(f"💰 IMPROVEMENT:                  ₹{improvement:,.2f} ({improvement_pct:+.2f}%)")
print("=" * 70)

print("\n🤖 AI Decision Distribution:")
for action, count in sorted(ai_decisions_count.items(), key=lambda x: x[1], reverse=True):
    percentage = (count / len(transactions) * 100)
    print(f"  {action:30} | {count:4} ({percentage:.1f}%)")

print("\n✅ Audit trail saved to: ai_audit_trail.json")
print("✅ Decision stats saved to: ai_decision_stats.json")
