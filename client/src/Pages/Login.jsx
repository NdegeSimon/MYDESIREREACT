import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "../App.css";
import "../index.css";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // ✅ Get the location state for success message and pre-filled email
  const location = useLocation();
  const successMessageFromSignup = location.state?.message;
  const preFilledEmail = location.state?.email;

  // ✅ Set success message and pre-filled email when component mounts
  useEffect(() => {
    if (successMessageFromSignup) {
      setSuccessMessage(successMessageFromSignup);
      // Clear the location state so message doesn't show again on refresh
      window.history.replaceState({}, document.title);
    }
    
    if (preFilledEmail) {
      setFormData(prev => ({ ...prev, email: preFilledEmail }));
    }
  }, [successMessageFromSignup, preFilledEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    
    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage("");
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
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(formData);
      
      if (result.success) {
        console.log("Login successful:", result.data);
        
        // Redirect based on user role
        if (result.data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/userdashboard");
        }
      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ submit: "Login failed. Please try again." });
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
          {/* ✅ Success message from signup */}
          {successMessage && (
            <div className="success-message">
              ✅ {successMessage}
            </div>
          )}

          {/* Error message */}
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" disabled={isLoading} />
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