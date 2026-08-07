import { Schema, models, model } from "mongoose";

const BannerSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    subtitle: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },

    ctaText: {
      type: String,
      default: "Shop Now",
    },

    ctaLink: {
      type: String,
      default: "/products",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default models.Banner || model("Banner", BannerSchema);