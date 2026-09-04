# RecoverAI: Intelligent Payment Revenue Recovery

> **Track:** AI Revenue Recovery (Razorpay Buildathon)
>
> RecoverAI is a production-ready payment recovery simulation. It compares a blind retry baseline with a context-aware Gemini agent that uses bounded actions, stopping rules, and an explainable audit trail.

## The problem

Merchants lose revenue when payments fail because of temporary gateway errors, payment-method issues, insufficient funds, and overdue invoices. Blind retries can waste attempts, frustrate customers, and create compliance risk.

## The solution

RecoverAI evaluates each failed payment using:

- `attempts_so_far` to stop or escalate after three attempts.
- `payment_method` and `failure_reason` to select an appropriate recovery path.
- `is_b2b` and `days_overdue` to tailor communication.
- A restricted action list so the model cannot invent operational actions.
- A JSON audit trail containing every decision and simulated outcome.

No real payment is retried. All outcomes are simulated locally.

## Architecture

```text
Synthetic data -> Baseline retry engine -> Gemini recovery agent
                         |                         |
                         +---- comparison --------+
                                   |
                    audit trail and decision stats
```

The web application in `app/` provides the RecoverAI dashboard, transaction views, simulator, analytics, and settings. Supabase schema and seed files are in `supabase/`.

## Quick start

From the project directory:

```powershell
pip install faker google-generativeai
python generate_data.py
python baseline_recovery.py
```

To run the Gemini agent, set your API key first:

```powershell
$env:GEMINI_API_KEY = "your_key_here"
python ai_recovery_agent.py
```

The agent uses the `models/gemini-1.5-flash` model identifier. Never commit an API key.

## Outputs

- `synthetic_transactions.json`: 100 deterministic synthetic failed-payment records.
- `baseline_results.json`: results from the non-AI blind-retry comparison.
- `ai_audit_trail.json`: one explainable decision entry per transaction.
- `ai_decision_stats.json`: recovery totals and action distribution.

With the generated 100-record dataset, the baseline run produced a recovery rate of 14.62%. AI results vary because the simulated outcomes are probabilistic and require a Gemini API key.

## Guardrails

The model must choose exactly one pre-approved action. Invalid model output falls back to `escalate_to_human`. The prompt also enforces stopping rules, fraud handling, payment-method-aware recovery, and B2B communication rules. The audit output preserves the decision, reasoning, attempts, and outcome for review.

## Key files

- `generate_data.py`: creates realistic Indian payment failure scenarios.
- `baseline_recovery.py`: implements the non-AI baseline.
- `ai_recovery_agent.py`: runs Gemini decision-making and simulated outcomes.
- `CHALLENGES.md`: records the implementation failures and resolutions.
- `app/`: Next.js dashboard and user-facing simulator.
- `supabase/`: database schema, seed data, and configuration.

## Development

```powershell
npm install
npm run dev
```

Open `http://localhost:3000` after the Next.js development server starts.

## Razorpay integration

The server exposes `POST /api/payments/order` for creating Razorpay orders. Send an amount in rupees, a short receipt, and optional string notes. The response contains the order id and the public key id needed by Razorpay Checkout.

Configure the credentials from `.env.example` in `.env.local`. Keep `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` server-side. Configure Razorpay to send `payment.captured` and `payment.failed` events to `/api/webhook/razorpay`; webhook signatures are verified before a matching transaction is updated by its `external_reference` note.
