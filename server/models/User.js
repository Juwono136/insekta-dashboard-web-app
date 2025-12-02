import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "client"],
      default: "client",
    },
    avatar: {
      type: String,
      default: "https://res.cloudinary.com/dz8dtz5ki/image/upload/v1764597116/user_bsdswt.png",
    },
    companyName: { type: String, default: "" }, // Khusus client
    isActive: { type: Boolean, default: true },
    isFirstLogin: { type: Boolean, default: false },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Middleware: Enkripsi password sebelum save
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method Match Password (Opsional, biasanya sudah ada)
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", UserSchema);
export default User;
