import mongoose from "mongoose";

const ChartSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    embedUrl: { type: String, required: true },
    // [BARU] Field Kategori
    category: { type: String, default: "General" },
    description: { type: String },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Chart = mongoose.model("Chart", ChartSchema);
export default Chart;
