import type {
  DeviceConfig,
  Isotope,
  OtpConfig,
  PdfConfig,
  RadioUser,
  ScanConfig,
  Scenario,
  SimulationConfig,
  ScanReport,
  UserScenarioConfig,
} from "@/types/radioanalysis";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_MOCK_API_URL ??
  "http://localhost:3001";

async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Mock API request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

export const radioApi = {
// --------------------------------
// Users
// --------------------------------

getUsers: () =>
  apiFetch<RadioUser[]>("/users"),

getUserByUsername: async (
  username: string
): Promise<RadioUser | null> => {
  const users = await apiFetch<RadioUser[]>(
    `/users?username=${encodeURIComponent(username)}`
  );

  return users[0] ?? null;
},

getUserById: (
  id: string
) =>
  apiFetch<RadioUser>(
    `/users/${encodeURIComponent(id)}`
  ),

createUser: async (
  user: Omit<RadioUser, "id">
): Promise<RadioUser> => {
  return apiFetch<RadioUser>("/users", {
    method: "POST",
    body: JSON.stringify(user),
  });
},

updateUser: async (
  id: string,
  user: Partial<Omit<RadioUser, "id">>
): Promise<RadioUser> => {
  return apiFetch<RadioUser>(
    `/users/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(user),
    }
  );
},

deleteUser: async (
  id: string
): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/users/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete user.");
  }
},

  // --------------------------------
  // Scenarios
  // --------------------------------

  getScenarios: () =>
    apiFetch<Scenario[]>("/scenarios"),

  getScenario: (
    id: string
  ) =>
    apiFetch<Scenario>(
      `/scenarios/${encodeURIComponent(id)}`
    ),

  // --------------------------------
  // Simulation Config
  // --------------------------------

  getSimulationConfigs: () =>
    apiFetch<SimulationConfig[]>(
      "/simulationConfig"
    ),

  getSimulationConfig: async (
    scenarioId: string
  ): Promise<SimulationConfig | null> => {
    const configs =
      await apiFetch<SimulationConfig[]>(
        `/simulationConfig?scenarioId=${encodeURIComponent(
          scenarioId
        )}`
      );

    return configs[0] ?? null;
  },

  // --------------------------------
  // Device
  // --------------------------------

  getDeviceConfig: () =>
    apiFetch<DeviceConfig>(
      "/deviceConfig"
    ),

  // --------------------------------
  // OTP
  // --------------------------------

  getOtpConfig: () =>
    apiFetch<OtpConfig>(
      "/otpConfig"
    ),

  // --------------------------------
  // PDF
  // --------------------------------

  getPdfConfig: () =>
    apiFetch<PdfConfig>(
      "/pdfConfig"
    ),

  async getScanConfig(): Promise<ScanConfig | null> {
  const response = await fetch(
    `${API_BASE_URL}/scanConfig`
  );

  if (!response.ok) {
    throw new Error("Failed to load scan configuration.");
  }

  return response.json();
},
async getIsotopes(): Promise<Isotope[]> {
  const response = await fetch(
    `${API_BASE_URL}/isotopes`
  );

  if (!response.ok) {
    throw new Error("Failed to load isotopes.");
  }

  return response.json();
},

// --------------------------------
// User Scenario Configurations
// --------------------------------

getUserScenarioConfigs: () =>
  apiFetch<UserScenarioConfig[]>(
    "/userScenarioConfigs"
  ),

getUserScenarioConfig: async (
  userId: string
): Promise<UserScenarioConfig | null> => {
  const configs =
    await apiFetch<UserScenarioConfig[]>(
      `/userScenarioConfigs?userId=${encodeURIComponent(
        userId
      )}`
    );

  return configs[0] ?? null;
},

createUserScenarioConfig: async (
  config: Omit<UserScenarioConfig, "id">
): Promise<UserScenarioConfig> => {
  return apiFetch<UserScenarioConfig>(
    "/userScenarioConfigs",
    {
      method: "POST",
      body: JSON.stringify(config),
    }
  );
},

updateUserScenarioConfig: async (
  id: string,
  config: Partial<
    Omit<UserScenarioConfig, "id">
  >
): Promise<UserScenarioConfig> => {
  return apiFetch<UserScenarioConfig>(
    `/userScenarioConfigs/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(config),
    }
  );
},

  // --------------------------------
  // Scan Reports
  // --------------------------------

async createScanReport(
  report: ScanReport
): Promise<ScanReport> {
  const response = await fetch(
    `${API_BASE_URL}/scanReports`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(report),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create scan report.");
  }

  return response.json();
},  
};

