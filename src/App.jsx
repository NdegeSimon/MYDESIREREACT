// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext'; // Uncommented and fixed path
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import UserDashboard from "./Pages/UserDashboard";
import AdminDashboard from './Pages/AdminDashboard';
import Home from './Pages/Home';
import Footer from './components/Footer'
import './App.css';

// Remove these duplicate definitions since you're importing them
// const ProtectedRoute = ({ children }) => {
//   const { user, loading } = useAuth();
  
//   if (loading) {
//     return <div>Loading...</div>;
//   }
  
//   return user ? children : <Navigate to="/login" />;
// };

// const AdminRoute = ({ children }) => {
//   const { user, loading } = useAuth();
  
//   if (loading) {
//     return <div>Loading...</div>;
//   }
  
//   return user && user.role === 'admin' ? children : <Navigate to="/" />;
// };

// If you want to define them here instead of importing, use these:
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user && user.role === 'admin' ? children : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          {/* Add Header component if you have one, or remove */}
          {/* <Header /> */}
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} /> {/* Fixed: Signup vs Register */}
              <Route path="/userdashboard" element={<UserDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              {/* Protected Routes */}
              <Route 
                path="/userdashboard" 
                element={
                  <ProtectedRoute>
                    <UserDashboard /> {/* Fixed: UserDashboard vs Dashboard */}
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
            </Routes>
          </main>
         
           <Footer /> 
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;