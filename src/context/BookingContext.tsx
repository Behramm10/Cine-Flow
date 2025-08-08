import React, { createContext, useContext, useMemo, useState } from "react";
import type { Movie } from "@/data/movies";

export type Booking = {
  movieId: string;
  movieTitle: string;
  poster: string;
  seats: string[];
  showtime: string;
  city: string;
  cinema: string; // cinema name
  total: number;
  bookingId?: string;
  timestamp?: string; // ISO
};

type BookingCtx = {
  booking: Booking | null;
  setSelection: (payload: Omit<Booking, "total"> & { seatPrice: number }) => void;
  confirm: () => string | null; // returns bookingId
  clear: () => void;
};

const BookingContext = createContext<BookingCtx | undefined>(undefined);

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
};

const seatPriceDefault = 9.99;

export const BookingProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [booking, setBooking] = useState<Booking | null>(null);

  const value = useMemo<BookingCtx>(() => ({
    booking,
    setSelection: ({ movieId, movieTitle, poster, seats, showtime, city, cinema, seatPrice }) => {
      const total = Number((seats.length * (seatPrice || seatPriceDefault)).toFixed(2));
      setBooking({ movieId, movieTitle, poster, seats, showtime, city, cinema, total });
    },
    confirm: () => {
      if (!booking) return null;
      const bookingId = `BK${Date.now().toString(36)}`;
      const record = { ...booking, bookingId, timestamp: new Date().toISOString() };
      const key = "cineflow_bookings";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      localStorage.setItem(key, JSON.stringify([record, ...existing]));
      setBooking(record);
      return bookingId;
    },
    clear: () => setBooking(null),
  }), [booking]);

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};
