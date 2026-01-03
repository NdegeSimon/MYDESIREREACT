// api.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token") || localStorage.getItem("authToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user has a valid token
   */
  isAuthenticated() {
    return !!(localStorage.getItem("token") || localStorage.getItem("authToken"));
  }

  // =============================
  // 🔐 AUTH ENDPOINTS
  // =============================

  /**
   * Login user
   * @param {Object} credentials { email, password }
   */
  async login(credentials) {
    try {
      const response = await this.client.post("/auth/login", credentials);
      const { access_token, user } = response.data || {};

      if (access_token) {
        // Store token in both 'token' and 'authToken' for backward compatibility
        localStorage.setItem("token", access_token);
        localStorage.setItem("authToken", access_token);
        localStorage.setItem("userData", JSON.stringify(user));
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Signup / Register new user
   * @param {Object} userData { firstName, lastName, email, phone, password }
   */
  async signup(userData) {
    const response = await this.client.post("/auth/signup", userData);
    const { access_token, user } = response.data || {};

    if (access_token) {
      localStorage.setItem("authToken", access_token);
      localStorage.setItem("userData", JSON.stringify(user));
    }
    return response.data;
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      // Call logout API if available
      await this.client.post("/auth/logout");
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with client-side cleanup even if API call fails
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
    }
  }

  /**
   * Get current user profile
   */
  /**
   * Get current user profile with enhanced error handling and logging
   */
  async getCurrentUser() {
    try {
      console.log('🔍 Fetching current user...');
      let token = localStorage.getItem("token") || localStorage.getItem("authToken");
      
      // Clean up the token if it's wrapped in quotes
      if (token && (token.startsWith('"') || token.startsWith("'"))) {
        token = token.replace(/^["']|["']$/g, '');
        localStorage.setItem("token", token);
      }
      
      if (!token) {
        console.warn('⚠️ No authentication token found');
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log('🔑 Token found, making request to /auth/me');
      console.log('Token length:', token.length);
      
      // Make sure the token is a valid JWT (basic check)
      if (token.split('.').length !== 3) {
        console.error('❌ Invalid token format');
        await this.logout();
        throw new Error('Invalid token format. Please log in again.');
      }

      const response = await this.client.get("/auth/me", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        validateStatus: (status) => status < 500,
        withCredentials: true  // Important for cookies/sessions if using them
      });

      console.group('🔧 API Response Details');
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
      console.log('Response Data:', response.data);
      console.groupEnd();

      // Handle different response statuses
      switch (response.status) {
        case 200:
          if (response.data?.user) {
            localStorage.setItem("userData", JSON.stringify(response.data.user));
            console.log('✅ User data updated successfully');
            return response.data;
          }
          throw new Error('Invalid user data received from server');

        case 401:
          console.warn('🔒 Unauthorized - Invalid or expired token');
          await this.logout();
          throw new Error('Your session has expired. Please log in again.');

        case 422:
          console.error('❌ Validation error:', response.data?.errors || response.data?.message);
          throw new Error('Invalid request data. Please try again.');

        default:
          console.error('❌ Unexpected response:', response);
          throw new Error(`Unexpected server response (${response.status})`);
      }
    } catch (error) {
      console.group('❌ Error in getCurrentUser');
      console.error('Error message:', error.message);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Request setup error:', error.message);
      }
      
      console.groupEnd();

      // Re-throw the error for the calling component to handle
      throw error;
    }
  }

  // =============================
  // 👤 USER PROFILE ENDPOINTS
  // =============================

  /**
   * Get user profile
   */
  async getProfile() {
    const response = await this.client.get("/users/profile");
    return response.data;
  }

  /**
   * Update user profile
   * @param {Object} profileData { firstName, lastName, email, phone }
   */
  async updateProfile(profileData) {
    const response = await this.client.put("/users/profile", profileData);
    // Update localStorage with new user data
    if (response.data.user) {
      localStorage.setItem("userData", JSON.stringify(response.data.user));
    }
    return response.data;
  }

  // =============================
  // 💈 APPOINTMENT ENDPOINTS
  // =============================

  /**
   * Get all appointments (user gets their own, admin gets all)
   */
  async getAppointments() {
    const response = await this.client.get("/appointments");
    return response.data;
  }

  /**
   * Get single appointment
   * @param {string} id Appointment ID
   */
  async getAppointment(id) {
    const response = await this.client.get(`/appointments/${id}`);
    return response.data;
  }

  /**
   * Create new appointment
   * @param {Object} appointmentData { serviceId, staffId, date, time, notes }
   */
  async createAppointment(appointmentData) {
    const response = await this.client.post("/appointments", appointmentData);
    return response.data;
  }

  /**
   * Update appointment
   * @param {string} id Appointment ID
   * @param {Object} appointmentData Updated appointment data
   */
  async updateAppointment(id, appointmentData) {
    const response = await this.client.put(`/appointments/${id}`, appointmentData);
    return response.data;
  }

  /**
   * Cancel appointment
   * @param {string} id Appointment ID
   */
  async cancelAppointment(id) {
    const response = await this.client.delete(`/appointments/${id}`);
    return response.data;
  }

  // =============================
  // 💅 SERVICE ENDPOINTS
  // =============================

  /**
   * Get all services
   */
  async getServices() {
    const response = await this.client.get("/services");
    return response.data;
  }

  /**
   * Get single service
   * @param {string} id Service ID
   */
  async getService(id) {
    const response = await this.client.get(`/services/${id}`);
    return response.data;
  }

  // =============================
  // 👩‍🦱 STAFF ENDPOINTS
  // =============================

  /**
   * Get all staff members
   */
  async getStaff() {
    const response = await this.client.get("/staff");
    return response.data;
  }

  /**
   * Get single staff member
   * @param {string} id Staff ID
   */
  async getStaffMember(id) {
    const response = await this.client.get(`/staff/${id}`);
    return response.data;
  }

  // =============================
  // 💰 PAYMENT ENDPOINTS
  // =============================

  /**
   * Get user's payment history
   */
  async getMyPayments() {
    const response = await this.client.get("/user/payments");
    return response.data;
  }

  /**
   * Initiate payment
   * @param {Object} paymentData { phone, amount }
   */
  async initiatePayment(paymentData) {
    const response = await this.client.post("/payments/initiate", paymentData);
    return response.data;
  }

  // =============================
  // 🧮 ADMIN ENDPOINTS
  // =============================

  /**
   * Get dashboard statistics
   */
  async getAdminStats() {
    const response = await this.client.get("/admin/dashboard/stats");
    return response.data;
  }

  /**
   * Get all appointments (admin)
   */
  async getAllAppointments() {
    const response = await this.client.get("/admin/appointments");
    return response.data;
  }

  /**
   * Update appointment status (admin)
   * @param {string} id Appointment ID
   * @param {Object} updates { status }
   */
  async updateAppointmentStatus(id, updates) {
    const response = await this.client.put(`/admin/appointments/${id}`, updates);
    return response.data;
  }

  /**
   * Cancel appointment (admin)
   * @param {string} id Appointment ID
   */
  async cancelAppointmentAdmin(id) {
    const response = await this.client.post(`/admin/appointments/${id}/cancel`);
    return response.data;
  }

  // =============================
  // 🛠️ ADMIN SERVICE MANAGEMENT
  // =============================

  /**
   * Get all services (admin - including inactive)
   */
  async adminGetAllServices() {
    const response = await this.client.get("/admin/services");
    return response.data;
  }

  /**
   * Create new service (admin)
   * @param {Object} serviceData { name, description, price, duration, category }
   */
  async adminCreateService(serviceData) {
    const response = await this.client.post("/admin/services", serviceData);
    return response.data;
  }

  /**
   * Update service (admin)
   * @param {string} id Service ID
   * @param {Object} serviceData Updated service data
   */
  async adminUpdateService(id, serviceData) {
    const response = await this.client.put(`/admin/services/${id}`, serviceData);
    return response.data;
  }

  /**
   * Delete service (admin)
   * @param {string} id Service ID
   */
  async adminDeleteService(id) {
    const response = await this.client.delete(`/admin/services/${id}`);
    return response.data;
  }

  // =============================
  // 👨‍💼 ADMIN STAFF MANAGEMENT
  // =============================

  /**
   * Get all staff (admin - including inactive)
   */
  async adminGetAllStaff() {
    const response = await this.client.get("/admin/staff");
    return response.data;
  }

  /**
   * Create new staff member (admin)
   * @param {Object} staffData { name, email, phone, specialty, experience, bio, rating, image }
   */
  async adminCreateStaff(staffData) {
    const response = await this.client.post("/admin/staff", staffData);
    return response.data;
  }

  /**
   * Update staff member (admin)
   * @param {string} id Staff ID
   * @param {Object} staffData Updated staff data
   */
  async adminUpdateStaff(id, staffData) {
    const response = await this.client.put(`/admin/staff/${id}`, staffData);
    return response.data;
  }

  /**
   * Delete staff member (admin)
   * @param {string} id Staff ID
   */
  async adminDeleteStaff(id) {
    const response = await this.client.delete(`/admin/staff/${id}`);
    return response.data;
  }

  // =============================
  // 👥 ADMIN USER MANAGEMENT
  // =============================

  /**
   * Get all users (admin)
   */
  async adminGetAllUsers() {
    const response = await this.client.get("/admin/users");
    return response.data;
  }

  /**
   * Update user (admin)
   * @param {string} id User ID
   * @param {Object} userData { firstName, lastName, email, phone, role, isActive }
   */
  async adminUpdateUser(id, userData) {
    const response = await this.client.put(`/admin/users/${id}`, userData);
    return response.data;
  }

  // =============================
  // 🔧 UTILITY METHODS
  // =============================

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem("authToken");
  }

  /**
   * Get stored user data
   */
  getStoredUser() {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Check if user is admin
   */
  isAdmin() {
    const user = this.getStoredUser();
    return user && user.role === 'admin';
  }

  /**
   * Update stored user data
   * @param {Object} userData User data to store
   */
  updateStoredUser(userData) {
    localStorage.setItem("userData", JSON.stringify(userData));
  }

  /**
   * Health check
   */
  async healthCheck() {
    const response = await this.client.get("/health");
    return response.data;
  }
}

// Export as singleton instance
const salonApi = new ApiService();
export default salonApi;