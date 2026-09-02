import { useState } from "react";
import {
  loginUser,
  loginAdmin,
} from "../services/authService.js";

export default function Login({ onLogin, onRegister }) {
  const [role, setRole] = useState("user");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data =
        role === "admin"
          ? await loginAdmin(email, password)
          : await loginUser(email, password);

      const loggedInUser =
        role === "admin"
          ? {
              ...data.admin,
              role: "admin",
            }
          : {
              ...data.user,
              role: "user",
            };

      onLogin(loggedInUser);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900">
            ZIA
          </h1>

          <p className="text-slate-500 mt-2">
            AI-powered healthcare assistant
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">

          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Welcome back
          </h2>

          <p className="text-sm text-slate-500 mb-6">
            Login to continue to ZIA
          </p>

          {/* ROLE */}

          <div className="grid grid-cols-2 gap-2 mb-6 bg-slate-100 p-1 rounded-lg">

            <button
              type="button"
              onClick={() => setRole("user")}
              className={`py-2.5 rounded-md text-sm font-semibold transition ${
                role === "user"
                  ? "bg-white shadow text-slate-900"
                  : "text-slate-500"
              }`}
            >
              User
            </button>

            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`py-2.5 rounded-md text-sm font-semibold transition ${
                role === "admin"
                  ? "bg-white shadow text-slate-900"
                  : "text-slate-500"
              }`}
            >
              Admin
            </button>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-50 transition"
            >
              {loading
                ? "Logging in..."
                : `Login as ${
                    role === "admin"
                      ? "Admin"
                      : "User"
                  }`}
            </button>

          </form>

          {/* REGISTER */}

          <div className="text-center mt-6 pt-5 border-t border-slate-200">

            <p className="text-sm text-slate-500">
              Don't have an account?
            </p>

            <button
              type="button"
              onClick={onRegister}
              className="mt-2 text-sm font-semibold text-slate-900 hover:underline"
            >
              Create an account
            </button>

          </div>

        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          ZIA — Zero Interface AI
        </p>

      </div>
    </div>
  );
}