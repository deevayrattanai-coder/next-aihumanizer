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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          color: string
          created_at: string
          id: string
          is_active: boolean
          message: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          is_active?: boolean
          message: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_active?: boolean
          message?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          inquiry_type: string
          message: string
          name: string
          resume_link: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          inquiry_type?: string
          message: string
          name: string
          resume_link?: string | null
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          inquiry_type?: string
          message?: string
          name?: string
          resume_link?: string | null
          subject?: string
        }
        Relationships: []
      }
      content_flags: {
        Row: {
          flag_type: string
          flagged_at: string
          history_id: string
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          flag_type?: string
          flagged_at?: string
          history_id: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          flag_type?: string
          flagged_at?: string
          history_id?: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      failed_humanizations: {
        Row: {
          created_at: string
          error_message: string
          id: string
          input_preview: string | null
          input_word_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message: string
          id?: string
          input_preview?: string | null
          input_word_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string
          id?: string
          input_preview?: string | null
          input_word_count?: number
          user_id?: string
        }
        Relationships: []
      }
      humanization_history: {
        Row: {
          created_at: string
          humanized_text: string
          id: string
          is_retry: boolean
          original_text: string
          user_id: string
          user_timezone: string | null
          word_count: number
        }
        Insert: {
          created_at?: string
          humanized_text: string
          id?: string
          is_retry?: boolean
          original_text: string
          user_id: string
          user_timezone?: string | null
          word_count?: number
        }
        Update: {
          created_at?: string
          humanized_text?: string
          id?: string
          is_retry?: boolean
          original_text?: string
          user_id?: string
          user_timezone?: string | null
          word_count?: number
        }
        Relationships: []
      }
      job_postings: {
        Row: {
          created_at: string
          department: string
          full_description: string
          id: string
          is_active: boolean
          location: string
          requirements: string[] | null
          responsibilities: string[] | null
          short_description: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string
          full_description?: string
          id?: string
          is_active?: boolean
          location?: string
          requirements?: string[] | null
          responsibilities?: string[] | null
          short_description?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string
          full_description?: string
          id?: string
          is_active?: boolean
          location?: string
          requirements?: string[] | null
          responsibilities?: string[] | null
          short_description?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_orders: {
        Row: {
          amount: number
          billing_cycle: string | null
          created_at: string
          currency: string
          id: string
          payment_type: string
          plan_key: string | null
          razorpay_order_id: string
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          status: string
          updated_at: string
          user_id: string
          words: number
        }
        Insert: {
          amount: number
          billing_cycle?: string | null
          created_at?: string
          currency?: string
          id?: string
          payment_type?: string
          plan_key?: string | null
          razorpay_order_id: string
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string
          updated_at?: string
          user_id: string
          words?: number
        }
        Update: {
          amount?: number
          billing_cycle?: string | null
          created_at?: string
          currency?: string
          id?: string
          payment_type?: string
          plan_key?: string | null
          razorpay_order_id?: string
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          words?: number
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          annual_price: number | null
          created_at: string
          cta_text: string
          description: string
          features: string[]
          id: string
          is_active: boolean
          is_enterprise: boolean
          is_popular: boolean
          monthly_price: number | null
          name: string
          original_monthly_price: number | null
          plan_key: string
          sort_order: number
          updated_at: string
          word_limit: number
        }
        Insert: {
          annual_price?: number | null
          created_at?: string
          cta_text?: string
          description?: string
          features?: string[]
          id?: string
          is_active?: boolean
          is_enterprise?: boolean
          is_popular?: boolean
          monthly_price?: number | null
          name: string
          original_monthly_price?: number | null
          plan_key: string
          sort_order?: number
          updated_at?: string
          word_limit?: number
        }
        Update: {
          annual_price?: number | null
          created_at?: string
          cta_text?: string
          description?: string
          features?: string[]
          id?: string
          is_active?: boolean
          is_enterprise?: boolean
          is_popular?: boolean
          monthly_price?: number | null
          name?: string
          original_monthly_price?: number | null
          plan_key?: string
          sort_order?: number
          updated_at?: string
          word_limit?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          label: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          label?: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          label?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          rating: number
          role: string
          sort_order: number
          text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          rating?: number
          role?: string
          sort_order?: number
          text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          rating?: number
          role?: string
          sort_order?: number
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          created_at: string
          history_id: string | null
          id: string
          message: string | null
          rating: string
          user_id: string
        }
        Insert: {
          created_at?: string
          history_id?: string | null
          id?: string
          message?: string | null
          rating: string
          user_id: string
        }
        Update: {
          created_at?: string
          history_id?: string | null
          id?: string
          message?: string | null
          rating?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_feedback_history_id_fkey"
            columns: ["history_id"]
            isOneToOne: false
            referencedRelation: "humanization_history"
            referencedColumns: ["id"]
          },
        ]
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
      user_word_usage: {
        Row: {
          created_at: string
          expires_at: string | null
          lifetime_limit: number
          plan: string
          updated_at: string
          user_id: string
          words_used: number
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          lifetime_limit?: number
          plan?: string
          updated_at?: string
          user_id: string
          words_used?: number
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          lifetime_limit?: number
          plan?: string
          updated_at?: string
          user_id?: string
          words_used?: number
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
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
