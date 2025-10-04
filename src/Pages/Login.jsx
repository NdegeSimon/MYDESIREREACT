// Pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";
import "../index.css";
import ApiService from "../api.js";


function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      // Use the API service for login
      const response = await ApiService.login({
        email: formData.email,
        password: formData.password,
      });

      console.log("Login successful:", response);
      
      // Check user role and redirect accordingly
      if (response.user && response.user.role === 'admin') {
        // Redirect to admin dashboard for admin users
        navigate("/admin");
      } else {
        // Redirect to user dashboard for regular users
        navigate("/userdashboard");
      }
      
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ 
        submit: error.response?.data?.message || error.message || "Login failed. Please try again." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Background overlay */}
      <div className="login-background"></div>
      
      <div className="login-form-container">
        {/* Logo */}
        <div className="login-header">
          <Link to="/" className="login-logo">
            <img 
              src="/images/lg.png"
              alt="My Desire Salon" 
              className="logo-image"
              onError={(e) => {
                e.target.style.display = 'none';
                // Fallback text if image fails to load
                const fallback = document.createElement('div');
                fallback.textContent = 'MY DESIRE SALON';
                fallback.style.color = '#333';
                fallback.style.fontFamily = "'Playfair Display', serif";
                fallback.style.fontSize = '1.5rem';
                fallback.style.fontWeight = 'bold';
                e.target.parentNode.appendChild(fallback);
              }}
            />
          </Link>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {errors.submit && (
            <div className="error-message submit-error">
              {errors.submit}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span className="checkmark"></span>
              Remember me
            </label>
            <Link to="/forgot-password" className="forgot-password">
              Forgot Password?
            </Link>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                Signing In...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Test Accounts Info */}
        <div className="test-accounts-info">
          <h4>Test Accounts:</h4>
          <div className="test-account">
            <strong>Admin:</strong> admin@salon.com / password123
          </div>
          <div className="test-account">
            <strong>User:</strong> sarah@email.com / password123
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="signup-link">
          Don't have an account?{" "}
          <Link to="/signup" className="signup-text">
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;