import type { ItineraryDay } from "./types";

export type Template = {
  slug: string;
  name: string;
  peak: string;
  summit_altitude_m: number;
  region: string;
  blurb: string;
  days: ItineraryDay[];
};

const day = (camp_name: string, sleep_altitude_m: number): ItineraryDay => ({
  camp_name,
  sleep_altitude_m,
});

export const TEMPLATES: Template[] = [
  {
    slug: "k2-gondogoro",
    name: "K2 Base Camp + Gondogoro La",
    peak: "Gondogoro La",
    summit_altitude_m: 5585,
    region: "Karakoram, Pakistan",
    blurb:
      "Up the Baltoro Glacier past Trango and Masherbrum to Concordia and K2 Base Camp, then out over Gondogoro La to Hushe.",
    days: [
      day("Skardu", 2230),
      day("Askole", 3000),
      day("Jhola", 3200),
      day("Paiju", 3450),
      day("Paiju (rest)", 3450),
      day("Urdukas", 4050),
      day("Goro II", 4300),
      day("Concordia", 4600),
      day("Concordia (rest)", 4600),
      day("K2 Base Camp", 5000),
      day("Concordia", 4600),
      day("Ali Camp", 4950),
      day("Khuispang (over Gondogoro La)", 4600),
      day("Saicho", 3400),
      day("Hushe", 3050),
    ],
  },
  {
    slug: "khosar-gang",
    name: "Khosar Gang",
    peak: "Khosar Gang",
    summit_altitude_m: 6040,
    region: "Shigar Valley, Karakoram, Pakistan",
    blurb:
      "From Skardu via Sildi to base camp, then two camps to a 6,040m summit. The 1,000m and 900m carries between camps make acclimatization the real crux.",
    days: [
      day("Skardu", 2200),
      day("Base Camp (via Sildi)", 3400),
      day("Camp 1", 4400),
      day("Camp 2", 5300),
      day("Camp 1 (summit day)", 4400),
    ],
  },
  {
    slug: "huayna-potosi",
    name: "Huayna Potosí",
    peak: "Huayna Potosí",
    summit_altitude_m: 6088,
    region: "Cordillera Real, Bolivia",
    blurb:
      "The classic 'easiest 6,000er'. La Paz sits at 3,640m, which tempts people into jumping straight from the city to the glacier.",
    days: [
      day("La Paz", 3640),
      day("La Paz (rest)", 3640),
      day("La Paz (Chacaltaya day hike)", 3640),
      day("Huayna Potosí Base Camp", 4700),
      day("Base Camp (glacier school)", 4700),
      day("Campo Alto Rocas", 5130),
      day("La Paz (summit day)", 3640),
    ],
  },
];

export function getTemplate(slug: string) {
  return TEMPLATES.find((t) => t.slug === slug);
}
