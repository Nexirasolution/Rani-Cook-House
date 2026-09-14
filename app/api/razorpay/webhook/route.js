import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import { confirmOrderPayment, markOrderFailed } from "@/lib/orderConfirm";

// Configure this exact URL in the Razorpay Dashboard under
// Settings -> Webhooks, with the "payment.captured" and "payment.failed"
// events enabled, and set RAZORPAY_WEBHOOK_SECRET to the secret shown there.
//
// This is what confirms the order even if the customer closes the tab
// right after paying and never triggers the client-side verify call.

export async function POST(req) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (!signature || signature !== expected) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  try {
    await connectDB();

    if (event.event === "payment.captured") {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id) {
        await confirmOrderPayment({
          razorpayOrderId: payment.order_id,
          paymentId: payment.id,
        });
      }
    }

    if (event.event === "payment.failed") {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id) {
        await markOrderFailed({ razorpayOrderId: payment.order_id });
      }
    }

    // Respond 200 for anything we don't specifically handle too, so
    // Razorpay doesn't keep retrying events we don't care about.
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    // 500 tells Razorpay to retry — worth it for transient DB hiccups.
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}