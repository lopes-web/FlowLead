import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Funções para gerenciar o armazenamento local do formulário
export const formStorage = {
  save: (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error('Erro ao salvar dados no localStorage:', error)
    }
  },

  load: (key: string) => {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error)
      return null
    }
  },

  clear: (key: string) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Erro ao limpar dados do localStorage:', error)
    }
  }
}
