import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Banner from "@/models/Banner";
import { deleteMediaFromCloudinary } from "@/lib/cloudinary";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const banner = await Banner.findById(id);

    if (!banner) {
      return NextResponse.json(
        { error: "Banner not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ banner });
  } catch (err) {
    console.error("GET BANNER ERROR:", err);

    return NextResponse.json(
      { error: "Failed to fetch banner." },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 }
      );
    }

    // Convert Cloudinary image object to URL string
    const imageUrl =
      typeof body.image === "string"
        ? body.image
        : body.image?.url || "";

    const updateData = {
      title: body.title.trim(),
      subtitle: body.subtitle?.trim() || "",
      image: imageUrl,
      ctaText: body.ctaText?.trim() || "",
      ctaLink: body.ctaLink?.trim() || "",
      isActive:
        body.isActive !== undefined
          ? Boolean(body.isActive)
          : true,
      sortOrder: Number(body.sortOrder) || 0,
    };

    const banner = await Banner.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!banner) {
      return NextResponse.json(
        { error: "Banner not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ banner });
  } catch (err) {
    console.error("UPDATE BANNER ERROR:", err);

    return NextResponse.json(
      {
        error: "Failed to update banner.",
        details: err.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const banner = await Banner.findById(id);

    if (!banner) {
      return NextResponse.json(
        { error: "Banner not found." },
        { status: 404 }
      );
    }

    /*
     * Banner.image is stored as a Cloudinary URL string.
     *
     * Example:
     * https://res.cloudinary.com/z1qnvxfb/image/upload/v123/rani-banners/example.png
     *
     * Extract the public ID from the URL.
     */
    if (banner.image) {
      try {
        const imageUrl = banner.image;

        const uploadMarker = "/upload/";

        if (imageUrl.includes(uploadMarker)) {
          let publicId = imageUrl.split(uploadMarker)[1];

          // Remove transformation/version information if present
          publicId = publicId.replace(/^v\d+\//, "");

          // Remove file extension
          publicId = publicId.replace(/\.[^/.]+$/, "");

          await deleteMediaFromCloudinary(publicId, "image");
        }
      } catch (cloudinaryError) {
        console.error(
          "Cloudinary delete error:",
          cloudinaryError
        );

        // Continue deleting the database record
        // even if Cloudinary deletion fails.
      }
    }

    await banner.deleteOne();

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    console.error("DELETE BANNER ERROR:", err);

    return NextResponse.json(
      {
        error: "Failed to delete banner.",
        details: err.message,
      },
      { status: 500 }
    );
  }
}