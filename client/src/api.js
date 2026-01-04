import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 🔐 Attach JWT to every request
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

class ApiService {
  // =============================
  // 🔐 AUTH
  // =============================

  async login(credentials) {
    const res = await client.post("/auth/login", credentials);

    const { access_token, user } = res.data;
    if (!access_token || !user) {
      throw new Error("Invalid login response from server");
    }

    localStorage.setItem("token", access_token);
    localStorage.setItem("userData", JSON.stringify(user));

    return user;
  }

  async signup(data) {
    const res = await client.post("/auth/signup", data);

    const { access_token, user } = res.data;
    if (!access_token || !user) {
      throw new Error("Invalid signup response from server");
    }

    localStorage.setItem("token", access_token);
    localStorage.setItem("userData", JSON.stringify(user));

    return user;
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
  }

  async getCurrentUser() {
    const res = await client.get("/auth/me");
    localStorage.setItem("userData", JSON.stringify(res.data.user));
    return res.data.user;
  }

  // =============================
  // 👤 USER
  // =============================

  getProfile() {
    return client.get("/users/profile").then((r) => r.data);
  }

  updateProfile(data) {
    return client.put("/users/profile", data).then((r) => r.data);
  }

  // =============================
  // 💈 APPOINTMENTS
  // =============================

  getAppointments() {
    return client.get("/appointments").then((r) => r.data);
  }

  createAppointment(data) {
    return client.post("/appointments", data).then((r) => r.data);
  }

  cancelAppointment(id) {
    return client.delete(`/appointments/${id}`).then((r) => r.data);
  }

  // =============================
  // 💅 SERVICES
  // =============================

  getServices() {
    return client.get("/services").then((r) => r.data);
  }

  getService(id) {
    return client.get(`/services/${id}`).then((r) => r.data);
  }

  // =============================
  // 💰 PAYMENTS
  // =============================

  getMyPayments() {
    return client.get("/user/payments").then((r) => r.data);
  }

  initiatePayment(data) {
    return client.post("/payments/initiate", data).then((r) => r.data);
  }

  // =============================
  // 🧮 ADMIN
  // =============================

  getAdminStats() {
    return client.get("/admin/dashboard/stats").then((r) => r.data);
  }

  adminGetAllUsers() {
    return client.get("/admin/users").then((r) => r.data);
  }
}

export default new ApiService();
