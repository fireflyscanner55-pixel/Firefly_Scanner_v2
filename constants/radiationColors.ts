
export type RadiationType = "alpha" | "beta" | "gamma";

export const RADIATION_COLORS = {
  alpha: {
    primary: "#ff0000",
    dark: "#b40909",
    light: "#fc4d4d",
    soft: "#fec7c7",
    shades: [
      "#920e0e",
      "#d90606",
      "#f50b0b",
      "#fc4d4d",
    ],
  },
  beta: {
    primary: "#3ef63b",
    dark: "#1dd820",
    light: "#98fd93",
    soft: "#dbfedb",
    shades: [
      "#1eaf20",
      "#28eb25",
      "#3bf63b",
      "#93fd9e",
    ],
  },
  gamma: {
    primary: "#3B82F6",
    dark: "#1D4ED8",
    light: "#93C5FD",
    soft: "#DBEAFE",
    shades: [
      "#1E40AF",
      "#2563EB",
      "#3B82F6",
      "#93C5FD",
    ],
  },
} as const;

export function getRadiationColors(
  type: RadiationType
) {
  return RADIATION_COLORS[type];
}
