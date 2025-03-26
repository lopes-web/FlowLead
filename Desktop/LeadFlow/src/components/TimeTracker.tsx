import { useState, useEffect } from "react";
import { useTimeTracking } from "@/contexts/TimeTrackingContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Play, Square } from "lucide-react";

interface TimeTrackerProps {
  className?: string;
}

export function TimeTracker({ className }: TimeTrackerProps) {
  const { isTracking, currentActivity, startTracking, stopTracking } = useTimeTracking();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activityType, setActivityType] = useState("prospecting");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTracking && currentActivity) {
      const startTime = new Date(currentActivity.start_time).getTime();
      
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTracking, currentActivity]);

  const handleStartTracking = async () => {
    await startTracking(activityType, notes);
    setNotes("");
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);

    return parts.join(" ");
  };

  return (
    <Card className={`bg-[#222839] border-[#2e3446] ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-medium text-white">
          Rastreador de Tempo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!isTracking ? (
            <>
              <Select
                value={activityType}
                onValueChange={setActivityType}
              >
                <SelectTrigger className="w-full bg-[#1c2132] border-[#2e3446] text-white">
                  <SelectValue placeholder="Selecione o tipo de atividade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospecting">Prospecção</SelectItem>
                  <SelectItem value="meeting">Reunião</SelectItem>
                  <SelectItem value="proposal">Proposta</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Notas (opcional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-[#1c2132] border-[#2e3446] text-white placeholder:text-gray-500"
              />

              <Button
                onClick={handleStartTracking}
                className="w-full bg-[#9b87f5] hover:bg-[#8b77e5] text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar Atividade
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="text-sm text-gray-400">Atividade atual</div>
                <div className="text-lg font-medium text-white">
                  {currentActivity?.activity_type === "prospecting" && "Prospecção"}
                  {currentActivity?.activity_type === "meeting" && "Reunião"}
                  {currentActivity?.activity_type === "proposal" && "Proposta"}
                  {currentActivity?.activity_type === "follow_up" && "Follow-up"}
                </div>
                {currentActivity?.notes && (
                  <div className="text-sm text-gray-400">{currentActivity.notes}</div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-sm text-gray-400">Tempo decorrido</div>
                <div className="text-2xl font-bold text-white">
                  {formatTime(elapsedTime)}
                </div>
              </div>

              <Button
                onClick={stopTracking}
                variant="destructive"
                className="w-full bg-red-500 hover:bg-red-600"
              >
                <Square className="h-4 w-4 mr-2" />
                Parar Atividade
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 