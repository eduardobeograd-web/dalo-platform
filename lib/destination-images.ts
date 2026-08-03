const destinationImages: Record<string, string> = {
  argentina: "/travel/argentina-result.webp",
  australia: "/travel/australia.jpg",
  canada: "/travel/canada.jpg",
  croatia: "/travel/croatia.jpg",
  france: "/travel/france.jpg",
  germany: "/travel/germany.jpg",
  greece: "/travel/greece.jpg",
  indonesia: "/travel/indonesia.jpg",
  italy: "/travel/italy.jpg",
  japan: "/travel/japan.jpg",
  mexico: "/travel/mexico.jpg",
  portugal: "/travel/portugal.jpg",
  singapore: "/travel/singapore.jpg",
  spain: "/travel/spain.jpg",
  thailand: "/travel/thailand.jpg",
  turkey: "/travel/turkey.jpg",
  "united states": "/travel/united-states.jpg",
  "united states of america": "/travel/united-states.jpg",
  usa: "/travel/united-states.jpg",
};

function normalizeDestination(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function getDestinationImage(destination: string) {
  return destinationImages[normalizeDestination(destination)] || "/world-map.webp";
}

