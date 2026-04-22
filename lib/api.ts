import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

console.log("CAR-Bot API Client Initialized with URL:", API_URL);

export const api = axios.create({
  baseURL: `${API_URL.replace(/\/$/, "")}/api`,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  if (typeof FormData !== "undefined" && config.data instanceof FormData && config.headers) {
    if ("setContentType" in config.headers && typeof config.headers.setContentType === "function") {
      config.headers.setContentType(false);
    } else {
      delete config.headers["Content-Type"];
    }
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-redirect on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      Cookies.remove("token");
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (data: {
    email: string;
    password: string;
    company_name: string;
    rc_number: string;
    registration_role: string;
    industry?: string;
  }) => api.post("/auth/register", data),
  getProfile: () => api.get("/auth/me"),
  getOrganization: () => api.get("/auth/organization"),
  updateOrganization: (data: {
    name?: string;
    industry?: string;
    size?: number;
    website?: string;
    rc_number?: string;
    registration_role?: string;
    dpo_name?: string;
    dpo_email?: string;
    dpo_phone?: string;
    settings?: Record<string, unknown>;
  }) => api.patch("/auth/organization", data),
};

// ─── Connectors ──────────────────────────────────────────────────────────────
export const connectorsApi = {
  list: () => api.get("/connectors/"),
  listTypes: () => api.get("/connectors/types"),
  get: (id: string) => api.get(`/connectors/${id}`),
  create: (data: { name: string; connector_type_id: string; config: object; sync_interval?: number }) =>
    api.post("/connectors/", data),
  update: (id: string, data: Partial<{ name: string; config: object; sync_enabled: boolean; sync_interval: number }>) =>
    api.put(`/connectors/${id}`, data),
  delete: (id: string) => api.delete(`/connectors/${id}`),
  test: (id: string) => api.post(`/connectors/${id}/test`),
};

// ─── Audits ──────────────────────────────────────────────────────────────────
export const auditsApi = {
  list: (skip = 0, limit = 50) => api.get("/audits", { params: { skip, limit } }),
  get: (id: string) => api.get(`/audits/${id}`),
  generate: (data?: { name?: string; audit_type?: string; scope?: object }) =>
    api.post("/audits/generate", data || {}),
  download: (id: string) => api.get(`/audits/${id}/download`),
  submit: (id: string) => api.post(`/audits/${id}/submit`),
  diff: (id: string) => api.get(`/audits/${id}/diff`),
  remediation: (id: string) => api.get(`/audits/${id}/remediation`),

  // Findings
  getFindings: (id: string) => api.get(`/audits/${id}/findings`),
  updateFinding: (
    auditId: string,
    findingId: string,
    data: { status: string; resolution_notes?: string }
  ) => api.patch(`/audits/${auditId}/findings/${findingId}`, data),
  bulkUpdateFindings: (
    auditId: string,
    data: { ids: string[]; action: string; resolution_notes?: string }
  ) => api.post(`/audits/${auditId}/findings/batch`, data),

  // File Upload Demo Route
  uploadData: (formData: FormData) => 
    api.post("/audits/upload-data", formData),

  // WebSocket progress (returns a WS URL, not an axios call)
  progressWsUrl: (auditId: string): string => {
    const wsBase = API_URL.replace(/^http/, "ws");
    return `${wsBase}/api/audits/ws/${auditId}/progress`;
  },
};

// ─── Rules ───────────────────────────────────────────────────────────────────
export const rulesApi = {
  list: () => api.get("/rules"),
};

// ─── API Keys ────────────────────────────────────────────────────────────────
export const apiKeysApi = {
  list: () => api.get("/api-keys"),
  create: (data: { name: string; permissions?: object; rate_limit?: number; expires_at?: string }) =>
    api.post("/api-keys", data),
  revoke: (id: string, reason?: string) =>
    api.post(`/api-keys/${id}/revoke`, null, { params: { reason } }),
  get: (id: string) => api.get(`/api-keys/${id}`),
};

// ─── Documents ───────────────────────────────────────────────────────────────
export const documentsApi = {
  list: (type?: string) => api.get("/documents", { params: { type } }),
  get: (id: string) => api.get(`/documents/${id}`),
  upload: (formData: FormData) => api.post("/documents", formData),
  analyze: (id: string, formData: FormData) => api.post(`/documents/${id}/analyze`, formData),
  update: (id: string, data: object) => api.put(`/documents/${id}`, data),
  delete: (id: string) => api.delete(`/documents/${id}`),
  download: (id: string) => api.get(`/documents/${id}/download`, { responseType: "blob" }),
};

// ─── Team Management ─────────────────────────────────────────────────────────
export const usersApi = {
  list: () => api.get("/users"),
  invite: (data: { email: string; full_name: string; role: string }) =>
    api.post("/users/invite", data),
  updateRole: (userId: string, role: string) =>
    api.put(`/users/${userId}/role`, { role }),
  deactivate: (userId: string) => api.delete(`/users/${userId}`),
};

// ─── AI Chat ─────────────────────────────────────────────────────────────────
export const chatApi = {
  send: (data: {
    message: string;
    audit_id?: string;
    history?: { role: string; content: string }[];
    use_rag?: boolean;
  }) => api.post("/chat", data),
};

// ─── RAG / Clause Search ──────────────────────────────────────────────────────
export const ragApi = {
  status: () => api.get("/rag/status"),
  search: (data: { query: string; k?: number; framework?: string | null }) =>
    api.post("/rag/search", data),
  reindex: () => api.post("/rag/index"),
};

// ─── Frameworks ──────────────────────────────────────────────────────────────
export const frameworksApi = {
  list: () => api.get("/frameworks"),
  get: (id: string) => api.get(`/frameworks/${id}`),
  crosswalk: (fromFw: string, toFw: string) =>
    api.get("/frameworks/crosswalk/map", { params: { from_fw: fromFw, to_fw: toFw } }),
};

// ─── Compliance Badges ───────────────────────────────────────────────────────
export const badgeApi = {
  getSvgUrl: (orgSlug: string) => `${API_URL}/api/badge/${orgSlug}`,
};


// ─── Scheduled Audits ────────────────────────────────────────────────────────
export const scheduledAuditsApi = {
  list: () => api.get("/scheduled-audits"),
  create: (data: { name: string; cron_expression: string }) =>
    api.post("/scheduled-audits", data),
  delete: (id: string) => api.delete(`/scheduled-audits/${id}`),
};

// ─── Notifications / Webhooks ────────────────────────────────────────────────
export const notificationsApi = {
  listWebhooks: () => api.get("/notifications/webhooks"),
  createWebhook: (data: { name: string; url: string; events?: string[] }) =>
    api.post("/notifications/webhooks", data),
  deleteWebhook: (id: string) => api.delete(`/notifications/webhooks/${id}`),
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => api.get("/dashboard/stats"),
};

export const systemApi = {
  health: () => axios.get(`${API_URL.replace(/\/$/, "")}/health`),
};

