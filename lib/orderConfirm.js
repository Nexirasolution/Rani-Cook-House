import Order from "@/models/Order";
import Product from "@/models/Product";

/**
 * Marks an order paid and decrements stock — safe to call twice.
 *
 * Both the client-side /api/razorpay/verify call and the Razorpay webhook
 * call this for the same order. The findOneAndUpdate below only matches
 * documents that are NOT already paymentStatus "paid", so whichever call
 * reaches Mongo first does the work and the second one is a no-op that
 * just returns the already-confirmed order. This is what stops stock from
 * being decremented twice.
 */
export async function confirmOrderPayment({ localOrderId, razorpayOrderId, paymentId, signature }) {
  const lookup = localOrderId ? { _id: localOrderId } : { "razorpay.orderId": razorpayOrderId };

  const order = await Order.findOneAndUpdate(
    { ...lookup, paymentStatus: { $ne: "paid" } },
    {
      $set: {
        paymentStatus: "paid",
        status: "confirmed",
        ...(paymentId ? { "razorpay.paymentId": paymentId } : {}),
        ...(signature ? { "razorpay.signature": signature } : {}),
      },
      $push: { statusHistory: { status: "confirmed", note: "Payment confirmed" } },
    },
    { new: true }
  );

  if (!order) {
    // Either the order doesn't exist, or it was already confirmed by the
    // other path a moment earlier. Either way, don't touch stock again.
    const existing = await Order.findOne(lookup);
    return { order: existing, alreadyProcessed: true };
  }

  for (const item of order.items) {
    if (item.product) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }
  }

  return { order, alreadyProcessed: false };
}

/** Marks an order failed (from the webhook's payment.failed event). Never touches stock. */
export async function markOrderFailed({ razorpayOrderId }) {
  return Order.findOneAndUpdate(
    { "razorpay.orderId": razorpayOrderId, paymentStatus: { $ne: "paid" } },
    {
      $set: { paymentStatus: "failed" },
      $push: { statusHistory: { status: "pending", note: "Payment failed" } },
    },
    { new: true }
  );
}