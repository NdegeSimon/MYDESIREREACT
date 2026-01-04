// In client/src/context/AuthContext.jsx
// In AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "../api";  // This is the correct path from client/src/context/ // If your api.js is in /client/src/api.js
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Verify the token with your backend
          const userData = await api.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid token
        localStorage.removeItem('token');
      } finally {
        setLoading(false); // Make sure to set loading to false
      }
    };

    checkAuth();
  }, []);

  const value = {
    user,
    setUser,
    loading,
    // Add other auth methods here (login, logout, etc.)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}