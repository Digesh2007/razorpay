import Razorpay from "razorpay";

export function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local.");
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export function getRazorpayWebhookSecret() {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Razorpay webhooks are not configured. Add RAZORPAY_WEBHOOK_SECRET to .env.local.");
  }
  return secret;
}