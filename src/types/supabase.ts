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
          created_at: string
          updated_at: string
          user_id: string | null
          is_public: boolean | null
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
          created_at?: string
          updated_at?: string
          user_id?: string | null
          is_public?: boolean | null
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
          created_at?: string
          updated_at?: string
          user_id?: string | null
          is_public?: boolean | null
        }
      }
      projects: {
        Row: {
          id: string
          lead_id: string
          nome: string
          cliente: string
          tipo_projeto: string
          status: string
          descricao: string | null
          prazo_entrega: string | null
          valor: number
          arquivos_recebidos: Json | null
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          nome: string
          cliente: string
          tipo_projeto: string
          status: string
          descricao?: string | null
          prazo_entrega?: string | null
          valor: number
          arquivos_recebidos?: Json | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          nome?: string
          cliente?: string
          tipo_projeto?: string
          status?: string
          descricao?: string | null
          prazo_entrega?: string | null
          valor?: number
          arquivos_recebidos?: Json | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
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