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

  // === AUTH ===
  async login(credentials) {
    const response = await this.client.post("/auth/login", credentials);
    const { access_token, user } = response.data || {};

    if (access_token) {
      localStorage.setItem("authToken", access_token);
      localStorage.setItem("userData", JSON.stringify(user));
    }
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get("/auth/me");
    return response.data;
  }

  // === PROFILE ===
  async getProfile() {
    const response = await this.client.get("/auth/me"); // keep it consistent
    return response.data;
  }
}

const salonApi = new ApiService();
export default salonApi;
