import { createClient } from '@supabase/supabase-js';
// import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Definida' : 'Indefinida');
console.log('Supabase Key:', supabaseKey ? 'Definida' : 'Indefinida');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
export const supabase = createClient(supabaseUrl, supabaseKey);

// Função para sanitizar nome de arquivo
function sanitizeFileName(fileName: string): string {
  // Remove acentos
  const withoutAccents = fileName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Remove caracteres especiais, mantendo apenas letras, números, ponto, traço e underscore
  const sanitized = withoutAccents.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  return sanitized;
}

// Função para fazer upload de arquivo
export async function uploadFile(file: File, leadId: string) {
  try {
    // Sanitiza o nome do arquivo
    const sanitizedFileName = sanitizeFileName(file.name);
    const fileName = `${leadId}/${sanitizedFileName}`;

    // Verificar se o arquivo já existe
    const { data: existingFiles } = await supabase.storage
      .from('lead-files')
      .list(leadId);

    const fileExists = existingFiles?.some(f => f.name === sanitizedFileName);
    if (fileExists) {
      throw new Error('Já existe um arquivo com este nome. Por favor, renomeie o arquivo antes de fazer o upload.');
    }

    const { data, error } = await supabase.storage
      .from('lead-files')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false // Não sobrescrever se já existir
      });

    if (error) {
      if (error.message.includes('permission')) {
        throw new Error('Erro de permissão ao fazer upload do arquivo. Por favor, tente novamente.');
      } else {
        throw new Error('Erro ao fazer upload do arquivo: ' + error.message);
      }
    }

    return data;
  } catch (error: any) {
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
    if (!path) {
      throw new Error('Path is required');
    }

    console.log('Gerando URL para:', path); // Debug

    const { data, error } = await supabase.storage
      .from('lead-files')
      .createSignedUrl(path, 60); // URL válida por 60 segundos

    if (error) throw error;
    
    console.log('URL gerada:', data?.signedUrl); // Debug
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