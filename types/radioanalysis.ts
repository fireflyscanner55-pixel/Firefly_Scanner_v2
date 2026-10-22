export type UserRole = "admin" | "user";

export interface RadioUser {
  id: string;
  username: string;
  password: string;
  name: string;
  phone: string;
  role: UserRole;
  otpEnabled: boolean;
  active: boolean;
}

export interface Scenario {
  id: string;
  name: string;
  type: "positive" | "negative";
  enabled: boolean;
  scanDurationSeconds: number;
  videoEnabled: boolean;
  videoUrl?: string;
  noRadiationMessage?: string;
}

export interface SimulationRange {
  target: number;
  min: number;
  max: number;
  unit: string;
}

export type BatteryDrainMode = "slow" | "normal" | "fast";

export interface BatteryConfig {
  initialLevel: number;
  drainMode: BatteryDrainMode;
  charging: boolean;
}

export interface SimulationConfig {
  id: string;
  scenarioId: string;
  cps: SimulationRange;
  doseRate: SimulationRange;
  battery: BatteryConfig;
  temperature: SimulationRange;
  pressure: SimulationRange;
  updateIntervalMs: number;
}

export interface Isotope {
  id: string;
  name: string;
  symbol?: string;
  energy?: string;
  description?: string;
  enabled: boolean;
  scenarioIds: string[];
  activity: SimulationRange;
  status?: string[];
}

export interface ScanConfig {
  durationSeconds: number;
  videoUrl: string;
}

export interface DeviceConfig {
  id: string;
  deviceName: string;
  location: string;
  status: "online" | "offline" | "maintenance";
}

export interface OtpConfig {
  id: string;
  enabled: boolean;
  expirySeconds: number;
  resendAfterSeconds: number;
  maxAttempts: number;
}

export interface PdfConfig {
  id: string;
  enabled: boolean;
  title: string;
  includeCharts: boolean;
  includeIsotope: boolean;
  includeDeviceStatus: boolean;
}

export interface IsotopeReportEntry {
  name: string;
  symbol?: string;
  status?: string;
}

export interface ScanReport {
  id?: string;
  scenarioId: string;

  scenarioName: string;

  cpsTarget: number;
  doseRateTarget: number;
  batteryTarget?: number;
  temperatureTarget?: number;
  pressureTarget?: number;

  isotopeName?: string;
  isotopeStatus?: string;
  isotopes?: IsotopeReportEntry[];

  createdAt: string;
}

export interface UserScenarioIsotope {
  id: string;
  name: string;
  symbol?: string;
  status: "stable" | "unstable";
  energy?:string;
  description?: string;
}

export interface UserImpression {
  title: string;
  description: string;
}

export interface UserScenarioConfig {
  id: string;

  userId: string;

  scenarioType: "positive" | "negative";

  scenarioName: string;

  enabled: boolean;

  scanDurationSeconds: number;

  videoEnabled: boolean;

  videoUrl?: string;

  cps: SimulationRange;

  doseRate: SimulationRange;

  battery: BatteryConfig;

  temperature: SimulationRange;

  pressure: SimulationRange;

  location: string;

  isotopes: UserScenarioIsotope[];

  impression: UserImpression[];

  updatedAt: string;
}