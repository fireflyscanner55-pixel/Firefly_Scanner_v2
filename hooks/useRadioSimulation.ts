"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  DeviceConfig,
  Scenario,
  SimulationConfig,
  UserScenarioConfig,
} from "@/types/radioanalysis";

import {
  nextSimulationValue,
  roundValue,
} from "@/lib/simulation";

export interface SimulationValues {
  cps: number;
  doseRate: number;
  battery: number;
  temperature: number;
  pressure: number;
}

interface UseRadioSimulationOptions {
  scenarioId?: string;
  autoStart?: boolean;
}

interface UseRadioSimulationResult {
  scenario: Scenario | null;
  config: SimulationConfig | null;
  device: DeviceConfig | null;
  userScenario: UserScenarioConfig | null;
  values: SimulationValues;
  isLoading: boolean;
  isRunning: boolean;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

const SIMULATION_INTERVAL_MS = 1000;

const initialValues: SimulationValues = {
  cps: 0,
  doseRate: 0,
  battery: 0,
  temperature: 0,
  pressure: 0,
};


import type { BatteryConfig } from "@/types/radioanalysis";

const BATTERY_DRAIN_INTERVALS = {
  slow: 600,
  normal: 300,
  fast: 120,
} as const;

function calculateBatteryLevel(
  battery: BatteryConfig,
  elapsedSeconds: number
): number {
  const initialLevel = Math.max(
    0,
    Math.min(100, battery.initialLevel)
  );

  if (battery.charging) {
    return initialLevel;
  }

  const interval =
    BATTERY_DRAIN_INTERVALS[battery.drainMode];

  const consumed = Math.floor(
    Math.max(0, elapsedSeconds) / interval
  );

  return Math.max(0, initialLevel - consumed);
}


export function useRadioSimulation({
  autoStart = false,
}: UseRadioSimulationOptions): UseRadioSimulationResult {
  const [scenario, setScenario] =
    useState<Scenario | null>(null);

  const [config, setConfig] =
    useState<SimulationConfig | null>(null);

  const [device, setDevice] =
    useState<DeviceConfig | null>(null);

  const [userScenario, setUserScenario] =
    useState<UserScenarioConfig | null>(null);

  const [values, setValues] =
    useState<SimulationValues>(initialValues);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRunning, setIsRunning] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const intervalRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    );
    
    const startedAtRef = useRef<number | null>(null);
    const elapsedBeforeStartRef = useRef(0);
  /*
   * Load the scenario configured specifically
   * for the currently logged-in user.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadConfiguration() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          "/api/user/scenario",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ??
              "Unable to load user scenario configuration."
          );
        }

        if (cancelled) return;

        const userConfig =
          data.data as UserScenarioConfig;

        setUserScenario(userConfig);

        /*
         * Convert user-specific configuration
         * into the existing simulation structure.
         *
         * This allows the existing dashboard UI
         * and simulation engine to continue working.
         */
        const simulationConfig: SimulationConfig = {
          id: userConfig.id,
          scenarioId: userConfig.id,

          cps: {
            target: userConfig.cps.target,
            min: userConfig.cps.min,
            max: userConfig.cps.max,
            unit: userConfig.cps.unit,
          },

          doseRate: {
            target: userConfig.doseRate.target,
            min: userConfig.doseRate.min,
            max: userConfig.doseRate.max,
            unit: userConfig.doseRate.unit,
          },
          
          battery: {
            initialLevel: userConfig.battery.initialLevel,
            drainMode: userConfig.battery.drainMode,
            charging: userConfig.battery.charging,
          },
          

          temperature: {
            target: userConfig.temperature.target,
            min: userConfig.temperature.min,
            max: userConfig.temperature.max,
            unit: userConfig.temperature.unit,
          },

          pressure: {
            target: userConfig.pressure.target,
            min: userConfig.pressure.min,
            max: userConfig.pressure.max,
            unit: userConfig.pressure.unit,
          },

          updateIntervalMs:
            SIMULATION_INTERVAL_MS,
        };

        const scenarioData: Scenario = {
          id: userConfig.id,
          name: userConfig.scenarioName,
          type: userConfig.scenarioType,
          enabled: userConfig.enabled,
          scanDurationSeconds:
            userConfig.scanDurationSeconds,
          videoEnabled: userConfig.videoEnabled,
          videoUrl: userConfig.videoUrl,
        };

        /*
         * Device configuration now uses the
         * user's configured location.
         */
        const deviceData: DeviceConfig = {
          id: userConfig.userId,
          deviceName: "Radiation Scanner",
          location: userConfig.location,
          status: "online",
        };

        setScenario(scenarioData);
        setConfig(simulationConfig);
        setDevice(deviceData);

        setValues({
          cps: userConfig.cps.target,
          doseRate: userConfig.doseRate.target,
          battery: userConfig.battery.initialLevel,
          temperature:
            userConfig.temperature.target,
          pressure: userConfig.pressure.target,
        });

        startedAtRef.current = autoStart ? Date.now() : null;
        elapsedBeforeStartRef.current = 0;
        setIsRunning(autoStart);
      } catch (err) {
        if (cancelled) return;

        const message =
          err instanceof Error
            ? err.message
            : "Unable to load simulation configuration.";

        setError(message);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadConfiguration();

    return () => {
      cancelled = true;
    };
  }, [autoStart]);

  /*
   * Generate the next simulated values.
   */
  
const generateNextValues = useCallback(() => {
  if (!config) return;

  const elapsedSeconds =
    elapsedBeforeStartRef.current +
    (startedAtRef.current === null
      ? 0
      : (Date.now() - startedAtRef.current) / 1000);

  setValues((previous) => ({
    cps: roundValue(
      nextSimulationValue(config.cps, previous.cps),
      0
    ),

    doseRate: roundValue(
      nextSimulationValue(
        config.doseRate,
        previous.doseRate
      ),
      3
    ),

    battery: calculateBatteryLevel(
      config.battery,
      elapsedSeconds
    ),

    temperature: roundValue(
      nextSimulationValue(
        config.temperature,
        previous.temperature
      ),
      1
    ),

    pressure: roundValue(
      nextSimulationValue(
        config.pressure,
        previous.pressure
      ),
      1
    ),
  }));
}, [config]);


const start = useCallback(() => {
  if (!config) return;

  if (startedAtRef.current === null) {
    startedAtRef.current = Date.now();
  }

  setIsRunning(true);
}, [config]);

const stop = useCallback(() => {
  if (startedAtRef.current !== null) {
    elapsedBeforeStartRef.current +=
      (Date.now() - startedAtRef.current) / 1000;

    startedAtRef.current = null;
  }

  setIsRunning(false);
}, []);

const reset = useCallback(() => {
  if (!config) return;

  startedAtRef.current = null;
  elapsedBeforeStartRef.current = 0;

  setIsRunning(false);

  setValues({
    cps: config.cps.target,
    doseRate: config.doseRate.target,
    battery: config.battery.initialLevel,
    temperature: config.temperature.target,
    pressure: config.pressure.target,
  });
}, [config]);

  /*
   * Simulation interval.
   */
  useEffect(() => {
    if (!isRunning || !config) {
      return;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(
      generateNextValues,
      SIMULATION_INTERVAL_MS
    );

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    isRunning,
    config,
    generateNextValues,
  ]);

  /*
   * Cleanup.
   */
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    scenario,
    config,
    device,
    userScenario,
    values,
    isLoading,
    isRunning,
    error,
    start,
    stop,
    reset,
  };
} 