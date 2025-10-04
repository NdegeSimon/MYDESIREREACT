// utils/api.js
import axios from "axios";

// Vite uses import.meta.env, not process.env
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      timeout: 10000,
    });

    // === Attach token automatically ===
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("authToken");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );

    // === Global response handler ===
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
   * @param {Object} userData { name, email, password, etc. }
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

  async logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  }

  async getCurrentUser() {
    const response = await this.client.get("/auth/me");
    return response.data;
  }

  // =============================
  // 👤 USER ENDPOINTS
  // =============================
  async getProfile() {
    const response = await this.client.get("/users/profile");
    return response.data;
  }

  async updateProfile(profileData) {
    const response = await this.client.put("/users/profile", profileData);
    return response.data;
  }

  // =============================
  // 💈 APPOINTMENTS
  // =============================
  async getAppointments() {
    const response = await this.client.get("/appointments");
    return response.data;
  }

  async getAppointment(id) {
    const response = await this.client.get(`/appointments/${id}`);
    return response.data;
  }

  async createAppointment(appointmentData) {
    const response = await this.client.post("/appointments", appointmentData);
    return response.data;
  }

  async updateAppointment(id, appointmentData) {
    const response = await this.client.put(`/appointments/${id}`, appointmentData);
    return response.data;
  }

  async cancelAppointment(id) {
    const response = await this.client.delete(`/appointments/${id}`);
    return response.data;
  }

  // =============================
  // 💅 SERVICES
  // =============================
  async getServices() {
    const response = await this.client.get("/services");
    return response.data;
  }

  async getService(id) {
    const response = await this.client.get(`/services/${id}`);
    return response.data;
  }

  // =============================
  // 👩‍🦱 STAFF
  // =============================
  async getStaff() {
    const response = await this.client.get("/staff");
    return response.data;
  }

  async getStaffMember(id) {
    const response = await this.client.get(`/staff/${id}`);
    return response.data;
  }

  // =============================
  // 🧮 ADMIN
  // =============================
  async getDashboardStats() {
    const response = await this.client.get("/admin/dashboard/stats");
    return response.data;
  }
}

export default new ApiService();
