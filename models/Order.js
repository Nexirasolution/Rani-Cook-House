import { Schema, models, model } from "mongoose";
const OrderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product"
  },
  name: String,
  image: String,
  price: Number,
  quantity: Number
}, {
  _id: false
});
const OrderSchema = new Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: [OrderItemSchema],
  customer: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      default: ""
    }
  },
  shippingAddress: {
    line1: String,
    city: String,
    state: String,
    pincode: String
  },
  subtotal: {
    type: Number,
    required: true
  },
  shippingFee: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"],
    default: "Pending"
  },
  paymentMethod: {
    type: String,
    enum: ["COD", "Prepaid"],
    default: "COD"
  },
  trackingId: {
    type: String,
    default: ""
  },
  notes: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});
export default models.Order || model("Order", OrderSchema);