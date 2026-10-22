"use client";

import { useEffect, useState } from "react";

export default function OtpSettings() {
  const [otpEnabled, setOtpEnabled] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/otp-settings")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load security settings.");
        return response.json() as Promise<{ otpEnabled: boolean }>;
      })
      .then((settings) => setOtpEnabled(settings.otpEnabled))
      .catch((error: Error) => setMessage(error.message));
  }, []);

  const updateOtpSetting = async () => {
    if (otpEnabled === null) return;
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/otp-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpEnabled: !otpEnabled }),
      });
      const settings = (await response.json()) as { otpEnabled?: boolean; message?: string };
      if (!response.ok || typeof settings.otpEnabled !== "boolean") {
        throw new Error(settings.message || "Unable to update security settings.");
      }
      setOtpEnabled(settings.otpEnabled);
      setMessage(settings.otpEnabled ? "OTP verification is now required for new sign-ins." : "OTP verification has been turned off for new sign-ins.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update security settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const isEnabled = otpEnabled === true;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">One-time password verification</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Require a mobile OTP after users enter their username and password. The change applies to new sign-ins immediately.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isEnabled}
          aria-label="Toggle OTP verification"
          onClick={updateOtpSetting}
          disabled={isSaving || otpEnabled === null}
          className={`relative h-8 w-14 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${isEnabled ? "bg-cyan-600" : "bg-slate-300"}`}
        >
          <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${isEnabled ? "translate-x-7" : "translate-x-1"}`} />
        </button>
      </div>
      <div className={`mt-6 rounded-2xl px-4 py-3 text-sm ${isEnabled ? "bg-cyan-50 text-cyan-800" : "bg-amber-50 text-amber-800"}`}>
        {otpEnabled === null ? "Loading current setting…" : isEnabled ? "OTP is enabled" : "OTP is disabled"}
      </div>
      {message && <p role="status" className="mt-4 text-sm text-slate-600">{message}</p>}
    </section>
  );
}
