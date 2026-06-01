import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <Card>
      <CardContent className="flex min-h-40 flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">{title}</p>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
