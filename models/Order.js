import { Schema, models, model } from "mongoose";

const OrderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    name: String,
    sku: String,
    image: String,
    price: Number,
    quantity: Number,
    unit: String,
  },
  { _id: false }
);

const StatusHistorySchema = new Schema(
  {
    status: String,
    note: String,
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },

    items: [OrderItemSchema],

    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, default: "" },
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },

    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },

    // NOTE: lowercase to match every route/UI already using
    // "pending" / "confirmed" / "packed" / "shipped" / "delivered" / "cancelled".
    status: {
      type: String,
      enum: ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    statusHistory: [StatusHistorySchema],

    paymentMethod: {
      type: String,
      enum: ["COD", "Online"],
      default: "COD",
    },

    // Only meaningful for "Online" orders. COD orders can just stay "pending"
    // here — the admin UI's order status is what drives COD fulfillment.
    // "created"  = Razorpay order created, checkout sheet opened, not paid yet
    // "paid"     = webhook or client verify confirmed the payment
    // "failed"   = Razorpay reported payment.failed
    paymentStatus: {
      type: String,
      enum: ["created", "paid", "failed", "cod"],
      default: "cod",
    },

    razorpay: {
      orderId: { type: String, index: true },
      paymentId: { type: String, default: "" },
      signature: { type: String, default: "" },
    },

    tracking: {
      courier: { type: String, default: "" },
      trackingNumber: { type: String, default: "" },
      trackingUrl: { type: String, default: "" },
      updatedAt: Date,
    },

    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default models.Order || model("Order", OrderSchema);