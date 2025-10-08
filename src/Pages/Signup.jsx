// Pages/Signup.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import "../App.css";
import "../index.css";
import ApiService from "../api";

function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (errors[name] || errors.submit) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
        submit: ""
      }));
    }
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    } else {
      // Check for specific email domains if needed
      const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
      const emailDomain = formData.email.split('@')[1];
      if (!allowedDomains.includes(emailDomain)) {
        newErrors.email = "Please use Gmail, Yahoo, or Outlook email";
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = "Password must contain both uppercase and lowercase letters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
    setErrors({});
    setSuccessMessage("");
    
    try {
      console.log("🔄 Attempting signup with:", formData);

      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        password: formData.password
      };

      console.log("📤 Sending payload:", payload);

      const response = await ApiService.signup(payload);
      
      console.log("✅ Signup successful:", response);

      // Show success message
      setSuccessMessage("Account created successfully! Redirecting to login...");
      
      // Clear form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login", { 
          state: { 
            message: "Account created successfully! Please log in to continue.",
            email: payload.email // Pass email to pre-fill login form
          } 
        });
      }, 2000);
      
    } catch (error) {
      console.error("❌ Signup error:", error);
      
      let userFriendlyMessage = "Signup failed. Please try again.";
      
      if (error.response?.data) {
        const serverData = error.response.data;
        
        // Handle different types of server errors
        if (serverData.message) {
          const message = serverData.message.toLowerCase();
          
          if (message.includes('email') && message.includes('already') || message.includes('exist')) {
            userFriendlyMessage = "This email is already registered. Please use a different email or try logging in.";
          } else if (message.includes('email') && message.includes('invalid')) {
            userFriendlyMessage = "Please enter a valid email address.";
          } else if (message.includes('password')) {
            userFriendlyMessage = "Password does not meet requirements. Please try a stronger password.";
          } else if (message.includes('phone')) {
            userFriendlyMessage = "Please enter a valid phone number.";
          } else {
            userFriendlyMessage = serverData.message;
          }
        } else if (serverData.error) {
          userFriendlyMessage = serverData.error;
        } else if (typeof serverData === 'string') {
          userFriendlyMessage = serverData;
        }
      } else if (error.code === 'ERR_NETWORK') {
        userFriendlyMessage = "Network error. Please check your connection and try again.";
      }

      setErrors({ submit: userFriendlyMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Test the endpoint directly (for debugging)
  const testEndpointDirectly = async () => {
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    
    const testData = {
      firstName: "Test",
      lastName: "User",
      email: `test${Date.now()}@gmail.com`,
      phone: "0710899679",
      password: "Password123"
    };

    console.log("🧪 Testing endpoint directly with:", testData);

    try {
      const response = await axios.post(`${API_BASE}/auth/signup`, testData);
      console.log("✅ Direct test SUCCESS:", response.data);
      alert("Endpoint test successful! Check console for details.");
    } catch (error) {
      console.log("❌ Direct test FAILED:", error.response?.data);
      alert("Endpoint test failed. Check console for details.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-background"></div>
      
      <div className="signup-form-container">
        <div className="signup-header">
          <Link to="/" className="signup-logo">
            <img 
              src="/images/lg.png" 
              alt="My Desire Salon" 
              className="logo-image"
            />
          </Link>
          <h1 className="signup-title">Create Account</h1>
          <p className="signup-subtitle">Join My Desire Salon today</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {/* Success Message */}
          {successMessage && (
            <div className="success-message">
              ✅ {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="error-message submit-error">
              ❌ {errors.submit}
            </div>
          )}

          <div className="name-fields">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`form-input ${errors.firstName ? 'error' : ''}`}
                placeholder="First name"
                required
                disabled={isLoading}
              />
              {errors.firstName && (
                <span className="error-message">{errors.firstName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`form-input ${errors.lastName ? 'error' : ''}`}
                placeholder="Last name"
                required
                disabled={isLoading}
              />
              {errors.lastName && (
                <span className="error-message">{errors.lastName}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="your.email@gmail.com"
              required
              disabled={isLoading}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder="0712345678"
              required
              disabled={isLoading}
            />
            {errors.phone && (
              <span className="error-message">{errors.phone}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Create a strong password"
              required
              minLength="6"
              disabled={isLoading}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
            <div className="password-requirements">
              <small>Must be at least 6 characters with uppercase and lowercase letters</small>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Re-enter your password"
              required
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          <button 
            type="submit" 
            className="signup-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                Creating Account...
              </div>
            ) : (
              "Create Account"
            )}
          </button>

          {/* Debug button - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                type="button" 
                className="debug-button"
                onClick={testEndpointDirectly}
                style={{ 
                  background: '#666', 
                  padding: '8px 12px', 
                  fontSize: '12px',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Test Endpoint
              </button>
            </div>
          )}
        </form>

        <div className="login-link">
          Already have an account?{" "}
          <Link to="/login" className="login-text">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;