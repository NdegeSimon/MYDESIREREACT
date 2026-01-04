import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // 🔐 Attach JWT to every request
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 🚨 Global auth failure handler
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  // =============================
  // 🔐 AUTH
  // =============================

  async login(credentials) {
    const response = await this.client.post("/auth/login", credentials);
    const { access_token, user } = response.data;

    localStorage.setItem("token", access_token);
    localStorage.setItem("userData", JSON.stringify(user));

    return user;
  }

  async signup(userData) {
    const response = await this.client.post("/auth/signup", userData);
    const { access_token, user } = response.data;

    localStorage.setItem("token", access_token);
    localStorage.setItem("userData", JSON.stringify(user));

    return user;
  }

  async logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
  }

  async getCurrentUser() {
    const response = await this.client.get("/auth/me");
    localStorage.setItem("userData", JSON.stringify(response.data.user));
    return response.data.user;
  }

  isAuthenticated() {
    return !!localStorage.getItem("token");
  }

  getStoredUser() {
    const user = localStorage.getItem("userData");
    return user ? JSON.parse(user) : null;
  }

  isAdmin() {
    const user = this.getStoredUser();
    return user?.role === "admin";
  }

  // =============================
  // 👤 USER
  // =============================

  getProfile() {
    return this.client.get("/users/profile").then((r) => r.data);
  }

  updateProfile(data) {
    return this.client.put("/users/profile", data).then((r) => {
      if (r.data.user) {
        localStorage.setItem("userData", JSON.stringify(r.data.user));
      }
      return r.data;
    });
  }

  // =============================
  // 💈 APPOINTMENTS
  // =============================

  getAppointments() {
    return this.client.get("/appointments").then((r) => r.data);
  }

  createAppointment(data) {
    return this.client.post("/appointments", data).then((r) => r.data);
  }

  cancelAppointment(id) {
    return this.client.delete(`/appointments/${id}`).then((r) => r.data);
  }

  // =============================
  // 💅 SERVICES
  // =============================

  getServices() {
    return this.client.get("/services").then((r) => r.data);
  }

  getService(id) {
    return this.client.get(`/services/${id}`).then((r) => r.data);
  }

  // =============================
  // 💰 PAYMENTS
  // =============================

  getMyPayments() {
    return this.client.get("/user/payments").then((r) => r.data);
  }

  initiatePayment(data) {
    return this.client.post("/payments/initiate", data).then((r) => r.data);
  }

  // =============================
  // 🧮 ADMIN
  // =============================

  getAdminStats() {
    return this.client.get("/admin/dashboard/stats").then((r) => r.data);
  }

  adminGetAllUsers() {
    return this.client.get("/admin/users").then((r) => r.data);
  }
}

const salonApi = new ApiService();
export default salonApi;
