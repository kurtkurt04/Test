import { useState } from "react";
import axios from "axios";
import { LogIn, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";

export default function Login({ switchPage }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      
      console.log("Login response:", res.data);
      
      if (res.data.token) {
        setMessage("✅ Login successful!");
        
        // Store token and user data in localStorage
        localStorage.setItem("token", res.data.token);
        if (res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
        
        // Redirect to dashboard after 1 second
        setTimeout(() => {
          switchPage("dashboard");
        }, 1000);
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage(
        err.response?.data?.message || 
        "❌ Invalid credentials or user not found."
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
            <LogIn className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 text-sm">Login to access your dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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

          <div>
            <label className="text-sm text-slate-600 font-medium">Password</label>
            <div className="relative flex items-center border border-slate-300 rounded-lg px-3 py-2 mt-1 focus-within:ring-2 focus-within:ring-slate-800 focus-within:border-transparent transition">
              <Lock className="w-4 h-4 text-slate-500 mr-2" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full outline-none text-slate-800 pr-10"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-500 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 transition flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>

          {/* Forgot Password Button */}
          <div className="text-center mt-3">
            <button
              type="button"
              onClick={() => switchPage("forgot")}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium transition"
            >
              Forgot Password?
            </button>
          </div>
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

        <p className="text-center text-sm text-slate-600 mt-4">
          Don't have an account?{" "}
          <button
            onClick={() => switchPage("register")}
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all duration-200"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}