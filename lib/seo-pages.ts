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
};

export function getSeoLandingPage(slug: string) {
  return seoLandingPages[slug];
}
