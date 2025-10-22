import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: { 
      type: String, 
      required: true,
      lowercase: true,
      trim: true
    },
    otp: { 
      type: String, 
      required: true 
    },
    context: {  // ✅ ADDED
      type: String,
      required: true,
      enum: ["register", "reset"]
    },
    expiresAt: { 
      type: Date, 
      required: true 
    }
  },
  { timestamps: true }
);

// Index to automatically delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Otp", otpSchema);