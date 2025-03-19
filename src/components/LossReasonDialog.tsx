import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LeadLossReason } from "@/types/lead";

interface LossReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadName: string;
  onConfirm: (data: { motivo_perda: LeadLossReason; detalhes_perda: string }) => void;
}

const motivoPerdaOptions: { value: LeadLossReason; label: string }[] = [
  { value: "nao_respondeu", label: "Não Respondeu" },
  { value: "achou_caro", label: "Achou Caro" },
  { value: "sem_dinheiro", label: "Sem Dinheiro" },
  { value: "escolheu_concorrente", label: "Escolheu Concorrente" },
  { value: "projeto_cancelado", label: "Projeto Cancelado" },
  { value: "fora_do_escopo", label: "Fora do Escopo" },
  { value: "outro", label: "Outro" },
];

export function LossReasonDialog({
  open,
  onOpenChange,
  leadName,
  onConfirm,
}: LossReasonDialogProps) {
  const [motivoPerda, setMotivoPerda] = useState<LeadLossReason>("nao_respondeu");
  const [detalhesPerda, setDetalhesPerda] = useState("");

  const handleConfirm = () => {
    onConfirm({
      motivo_perda: motivoPerda,
      detalhes_perda: detalhesPerda,
    });
    setMotivoPerda("nao_respondeu");
    setDetalhesPerda("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#222839] border-[#2e3446] text-white">
        <DialogHeader>
          <DialogTitle>Arquivar Lead</DialogTitle>
          <DialogDescription className="text-gray-400">
            Por que o lead <span className="text-white font-medium">{leadName}</span> está sendo arquivado?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">
              Motivo da Perda
            </label>
            <Select
              value={motivoPerda}
              onValueChange={(value) => setMotivoPerda(value as LeadLossReason)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                {motivoPerdaOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">
              Detalhes Adicionais
            </label>
            <Textarea
              value={detalhesPerda}
              onChange={(e) => setDetalhesPerda(e.target.value)}
              placeholder="Descreva mais detalhes sobre o motivo da perda..."
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 sm:flex-none bg-[#9b87f5] hover:bg-[#8b74f4]"
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 