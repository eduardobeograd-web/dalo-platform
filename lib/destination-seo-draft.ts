import { getDestinationImage } from "./destination-images";

const regionalDestinations: Record<string, string> = {
  africa: "multi-country journeys across Africa",
  americas: "travel across North, Central and South America",
  asia: "multi-country travel across Asia",
  balkans: "road trips and multi-country travel across the Balkans",
  caribbean: "island hopping and holidays across the Caribbean",
  "eu+": "travel across the European Union and included nearby destinations",
  europe: "city breaks, rail journeys and road trips across Europe",
  global: "frequent travel across multiple continents",
  "middle-east-and-africa": "multi-country travel across the Middle East and Africa",
  "north-america": "travel across North America",
  oceania: "multi-country travel across Australia, New Zealand and Pacific destinations",
};

const destinationHighlights: Record<string, string> = {
  albania: "Tirana, the Albanian Riviera and mountain road trips",
  argentina: "Buenos Aires, Patagonia and long-distance journeys",
  austria: "Vienna, Salzburg and Alpine travel",
  belgium: "Brussels, Bruges, Antwerp and rail trips",
  brazil: "Rio de Janeiro, Sao Paulo and longer domestic journeys",
  bulgaria: "Sofia, the Black Sea coast and mountain travel",
  chile: "Santiago, Patagonia and long north-to-south journeys",
  china: "major cities, high-speed rail journeys and business travel",
  colombia: "Bogota, Medellin, Cartagena and domestic travel",
  "costa-rica": "San Jose, Pacific beaches and national parks",
  cyprus: "coastal holidays, city stays and island road trips",
  "czech-republic": "Prague, Brno and rail travel",
  denmark: "Copenhagen, regional trains and island connections",
  ecuador: "Quito, the coast and journeys through the Andes",
  estonia: "Tallinn and travel across the Baltic region",
  finland: "Helsinki, Lapland and long-distance travel",
  georgia: "Tbilisi, the Caucasus and road trips",
  hungary: "Budapest, regional rail travel and countryside trips",
  iceland: "Reykjavik and Ring Road journeys",
  india: "major cities, rail journeys and multi-stop itineraries",
  ireland: "Dublin, the Atlantic coast and road trips",
  israel: "Tel Aviv, Jerusalem and travel between cities",
  jordan: "Amman, Petra, Wadi Rum and road trips",
  kenya: "Nairobi, the coast and safari travel",
  laos: "Vientiane, Luang Prabang and overland journeys",
  latvia: "Riga and travel across the Baltic region",
  lithuania: "Vilnius, Kaunas and Baltic road trips",
  luxembourg: "Luxembourg City and cross-border travel",
  malta: "Valletta, Gozo and island travel",
  mauritius: "beach stays, island drives and outdoor trips",
  montenegro: "Kotor, the Adriatic coast and mountain roads",
  netherlands: "Amsterdam, Rotterdam and rail travel",
  "new-zealand": "Auckland, Queenstown and long road trips",
  norway: "Oslo, fjord regions and long-distance journeys",
  oman: "Muscat, coastal roads and desert journeys",
  panama: "Panama City, coastal destinations and onward travel",
  peru: "Lima, Cusco, the Andes and multi-stop journeys",
  philippines: "Manila, Cebu and island-hopping itineraries",
  poland: "Warsaw, Krakow, Gdansk and rail journeys",
  qatar: "Doha, stopovers and business travel",
  romania: "Bucharest, Transylvania and road trips",
  seychelles: "island stays, transfers and beach travel",
  slovakia: "Bratislava, the Tatras and regional travel",
  slovenia: "Ljubljana, Lake Bled and Alpine road trips",
  "south-africa": "Cape Town, Johannesburg and long road journeys",
  "sri-lanka": "Colombo, the south coast and rail journeys",
  sweden: "Stockholm, Gothenburg and long-distance travel",
  switzerland: "Zurich, Geneva and Alpine rail journeys",
  "taiwan-province-of-china": "Taipei, high-speed rail and island travel",
  tunisia: "Tunis, coastal resorts and desert excursions",
  ukraine: "major cities and essential domestic travel",
  uruguay: "Montevideo, coastal destinations and road trips",
  vietnam: "Hanoi, Ho Chi Minh City and multi-stop journeys",
};

function destinationNameFromSlug(slug: string) {
  const names: Record<string, string> = {
    "korea-republic-of": "South Korea",
    "united-states-of-america": "United States",
    "united-kingdom": "United Kingdom",
    "united-arab-emirates": "United Arab Emirates",
  };

  return (
    names[slug] ||
    slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

export function getDestinationSeoDraft(slug: string, suppliedName?: string) {
  const name = suppliedName?.trim() || destinationNameFromSlug(slug);
  const regionalUse = regionalDestinations[slug];
  const highlights = destinationHighlights[slug];
  const travelContext = regionalUse || highlights;
  const headline = regionalUse
    ? `${name} eSIM plans for multi-country travel`
    : highlights
      ? `${name} eSIM plans for ${highlights.split(",")[0]}`
      : `${name} eSIM plans matched to your trip`;

  return {
    countryName: name,
    displayName: name,
    seoTitle: `${name} eSIM Plans | Prepaid Travel Data | DALO`,
    seoDescription: `Compare eSIM plans for ${name} with clear data allowances, validity and pricing. Get a travel data recommendation and receive your eSIM digitally.`,
    headline,
    intro: travelContext
      ? `Stay connected during ${travelContext} with mobile data selected around your itinerary. DALO compares available ${name} eSIM plans by data allowance, validity and price, helping you choose an option for maps, messages, bookings and everyday travel before departure.`
      : `Stay connected in ${name} without searching for a physical SIM after arrival. DALO compares available travel eSIM plans by data allowance, validity and price, helping you choose an option that fits your trip length and expected usage before you leave.`,
    heroImage: getDestinationImage(name),
    heroImageAlt: `Travel destination in ${name} with DALO eSIM connectivity`,
    coverageText: regionalUse
      ? `Regional coverage depends on the countries included with the selected ${name} package and its supported partner networks. Check the full destination list before purchase, especially when crossing borders or visiting islands and remote areas.`
      : `Your eSIM connects to supported mobile networks in ${name}. Coverage can vary by location, terrain, buildings and the selected package${highlights ? `, particularly during ${highlights}` : ""}, so review the plan details and keep essential maps available offline.`,
    activationText: `Install the eSIM while you have a stable internet connection and follow the instructions delivered after payment. Activation timing depends on the selected plan; the product details explain whether activation begins on installation or first network connection.`,
    compatibilityText: `Your phone must support eSIM technology and be unlocked from its mobile carrier. Check the DALO compatibility guide before checkout, especially when using an older device or a model originally purchased through a network operator.`,
    hotspotText: `Hotspot and tethering availability depends on the selected plan and device. Check the package details before purchase if sharing data with a laptop or another traveler is important for your trip.`,
    faq: [
      {
        question: regionalUse
          ? `How does a ${name} regional eSIM work?`
          : `How does a ${name} eSIM work?`,
        answer: regionalUse
          ? `Choose a regional package, confirm every included destination and follow the digital installation instructions. Once activated according to its rules, the eSIM can connect to supported partner networks across the covered countries.`
          : `Choose a compatible data plan, complete checkout and follow the digital installation instructions. Once activated according to the plan rules, the eSIM connects to a supported network in ${name} for mobile data.`,
      },
      {
        question: `When should I install my ${name} eSIM?`,
        answer: `It is usually best to install your eSIM before departure while you have reliable Wi-Fi. Check the selected plan's activation policy first, because some plans start on installation and others on the first supported network connection.`,
      },
      {
        question: `Can I keep my regular SIM while using an eSIM in ${name}?`,
        answer: `Most dual-SIM phones let you keep your regular SIM active while using the travel eSIM for data. To avoid roaming charges, confirm which SIM is selected for mobile data and review your home carrier settings.`,
      },
      {
        question: `How much data do I need for ${name}?`,
        answer: `The right amount depends on trip length and usage${regionalUse ? ", including how many countries you visit" : ""}. Maps and messaging use relatively little data, while video, social media and hotspot use require more. The DALO quiz matches these factors to an available plan.`,
      },
    ],
  };
}

export type DestinationCatalogFacts = {
  planCount: number;
  startingPrice: number;
  dataOptions: string[];
  minimumValidityDays: number;
  maximumValidityDays: number;
};

export function getCatalogDestinationSeoDraft(
  slug: string,
  suppliedName: string,
  facts: DestinationCatalogFacts,
) {
  const base = getDestinationSeoDraft(slug, suppliedName);
  const name = base.displayName;
  const price = `$${facts.startingPrice.toFixed(2)}`;
  const dataOptions = facts.dataOptions.slice(0, 4).join(", ");
  const validity =
    facts.minimumValidityDays === facts.maximumValidityDays
      ? `${facts.minimumValidityDays} days`
      : `${facts.minimumValidityDays}-${facts.maximumValidityDays} days`;
  const planLabel = facts.planCount === 1 ? "plan" : "plans";
  const title = fitTitle(`${name} eSIM Plans from ${price} | DALO Travel Data`, name);
  const description = fitDescription([
    `Compare ${facts.planCount} ${name} eSIM ${planLabel} from ${price}, with ${dataOptions} data options and validity up to ${facts.maximumValidityDays} days. Get a clear DALO recommendation.`,
    `Compare ${name} eSIM plans from ${price}, including ${dataOptions} data options and ${validity} validity. Choose with DALO and receive your eSIM digitally.`,
    `Find a ${name} eSIM from ${price}. Compare current data allowances and ${validity} plans, get a DALO recommendation and receive digital installation details.`,
  ]);

  return {
    ...base,
    seoTitle: title,
    seoDescription: description,
    headline: `Compare ${name} eSIM plans for your trip`,
    intro: `DALO currently compares ${facts.planCount} active ${name} eSIM ${planLabel}, starting at ${price}. Available allowances include ${dataOptions}, with plan validity covering ${validity}. Use the recommendation quiz to match this live catalog to your trip length and expected use instead of sorting through every package yourself.`,
    heroImageAlt: `${name} travel connectivity and eSIM plans from DALO`,
    coverageText: `The selected eSIM uses the supported partner networks stated in its package details for ${name}. Coverage and speed vary by network, device, location, terrain and buildings. Check the individual plan before purchase and keep essential maps available offline when traveling beyond populated areas.`,
    activationText: `Your ${name} eSIM is delivered digitally after payment. Install it on reliable Wi-Fi and follow the instructions supplied with the selected package. Activation timing can differ by plan, so confirm whether validity starts on installation or on the first supported network connection.`,
    compatibilityText: `Use an unlocked phone that supports eSIM and check the DALO compatibility guide before buying. Compatible dual-SIM devices can normally keep the regular number active while the ${name} eSIM is selected for mobile data. Disable data roaming on the home line if your carrier may charge for it.`,
    hotspotText: `Hotspot support is determined by the selected ${name} package. Review the plan details before checkout if you need to connect a laptop or share data, and choose a larger allowance when tethering is part of the trip.`,
    faq: [
      {
        question: `What ${name} eSIM plans does DALO compare?`,
        answer: `The current DALO catalog contains ${facts.planCount} active ${planLabel} for ${name}, starting at ${price}. Listed data options include ${dataOptions}, and availability can change when the underlying catalog is updated.`,
      },
      {
        question: `How long are ${name} eSIM plans valid?`,
        answer: `Current plan validity ranges across ${validity}. Choose a duration that covers the complete trip and check the exact activation rule before installation, because validity may begin at installation or first network connection.`,
      },
      {
        question: `When should I install my ${name} eSIM?`,
        answer: `Install it before departure while reliable Wi-Fi is available, but follow the selected package's activation instructions carefully. Keep the QR code and order number available until installation and connection are complete.`,
      },
      {
        question: `Can I keep my normal SIM while using an eSIM in ${name}?`,
        answer: `Most compatible dual-SIM phones allow both lines to remain installed. Select the travel eSIM for mobile data and review data roaming on the regular SIM to avoid unintended carrier charges.`,
      },
    ],
  };
}

export function isAutomaticDestinationSeo(page: {
  slug: string;
  displayName?: string | null;
  countryName?: string | null;
  seoTitle: string;
  seoDescription: string;
  headline: string;
  intro: string;
}) {
  const draft = getDestinationSeoDraft(
    page.slug,
    page.displayName || page.countryName || undefined,
  );

  const automaticSignals = [
    page.seoTitle.trim() === draft.seoTitle &&
      page.seoDescription.trim() === draft.seoDescription,
    page.headline.trim() === draft.headline && page.intro.trim() === draft.intro,
    page.seoDescription.includes("Compare eSIM plans for "),
    page.intro.includes("DALO compares available travel eSIM plans"),
  ].filter(Boolean).length;

  return automaticSignals >= 2;
}

function fitTitle(value: string, name: string) {
  if (value.length >= 35 && value.length <= 65) return value;
  const compact = `${name} eSIM Plans | Prepaid Travel Data | DALO`;
  if (compact.length >= 35 && compact.length <= 65) return compact;
  return `${name} eSIM Plans | DALO`.slice(0, 65);
}

function fitDescription(candidates: string[]) {
  const suitable = candidates.find((value) => value.length >= 120 && value.length <= 165);
  if (suitable) return suitable;
  const shortest = [...candidates].sort((left, right) => left.length - right.length)[0];
  if (shortest.length > 165) return `${shortest.slice(0, 162).trimEnd()}...`;
  return `${shortest} Compare before you travel.`;
}
