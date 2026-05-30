"use client";

import { useTransition } from "react";
import { Archive } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/types";

export function DeleteButton({
  id,
  action,
  label = "Arquivar",
}: {
  id: string;
  action: (id: string) => Promise<ActionResult>;
  label?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await action(id);
          if (result.ok) {
            toast.success(result.message);
            router.refresh();
          } else {
            toast.error(result.message);
          }
        });
      }}
      title={label}
    >
      <Archive className="h-4 w-4" />
      <span className="sr-only">{label}</span>
    </Button>
  );
}
