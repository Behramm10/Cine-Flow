import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

const citySchema = z.object({
  name: z.string().min(1, "City name is required"),
});

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
    setIsLoading(true);
    try {
      const { error } = await supabase.from("cities").insert(data);
      
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