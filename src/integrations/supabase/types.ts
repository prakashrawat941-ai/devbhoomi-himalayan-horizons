export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      cab_requests: {
        Row: {
          created_at: string
          driver_id: string | null
          id: string
          notes: string
          passengers: number
          phone: string
          pickup_point: string
          route: Database["public"]["Enums"]["cab_route"]
          status: string
          travel_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          driver_id?: string | null
          id?: string
          notes?: string
          passengers: number
          phone: string
          pickup_point: string
          route: Database["public"]["Enums"]["cab_route"]
          status?: string
          travel_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          driver_id?: string | null
          id?: string
          notes?: string
          passengers?: number
          phone?: string
          pickup_point?: string
          route?: Database["public"]["Enums"]["cab_route"]
          status?: string
          travel_date?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
        }
        Relationships: []
      }
      cultural_content: {
        Row: {
          body: string
          category: string
          id: string
          published: boolean
          slug: string
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          category: string
          id?: string
          published?: boolean
          slug: string
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          category?: string
          id?: string
          published?: boolean
          slug?: string
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      homestays: {
        Row: {
          amenities: string[]
          created_at: string
          description: string
          id: string
          image_path: string | null
          name: string
          partner_id: string
          rooms: number
          status: Database["public"]["Enums"]["approval_status"]
          tariff_note: string | null
          village_id: string | null
        }
        Insert: {
          amenities?: string[]
          created_at?: string
          description: string
          id?: string
          image_path?: string | null
          name: string
          partner_id: string
          rooms?: number
          status?: Database["public"]["Enums"]["approval_status"]
          tariff_note?: string | null
          village_id?: string | null
        }
        Update: {
          amenities?: string[]
          created_at?: string
          description?: string
          id?: string
          image_path?: string | null
          name?: string
          partner_id?: string
          rooms?: number
          status?: Database["public"]["Enums"]["approval_status"]
          tariff_note?: string | null
          village_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "homestays_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          city: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          city?: string | null
          created_at?: string
          full_name?: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          city?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      role_applications: {
        Row: {
          admin_note: string | null
          created_at: string
          details: Json
          id: string
          reviewed_at: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["approval_status"]
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          details?: Json
          id?: string
          reviewed_at?: string | null
          role: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["approval_status"]
          user_id: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          details?: Json
          id?: string
          reviewed_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["approval_status"]
          user_id?: string
        }
        Relationships: []
      }
      trip_enquiries: {
        Row: {
          created_at: string
          id: string
          kind: string
          message: string
          name: string
          phone: string
          plan_id: string | null
          status: string
          travel_date: string | null
          travellers: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          message?: string
          name: string
          phone: string
          plan_id?: string | null
          status?: string
          travel_date?: string | null
          travellers?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          message?: string
          name?: string
          phone?: string
          plan_id?: string | null
          status?: string
          travel_date?: string | null
          travellers?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_enquiries_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "trip_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_plans: {
        Row: {
          budget_max: number
          budget_min: number
          created_at: string
          days: number
          id: string
          itinerary: Json
          style: string
          title: string
          travellers: number
          user_id: string
        }
        Insert: {
          budget_max: number
          budget_min: number
          created_at?: string
          days: number
          id?: string
          itinerary?: Json
          style: string
          title: string
          travellers: number
          user_id: string
        }
        Update: {
          budget_max?: number
          budget_min?: number
          created_at?: string
          days?: number
          id?: string
          itinerary?: Json
          style?: string
          title?: string
          travellers?: number
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      villages: {
        Row: {
          altitude_m: number | null
          created_at: string
          district: string
          highlights: string[]
          id: string
          name: string
          published: boolean
          slug: string
          summary: string
        }
        Insert: {
          altitude_m?: number | null
          created_at?: string
          district: string
          highlights?: string[]
          id?: string
          name: string
          published?: boolean
          slug: string
          summary: string
        }
        Update: {
          altitude_m?: number | null
          created_at?: string
          district?: string
          highlights?: string[]
          id?: string
          name?: string
          published?: boolean
          slug?: string
          summary?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      review_application: {
        Args: {
          _app_id: string
          _note: string
          _status: Database["public"]["Enums"]["approval_status"]
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "customer" | "partner" | "driver"
      approval_status: "pending" | "approved" | "rejected"
      cab_route: "delhi_almora" | "chandigarh_almora"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "customer", "partner", "driver"],
      approval_status: ["pending", "approved", "rejected"],
      cab_route: ["delhi_almora", "chandigarh_almora"],
    },
  },
} as const
