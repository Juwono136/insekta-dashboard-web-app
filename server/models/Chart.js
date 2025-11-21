import mongoose from "mongoose";

const ChartSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["bar", "line", "pie", "area"],
      default: "bar",
    },
    sheetUrl: { type: String, required: true },

    // PERUBAHAN DI SINI: Gunakan 'Object' agar fleksibel menyimpan xAxisKey & dataKeys
    config: {
      type: Object,
      default: {},
    },

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
