export const ADMIN_ENDPOINTS = {
  users: "/api/admin/users",
  user: (id: string) =>
    `/api/admin/users/${encodeURIComponent(id)}`,

  scenarios: "/api/admin/scenarios",
  scenario: (userId: string) =>
    `/api/admin/scenarios/${encodeURIComponent(userId)}`,

  audit: "/api/admin/audit",

  reports: "/api/admin/reports",
  reportPdf: (id: string) =>
    `/api/admin/reports/${encodeURIComponent(id)}/pdf`,
} as const;