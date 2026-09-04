"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, RotateCcw } from "lucide-react";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void };
  }
}

interface RetryPaymentButtonProps {
  transactionId: string;
  reference: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
}

export function RetryPaymentButton({ transactionId, reference, amount, currency, customerName, customerEmail, customerPhone = "" }: RetryPaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (window.Razorpay) {
      const readyTimer = window.setTimeout(() => { if (!cancelled) setSdkReady(true); }, 0);
      return () => { cancelled = true; window.clearTimeout(readyTimer); };
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    const script = existingScript ?? document.createElement("script");
    const handleLoad = () => { if (!cancelled) setSdkReady(Boolean(window.Razorpay)); };
    const handleError = () => { if (!cancelled) setMessage("Could not load Razorpay Checkout. Check your network or browser extensions."); };
    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);
    if (!existingScript) {
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
  }, []);

  async function retryPayment() {
    setLoading(true);
    setMessage("");
    console.log("[RecoverAI] Starting payment process", { transactionId, amount, currency });
    try {
      if (!window.Razorpay) await loadCheckoutScript();
      console.log("[RecoverAI] Razorpay SDK loaded");
      const response = await fetch("/api/payments/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount, currency, receipt: reference, notes: { external_reference: reference, transaction_id: transactionId } }) });
      const order = await response.json();
      console.log("[RecoverAI] Payment order response", { ok: response.ok, order });
      if (!response.ok) throw new Error(order.error ?? "Could not create a payment order.");
      if (!order.keyId || !order.keyId.startsWith("rzp_")) throw new Error("Invalid or missing Razorpay public key. Check NEXT_PUBLIC_RAZORPAY_KEY_ID in .env.local.");
      const amountInPaise = Math.round(Number(order.amount));
      const phone = (customerPhone ?? "").replace(/\D/g, "").slice(-10) || "9123456789";
      const email = customerEmail.includes("@") ? customerEmail : "test@example.com";
      if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) throw new Error("Invalid payment amount returned by the server.");
      const callbackUrl = `${window.location.origin}/api/payments/confirm?transaction_id=${encodeURIComponent(transactionId)}&externalReference=${encodeURIComponent(reference)}`;
      const checkout = new window.Razorpay!({ key: order.keyId, amount: amountInPaise, currency: "INR", name: "RecoverAI Demo Store", description: `Retry payment ${reference}`, order_id: order.id, callback_url: callbackUrl, redirect: true, prefill: { name: customerName || "Test User", email, contact: phone }, handler: async (payment: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        console.log("[RecoverAI] Razorpay handler triggered", payment);
        try {
          const confirmation = await fetch("/api/payments/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payment, externalReference: reference, transaction_id: transactionId }) });
          const result = await confirmation.json();
          console.log("[RecoverAI] Payment confirmation response", { ok: confirmation.ok, result });
          if (!confirmation.ok) throw new Error(result.error ?? "Payment confirmation failed.");
          window.location.reload();
        } catch (error) {
          setLoading(false);
          setMessage(error instanceof Error ? error.message : "Payment confirmation failed.");
          console.error("[RecoverAI] Payment confirmation error", error);
        }
      }, modal: { ondismiss: () => setLoading(false) } });
      checkout.on("payment.failed", (failure) => {
        setLoading(false);
        setMessage(failure.error?.description ?? "Payment failed.");
        console.error("[RecoverAI] Razorpay payment failed", failure);
      });
      console.log("[RecoverAI] Opening Razorpay checkout");
      try {
        checkout.open();
      } catch (error) {
        setLoading(false);
        setMessage(error instanceof Error ? error.message : "Razorpay checkout could not be opened.");
        console.error("[RecoverAI] Razorpay checkout error", error);
      }
    } catch (error) {
      setLoading(false);
      setMessage(error instanceof Error ? error.message : "Payment could not be started.");
      console.error("[RecoverAI] Payment startup error", error);
    }
  }

  return <div><button type="button" onClick={retryPayment} disabled={loading || !sdkReady} className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#b8f36b] px-4 text-sm font-semibold text-[#0c1118] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">{loading ? <LoaderCircle size={16} className="animate-spin" /> : <RotateCcw size={16} />} {sdkReady ? (loading ? "Opening checkout" : "Pay Now") : "Loading payment"}</button>{message ? <p className="mt-2 max-w-xs text-xs text-slate-400">{message}</p> : null}</div>;
}

function loadCheckoutScript() {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Razorpay Checkout."));
    document.body.appendChild(script);
  });
}