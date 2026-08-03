import { prisma } from "../lib/db";

const prioritySlugs = [
  "europe",
  "united-states-of-america",
  "japan",
  "united-kingdom",
  "canada",
  "china",
  "mexico",
  "france",
  "thailand",
  "spain",
  "italy",
  "turkey",
  "united-arab-emirates",
  "australia",
  "philippines",
  "singapore",
  "portugal",
  "greece",
  "indonesia",
  "korea-republic-of",
  "germany",
  "egypt",
  "morocco",
  "switzerland",
  "vietnam",
] as const;

const shared = {
  activationText:
    "Install the eSIM before departure while reliable Wi-Fi is available, then follow the activation rule shown on the selected plan. Validity may begin at installation or at the first supported network connection, so review the package details before scanning the QR code.",
  compatibilityText:
    "Your phone must support eSIM and be unlocked for use with another carrier. Check for an Add eSIM option or an EID in the device settings, and confirm the exact model and country variant before purchase.",
  hotspotText:
    "Hotspot and tethering availability depends on the selected plan, local network and device settings. Check the package details before purchase if sharing data with a laptop or another traveler is important.",
};

const curatedPages = [
  {
    slug: "europe",
    seoTitle: "Europe eSIM | Multi-Country Travel Data Plans | DALO",
    seoDescription:
      "Find a Europe eSIM matched to your itinerary, trip length and data usage. Compare prepaid multi-country travel plans with clear prices and validity.",
    headline: "Europe eSIM plans for multi-country travel",
    intro:
      "Move between European cities and borders with one travel data plan selected around your itinerary. DALO matches your trip length and expected usage to a clear Europe eSIM recommendation for maps, rail updates, bookings, messages and everyday connectivity.",
    coverageText:
      "Europe eSIM plans cover the countries listed in each individual package, which may differ between plans. Check every country on your itinerary before purchase. Signal quality depends on the local partner network and can vary on rural rail routes, mountain roads, islands and border regions.",
    faq: [
      {
        question: "Can one Europe eSIM work in several countries?",
        answer:
          "Yes, regional plans can cover several European countries, but the exact country list differs by package. Confirm every stop on your itinerary before purchasing.",
      },
      {
        question: "Which Europe eSIM is right for my trip?",
        answer:
          "Choose a plan that covers every destination, remains valid for the complete journey and includes enough data for navigation, transport, messages and your normal phone habits.",
      },
      {
        question: "Do I need a new eSIM when I cross a European border?",
        answer:
          "Not when the selected regional plan includes both countries. Your phone should reconnect to a supported partner network after crossing the border.",
      },
      {
        question: "Can I keep my normal number while using a Europe eSIM?",
        answer:
          "Most compatible dual-SIM phones let you keep the regular line installed while using the Europe eSIM for mobile data. Disable data roaming on the home line to avoid unintended charges.",
      },
    ],
  },
  {
    slug: "china",
    seoTitle: "China eSIM | Travel Data Plans & Easy Setup | DALO",
    seoDescription:
      "Find a China eSIM matched to your trip length and data needs. Compare prepaid travel plans for maps, translation, transport and everyday connectivity.",
    headline: "China eSIM plans for cities, transport and translation",
    intro:
      "Prepare mobile data for navigation, translation, transport, hotel communication and everyday travel across China. DALO matches your stay and expected usage to one clear China eSIM recommendation instead of leaving you to compare every available package.",
    coverageText:
      "China eSIM plans connect through the supported partner networks stated in the selected package. Coverage is generally strongest in major cities and populated transport corridors, but it can vary in mountain regions, rural areas, underground spaces and remote destinations.",
    faq: [
      {
        question: "When should I install my China eSIM?",
        answer:
          "Install it before departure while reliable Wi-Fi is available, but follow the selected plan's activation instructions so the validity period does not begin earlier than intended.",
      },
      {
        question: "Will all apps work normally with a China eSIM?",
        answer:
          "Internet access and app availability can depend on local rules, network routing and the selected provider. Check current requirements for essential services before traveling.",
      },
      {
        question: "How much data should I choose for China?",
        answer:
          "Maps, translation and messages use relatively little data, while video, social media, hotspot use and remote work require a larger allowance. Match the plan to your trip length and normal habits.",
      },
      {
        question: "Can I keep my normal SIM while using a China eSIM?",
        answer:
          "Most compatible dual-SIM phones allow both lines to remain installed. Use the travel eSIM for data and review roaming settings on the regular line to avoid unintended charges.",
      },
    ],
  },
  {
    slug: "philippines",
    seoTitle: "Philippines eSIM | Island Travel Data Plans | DALO",
    seoDescription:
      "Find a Philippines eSIM matched to your island itinerary, trip length and data use. Compare prepaid travel plans with clear prices and validity.",
    headline: "Philippines eSIM plans for cities and island travel",
    intro:
      "Stay connected for transfers, maps, accommodation messages and island travel across the Philippines. DALO matches your itinerary, trip length and phone habits to one clear eSIM recommendation for destinations such as Manila, Cebu, Palawan and Boracay.",
    coverageText:
      "Philippines eSIM plans use the supported partner networks shown in each package. Reception can differ significantly between islands and is usually strongest in cities and populated destinations. Remote beaches, mountain areas, ferries and offshore locations may have limited service.",
    faq: [
      {
        question: "Does a Philippines eSIM work across different islands?",
        answer:
          "It can work wherever the selected partner network has coverage, but signal quality varies between islands. Check the plan details and keep essential travel information available offline.",
      },
      {
        question: "How much data do I need in the Philippines?",
        answer:
          "A smaller plan may cover maps and messages, while frequent ride apps, social media, video calls, streaming or hotspot use require more data over the full trip.",
      },
      {
        question: "Should I install the eSIM before flying?",
        answer:
          "Installation before departure is usually easier because you have reliable Wi-Fi. Follow the selected package's activation rule so validity starts at the intended time.",
      },
      {
        question: "Can I use hotspot with a Philippines eSIM?",
        answer:
          "Hotspot availability depends on the chosen plan, local network and device. Check the package details before purchase if tethering is important for your trip.",
      },
    ],
  },
  {
    slug: "switzerland",
    seoTitle: "Switzerland eSIM | Rail and Travel Data Plans | DALO",
    seoDescription:
      "Find a Switzerland eSIM matched to your trip length and data needs. Compare prepaid travel plans for cities, rail journeys and mountain travel.",
    headline: "Switzerland eSIM plans for cities, trains and the Alps",
    intro:
      "Use mobile data for rail timetables, maps, accommodation, messages and travel planning across Switzerland. DALO matches your trip length and expected usage to one clear eSIM recommendation for city breaks, scenic train journeys and mountain destinations.",
    coverageText:
      "Switzerland eSIM plans connect through the supported partner networks listed in the selected package. Coverage is generally strongest in cities and populated transport corridors, while mountain valleys, tunnels, cable-car routes and remote hiking areas can have weaker reception.",
    faq: [
      {
        question: "Will a Switzerland eSIM work on train journeys?",
        answer:
          "It can connect wherever the selected partner network has service. Reception may change in tunnels, mountain valleys and remote sections of scenic rail routes.",
      },
      {
        question: "Is Switzerland included in every Europe eSIM?",
        answer:
          "No. Switzerland is not included in every regional Europe package, so confirm the country list before purchasing a multi-country plan.",
      },
      {
        question: "How much data do I need in Switzerland?",
        answer:
          "Maps, train apps and messages need relatively little data. Frequent photo uploads, video calls, streaming, hotspot use or remote work require a larger allowance.",
      },
      {
        question: "Can I install my Switzerland eSIM before departure?",
        answer:
          "Usually yes. Install it with reliable Wi-Fi, then follow the selected package's activation instructions so the validity period begins at the intended time.",
      },
    ],
  },
  {
    slug: "vietnam",
    seoTitle: "Vietnam eSIM | Travel Data Plans & Easy Setup | DALO",
    seoDescription:
      "Find a Vietnam eSIM matched to your itinerary, trip length and data use. Compare prepaid travel plans for cities, transfers, maps and connectivity.",
    headline: "Vietnam eSIM plans for cities, coast and road travel",
    intro:
      "Stay connected for maps, ride apps, translation, accommodation messages and transfers while traveling through Vietnam. DALO matches your itinerary, trip length and phone habits to one clear eSIM recommendation for destinations such as Hanoi, Ho Chi Minh City, Da Nang and Hoi An.",
    coverageText:
      "Vietnam eSIM plans connect through the supported partner networks shown in each package. Reception is generally strongest in cities and populated destinations, but it can vary in mountain regions, rural roads, national parks, remote beaches and offshore areas.",
    faq: [
      {
        question: "Does a Vietnam eSIM work between different cities?",
        answer:
          "It can connect wherever the selected partner network has coverage. Signal quality may change on rural roads, rail journeys and in mountain or remote coastal regions.",
      },
      {
        question: "How much data should I choose for Vietnam?",
        answer:
          "Maps, translation, messages and ride apps use moderate amounts of data. Social media, video calls, streaming, hotspot use and longer trips need a larger allowance.",
      },
      {
        question: "When should I install my Vietnam eSIM?",
        answer:
          "Install it before departure while reliable Wi-Fi is available, then follow the selected plan's activation instructions so validity starts at the intended time.",
      },
      {
        question: "Can I keep my normal SIM while traveling in Vietnam?",
        answer:
          "Most compatible dual-SIM phones allow both lines to stay installed. Select the Vietnam eSIM for data and review roaming on the regular line to avoid unintended charges.",
      },
    ],
  },
] as const;

async function main() {
  const curatedUpdates = await Promise.all(
    curatedPages.map((page) =>
      prisma.destinationPage.update({
        where: { slug: page.slug },
        data: {
          ...shared,
          seoTitle: page.seoTitle,
          seoDescription: page.seoDescription,
          headline: page.headline,
          intro: page.intro,
          coverageText: page.coverageText,
          faq: [...page.faq],
        },
      }),
    ),
  );

  const excluded = await prisma.destinationPage.updateMany({
    where: {
      slug: { notIn: [...prioritySlugs] },
      indexable: true,
    },
    data: { indexable: false },
  });

  const included = await prisma.destinationPage.updateMany({
    where: {
      slug: { in: [...prioritySlugs] },
      published: true,
    },
    data: { indexable: true },
  });

  console.log(
    JSON.stringify(
      {
        curated: curatedUpdates.map((page) => page.displayName),
        removedFromIndexing: excluded.count,
        priorityPagesIndexable: included.count,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
