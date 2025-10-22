import { useState } from "react";
import axios from "axios";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function OTPVerification({ email, context, switchPage, onVerify, password }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) return setMessage("⚠️ Please enter the full OTP code.");

    // If onVerify callback is provided (from Register component), use it
    if (onVerify) {
      onVerify(otp);
      return;
    }

    // Otherwise, handle verification directly (for password reset flow)
    try {
      setLoading(true);
      setMessage("");

      const payload = {
        email,
        otp: otpCode,
        context,
      };

      // Add password if it's provided (for register context)
      if (password) {
        payload.password = password;
      }

      const res = await axios.post("http://localhost:5000/api/otp/verify", payload);

      if (res.status === 200 || res.status === 201) {
        setMessage("✅ OTP verified successfully!");

        // Route depending on context
        setTimeout(() => {
          if (context === "register") {
            switchPage("login");
          } else if (context === "reset") {
            // For reset, OTP verification is just step 1
            // The parent component should handle showing password reset form
            if (res.data.otpVerified) {
              switchPage("resetPassword"); // or handle in parent
            }
          }
        }, 1500);
      } else {
        setMessage("❌ Invalid OTP. Try again.");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      setMessage(
        err.response?.data?.message || "❌ Verification failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 rounded-xl mb-2">
            <CheckCircle className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Verify OTP</h1>
          <p className="text-slate-500 text-sm">
            Enter the 6-digit code sent to <span className="font-medium text-slate-800">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                className="w-12 h-12 text-center text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 transition flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </button>
        </form>

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

        <p className="text-center text-sm text-slate-600">
          Didn't receive the code?{" "}
          <button
            type="button"
            onClick={() => {
              // TODO: Implement resend OTP
              setMessage("🔄 Resending OTP...");
            }}
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  );
}