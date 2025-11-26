import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: "Teknisi" }, // Teknisi, Supervisor, dll
    phone: { type: String, required: true },
    area: { type: String, required: true }, // Jakarta, Bandung, dll
    outlets: { type: String }, // Disimpan sebagai text panjang (misal: Outlet A, Outlet B)
    photo: { type: String }, // URL Foto
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Team = mongoose.model("Team", TeamSchema);
export default Team;
