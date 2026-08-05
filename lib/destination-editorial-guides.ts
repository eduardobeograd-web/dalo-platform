export type DestinationEditorialGuide = {
  places: string[];
  useCases: string[];
  dataAdvice: string;
  arrivalAdvice: string;
};

const guides: Record<string, DestinationEditorialGuide> = {
  australia: {
    places: ["Sydney", "Melbourne", "Brisbane", "Perth", "Gold Coast"],
    useCases: ["Long-distance navigation", "Flight updates", "Bookings", "Messaging"],
    dataAdvice: "Australia's long travel distances make reliable navigation and booking access especially useful. Choose a larger allowance for road trips, video calls or hotspot use between cities.",
    arrivalAdvice: "Install before departure so maps, airport transport and accommodation messages are available as soon as you arrive.",
  },
  canada: {
    places: ["Toronto", "Vancouver", "Montreal", "Calgary", "Quebec City"],
    useCases: ["City navigation", "Road trips", "Transport", "Weather updates"],
    dataAdvice: "A city break usually needs less data than a multi-province road trip. Allow extra data for navigation, weather checks, video calls and hotspot use over longer distances.",
    arrivalAdvice: "Prepare the eSIM on Wi-Fi before flying, then select it for mobile data after landing in Canada.",
  },
  china: {
    places: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu"],
    useCases: ["Translation", "Navigation", "Transport", "Hotel messages"],
    dataAdvice: "Translation, navigation and transport planning can be used frequently throughout the day. Select more data for multi-city trips, video calls or regular media use.",
    arrivalAdvice: "Install and save the setup instructions before departure while you still have dependable home or airport Wi-Fi.",
  },
  egypt: {
    places: ["Cairo", "Giza", "Luxor", "Aswan", "Hurghada"],
    useCases: ["Airport transfers", "Maps", "Tour bookings", "Messaging"],
    dataAdvice: "Maps, transfer coordination and tour messages suit a moderate allowance. Add more data for resort stays, streaming or sharing frequent photo and video updates.",
    arrivalAdvice: "Have the eSIM installed before arrival so you can contact your driver or accommodation directly from the airport.",
  },
  europe: {
    places: ["France", "Italy", "Spain", "Germany", "Portugal", "Greece"],
    useCases: ["Cross-border travel", "Rail planning", "Maps", "Bookings"],
    dataAdvice: "Regional travel often means more navigation, ticket searches and accommodation changes. Choose an allowance that covers the whole itinerary rather than only the first city.",
    arrivalAdvice: "Check the plan's included countries before departure and install it while stable Wi-Fi is available.",
  },
  france: {
    places: ["Paris", "Nice", "Lyon", "Marseille", "Bordeaux"],
    useCases: ["Metro navigation", "Rail tickets", "Restaurant bookings", "Messaging"],
    dataAdvice: "Maps, rail planning and reservations fit moderate use. Choose more data for a longer France itinerary, frequent social media or hotspot use on train journeys.",
    arrivalAdvice: "Install before flying or taking the train so onward transport and accommodation details are available immediately.",
  },
  germany: {
    places: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne"],
    useCases: ["Rail planning", "City transport", "Navigation", "Business travel"],
    dataAdvice: "Transport searches, maps and messages are light to moderate use. Business travelers and multi-city rail trips should allow more data for calls and hotspot access.",
    arrivalAdvice: "Set up the eSIM before departure and keep your train, hotel and installation details available offline as a backup.",
  },
  greece: {
    places: ["Athens", "Thessaloniki", "Santorini", "Mykonos", "Crete"],
    useCases: ["Ferry updates", "Island navigation", "Bookings", "Messaging"],
    dataAdvice: "Island hopping can increase map, ferry and booking use. Select a larger allowance when combining Athens with several islands or sharing travel video regularly.",
    arrivalAdvice: "Install before departure so ferry changes, transfers and accommodation contacts remain accessible between islands.",
  },
  indonesia: {
    places: ["Bali", "Jakarta", "Yogyakarta", "Lombok", "Surabaya"],
    useCases: ["Ride bookings", "Translation", "Maps", "Accommodation messages"],
    dataAdvice: "Frequent ride coordination and navigation can add up on multi-island trips. Choose more data for remote work, video calls or extended stays in Bali and beyond.",
    arrivalAdvice: "Complete installation before the flight so airport pickup and accommodation messages work immediately after landing.",
  },
  italy: {
    places: ["Rome", "Milan", "Florence", "Venice", "Naples", "Sicily"],
    useCases: ["Rail planning", "City maps", "Reservations", "Translation"],
    dataAdvice: "A week of maps, messages and occasional social media usually suits moderate use. Pick more data for multi-city travel, streaming or hotspot use on longer stays.",
    arrivalAdvice: "Install before departure so train details, airport transfers and accommodation messages are ready when you arrive.",
  },
  japan: {
    places: ["Tokyo", "Kyoto", "Osaka", "Nara", "Hokkaido"],
    useCases: ["Rail navigation", "Translation", "Maps", "Reservations"],
    dataAdvice: "Rail navigation and translation are likely to be used throughout the day. Multi-city itineraries and frequent video use benefit from a larger allowance.",
    arrivalAdvice: "Install in advance and keep the QR code available offline before entering busy airport or station transfers.",
  },
  mexico: {
    places: ["Mexico City", "Cancun", "Tulum", "Oaxaca", "Puerto Vallarta"],
    useCases: ["Ride bookings", "Maps", "Tour coordination", "Messaging"],
    dataAdvice: "City stays and resort transfers typically need moderate data. Add more for road travel, hotspot use or frequent photo and video sharing.",
    arrivalAdvice: "Prepare the eSIM before departure so transport and accommodation contacts are available from the airport.",
  },
  morocco: {
    places: ["Marrakech", "Casablanca", "Fes", "Rabat", "Essaouira"],
    useCases: ["Medina navigation", "Translation", "Transfers", "Tour messages"],
    dataAdvice: "Navigation and translation are especially useful in unfamiliar city streets. Choose more data for desert tours, remote work or a longer multi-city itinerary.",
    arrivalAdvice: "Install before landing and save important addresses offline for transfers or journeys beyond major cities.",
  },
  philippines: {
    places: ["Manila", "Cebu", "Palawan", "Boracay", "Bohol"],
    useCases: ["Island transfers", "Flight updates", "Maps", "Bookings"],
    dataAdvice: "Island travel can involve repeated flight, ferry and transfer checks. A larger allowance helps on longer itineraries or when using hotspot between destinations.",
    arrivalAdvice: "Set up before departure so domestic flight changes and island transfer messages are accessible on arrival.",
  },
  portugal: {
    places: ["Lisbon", "Porto", "Algarve", "Madeira", "Azores"],
    useCases: ["City transport", "Road trips", "Bookings", "Navigation"],
    dataAdvice: "Urban breaks need moderate data, while road trips and island stays use more navigation and booking access. Increase the allowance for hotspot or video use.",
    arrivalAdvice: "Install before departure so airport transport, car rental and accommodation information are ready immediately.",
  },
  singapore: {
    places: ["Changi", "Marina Bay", "Sentosa", "Orchard", "Jurong"],
    useCases: ["Public transport", "Maps", "Cashless travel", "Bookings"],
    dataAdvice: "A short city stay usually fits a smaller or moderate plan. Select more data for business calls, streaming or using the phone as a hotspot.",
    arrivalAdvice: "Install before flying so transport directions and hotel details are available as soon as you leave Changi Airport.",
  },
  "korea-republic-of": {
    places: ["Seoul", "Busan", "Jeju", "Incheon", "Gyeongju"],
    useCases: ["Metro navigation", "Translation", "Rail planning", "Bookings"],
    dataAdvice: "Navigation and translation may be used frequently in cities. Choose more data for Jeju travel, video calls, streaming or a longer multi-city stay.",
    arrivalAdvice: "Prepare the eSIM before departure and save the installation information offline for arrival at Incheon or another airport.",
  },
  spain: {
    places: ["Madrid", "Barcelona", "Seville", "Valencia", "Mallorca"],
    useCases: ["Rail planning", "City maps", "Reservations", "Island travel"],
    dataAdvice: "Maps, tickets and messages suit moderate use. Multi-city trips, island travel and regular social video benefit from a larger allowance.",
    arrivalAdvice: "Install before traveling so airport transfers, rail details and accommodation contacts are available on arrival.",
  },
  switzerland: {
    places: ["Zurich", "Geneva", "Lucerne", "Interlaken", "Zermatt"],
    useCases: ["Rail planning", "Mountain weather", "Maps", "Bookings"],
    dataAdvice: "Rail connections, maps and weather checks are useful throughout the day. Add more data for extended alpine travel, calls or hotspot use.",
    arrivalAdvice: "Install before departure and save route information offline when traveling into mountain areas where reception can vary.",
  },
  thailand: {
    places: ["Bangkok", "Chiang Mai", "Phuket", "Krabi", "Koh Samui"],
    useCases: ["Ride bookings", "Island transfers", "Translation", "Maps"],
    dataAdvice: "Transport, maps and messages create moderate daily use. Choose more data for island hopping, long stays, remote work or frequent video sharing.",
    arrivalAdvice: "Complete installation before the flight so airport pickup, hotel messages and onward travel details work immediately.",
  },
  turkey: {
    places: ["Istanbul", "Antalya", "Cappadocia", "Izmir", "Bodrum"],
    useCases: ["City transport", "Translation", "Transfers", "Bookings"],
    dataAdvice: "Maps and transport are moderate use, while longer coastal or multi-city trips need more. Increase the allowance for video, calls or hotspot access.",
    arrivalAdvice: "Install before departure so airport transfers and accommodation contacts are ready when you land.",
  },
  "united-arab-emirates": {
    places: ["Dubai", "Abu Dhabi", "Sharjah", "Ras Al Khaimah"],
    useCases: ["Ride bookings", "Business calls", "Maps", "Reservations"],
    dataAdvice: "A short city trip may need moderate data. Business calls, streaming and hotspot use can increase consumption quickly, so choose a larger plan when needed.",
    arrivalAdvice: "Set up before flying so transport, hotel and meeting details are available immediately after landing.",
  },
  "united-kingdom": {
    places: ["London", "Edinburgh", "Manchester", "Liverpool", "Belfast"],
    useCases: ["Rail planning", "City transport", "Maps", "Bookings"],
    dataAdvice: "Maps, transport and messages suit moderate use. Multi-city rail travel, business calls and hotspot use require a larger allowance.",
    arrivalAdvice: "Install before departure so rail tickets, airport transfers and accommodation details are ready on arrival.",
  },
  "united-states-of-america": {
    places: ["New York", "Los Angeles", "Miami", "Las Vegas", "San Francisco"],
    useCases: ["Road trips", "Ride bookings", "Maps", "Flight updates"],
    dataAdvice: "Data needs vary greatly between a city break and a long road trip. Choose more for navigation, hotspot use, video calls or travel across several states.",
    arrivalAdvice: "Install before departure so airport transport, rental car and accommodation information are available immediately.",
  },
  vietnam: {
    places: ["Hanoi", "Ho Chi Minh City", "Da Nang", "Hoi An", "Nha Trang"],
    useCases: ["Ride bookings", "Translation", "Maps", "Transfer messages"],
    dataAdvice: "Maps, translation and transport create moderate daily use. Multi-city travel, remote work and frequent video sharing are better suited to a larger allowance.",
    arrivalAdvice: "Install before flying so pickup details, accommodation messages and onward travel plans work as soon as you arrive.",
  },
};

export function getDestinationEditorialGuide(slug: string) {
  return guides[slug] || null;
}
