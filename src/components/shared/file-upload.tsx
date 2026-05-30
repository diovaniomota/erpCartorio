"use client";

import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FileUpload({ label = "Arquivo" }: { label?: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2 rounded-md border border-dashed bg-muted/40 p-3">
        <Upload className="h-4 w-4 text-muted-foreground" />
        <Input type="file" className="border-0 bg-transparent p-0 focus-visible:ring-0" />
      </div>
    </div>
  );
}
