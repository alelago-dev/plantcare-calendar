export type WeatherReadiness = {
  providerLabel: string;
  region: string;
  message: string;
  isLive: boolean;
  preview: Array<{
    label: string;
    value: string;
  }>;
};

export function getWeatherReadiness(region: string): WeatherReadiness {
  return {
    isLive: false,
    providerLabel: "Ubicacion pendiente",
    region,
    message:
      "Toca Usar ubicacion para traer clima real del dispositivo. La app usa coordenadas aproximadas y no guarda direccion exacta.",
    preview: [
      { label: "Temp.", value: "--" },
      { label: "Humedad", value: "--" },
      { label: "Lluvia", value: "--" },
      { label: "Viento", value: "--" }
    ]
  };
}

type OpenMeteoResponse = {
  current?: {
    apparent_temperature?: number;
    cloud_cover?: number;
    precipitation?: number;
    rain?: number;
    relative_humidity_2m?: number;
    temperature_2m?: number;
    time?: string;
    wind_direction_10m?: number;
    wind_speed_10m?: number;
  };
  daily?: {
    sunrise?: string[];
    sunset?: string[];
    uv_index_max?: number[];
  };
  hourly?: {
    precipitation_probability?: number[];
  };
  timezone?: string;
};

type ReverseGeocodeResponse = {
  city?: string;
  countryName?: string;
  locality?: string;
  principalSubdivision?: string;
};

export async function getDeviceWeather(latitude: number, longitude: number): Promise<WeatherReadiness> {
  const params = new URLSearchParams({
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "rain",
      "cloud_cover",
      "wind_speed_10m",
      "wind_direction_10m"
    ].join(","),
    daily: ["sunrise", "sunset", "uv_index_max"].join(","),
    forecast_days: "1",
    hourly: "precipitation_probability",
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    timezone: "auto",
    wind_speed_unit: "kmh"
  });
  const [response, region] = await Promise.all([
    fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`),
    getApproximateRegion(latitude, longitude)
  ]);

  if (!response.ok) {
    throw new Error("No se pudo consultar el clima.");
  }

  const data = (await response.json()) as OpenMeteoResponse;
  const current = data.current ?? {};
  const daily = data.daily ?? {};
  const precipitationProbability = data.hourly?.precipitation_probability?.[0];
  const localTime = current.time ? formatWeatherTime(current.time) : "Ahora";

  return {
    isLive: true,
    message: `Actualizado ${localTime}. Fuente: Open-Meteo, con zona horaria ${data.timezone ?? "auto"}.`,
    preview: [
      { label: "Temp.", value: formatNumber(current.temperature_2m, " C") },
      { label: "Sensacion", value: formatNumber(current.apparent_temperature, " C") },
      { label: "Humedad", value: formatNumber(current.relative_humidity_2m, "%") },
      { label: "Lluvia", value: formatRain(current.precipitation, precipitationProbability) },
      { label: "Viento", value: formatNumber(current.wind_speed_10m, " km/h") },
      { label: "Nubes", value: formatNumber(current.cloud_cover, "%") },
      { label: "Amanecer", value: formatWeatherTime(daily.sunrise?.[0]) },
      { label: "Atardecer", value: formatWeatherTime(daily.sunset?.[0]) }
    ],
    providerLabel: "Open-Meteo en tiempo real",
    region
  };
}

async function getApproximateRegion(latitude: number, longitude: number) {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      localityLanguage: "es",
      longitude: longitude.toString()
    });
    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?${params.toString()}`);

    if (!response.ok) {
      return "Ubicacion aproximada detectada";
    }

    const data = (await response.json()) as ReverseGeocodeResponse;
    const city = data.city || data.locality;
    const province = data.principalSubdivision;
    const country = data.countryName;

    return [city, province, country].filter(Boolean).join(", ") || "Ubicacion aproximada detectada";
  } catch {
    return "Ubicacion aproximada detectada";
  }
}

function formatNumber(value: number | undefined, unit: string) {
  return typeof value === "number" ? `${Math.round(value)}${unit}` : "--";
}

function formatRain(precipitation: number | undefined, probability: number | undefined) {
  const millimeters = typeof precipitation === "number" ? `${precipitation.toFixed(1)} mm` : "--";

  if (typeof probability !== "number") {
    return millimeters;
  }

  return `${millimeters} / ${Math.round(probability)}%`;
}

function formatWeatherTime(value: string | undefined) {
  if (!value) return "--";

  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
