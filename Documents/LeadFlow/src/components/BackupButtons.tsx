import { Button } from "@/components/ui/button";
import { useLeads } from "@/contexts/LeadContext";
import { Download, Upload } from "lucide-react";
import { useRef } from "react";

export function BackupButtons() {
  const { exportLeads, importLeads } = useLeads();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importLeads(file);
      // Limpa o input para permitir selecionar o mesmo arquivo novamente
      event.target.value = '';
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportLeads}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Exportar Leads
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleImportClick}
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        Importar Leads
      </Button>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />
    </div>
  );
} 