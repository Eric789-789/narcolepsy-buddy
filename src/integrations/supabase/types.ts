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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      arm_assignments: {
        Row: {
          arm: string | null
          arm_name: string
          created_at: string | null
          date: string | null
          end_date: string | null
          experiment_id: string
          id: string
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          arm?: string | null
          arm_name: string
          created_at?: string | null
          date?: string | null
          end_date?: string | null
          experiment_id: string
          id?: string
          start_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          arm?: string | null
          arm_name?: string
          created_at?: string | null
          date?: string | null
          end_date?: string | null
          experiment_id?: string
          id?: string
          start_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "arm_assignments_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      check_ins: {
        Row: {
          context: string | null
          created_at: string | null
          id: string
          medication: string | null
          notes: string | null
          physical_activity: string | null
          sss: number | null
          symptoms: string | null
          timestamp: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string | null
          id?: string
          medication?: string | null
          notes?: string | null
          physical_activity?: string | null
          sss?: number | null
          symptoms?: string | null
          timestamp: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          context?: string | null
          created_at?: string | null
          id?: string
          medication?: string | null
          notes?: string | null
          physical_activity?: string | null
          sss?: number | null
          symptoms?: string | null
          timestamp?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      experiments: {
        Row: {
          arma_desc: string | null
          armb_desc: string | null
          created_at: string | null
          description: string | null
          design: string | null
          end_date: string | null
          goal: string | null
          hypothesis: string
          id: string
          metric: string | null
          name: string
          start_date: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          arma_desc?: string | null
          armb_desc?: string | null
          created_at?: string | null
          description?: string | null
          design?: string | null
          end_date?: string | null
          goal?: string | null
          hypothesis: string
          id?: string
          metric?: string | null
          name: string
          start_date: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          arma_desc?: string | null
          armb_desc?: string | null
          created_at?: string | null
          description?: string | null
          design?: string | null
          end_date?: string | null
          goal?: string | null
          hypothesis?: string
          id?: string
          metric?: string | null
          name?: string
          start_date?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      med_intakes: {
        Row: {
          created_at: string | null
          dose_mg: number | null
          id: string
          med_id: string
          notes: string | null
          taken: boolean | null
          timestamp: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dose_mg?: number | null
          id?: string
          med_id: string
          notes?: string | null
          taken?: boolean | null
          timestamp: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dose_mg?: number | null
          id?: string
          med_id?: string
          notes?: string | null
          taken?: boolean | null
          timestamp?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "med_intakes_med_id_fkey"
            columns: ["med_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          as_needed: boolean | null
          created_at: string | null
          dosage: string
          dose_mg: number | null
          end_date: string | null
          frequency: string
          id: string
          name: string
          notes: string | null
          schedule_times: string[] | null
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          as_needed?: boolean | null
          created_at?: string | null
          dosage: string
          dose_mg?: number | null
          end_date?: string | null
          frequency: string
          id?: string
          name: string
          notes?: string | null
          schedule_times?: string[] | null
          start_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          as_needed?: boolean | null
          created_at?: string | null
          dosage?: string
          dose_mg?: number | null
          end_date?: string | null
          frequency?: string
          id?: string
          name?: string
          notes?: string | null
          schedule_times?: string[] | null
          start_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      naps: {
        Row: {
          created_at: string | null
          date: string
          duration: number | null
          end_time: string
          id: string
          notes: string | null
          planned: boolean | null
          quality: number | null
          refreshing: number | null
          start_time: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          duration?: number | null
          end_time: string
          id?: string
          notes?: string | null
          planned?: boolean | null
          quality?: number | null
          refreshing?: number | null
          start_time: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          duration?: number | null
          end_time?: string
          id?: string
          notes?: string | null
          planned?: boolean | null
          quality?: number | null
          refreshing?: number | null
          start_time?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sleep_entries: {
        Row: {
          bed_time: string
          bedtime: string | null
          created_at: string | null
          date: string
          id: string
          notes: string | null
          quality: number | null
          sleep_onset: string | null
          total_sleep_minutes: number | null
          updated_at: string | null
          user_id: string
          wake_time: string
        }
        Insert: {
          bed_time: string
          bedtime?: string | null
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          quality?: number | null
          sleep_onset?: string | null
          total_sleep_minutes?: number | null
          updated_at?: string | null
          user_id: string
          wake_time: string
        }
        Update: {
          bed_time?: string
          bedtime?: string | null
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          quality?: number | null
          sleep_onset?: string | null
          total_sleep_minutes?: number | null
          updated_at?: string | null
          user_id?: string
          wake_time?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          bedtime_reminder_enabled: boolean | null
          bedtime_reminder_time: string | null
          created_at: string | null
          id: string
          notifications: boolean | null
          theme: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bedtime_reminder_enabled?: boolean | null
          bedtime_reminder_time?: string | null
          created_at?: string | null
          id?: string
          notifications?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bedtime_reminder_enabled?: boolean | null
          bedtime_reminder_time?: string | null
          created_at?: string | null
          id?: string
          notifications?: boolean | null
          theme?: string | null
          timezone?: string | null
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
