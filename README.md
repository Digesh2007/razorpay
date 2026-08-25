# RecoverAI — Autonomous AI Agent for Payment Recovery

**Track:** Razorpay AI Builder Buildathon 2026 · Track 3: AI Revenue Recovery  
**Status:**  Production-Ready MVP (Demo Environment)

## 🚀 The Problem
Merchants lose significant revenue due to failed payments (bank timeouts, UPI failures, abandoned checkouts). Most systems simply show "Payment Failed" and give up, leaving money on the table and frustrating customers.

## 💡 The Solution
**RecoverAI** is an autonomous AI agent that acts as a digital recovery specialist. Instead of just notifying merchants of failures, it:
1. **Detects** the failure and analyzes the context (customer history, failure type).
2. **Decides** the safest recovery strategy (Retry, Alternate Payment, Payment Link, or Stop).
3. **Executes** the action based on configurable merchant guardrails.
4. **Learns** from the outcome to improve future decisions.

##  Key Features
- **Merchant Dashboard:** Real-time overview of revenue at risk, recovery rates, and AI performance.
- **AI Audit Trail:** Every decision made by the AI is explainable, timestamped, and transparent.
- **Autonomous Simulator:** Watch the AI process 100 failed transactions in real-time and recover revenue autonomously.
- **Deep Analytics:** Interactive charts showing recovery by failure reason, payment method, and time.
- **Configurable Guardrails:** Merchants control max retries, confidence thresholds, and enabled strategies.

## 🛠️ Tech Stack
- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js Server Actions & API Routes
- **Database:** Supabase (PostgreSQL)
- **Visualization:** Recharts
- **AI Architecture:** Server-side LLM integration with strict JSON schema validation and Zod

## 🏗️ Architecture
```text
[Merchant Dashboard] 
       ↓
[Next.js Frontend] 
       ↓
[Server-Side API] ←→ [Supabase Database]
       ↓
[Recovery Engine] (Rules + AI Agent)
       ↓
[Action Execution] (Retry / Link / Stop)
       ↓
[Audit Trail & Analytics]
```

