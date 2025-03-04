import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Definida' : 'Indefinida');
console.log('Supabase Key:', supabaseKey ? 'Definida' : 'Indefinida');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Função para fazer upload de arquivo
export async function uploadFile(file: File, leadId: string) {
  try {
    const fileName = `${leadId}/${file.name}`;

    const { data, error } = await supabase.storage
      .from('lead-files')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true // Sobrescrever se já existir
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    throw error;
  }
}

// Função para listar arquivos de um lead
export async function listFiles(leadId: string) {
  try {
    const { data, error } = await supabase.storage
      .from('lead-files')
      .list(leadId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    throw error;
  }
}

// Função para gerar URL de download
export async function getFileUrl(path: string) {
  try {
    const { data } = await supabase.storage
      .from('lead-files')
      .createSignedUrl(path, 60); // URL válida por 60 segundos

    return data?.signedUrl;
  } catch (error) {
    console.error('Erro ao gerar URL:', error);
    throw error;
  }
}

// Função para deletar arquivo
export async function deleteFile(path: string) {
  try {
    const { error } = await supabase.storage
      .from('lead-files')
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    throw error;
  }
} 