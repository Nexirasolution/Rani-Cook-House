import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

// Orders are no longer created here — COD is gone, so every order originates
// from /api/razorpay/create-order and gets confirmed by /api/razorpay/verify
// or the /api/razorpay/webhook. This route is read-only now.

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "0", 10);
    // Pass ?includePending=true to also see abandoned/unpaid checkout
    // attempts (Razorpay order created but never paid). Hidden by default.
    const includePending = searchParams.get("includePending") === "true";

    const conditions = [];
    if (status) conditions.push({ status });
    if (!includePending) conditions.push({ paymentStatus: "paid" });

    const query = conditions.length ? { $and: conditions } : {};

    let cursor = Order.find(query).sort({ createdAt: -1 });
    if (limit) cursor = cursor.limit(limit);

    const orders = await cursor;
    return NextResponse.json({ orders });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}