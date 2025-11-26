import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ["promo", "info", "warning"],
      default: "info",
    },
    // [BARU] Field Link URL
    linkUrl: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Banner = mongoose.model("Banner", BannerSchema);
export default Banner;
