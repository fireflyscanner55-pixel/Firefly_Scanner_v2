
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type GeoResult = {
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
  country_code?: string;
};

export async function GET(request: NextRequest) {
  const location = request.nextUrl.searchParams
    .get("location")
    ?.trim();

  if (!location || location.length > 150) {
    return NextResponse.json(
      { message: "A valid location is required" },
      { status: 400 }
    );
  }

  try {
    const [city, region] = location
      .split(",")
      .map((value) => value.trim());

    const geoUrl = new URL(
      "https://geocoding-api.open-meteo.com/v1/search"
    );
    geoUrl.searchParams.set("name", city);
    geoUrl.searchParams.set("count", "20");
    geoUrl.searchParams.set("language", "en");

    const geoResponse = await fetch(geoUrl, {
      next: { revalidate: 86400 },
    });

    if (!geoResponse.ok) {
      throw new Error("Geocoding service unavailable");
    }

    const geoData = await geoResponse.json();
    const places: GeoResult[] = geoData.results ?? [];

    const place =
      places.find(
        (item) =>
          item.country_code === "IN" &&
          region &&
          item.admin1?.toLowerCase() === region.toLowerCase()
      ) ??
      places.find(
        (item) =>
          item.country_code === "IN" &&
          (!region ||
            item.admin1?.toLowerCase() === region.toLowerCase())
      ) ??
      (!region ? places[0] : undefined);

    if (!place) {
      return NextResponse.json(
        { message: `Location not found: ${location}` },
        { status: 404 }
      );
    }

    const weatherUrl = new URL(
      "https://api.open-meteo.com/v1/forecast"
    );
    weatherUrl.searchParams.set(
      "latitude",
      String(place.latitude)
    );
    weatherUrl.searchParams.set(
      "longitude",
      String(place.longitude)
    );
    weatherUrl.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure"
    );
    weatherUrl.searchParams.set("timezone", "auto");

    const response = await fetch(weatherUrl, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Weather service unavailable");
    }

    const result = await response.json();
    const current = result.current;

    if (!current) {
      throw new Error("Weather readings unavailable");
    }

    return NextResponse.json({
      success: true,
      location,
      resolvedLocation: [
        place.name,
        place.admin1,
        place.country,
      ]
        .filter(Boolean)
        .join(", "),
      temperature: current.temperature_2m,
      pressure: current.surface_pressure,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      source: "Open-Meteo",
      observedAt: current.time,
      timezone: result.timezone ?? "Unknown",
    });
  } catch (error) {
    console.error("[Live Weather API]", error);

    return NextResponse.json(
      { message: "Unable to retrieve live weather" },
      { status: 502 }
    );
  }
}
