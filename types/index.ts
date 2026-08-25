export type RecoveryStrategy =
  | "retry"
  | "alternate_payment"
  | "payment_link"
  | "reminder"
  | "stop";

export type PaymentStatus = "failed" | "recovered" | "pending" | "abandoned";

export interface PaymentAttempt {
  id: string;
  customerName: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  failureReason?: string;
  recoveryProbability?: number;
  recommendedStrategy?: RecoveryStrategy;
  createdAt: string;
}

export interface RecoveryDecision {
  strategy: RecoveryStrategy;
  probability: number;
  reasoning: string;
  nextAction: string;
}