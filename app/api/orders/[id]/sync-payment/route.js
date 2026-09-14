import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getRazorpay } from "@/lib/razorpay";
import Order from "@/models/Order";
import { confirmOrderPayment } from "@/lib/orderConfirm";

// Manual reconciliation: asks Razorpay directly whether a payment for this
// order actually went through, and if so confirms it here. This is the
// fallback for orders that got stuck at paymentStatus "created" because the
// customer's browser closed before /api/razorpay/verify could run AND the
// webhook either wasn't configured yet or hadn't been delivered.
//
// This talks to Razorpay with your server-side API key/secret, so its
// answer is authoritative — no client-supplied signature needed here.

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    if (order.paymentStatus === "paid") {
      return NextResponse.json({ order, message: "Already marked paid." });
    }

    if (!order.razorpay?.orderId) {
      return NextResponse.json({ error: "This order has no Razorpay order ID to check." }, { status: 400 });
    }

    const razorpay = getRazorpay();
    const paymentsRes = await razorpay.orders.fetchPayments(order.razorpay.orderId);
    const payments = paymentsRes.items || [];

    const captured = payments.find((p) => p.status === "captured");

    if (!captured) {
      const anyFailed = payments.some((p) => p.status === "failed");
      return NextResponse.json(
        {
          error: anyFailed
            ? "Razorpay shows this payment as failed — no successful charge found."
            : "No successful payment found for this order yet.",
        },
        { status: 404 }
      );
    }

    const { order: updated } = await confirmOrderPayment({
      localOrderId: order._id,
      paymentId: captured.id,
    });

    return NextResponse.json({ order: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Failed to check payment status." }, { status: 500 });
  }
}