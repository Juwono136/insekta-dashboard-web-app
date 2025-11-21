import mongoose from "mongoose";

const FeatureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    icon: { type: String, default: "../public/uploads/icons/3d-folder.png" }, // Bisa nama file atau class icon
    url: { type: String }, // Link Google Drive
    type: { type: String, enum: ["link", "folder"], default: "link" },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feature",
      default: null,
    }, // Untuk nested menu (sub-menu)
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ], // Menu ini milik siapa saja
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Feature = mongoose.model("Feature", FeatureSchema);
export default Feature;
