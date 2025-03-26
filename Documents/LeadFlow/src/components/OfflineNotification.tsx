import { useLeads } from "@/contexts/LeadContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff } from "lucide-react";

export function OfflineNotification() {
  const { isOffline } = useLeads();

  if (!isOffline) return null;

  return (
    <Alert variant="default" className="fixed bottom-4 right-4 w-auto max-w-md bg-yellow-500/15 border-yellow-500/50">
      <WifiOff className="h-4 w-4 text-yellow-500" />
      <AlertDescription className="text-yellow-500">
        Você está offline. As alterações serão sincronizadas quando sua conexão for restaurada.
      </AlertDescription>
    </Alert>
  );
} 