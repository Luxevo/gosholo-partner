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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      boost_credits: {
        Row: {
          created_at: string | null
          credits_available: number | null
          last_refill_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_available?: number | null
          last_refill_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_available?: number | null
          last_refill_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      boosts: {
        Row: {
          boost_type: Database["public"]["Enums"]["boost_type_enum"]
          commerce_id: string
          content_id: string
          content_type: Database["public"]["Enums"]["content_type_enum"]
          created_at: string | null
          ends_at: string
          id: string
          starts_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          boost_type: Database["public"]["Enums"]["boost_type_enum"]
          commerce_id: string
          content_id: string
          content_type: Database["public"]["Enums"]["content_type_enum"]
          created_at?: string | null
          ends_at: string
          id?: string
          starts_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          boost_type?: Database["public"]["Enums"]["boost_type_enum"]
          commerce_id?: string
          content_id?: string
          content_type?: Database["public"]["Enums"]["content_type_enum"]
          created_at?: string | null
          ends_at?: string
          id?: string
          starts_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "boosts_commerce_id_fkey"
            columns: ["commerce_id"]
            isOneToOne: false
            referencedRelation: "commerces"
            referencedColumns: ["id"]
          },
        ]
      }
      commerces: {
        Row: {
          address: string
          category: string
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          image_url: string | null
          name: string
          phone: string | null
          status: string
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          address: string
          category?: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          name: string
          phone?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string
          category?: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          commerce_id: string
          condition: string | null
          created_at: string | null
          custom_location: string | null
          description: string
          id: string
          picture: string | null
          title: string
          updated_at: string | null
          user_id: string
          uses_commerce_location: boolean
        }
        Insert: {
          commerce_id: string
          condition?: string | null
          created_at?: string | null
          custom_location?: string | null
          description: string
          id?: string
          picture?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          uses_commerce_location?: boolean
        }
        Update: {
          commerce_id?: string
          condition?: string | null
          created_at?: string | null
          custom_location?: string | null
          description?: string
          id?: string
          picture?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          uses_commerce_location?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "events_commerce_id_fkey"
            columns: ["commerce_id"]
            isOneToOne: false
            referencedRelation: "commerces"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          commerce_id: string
          condition: string | null
          created_at: string | null
          custom_location: string | null
          description: string
          id: string
          offer_type: Database["public"]["Enums"]["offer_type_enum"]
          picture: string | null
          title: string
          updated_at: string | null
          user_id: string
          uses_commerce_location: boolean
        }
        Insert: {
          commerce_id: string
          condition?: string | null
          created_at?: string | null
          custom_location?: string | null
          description: string
          id?: string
          offer_type: Database["public"]["Enums"]["offer_type_enum"]
          picture?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          uses_commerce_location?: boolean
        }
        Update: {
          commerce_id?: string
          condition?: string | null
          created_at?: string | null
          custom_location?: string | null
          description?: string
          id?: string
          offer_type?: Database["public"]["Enums"]["offer_type_enum"]
          picture?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          uses_commerce_location?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "offers_commerce_id_fkey"
            columns: ["commerce_id"]
            isOneToOne: false
            referencedRelation: "commerces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          ends_at: string | null
          id: string
          plan_type: Database["public"]["Enums"]["subscription_plan_enum"]
          starts_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          ends_at?: string | null
          id?: string
          plan_type?: Database["public"]["Enums"]["subscription_plan_enum"]
          starts_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          ends_at?: string | null
          id?: string
          plan_type?: Database["public"]["Enums"]["subscription_plan_enum"]
          starts_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_content_limit: {
        Args: { user_uuid: string; content_type: string }
        Returns: boolean
      }
      expire_old_boosts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      use_boost_credits: {
        Args: { user_uuid: string; credits_to_use: number }
        Returns: boolean
      }
      user_has_credits: {
        Args: { user_uuid: string; required_credits: number }
        Returns: boolean
      }
    }
    Enums: {
      boost_type_enum: "en_vedette" | "visibilite"
      content_type_enum: "offer" | "event" | "commerce"
      offer_type_enum: "in_store" | "online" | "both"
      subscription_plan_enum: "free" | "pro"
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
    Enums: {
      boost_type_enum: ["en_vedette", "visibilite"],
      content_type_enum: ["offer", "event", "commerce"],
      offer_type_enum: ["in_store", "online", "both"],
      subscription_plan_enum: ["free", "pro"],
    },
  },
} as const
