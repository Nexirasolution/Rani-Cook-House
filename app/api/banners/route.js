import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Banner from "@/models/Banner";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("activeOnly");

    const query = {};

    if (activeOnly === "true") {
      query.isActive = true;
    }

    const banners = await Banner.find(query).sort({
      sortOrder: 1,
      createdAt: -1,
    });

    return NextResponse.json({ banners });
  } catch (err) {
    console.error("GET BANNERS ERROR:", err);

    return NextResponse.json(
      { error: "Failed to fetch banners." },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    // Validate title
    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 }
      );
    }

    // Cloudinary upload returns:
    // {
    //   url: "...",
    //   publicId: "..."
    // }
    //
    // Banner model expects image as a STRING.
    const imageUrl =
      typeof body.image === "string"
        ? body.image
        : body.image?.url || "";

    const banner = await Banner.create({
      title: body.title.trim(),

      subtitle: body.subtitle?.trim() || "",

      // IMPORTANT: Save only the Cloudinary URL
      image: imageUrl,

      ctaText: body.ctaText?.trim() || "",

      ctaLink: body.ctaLink?.trim() || "",

      isActive:
        body.isActive !== undefined
          ? Boolean(body.isActive)
          : true,

      sortOrder: Number(body.sortOrder) || 0,
    });

    return NextResponse.json(
      { banner },
      { status: 201 }
    );
  } catch (err) {
    console.error("CREATE BANNER ERROR:", err);

    return NextResponse.json(
      {
        error: "Failed to create banner.",
        details: err.message,
      },
      { status: 500 }
    );
  }
}