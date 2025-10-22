import { LogOut, User, Shield } from 'lucide-react';

export default function Dashboard({ userEmail, onLogout }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 space-y-6 text-center">
        <div className="flex justify-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-semibold text-slate-900">
          Welcome to your dashboard 🎉
        </h1>

        <div className="flex items-center justify-center gap-2 text-slate-600">
          <User className="w-5 h-5" />
          <span>{userEmail}</span>
        </div>

        <p className="text-slate-500 text-sm">
          You’ve successfully logged in and verified your account.
          This is where your app’s private content will live.
        </p>

        <button
          onClick={onLogout}
          className="bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition flex items-center justify-center gap-2 mx-auto font-medium"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
