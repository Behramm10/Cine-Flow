import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

const movieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  genre: z.string().min(1, "Genre is required"),
  duration_minutes: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  rating: z.string().optional(),
  description: z.string().optional(),
  poster_url: z.string().url().optional().or(z.literal("")),
});

type MovieFormData = z.infer<typeof movieSchema>;

export function AddMovieForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<MovieFormData>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      title: "",
      genre: "",
      duration_minutes: 120,
      rating: "",
      description: "",
      poster_url: "",
    },
  });

  const onSubmit = async (data: MovieFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("movies").insert(data);
      
      if (error) throw error;
      
      toast.success("Movie added successfully!");
      form.reset();
    } catch (error) {
      console.error("Error adding movie:", error);
      toast.error("Failed to add movie");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Add New Movie</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Movie title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="genre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Genre</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Action, Comedy, Drama" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="120" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., PG-13, R, U/A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="poster_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Poster URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/poster.jpg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Movie description..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Movie"}
          </Button>
        </form>
      </Form>
    </div>
  );
}