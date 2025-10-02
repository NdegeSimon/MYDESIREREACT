// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '/context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from "./components/AdminRoute";
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import UserDashboard from "./Pages/UserDashboard";
import AdminDashboard from './Pages/AdminDashboard';
import Home from './Pages/Home';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App red-black-theme">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;