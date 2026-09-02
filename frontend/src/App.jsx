import { useState } from "react";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";

import {
  getStoredUser,
  logout,
} from "./services/authService.js";

function App() {
  // Restore login after page refresh
  const [user, setUser] = useState(() => getStoredUser());

  const [page, setPage] = useState(() =>
    getStoredUser() ? "dashboard" : "login"
  );

  // =========================
  // LOGIN
  // =========================

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setPage("dashboard");
  };

  // =========================
  // REGISTER
  // =========================

  const handleRegister = (registeredUser) => {
    setUser(registeredUser);
    setPage("dashboard");
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    logout();
    setUser(null);
    setPage("login");
  };

  // =========================
  // DASHBOARD
  // =========================

  if (user && page === "dashboard") {
    return (
      <Dashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  // =========================
  // REGISTER
  // =========================

  if (page === "register") {
    return (
      <Register
        onRegister={handleRegister}
        onBackToLogin={() => setPage("login")}
      />
    );
  }

  // =========================
  // LOGIN
  // =========================

  return (
    <Login
      onLogin={handleLogin}
      onRegister={() => setPage("register")}
    />
  );
}

export default App;