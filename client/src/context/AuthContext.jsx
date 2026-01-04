import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth on refresh
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await api.getCurrentUser();
        setUser(res.user || res);
      } catch (err) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async ({ email, password }) => {
    try {
      const response = await api.login({ email, password });
      
      if (!response || !response.access_token || !response.user) {
        throw new Error('Invalid response from server');
      }

      // Update the user state
      setUser(response.user);

      return {
        success: true,
        data: { user: response.user }
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
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
