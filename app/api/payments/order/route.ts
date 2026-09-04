import { NextResponse } from "next/server";
import { z } from "zod";
import { getRazorpayClient } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

const orderRequestSchema = z.object({
  amount: z.number().positive().max(10000000),
  currency: z.string().length(3).default("INR"),
  receipt: z.string().min(1).max(40),
  notes: z.record(z.string(), z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    const input = orderRequestSchema.parse(await request.json());
    const order = await getRazorpayClient().orders.create({
      amount: Math.round(input.amount * 100),
      currency: input.currency.toUpperCase(),
      receipt: input.receipt,
      notes: input.notes,
    });

    return NextResponse.json({ id: order.id, amount: order.amount, currency: order.currency, keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    const message = error instanceof z.ZodError ? "Invalid order details." : error instanceof Error ? error.message : "Could not create Razorpay order.";
    const status = error instanceof z.ZodError ? 400 : message.includes("not configured") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}