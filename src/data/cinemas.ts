export type Cinema = {
  id: string;
  name: string;
  city: string;
};

export const CINEMAS: Cinema[] = [
  { id: "mum-pvr-palladium", name: "PVR Phoenix Palladium", city: "Mumbai" },
  { id: "mum-inox-rcity", name: "INOX R City Mall", city: "Mumbai" },
  { id: "del-pvr-select", name: "PVR Select Citywalk", city: "Delhi" },
  { id: "del-inox-pacific", name: "INOX Pacific Mall", city: "Delhi" },
  { id: "blr-pvr-orion", name: "PVR Orion Mall", city: "Bengaluru" },
  { id: "blr-inox-garuda", name: "INOX Garuda Mall", city: "Bengaluru" },
  { id: "hyd-pvr-nexus", name: "PVR Nexus Mall", city: "Hyderabad" },
  { id: "hyd-asian-priya", name: "Asian Priya Cinemas", city: "Hyderabad" },
  { id: "chn-spi-sathyam", name: "SPI Sathyam Cinemas", city: "Chennai" },
  { id: "pune-pvr-phoenix", name: "PVR Phoenix Marketcity", city: "Pune" },
  { id: "kol-inox-south", name: "INOX South City Mall", city: "Kolkata" },
  { id: "ahm-cinepolis-one", name: "Cinépolis Ahmedabad One", city: "Ahmedabad" },
];

export const CITIES = Array.from(new Set(CINEMAS.map((c) => c.city))).sort();
