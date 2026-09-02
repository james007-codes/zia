import { useState } from "react";
import {
  registerUser,
  registerAdmin,
} from "../services/authService.js";

export default function Register({ onRegister, onBackToLogin }) {
  const [role, setRole] = useState("user");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters"
      );
      return;
    }

    setLoading(true);

    try {
      const data =
        role === "admin"
          ? await registerAdmin(
              name,
              email,
              password
            )
          : await registerUser(
              name,
              email,
              password
            );

      const registeredUser =
        role === "admin"
          ? {
              ...data.admin,
              role: "admin",
            }
          : {
              ...data.user,
              role: "user",
            };

      onRegister(registeredUser);
    } catch (err) {
      setError(
        err.message || "Registration failed"
      );
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
            Create account
          </h2>

          <p className="text-sm text-slate-500 mb-6">
            Register to continue to ZIA
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

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* NAME */}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter your name"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            {/* EMAIL */}

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

            {/* PASSWORD */}

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
                placeholder="Create a password"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            {/* CONFIRM PASSWORD */}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm your password"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            {/* REGISTER */}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-50 transition"
            >
              {loading
                ? "Creating account..."
                : `Register as ${
                    role === "admin"
                      ? "Admin"
                      : "User"
                  }`}
            </button>

          </form>

          {/* BACK TO LOGIN */}

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Already have an account?{" "}
              <span className="font-semibold">
                Login
              </span>
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