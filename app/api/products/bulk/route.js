import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toBool(val, fallback) {
  if (val === undefined || val === null || val === "") return fallback;
  if (typeof val === "boolean") return val;
  const s = String(val).trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes";
}

function toNumber(val, fallback = 0) {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const wb = XLSX.read(buffer, { type: "buffer" });
    const sheetName = wb.SheetNames.includes("Products") ? "Products" : wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (!rows.length) {
      return NextResponse.json({ error: "The file has no data rows." }, { status: 400 });
    }

    const categories = await Category.find({}, "name").lean();
    const categoryMap = new Map(categories.map((c) => [c.name.trim().toLowerCase(), c._id]));

    const seenSkus = new Set();
    const results = [];
    let created = 0;
    let errors = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // account for header row, 1-indexed
      const name = String(row.name || "").trim();

      try {
        if (!name) throw new Error("Missing product name.");

        const sku = String(row.sku || "").trim().toUpperCase();
        if (!sku) throw new Error("Missing SKU.");

        if (seenSkus.has(sku)) throw new Error(`SKU "${sku}" is duplicated in this file.`);

        const price = toNumber(row.price, NaN);
        if (!Number.isFinite(price) || price < 0) throw new Error("Missing or invalid price.");

        const categoryName = String(row.category || "").trim();
        const categoryId = categoryMap.get(categoryName.toLowerCase());
        if (!categoryId) throw new Error(`Category "${categoryName || "(blank)"}" not found.`);

        const existingSku = await Product.findOne({ sku });
        if (existingSku) throw new Error(`SKU "${sku}" already exists.`);

        let slug = slugify(name);
        const existingSlug = await Product.findOne({ slug });
        if (existingSlug) slug = `${slug}-${Date.now().toString().slice(-5)}-${i}`;

        await Product.create({
          name,
          sku,
          slug,
          category: categoryId,
          price,
          compareAtPrice: toNumber(row.compareAtPrice, 0),
          unit: String(row.unit || "").trim(),
          stock: toNumber(row.stock, 0),
          lowStockThreshold: toNumber(row.lowStockThreshold, 5),
          description: String(row.description || "").trim(),
          isFeatured: toBool(row.isFeatured, false),
          isActive: toBool(row.isActive, true),
          media: [],
        });

        seenSkus.add(sku);
        created++;
        results.push({ row: rowNum, name, status: "created" });
      } catch (err) {
        errors++;
        results.push({ row: rowNum, name, status: "error", message: err.message });
      }
    }

    return NextResponse.json({
      summary: { totalRows: rows.length, created, errors },
      results,
    });
  } catch (error) {
    console.error("BULK UPLOAD ERROR:", error);
    return NextResponse.json({ error: "Failed to process the file." }, { status: 500 });
  }
}