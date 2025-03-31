import { TasksKanban } from "@/components/TasksKanban";
import { TaskProvider } from "@/contexts/TaskContext";

export function Tasks() {
  return (
    <TaskProvider>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA] bg-clip-text text-transparent">
              Gerenciamento de Tarefas
            </h1>
          </div>

          <main className="flex-1 overflow-hidden">
            <TasksKanban />
          </main>
        </div>
      </div>
    </TaskProvider>
  );
} 