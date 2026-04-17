import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (data: {
    email: string;
    password: string;
    company_name: string;
    industry?: string;
  }) => api.post("/auth/register", data),
  getProfile: () => api.get("/auth/me"),
};

// Connectors API
export const connectorsApi = {
  list: () => api.get("/connectors"),
  get: (id: string) => api.get(`/connectors/${id}`),
  create: (data: any) => api.post("/connectors", data),
  update: (id: string, data: any) => api.put(`/connectors/${id}`, data),
  delete: (id: string) => api.delete(`/connectors/${id}`),
  test: (id: string) => api.post(`/connectors/${id}/test`),
};

// Audits API
export const auditsApi = {
  list: () => api.get("/audits"),
  get: (id: string) => api.get(`/audits/${id}`),
  getFindings: (id: string) => api.get(`/audits/${id}/findings`),
  generate: (data?: { name?: string; audit_type?: string; scope?: object }) =>
    api.post("/audits/generate", data || {}),
  download: (id: string) => api.get(`/audits/${id}/download`),
  submit: (id: string) => api.post(`/audits/${id}/submit`),
};

// Rules API
export const rulesApi = {
  list: () => api.get("/rules"),
};

// API Keys
export const apiKeysApi = {
  list: () => api.get("/api-keys"),
  create: (data: any) => api.post("/api-keys", data),
  revoke: (id: string, reason?: string) =>
    api.post(`/api-keys/${id}/revoke`, null, { params: { reason } }),
  get: (id: string) => api.get(`/api-keys/${id}`),
};

// Documents API
export const documentsApi = {
  list: (type?: string) => api.get("/documents", { params: { type } }),
  get: (id: string) => api.get(`/documents/${id}`),
  update: (id: string, data: any) => api.put(`/documents/${id}`, data),
  delete: (id: string) => api.delete(`/documents/${id}`),
  download: (id: string) => api.get(`/documents/${id}/download`),
};
