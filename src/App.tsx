import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import { LeadProvider } from "@/contexts/LeadContext";

function App() {
  return (
    <LeadProvider>
      <Routes>
        <Route path="/" element={<Index />} />
      </Routes>
      <Toaster />
    </LeadProvider>
  );
}

export default App;
