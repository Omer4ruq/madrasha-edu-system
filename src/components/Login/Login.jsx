import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";

// Login Component
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Static credentials
  const STATIC_USERNAME = "admin";
  const STATIC_PASSWORD = "password123";

  // Check localStorage for authentication on component mount
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated === "true") {
      navigate("/dashboard");
    }
  }, [navigate]);

  // Handle login form submission
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === STATIC_USERNAME && password === STATIC_PASSWORD) {
      localStorage.setItem("isAuthenticated", "true");
      setError("");
      navigate("/dashboard");
    } else {
      setError("Invalid username or password");
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#DB9E30] flex items-center justify-center p-4 w-screen h-screen top-0">
      {/* Login Card */}
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Qawmi Talim
        </h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200"
              placeholder="Enter username"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200"
              placeholder="Enter password"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-[#441a05] text-white py-3 rounded-lg transition duration-300 font-semibold shadow-md"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;