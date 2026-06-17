export type SeoLandingPage = {
  name: string;
  headline: string;
  title: string;
  description: string;
  intro: string;
  faq: {
    question: string;
    answer: string;
  }[];
};

export const seoLandingPages: Record<string, SeoLandingPage> = {
  turkey: {
    name: "Turkey",
    headline: "Turkey eSIM plans for your next trip",
    title: "Turkey eSIM | Mobile Data for Your Turkey Trip | DALO",
    description:
      "Compare Turkey eSIM plans for your trip. Find mobile data options with clear pricing, data volume and validity.",
    intro:
      "Traveling to Turkey and want mobile internet without expensive roaming? DALO helps you compare Turkey eSIM plans by data volume, validity and price so you can choose the right option before your trip.",
    faq: [
      {
        question: "Does a Turkey eSIM work with iPhone?",
        answer:
          "Yes, if your iPhone supports eSIM and is unlocked, you can use a Turkey eSIM for mobile data while keeping your normal SIM active.",
      },
      {
        question: "When should I install my Turkey eSIM?",
        answer:
          "You can usually install the eSIM before your trip and activate it when you arrive or when it connects to the local network. Always check the provider details before purchase.",
      },
      {
        question: "Is a Turkey eSIM better than roaming?",
        answer:
          "For many travelers, a Turkey eSIM can be cheaper and clearer than roaming because you choose a fixed data package in advance.",
      },
    ],
  },

  thailand: {
    name: "Thailand",
    headline: "Thailand eSIM plans for tourists and travelers",
    title: "Thailand eSIM | Travel Data Plans for Thailand | DALO",
    description:
      "Compare Thailand eSIM plans with clear prices, data volume and validity. Find the right mobile data option for your trip.",
    intro:
      "Thailand is one of the most popular travel destinations, and mobile data is essential for maps, taxis, hotels and messaging. DALO helps you compare Thailand eSIM plans before you travel.",
    faq: [
      {
        question: "Does a Thailand eSIM work immediately after arrival?",
        answer:
          "Most Thailand eSIM plans work once installed and connected to a supported local network. Activation rules can vary by provider.",
      },
      {
        question: "Can I use WhatsApp with a Thailand eSIM?",
        answer:
          "Yes. A data eSIM lets you use WhatsApp, maps, browsers and other apps while keeping your normal number on your main SIM.",
      },
      {
        question: "Do I need a physical SIM card in Thailand?",
        answer:
          "No. If your phone supports eSIM, you can use a digital eSIM instead of buying a physical SIM card at the airport.",
      },
    ],
  },

  serbia: {
    name: "Serbia",
    headline: "Serbia eSIM plans for reliable travel data",
    title: "Serbia eSIM | Travel Data Plans for Serbia | DALO",
    description:
      "Compare Serbia eSIM plans for your trip. Find prepaid mobile data options with clear validity and pricing.",
    intro:
      "Traveling to Serbia? A Serbia eSIM can help you stay connected for maps, messaging, taxis and travel planning without relying on expensive roaming.",
    faq: [
      {
        question: "Does a Serbia eSIM work with iPhone?",
        answer:
          "Yes, if your iPhone supports eSIM and is not locked to a carrier, you can use a Serbia eSIM for mobile data.",
      },
      {
        question: "Can I keep my normal SIM active in Serbia?",
        answer:
          "Yes. In most phones you can keep your normal SIM for calls and use the Serbia eSIM for mobile data.",
      },
      {
        question: "Is eSIM useful for Serbia travel?",
        answer:
          "Yes. It is useful for navigation, messaging, booking apps and staying online when traveling through Serbia.",
      },
    ],
  },

  croatia: {
    name: "Croatia",
    headline: "Croatia eSIM plans for holidays and road trips",
    title: "Croatia eSIM | Mobile Data for Croatia Travel | DALO",
    description:
      "Compare Croatia eSIM plans for your holiday or business trip. Find travel data options with transparent pricing.",
    intro:
      "A Croatia eSIM is useful for beach holidays, road trips, city breaks and island travel. DALO helps you compare mobile data plans before you arrive.",
    faq: [
      {
        question: "Does a Croatia eSIM work on the islands?",
        answer:
          "Coverage depends on the local network used by the eSIM provider. Coastal areas and larger islands usually have good mobile coverage, but remote areas can vary.",
      },
      {
        question: "Can I use a Croatia eSIM for navigation?",
        answer:
          "Yes. You can use mobile data for Google Maps, Apple Maps, ride apps and travel planning.",
      },
      {
        question: "Is a Croatia eSIM good for tourists?",
        answer:
          "Yes. It lets tourists get mobile data without buying a physical SIM card locally.",
      },
    ],
  },

  "bosnia-and-herzegovina": {
    name: "Bosnia and Herzegovina",
    headline: "Bosnia and Herzegovina eSIM plans for your trip",
    title: "Bosnia and Herzegovina eSIM | Travel Data Plans | DALO",
    description:
      "Compare Bosnia and Herzegovina eSIM plans. Find mobile data options for your trip with clear prices and validity.",
    intro:
      "A Bosnia and Herzegovina eSIM helps you stay connected while traveling through Sarajevo, Mostar, Banja Luka or across the region.",
    faq: [
      {
        question: "Does eSIM work in Bosnia and Herzegovina?",
        answer:
          "Yes, if your phone supports eSIM and the provider offers coverage in Bosnia and Herzegovina.",
      },
      {
        question: "Can I use one eSIM for Balkan travel?",
        answer:
          "Some regional plans may cover multiple Balkan countries. Always check the countries included before buying.",
      },
      {
        question: "Is eSIM better than roaming in Bosnia?",
        answer:
          "For many travelers, a prepaid eSIM can be easier to control than roaming because you see the data package and price upfront.",
      },
    ],
  },

  japan: {
    name: "Japan",
    headline: "Japan eSIM plans for maps, trains and travel apps",
    title: "Japan eSIM | Best Travel Data Plans for Japan | DALO",
    description:
      "Compare Japan eSIM plans for your trip. Find mobile data options for Tokyo, Osaka, Kyoto and beyond.",
    intro:
      "Japan travel is much easier with reliable mobile data for maps, translation, train routes and messaging. DALO helps you compare Japan eSIM plans before departure.",
    faq: [
      {
        question: "Is a Japan eSIM useful for tourists?",
        answer:
          "Yes. It is useful for maps, translation apps, train navigation, hotel check-ins and messaging.",
      },
      {
        question: "Can I install a Japan eSIM before flying?",
        answer:
          "Usually yes. Many eSIMs can be installed before travel and activated when they connect to the destination network.",
      },
      {
        question: "Does a Japan eSIM include a phone number?",
        answer:
          "Most travel eSIMs are data-only. Check the plan details if you need calls or SMS.",
      },
    ],
  },
  germany: {
    name: "Germany",
    headline: "Germany eSIM plans for city trips and business travel",
    title: "Germany eSIM | Travel Data Plans for Germany | DALO",
    description:
      "Compare Germany eSIM plans for your trip. Find prepaid mobile data options with clear data volume, validity and pricing.",
    intro:
      "Traveling to Germany for business, a city trip or a longer stay? DALO helps you compare Germany eSIM plans for maps, train routes, hotel check-ins, messaging and everyday mobile data.",
    faq: [
      {
        question: "Does a Germany eSIM work with iPhone?",
        answer:
          "Yes, if your iPhone supports eSIM and is unlocked, you can use a Germany eSIM for mobile data during your trip.",
      },
      {
        question: "Can I use a Germany eSIM for maps and trains?",
        answer:
          "Yes. A Germany eSIM is useful for Google Maps, train apps, ride apps, messaging and browsing while traveling.",
      },
      {
        question: "Is a Germany eSIM useful for business travel?",
        answer:
          "Yes. It can help you stay online for emails, navigation, hotel check-ins and work apps without relying on public Wi-Fi.",
      },
    ],
  },
  france: {
    name: "France",
    headline: "France eSIM plans for Paris, holidays and road trips",
    title: "France eSIM | Travel Data Plans for France | DALO",
    description:
      "Compare France eSIM plans with clear prices, data volume and validity. Find the right prepaid mobile data option for your trip.",
    intro:
      "Planning a trip to France? A France eSIM can help you stay connected in Paris, on the coast, in the countryside or while traveling between cities.",
    faq: [
      {
        question: "Does a France eSIM work in Paris?",
        answer:
          "Yes. A France eSIM can provide mobile data in Paris and other supported areas, depending on the provider network.",
      },
      {
        question: "Can I use a France eSIM for navigation?",
        answer:
          "Yes. You can use it for maps, public transport apps, hotel bookings, messaging and browsing.",
      },
      {
        question: "Is a France eSIM better than airport Wi-Fi?",
        answer:
          "For many travelers, an eSIM is more convenient because it gives mobile data outside airports, hotels and cafés.",
      },
    ],
  },
  italy: {
    name: "Italy",
    headline: "Italy eSIM plans for Rome, Milan and holiday travel",
    title: "Italy eSIM | Travel Data Plans for Italy | DALO",
    description:
      "Compare Italy eSIM plans for your trip. Find prepaid mobile data options for Rome, Milan, Venice and more.",
    intro:
      "Traveling to Italy? A prepaid Italy eSIM can help you stay connected for maps, train routes, restaurant searches, hotel check-ins and messaging.",
    faq: [
      {
        question: "Does an Italy eSIM work with unlocked phones?",
        answer:
          "Yes, if your phone supports eSIM and is unlocked, you can use an Italy eSIM for mobile data.",
      },
      {
        question: "Can I use an Italy eSIM for train travel?",
        answer:
          "Yes. It is useful for train apps, maps, tickets, translation, messaging and browsing while moving between cities.",
      },
      {
        question: "Do I need a physical SIM card in Italy?",
        answer:
          "No. If your phone supports eSIM, you can use a digital Italy eSIM instead of buying a physical SIM card.",
      },
    ],
  },
  spain: {
    name: "Spain",
    headline: "Spain eSIM plans for holidays, cities and islands",
    title: "Spain eSIM | Travel Data Plans for Spain | DALO",
    description:
      "Compare Spain eSIM plans with clear data volume, validity and pricing. Find the right prepaid mobile data option before you travel.",
    intro:
      "Visiting Spain for a beach holiday, city break or island trip? DALO helps you compare Spain eSIM plans for maps, messaging, bookings and travel apps.",
    faq: [
      {
        question: "Does a Spain eSIM work in Barcelona and Madrid?",
        answer:
          "Yes. A Spain eSIM can provide mobile data in major cities and supported areas, depending on the local network coverage.",
      },
      {
        question: "Can I use a Spain eSIM on the islands?",
        answer:
          "Many Spain eSIM plans work in supported Spanish destinations, but coverage can depend on the provider and local network.",
      },
      {
        question: "Is a Spain eSIM useful for tourists?",
        answer:
          "Yes. It is useful for maps, messaging, hotel check-ins, restaurant searches and travel planning.",
      },
    ],
  },
  egypt: {
    name: "Egypt",
    headline: "Egypt eSIM plans for holidays and travel data",
    title: "Egypt eSIM | Travel Data Plans for Egypt | DALO",
    description:
      "Compare Egypt eSIM plans for your trip. Find prepaid mobile data options with clear prices, data volume and validity.",
    intro:
      "Traveling to Egypt? An Egypt eSIM can help you stay connected for airport transfers, maps, hotel communication, messaging and travel planning.",
    faq: [
      {
        question: "Does an Egypt eSIM work for tourists?",
        answer:
          "Yes. If your phone supports eSIM and is unlocked, an Egypt eSIM can be used for mobile data while traveling.",
      },
      {
        question: "Can I install an Egypt eSIM before departure?",
        answer:
          "In many cases you can install the eSIM before your trip and activate it according to the provider instructions.",
      },
      {
        question: "Is an Egypt eSIM useful for resorts and tours?",
        answer:
          "Yes. It can help with messaging, maps, transfers, bookings and staying online outside hotel Wi-Fi.",
      },
    ],
  },
  "united-arab-emirates": {
    name: "United Arab Emirates",
    headline: "UAE eSIM plans for Dubai, Abu Dhabi and business travel",
    title: "UAE eSIM | Dubai and Abu Dhabi Travel Data Plans | DALO",
    description:
      "Compare UAE eSIM plans for Dubai, Abu Dhabi and the United Arab Emirates. Find prepaid mobile data options with clear pricing.",
    intro:
      "Traveling to Dubai, Abu Dhabi or elsewhere in the UAE? A UAE eSIM can help you stay connected for maps, airport transfers, hotel check-ins, messaging and business travel.",
    faq: [
      {
        question: "Does a UAE eSIM work in Dubai?",
        answer:
          "Yes. A UAE eSIM can provide mobile data in Dubai and other supported areas, depending on the provider network.",
      },
      {
        question: "Can I use a UAE eSIM for business travel?",
        answer:
          "Yes. It is useful for emails, maps, messaging, ride apps and staying connected between meetings.",
      },
      {
        question: "Do I need to buy a SIM card at Dubai airport?",
        answer:
          "Not necessarily. If your phone supports eSIM, you can compare and prepare an eSIM before your trip.",
      },
    ],
  },
  "united-kingdom": {
    name: "United Kingdom",
    headline: "UK eSIM plans for London and travel across Britain",
    title: "UK eSIM | Travel Data Plans for the United Kingdom | DALO",
    description:
      "Compare UK eSIM plans for London and the United Kingdom. Find prepaid mobile data options with clear data volume and validity.",
    intro:
      "Traveling to London or elsewhere in the United Kingdom? A UK eSIM can help you stay connected for maps, trains, messaging, hotel check-ins and travel apps.",
    faq: [
      {
        question: "Does a UK eSIM work in London?",
        answer:
          "Yes. A UK eSIM can provide mobile data in London and other supported areas, depending on network coverage.",
      },
      {
        question: "Can I use a UK eSIM for trains and maps?",
        answer:
          "Yes. It is useful for maps, train apps, tickets, messaging and browsing while traveling.",
      },
      {
        question: "Can I keep my normal SIM active in the UK?",
        answer:
          "Yes. Most eSIM phones allow you to keep your normal SIM active and use the UK eSIM for mobile data.",
      },
    ],
  },
  "united-states-of-america": {
    name: "United States",
    headline: "USA eSIM plans for road trips, cities and travel data",
    title: "USA eSIM | Travel Data Plans for the United States | DALO",
    description:
      "Compare USA eSIM plans for your trip. Find prepaid mobile data options for the United States with clear pricing and validity.",
    intro:
      "Traveling to the United States? A USA eSIM can help you stay connected for maps, ride apps, hotel check-ins, messaging, road trips and everyday mobile data.",
    faq: [
      {
        question: "Does a USA eSIM work with iPhone?",
        answer:
          "Yes, if your iPhone supports eSIM and is unlocked, you can use a USA eSIM for mobile data.",
      },
      {
        question: "Can I use a USA eSIM for road trips?",
        answer:
          "Yes. It is useful for maps, navigation, hotel bookings, messaging and travel apps, depending on network coverage.",
      },
      {
        question: "Is a USA eSIM better than roaming?",
        answer:
          "For many travelers, a prepaid USA eSIM can be clearer and more predictable than roaming because you choose a fixed data package.",
      },
    ],
  },

  greece: {
    name: "Greece",
    headline: "Greece eSIM plans for islands, Athens and holidays",
    title: "Greece eSIM | Travel Data Plans for Greece | DALO",
    description:
      "Compare Greece eSIM plans for your trip. Find prepaid mobile data options for Athens, islands and holidays with clear prices and validity.",
    intro:
      "Traveling to Greece for islands, Athens, beach holidays or island hopping? A Greece eSIM can help you stay connected for maps, ferries, taxis, hotel check-ins, messaging and travel apps.",
    faq: [
      {
        question: "Does a Greece eSIM work on the islands?",
        answer:
          "Many Greece eSIM plans work in supported island destinations, but coverage depends on the provider and local network. Check the plan details before buying.",
      },
      {
        question: "Can I use a Greece eSIM for ferries and navigation?",
        answer:
          "Yes. It is useful for maps, ferry tickets, hotel communication, messaging and travel planning.",
      },
      {
        question: "Is a Greece eSIM useful for tourists?",
        answer:
          "Yes. A Greece eSIM can help tourists avoid relying only on hotel Wi-Fi or expensive roaming.",
      },
    ],
  },

  portugal: {
    name: "Portugal",
    headline: "Portugal eSIM plans for Lisbon, Porto and coastal trips",
    title: "Portugal eSIM | Travel Data Plans for Portugal | DALO",
    description:
      "Compare Portugal eSIM plans for your trip. Find prepaid mobile data options for Lisbon, Porto, Algarve and more.",
    intro:
      "Traveling to Portugal for Lisbon, Porto, the Algarve or a longer stay? A Portugal eSIM can help you stay online for maps, public transport, ride apps, bookings and messaging.",
    faq: [
      {
        question: "Does a Portugal eSIM work in Lisbon and Porto?",
        answer:
          "Yes. A Portugal eSIM can provide mobile data in Lisbon, Porto and other supported areas, depending on the local network.",
      },
      {
        question: "Is a Portugal eSIM good for digital nomads?",
        answer:
          "Yes. It can be useful as a travel data option for navigation, messaging, work apps and backup connectivity.",
      },
      {
        question: "Can I install a Portugal eSIM before travel?",
        answer:
          "In many cases you can install your eSIM before departure and activate it according to the provider instructions.",
      },
    ],
  },

  morocco: {
    name: "Morocco",
    headline: "Morocco eSIM plans for Marrakech, cities and tours",
    title: "Morocco eSIM | Travel Data Plans for Morocco | DALO",
    description:
      "Compare Morocco eSIM plans for your trip. Find prepaid mobile data options with clear data volume, validity and pricing.",
    intro:
      "Traveling to Morocco? A Morocco eSIM can help you stay connected in Marrakech, Casablanca, Fes, coastal cities or while joining tours and road trips.",
    faq: [
      {
        question: "Does a Morocco eSIM work for tourists?",
        answer:
          "Yes, if your phone supports eSIM and the provider offers Morocco coverage, you can use it for mobile data while traveling.",
      },
      {
        question: "Can I use a Morocco eSIM for maps and taxis?",
        answer:
          "Yes. It is useful for maps, ride apps, messaging, hotel communication and travel planning.",
      },
      {
        question: "Is a Morocco eSIM better than roaming?",
        answer:
          "For many travelers, a prepaid Morocco eSIM can be clearer than roaming because you choose a data package and price before use.",
      },
    ],
  },

  canada: {
    name: "Canada",
    headline: "Canada eSIM plans for cities, road trips and travel data",
    title: "Canada eSIM | Travel Data Plans for Canada | DALO",
    description:
      "Compare Canada eSIM plans for your trip. Find prepaid mobile data options for cities, road trips and travel apps.",
    intro:
      "Traveling to Canada? A Canada eSIM can help you stay connected for maps, ride apps, hotel check-ins, messaging, road trips and everyday travel data.",
    faq: [
      {
        question: "Does a Canada eSIM work with iPhone?",
        answer:
          "Yes, if your iPhone supports eSIM and is unlocked, you can use a Canada eSIM for mobile data.",
      },
      {
        question: "Can I use a Canada eSIM for road trips?",
        answer:
          "Yes. It is useful for navigation, bookings, messaging and travel apps, but coverage can vary in remote areas.",
      },
      {
        question: "Is a Canada eSIM useful for tourists?",
        answer:
          "Yes. It helps travelers stay online without needing to buy a physical SIM card after arrival.",
      },
    ],
  },

  australia: {
    name: "Australia",
    headline: "Australia eSIM plans for cities, beaches and road trips",
    title: "Australia eSIM | Travel Data Plans for Australia | DALO",
    description:
      "Compare Australia eSIM plans for your trip. Find prepaid mobile data options with clear data volume, validity and pricing.",
    intro:
      "Traveling to Australia? An Australia eSIM can help you stay connected in Sydney, Melbourne, Brisbane, coastal areas and during road trips.",
    faq: [
      {
        question: "Does an Australia eSIM work for tourists?",
        answer:
          "Yes, if your phone supports eSIM and is unlocked, an Australia eSIM can be used for mobile data while traveling.",
      },
      {
        question: "Can I use an Australia eSIM for navigation?",
        answer:
          "Yes. It is useful for maps, ride apps, bookings, messaging and travel planning.",
      },
      {
        question: "Does coverage work everywhere in Australia?",
        answer:
          "Coverage depends on the local network used by the eSIM provider. Major cities usually have stronger coverage than remote areas.",
      },
    ],
  },

  mexico: {
    name: "Mexico",
    headline: "Mexico eSIM plans for holidays, cities and travel data",
    title: "Mexico eSIM | Travel Data Plans for Mexico | DALO",
    description:
      "Compare Mexico eSIM plans for your trip. Find prepaid mobile data options for holidays, cities and travel apps.",
    intro:
      "Traveling to Mexico? A Mexico eSIM can help you stay connected for airport transfers, maps, hotels, messaging, ride apps and travel planning.",
    faq: [
      {
        question: "Does a Mexico eSIM work in tourist areas?",
        answer:
          "Yes. A Mexico eSIM can provide mobile data in supported areas, depending on the local network and provider.",
      },
      {
        question: "Can I use WhatsApp with a Mexico eSIM?",
        answer:
          "Yes. A data eSIM lets you use WhatsApp, maps, browsers and other apps while keeping your normal number on your main SIM.",
      },
      {
        question: "Is a Mexico eSIM good for holidays?",
        answer:
          "Yes. It can be useful for navigation, hotel communication, bookings and staying online outside Wi-Fi.",
      },
    ],
  },

  indonesia: {
    name: "Indonesia",
    headline: "Indonesia eSIM plans for Bali, Jakarta and island travel",
    title: "Indonesia eSIM | Travel Data Plans for Indonesia | DALO",
    description:
      "Compare Indonesia eSIM plans for Bali, Jakarta and island travel. Find prepaid mobile data options with clear pricing.",
    intro:
      "Traveling to Indonesia or Bali? An Indonesia eSIM can help you stay connected for maps, ride apps, hotel communication, messaging and travel planning.",
    faq: [
      {
        question: "Does an Indonesia eSIM work in Bali?",
        answer:
          "Many Indonesia eSIM plans work in Bali, depending on the provider and local network coverage.",
      },
      {
        question: "Can I use an Indonesia eSIM for ride apps?",
        answer:
          "Yes. It is useful for ride apps, maps, messaging, bookings and browsing.",
      },
      {
        question: "Is an Indonesia eSIM useful for island travel?",
        answer:
          "Yes, but coverage can vary between islands and remote areas. Check the provider details before buying.",
      },
    ],
  },

  malaysia: {
    name: "Malaysia",
    headline: "Malaysia eSIM plans for Kuala Lumpur and travel data",
    title: "Malaysia eSIM | Travel Data Plans for Malaysia | DALO",
    description:
      "Compare Malaysia eSIM plans for your trip. Find prepaid mobile data options with clear data volume, validity and pricing.",
    intro:
      "Traveling to Malaysia? A Malaysia eSIM can help you stay connected in Kuala Lumpur, Penang, Langkawi and other travel destinations.",
    faq: [
      {
        question: "Does a Malaysia eSIM work in Kuala Lumpur?",
        answer:
          "Yes. A Malaysia eSIM can provide mobile data in Kuala Lumpur and other supported areas, depending on network coverage.",
      },
      {
        question: "Can I use a Malaysia eSIM for maps and messaging?",
        answer:
          "Yes. It is useful for maps, messaging, ride apps, bookings and travel planning.",
      },
      {
        question: "Do I need a physical SIM card in Malaysia?",
        answer:
          "No. If your phone supports eSIM, you can use a digital Malaysia eSIM instead of buying a physical SIM card.",
      },
    ],
  },

  singapore: {
    name: "Singapore",
    headline: "Singapore eSIM plans for city travel and business trips",
    title: "Singapore eSIM | Travel Data Plans for Singapore | DALO",
    description:
      "Compare Singapore eSIM plans for your trip. Find prepaid mobile data options for city travel, business and stopovers.",
    intro:
      "Traveling to Singapore for business, a stopover or city travel? A Singapore eSIM can help you stay connected for maps, ride apps, messaging, meetings and bookings.",
    faq: [
      {
        question: "Does a Singapore eSIM work immediately after arrival?",
        answer:
          "Most Singapore eSIM plans work once installed and connected to a supported local network, depending on provider rules.",
      },
      {
        question: "Is a Singapore eSIM useful for business travel?",
        answer:
          "Yes. It is useful for emails, maps, ride apps, messaging and staying connected between meetings.",
      },
      {
        question: "Can I use WhatsApp with a Singapore eSIM?",
        answer:
          "Yes. A data eSIM lets you use WhatsApp and other apps while keeping your normal number active on your main SIM.",
      },
    ],
  },

  "korea-republic-of": {
    name: "South Korea",
    headline: "South Korea eSIM plans for Seoul, Busan and travel apps",
    title: "South Korea eSIM | Travel Data Plans for Korea | DALO",
    description:
      "Compare South Korea eSIM plans for your trip. Find prepaid mobile data options for Seoul, Busan and travel apps.",
    intro:
      "Traveling to South Korea? A South Korea eSIM can help you stay connected for maps, translation, messaging, public transport, bookings and travel apps.",
    faq: [
      {
        question: "Does a South Korea eSIM work in Seoul?",
        answer:
          "Yes. A South Korea eSIM can provide mobile data in Seoul and other supported areas, depending on the provider network.",
      },
      {
        question: "Can I use a South Korea eSIM for translation apps?",
        answer:
          "Yes. It is useful for translation, maps, transport apps, messaging and browsing.",
      },
      {
        question: "Is a South Korea eSIM data-only?",
        answer:
          "Most travel eSIMs are data-only. Check the plan details if you need calls or SMS.",
      },
    ],
  },

  "saudi-arabia": {
    name: "Saudi Arabia",
    headline: "Saudi Arabia eSIM plans for travel, business and pilgrimage",
    title: "Saudi Arabia eSIM | Travel Data Plans for Saudi Arabia | DALO",
    description:
      "Compare Saudi Arabia eSIM plans for your trip. Find prepaid mobile data options with clear data volume, validity and pricing.",
    intro:
      "Traveling to Saudi Arabia for business, tourism or pilgrimage? A Saudi Arabia eSIM can help you stay connected for maps, messaging, hotel communication, bookings and travel apps.",
    faq: [
      {
        question: "Does a Saudi Arabia eSIM work for travelers?",
        answer:
          "Yes, if your phone supports eSIM and the provider offers Saudi Arabia coverage, you can use it for mobile data while traveling.",
      },
      {
        question: "Can I use a Saudi Arabia eSIM for maps and messaging?",
        answer:
          "Yes. It is useful for maps, messaging, hotel communication, ride apps and travel planning.",
      },
      {
        question: "Can I install a Saudi Arabia eSIM before departure?",
        answer:
          "In many cases you can install the eSIM before your trip and activate it according to the provider instructions.",
      },
    ],
  },


};

export function getSeoLandingPage(slug: string) {
  return seoLandingPages[slug];
}
