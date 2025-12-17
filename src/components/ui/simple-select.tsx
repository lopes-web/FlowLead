import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface SimpleSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
  label?: string;
  error?: string;
}

export function SimpleSelect({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  className,
  disabled = false,
  name,
  id,
  label,
  error,
}: SimpleSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectRef = React.useRef<HTMLDivElement>(null);

  // Encontrar a opção selecionada para exibir o label
  const selectedOption = options.find((option) => option.value === value);

  // Fecha o menu quando clica fora
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Manipulador de seleção de opção
  const handleSelectOption = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className="w-full relative" ref={selectRef}>
      {label && (
        <label
          htmlFor={id || name}
          className="block text-sm font-medium mb-1 text-white"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
          isOpen && "ring-2 ring-ring ring-offset-2",
          error && "border-red-500",
          className
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        tabIndex={0}
        role="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        data-state={isOpen ? "open" : "closed"}
      >
        <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>
      
      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 min-w-[8rem] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 mt-1">
          <div className="p-1 max-h-72 overflow-auto">
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                  option.value === value && "bg-accent text-accent-foreground"
                )}
                onClick={() => handleSelectOption(option)}
                role="option"
                aria-selected={option.value === value}
              >
                {option.label}
                {option.value === value && (
                  <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                    </svg>
                  </span>
                )}
              </div>
            ))}
            {options.length === 0 && (
              <div className="text-sm text-center py-2 px-2 text-muted-foreground">
                Nenhuma opção disponível
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Input oculto para integração com formulários */}
      <input
        type="hidden"
        name={name}
        id={id || name}
        value={value}
        disabled={disabled}
      />
      
      {/* Mensagem de erro */}
      {error && (
        <div className="text-sm text-red-500 mt-1">{error}</div>
      )}
    </div>
  );
} 