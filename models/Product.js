import { Schema, models, model } from "mongoose";

const ProductSchema = new Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    description: {
      type: String,
      default: "",
    },


    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },


    price: {
      type: Number,
      required: true,
    },


    compareAtPrice: {
      type: Number,
      default: 0,
    },


    // ✅ Your MediaUploader uses this
    media: [
      {
        url: {
          type: String,
          required: true,
        },

        publicId: {
          type: String,
          default: "",
        },

        type: {
          type: String,
          default: "image",
        },
      },
    ],


    unit: {
      type: String,
      default: "piece",
    },


    stock: {
      type: Number,
      default: 0,
    },


    lowStockThreshold: {
      type: Number,
      default: 5,
    },


    // ✅ Homepage featured checkbox
    isFeatured: {
      type: Boolean,
      default: false,
    },


    // ✅ Store visibility checkbox
    isActive: {
      type: Boolean,
      default: true,
    },


    soldCount: {
      type: Number,
      default: 0,
    },

  },
  {
    timestamps: true,
  }
);


ProductSchema.index({
  name: "text",
  sku: "text",
});


export default models.Product ||
  model("Product", ProductSchema);