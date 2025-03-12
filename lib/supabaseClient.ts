import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variáveis de ambiente do Supabase não encontradas')
  throw new Error('Configuração do Supabase incompleta')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const BUCKET_NAME = 'lead-files'

export const uploadFile = async (file: File, leadId: string) => {
  const fileName = `${leadId}/${file.name}`
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) throw error
  return fileName
}

export const listFiles = async (leadId: string) => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(leadId)

  if (error) throw error
  return data
}

export const getFileUrl = async (path: string) => {
  const { data } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, 3600)

  return data?.signedUrl
}

export const deleteFile = async (path: string) => {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path])

  if (error) throw error
} 