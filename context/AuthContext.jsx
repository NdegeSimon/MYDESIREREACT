// // context/AuthContext.jsx
// import React, { createContext, useState, useContext, useEffect } from 'react';
// import apiService from '../utils/api';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem('authToken');
//     const userData = localStorage.getItem('userData');
    
//     if (token && userData) {
//       setUser(JSON.parse(userData));
//       // Verify token is still valid
//       apiService.getProfile()
//         .then(userData => setUser(userData))
//         .catch(() => {
//           localStorage.removeItem('authToken');
//           localStorage.removeItem('userData');
//           setUser(null);
//         })
//         .finally(() => setLoading(false));
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   const login = async (credentials) => {
//     try {
//       const data = await apiService.login(credentials);
//       setUser(data.user);
//       return { success: true, data };
//     } catch (error) {
//       return { 
//         success: false, 
//         error: error.response?.data?.message || 'Login failed' 
//       };
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('userData');
//     setUser(null);
//   };

//   const value = {
//     user,
//     login,
//     logout,
//     loading
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };