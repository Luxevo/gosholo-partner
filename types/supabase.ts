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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      boost_transactions: {
        Row: {
          amount_cents: number
          boost_type: Database["public"]["Enums"]["boost_type_enum"]
          card_brand: string | null
          card_last_four: string | null
          created_at: string | null
          id: string
          status: string | null
          stripe_payment_intent_id: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          boost_type: Database["public"]["Enums"]["boost_type_enum"]
          card_brand?: string | null
          card_last_four?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          stripe_payment_intent_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          boost_type?: Database["public"]["Enums"]["boost_type_enum"]
          card_brand?: string | null
          card_last_four?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          stripe_payment_intent_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      commerces: {
        Row: {
          address: string
          boost_type: Database["public"]["Enums"]["boost_type_enum"] | null
          boosted: boolean | null
          boosted_at: string | null
          category: Database["public"]["Enums"]["commerce_category_enum"] | null
          created_at: string | null
          description: string | null
          email: string | null
          facebook_url: string | null
          id: string
          image_url: string | null
          instagram_url: string | null
          latitude: number | null
          linkedin_url: string | null
          longitude: number | null
          name: string
          phone: string | null
          postal_code: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          address: string
          boost_type?: Database["public"]["Enums"]["boost_type_enum"] | null
          boosted?: boolean | null
          boosted_at?: string | null
          category?:
            | Database["public"]["Enums"]["commerce_category_enum"]
            | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          latitude?: number | null
          linkedin_url?: string | null
          longitude?: number | null
          name: string
          phone?: string | null
          postal_code?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string
          boost_type?: Database["public"]["Enums"]["boost_type_enum"] | null
          boosted?: boolean | null
          boosted_at?: string | null
          category?:
            | Database["public"]["Enums"]["commerce_category_enum"]
            | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          latitude?: number | null
          linkedin_url?: string | null
          longitude?: number | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          boost_type: Database["public"]["Enums"]["boost_type_enum"] | null
          boosted: boolean | null
          boosted_at: string | null
          commerce_id: string
          condition: string | null
          created_at: string | null
          custom_location: string | null
          description: string
          end_date: string | null
          facebook_url: string | null
          id: string
          image_url: string | null
          instagram_url: string | null
          is_active: boolean | null
          latitude: number | null
          linkedin_url: string | null
          longitude: number | null
          postal_code: string | null
          start_date: string | null
          title: string
          updated_at: string | null
          user_id: string
          uses_commerce_location: boolean
        }
        Insert: {
          boost_type?: Database["public"]["Enums"]["boost_type_enum"] | null
          boosted?: boolean | null
          boosted_at?: string | null
          commerce_id: string
          condition?: string | null
          created_at?: string | null
          custom_location?: string | null
          description: string
          end_date?: string | null
          facebook_url?: string | null
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          linkedin_url?: string | null
          longitude?: number | null
          postal_code?: string | null
          start_date?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          uses_commerce_location?: boolean
        }
        Update: {
          boost_type?: Database["public"]["Enums"]["boost_type_enum"] | null
          boosted?: boolean | null
          boosted_at?: string | null
          commerce_id?: string
          condition?: string | null
          created_at?: string | null
          custom_location?: string | null
          description?: string
          end_date?: string | null
          facebook_url?: string | null
          id?: string
          image_url?: string | null
          instagram_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          linkedin_url?: string | null
          longitude?: number | null
          postal_code?: string | null
          start_date?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          uses_commerce_location?: boolean
        }
        Relationships: []
      }
      mobile_user_profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          boost_type: Database["public"]["Enums"]["boost_type_enum"] | null
          boosted: boolean | null
          boosted_at: string | null
          commerce_id: string
          condition: string | null
          created_at: string | null
          custom_location: string | null
          description: string
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          offer_type: Database["public"]["Enums"]["offer_type_enum"]
          postal_code: string | null
          start_date: string | null
          title: string
          updated_at: string | null
          user_id: string
          uses_commerce_location: boolean
        }
        Insert: {
          boost_type?: Database["public"]["Enums"]["boost_type_enum"] | null
          boosted?: boolean | null
          boosted_at?: string | null
          commerce_id: string
          condition?: string | null
          created_at?: string | null
          custom_location?: string | null
          description: string
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          offer_type: Database["public"]["Enums"]["offer_type_enum"]
          postal_code?: string | null
          start_date?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          uses_commerce_location?: boolean
        }
        Update: {
          boost_type?: Database["public"]["Enums"]["boost_type_enum"] | null
          boosted?: boolean | null
          boosted_at?: string | null
          commerce_id?: string
          condition?: string | null
          created_at?: string | null
          custom_location?: string | null
          description?: string
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          offer_type?: Database["public"]["Enums"]["offer_type_enum"]
          postal_code?: string | null
          start_date?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          uses_commerce_location?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          is_subscribed: boolean | null
          last_name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          is_subscribed?: boolean | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_subscribed?: boolean | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          id: string
          plan_type:
            | Database["public"]["Enums"]["subscription_plan_enum"]
            | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          plan_type?:
            | Database["public"]["Enums"]["subscription_plan_enum"]
            | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          plan_type?:
            | Database["public"]["Enums"]["subscription_plan_enum"]
            | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_boost_credits: {
        Row: {
          available_en_vedette: number | null
          available_visibilite: number | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          available_en_vedette?: number | null
          available_visibilite?: number | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          available_en_vedette?: number | null
          available_visibilite?: number | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_favorite_commerces: {
        Row: {
          commerce_id: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          commerce_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          commerce_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_favorite_commerces_commerce_id_fkey"
            columns: ["commerce_id"]
            isOneToOne: false
            referencedRelation: "commerces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorite_events: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_favorite_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorite_offers: {
        Row: {
          created_at: string | null
          id: string
          offer_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          offer_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          offer_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_favorite_offers_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_content_limit: {
        Args: { content_type: string; user_uuid: string }
        Returns: boolean
      }
      expire_old_boosts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      use_boost_credits: {
        Args:
          | {
              boost_type_param: Database["public"]["Enums"]["boost_type_enum"]
              credits_to_use?: number
              user_uuid: string
            }
          | { credits_to_use: number; user_uuid: string }
        Returns: boolean
      }
      user_has_credits: {
        Args: { required_credits: number; user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      boost_type_enum: "en_vedette" | "visibilite"
      commerce_category_enum:
        | "Restaurant"
        | "Café"
        | "Boulangerie"
        | "Épicerie"
        | "Commerce"
        | "Service"
        | "Santé"
        | "Beauté"
        | "Sport"
        | "Culture"
        | "Éducation"
        | "Autre"
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
      commerce_category_enum: [
        "Restaurant",
        "Café",
        "Boulangerie",
        "Épicerie",
        "Commerce",
        "Service",
        "Santé",
        "Beauté",
        "Sport",
        "Culture",
        "Éducation",
        "Autre",
      ],
      content_type_enum: ["offer", "event", "commerce"],
      offer_type_enum: ["in_store", "online", "both"],
      subscription_plan_enum: ["free", "pro"],
    },
  },
} as const