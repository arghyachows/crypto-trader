import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import CryptoList from "@/pages/CryptoList";
import CryptoDetail from "@/pages/CryptoDetail";
import Portfolio from "@/pages/Portfolio";
import Transactions from "@/pages/Transactions";
import { Toaster } from "@/components/ui/sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Set axios defaults
axios.defaults.baseURL = API;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get("/auth/me");
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user", error);
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (token, userData) => {
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-xl font-semibold text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/auth"
            element={
              user ? <Navigate to="/" /> : <AuthPage onLogin={handleLogin} />
            }
          />
          <Route
            path="/"
            element={
              user ? (
                <Dashboard user={user} onLogout={handleLogout} onUpdateUser={setUser} />
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
          <Route
            path="/market"
            element={
              user ? (
                <CryptoList user={user} onLogout={handleLogout} onUpdateUser={setUser} />
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
          <Route
            path="/crypto/:cryptoId"
            element={
              user ? (
                <CryptoDetail user={user} onLogout={handleLogout} onUpdateUser={setUser} />
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
          <Route
            path="/portfolio"
            element={
              user ? (
                <Portfolio user={user} onLogout={handleLogout} onUpdateUser={setUser} />
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
          <Route
            path="/transactions"
            element={
              user ? (
                <Transactions user={user} onLogout={handleLogout} onUpdateUser={setUser} />
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;