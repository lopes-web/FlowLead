export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string
          nome: string
          email: string
          whatsapp: string
          instagram: string
          website: string
          origem: string
          tipoprojeto: string
          orcamento: number
          status: string
          ultimocontato: string
          anotacoes: string | null
          necessidades: string | null
          observacoes: string | null
          ideias: string | null
          tags: string[]
          createdat: string
          updatedat: string
        }
        Insert: {
          id?: string
          nome: string
          email: string
          whatsapp: string
          instagram: string
          website: string
          origem: string
          tipoprojeto: string
          orcamento: number
          status: string
          ultimocontato: string
          anotacoes?: string | null
          necessidades?: string | null
          observacoes?: string | null
          ideias?: string | null
          tags?: string[]
          createdat?: string
          updatedat?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          whatsapp?: string
          instagram?: string
          website?: string
          origem?: string
          tipoprojeto?: string
          orcamento?: number
          status?: string
          ultimocontato?: string
          anotacoes?: string | null
          necessidades?: string | null
          observacoes?: string | null
          ideias?: string | null
          tags?: string[]
          createdat?: string
          updatedat?: string
        }
      }
      time_tracking: {
        Row: {
          id: string
          activity_type: string
          start_time: string
          end_time: string | null
          duration: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          activity_type: string
          start_time: string
          end_time?: string | null
          duration?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          activity_type?: string
          start_time?: string
          end_time?: string | null
          duration?: number | null
          notes?: string | null
          updated_at?: string
        }
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
  }
} 