"use client";

import type { DeviceConfig } from "@/types/radioanalysis";

interface DeviceStatusProps {
  device: DeviceConfig | null;
  battery: number;
  temperature: number;
  pressure: number;
}

export default function DeviceStatus({
  device,
  battery,
  temperature,
  pressure,
}: DeviceStatusProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Device Status
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Current scanner environment
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

          <span className="text-sm font-medium text-green-600">
            Online
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-gray-200 p-4">
          <p className="text-xs text-gray-500">
            Device
          </p>

          <p className="mt-2 text-sm font-semibold text-fuchsia-300 dark:text-fuchsia-900">
            {device?.deviceName ?? "Radiation Scanner"}
          </p>
        </div>

        <div className="rounded-lg bg-gray-200 p-4 text-fuchsia-300 dark:text-fuchsia-900">
          <p className="text-xs text-gray-500">
            Location
          </p>

          <p className="mt-2 text-sm font-semibold">
            {device?.location ?? "Configured Location"}
          </p>
        </div>

        <div className="rounded-lg bg-gray-200 p-4">
          <p className="text-xs text-gray-500">
            Temperature
          </p>

          <p className="mt-2 text-sm font-semibold text-fuchsia-300 dark:text-fuchsia-900">
            {temperature.toFixed(1)} °C
          </p>
        </div>

        <div className="rounded-lg bg-gray-200 p-4">
          <p className="text-xs text-gray-500">
            Pressure
          </p>

          <p className="mt-2 text-sm font-semibold text-fuchsia-300 dark:text-fuchsia-900">
            {pressure.toFixed(0)} hPa
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Battery
          </p>

          <p className="text-sm font-semibold">
            {battery.toFixed(0)}%
          </p>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-black transition-all duration-1000"
            style={{
              width: `${battery}%`,
            }}
          />
        </div>
      </div>
    </section>
  );
}