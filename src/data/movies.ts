import sciFi from "@/assets/poster-sci-fi.jpg";
import romance from "@/assets/poster-romance.jpg";
import action from "@/assets/poster-action.jpg";
import fantasy from "@/assets/poster-fantasy.jpg";
import comedy from "@/assets/poster-comedy.jpg";
import noir from "@/assets/poster-noir.jpg";

export type Movie = {
  id: string;
  title: string;
  genres: string[];
  language: string;
  rating: number; // out of 10
  runtime: number; // minutes
  synopsis: string;
  cast: string[];
  poster: string;
  showtimes: string[]; // ISO time strings or display strings
};

export const movies: Movie[] = [
  {
    id: "sci-fi",
    title: "Neon Skyline",
    genres: ["Sci‑Fi", "Adventure"],
    language: "English",
    rating: 8.6,
    runtime: 128,
    synopsis:
      "In a sprawling neon metropolis, a rogue engineer must outsmart a sentient grid to save the city from a catastrophic blackout.",
    cast: ["A. Vega", "M. Chen", "S. Idris"],
    poster: sciFi,
    showtimes: ["13:30", "16:45", "19:15", "21:50"],
  },
  {
    id: "romance",
    title: "City of Rain",
    genres: ["Romance", "Drama"],
    language: "English",
    rating: 7.9,
    runtime: 114,
    synopsis:
      "Two strangers cross paths under the rain and rewrite the stories they thought were already written.",
    cast: ["E. Hart", "J. Morales"],
    poster: romance,
    showtimes: ["11:00", "14:20", "18:10", "20:40"],
  },
  {
    id: "action",
    title: "Tunnel Run",
    genres: ["Action", "Thriller"],
    language: "English",
    rating: 8.1,
    runtime: 102,
    synopsis:
      "A courier with a secret package races through the underbelly of the city with the world’s most relentless pursuer on his tail.",
    cast: ["R. Cole", "N. Kim", "V. Patel"],
    poster: action,
    showtimes: ["10:30", "13:00", "17:20", "22:00"],
  },
  {
    id: "fantasy",
    title: "Crown of Ember",
    genres: ["Fantasy", "Adventure"],
    language: "English",
    rating: 8.3,
    runtime: 136,
    synopsis:
      "A farmhand discovers an ancient crown and awakens a dragon sworn to protect its rightful bearer.",
    cast: ["K. Rivers", "T. Okoye"],
    poster: fantasy,
    showtimes: ["12:10", "15:30", "19:40"],
  },
  {
    id: "comedy",
    title: "Balloon Day",
    genres: ["Comedy", "Family"],
    language: "English",
    rating: 7.4,
    runtime: 96,
    synopsis:
      "Best friends attempt to throw the perfect park party and everything delightfully goes off‑script.",
    cast: ["D. Martinez", "Y. Park"],
    poster: comedy,
    showtimes: ["09:40", "12:00", "14:10", "17:00"],
  },
  {
    id: "noir",
    title: "Shadow Alley",
    genres: ["Mystery", "Noir"],
    language: "English",
    rating: 8.0,
    runtime: 110,
    synopsis:
      "A hard‑boiled detective stalks the midnight streets to untangle a case everyone else forgot.",
    cast: ["L. Stone", "H. Duval"],
    poster: noir,
    showtimes: ["18:30", "21:00", "23:15"],
  },
];
