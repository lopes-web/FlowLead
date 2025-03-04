import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadFile, listFiles, getFileUrl, deleteFile } from '@/lib/supabase';
import { FileIcon, Trash2Icon, DownloadIcon, Loader2 } from 'lucide-react';

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

  useEffect(() => {
    loadFiles();
  }, [leadId]);

  async function loadFiles() {
    try {
      const fileList = await listFiles(leadId);
      setFiles(fileList || []);
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);
      await uploadFile(file, leadId);
      await loadFiles();
    } catch (error) {
      console.error('Erro no upload:', error);
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(path: string, fileName: string) {
    try {
      const url = await getFileUrl(path);
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
    }
  }

  async function handleDelete(path: string) {
    try {
      await deleteFile(path);
      await loadFiles();
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <Label htmlFor="file">Anexar arquivo</Label>
          <Input
            id="file"
            type="file"
            onChange={handleUpload}
            disabled={uploading}
            className="cursor-pointer"
          />
        </div>
      </div>

      {files.length > 0 ? (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2 border rounded-lg"
            >
              <div className="flex items-center gap-2">
                <FileIcon className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">{file.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(file.path, file.name)}
                >
                  <DownloadIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(file.path)}
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