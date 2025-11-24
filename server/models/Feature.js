import mongoose from "mongoose";

const FeatureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    icon: { type: String, required: true },

    // [BARU] Default Config (General URL)
    defaultType: {
      type: String,
      enum: ["single", "folder"],
      default: "single",
    },
    defaultUrl: { type: String },
    defaultSubMenus: [
      {
        title: { type: String },
        url: { type: String },
      },
    ],

    // Config Per-User (Override)
    assignedTo: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        companyName: { type: String },

        // Field ini opsional. Jika kosong/null, berarti pakai Default.
        isCustom: { type: Boolean, default: false }, // Penanda apakah pakai custom
        type: { type: String, enum: ["single", "folder"] },
        url: { type: String },
        subMenus: [{ title: String, url: String }],
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Feature = mongoose.model("Feature", FeatureSchema);
export default Feature;
