import { useState, useEffect } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import VerifyOTP from "./components/OTPVerification";
import ForgotPassword from "./components/ForgotPassword";
import Dashboard from "./components/Dashboard";

function App() {
  const [page, setPage] = useState("login");

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setPage("dashboard");
    }
  }, []);

  // ==========================================================
  // 🔹 LOGOUT HANDLER
  // ==========================================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setPage("login");
  };

  // ==========================================================
  // 🔹 RENDER PAGES
  // ==========================================================
  switch (page) {
    case "login":
      return <Login switchPage={setPage} />;

    case "register":
      return <Register switchPage={setPage} />;

    case "forgot":
      return <ForgotPassword switchPage={setPage} />;

    case "dashboard":
      return <Dashboard onLogout={handleLogout} switchPage={setPage} />;

    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Page not found</h1>
            <button
              onClick={() => setPage("login")}
              className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
  }
}

export default App;