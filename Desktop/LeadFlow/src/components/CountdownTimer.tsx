import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface CountdownTimerProps {
  deadline: Date;
  isMyTask: boolean;
}

export function CountdownTimer({ deadline, isMyTask }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, isExpired: false });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const difference = deadline.getTime() - now.getTime();
      
      // Se o prazo já expirou
      if (difference <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          isExpired: true
        });
        return;
      }
      
      // Calculando dias, horas e minutos restantes
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeRemaining({
        days,
        hours,
        minutes,
        isExpired: false
      });
    };
    
    // Calcular inicialmente
    calculateTimeRemaining();
    
    // Atualizar a cada minuto
    const interval = setInterval(calculateTimeRemaining, 60000);
    
    return () => clearInterval(interval);
  }, [deadline]);

  // Formatar a exibição do tempo restante
  const formatTimeRemaining = () => {
    if (timeRemaining.isExpired) {
      return "Prazo expirado";
    }
    
    if (timeRemaining.days > 0) {
      return `${timeRemaining.days} dia${timeRemaining.days !== 1 ? 's' : ''} restante${timeRemaining.days !== 1 ? 's' : ''}`;
    }
    
    if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours} hora${timeRemaining.hours !== 1 ? 's' : ''} restante${timeRemaining.hours !== 1 ? 's' : ''}`;
    }
    
    return `${timeRemaining.minutes} minuto${timeRemaining.minutes !== 1 ? 's' : ''} restante${timeRemaining.minutes !== 1 ? 's' : ''}`;
  };

  // Determinar a cor com base no tempo restante e se é minha tarefa
  const getTimerColor = () => {
    if (timeRemaining.isExpired) {
      return isMyTask ? "text-red-500" : "text-gray-500";
    }
    
    if (timeRemaining.days === 0 && timeRemaining.hours < 24) {
      return isMyTask ? "text-amber-500" : "text-amber-400/70";
    }
    
    return isMyTask ? "text-green-400" : "text-gray-400";
  };

  // Determinar qual ícone mostrar
  const getTimerIcon = () => {
    if (timeRemaining.isExpired) {
      return <AlertTriangle className="h-3 w-3 mr-1 shrink-0" />;
    }
    
    return <Clock className="h-3 w-3 mr-1 shrink-0" />;
  };

  return (
    <div className={`flex items-center text-xs ${getTimerColor()}`}>
      {getTimerIcon()}
      {formatTimeRemaining()}
    </div>
  );
} 