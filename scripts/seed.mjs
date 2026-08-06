import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import Banner from "../models/Banner.js";
import Settings from "../models/Settings.js";
import { slugify } from "../lib/slugify.js";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set in your .env.local file");

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  // --- Admin user ---
  const adminEmail = (process.env.ADMIN_EMAIL || "ranipickles13@gmail.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "changeme123";
  const existingAdmin = await Admin.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await Admin.create({ email: adminEmail, passwordHash, name: "Rani's Cook House Admin" });
    console.log(`Created admin user: ${adminEmail}`);
  } else {
    console.log("Admin user already exists, skipping.");
  }

  // --- Settings ---
  const existingSettings = await Settings.findOne();
  if (!existingSettings) {
    await Settings.create({
      storeName: "Rani's Cook House",
      email: "ranipickles13@gmail.com",
      phone: "7418058533",
      whatsapp: "917418058533",
      deliveryTime: "3-5 Days",
      address: "Nagercoil, Tamil Nadu",
      defaultShippingFee: 79,
      freeShippingAbove: 999,
      stateShipping: [
        { state: "Tamil Nadu", fee: 49 },
        { state: "Kerala", fee: 59 },
      ],
      seoTitle: "Rani's Cook House | Mom's Secret Taste — Homemade Pickles & Snacks",
      seoDescription:
        "Rani's Cook House offers homemade pickles, dry fish powder, avalose podi (fried rice powder), sangu sathai (conch meat) and dry fruits & nuts from Nagercoil, Tamil Nadu. Mom's secret taste, delivered across India.",
    });
    console.log("Created default settings.");
  } else {
    console.log("Settings already exist, skipping.");
  }

  // --- Categories ---
  const categoryDefs = [
    { name: "Pickles", description: "Traditional homemade pickles made in small batches — mango, lime, garlic, prawn and more." },
    { name: "Dry Fish Powder", description: "Sun-dried fish, roasted and ground fresh into a spicy, flavourful powder." },
    { name: "Powders & Masala", description: "Avalose podi (fried rice powder), sangu sathai and other homemade spice mixes." },
    { name: "Dry Fruits & Nuts", description: "Hand-picked dry fruits and nuts, a healthy homemade snack." },
  ];

  const categoryMap = {};
  for (const [i, c] of categoryDefs.entries()) {
    let cat = await Category.findOne({ name: c.name });
    if (!cat) {
      cat = await Category.create({ ...c, slug: slugify(c.name), order: i });
      console.log(`Created category: ${c.name}`);
    }
    categoryMap[c.name] = cat;
  }

  // --- Products ---
  const productDefs = [
    { sku: "RCH-PKL-MANGO-250G", name: "Mango Pickle", category: "Pickles", price: 150, weight: "250g", stock: 40,
      description: "Traditional homemade mango pickle, tangy and spicy — made fresh in small batches, just like Amma makes it." },
    { sku: "RCH-PKL-LIME-250G", name: "Lime Pickle", category: "Pickles", price: 140, weight: "250g", stock: 40,
      description: "Classic homemade lime pickle with a bold, tangy kick — no preservatives, just tradition." },
    { sku: "RCH-PKL-GARLIC-250G", name: "Garlic Pickle", category: "Pickles", price: 160, weight: "250g", stock: 30,
      description: "Spicy homemade garlic pickle, slow-cooked in oil and spices for deep flavour." },
    { sku: "RCH-PKL-PRAWN-250G", name: "Prawn Pickle", category: "Pickles", price: 280, weight: "250g", stock: 25,
      description: "Nagercoil-style prawn pickle, a coastal specialty packed with spice and flavour." },
    { sku: "RCH-DFP-ANCHOVY-200G", name: "Dry Fish Powder (Nethili)", category: "Dry Fish Powder", price: 180, weight: "200g", stock: 30,
      description: "Sun-dried anchovy (nethili), roasted and ground into a spicy, protein-rich powder — great with rice." },
    { sku: "RCH-DFP-MIXED-200G", name: "Mixed Dry Fish Powder", category: "Dry Fish Powder", price: 190, weight: "200g", stock: 30,
      description: "A traditional blend of sun-dried fish, hand-roasted and ground fresh for authentic coastal flavour." },
    { sku: "RCH-PWD-AVALOSE-250G", name: "Avalose Podi (Fried Rice Powder)", category: "Powders & Masala", price: 130, weight: "250g", stock: 40,
      description: "Classic South Indian fried rice powder made from roasted rice, coconut and jaggery — a Nagercoil favourite tea-time snack." },
    { sku: "RCH-PWD-SANGU-200G", name: "Sangu Sathai (Conch Meat)", category: "Powders & Masala", price: 220, weight: "200g", stock: 20,
      description: "Traditional conch meat (sangu sathai), cleaned and prepared the coastal Nagercoil way." },
    { sku: "RCH-DF-MIXEDNUTS-250G", name: "Mixed Dry Fruits & Nuts", category: "Dry Fruits & Nuts", price: 250, weight: "250g", stock: 35,
      description: "A hand-picked assortment of dry fruits and nuts — almonds, cashews, raisins and more, for a wholesome snack." },
    { sku: "RCH-DF-CASHEW-250G", name: "Cashew Nuts", category: "Dry Fruits & Nuts", price: 300, weight: "250g", stock: 30,
      description: "Premium quality whole cashew nuts, a rich and healthy snack for any time of day." },
    { sku: "RCH-DF-ALMOND-250G", name: "Almonds", category: "Dry Fruits & Nuts", price: 280, weight: "250g", stock: 30,
      description: "Naturally sourced whole almonds, packed fresh for maximum crunch and nutrition." },
    { sku: "RCH-DF-RAISINS-200G", name: "Raisins", category: "Dry Fruits & Nuts", price: 120, weight: "200g", stock: 40,
      description: "Sweet, sun-dried raisins — perfect for snacking or adding to your favourite recipes." },
  ];

  for (const p of productDefs) {
    const exists = await Product.findOne({ sku: p.sku });
    if (exists) {
      console.log(`Product ${p.sku} already exists, skipping.`);
      continue;
    }
    const category = categoryMap[p.category];
    let slug = slugify(p.name);
    let count = 1;
    while (await Product.findOne({ slug })) slug = `${slugify(p.name)}-${count++}`;

    await Product.create({
      sku: p.sku,
      name: p.name,
      slug,
      description: p.description,
      category: category._id,
      price: p.price,
      weight: p.weight,
      stock: p.stock,
      lowStockAlertAt: 5,
      status: "Active",
      images: [],
    });
    console.log(`Created product: ${p.name}`);
  }

  // --- Banners ---
  const bannerDefs = [
    { title: "Homemade Pickles", subtitle: "Mom's Secret Taste, in Every Jar.", ctaLabel: "Shop Pickles", ctaLink: `/products?category=${slugify("Pickles")}`, order: 0 },
    { title: "Dry Fish Powder", subtitle: "Sun-Dried & Roasted Fresh.", ctaLabel: "Shop Now", ctaLink: `/products?category=${slugify("Dry Fish Powder")}`, order: 1 },
    { title: "Dry Fruits & Nuts", subtitle: "Hand-Picked, Naturally Wholesome.", ctaLabel: "Shop Now", ctaLink: `/products?category=${slugify("Dry Fruits & Nuts")}`, order: 2 },
  ];
  for (const b of bannerDefs) {
    const exists = await Banner.findOne({ title: b.title });
    if (!exists) {
      await Banner.create(b);
      console.log(`Created banner: ${b.title}`);
    }
  }

  console.log("\nSeed complete!");
  console.log(`Admin login -> email: ${adminEmail} | password: ${adminPassword}`);
  console.log("IMPORTANT: Upload product/category/banner images from the admin panel — the seed script does not upload images to Cloudinary.");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
