import { createClient } from '@supabase/supabase-js'

// Usando diretamente os valores para evitar problemas com variáveis de ambiente
const supabaseUrl = 'https://arscmhkqmllgwkdfpwrl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyc2NtaGtxbWxsZ3drZGZwd3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNzYwNzcsImV4cCI6MjA1NTY1MjA3N30.VIohQC4cIYNTNNwvjPCFghVA0MpowYSyvlvuf_2WMIE'

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