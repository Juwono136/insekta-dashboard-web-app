import mongoose from "mongoose";

const ChannelSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String }, // Deskripsi singkat tentang web tersebut
    url: { type: String, required: true }, // Link Website
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Channel = mongoose.model("Channel", ChannelSchema);
export default Channel;
