export type SeedClimate = "Templado" | "Calido" | "Fresco" | "Seco" | "Interior controlado";

export type SeedProfile = {
  id: string;
  name: string;
  crop: string;
  seedType: string;
  climates: SeedClimate[];
  daysToHarvest: string;
  sowingWindow: string;
  careNote: string;
  recommendationEnabled: boolean;
};

export const seedClimateOptions: SeedClimate[] = ["Templado", "Calido", "Fresco", "Seco", "Interior controlado"];

export const seedCatalog: SeedProfile[] = [
  {
    id: "tomato-roma",
    name: "Roma",
    crop: "Tomate",
    seedType: "Hortaliza de fruto",
    climates: ["Templado", "Calido"],
    daysToHarvest: "70-85 dias",
    sowingWindow: "Primavera y verano",
    careNote: "Buena opcion para exterior con sol directo y riego controlado.",
    recommendationEnabled: true
  },
  {
    id: "basil-genovese",
    name: "Genovesa",
    crop: "Albahaca",
    seedType: "Aromatica",
    climates: ["Templado", "Calido", "Interior controlado"],
    daysToHarvest: "45-60 dias",
    sowingWindow: "Primavera a inicio de otono",
    careNote: "Funciona bien en maceta y espacios luminosos.",
    recommendationEnabled: true
  },
  {
    id: "lettuce-butterhead",
    name: "Mantecosa",
    crop: "Lechuga",
    seedType: "Hoja",
    climates: ["Fresco", "Templado"],
    daysToHarvest: "50-65 dias",
    sowingWindow: "Otono, invierno suave y primavera",
    careNote: "Preferible para temperaturas suaves y media sombra.",
    recommendationEnabled: true
  },
  {
    id: "pepper-california",
    name: "California Wonder",
    crop: "Pimiento",
    seedType: "Hortaliza de fruto",
    climates: ["Calido", "Templado"],
    daysToHarvest: "75-95 dias",
    sowingWindow: "Primavera",
    careNote: "Apto para espacios calidos con buena luz.",
    recommendationEnabled: true
  },
  {
    id: "lavender-dentata",
    name: "Dentata",
    crop: "Lavanda",
    seedType: "Aromatica perenne",
    climates: ["Seco", "Templado"],
    daysToHarvest: "90-120 dias",
    sowingWindow: "Primavera",
    careNote: "Prefiere sustratos drenantes y riegos espaciados.",
    recommendationEnabled: true
  },
  {
    id: "cilantro-santo",
    name: "Santo",
    crop: "Cilantro",
    seedType: "Aromatica",
    climates: ["Fresco", "Templado"],
    daysToHarvest: "35-55 dias",
    sowingWindow: "Otono y primavera",
    careNote: "Conveniente para ciclos cortos y climas no extremos.",
    recommendationEnabled: true
  },
  {
    id: "spinach-bloomsdale",
    name: "Bloomsdale",
    crop: "Espinaca",
    seedType: "Hoja",
    climates: ["Fresco"],
    daysToHarvest: "40-55 dias",
    sowingWindow: "Otono e invierno suave",
    careNote: "Mejor en clima fresco, con humedad estable.",
    recommendationEnabled: true
  },
  {
    id: "regulated-manual",
    name: "Variedad regulada",
    crop: "Carga manual legal",
    seedType: "Solo registro del usuario",
    climates: [],
    daysToHarvest: "Definido por el usuario",
    sowingWindow: "Segun normativa local",
    careNote:
      "La app puede guardar el dato si el cultivo es legal, pero no calcula recomendaciones automaticas para cultivos regulados.",
    recommendationEnabled: false
  }
];

export function getRecommendedSeeds(climate: SeedClimate) {
  return seedCatalog.filter((seed) => seed.recommendationEnabled && seed.climates.includes(climate));
}
