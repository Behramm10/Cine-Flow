export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      booking: {
        Row: {
          b_id: string
          created_at: string | null
          price: number
          st_id: string
          u_id: string
        }
        Insert: {
          b_id?: string
          created_at?: string | null
          price: number
          st_id: string
          u_id: string
        }
        Update: {
          b_id?: string
          created_at?: string | null
          price?: number
          st_id?: string
          u_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_st_id_fkey"
            columns: ["st_id"]
            isOneToOne: false
            referencedRelation: "show_timings"
            referencedColumns: ["st_id"]
          },
          {
            foreignKeyName: "booking_u_id_fkey"
            columns: ["u_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["u_id"]
          },
        ]
      }
      booking_seats: {
        Row: {
          b_id: string
          s_id: string
        }
        Insert: {
          b_id: string
          s_id: string
        }
        Update: {
          b_id?: string
          s_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_seats_b_id_fkey"
            columns: ["b_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["b_id"]
          },
          {
            foreignKeyName: "booking_seats_s_id_fkey"
            columns: ["s_id"]
            isOneToOne: false
            referencedRelation: "seats"
            referencedColumns: ["s_id"]
          },
        ]
      }
      movies: {
        Row: {
          age_rating: string | null
          cast: string | null
          director: string | null
          m_desc: string | null
          m_genres: string[] | null
          m_id: string
          m_image: string | null
          m_length: number | null
          m_name: string
          m_year: number | null
          rating: number | null
          writers: string | null
        }
        Insert: {
          age_rating?: string | null
          cast?: string | null
          director?: string | null
          m_desc?: string | null
          m_genres?: string[] | null
          m_id?: string
          m_image?: string | null
          m_length?: number | null
          m_name: string
          m_year?: number | null
          rating?: number | null
          writers?: string | null
        }
        Update: {
          age_rating?: string | null
          cast?: string | null
          director?: string | null
          m_desc?: string | null
          m_genres?: string[] | null
          m_id?: string
          m_image?: string | null
          m_length?: number | null
          m_name?: string
          m_year?: number | null
          rating?: number | null
          writers?: string | null
        }
        Relationships: []
      }
      seats: {
        Row: {
          category: string
          price: number
          s_id: string
          seat_number: string
        }
        Insert: {
          category: string
          price: number
          s_id?: string
          seat_number: string
        }
        Update: {
          category?: string
          price?: number
          s_id?: string
          seat_number?: string
        }
        Relationships: []
      }
      show_timings: {
        Row: {
          m_id: string
          st_id: string
          timing: string
        }
        Insert: {
          m_id: string
          st_id?: string
          timing: string
        }
        Update: {
          m_id?: string
          st_id?: string
          timing?: string
        }
        Relationships: [
          {
            foreignKeyName: "show_timings_m_id_fkey"
            columns: ["m_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["m_id"]
          },
        ]
      }
      users: {
        Row: {
          balance: number | null
          email: string
          name: string
          password: string
          phone_no: string | null
          u_id: string
          user_type: number | null
        }
        Insert: {
          balance?: number | null
          email: string
          name: string
          password: string
          phone_no?: string | null
          u_id?: string
          user_type?: number | null
        }
        Update: {
          balance?: number | null
          email?: string
          name?: string
          password?: string
          phone_no?: string | null
          u_id?: string
          user_type?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
