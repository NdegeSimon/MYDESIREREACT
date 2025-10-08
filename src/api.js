// api.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      timeout: 10000,
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("authToken");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // =============================
  // 🔐 AUTH ENDPOINTS
  // =============================

  /**
   * Login user
   * @param {Object} credentials { email, password }
   */
  async login(credentials) {
    const response = await this.client.post("/auth/login", credentials);
    const { access_token, user } = response.data || {};

    if (access_token) {
      localStorage.setItem("authToken", access_token);
      localStorage.setItem("userData", JSON.stringify(user));
    }
    return response.data;
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
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  }

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    const response = await this.client.get("/auth/me");
    return response.data;
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
    if (response.data) {
      localStorage.setItem("userData", JSON.stringify(response.data));
    }
    return response.data;
  }

  // =============================
  // 💈 APPOINTMENT ENDPOINTS
  // =============================

  /**
   * Get all appointments (admin)
   */
  async getAppointments() {
    const response = await this.client.get("/appointments");
    return response.data;
  }

  /**
   * Get user's appointments
   */
  async getMyAppointments() {
    const response = await this.client.get("/appointments/my-appointments");
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
   * @param {Object} appointmentData { serviceId, staffId, date, time }
   */
  async createAppointment(appointmentData) {
    const response = await this.client.post("/appointments", appointmentData);
    return response.data;
  }

  /**
   * Book appointment (user)
   * @param {Object} appointmentData { serviceId, staffId, date, time }
   */
  async bookAppointment(appointmentData) {
    const response = await this.client.post("/appointments/book", appointmentData);
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

  /**
   * Cancel user's appointment
   * @param {string} id Appointment ID
   */
  async cancelMyAppointment(id) {
    const response = await this.client.put(`/appointments/${id}/cancel`);
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
    const response = await this.client.get("/payments/my-payments");
    return response.data;
  }

  /**
   * Get all payments (admin)
   */
  async getPayments() {
    const response = await this.client.get("/payments");
    return response.data;
  }

  /**
   * Create payment
   * @param {Object} paymentData { appointmentId, amount, paymentMethod }
   */
  async createPayment(paymentData) {
    const response = await this.client.post("/payments", paymentData);
    return response.data;
  }

  // =============================
  // 🔔 NOTIFICATION ENDPOINTS
  // =============================

  /**
   * Get user's notifications
   */
  async getMyNotifications() {
    const response = await this.client.get("/notifications");
    return response.data;
  }

  /**
   * Mark notification as read
   * @param {string} id Notification ID
   */
  async markNotificationAsRead(id) {
    const response = await this.client.put(`/notifications/${id}/read`);
    return response.data;
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead() {
    const response = await this.client.put("/notifications/read-all");
    return response.data;
  }

  // =============================
  // 🧮 ADMIN ENDPOINTS
  // =============================

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const response = await this.client.get("/admin/dashboard/stats");
    return response.data;
  }

  /**
   * Get all users (admin)
   */
  async getUsers() {
    const response = await this.client.get("/admin/users");
    return response.data;
  }

  /**
   * Update user role (admin)
   * @param {string} id User ID
   * @param {Object} roleData { role }
   */
  async updateUserRole(id, roleData) {
    const response = await this.client.put(`/admin/users/${id}/role`, roleData);
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
   * Update stored user data
   * @param {Object} userData User data to store
   */
  updateStoredUser(userData) {
    localStorage.setItem("userData", JSON.stringify(userData));
  }
}

// Export as singleton instance
const salonApi = new ApiService();
export default salonApi;