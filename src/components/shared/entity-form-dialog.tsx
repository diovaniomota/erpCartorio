"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/lib/types";

export type EntityField = {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "money" | "date" | "datetime-local" | "textarea" | "select" | "checkbox" | "url";
  required?: boolean;
  options?: { label: string; value: string }[];
  defaultValue?: string | number | boolean | null;
  placeholder?: string;
};

type EntityFormDialogProps = {
  title: string;
  description?: string;
  triggerLabel?: string;
  fields: EntityField[];
  action: (values: Record<string, unknown>) => Promise<ActionResult>;
};

export function EntityFormDialog({
  title,
  description,
  triggerLabel = "Novo registro",
  fields,
  action,
}: EntityFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const schema = useMemo(() => buildSchema(fields), [fields]);
  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
    defaultValues: Object.fromEntries(
      fields.map((field) => [field.name, field.defaultValue ?? (field.type === "checkbox" ? false : "")]),
    ),
  });

  function onSubmit(values: Record<string, unknown>) {
    startTransition(async () => {
      const result = await action(values);
      if (result.ok) {
        toast.success(result.message);
        form.reset();
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-hidden rounded-md border-slate-200 p-0">
        <DialogHeader className="border-b border-slate-200 bg-white px-6 py-5">
          <DialogTitle className="text-lg text-slate-950">{title}</DialogTitle>
          {description ? <DialogDescription className="text-slate-500">{description}</DialogDescription> : null}
        </DialogHeader>
        <form className="grid gap-0" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid max-h-[64vh] gap-4 overflow-y-auto bg-slate-50 p-6 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.name} className={field.type === "textarea" ? "space-y-2 sm:col-span-2" : "space-y-2"}>
                <Label htmlFor={field.name} className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                  {field.label}
                </Label>
                <FieldControl field={field} register={form.register} setValue={form.setValue} value={form.watch(field.name)} />
                {form.formState.errors[field.name] ? (
                  <p className="text-xs font-medium text-destructive">
                    {String(form.formState.errors[field.name]?.message)}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
          <DialogFooter className="border-t border-slate-200 bg-white px-6 py-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              <Save className="h-4 w-4" />
              {isPending ? "Salvando..." : "Salvar registro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FieldControl({
  field,
  register,
  setValue,
  value,
}: {
  field: EntityField;
  register: ReturnType<typeof useForm<Record<string, unknown>>>["register"];
  setValue: ReturnType<typeof useForm<Record<string, unknown>>>["setValue"];
  value: unknown;
}) {
  if (field.type === "textarea") {
    return <Textarea id={field.name} placeholder={field.placeholder} className="min-h-28 rounded-md bg-white" {...register(field.name)} />;
  }

  if (field.type === "select") {
    return (
      <Select value={String(value ?? "")} onValueChange={(nextValue) => setValue(field.name, nextValue, { shouldValidate: true })}>
        <SelectTrigger id={field.name} className="rounded-md bg-white">
          <SelectValue placeholder={field.placeholder ?? "Selecione"} />
        </SelectTrigger>
        <SelectContent>
          {(field.options ?? []).map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (field.type === "checkbox") {
    return (
      <div className="flex h-9 items-center gap-2 rounded-md border bg-white px-3">
        <Checkbox
          id={field.name}
          checked={Boolean(value)}
          onCheckedChange={(checked) => setValue(field.name, checked === true, { shouldValidate: true })}
        />
        <span className="text-sm text-muted-foreground">Sim</span>
      </div>
    );
  }

  return (
    <Input
      id={field.name}
      type={field.type === "money" ? "number" : field.type ?? "text"}
      step={field.type === "money" ? "0.01" : undefined}
      placeholder={field.placeholder}
      className="rounded-md bg-white"
      {...register(field.name)}
    />
  );
}

function buildSchema(fields: EntityField[]) {
  return z.object(
    Object.fromEntries(
      fields.map((field) => {
        let schema: z.ZodTypeAny;
        if (field.type === "number" || field.type === "money") {
          schema = field.required ? z.coerce.number().min(0) : z.coerce.number().optional().or(z.literal(""));
        } else if (field.type === "checkbox") {
          schema = z.coerce.boolean().optional();
        } else if (field.type === "email") {
          schema = field.required
            ? z.string().email("E-mail inválido")
            : z.string().email("E-mail inválido").or(z.literal("")).optional();
        } else {
          schema = field.required ? z.string().min(1, "Campo obrigatório") : z.string().optional();
        }

        return [field.name, schema];
      }),
    ),
  );
}
