from __future__ import annotations

import json
import random
from datetime import datetime, timedelta, timezone
from pathlib import Path

from faker import Faker


SEED = 42
RECORD_COUNT = 100
OUTPUT_FILE = Path(__file__).with_name("synthetic_transactions.json")

fake = Faker("en_IN")
Faker.seed(SEED)
random.seed(SEED)

PAYMENT_FAILURES = {
    "card": ["CARD_DECLINED", "CARD_EXPIRED", "INSUFFICIENT_FUNDS"],
    "upi": ["UPI_FAILURE", "UPI_TIMEOUT", "BANK_TIMEOUT"],
    "netbanking": ["BANK_TIMEOUT", "BANK_DECLINED", "NETBANKING_ERROR"],
    "wallet": ["WALLET_FAILURE", "WALLET_LIMIT_EXCEEDED"],
}


def build_transaction(index: int) -> dict[str, object]:
    payment_method = random.choices(
        ["card", "upi", "netbanking", "wallet"],
        weights=[45, 30, 15, 10],
        k=1,
    )[0]
    failure_reason = random.choice(PAYMENT_FAILURES[payment_method])
    is_b2b = random.random() < 0.28
    attempts_so_far = random.choices([0, 1, 2, 3, 4], weights=[25, 30, 25, 15, 5], k=1)[0]
    days_overdue = random.randint(0, 30)
    amount = round(random.uniform(500, 150000 if is_b2b else 25000), 2)
    created_at = datetime.now(timezone.utc) - timedelta(
        days=days_overdue,
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59),
    )

    return {
        "transaction_id": f"txn_{index:06d}",
        "payment_id": f"pay_{fake.bothify(text='????????', letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')}",
        "customer_name": fake.name(),
        "customer_email": fake.email(),
        "amount": amount,
        "currency": "INR",
        "payment_method": payment_method,
        "failure_reason": failure_reason,
        "attempts_so_far": attempts_so_far,
        "is_b2b": is_b2b,
        "days_overdue": days_overdue,
        "status": "failed",
        "created_at": created_at.isoformat(),
    }


def main() -> None:
    transactions = [build_transaction(index) for index in range(1, RECORD_COUNT + 1)]
    OUTPUT_FILE.write_text(json.dumps(transactions, indent=2), encoding="utf-8")
    print(f"Generated {len(transactions)} synthetic transactions in {OUTPUT_FILE.name}")


if __name__ == "__main__":
    main()
