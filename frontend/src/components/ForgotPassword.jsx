import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff, Mail, Lock, Loader2, KeyRound } from "lucide-react";
import OTPVerification from "./OTPVerification";

const API_URL = "http://localhost:5000/api";

const ForgotPassword = ({ switchPage }) => {
  const [step, setStep] = useState("email"); // "email", "otp", "reset"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(""); // ✅ Store verified OTP
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================================================
  // Step 1: Request OTP
  // ==========================================================
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError("Please enter your email.");

    try {
      setError("");
      setSuccess("");
      setLoading(true);

      await axios.post(`${API_URL}/otp/send`, {
        email,
        context: "reset",
      });

      setSuccess("✅ OTP sent! Check your email.");
      setTimeout(() => {
        setStep("otp");
      }, 1500);
    } catch (err) {
      console.error("Send OTP error:", err);
      setError(err.response?.data?.message || "❌ Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // Step 2: Verify OTP
  // ==========================================================
  const handleOtpVerify = async (otpArray) => {
    try {
      setLoading(true);
      setError("");
      const otpCode = otpArray.join("");

      const res = await axios.post(`${API_URL}/otp/verify`, {
        email,
        otp: otpCode,
        context: "reset",
      });

      console.log("OTP verification response:", res.data);

      if (res.status === 200 && res.data.otpVerified) {
        setOtp(otpCode); // ✅ Store the verified OTP for final password reset
        setSuccess("✅ OTP verified! Now set your new password.");
        setTimeout(() => {
          setStep("reset");
          setSuccess(""); // Clear success message
        }, 1500);
      } else {
        setError("❌ Invalid OTP. Try again.");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      setError(
        err.response?.data?.message || "❌ OTP verification failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // Step 3: Reset Password
  // ==========================================================
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      return setError("⚠️ Please fill in both password fields.");
    }
    
    if (password.length < 6) {
      return setError("⚠️ Password must be at least 6 characters.");
    }
    
    if (password !== confirmPassword) {
      return setError("⚠️ Passwords do not match.");
    }

    try {
      setError("");
      setSuccess("");
      setLoading(true);

      // ✅ Send the stored OTP along with new password to complete reset
      const res = await axios.post(`${API_URL}/otp/verify`, {
        email,
        otp, // ✅ Use the stored verified OTP
        password,
        context: "reset",
      });

      setSuccess("✅ " + (res.data.message || "Password reset successful!"));
      setTimeout(() => {
        switchPage("login");
      }, 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.response?.data?.message || "❌ Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // Step 2: Show OTP Verification
  // ==========================================================
  if (step === "otp") {
    return (
      <OTPVerification
        email={email}
        context="reset"
        onVerify={handleOtpVerify}
        switchPage={switchPage}
        loading={loading}
      />
    );
  }

  // ==========================================================
  // Render UI
  // ==========================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {step === "email" ? (
          <>
            {/* Email Step */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 rounded-xl mb-2">
                <KeyRound className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Forgot Password?
              </h1>
              <p className="text-slate-500 text-sm">
                Enter your email to receive a verification code
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-slate-600 font-medium">
                  Email Address
                </label>
                <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2 mt-1 focus-within:ring-2 focus-within:ring-slate-800 focus-within:border-transparent transition">
                  <Mail className="w-4 h-4 text-slate-500 mr-2" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full outline-none text-slate-800"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

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
                  "Send Verification Code"
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Reset Password Step */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 rounded-xl mb-2">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Reset Password
              </h1>
              <p className="text-slate-500 text-sm">
                Enter your new password
              </p>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="text-sm text-slate-600 font-medium">
                  New Password
                </label>
                <div className="relative flex items-center border border-slate-300 rounded-lg px-3 py-2 mt-1 focus-within:ring-2 focus-within:ring-slate-800 focus-within:border-transparent transition">
                  <Lock className="w-4 h-4 text-slate-500 mr-2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password (min 6 chars)"
                    className="w-full outline-none text-slate-800 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength="6"
                    required
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

              <div>
                <label className="text-sm text-slate-600 font-medium">
                  Confirm Password
                </label>
                <div className="relative flex items-center border border-slate-300 rounded-lg px-3 py-2 mt-1 focus-within:ring-2 focus-within:ring-slate-800 focus-within:border-transparent transition">
                  <Lock className="w-4 h-4 text-slate-500 mr-2" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="w-full outline-none text-slate-800 pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 text-slate-500 hover:text-slate-700"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          </>
        )}

        {/* Messages */}
        {(error || success) && (
          <div
            className={`text-center text-sm p-3 rounded-lg ${
              success
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {success || error}
          </div>
        )}

        {/* Back to Login */}
        <p className="text-center text-sm text-slate-600">
          Remember your password?{" "}
          <button
            onClick={() => switchPage("login")}
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all duration-200"
          >
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;