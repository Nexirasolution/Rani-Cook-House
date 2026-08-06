import { Schema, models, model } from "mongoose";

const StateShippingSchema = new Schema(
  { state: String, fee: Number },
  { _id: false }
);

const SettingsSchema = new Schema(
  {
    storeName: { type: String, default: "Rani's Cook House" },
    email: { type: String, default: "ranipickles13@gmail.com" },
    phone: { type: String, default: "7418058533" },
    whatsapp: { type: String, default: "917418058533" },
    deliveryTime: { type: String, default: "3-5 Days" },
    address: { type: String, default: "Nagercoil, Tamil Nadu" },
    defaultShippingFee: { type: Number, default: 79 },
    freeShippingAbove: { type: Number, default: 999 },
    stateShipping: [StateShippingSchema],
    instagram: { type: String, default: "" },
    facebook: { type: String, default: "" },
    youtube: { type: String, default: "" },
    seoTitle: { type: String, default: "Rani's Cook House | Mom's Secret Taste — Homemade Pickles & Snacks" },
    seoDescription: {
      type: String,
      default:
        "Rani's Cook House offers homemade pickles, dry fish powder, avalose podi (fried rice powder), sangu sathai (conch meat) and dry fruits & nuts from Nagercoil, Tamil Nadu. Mom's secret taste, delivered across India.",
    },
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Settings || model("Settings", SettingsSchema);
