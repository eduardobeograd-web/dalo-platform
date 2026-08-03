import { getDestinationImage } from "./destination-images";

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

  return {
    countryName: name,
    displayName: name,
    seoTitle: `${name} eSIM Plans | Prepaid Travel Data | DALO`,
    seoDescription: `Compare eSIM plans for ${name} with clear data allowances, validity and pricing. Get a travel data recommendation and receive your eSIM digitally.`,
    headline: `${name} eSIM plans matched to your trip`,
    intro: `Stay connected in ${name} without searching for a physical SIM after arrival. DALO compares available travel eSIM plans by data allowance, validity and price, helping you choose an option that fits your destination, trip length and expected usage before you leave.`,
    heroImage: getDestinationImage(name),
    heroImageAlt: `Travel destination in ${name} with DALO eSIM connectivity`,
    coverageText: `Your eSIM connects to supported mobile networks in ${name}. Coverage and network availability can vary by location, terrain and the specific plan, so review the network information shown with your selected package before purchase.`,
    activationText: `Install the eSIM while you have a stable internet connection and follow the instructions delivered after payment. Activation timing depends on the selected plan; the product details explain whether activation begins on installation or first network connection.`,
    compatibilityText: `Your phone must support eSIM technology and be unlocked from its mobile carrier. Check the DALO compatibility guide before checkout, especially when using an older device or a model originally purchased through a network operator.`,
    hotspotText: `Hotspot and tethering availability depends on the selected plan and device. Check the package details before purchase if sharing data with a laptop or another traveler is important for your trip.`,
    faq: [
      {
        question: `How does a ${name} eSIM work?`,
        answer: `Choose a compatible data plan, complete checkout and follow the digital installation instructions. Once activated according to the plan rules, the eSIM connects to a supported network in ${name} for mobile data.`,
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
        question: `How much data do I need for a trip to ${name}?`,
        answer: `The right amount depends on trip length and usage. Maps and messaging use relatively little data, while video, social media and hotspot use require more. The DALO quiz matches these factors to an available plan.`,
      },
    ],
  };
}
