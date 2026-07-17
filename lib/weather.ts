export type WeatherReadiness = {
  providerLabel: string;
  region: string;
  message: string;
  preview: Array<{
    label: string;
    value: string;
  }>;
};

export function getWeatherReadiness(region: string): WeatherReadiness {
  return {
    providerLabel: process.env.NEXT_PUBLIC_WEATHER_PROVIDER || "Proveedor pendiente",
    region,
    message:
      "La interfaz esta preparada para recibir temperatura, humedad, lluvia y viento desde una API meteorologica. Hasta conectar credenciales, estos valores son demostrativos.",
    preview: [
      { label: "Temp.", value: "18 C" },
      { label: "Humedad", value: "62%" },
      { label: "Lluvia", value: "20%" },
      { label: "Viento", value: "12 km/h" }
    ]
  };
}
