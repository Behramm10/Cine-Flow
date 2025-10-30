import React, { createContext, useContext, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CheckCircle2 } from "lucide-react";

export type Booking = {
  showtimeId: string;
  movieTitle: string;
  poster: string;
  seats: string[];
  seatPrices: Record<string, number>; // per-seat pricing (₹)
  showtime: string;
  city: string;
  cinema: string; // cinema name
  auditorium: string;
  total: number;
  bookingId?: string;
  timestamp?: string; // ISO
};

type BookingCtx = {
  booking: Booking | null;
  setSelection: (payload: Omit<Booking, "total" | "bookingId" | "timestamp">) => void;
  confirm: () => Promise<string | null>; // returns bookingId
  clear: () => void;
  isConfirming: boolean;
};

const BookingContext = createContext<BookingCtx | undefined>(undefined);

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
};

export const BookingProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { user } = useAuth();

  const value = useMemo<BookingCtx>(() => ({
    booking,
    isConfirming,
    setSelection: ({ showtimeId, movieTitle, poster, seats, seatPrices, showtime, city, cinema, auditorium }) => {
      const total = Number(seats.reduce((sum, s) => sum + (seatPrices?.[s] ?? 200), 0).toFixed(2));
      setBooking({ showtimeId, movieTitle, poster, seats, seatPrices, showtime, city, cinema, auditorium, total });
    },
    confirm: async () => {
      if (!booking || !user) {
        toast.error("Please login to confirm booking");
        return null;
      }

      setIsConfirming(true);
      try {
        // Start a transaction-like approach
        // 1. First create the booking
        const { data: bookingData, error: bookingError } = await supabase
          .from("bookings")
          .insert({
            user_id: user.id,
            showtime_id: booking.showtimeId,
            total_amount: booking.total,
            currency: "INR",
            status: "confirmed"
          })
          .select()
          .single();

        if (bookingError) throw bookingError;

        // 2. Then insert all the seat reservations
        const seatInserts = booking.seats.map(seat => ({
          booking_id: bookingData.id,
          showtime_id: booking.showtimeId,
          seat_label: seat,
          price: booking.seatPrices[seat] || 200
        }));

        const { error: seatsError } = await supabase
          .from("booking_seats")
          .insert(seatInserts);

        if (seatsError) {
          // Rollback: delete the booking if seats insertion fails
          await supabase.from("bookings").delete().eq("id", bookingData.id);
          throw seatsError;
        }

        const confirmedBooking = { 
          ...booking, 
          bookingId: bookingData.id, 
          timestamp: bookingData.created_at 
        };
        setBooking(confirmedBooking);
        
        // Show success dialog instead of toast
        setShowSuccessDialog(true);
        
        // Auto-close after 5 seconds
        setTimeout(() => {
          setShowSuccessDialog(false);
        }, 5000);
        
        return bookingData.id;
      } catch (error) {
        console.error("Booking error:", error);
        
        // Check if it's a seat conflict error
        if (error instanceof Error && error.message.includes("duplicate key")) {
          toast.error("Some seats are no longer available. Please select different seats.");
        } else {
          toast.error("Failed to confirm booking. Please try again.");
        }
        return null;
      } finally {
        setIsConfirming(false);
      }
    },
    clear: () => setBooking(null),
  }), [booking, user, isConfirming]);

  return (
    <BookingContext.Provider value={value}>
      {children}
      
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="max-w-2xl w-[90vw]">
          <div className="flex flex-col items-center justify-center text-center py-12 space-y-6">
            <div className="rounded-full bg-green-500/20 p-8 animate-scale-in">
              <CheckCircle2 className="w-32 h-32 text-green-500" />
            </div>
            <AlertDialogTitle className="text-4xl md:text-5xl font-bold">
              Booking Confirmed Successfully!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xl md:text-2xl">
              Your tickets have been booked. Redirecting to your ticket...
            </AlertDialogDescription>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </BookingContext.Provider>
  );
};
