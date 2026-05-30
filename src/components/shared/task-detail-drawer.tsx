"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/types";

export function TaskDetailDrawer({ task }: { task: Task }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">Detalhes</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{task.titulo}</SheetTitle>
          <SheetDescription>{task.descricao}</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
