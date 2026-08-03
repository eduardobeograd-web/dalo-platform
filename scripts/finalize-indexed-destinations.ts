import { prisma } from "../lib/db";

type EditorialPage = {
  seoTitle: string;
  seoDescription: string;
  headline: string;
  intro: string;
  coverageText: string;
  activationText: string;
  compatibilityText: string;
  hotspotText: string;
  faq: { question: string; answer: string }[];
};

const shared = {
  activationText:
    "Install the eSIM before departure while connected to reliable Wi-Fi. Follow the activation instructions for the selected package and switch mobile data to the eSIM when the plan should begin.",
  compatibilityText:
    "Use an unlocked phone that supports eSIM. Confirm that Add eSIM or Add Cellular Plan appears in the device settings before purchase. Compatible dual-SIM phones can normally keep the regular number active.",
};

const pages: Record<string, EditorialPage> = {
  "bosnia-and-herzegovina": {
    seoTitle: "Bosnia and Herzegovina eSIM | Travel Data | DALO",
    seoDescription:
      "Find a Bosnia and Herzegovina eSIM for Sarajevo, Mostar and road trips. Compare data, validity and price with a clear DALO recommendation.",
    headline: "Bosnia and Herzegovina eSIM plans for cities and road trips",
    intro:
      "Stay connected while exploring Sarajevo, Mostar and routes through the mountains and countryside. DALO matches your trip length and phone usage to a Bosnia and Herzegovina eSIM for maps, messages, bookings and navigation.",
    coverageText:
      "Plans connect through supported networks in destinations such as Sarajevo, Mostar and Banja Luka. Reception can vary on mountain roads, in valleys, national parks and sparsely populated rural areas, so download essential routes before longer drives.",
    ...shared,
    hotspotText:
      "Hotspot support depends on the selected package. Confirm tethering before checkout if you plan to connect a laptop, navigate a road trip or share data with another traveler.",
    faq: [
      { question: "How much data do I need in Bosnia and Herzegovina?", answer: "Maps, messaging and bookings use less data than video, frequent uploads and hotspot use. DALO matches the allowance to your trip length and expected phone habits." },
      { question: "Can I install the eSIM before departure?", answer: "Yes. Installation with reliable Wi-Fi before traveling is usually easiest. Follow the package instructions so activation begins at the intended time." },
      { question: "Will the eSIM work between Sarajevo and Mostar?", answer: "Plans use supported local networks, but reception can change along mountain roads, in tunnels and in remote areas. Keep important maps available offline." },
      { question: "Can I keep my normal phone number?", answer: "Usually yes on a compatible dual-SIM phone. Select the eSIM for mobile data and review roaming settings on your primary line to avoid unexpected charges." },
    ],
  },
  egypt: {
    seoTitle: "Egypt eSIM | Data for Cairo, Resorts and Tours | DALO",
    seoDescription:
      "Find an Egypt eSIM for Cairo, Luxor, Red Sea resorts and tours. Compare travel data, validity and price with a clear DALO recommendation.",
    headline: "Egypt eSIM plans for cities, resorts and tours",
    intro:
      "Use mobile data for transfers, maps, hotel messages and travel planning from Cairo and Luxor to Red Sea resorts. DALO recommends an Egypt eSIM around your stay and usage instead of leaving you with an oversized plan list.",
    coverageText:
      "Egypt plans are intended for supported networks in major cities and popular resort areas. Signal can vary during desert excursions, Nile journeys, remote archaeological visits and travel between populated destinations.",
    ...shared,
    hotspotText:
      "Tethering is package-specific. Check hotspot support and choose enough data before payment if you need to work remotely or share the connection during transfers and tours.",
    faq: [
      { question: "How much data is useful for an Egypt holiday?", answer: "Maps, messaging and transfer coordination are lighter uses. Social video, calls, streaming and hotspot use require more. DALO recommends according to your stay and habits." },
      { question: "Can I prepare my Egypt eSIM before flying?", answer: "Yes. Install it with stable Wi-Fi before departure, then follow the selected plan instructions for the correct activation time after arrival." },
      { question: "Will the eSIM work at Red Sea resorts?", answer: "Plans connect through supported networks in popular destinations, but coverage depends on the package and location and can weaken on remote excursions." },
      { question: "Can I retain my regular SIM?", answer: "Most compatible dual-SIM phones allow both profiles. Use the eSIM for data and manage roaming on the regular SIM carefully." },
    ],
  },
  malaysia: {
    seoTitle: "Malaysia eSIM | Travel Data Plans and Setup | DALO",
    seoDescription:
      "Find a Malaysia eSIM for Kuala Lumpur, Penang, Langkawi and Borneo trips. Compare data, validity and price with a clear DALO recommendation.",
    headline: "Malaysia eSIM plans from city stays to island trips",
    intro:
      "Stay online for ride apps, maps, bookings and messages while traveling through Kuala Lumpur, Penang, Langkawi or Malaysian Borneo. DALO matches a Malaysia eSIM to your itinerary and everyday data use.",
    coverageText:
      "Malaysia plans use supported networks in major cities and popular tourism areas. Reception can vary on smaller islands, in rainforest regions, mountain areas and during journeys through less populated parts of Borneo.",
    ...shared,
    hotspotText:
      "Hotspot availability depends on the chosen package. Confirm tethering and select enough data if you need to connect a laptop or share data during longer island and road trips.",
    faq: [
      { question: "How much data do I need for Malaysia?", answer: "Navigation, messaging and ride apps are relatively light. Daily uploads, streaming, video calls and hotspot use need a larger allowance. DALO matches these needs to your stay." },
      { question: "Can I install a Malaysia eSIM at home?", answer: "Yes. Pre-installation using reliable Wi-Fi is usually convenient. Follow the package activation policy so validity begins at the right time." },
      { question: "Will it work in Kuala Lumpur and on the islands?", answer: "Plans are intended for supported local networks, but signal quality can vary on smaller islands, inside buildings and in remote natural areas." },
      { question: "Can my normal SIM stay active?", answer: "Usually yes on a compatible dual-SIM phone. Keep the regular line for calls and choose the eSIM for mobile data while checking roaming settings." },
    ],
  },
  morocco: {
    seoTitle: "Morocco eSIM | Data for Cities, Coast and Tours | DALO",
    seoDescription:
      "Find a Morocco eSIM for Marrakech, Casablanca, Fez, coastal trips and tours. Compare data and validity with a clear DALO recommendation.",
    headline: "Morocco eSIM plans for medinas, coast and road trips",
    intro:
      "Use mobile data for maps, transfers, accommodation messages and road-trip planning from Marrakech and Fez to Atlantic destinations. DALO recommends a Morocco eSIM around your stay and phone usage.",
    coverageText:
      "Morocco plans connect through supported networks in major cities and popular coastal destinations. Reception can vary in the Atlas Mountains, desert regions, on remote roads and outside populated areas.",
    ...shared,
    hotspotText:
      "Tethering rules depend on the selected package. Check hotspot support before checkout if you plan to work remotely, navigate long drives or share data on a group trip.",
    faq: [
      { question: "How much data is suitable for Morocco?", answer: "Maps, messages and bookings use less data than video, streaming and hotspot use. DALO recommends an allowance based on trip duration and expected habits." },
      { question: "Can I install my Morocco eSIM before departure?", answer: "Yes. Install it using stable Wi-Fi before traveling and follow the selected package instructions for activation after arrival." },
      { question: "Will it work outside Marrakech and Casablanca?", answer: "Plans use supported local networks, but coverage can change in mountains, desert areas and on remote roads. Download essential maps in advance." },
      { question: "Can I continue using my regular number?", answer: "Usually yes on a compatible dual-SIM device. Select the eSIM for data and control roaming on your primary SIM." },
    ],
  },
  "saudi-arabia": {
    seoTitle: "Saudi Arabia eSIM | Riyadh and Jeddah Data | DALO",
    seoDescription:
      "Find a Saudi Arabia eSIM for Riyadh, Jeddah, business travel and longer journeys. Compare data, validity and price with DALO.",
    headline: "Saudi Arabia eSIM plans for cities and longer journeys",
    intro:
      "Stay connected for navigation, ride apps, hotel communication and work while visiting Riyadh, Jeddah and destinations across Saudi Arabia. DALO matches your travel duration and usage to one clear eSIM recommendation.",
    coverageText:
      "Saudi Arabia plans are intended for supported networks in major cities and populated travel routes. Signal can vary across desert roads, remote regions and long journeys between urban destinations.",
    ...shared,
    hotspotText:
      "Hotspot use depends on the selected package. Confirm tethering and select sufficient data before checkout if the trip includes remote work or connecting multiple devices.",
    faq: [
      { question: "How much data do I need in Saudi Arabia?", answer: "Navigation and messaging are lighter uses. Business calls, streaming and hotspot use need more data. DALO matches the package to your stay and usage style." },
      { question: "Can I install the eSIM before the trip?", answer: "Yes. Installation on dependable Wi-Fi before departure is normally easiest. Follow the package instructions for the intended activation time." },
      { question: "Will it work between Riyadh and Jeddah?", answer: "Plans connect through supported networks, but reception can change on long roads and in remote areas. Keep important travel information available offline." },
      { question: "Can I keep my primary SIM enabled?", answer: "Most compatible dual-SIM phones allow this. Use the travel eSIM for data and manage roaming on the primary line carefully." },
    ],
  },
  serbia: {
    seoTitle: "Serbia eSIM | Data for Belgrade and Road Trips | DALO",
    seoDescription:
      "Find a Serbia eSIM for Belgrade, Novi Sad and travel across the country. Compare data, validity and price with a clear DALO recommendation.",
    headline: "Serbia eSIM plans for city stays and road trips",
    intro:
      "Stay connected for maps, taxi apps, bookings and messages while visiting Belgrade, Novi Sad or traveling through Serbia. DALO matches your trip length and phone habits to a straightforward eSIM recommendation.",
    coverageText:
      "Serbia plans connect through supported networks in major cities and populated areas. Reception can vary on mountain routes, in national parks, remote villages and some stretches between destinations.",
    ...shared,
    hotspotText:
      "Hotspot support is package-specific. Confirm tethering before payment if you need a laptop connection, plan to work remotely or want to share data on a road trip.",
    faq: [
      { question: "How much data is enough for Serbia?", answer: "Maps, taxi apps and messaging are light uses. Video calls, streaming and hotspot use require more. DALO recommends according to your trip duration and habits." },
      { question: "Can I set up a Serbia eSIM before arrival?", answer: "Yes. Installation with stable Wi-Fi before the journey is usually convenient. Follow the package activation instructions carefully." },
      { question: "Will the eSIM work outside Belgrade?", answer: "Plans use supported local networks across Serbia, but coverage can vary in mountain areas, parks and sparsely populated locations." },
      { question: "Can I keep my normal SIM active?", answer: "Usually yes. On a compatible dual-SIM phone, select the eSIM for data and review roaming settings on the regular line." },
    ],
  },
  "korea-republic-of": {
    seoTitle: "South Korea eSIM | Seoul and Busan Travel Data | DALO",
    seoDescription:
      "Find a South Korea eSIM for Seoul, Busan, Jeju and train travel. Compare data and validity with a clear DALO recommendation.",
    headline: "South Korea eSIM plans for cities, trains and travel apps",
    intro:
      "Use mobile data for navigation, translation, transport, bookings and messages while exploring Seoul, Busan, Jeju and beyond. DALO matches a South Korea eSIM to your stay and everyday phone usage.",
    coverageText:
      "South Korea plans are intended for supported networks in major cities and popular destinations. Signal can vary in mountain regions, remote coastal areas, underground spaces and on smaller islands.",
    ...shared,
    hotspotText:
      "Tethering availability depends on the selected plan. Confirm hotspot support and choose enough data if you need a laptop connection or plan to share data during the trip.",
    faq: [
      { question: "How much data do I need in South Korea?", answer: "Maps, translation and transport apps are lighter uses. Video, frequent uploads and hotspot use need more. DALO recommends according to your stay and habits." },
      { question: "Can I install a South Korea eSIM before flying?", answer: "Yes. Installing with stable Wi-Fi before departure is usually easiest. Follow the activation rules for the selected package." },
      { question: "Will it work in Seoul, Busan and Jeju?", answer: "Plans connect through supported networks in popular destinations, although local reception depends on the package, device and exact location." },
      { question: "Can I keep my existing phone number?", answer: "Most compatible dual-SIM phones allow both profiles. Select the travel eSIM for data and control roaming on the regular SIM." },
    ],
  },
  "united-arab-emirates": {
    seoTitle: "UAE eSIM | Dubai and Abu Dhabi Travel Data | DALO",
    seoDescription:
      "Find a UAE eSIM for Dubai, Abu Dhabi, stopovers and business travel. Compare data, validity and price with a clear DALO recommendation.",
    headline: "UAE eSIM plans for stopovers, holidays and business",
    intro:
      "Stay connected for airport transfers, ride apps, maps, hotel messages and work in Dubai, Abu Dhabi and across the Emirates. DALO recommends a UAE eSIM based on your stay and expected data use.",
    coverageText:
      "UAE plans are intended for supported networks in major cities and populated destinations. Reception can vary during desert excursions, on remote roads and away from developed areas.",
    ...shared,
    hotspotText:
      "Hotspot support depends on the selected package. Confirm tethering and choose enough data before checkout if you need to work remotely or connect another device.",
    faq: [
      { question: "How much data is useful for Dubai and Abu Dhabi?", answer: "Maps, ride apps and messaging are lighter uses. Business calls, video and hotspot use need more. DALO matches the allowance to your stay and habits." },
      { question: "Can I prepare a UAE eSIM before departure?", answer: "Yes. Install it using reliable Wi-Fi before travel and follow the selected package activation instructions after arrival." },
      { question: "Will the eSIM work during a UAE stopover?", answer: "A compatible plan can provide data on supported networks during a stopover. Choose validity and data that match the length of your visit." },
      { question: "Can my normal SIM remain active?", answer: "Usually yes on a compatible dual-SIM device. Select the eSIM for data and manage roaming on the primary line carefully." },
    ],
  },
  "united-kingdom": {
    seoTitle: "UK eSIM | Data for London and Britain Travel | DALO",
    seoDescription:
      "Find a UK eSIM for London, city breaks, rail journeys and road trips. Compare travel data, validity and price with DALO.",
    headline: "UK eSIM plans for London, rail trips and road travel",
    intro:
      "Stay online for maps, train updates, tickets, bookings and messages while visiting London or traveling across Britain. DALO matches a UK eSIM to your trip length and everyday data needs.",
    coverageText:
      "UK plans connect through supported networks in major cities and populated destinations. Reception can vary on rural rail routes, in the Scottish Highlands, coastal areas, national parks and older buildings.",
    ...shared,
    hotspotText:
      "Tethering rules are package-specific. Confirm hotspot support before payment if you plan to connect a laptop, work remotely or share data during a road trip.",
    faq: [
      { question: "How much data do I need for a UK trip?", answer: "Maps, train apps and messaging use less data than video, streaming and hotspot use. DALO recommends according to trip length and expected habits." },
      { question: "Can I install a UK eSIM before traveling?", answer: "Yes. Pre-installation with stable Wi-Fi is usually convenient. Follow the selected plan instructions for activation timing." },
      { question: "Will the eSIM work outside London?", answer: "Plans use supported networks across the UK, but reception can vary on rural routes, in national parks and in remote coastal or mountain areas." },
      { question: "Can I keep receiving calls on my regular number?", answer: "Usually yes with a compatible dual-SIM phone. Keep the regular line active and select the travel eSIM for data while managing roaming settings." },
    ],
  },
};

async function main() {
  for (const [slug, content] of Object.entries(pages)) {
    await prisma.destinationPage.update({
      where: { slug },
      data: content,
    });
  }

  console.log(`Updated ${Object.keys(pages).length} indexed destination pages.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
