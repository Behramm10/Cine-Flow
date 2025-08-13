import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

const seatSchema = z.object({
  cinema_id: z.string().min(1, "Cinema is required"),
  auditorium: z.string().min(1, "Auditorium is required"),
  row_label: z.string().min(1, "Row label is required"),
  seat_number: z.coerce.number().min(1, "Seat number must be at least 1"),
  seat_label: z.string().optional(),
});

type SeatInsert = {
  cinema_id: string;
  auditorium: string;
  row_label: string;
  seat_number: number;
  seat_label?: string;
};

type SeatFormData = z.infer<typeof seatSchema>;

interface Cinema {
  id: string;
  name: string;
  city: string;
}

export function AddSeatForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);

  const form = useForm<SeatFormData>({
    resolver: zodResolver(seatSchema),
    defaultValues: {
      cinema_id: "",
      auditorium: "",
      row_label: "",
      seat_number: 1,
      seat_label: "",
    },
  });

  useEffect(() => {
    const fetchCinemas = async () => {
      const { data, error } = await supabase
        .from("cinemas")
        .select("id, name, city")
        .order("city, name");
      
      if (error) {
        console.error("Error fetching cinemas:", error);
        return;
      }
      
      setCinemas(data || []);
    };

    fetchCinemas();
  }, []);

  const onSubmit = async (data: SeatFormData) => {
    setIsLoading(true);
    try {
      const seatData: SeatInsert = {
        cinema_id: data.cinema_id,
        auditorium: data.auditorium,
        row_label: data.row_label,
        seat_number: data.seat_number,
        seat_label: data.seat_label || `${data.row_label}${data.seat_number}`,
      };

      const { error } = await supabase.from("seats").insert(seatData);
      
      if (error) throw error;
      
      toast.success("Seat added successfully!");
      form.reset();
    } catch (error) {
      console.error("Error adding seat:", error);
      toast.error("Failed to add seat");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Add New Seat</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="cinema_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cinema</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a cinema" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cinemas.map((cinema) => (
                      <SelectItem key={cinema.id} value={cinema.id}>
                        {cinema.name} - {cinema.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="auditorium"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Auditorium</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Screen 1, Hall A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="row_label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Row Label</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., A, B, C" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="seat_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seat Number</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="seat_label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seat Label (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Auto-generated if empty" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Seat"}
          </Button>
        </form>
      </Form>
    </div>
  );
}