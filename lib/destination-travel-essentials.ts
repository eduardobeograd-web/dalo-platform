import { destinationCountryFacts } from "./destination-country-facts";
import { destinationMapAliases } from "./destination-map-registry";

export type DestinationTravelEssentials = {
  destination: string;
  timeZone: string;
  referenceCity: string;
  currencyCode: string | null;
  currencyName: string;
  multipleTimeZones?: boolean;
  emergencyLabel?: string;
  emergencyNumbers?: string;
  emergencySourceUrl?: string;
};

type EmergencyInfo = Pick<
  Required<DestinationTravelEssentials>,
  "emergencyLabel" | "emergencyNumbers" | "emergencySourceUrl"
>;

const europeanEmergency: EmergencyInfo = {
  emergencyLabel: "All emergency services",
  emergencyNumbers: "112",
  emergencySourceUrl:
    "https://digital-strategy.ec.europa.eu/en/policies/112",
};

const emergencyInformation: Record<string, EmergencyInfo> = {
  europe: europeanEmergency,
  "united-states-of-america": {
    emergencyLabel: "All emergency services",
    emergencyNumbers: "911",
    emergencySourceUrl:
      "https://www.gov.uk/foreign-travel-advice/usa/getting-help",
  },
  usa: {
    emergencyLabel: "All emergency services",
    emergencyNumbers: "911",
    emergencySourceUrl:
      "https://www.gov.uk/foreign-travel-advice/usa/getting-help",
  },
  japan: {
    emergencyLabel: "Police · Ambulance and fire",
    emergencyNumbers: "110 · 119",
    emergencySourceUrl:
      "https://www.gov.uk/foreign-travel-advice/japan/getting-help",
  },
  "united-kingdom": {
    emergencyLabel: "All emergency services",
    emergencyNumbers: "999 or 112",
    emergencySourceUrl:
      "https://www.gov.uk/guidance/999-and-112-the-uks-national-emergency-numbers",
  },
  canada: {
    emergencyLabel: "All emergency services",
    emergencyNumbers: "911",
    emergencySourceUrl:
      "https://www.gov.uk/foreign-travel-advice/canada/getting-help",
  },
  china: {
    emergencyLabel: "Police · Ambulance · Fire",
    emergencyNumbers: "110 · 120 · 119",
    emergencySourceUrl:
      "https://www.gov.uk/foreign-travel-advice/china/getting-help",
  },
  mexico: {
    emergencyLabel: "All emergency services",
    emergencyNumbers: "911",
    emergencySourceUrl:
      "https://www.gov.uk/foreign-travel-advice/mexico/getting-help",
  },
  chile: {
    emergencyLabel: "Ambulance · Fire · Police",
    emergencyNumbers: "131 · 132 · 133",
    emergencySourceUrl:
      "https://www.consulado.gob.cl/emergencias-en-chile",
  },
  france: europeanEmergency,
  thailand: {
    emergencyLabel: "General · Ambulance · Tourist police",
    emergencyNumbers: "191 · 1669 · 1155",
    emergencySourceUrl:
      "https://www.gov.uk/foreign-travel-advice/thailand/getting-help",
  },
  spain: europeanEmergency,
  italy: europeanEmergency,
  turkey: {
    emergencyLabel: "All emergency services",
    emergencyNumbers: "112",
    emergencySourceUrl:
      "https://www.gov.uk/foreign-travel-advice/turkey/getting-help",
  },
  "united-arab-emirates": {
    emergencyLabel: "Police · Ambulance · Fire",
    emergencyNumbers: "999 · 998 · 997",
    emergencySourceUrl:
      "https://www.gov.uk/foreign-travel-advice/united-arab-emirates/getting-help",
  },
  australia: {
    emergencyLabel: "All emergency services",
    emergencyNumbers: "000",
    emergencySourceUrl:
      "https://www.gov.uk/foreign-travel-advice/australia/getting-help",
  },
  philippines: {
    emergencyLabel: "All emergency services",
    emergencyNumbers: "911",
    emergencySourceUrl:
      "https://www.gov.uk/foreign-travel-advice/philippines/getting-help",
  },
  singapore: {
    emergencyLabel: "Police · Ambulance and fire",
    emergencyNumbers: "999 · 995",
    emergencySourceUrl:
      "https://www.gov.uk/foreign-travel-advice/singapore/getting-help",
  },
  portugal: europeanEmergency,
  greece: europeanEmergency,
  indonesia: {
    emergencyLabel: "Police · Ambulance · Fire",
    emergencyNumbers: "110 · 118 · 112",
    emergencySourceUrl:
      "https://www.gov.uk/foreign-travel-advice/indonesia/getting-help",
  },
  "korea-republic-of": {
    emergencyLabel: "Police · Ambulance and fire",
    emergencyNumbers: "112 · 119",
    emergencySourceUrl:
      "https://www.gov.uk/foreign-travel-advice/south-korea/getting-help",
  },
  germany: europeanEmergency,
  egypt: {
    emergencyLabel: "Police · Ambulance · Fire",
    emergencyNumbers: "122 · 123 · 180",
    emergencySourceUrl:
      "https://www.gov.uk/foreign-travel-advice/egypt/getting-help",
  },
  morocco: {
    emergencyLabel: "Police · Ambulance and fire",
    emergencyNumbers: "19 · 15",
    emergencySourceUrl:
      "https://www.gov.uk/foreign-travel-advice/morocco/getting-help",
  },
  switzerland: {
    emergencyLabel: "General · Police · Ambulance",
    emergencyNumbers: "112 · 117 · 144",
    emergencySourceUrl:
      "https://www.gov.uk/foreign-travel-advice/switzerland/getting-help",
  },
  vietnam: {
    emergencyLabel: "Police · Fire · Ambulance",
    emergencyNumbers: "113 · 114 · 115",
    emergencySourceUrl:
      "https://www.gov.uk/foreign-travel-advice/vietnam/getting-help",
  },
};

const destinationTravelEssentials: Record<
  string,
  DestinationTravelEssentials
> = {
  europe: {
    destination: "Europe",
    timeZone: "Europe/Paris",
    referenceCity: "Paris",
    currencyCode: null,
    currencyName: "Varies by country",
    multipleTimeZones: true,
  },
  "united-states-of-america": {
    destination: "United States",
    timeZone: "America/New_York",
    referenceCity: "New York",
    currencyCode: "USD",
    currencyName: "US dollar",
    multipleTimeZones: true,
  },
  usa: {
    destination: "United States",
    timeZone: "America/New_York",
    referenceCity: "New York",
    currencyCode: "USD",
    currencyName: "US dollar",
    multipleTimeZones: true,
  },
  japan: {
    destination: "Japan",
    timeZone: "Asia/Tokyo",
    referenceCity: "Tokyo",
    currencyCode: "JPY",
    currencyName: "Japanese yen",
  },
  "united-kingdom": {
    destination: "United Kingdom",
    timeZone: "Europe/London",
    referenceCity: "London",
    currencyCode: "GBP",
    currencyName: "British pound",
  },
  canada: {
    destination: "Canada",
    timeZone: "America/Toronto",
    referenceCity: "Toronto",
    currencyCode: "CAD",
    currencyName: "Canadian dollar",
    multipleTimeZones: true,
  },
  china: {
    destination: "China",
    timeZone: "Asia/Shanghai",
    referenceCity: "Beijing",
    currencyCode: "CNY",
    currencyName: "Chinese yuan",
  },
  mexico: {
    destination: "Mexico",
    timeZone: "America/Mexico_City",
    referenceCity: "Mexico City",
    currencyCode: "MXN",
    currencyName: "Mexican peso",
    multipleTimeZones: true,
  },
  chile: {
    destination: "Chile",
    timeZone: "America/Santiago",
    referenceCity: "Santiago",
    currencyCode: "CLP",
    currencyName: "Chilean peso",
  },
  france: {
    destination: "France",
    timeZone: "Europe/Paris",
    referenceCity: "Paris",
    currencyCode: "EUR",
    currencyName: "Euro",
  },
  thailand: {
    destination: "Thailand",
    timeZone: "Asia/Bangkok",
    referenceCity: "Bangkok",
    currencyCode: "THB",
    currencyName: "Thai baht",
  },
  spain: {
    destination: "Spain",
    timeZone: "Europe/Madrid",
    referenceCity: "Madrid",
    currencyCode: "EUR",
    currencyName: "Euro",
  },
  italy: {
    destination: "Italy",
    timeZone: "Europe/Rome",
    referenceCity: "Rome",
    currencyCode: "EUR",
    currencyName: "Euro",
  },
  turkey: {
    destination: "Turkey",
    timeZone: "Europe/Istanbul",
    referenceCity: "Istanbul",
    currencyCode: "TRY",
    currencyName: "Turkish lira",
  },
  "united-arab-emirates": {
    destination: "United Arab Emirates",
    timeZone: "Asia/Dubai",
    referenceCity: "Dubai",
    currencyCode: "AED",
    currencyName: "UAE dirham",
  },
  australia: {
    destination: "Australia",
    timeZone: "Australia/Sydney",
    referenceCity: "Sydney",
    currencyCode: "AUD",
    currencyName: "Australian dollar",
    multipleTimeZones: true,
  },
  philippines: {
    destination: "Philippines",
    timeZone: "Asia/Manila",
    referenceCity: "Manila",
    currencyCode: "PHP",
    currencyName: "Philippine peso",
  },
  singapore: {
    destination: "Singapore",
    timeZone: "Asia/Singapore",
    referenceCity: "Singapore",
    currencyCode: "SGD",
    currencyName: "Singapore dollar",
  },
  portugal: {
    destination: "Portugal",
    timeZone: "Europe/Lisbon",
    referenceCity: "Lisbon",
    currencyCode: "EUR",
    currencyName: "Euro",
  },
  greece: {
    destination: "Greece",
    timeZone: "Europe/Athens",
    referenceCity: "Athens",
    currencyCode: "EUR",
    currencyName: "Euro",
  },
  indonesia: {
    destination: "Indonesia",
    timeZone: "Asia/Jakarta",
    referenceCity: "Jakarta",
    currencyCode: "IDR",
    currencyName: "Indonesian rupiah",
    multipleTimeZones: true,
  },
  "korea-republic-of": {
    destination: "South Korea",
    timeZone: "Asia/Seoul",
    referenceCity: "Seoul",
    currencyCode: "KRW",
    currencyName: "South Korean won",
  },
  germany: {
    destination: "Germany",
    timeZone: "Europe/Berlin",
    referenceCity: "Berlin",
    currencyCode: "EUR",
    currencyName: "Euro",
  },
  egypt: {
    destination: "Egypt",
    timeZone: "Africa/Cairo",
    referenceCity: "Cairo",
    currencyCode: "EGP",
    currencyName: "Egyptian pound",
  },
  morocco: {
    destination: "Morocco",
    timeZone: "Africa/Casablanca",
    referenceCity: "Casablanca",
    currencyCode: "MAD",
    currencyName: "Moroccan dirham",
  },
  switzerland: {
    destination: "Switzerland",
    timeZone: "Europe/Zurich",
    referenceCity: "Zurich",
    currencyCode: "CHF",
    currencyName: "Swiss franc",
  },
  vietnam: {
    destination: "Vietnam",
    timeZone: "Asia/Ho_Chi_Minh",
    referenceCity: "Ho Chi Minh City",
    currencyCode: "VND",
    currencyName: "Vietnamese dong",
  },
};

export function getDestinationTravelEssentials(slug: string) {
  const curatedEssentials = destinationTravelEssentials[slug];
  const normalizedSlug = normalizeDestinationSlug(slug);
  const namedCountryFacts = Object.values(destinationCountryFacts).find(
    (facts) => normalizeDestinationSlug(facts.destination) === normalizedSlug,
  );
  const countryCode = destinationMapAliases[slug];
  const generatedEssentials = countryCode
    ? destinationCountryFacts[countryCode]
    : undefined;
  const essentials = curatedEssentials || namedCountryFacts || generatedEssentials;
  const emergency = emergencyInformation[slug];

  if (!essentials) return null;

  return emergency ? { ...essentials, ...emergency } : essentials;
}

function normalizeDestinationSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type FrankfurterRate = {
  date?: string;
  rate?: number;
};

export async function getUsdExchangeRate(currencyCode: string) {
  if (currencyCode === "USD") {
    return { rate: 1, date: new Date().toISOString().slice(0, 10) };
  }

  try {
    const response = await fetch(
      `https://api.frankfurter.dev/v2/rate/USD/${currencyCode}`,
      { next: { revalidate: 86_400 } },
    );

    if (!response.ok) return null;

    const data = (await response.json()) as FrankfurterRate;

    if (typeof data.rate !== "number" || !Number.isFinite(data.rate)) {
      return null;
    }

    return { rate: data.rate, date: data.date ?? null };
  } catch {
    return null;
  }
}
