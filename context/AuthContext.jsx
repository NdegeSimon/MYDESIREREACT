import React, { createContext, useState, useContext, useEffect } from "react";
import ApiService from "../client/src/api.js";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      setUser(JSON.parse(userData));
      // Optional: validate token
      ApiService.getProfile()
        .then((res) => setUser(res))
        .catch(() => {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const data = await ApiService.login(credentials);
      setUser(data.user);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = () => {
    ApiService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
