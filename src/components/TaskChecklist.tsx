import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChecklistItem } from "@/types/task";
import { ClipboardList, Plus, Trash } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskChecklistProps {
  items: ChecklistItem[];
  onAddItem: (content: string) => Promise<void>;
  onToggleItem: (itemId: string) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
}

export function TaskChecklist({ items, onAddItem, onToggleItem, onDeleteItem }: TaskChecklistProps) {
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(false);
  const checklistContainerRef = useRef<HTMLDivElement>(null);
  const completedCount = items.filter(item => item.completed).length;
  const isComplete = items.length > 0 && completedCount === items.length;

  // Manter a referência dos itens para evitar re-renders desnecessários
  const itemsRef = useRef(items);
  
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const handleAddItem = async () => {
    if (!newItem.trim()) return;
    
    setLoading(true);
    try {
      await onAddItem(newItem.trim());
      setNewItem("");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddItem();
    }
  };

  return (
    <div className="mt-4 relative" ref={checklistContainerRef}>
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="h-4 w-4 text-[#9b87f5]" />
        <h3 className="font-medium text-base text-white">Checklist</h3>
        <span className={cn(
          "text-xs ml-1 transition-colors duration-300",
          isComplete ? "text-[#9b87f5]" : "text-gray-400"
        )}>
          ({completedCount}/{items.length})
        </span>
      </div>
      
      {/* Barra de progresso */}
      <div className="h-1.5 w-full bg-[#2e3446] rounded-full mb-4 overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            isComplete 
              ? "bg-[#9b87f5] animate-pulse" 
              : "bg-[#9b87f5]"
          )}
          style={{ 
            width: items.length ? `${(completedCount / items.length) * 100}%` : '0%' 
          }}
        ></div>
      </div>

      <div className="space-y-2 min-h-[50px] max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#2e3446] scrollbar-track-transparent pr-1">
        {items.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-3">
            Nenhum item adicionado. Adicione itens abaixo.
          </div>
        )}
        
        {items.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center gap-3 bg-[#1c2132]/80 border border-[#2e3446]/70 p-2 rounded-md"
          >
            <div className="flex-shrink-0 relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => onToggleItem(item.id)}
                className="h-4 w-4 rounded appearance-none bg-[#1a1d2d] border border-[#3a3f50] text-[#9b87f5] focus:ring-[#9b87f5] focus:ring-offset-[#1c2132] focus:ring-offset-2 checked:border-[#9b87f5] checked:bg-[#9b87f5] transition-colors duration-200"
              />
              {item.completed && (
                <svg 
                  className="absolute inset-0 h-4 w-4 text-white pointer-events-none" 
                  viewBox="0 0 16 16" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M4 8L7 11L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <p className={`text-sm flex-1 break-words transition-all duration-300 ${item.completed ? 'line-through text-gray-400' : 'text-gray-200'}`}>
              {item.content}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-[#2e3446] text-gray-400 hover:text-white flex-shrink-0"
              onClick={() => onDeleteItem(item.id)}
            >
              <Trash className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4 items-center">
        <Input
          placeholder="Adicionar um item..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-[#1c2132] border-[#2e3446] focus:border-[#9b87f5] focus:ring-[#9b87f5]"
          disabled={loading}
        />
        <Button
          size="icon"
          className="bg-[#9b87f5] hover:bg-[#8a76e4] text-white flex-shrink-0"
          onClick={handleAddItem}
          disabled={loading || !newItem.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 