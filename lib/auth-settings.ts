import { promises as fs } from "fs";
import path from "path";

type AuthSettings = {
  otpEnabled: boolean;
};

const settingsFile = path.join(process.cwd(), "data", "auth-settings.json");

function defaultSettings(): AuthSettings {
  return { otpEnabled: process.env.OTP_FLOW_ENABLED !== "false" };
}

export async function getAuthSettings(): Promise<AuthSettings> {
  try {
    const raw = await fs.readFile(settingsFile, "utf8");
    const settings = JSON.parse(raw) as Partial<AuthSettings>;

    if (typeof settings.otpEnabled === "boolean") {
      return { otpEnabled: settings.otpEnabled };
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Unable to read authentication settings:", error);
    }
  }

  return defaultSettings();
}

export async function saveAuthSettings(
  settings: AuthSettings
): Promise<AuthSettings> {
  await fs.mkdir(path.dirname(settingsFile), { recursive: true });
  await fs.writeFile(settingsFile, JSON.stringify(settings, null, 2), "utf8");
  return settings;
}
