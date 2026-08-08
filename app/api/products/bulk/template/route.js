import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({}, "name").sort({ name: 1 }).lean();
    const categoryNames = categories.map((c) => c.name).join(", ") || "(add a category first)";

    const headers = [
      "name",
      "sku",
      "category",
      "price",
      "compareAtPrice",
      "unit",
      "stock",
      "lowStockThreshold",
      "description",
      "isFeatured",
      "isActive",
    ];

    const sampleRow = {
      name: "Sample Product",
      sku: "SKU-001",
      category: categories[0]?.name || "Category Name",
      price: 199,
      compareAtPrice: 249,
      unit: "100 gram",
      stock: 25,
      lowStockThreshold: 5,
      description: "Short product description",
      isFeatured: "FALSE",
      isActive: "TRUE",
    };

    const wb = XLSX.utils.book_new();

    const wsData = XLSX.utils.json_to_sheet([sampleRow], { header: headers });
    XLSX.utils.book_append_sheet(wb, wsData, "Products");

    const noteSheet = XLSX.utils.aoa_to_sheet([
      ["Instructions"],
      ["- Do not rename or reorder the header row on the 'Products' sheet."],
      ["- category must exactly match an existing category name."],
      [`- Available categories: ${categoryNames}`],
      ["- unit: free text, e.g. '100 gram', '500 ml', '1 pack'"],
      ["- isFeatured / isActive: TRUE or FALSE"],
      ["- price, compareAtPrice, stock, lowStockThreshold must be numbers"],
    ]);
    XLSX.utils.book_append_sheet(wb, noteSheet, "Instructions");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="product_bulk_upload_template.xlsx"',
        "Content-Length": String(buffer.length),
      },
    });
  } catch (error) {
    console.error("TEMPLATE DOWNLOAD ERROR:", error);
    return NextResponse.json({ error: "Failed to generate template." }, { status: 500 });
  }
}