import Otp from "../models/otp.js";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import nodemailer from "nodemailer";

// =======================================================
// 📩 Utility: Send Email (used by both register + reset)
// =======================================================
const sendEmail = async (email, subject, message) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`⚠️ Skipping email (env not set). OTP message: ${message}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    text: message,
  });
};

// =======================================================
// ✅ Send OTP (for registration or password reset)
// =======================================================
export const sendOtp = async (req, res) => {
  try {
    const { email, context } = req.body; // "register" or "reset"

    if (!email || !context)
      return res.status(400).json({ message: "Email and context are required" });

    const existingUser = await User.findOne({ email });

    if (context === "register" && existingUser)
      return res.status(400).json({ message: "User already exists. Please login instead." });

    if (context === "reset" && !existingUser)
      return res.status(404).json({ message: "No account found with this email." });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otpCode, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await Otp.findOneAndUpdate(
      { email },
      { otp: hashedOtp, context, expiresAt },
      { upsert: true, new: true }
    );

    await sendEmail(
      email,
      "Your OTP Code",
      `Your OTP code is: ${otpCode}. This code expires in 5 minutes.`
    );

    console.log(`✅ OTP sent to ${email} for ${context}: ${otpCode}`);

    res.status(200).json({
      message: `OTP sent for ${context} verification.`,
      otp: process.env.NODE_ENV === "development" ? otpCode : undefined,
    });
  } catch (err) {
    console.error("❌ Error sending OTP:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// =======================================================
// ✅ Verify OTP (registers new user or proceeds to reset)
// =======================================================
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp, password, name, context } = req.body;

    if (!email || !otp || !context)
      return res.status(400).json({ message: "Email, OTP, and context are required" });

    const otpRecord = await Otp.findOne({ email, context });
    if (!otpRecord)
      return res.status(400).json({ message: "OTP not found or expired" });

    if (Date.now() > otpRecord.expiresAt.getTime()) {
      await Otp.deleteOne({ email });
      return res.status(400).json({ message: "OTP expired" });
    }

    const isMatch = await bcrypt.compare(otp.toString(), otpRecord.otp);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid OTP" });

    // --- Case 1: Register ---
    if (context === "register") {
      if (!password)
        return res.status(400).json({ message: "Password is required for registration" });

      if (!name)
        return res.status(400).json({ message: "Name is required for registration" });

      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json({ message: "User already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({ 
        name,
        email, 
        password: hashedPassword, 
        isVerified: true 
      });

      await Otp.deleteOne({ email });
      console.log(`✅ User registered and verified: ${email} (${name})`);
      return res.status(201).json({ message: "Registration successful and verified." });
    }

    // --- Case 2: Password Reset Verification ---
    if (context === "reset") {
      // ✅ Step 1: If no password provided, OTP is being verified before reset
      if (!password) {
        // ✅ DON'T delete OTP yet - just mark as verified
        console.log(`✅ OTP verified for password reset (pending new password): ${email}`);
        return res.status(200).json({
          message: "OTP verified. Proceed to reset password.",
          otpVerified: true,
        });
      }

      // ✅ Step 2: If password is provided, perform reset
      const user = await User.findOne({ email });
      if (!user)
        return res.status(404).json({ message: "User not found" });

      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      await user.save();

      // ✅ NOW delete the OTP after successful password reset
      await Otp.deleteOne({ email });
      console.log(`✅ Password reset successfully for ${email}`);

      return res.status(200).json({ message: "Password reset successfully" });
    }

    res.status(400).json({ message: "Invalid OTP context" });
  } catch (err) {
    console.error("❌ Error verifying OTP:", err);
    res.status(500).json({ message: "Server error verifying OTP" });
  }
};

// =======================================================
// ♻️ Resend OTP
// =======================================================
export const resendOtp = async (req, res) => {
  try {
    const { email, context } = req.body;

    if (!email || !context)
      return res.status(400).json({ message: "Email and context are required" });

    await Otp.deleteOne({ email });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otpCode, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create({ email, otp: hashedOtp, context, expiresAt });

    await sendEmail(
      email,
      "Your New OTP Code",
      `Your new OTP code is: ${otpCode}. This code expires in 5 minutes.`
    );

    console.log(`✅ Resent OTP for ${context} to ${email}: ${otpCode}`);

    res.status(200).json({
      message: "OTP resent successfully",
      otp: process.env.NODE_ENV === "development" ? otpCode : undefined,
    });
  } catch (err) { // ✅ FIXED: was 'error' but should be 'err'
    console.error("❌ Error resending OTP:", err);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};