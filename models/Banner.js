import { Schema, models, model } from "mongoose";
const BannerSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ""
  },
  image: {
    type: String,
    default: ""
  },
  imagePublicId: {
    type: String,
    default: ""
  },
  ctaLabel: {
    type: String,
    default: "Shop Now"
  },
  ctaLink: {
    type: String,
    default: "/products"
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active"
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});
export default models.Banner || model("Banner", BannerSchema);