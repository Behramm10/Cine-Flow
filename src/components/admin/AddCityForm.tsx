import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { sanitizeText, checkRateLimit } from "@/lib/security";

const citySchema = z.object({
  name: z.string()
    .min(1, "City name is required")
    .max(50, "City name must be less than 50 characters")
    .refine((val) => sanitizeText(val) === val, "Invalid characters in city name"),
});

type CityInsert = {
  name: string;
};

type CityFormData = z.infer<typeof citySchema>;

export function AddCityForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CityFormData>({
    resolver: zodResolver(citySchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: CityFormData) => {
    // Rate limiting check
    if (!checkRateLimit('add-city', 5, 60000)) {
      toast.error("Too many requests. Please wait before adding another city.");
      return;
    }

    setIsLoading(true);
    try {
      const cityData: CityInsert = {
        name: sanitizeText(data.name),
      };
      
      const { error } = await supabase.from("cities").insert(cityData);
      
      if (error) throw error;
      
      toast.success("City added successfully!");
      form.reset();
    } catch (error) {
      console.error("Error adding city:", error);
      toast.error("Failed to add city");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Add New City</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Mumbai, Delhi, Bengaluru" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add City"}
          </Button>
        </form>
      </Form>
    </div>
  );
}