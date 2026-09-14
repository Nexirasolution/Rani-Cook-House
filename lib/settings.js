// lib/settings.js
import { connectDB } from "@/lib/mongodb";
import Settings from "@/models/Settings";

const DEFAULTS = {
  storeName: "Rani's Cook House",
  email: "",
  phone: "",
  whatsapp: "",
  address: "",
  deliveryTime: "3-5 Days",
  defaultShippingFee: 79,
  freeShippingAbove: 999,
  stateShipping: [],
  instagram: "",
  facebook: "",
  youtube: "",
  seoTitle: "RANI'S COOK HOUSE",
  seoDescription: "",
  maintenanceMode: false,
};

export async function getSettings() {
  await connectDB();
  const settings = await Settings.findOne().lean();
  return settings ? { ...DEFAULTS, ...JSON.parse(JSON.stringify(settings)) } : DEFAULTS;
}