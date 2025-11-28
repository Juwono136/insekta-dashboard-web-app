import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: "Teknisi" },
    phone: { type: String, required: true },
    area: { type: String, required: true }, // Tetap ada sebagai Label Grouping
    outlets: { type: String },
    photo: { type: String },
    assignedClients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Team = mongoose.model("Team", TeamSchema);
export default Team;
