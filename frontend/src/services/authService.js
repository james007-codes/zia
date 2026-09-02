const API_BASE_URL = "http://localhost:5000/api";

/* =========================
   USER LOGIN
========================= */

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  localStorage.setItem("role", "user");

  return data;
};

/* =========================
   ADMIN LOGIN
========================= */

export const loginAdmin = async (email, password) => {
  const response = await fetch(
    `${API_BASE_URL}/auth/admin/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Admin login failed"
    );
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem(
    "user",
    JSON.stringify(data.admin)
  );
  localStorage.setItem("role", "admin");

  return data;
};

/* =========================
   USER REGISTER
========================= */

export const registerUser = async (
  name,
  email,
  password
) => {
  const response = await fetch(
    `${API_BASE_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Registration failed"
    );
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem(
    "user",
    JSON.stringify(data.user)
  );
  localStorage.setItem("role", "user");

  return data;
};

/* =========================
   ADMIN REGISTER
========================= */

export const registerAdmin = async (
  name,
  email,
  password
) => {
  const response = await fetch(
    `${API_BASE_URL}/auth/admin/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Admin registration failed"
    );
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem(
    "user",
    JSON.stringify(data.admin)
  );
  localStorage.setItem("role", "admin");

  return data;
};

/* =========================
   LOGOUT
========================= */

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
};

/* =========================
   GET TOKEN
========================= */

export const getToken = () => {
  return localStorage.getItem("token");
};

/* =========================
   GET STORED USER
========================= */

export const getStoredUser = () => {
  const user = localStorage.getItem("user");

  return user ? JSON.parse(user) : null;
};

/* =========================
   GET ROLE
========================= */

export const getRole = () => {
  return localStorage.getItem("role");
};