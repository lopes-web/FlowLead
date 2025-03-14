import { useState, useEffect, MouseEvent, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadFile, listFiles, getFileUrl, deleteFile } from '../../lib/supabaseClient';
import { FileIcon, Trash2Icon, DownloadIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  leadId: string;
}

interface FileInfo {
  name: string;
  id: string;
  created_at: string;
  path: string;
}

export function FileUpload({ leadId }: FileUploadProps) {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, [leadId]);

  async function loadFiles() {
    try {
      const fileList = await listFiles(leadId);
      if (fileList) {
        const filesWithPath = fileList.map(file => ({
          ...file,
          path: `${leadId}/${file.name}`
        }));
        setFiles(filesWithPath);
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
      setFiles([]);
      toast.error('Erro ao carregar arquivos');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      await uploadFile(file, leadId);
      await loadFiles();
      toast.success('Arquivo enviado com sucesso!');
    } catch (error: any) {
      console.error('Erro no upload:', error);
      const errorMessage = error?.message || 'Erro ao fazer upload do arquivo';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      // Limpar o input após o upload (sucesso ou erro)
      event.target.value = '';
    }
  }

  async function handleDownload(path: string, fileName: string, e: MouseEvent<HTMLButtonElement>) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      console.log('Tentando baixar arquivo:', { path, fileName });
      const url = await getFileUrl(path);
      if (url) {
        // Fazer fetch do arquivo primeiro
        const response = await fetch(url);
        const blob = await response.blob();
        
        // Criar URL do blob
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Criar link e forçar download
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        
        // Limpar
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
    }
  }

  async function handleDelete(path: string, e: MouseEvent<HTMLButtonElement>) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      console.log('Tentando deletar arquivo:', path);
      await deleteFile(path);
      await loadFiles();
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4" onClick={e => e.stopPropagation()}>
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <Label htmlFor="file">
            Anexar arquivo
          </Label>
          <Input
            id="file"
            type="file"
            onChange={handleUpload}
            disabled={uploading}
            className="cursor-pointer"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          />
          {uploading && (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Enviando arquivo...</span>
            </div>
          )}
        </div>
      </div>

      {files.length > 0 ? (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2 border rounded-lg"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <FileIcon className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">{file.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDownload(file.path, file.name, e)}
                >
                  <DownloadIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDelete(file.path, e)}
                >
                  <Trash2Icon className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhum arquivo anexado
        </p>
      )}
    </div>
  );
} 