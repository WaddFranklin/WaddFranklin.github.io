// src/lib/database.types.ts
// Adicionamos a definição da tabela 'profiles'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  appvendas: {
    Tables: {
      itens_venda: {
        Row: {
          comissao_percentual: number
          created_at: string
          farinha: string
          id: string
          preco_unitario: number
          quantidade: number
          user_id: string
          venda_id: string
        }
        Insert: {
          comissao_percentual?: number
          created_at?: string
          farinha: string
          id?: string
          preco_unitario: number
          quantidade: number
          user_id: string
          venda_id: string
        }
        Update: {
          comissao_percentual?: number
          created_at?: string
          farinha?: string
          id?: string
          preco_unitario?: number
          quantidade?: number
          user_id?: string
          venda_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "itens_venda_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_venda_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      // --- NOVA TABELA DE PERFIS ADICIONADA ---
      profiles: {
        Row: {
          id: string
          full_name: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      vendas: {
        Row: {
          cliente_nome: string
          created_at: string
          data: string
          id: string
          user_id: string
        }
        Insert: {
          cliente_nome: string
          created_at?: string
          data: string
          id?: string
          user_id: string
        }
        Update: {
          cliente_nome?: string
          created_at?: string
          data?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["appvendas"]["Tables"] & Database["appvendas"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["appvendas"]["Tables"] &
        Database["appvendas"]["Views"])
    ? (Database["appvendas"]["Tables"] &
        Database["appvendas"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never
