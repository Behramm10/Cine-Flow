import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

const cinemaSchema = z.object({
  name: z.string().min(1, "Cinema name is required"),
  city: z.string().min(1, "City is required"),
  address: z.string().optional(),
});

type CinemaFormData = z.infer<typeof cinemaSchema>;

interface City {
  id: string;
  name: string;
}

export function AddCinemaForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState<City[]>([]);

  const form = useForm<CinemaFormData>({
    resolver: zodResolver(cinemaSchema),
    defaultValues: {
      name: "",
      city: "",
      address: "",
    },
  });

  useEffect(() => {
    const fetchCities = async () => {
      const { data, error } = await supabase
        .from("cities")
        .select("id, name")
        .order("name");
      
      if (error) {
        console.error("Error fetching cities:", error);
        return;
      }
      
      setCities(data || []);
    };

    fetchCities();
  }, []);

  const onSubmit = async (data: CinemaFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("cinemas").insert(data);
      
      if (error) throw error;
      
      toast.success("Cinema added successfully!");
      form.reset();
    } catch (error) {
      console.error("Error adding cinema:", error);
      toast.error("Failed to add cinema");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Add New Cinema</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cinema Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., PVR Phoenix Palladium" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.name}>
                        {city.name}
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
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea placeholder="Cinema address..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Cinema"}
          </Button>
        </form>
      </Form>
    </div>
  );
}