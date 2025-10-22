import { useState } from "react";
import axios from "axios";
import { UserPlus, Mail, Lock, Loader2, Eye, EyeOff, User } from "lucide-react";
import OTPVerification from "./OTPVerification";

export default function Register({ switchPage }) {
  const [step, setStep] = useState("register");
  const [formData, setFormData] = useState({
    name: "", // ✅ ADDED
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    if (formData.password !== formData.confirmPassword) {
      return setMessage("⚠️ Passwords do not match");
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/otp/send", {
        email: formData.email,
        context: "register",
      });

      if (res.status === 200) {
        setStep("verify");
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      setMessage(
        err.response?.data?.message || "❌ Failed to send OTP. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (otpArray) => {
    try {
      const otpCode = otpArray.join("");
      const res = await axios.post("http://localhost:5000/api/otp/verify", {
        email: formData.email,
        otp: otpCode,
        password: formData.password,
        name: formData.name, // ✅ ADDED
        context: "register",
      });

      if (res.status === 201 || res.status === 200) {
        setMessage("✅ Account created successfully!");
        setTimeout(() => switchPage("login"), 1500);
      } else {
        setMessage("❌ Invalid OTP");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      setMessage(
        err.response?.data?.message || "⚠️ Verification failed. Try again."
      );
    }
  };

  if (step === "verify") {
    return (
      <OTPVerification
        email={formData.email}
        context="register"
        password={formData.password}
        name={formData.name} // ✅ ADDED
        onVerify={handleOtpVerify}
        switchPage={switchPage}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 rounded-xl mb-2">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Create Account</h1>
          <p className="text-slate-500 text-sm">Sign up to continue to your dashboard</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Name - ADDED */}
          <div>
            <label className="text-sm text-slate-600 font-medium">Full Name</label>
            <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2 mt-1 focus-within:ring-2 focus-within:ring-slate-800 focus-within:border-transparent transition">
              <User className="w-4 h-4 text-slate-500 mr-2" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full outline-none text-slate-800"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-slate-600 font-medium">Email Address</label>
            <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2 mt-1 focus-within:ring-2 focus-within:ring-slate-800 focus-within:border-transparent transition">
              <Mail className="w-4 h-4 text-slate-500 mr-2" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full outline-none text-slate-800"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-slate-600 font-medium">Password</label>
            <div className="relative flex items-center border border-slate-300 rounded-lg px-3 py-2 mt-1 focus-within:ring-2 focus-within:ring-slate-800 focus-within:border-transparent transition">
              <Lock className="w-4 h-4 text-slate-500 mr-2" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                minLength="6"
                value={formData.password}
                onChange={handleChange}
                className="w-full outline-none text-slate-800 pr-10"
                placeholder="Enter your password (min 6 chars)"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-500 hover:text-slate-700"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm text-slate-600 font-medium">Confirm Password</label>
            <div className="relative flex items-center border border-slate-300 rounded-lg px-3 py-2 mt-1 focus-within:ring-2 focus-within:ring-slate-800 focus-within:border-transparent transition">
              <Lock className="w-4 h-4 text-slate-500 mr-2" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full outline-none text-slate-800 pr-10"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 text-slate-500 hover:text-slate-700"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 transition flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Sending OTP...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>

        {/* Message */}
        {message && (
          <div
            className={`text-center text-sm p-3 rounded-lg ${
              message.startsWith("✅")
                ? "bg-green-50 text-green-700"
                : message.startsWith("⚠️")
                ? "bg-yellow-50 text-yellow-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* Switch to Login */}
        <p className="text-center text-sm text-slate-600 mt-4">
          Already have an account?{" "}
          <button
            onClick={() => switchPage("login")}
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all duration-200"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}