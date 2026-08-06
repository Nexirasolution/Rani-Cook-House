import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import "@/models/Category";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeMedia(media) {
  if (!Array.isArray(media)) return [];

  return media
    .filter((item) => item?.url)
    .map((item) => ({
      url: item.url,
      publicId: item.publicId || "",
      type: item.type || item.mediaType || "image",
    }));
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const SORT_MAP = {
  newest: { createdAt: -1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  "name-asc": { name: 1 },
  "name-desc": { name: -1 },
};


// GET PRODUCTS
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const search = (searchParams.get("search") || "").trim();
    const featured = searchParams.get("featured");
    const activeOnly = searchParams.get("activeOnly");
    const sort = searchParams.get("sort");

    const page = Math.max(
      parseInt(searchParams.get("page") || "1", 10),
      1
    );

    const hasPageParam = searchParams.has("page");

    const rawLimit = parseInt(
      searchParams.get("limit") || "0",
      10
    );

    const limit = hasPageParam
      ? rawLimit > 0
        ? rawLimit
        : 12
      : rawLimit;


    const query = {};

    if (category) {
      query.category = category;
    }

    if (featured === "true") {
      query.isFeatured = true;
    }

    if (activeOnly === "true") {
      query.isActive = true;
    }


    if (search) {
      const safe = escapeRegex(search);

      query.$or = [
        {
          name: {
            $regex: safe,
            $options: "i",
          },
        },
        {
          description: {
            $regex: safe,
            $options: "i",
          },
        },
        {
          sku: {
            $regex: safe,
            $options: "i",
          },
        },
      ];
    }


    const sortSpec =
      (sort && SORT_MAP[sort]) || {
        sku: 1,
      };


    let cursor = Product.find(query)
      .populate("category", "name slug")
      .sort(sortSpec);


    let total = null;


    if (limit) {
      total = await Product.countDocuments(query);

      cursor = cursor
        .skip((page - 1) * limit)
        .limit(limit);
    }


    const products = await cursor;


    const response = {
      products,
    };


    if (limit) {
      response.pagination = {
        page,
        limit,
        total,
        totalPages: Math.max(
          Math.ceil(total / limit),
          1
        ),
      };
    }


    return NextResponse.json(response);

  } catch (error) {

    console.error("GET PRODUCTS ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch products",
      },
      {
        status: 500,
      }
    );
  }
}



// CREATE PRODUCT
export async function POST(req) {

  try {

    await connectDB();


    const body = await req.json();


    if (
      !body.name ||
      !body.category ||
      body.price === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Name, category and price are required.",
        },
        {
          status: 400,
        }
      );
    }


    if (!body.sku || !String(body.sku).trim()) {

      return NextResponse.json(
        {
          error: "SKU is required.",
        },
        {
          status: 400,
        }
      );
    }



    const sku = String(body.sku)
      .trim()
      .toUpperCase();



    const existingSku =
      await Product.findOne({
        sku,
      });


    if (existingSku) {

      return NextResponse.json(
        {
          error:
            `SKU "${sku}" is already in use.`,
        },
        {
          status: 400,
        }
      );

    }



    let slug = slugify(body.name);


    const existingSlug =
      await Product.findOne({
        slug,
      });


    if (existingSlug) {

      slug =
        `${slug}-${Date.now()
          .toString()
          .slice(-5)}`;

    }



    const product =
      await Product.create({

        ...body,

        sku,

        slug,


        // defaults
        isActive:
          body.isActive ?? true,


        isFeatured:
          body.isFeatured ?? false,


        media:
          normalizeMedia(body.media),

      });



    return NextResponse.json(
      {
        product,
      },
      {
        status: 201,
      }
    );


  } catch (error) {

    console.error(
      "CREATE PRODUCT ERROR:",
      error
    );


    if (error.code === 11000) {

      return NextResponse.json(
        {
          error:
            "SKU must be unique.",
        },
        {
          status: 400,
        }
      );

    }


    return NextResponse.json(
      {
        error:
          "Failed to create product.",
      },
      {
        status: 500,
      }
    );

  }
}